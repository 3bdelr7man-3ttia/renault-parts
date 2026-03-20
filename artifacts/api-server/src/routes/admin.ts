import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, count, sum, sql, gte, lte, and, desc } from "drizzle-orm";
import { db, usersTable, ordersTable, packagesTable, workshopsTable, reviewsTable, partsTable, expensesTable, workshopApplicationsTable, appointmentsTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { UpdateOrderStatusBody, UpdateUserRoleBody, UpdatePackageBody, CreateWorkshopBody, UpdateWorkshopBody, ReplyToReviewBody } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user || authReq.user.role !== "admin") {
    res.status(403).json({ error: "غير مصرح: هذه الصفحة للمديرين فقط" });
    return;
  }
  next();
}

// GET /admin/stats
router.get("/admin/stats", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalOrdersRow] = await db.select({ count: count() }).from(ordersTable);
  const [pendingRow] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "pending"));
  const [confirmedRow] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "confirmed"));
  const [completedRow] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "completed"));
  const [revenueRow] = await db.select({ total: sum(ordersTable.total) }).from(ordersTable);
  const [usersRow] = await db.select({ count: count() }).from(usersTable);
  const [todayOrdersRow] = await db.select({ count: count() }).from(ordersTable).where(gte(ordersTable.createdAt, todayStart));
  const [todayRevenueRow] = await db.select({ total: sum(ordersTable.total) }).from(ordersTable).where(gte(ordersTable.createdAt, todayStart));

  // Reviews rating KPI
  const [ratingRow] = await db
    .select({ avg: sql<string>`avg(${reviewsTable.rating})`, total: count() })
    .from(reviewsTable);

  // Top packages by order count
  const topPackages = await db
    .select({ packageId: ordersTable.packageId, name: packagesTable.name, count: count() })
    .from(ordersTable)
    .innerJoin(packagesTable, eq(ordersTable.packageId, packagesTable.id))
    .groupBy(ordersTable.packageId, packagesTable.name)
    .orderBy(sql`count(*) DESC`)
    .limit(5);

  // Most active workshops by order count
  const topWorkshops = await db
    .select({ workshopId: ordersTable.workshopId, name: workshopsTable.name, count: count() })
    .from(ordersTable)
    .innerJoin(workshopsTable, eq(ordersTable.workshopId, workshopsTable.id))
    .groupBy(ordersTable.workshopId, workshopsTable.name)
    .orderBy(sql`count(*) DESC`)
    .limit(5);

  // Weekly sales for chart (last 8 weeks)
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  const weeklySales = await db
    .select({
      week: sql<string>`to_char(date_trunc('week', ${ordersTable.createdAt}), 'YYYY-MM-DD')`,
      total: sum(ordersTable.total),
      count: count(),
    })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, eightWeeksAgo))
    .groupBy(sql`date_trunc('week', ${ordersTable.createdAt})`)
    .orderBy(sql`date_trunc('week', ${ordersTable.createdAt})`);

  res.json({
    totalOrders: totalOrdersRow.count,
    pendingOrders: pendingRow.count,
    confirmedOrders: confirmedRow.count,
    completedOrders: completedRow.count,
    totalRevenue: Number(revenueRow.total ?? 0),
    totalUsers: usersRow.count,
    ordersToday: todayOrdersRow.count,
    revenueToday: Number(todayRevenueRow.total ?? 0),
    avgRating: ratingRow.avg ? Math.round(Number(ratingRow.avg) * 10) / 10 : null,
    totalReviews: ratingRow.total,
    topPackages: topPackages.map(p => ({ name: p.name, count: p.count })),
    topWorkshops: topWorkshops.map(w => ({ name: w.name ?? '', count: w.count })),
    weeklySales: weeklySales.map(w => ({ week: w.week, total: Number(w.total ?? 0), count: w.count })),
  });
});

// GET /admin/orders
router.get("/admin/orders", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { status, dateFrom, dateTo } = req.query;

  const conditions = [];
  if (status) conditions.push(eq(ordersTable.status, String(status)));
  if (dateFrom) conditions.push(gte(ordersTable.createdAt, new Date(String(dateFrom))));
  if (dateTo) {
    const toDate = new Date(String(dateTo));
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(ordersTable.createdAt, toDate));
  }

  const query = db
    .select({
      order: ordersTable,
      user: { name: usersTable.name, phone: usersTable.phone },
      pkg: { name: packagesTable.name },
      workshop: { name: workshopsTable.name },
    })
    .from(ordersTable)
    .innerJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .innerJoin(packagesTable, eq(ordersTable.packageId, packagesTable.id))
    .leftJoin(workshopsTable, eq(ordersTable.workshopId, workshopsTable.id))
    .orderBy(sql`${ordersTable.createdAt} DESC`);

  const rows = conditions.length > 0
    ? await query.where(and(...conditions))
    : await query;

  const filtered = rows;

  const result = filtered.map((r) => ({
    id: r.order.id,
    userId: r.order.userId,
    userName: r.user.name,
    userPhone: r.user.phone,
    packageId: r.order.packageId,
    packageName: r.pkg.name,
    workshopId: r.order.workshopId,
    workshopName: r.workshop?.name ?? null,
    status: r.order.status,
    paymentMethod: r.order.paymentMethod,
    paymentStatus: r.order.paymentStatus,
    total: Number(r.order.total),
    deliveryAddress: r.order.deliveryAddress,
    deliveryArea: r.order.deliveryArea,
    carModel: r.order.carModel,
    carYear: r.order.carYear,
    notes: r.order.notes,
    createdAt: r.order.createdAt,
  }));

  res.json(result);
});

// PATCH /admin/orders/:id/status
router.patch("/admin/orders/:id/status", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }

  const [userRow] = await db.select({ name: usersTable.name, phone: usersTable.phone }).from(usersTable).where(eq(usersTable.id, order.userId));
  const [pkgRow] = await db.select({ name: packagesTable.name }).from(packagesTable).where(eq(packagesTable.id, order.packageId));
  let workshopName = null;
  if (order.workshopId) {
    const [wsRow] = await db.select({ name: workshopsTable.name }).from(workshopsTable).where(eq(workshopsTable.id, order.workshopId));
    workshopName = wsRow?.name ?? null;
  }

  res.json({
    id: order.id,
    userId: order.userId,
    userName: userRow?.name ?? "",
    userPhone: userRow?.phone ?? null,
    packageId: order.packageId,
    packageName: pkgRow?.name ?? "",
    workshopId: order.workshopId,
    workshopName,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: Number(order.total),
    deliveryAddress: order.deliveryAddress,
    deliveryArea: order.deliveryArea,
    carModel: order.carModel,
    carYear: order.carYear,
    notes: order.notes,
    createdAt: order.createdAt,
  });
});

// GET /admin/users
router.get("/admin/users", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(sql`${usersTable.createdAt} DESC`);

  const result = await Promise.all(
    users.map(async (u) => {
      const [countRow] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.userId, u.id));
      let workshopName: string | null = null;
      if (u.workshopId) {
        const [ws] = await db.select({ name: workshopsTable.name }).from(workshopsTable).where(eq(workshopsTable.id, u.workshopId));
        workshopName = ws?.name ?? null;
      }
      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email,
        role: u.role,
        workshopId: u.workshopId ?? null,
        workshopName,
        carModel: u.carModel,
        carYear: u.carYear,
        area: u.area,
        orderCount: countRow.count,
        createdAt: u.createdAt,
      };
    })
  );

  res.json(result);
});

// PATCH /admin/users/:id/workshop — link/unlink user to a workshop
router.patch("/admin/users/:id/workshop", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const { workshopId, role } = req.body as { workshopId?: number | null; role?: string };
  const updates: Record<string, unknown> = {};
  if (workshopId !== undefined) updates.workshopId = workshopId ?? null;
  if (role !== undefined) updates.role = role;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "المستخدم غير موجود" }); return; }

  let workshopName: string | null = null;
  if (user.workshopId) {
    const [ws] = await db.select({ name: workshopsTable.name }).from(workshopsTable).where(eq(workshopsTable.id, user.workshopId));
    workshopName = ws?.name ?? null;
  }
  const [countRow] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.userId, user.id));
  res.json({ id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, workshopId: user.workshopId ?? null, workshopName, orderCount: countRow.count, createdAt: user.createdAt });
});

// PATCH /admin/users/:id/role
router.patch("/admin/users/:id/role", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const parsed = UpdateUserRoleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({ role: parsed.data.role })
    .where(eq(usersTable.id, id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "المستخدم غير موجود" });
    return;
  }

  const [countRow] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.userId, user.id));

  res.json({
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    carModel: user.carModel,
    carYear: user.carYear,
    area: user.area,
    orderCount: countRow.count,
    createdAt: user.createdAt,
  });
});

// GET /admin/packages
router.get("/admin/packages", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const packages = await db.select().from(packagesTable).orderBy(packagesTable.kmService);
  res.json(packages.map(p => ({
    ...p,
    basePrice: Number(p.basePrice),
    sellPrice: Number(p.sellPrice),
    imageUrl: p.imageUrl ?? null,
    parts: [],
  })));
});

// POST /admin/packages
router.post("/admin/packages", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { name, slug, description, kmService, basePrice, sellPrice, warrantyMonths, imageUrl } = req.body as {
    name: string; slug: string; description: string; kmService: number;
    basePrice: number; sellPrice: number; warrantyMonths: number; imageUrl?: string;
  };
  if (!name || !slug || !description || kmService == null || basePrice == null || sellPrice == null) {
    res.status(400).json({ error: "الحقول المطلوبة ناقصة" });
    return;
  }
  const [pkg] = await db.insert(packagesTable).values({
    name, slug, description,
    kmService: Number(kmService),
    basePrice: String(basePrice),
    sellPrice: String(sellPrice),
    warrantyMonths: Number(warrantyMonths ?? 12),
    imageUrl: imageUrl ?? null,
  }).returning();
  res.status(201).json({ ...pkg, basePrice: Number(pkg.basePrice), sellPrice: Number(pkg.sellPrice), imageUrl: pkg.imageUrl ?? null, parts: [] });
});

// GET /admin/parts
router.get("/admin/parts", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const parts = await db.select().from(partsTable).orderBy(partsTable.name);
  res.json(parts.map(p => ({
    ...p,
    priceOriginal: p.priceOriginal != null ? Number(p.priceOriginal) : null,
    priceTurkish: p.priceTurkish != null ? Number(p.priceTurkish) : null,
    priceChinese: p.priceChinese != null ? Number(p.priceChinese) : null,
    imageUrl: p.imageUrl ?? null,
  })));
});

// POST /admin/parts
router.post("/admin/parts", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { name, type, oemCode, priceOriginal, priceTurkish, priceChinese, compatibleModels, supplier, imageUrl } = req.body as {
    name: string; type: string; oemCode?: string; priceOriginal?: number;
    priceTurkish?: number; priceChinese?: number; compatibleModels?: string;
    supplier?: string; imageUrl?: string;
  };
  if (!name || !type) {
    res.status(400).json({ error: "الاسم والنوع مطلوبان" });
    return;
  }
  const [part] = await db.insert(partsTable).values({
    name, type,
    oemCode: oemCode ?? null,
    priceOriginal: priceOriginal != null ? String(priceOriginal) : null,
    priceTurkish: priceTurkish != null ? String(priceTurkish) : null,
    priceChinese: priceChinese != null ? String(priceChinese) : null,
    compatibleModels: compatibleModels ?? null,
    supplier: supplier ?? null,
    imageUrl: imageUrl ?? null,
  }).returning();
  res.status(201).json({
    ...part,
    priceOriginal: part.priceOriginal != null ? Number(part.priceOriginal) : null,
    priceTurkish: part.priceTurkish != null ? Number(part.priceTurkish) : null,
    priceChinese: part.priceChinese != null ? Number(part.priceChinese) : null,
    imageUrl: part.imageUrl ?? null,
  });
});

// DELETE /admin/parts/:id
router.delete("/admin/parts/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const [deleted] = await db.delete(partsTable).where(eq(partsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "القطعة غير موجودة" });
    return;
  }
  res.json({ message: "تم حذف القطعة" });
});

// PATCH /admin/parts/:id — update stock, supplier, prices
router.patch("/admin/parts/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const { stockQty, supplier, priceOriginal, priceTurkish, priceChinese, imageUrl } = req.body as {
    stockQty?: number; supplier?: string; priceOriginal?: number; priceTurkish?: number;
    priceChinese?: number; imageUrl?: string;
  };
  const updates: Record<string, unknown> = {};
  if (stockQty !== undefined) updates.stockQty = Number(stockQty);
  if (supplier !== undefined) updates.supplier = supplier;
  if (priceOriginal !== undefined) updates.priceOriginal = String(priceOriginal);
  if (priceTurkish !== undefined) updates.priceTurkish = String(priceTurkish);
  if (priceChinese !== undefined) updates.priceChinese = String(priceChinese);
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;

  const [part] = await db.update(partsTable).set(updates).where(eq(partsTable.id, id)).returning();
  if (!part) { res.status(404).json({ error: "القطعة غير موجودة" }); return; }
  res.json({
    ...part,
    priceOriginal: part.priceOriginal != null ? Number(part.priceOriginal) : null,
    priceTurkish: part.priceTurkish != null ? Number(part.priceTurkish) : null,
    priceChinese: part.priceChinese != null ? Number(part.priceChinese) : null,
    imageUrl: part.imageUrl ?? null,
  });
});

// PATCH /admin/packages/:id
router.patch("/admin/packages/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const parsed = UpdatePackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.sellPrice !== undefined) updates.sellPrice = parsed.data.sellPrice;
  if (parsed.data.basePrice !== undefined) updates.basePrice = parsed.data.basePrice;
  if (parsed.data.warrantyMonths !== undefined) updates.warrantyMonths = parsed.data.warrantyMonths;
  if (parsed.data.imageUrl !== undefined) updates.imageUrl = parsed.data.imageUrl;

  const [pkg] = await db.update(packagesTable).set(updates).where(eq(packagesTable.id, id)).returning();
  if (!pkg) {
    res.status(404).json({ error: "الباكدج غير موجود" });
    return;
  }
  res.json({ ...pkg, basePrice: Number(pkg.basePrice), sellPrice: Number(pkg.sellPrice), parts: [] });
});

// GET /admin/workshops
router.get("/admin/workshops", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const workshops = await db.select().from(workshopsTable).orderBy(workshopsTable.name);
  res.json(workshops.map(w => ({
    ...w,
    lat: w.lat !== null ? Number(w.lat) : null,
    lng: w.lng !== null ? Number(w.lng) : null,
    rating: w.rating !== null ? Number(w.rating) : null,
  })));
});

// POST /admin/workshops
router.post("/admin/workshops", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateWorkshopBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [workshop] = await db.insert(workshopsTable).values({
    name: parsed.data.name,
    area: parsed.data.area,
    address: parsed.data.address,
    phone: parsed.data.phone,
    lat: parsed.data.lat !== undefined ? String(parsed.data.lat) : null,
    lng: parsed.data.lng !== undefined ? String(parsed.data.lng) : null,
    partnershipStatus: parsed.data.partnershipStatus ?? "active",
    imageUrl: parsed.data.imageUrl ?? null,
  }).returning();

  res.status(201).json({
    ...workshop,
    lat: workshop.lat !== null ? Number(workshop.lat) : null,
    lng: workshop.lng !== null ? Number(workshop.lng) : null,
    rating: workshop.rating !== null ? Number(workshop.rating) : null,
  });
});

// PATCH /admin/workshops/:id
router.patch("/admin/workshops/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const parsed = UpdateWorkshopBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.area !== undefined) updates.area = parsed.data.area;
  if (parsed.data.address !== undefined) updates.address = parsed.data.address;
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
  if (parsed.data.lat !== undefined) updates.lat = parsed.data.lat !== null ? String(parsed.data.lat) : null;
  if (parsed.data.lng !== undefined) updates.lng = parsed.data.lng !== null ? String(parsed.data.lng) : null;
  if (parsed.data.partnershipStatus !== undefined) updates.partnershipStatus = parsed.data.partnershipStatus;
  if (parsed.data.imageUrl !== undefined) updates.imageUrl = parsed.data.imageUrl;

  const [workshop] = await db.update(workshopsTable).set(updates).where(eq(workshopsTable.id, id)).returning();
  if (!workshop) {
    res.status(404).json({ error: "الورشة غير موجودة" });
    return;
  }
  res.json({
    ...workshop,
    lat: workshop.lat !== null ? Number(workshop.lat) : null,
    lng: workshop.lng !== null ? Number(workshop.lng) : null,
    rating: workshop.rating !== null ? Number(workshop.rating) : null,
  });
});

// DELETE /admin/workshops/:id
router.delete("/admin/workshops/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const [workshop] = await db.delete(workshopsTable).where(eq(workshopsTable.id, id)).returning();
  if (!workshop) {
    res.status(404).json({ error: "الورشة غير موجودة" });
    return;
  }
  res.json({ message: "تم حذف الورشة بنجاح" });
});

// GET /admin/reviews
router.get("/admin/reviews", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      review: reviewsTable,
      userName: usersTable.name,
      userPhone: usersTable.phone,
      workshopName: workshopsTable.name,
    })
    .from(reviewsTable)
    .innerJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .leftJoin(workshopsTable, eq(reviewsTable.workshopId, workshopsTable.id))
    .orderBy(desc(reviewsTable.createdAt));

  res.json(rows.map(r => ({
    id: r.review.id,
    orderId: r.review.orderId,
    userId: r.review.userId,
    userName: r.userName,
    userPhone: r.userPhone,
    workshopId: r.review.workshopId,
    workshopName: r.workshopName ?? null,
    rating: r.review.rating,
    comment: r.review.comment,
    adminReply: r.review.adminReply,
    createdAt: r.review.createdAt,
  })));
});

// PATCH /admin/reviews/:id/reply
router.patch("/admin/reviews/:id/reply", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const parsed = ReplyToReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [review] = await db
    .update(reviewsTable)
    .set({ adminReply: parsed.data.reply })
    .where(eq(reviewsTable.id, id))
    .returning();

  if (!review) {
    res.status(404).json({ error: "التقييم غير موجود" });
    return;
  }

  const [userRow] = await db.select({ name: usersTable.name, phone: usersTable.phone })
    .from(usersTable).where(eq(usersTable.id, review.userId));
  let workshopName = null;
  if (review.workshopId) {
    const [wsRow] = await db.select({ name: workshopsTable.name })
      .from(workshopsTable).where(eq(workshopsTable.id, review.workshopId));
    workshopName = wsRow?.name ?? null;
  }

  res.json({
    id: review.id,
    orderId: review.orderId,
    userId: review.userId,
    userName: userRow?.name ?? "",
    userPhone: userRow?.phone ?? null,
    workshopId: review.workshopId,
    workshopName,
    rating: review.rating,
    comment: review.comment,
    adminReply: review.adminReply,
    createdAt: review.createdAt,
  });
});

// PATCH /admin/packages/:id/availability
router.patch("/admin/packages/:id/availability", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const { isAvailable } = req.body as { isAvailable: boolean };
  const [pkg] = await db.update(packagesTable).set({ isAvailable }).where(eq(packagesTable.id, id)).returning();
  if (!pkg) { res.status(404).json({ error: "الباكدج غير موجود" }); return; }
  res.json({ ...pkg, basePrice: Number(pkg.basePrice), sellPrice: Number(pkg.sellPrice), isAvailable: pkg.isAvailable, parts: [] });
});

// GET /admin/workshops/:id/orders
router.get("/admin/workshops/:id/orders", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const rows = await db
    .select({
      order: ordersTable,
      user: { name: usersTable.name, phone: usersTable.phone },
      pkg: { name: packagesTable.name },
    })
    .from(ordersTable)
    .innerJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .innerJoin(packagesTable, eq(ordersTable.packageId, packagesTable.id))
    .where(eq(ordersTable.workshopId, id))
    .orderBy(desc(ordersTable.createdAt));

  res.json(rows.map(r => ({
    id: r.order.id,
    userId: r.order.userId,
    userName: r.user.name,
    userPhone: r.user.phone,
    packageName: r.pkg.name,
    status: r.order.status,
    total: Number(r.order.total),
    carModel: r.order.carModel,
    carYear: r.order.carYear,
    createdAt: r.order.createdAt,
  })));
});

// GET /admin/expenses
router.get("/admin/expenses", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(expensesTable).orderBy(desc(expensesTable.createdAt));
  res.json(rows.map(e => ({ ...e, amount: Number(e.amount) })));
});

// POST /admin/expenses
router.post("/admin/expenses", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const { category, description, amount, date } = req.body as {
    category: string; description: string; amount: number; date: string;
  };
  if (!category || !description || amount == null || !date) {
    res.status(400).json({ error: "الحقول المطلوبة ناقصة" }); return;
  }
  const [expense] = await db.insert(expensesTable).values({
    category, description, amount: String(amount), date, createdBy: authReq.user?.id ?? null,
  }).returning();
  res.status(201).json({ ...expense, amount: Number(expense.amount) });
});

// DELETE /admin/expenses/:id
router.delete("/admin/expenses/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const [deleted] = await db.delete(expensesTable).where(eq(expensesTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "المصروف غير موجود" }); return; }
  res.json({ message: "تم حذف المصروف" });
});

// GET /admin/sales
router.get("/admin/sales", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      week: sql<string>`to_char(date_trunc('week', ${ordersTable.createdAt}), 'YYYY-MM-DD')`,
      total: sum(ordersTable.total),
      count: count(),
    })
    .from(ordersTable)
    .groupBy(sql`date_trunc('week', ${ordersTable.createdAt})`)
    .orderBy(sql`date_trunc('week', ${ordersTable.createdAt})`);

  const [totals] = await db.select({ revenue: sum(ordersTable.total), orders: count() }).from(ordersTable);

  // Sales breakdown by workshop
  const byWorkshop = await db
    .select({
      workshopId: ordersTable.workshopId,
      workshopName: workshopsTable.name,
      workshopPhone: workshopsTable.phone,
      total: sum(ordersTable.total),
      orderCount: count(),
    })
    .from(ordersTable)
    .leftJoin(workshopsTable, eq(ordersTable.workshopId, workshopsTable.id))
    .groupBy(ordersTable.workshopId, workshopsTable.name, workshopsTable.phone)
    .orderBy(sql`sum(${ordersTable.total}) DESC`);

  // Total expenses for net profit
  const [expenseTotal] = await db.select({ total: sum(expensesTable.amount) }).from(expensesTable);

  const weeks = rows.map(r => ({
    week: r.week,
    total: Number(r.total ?? 0),
    count: r.count,
  }));

  const csvLines = ["الأسبوع,الإيرادات,عدد الطلبات", ...weeks.map(w => `${w.week},${w.total},${w.count}`)];
  const exportCsv = csvLines.join("\n");

  res.json({
    weeks,
    totalRevenue: Number(totals.revenue ?? 0),
    totalOrders: totals.orders,
    totalExpenses: Number(expenseTotal.total ?? 0),
    byWorkshop: byWorkshop.map(w => ({
      workshopId: w.workshopId,
      workshopName: w.workshopName ?? "بدون ورشة",
      workshopPhone: w.workshopPhone ?? null,
      total: Number(w.total ?? 0),
      orderCount: w.orderCount,
    })),
    exportCsv,
  });
});

router.get("/admin/workshop-applications", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const apps = await db
    .select()
    .from(workshopApplicationsTable)
    .orderBy(desc(workshopApplicationsTable.createdAt));
  res.json(apps);
});

router.patch("/admin/workshop-applications/:id", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const { status } = req.body as { status: string };

  if (!["approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "الحالة يجب أن تكون approved أو rejected" });
    return;
  }

  const [updated] = await db
    .update(workshopApplicationsTable)
    .set({ status, reviewedAt: new Date() })
    .where(eq(workshopApplicationsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }

  res.json(updated);
});

// GET /api/admin/appointments — list all appointments with order + user info
router.get("/admin/appointments", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { workshopId, dateFrom, dateTo, status } = req.query;
  const rows = await db
    .select({
      id:           appointmentsTable.id,
      orderId:      appointmentsTable.orderId,
      workshopId:   appointmentsTable.workshopId,
      workshopName: appointmentsTable.workshopName,
      date:         appointmentsTable.date,
      timeSlot:     appointmentsTable.timeSlot,
      status:       appointmentsTable.status,
      changeNote:   appointmentsTable.changeNote,
      createdAt:    appointmentsTable.createdAt,
      customerName: usersTable.name,
      customerPhone: usersTable.phone,
      carModel:     ordersTable.carModel,
      carYear:      ordersTable.carYear,
      orderTotal:   ordersTable.total,
    })
    .from(appointmentsTable)
    .leftJoin(ordersTable, eq(ordersTable.id, appointmentsTable.orderId))
    .leftJoin(usersTable, eq(usersTable.id, ordersTable.userId))
    .orderBy(desc(appointmentsTable.date), desc(appointmentsTable.timeSlot));

  let filtered = rows as typeof rows;
  if (workshopId) filtered = filtered.filter(r => String(r.workshopId) === String(workshopId));
  if (status)    filtered = filtered.filter(r => r.status === String(status));
  if (dateFrom)  filtered = filtered.filter(r => r.date >= String(dateFrom));
  if (dateTo)    filtered = filtered.filter(r => r.date <= String(dateTo));

  res.json(filtered);
});

// PATCH /api/admin/appointments/:id/status
router.patch("/admin/appointments/:id/status", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { status } = req.body as { status: string };
  if (!status) { res.status(400).json({ error: "status is required" }); return; }
  const [updated] = await db
    .update(appointmentsTable)
    .set({ status })
    .where(eq(appointmentsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "الموعد غير موجود" }); return; }
  res.json(updated);
});

export default router;
