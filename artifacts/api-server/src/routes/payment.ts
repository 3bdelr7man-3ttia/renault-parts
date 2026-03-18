import { Router, type IRouter } from "express";
import crypto from "crypto";
import { eq, and } from "drizzle-orm";
import { db, ordersTable, usersTable, packagesTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";

const router: IRouter = Router();

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY ?? "";
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID ?? "";
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID ?? "";
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET ?? "";

const PAYMOB_BASE = "https://accept.paymob.com/api";
const APP_BASE_URL = process.env.APP_BASE_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN ?? "localhost"}`;

async function getPaymobAuthToken(): Promise<string> {
  const res = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
  });
  if (!res.ok) throw new Error(`PayMob auth failed: ${res.status}`);
  const data = await res.json() as { token: string };
  return data.token;
}

async function registerPaymobOrder(authToken: string, amountCents: number, merchantRef: string): Promise<number> {
  const res = await fetch(`${PAYMOB_BASE}/ecommerce/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: "EGP",
      merchant_order_id: merchantRef,
      items: [],
    }),
  });
  if (!res.ok) throw new Error(`PayMob order registration failed: ${res.status}`);
  const data = await res.json() as { id: number };
  return data.id;
}

async function getPaymobPaymentKey(
  authToken: string,
  amountCents: number,
  paymobOrderId: number,
  billingData: Record<string, string>,
  returnUrl?: string
): Promise<string> {
  const res = await fetch(`${PAYMOB_BASE}/acceptance/payment_keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: billingData,
      currency: "EGP",
      integration_id: parseInt(PAYMOB_INTEGRATION_ID),
      lock_order_when_paid: false,
      ...(returnUrl && { redirect_url: returnUrl }),
    }),
  });
  if (!res.ok) throw new Error(`PayMob payment key failed: ${res.status}`);
  const data = await res.json() as { token: string };
  return data.token;
}

// POST /payment/initiate
router.post("/payment/initiate", requireAuth, async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const { orderId } = req.body as { orderId: number };

  if (!orderId || typeof orderId !== "number") {
    res.status(400).json({ error: "orderId مطلوب" });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, authReq.user.id)));

  if (!order) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }

  if (order.paymentMethod !== "card") {
    res.status(400).json({ error: "هذا الطلب لا يحتاج لدفع إلكتروني" });
    return;
  }

  if (order.paymentStatus === "paid") {
    res.status(400).json({ error: "تم دفع هذا الطلب مسبقاً" });
    return;
  }

  if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID || !PAYMOB_IFRAME_ID) {
    res.status(503).json({ error: "بوابة الدفع غير مضبوطة. تواصل مع الدعم الفني." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authReq.user.id));

  const amountCents = Math.round(Number(order.total) * 100);
  const merchantRef = `renault-${order.id}-${Date.now()}`;

  const authToken = await getPaymobAuthToken();
  const paymobOrderId = await registerPaymobOrder(authToken, amountCents, merchantRef);

  const nameParts = (user.name || "عميل رينو").split(" ");
  const billingData = {
    apartment: "NA",
    email: user.email ?? "customer@renaultparts.eg",
    floor: "NA",
    first_name: nameParts[0] || "عميل",
    last_name: nameParts[1] || "رينو",
    street: order.deliveryAddress ?? "الإسكندرية",
    building: "NA",
    phone_number: user.phone ?? "01000000000",
    shipping_method: "NA",
    postal_code: "NA",
    city: "Alexandria",
    country: "EG",
    state: "Alexandria",
  };

  const returnUrl = `${APP_BASE_URL}/payment/result?orderId=${order.id}`;
  const paymentKey = await getPaymobPaymentKey(authToken, amountCents, paymobOrderId, billingData, returnUrl);

  await db
    .update(ordersTable)
    .set({ paymobRef: String(paymobOrderId) })
    .where(eq(ordersTable.id, order.id));

  const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

  res.json({ iframeUrl, orderId: order.id, paymentToken: paymentKey });
});

// POST /payment/callback - PayMob HMAC-verified webhook (fail-closed)
router.post("/payment/callback", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;

  if (!PAYMOB_HMAC_SECRET) {
    console.error("[payment/callback] PAYMOB_HMAC_SECRET is not configured — rejecting callback");
    res.status(503).json({ error: "Webhook secret not configured" });
    return;
  }

  const hmacFromPaymob = (body.hmac as string) ?? "";
  const obj = body.obj as Record<string, unknown>;

  const concatStr = [
    obj?.amount_cents, obj?.created_at, obj?.currency,
    obj?.error_occured, obj?.has_parent_transaction, obj?.id,
    obj?.integration_id, obj?.is_3d_secure, obj?.is_auth,
    obj?.is_capture, obj?.is_refunded, obj?.is_standalone_payment,
    obj?.is_voided, (obj?.order as Record<string, unknown>)?.id, obj?.owner,
    obj?.pending, (obj?.source_data as Record<string, unknown>)?.pan,
    (obj?.source_data as Record<string, unknown>)?.sub_type,
    (obj?.source_data as Record<string, unknown>)?.type, obj?.success,
  ].join("");

  const computedHmac = crypto.createHmac("sha512", PAYMOB_HMAC_SECRET).update(concatStr).digest("hex");

  if (computedHmac !== hmacFromPaymob) {
    console.warn("[payment/callback] Invalid HMAC — rejecting");
    res.status(400).json({ error: "Invalid HMAC signature" });
    return;
  }

  const transactionObj = body.obj as Record<string, unknown>;
  if (!transactionObj) {
    res.json({ message: "ok" });
    return;
  }

  const isSuccess = transactionObj.success === true;
  const paymobOrderId = String((transactionObj.order as Record<string, unknown>)?.id ?? "");

  if (paymobOrderId) {
    await db
      .update(ordersTable)
      .set({
        paymentStatus: isSuccess ? "paid" : "failed",
        status: isSuccess ? "confirmed" : "pending",
      })
      .where(eq(ordersTable.paymobRef, paymobOrderId));
  }

  res.json({ message: "ok" });
});

export default router;
