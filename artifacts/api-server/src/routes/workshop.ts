import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, count, sum, gte, and, desc, lte } from "drizzle-orm";
import { db, appointmentsTable, ordersTable, packagesTable, usersTable, workshopsTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

function requireWorkshop(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }
  if (authReq.user.role !== "workshop") {
    res.status(403).json({ error: "هذه الصفحة للورش المعتمدة فقط" });
    return;
  }
  if (!authReq.user.workshopId) {
    res.status(400).json({ error: "حسابك غير مرتبط بورشة. تواصل مع الإدارة." });
    return;
  }
  next();
}

// GET /api/workshop/stats
router.get("/workshop/stats", requireAuth, requireWorkshop, async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const workshopId = authReq.user!.workshopId!;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  const todayStr = todayStart.toISOString().slice(0, 10);

  const [totalOrdersRow] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.workshopId, workshopId));
  const [pendingRow] = await db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.workshopId, workshopId), eq(ordersTable.status, "pending")));
  const [confirmedRow] = await db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.workshopId, workshopId), eq(ordersTable.status, "confirmed")));
  const [completedRow] = await db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.workshopId, workshopId), eq(ordersTable.status, "completed")));
  const [revenueRow] = await db.select({ total: sum(ordersTable.total) }).from(ordersTable).where(and(eq(ordersTable.workshopId, workshopId), eq(ordersTable.status, "completed")));
  const [todayApptsRow] = await db.select({ count: count() }).from(appointmentsTable).where(and(eq(appointmentsTable.workshopId, workshopId), eq(appointmentsTable.date, todayStr)));

  const [workshop] = await db.select({ name: workshopsTable.name, area: workshopsTable.area, rating: workshopsTable.rating }).from(workshopsTable).where(eq(workshopsTable.id, workshopId));

  res.json({
    workshopName: workshop?.name ?? "الورشة",
    workshopArea: workshop?.area ?? "",
    workshopRating: workshop?.rating ? Number(workshop.rating) : null,
    totalOrders: totalOrdersRow.count,
    pendingOrders: pendingRow.count,
    confirmedOrders: confirmedRow.count,
    completedOrders: completedRow.count,
    totalEarnings: Number(revenueRow.total ?? 0),
    appointmentsToday: todayApptsRow.count,
  });
});

// GET /api/workshop/appointments
router.get("/workshop/appointments", requireAuth, requireWorkshop, async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const workshopId = authReq.user!.workshopId!;
  const { dateFrom, dateTo } = req.query;

  const conditions = [eq(appointmentsTable.workshopId, workshopId)];

  const appointments = await db
    .select({
      id: appointmentsTable.id,
      orderId: appointmentsTable.orderId,
      date: appointmentsTable.date,
      timeSlot: appointmentsTable.timeSlot,
      status: appointmentsTable.status,
      createdAt: appointmentsTable.createdAt,
      customerName: usersTable.name,
      customerPhone: usersTable.phone,
      carModel: ordersTable.carModel,
      carYear: ordersTable.carYear,
      orderTotal: ordersTable.total,
      orderStatus: ordersTable.status,
      packageName: packagesTable.name,
    })
    .from(appointmentsTable)
    .innerJoin(ordersTable, eq(appointmentsTable.orderId, ordersTable.id))
    .innerJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .innerJoin(packagesTable, eq(ordersTable.packageId, packagesTable.id))
    .where(and(...conditions))
    .orderBy(desc(appointmentsTable.date), appointmentsTable.timeSlot);

  res.json(appointments);
});

// GET /api/workshop/orders
router.get("/workshop/orders", requireAuth, requireWorkshop, async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const workshopId = authReq.user!.workshopId!;

  const orders = await db
    .select({
      id: ordersTable.id,
      status: ordersTable.status,
      paymentMethod: ordersTable.paymentMethod,
      paymentStatus: ordersTable.paymentStatus,
      total: ordersTable.total,
      carModel: ordersTable.carModel,
      carYear: ordersTable.carYear,
      createdAt: ordersTable.createdAt,
      customerName: usersTable.name,
      customerPhone: usersTable.phone,
      packageName: packagesTable.name,
    })
    .from(ordersTable)
    .innerJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .innerJoin(packagesTable, eq(ordersTable.packageId, packagesTable.id))
    .where(eq(ordersTable.workshopId, workshopId))
    .orderBy(desc(ordersTable.createdAt));

  res.json(orders);
});

// GET /api/workshop/earnings — monthly breakdown
router.get("/workshop/earnings", requireAuth, requireWorkshop, async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const workshopId = authReq.user!.workshopId!;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthly = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${ordersTable.createdAt}), 'YYYY-MM')`,
      total: sum(ordersTable.total),
      count: count(),
    })
    .from(ordersTable)
    .where(and(eq(ordersTable.workshopId, workshopId), eq(ordersTable.status, "completed"), gte(ordersTable.createdAt, sixMonthsAgo)))
    .groupBy(sql`date_trunc('month', ${ordersTable.createdAt})`)
    .orderBy(sql`date_trunc('month', ${ordersTable.createdAt})`);

  res.json(monthly.map(r => ({ month: r.month, total: Number(r.total ?? 0), count: r.count })));
});

export default router;
