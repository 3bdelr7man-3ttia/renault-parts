import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, ordersTable, packagesTable, workshopsTable, partsTable, packagePartsTable } from "@workspace/db";
import { CreateOrderBody, GetOrderParams, ListOrdersResponse, GetOrderResponse } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";

const router: IRouter = Router();

async function buildOrderResponse(order: typeof ordersTable.$inferSelect) {
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, order.packageId));

  let workshop = null;
  if (order.workshopId) {
    const [ws] = await db.select().from(workshopsTable).where(eq(workshopsTable.id, order.workshopId));
    if (ws) {
      workshop = {
        id: ws.id,
        name: ws.name,
        area: ws.area,
        address: ws.address,
        phone: ws.phone,
        lat: ws.lat ? Number(ws.lat) : null,
        lng: ws.lng ? Number(ws.lng) : null,
        rating: ws.rating ? Number(ws.rating) : null,
        partnershipStatus: ws.partnershipStatus,
      };
    }
  }

  const parts = await db
    .select({ part: partsTable })
    .from(packagePartsTable)
    .innerJoin(partsTable, eq(packagePartsTable.partId, partsTable.id))
    .where(eq(packagePartsTable.packageId, pkg.id));

  const pkgOut = {
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    description: pkg.description,
    kmService: pkg.kmService,
    basePrice: Number(pkg.basePrice),
    sellPrice: Number(pkg.sellPrice),
    warrantyMonths: pkg.warrantyMonths,
    parts: parts.map((p) => ({
      id: p.part.id,
      name: p.part.name,
      oemCode: p.part.oemCode,
      type: p.part.type,
      priceOriginal: p.part.priceOriginal ? Number(p.part.priceOriginal) : null,
      priceTurkish: p.part.priceTurkish ? Number(p.part.priceTurkish) : null,
      priceChinese: p.part.priceChinese ? Number(p.part.priceChinese) : null,
      compatibleModels: p.part.compatibleModels,
      supplier: p.part.supplier,
    })),
    createdAt: pkg.createdAt,
  };

  return {
    id: order.id,
    userId: order.userId,
    packageId: order.packageId,
    workshopId: order.workshopId,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: Number(order.total),
    deliveryAddress: order.deliveryAddress,
    deliveryArea: order.deliveryArea,
    carModel: order.carModel,
    carYear: order.carYear,
    notes: order.notes,
    package: pkgOut,
    workshop,
    createdAt: order.createdAt,
  };
}

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;

  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, authReq.user.id))
    .orderBy(ordersTable.createdAt);

  const result = await Promise.all(orders.map(buildOrderResponse));
  res.json(ListOrdersResponse.parse(result));
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;

  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { packageId, workshopId, deliveryAddress, deliveryArea, paymentMethod, carModel, carYear, notes } = parsed.data;

  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, packageId));
  if (!pkg) {
    res.status(404).json({ error: "الباكدج غير موجود" });
    return;
  }

  const isCash = paymentMethod === "cash";

  const [order] = await db
    .insert(ordersTable)
    .values({
      userId: authReq.user.id,
      packageId,
      workshopId: workshopId ?? null,
      status: isCash ? "confirmed" : "pending",
      paymentMethod,
      paymentStatus: isCash ? "paid" : "pending",
      total: pkg.sellPrice,
      deliveryAddress: deliveryAddress ?? null,
      deliveryArea: deliveryArea ?? null,
      carModel,
      carYear,
      notes: notes ?? null,
    })
    .returning();

  const result = await buildOrderResponse(order);
  res.status(201).json(GetOrderResponse.parse(result));
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const authReq = req as AuthenticatedRequest;

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.id, params.data.id),
        eq(ordersTable.userId, authReq.user.id)
      )
    );

  if (!order) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }

  const result = await buildOrderResponse(order);
  res.json(GetOrderResponse.parse(result));
});

export default router;
