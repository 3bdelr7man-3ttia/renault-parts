import { Router, type IRouter } from "express";
import { eq, count, sum, sql, gte, lte, and, desc } from "drizzle-orm";
import { db, usersTable, ordersTable, packagesTable, workshopsTable, reviewsTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { UpdateOrderStatusBody, UpdateUserRoleBody, UpdatePackageBody, CreateWorkshopBody, UpdateWorkshopBody, ReplyToReviewBody } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
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
      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email,
        role: u.role,
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
    parts: [],
  })));
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
    exportCsv,
  });
});

export default router;
