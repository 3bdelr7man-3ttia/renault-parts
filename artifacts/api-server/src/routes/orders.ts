import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, and } from "drizzle-orm";
import path from "path";
import fs from "fs";
import multer from "multer";
import { db, ordersTable, packagesTable, workshopsTable, partsTable, packagePartsTable } from "@workspace/db";
import { CreateOrderBody, GetOrderParams, ListOrdersResponse, GetOrderResponse } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";

function resolveRepoRoot() {
  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, "artifacts"))) {
    return cwd;
  }

  if (
    path.basename(cwd) === "api-server" &&
    path.basename(path.dirname(cwd)) === "artifacts"
  ) {
    return path.dirname(path.dirname(cwd));
  }

  return path.resolve(cwd, "..", "..");
}

const uploadsDir = path.resolve(resolveRepoRoot(), "artifacts", "uploads", "receipts");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const receiptStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `receipt-${Date.now()}${ext}`);
  },
});
const _uploadReceipt = multer({
  storage: receiptStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("نوع الملف غير مدعوم. يُسمح فقط بالصور وملفات PDF"));
  },
});
const receiptMiddleware = (req: Request, res: Response, next: NextFunction) =>
  _uploadReceipt.single("receipt")(req as never, res as never, next);

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
    receiptUrl: order.receiptUrl ?? null,
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

  const isWorkshopInstall = !!workshopId;
  const isHomeInstall = !!deliveryAddress || !!deliveryArea;

  if (isWorkshopInstall && isHomeInstall) {
    res.status(400).json({ error: "يرجى اختيار طريقة تركيب واحدة فقط: ورشة أو توصيل للبيت" });
    return;
  }

  if (!isWorkshopInstall && !isHomeInstall) {
    res.status(400).json({ error: "يجب اختيار ورشة أو تحديد عنوان التوصيل للبيت" });
    return;
  }

  if (isHomeInstall && !deliveryAddress) {
    res.status(400).json({ error: "عنوان التوصيل مطلوب عند اختيار التوصيل للبيت" });
    return;
  }

  if (isHomeInstall && !deliveryArea) {
    res.status(400).json({ error: "المنطقة مطلوبة عند اختيار التوصيل للبيت" });
    return;
  }

  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, packageId));
  if (!pkg) {
    res.status(404).json({ error: "الباكدج غير موجود" });
    return;
  }

  if (isWorkshopInstall && workshopId) {
    const [workshop] = await db
      .select()
      .from(workshopsTable)
      .where(and(eq(workshopsTable.id, workshopId), eq(workshopsTable.partnershipStatus, "active")));
    if (!workshop) {
      res.status(400).json({ error: "الورشة المختارة غير متاحة حالياً" });
      return;
    }
  }

  const isCash = paymentMethod === "cash" || paymentMethod === "vodafone_cash" || paymentMethod === "instapay";

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

router.post("/orders/:id/receipt", requireAuth, async (req, res): Promise<void> => {
  await new Promise<void>((resolve, reject) => receiptMiddleware(req, res, (err) => {
    if (err) reject(err); else resolve();
  }));
  {
    const authReq = req as AuthenticatedRequest;
    const orderId = parseInt(String(req.params.id), 10);

    if (isNaN(orderId)) {
      res.status(400).json({ error: "رقم الطلب غير صحيح" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "لم يتم رفع أي ملف" });
      return;
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, authReq.user.id)));

    if (!order) {
      fs.unlinkSync(req.file.path);
      res.status(404).json({ error: "الطلب غير موجود" });
      return;
    }

    if (order.receiptUrl) {
      const oldPath = path.join(uploadsDir, path.basename(order.receiptUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const receiptUrl = `/uploads/receipts/${req.file.filename}`;

    await db
      .update(ordersTable)
      .set({ receiptUrl, paymentStatus: "receipt_uploaded" })
      .where(eq(ordersTable.id, orderId));

    res.json({ success: true, receiptUrl, message: "تم رفع الإيصال بنجاح" });
  }
});

export default router;
