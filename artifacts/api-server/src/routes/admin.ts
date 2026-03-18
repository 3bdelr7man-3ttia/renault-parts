import { Router, type IRouter } from "express";
import { eq, count, sum, sql, gte } from "drizzle-orm";
import { db, usersTable, ordersTable, packagesTable, workshopsTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { UpdateOrderStatusBody, UpdateUserRoleBody } from "@workspace/api-zod";

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

  res.json({
    totalOrders: totalOrdersRow.count,
    pendingOrders: pendingRow.count,
    confirmedOrders: confirmedRow.count,
    completedOrders: completedRow.count,
    totalRevenue: Number(revenueRow.total ?? 0),
    totalUsers: usersRow.count,
    ordersToday: todayOrdersRow.count,
    revenueToday: Number(todayRevenueRow.total ?? 0),
  });
});

// GET /admin/orders
router.get("/admin/orders", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { status } = req.query;

  const rows = await db
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

  const filtered = status
    ? rows.filter((r) => r.order.status === status)
    : rows;

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
  const id = parseInt(req.params.id);
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
  const id = parseInt(req.params.id);
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

export default router;
