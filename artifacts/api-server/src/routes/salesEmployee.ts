import { Router, type IRouter, type Response } from "express";
import { and, asc, count, desc, eq, gte, isNotNull, lt, or } from "drizzle-orm";
import { db, employeeTasksTable, leadsTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { requireRolePermission } from "../lib/permissions";

const router: IRouter = Router();

type SalesSummaryTaskRow = {
  id: number;
  title: string;
  taskType: string;
  dueAt: Date | string | null;
  status: string;
  area?: string | null;
};

type SalesCustomerRow = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  area?: string | null;
  address?: string | null;
  carModel?: string | null;
  carYear?: number | null;
  source: string;
  status: string;
  lastContactAt?: Date | string | null;
  nextFollowUpAt?: Date | string | null;
  notes?: string | null;
  convertedOrderId?: number | null;
  createdAt: Date | string | null;
};

type SalesWorkshopRow = {
  id: number;
  name: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  area?: string | null;
  address?: string | null;
  source: string;
  status: string;
  lastContactAt?: Date | string | null;
  nextFollowUpAt?: Date | string | null;
  notes?: string | null;
  convertedWorkshopId?: number | null;
  createdAt: Date | string | null;
};

type SalesTaskRow = {
  id: number;
  title: string;
  taskType: string;
  area?: string | null;
  dueAt: Date | string | null;
  status: string;
  result?: string | null;
  notes?: string | null;
  leadId?: number | null;
  leadName?: string | null;
  leadPhone?: string | null;
  leadType?: string | null;
};

function getScopedEmployeeId(req: AuthenticatedRequest): number | null {
  return req.user?.id ?? null;
}

router.get(
  "/admin/employee/sales/summary",
  requireAuth,
  requireRolePermission("sales.dashboard.view", "هذه الصفحة متاحة لفريق المبيعات ومدير الفريق فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [totalCustomersRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(and(eq(leadsTable.assignedEmployeeId, employeeId), eq(leadsTable.type, "customer")));

    const [newCustomersTodayRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(and(eq(leadsTable.assignedEmployeeId, employeeId), eq(leadsTable.type, "customer"), gte(leadsTable.createdAt, todayStart)));

    const [followUpsTodayRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(
        and(
          eq(leadsTable.assignedEmployeeId, employeeId),
          isNotNull(leadsTable.nextFollowUpAt),
          gte(leadsTable.nextFollowUpAt, todayStart),
          lt(leadsTable.nextFollowUpAt, tomorrowStart),
        ),
      );

    const [convertedCustomersRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(and(eq(leadsTable.assignedEmployeeId, employeeId), eq(leadsTable.type, "customer"), isNotNull(leadsTable.convertedOrderId)));

    const [assignedWorkshopsRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(and(eq(leadsTable.assignedEmployeeId, employeeId), eq(leadsTable.type, "workshop")));

    const [activeTasksRow] = await db
      .select({ count: count() })
      .from(employeeTasksTable)
      .where(and(eq(employeeTasksTable.employeeId, employeeId), or(eq(employeeTasksTable.status, "pending"), eq(employeeTasksTable.status, "in_progress"))));

    const openTasks = await db
      .select({
        id: employeeTasksTable.id,
        title: employeeTasksTable.title,
        taskType: employeeTasksTable.taskType,
        dueAt: employeeTasksTable.dueAt,
        status: employeeTasksTable.status,
        area: employeeTasksTable.area,
      })
      .from(employeeTasksTable)
      .where(and(eq(employeeTasksTable.employeeId, employeeId), or(eq(employeeTasksTable.status, "pending"), eq(employeeTasksTable.status, "in_progress"))))
      .orderBy(asc(employeeTasksTable.dueAt))
      .limit(5);

    res.json({
      totalCustomers: totalCustomersRow.count,
      newCustomersToday: newCustomersTodayRow.count,
      followUpsToday: followUpsTodayRow.count,
      convertedCustomers: convertedCustomersRow.count,
      assignedWorkshops: assignedWorkshopsRow.count,
      activeTasks: activeTasksRow.count,
      openTasks: openTasks.map((task: SalesSummaryTaskRow) => ({
        ...task,
        dueAt: task.dueAt?.toISOString?.() ?? task.dueAt,
      })),
    });
  },
);

router.get(
  "/admin/employee/sales/customers",
  requireAuth,
  requireRolePermission("sales.customers.view_own", "هذه الصفحة متاحة لفريق المبيعات فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const rows = await db
      .select({
        id: leadsTable.id,
        name: leadsTable.name,
        phone: leadsTable.phone,
        email: leadsTable.email,
        area: leadsTable.area,
        address: leadsTable.address,
        carModel: leadsTable.carModel,
        carYear: leadsTable.carYear,
        source: leadsTable.source,
        status: leadsTable.status,
        lastContactAt: leadsTable.lastContactAt,
        nextFollowUpAt: leadsTable.nextFollowUpAt,
        notes: leadsTable.notes,
        convertedOrderId: leadsTable.convertedOrderId,
        createdAt: leadsTable.createdAt,
      })
      .from(leadsTable)
      .where(and(eq(leadsTable.assignedEmployeeId, employeeId), eq(leadsTable.type, "customer")))
      .orderBy(desc(leadsTable.nextFollowUpAt), desc(leadsTable.createdAt));

    res.json(
      rows.map((row: SalesCustomerRow) => ({
        ...row,
        lastContactAt: row.lastContactAt?.toISOString?.() ?? row.lastContactAt,
        nextFollowUpAt: row.nextFollowUpAt?.toISOString?.() ?? row.nextFollowUpAt,
        createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
      })),
    );
  },
);

router.get(
  "/admin/employee/sales/workshops",
  requireAuth,
  requireRolePermission("sales.workshops.view_own", "هذه الصفحة متاحة لفريق المبيعات فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const rows = await db
      .select({
        id: leadsTable.id,
        name: leadsTable.name,
        contactPerson: leadsTable.contactPerson,
        phone: leadsTable.phone,
        email: leadsTable.email,
        area: leadsTable.area,
        address: leadsTable.address,
        source: leadsTable.source,
        status: leadsTable.status,
        lastContactAt: leadsTable.lastContactAt,
        nextFollowUpAt: leadsTable.nextFollowUpAt,
        notes: leadsTable.notes,
        convertedWorkshopId: leadsTable.convertedWorkshopId,
        createdAt: leadsTable.createdAt,
      })
      .from(leadsTable)
      .where(and(eq(leadsTable.assignedEmployeeId, employeeId), eq(leadsTable.type, "workshop")))
      .orderBy(desc(leadsTable.nextFollowUpAt), desc(leadsTable.createdAt));

    res.json(
      rows.map((row: SalesWorkshopRow) => ({
        ...row,
        lastContactAt: row.lastContactAt?.toISOString?.() ?? row.lastContactAt,
        nextFollowUpAt: row.nextFollowUpAt?.toISOString?.() ?? row.nextFollowUpAt,
        createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
      })),
    );
  },
);

router.get(
  "/admin/employee/sales/tasks",
  requireAuth,
  requireRolePermission("sales.tasks.view_own", "هذه الصفحة متاحة لفريق المبيعات فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const rows = await db
      .select({
        id: employeeTasksTable.id,
        title: employeeTasksTable.title,
        taskType: employeeTasksTable.taskType,
        area: employeeTasksTable.area,
        dueAt: employeeTasksTable.dueAt,
        status: employeeTasksTable.status,
        result: employeeTasksTable.result,
        notes: employeeTasksTable.notes,
        leadId: employeeTasksTable.leadId,
        leadName: leadsTable.name,
        leadPhone: leadsTable.phone,
        leadType: leadsTable.type,
      })
      .from(employeeTasksTable)
      .leftJoin(leadsTable, eq(employeeTasksTable.leadId, leadsTable.id))
      .where(eq(employeeTasksTable.employeeId, employeeId))
      .orderBy(asc(employeeTasksTable.dueAt));

    res.json(
      rows.map((row: SalesTaskRow) => ({
        ...row,
        dueAt: row.dueAt?.toISOString?.() ?? row.dueAt,
      })),
    );
  },
);

export default router;
