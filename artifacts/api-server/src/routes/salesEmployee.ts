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
  createdByUserId?: number | null;
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
  createdByUserId?: number | null;
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
  createdByUserId?: number | null;
};

type ParsedResult<T> = { success: true; data: T } | { success: false; error: string };

type CreateSalesCustomerInput = {
  name: string;
  phone: string;
  email: string | null;
  area: string;
  address: string | null;
  carModel: string | null;
  carYear: number | null;
  nextFollowUpAt: string | null;
  notes: string | null;
};

type CreateSalesWorkshopInput = {
  name: string;
  contactPerson: string | null;
  phone: string;
  email: string | null;
  area: string;
  address: string | null;
  nextFollowUpAt: string | null;
  notes: string | null;
};

type CreateSalesTaskInput = {
  title: string;
  taskType: "call" | "visit" | "follow_up" | "whatsapp" | "meeting";
  area: string | null;
  dueAt: string;
  notes: string | null;
  leadId: number | null;
};

function getScopedEmployeeId(req: AuthenticatedRequest): number | null {
  return req.user?.id ?? null;
}

function toIso(value?: Date | string | null) {
  return value instanceof Date ? value.toISOString() : value ?? null;
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function isIsoDateTime(value: string | null): boolean {
  return !!value && !Number.isNaN(Date.parse(value));
}

function parseSalesCustomerInput(body: unknown): ParsedResult<CreateSalesCustomerInput> {
  const payload = (body ?? {}) as Record<string, unknown>;
  const name = asNullableString(payload.name);
  const phone = asNullableString(payload.phone);
  const area = asNullableString(payload.area);
  const email = asNullableString(payload.email);
  const nextFollowUpAt = asNullableString(payload.nextFollowUpAt);
  const carYearRaw = payload.carYear;
  const carYear = carYearRaw === null || carYearRaw === undefined || carYearRaw === "" ? null : Number(carYearRaw);

  if (!name || name.length < 2) return { success: false, error: "اسم العميل مطلوب" };
  if (!phone || phone.length < 7) return { success: false, error: "رقم الهاتف مطلوب" };
  if (!area || area.length < 2) return { success: false, error: "المنطقة مطلوبة" };
  if (email && !email.includes("@")) return { success: false, error: "البريد الإلكتروني غير صحيح" };
  if (nextFollowUpAt && !isIsoDateTime(nextFollowUpAt)) return { success: false, error: "موعد المتابعة غير صحيح" };
  if (carYear !== null && (!Number.isInteger(carYear) || carYear < 1990 || carYear > 2100)) {
    return { success: false, error: "سنة السيارة غير صحيحة" };
  }

  return {
    success: true,
    data: {
      name,
      phone,
      email,
      area,
      address: asNullableString(payload.address),
      carModel: asNullableString(payload.carModel),
      carYear,
      nextFollowUpAt,
      notes: asNullableString(payload.notes),
    },
  };
}

function parseSalesWorkshopInput(body: unknown): ParsedResult<CreateSalesWorkshopInput> {
  const payload = (body ?? {}) as Record<string, unknown>;
  const name = asNullableString(payload.name);
  const phone = asNullableString(payload.phone);
  const area = asNullableString(payload.area);
  const email = asNullableString(payload.email);
  const nextFollowUpAt = asNullableString(payload.nextFollowUpAt);

  if (!name || name.length < 2) return { success: false, error: "اسم الورشة مطلوب" };
  if (!phone || phone.length < 7) return { success: false, error: "رقم الهاتف مطلوب" };
  if (!area || area.length < 2) return { success: false, error: "المنطقة مطلوبة" };
  if (email && !email.includes("@")) return { success: false, error: "البريد الإلكتروني غير صحيح" };
  if (nextFollowUpAt && !isIsoDateTime(nextFollowUpAt)) return { success: false, error: "موعد المتابعة غير صحيح" };

  return {
    success: true,
    data: {
      name,
      contactPerson: asNullableString(payload.contactPerson),
      phone,
      email,
      area,
      address: asNullableString(payload.address),
      nextFollowUpAt,
      notes: asNullableString(payload.notes),
    },
  };
}

function parseSalesTaskInput(body: unknown): ParsedResult<CreateSalesTaskInput> {
  const payload = (body ?? {}) as Record<string, unknown>;
  const title = asNullableString(payload.title);
  const dueAt = asNullableString(payload.dueAt);
  const taskType = asNullableString(payload.taskType) as CreateSalesTaskInput["taskType"] | null;
  const validTaskTypes = ["call", "visit", "follow_up", "whatsapp", "meeting"];
  const leadIdRaw = payload.leadId;
  const leadId = leadIdRaw === null || leadIdRaw === undefined || leadIdRaw === "" ? null : Number(leadIdRaw);

  if (!title || title.length < 3) return { success: false, error: "عنوان المهمة مطلوب" };
  if (!dueAt || !isIsoDateTime(dueAt)) return { success: false, error: "موعد المهمة غير صحيح" };
  if (!taskType || !validTaskTypes.includes(taskType)) return { success: false, error: "نوع المهمة غير صحيح" };
  if (leadId !== null && (!Number.isInteger(leadId) || leadId <= 0)) return { success: false, error: "الفرصة المرتبطة غير صحيحة" };

  return {
    success: true,
    data: {
      title,
      taskType,
      area: asNullableString(payload.area),
      dueAt,
      notes: asNullableString(payload.notes),
      leadId,
    },
  };
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
        dueAt: toIso(task.dueAt),
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
        createdByUserId: leadsTable.createdByUserId,
      })
      .from(leadsTable)
      .where(and(eq(leadsTable.assignedEmployeeId, employeeId), eq(leadsTable.type, "customer")))
      .orderBy(desc(leadsTable.nextFollowUpAt), desc(leadsTable.createdAt));

    res.json(
      rows.map((row: SalesCustomerRow) => ({
        ...row,
        lastContactAt: toIso(row.lastContactAt),
        nextFollowUpAt: toIso(row.nextFollowUpAt),
        createdAt: toIso(row.createdAt),
        ownershipSource: row.createdByUserId === employeeId ? "self_created" : "assigned",
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
        createdByUserId: leadsTable.createdByUserId,
      })
      .from(leadsTable)
      .where(and(eq(leadsTable.assignedEmployeeId, employeeId), eq(leadsTable.type, "workshop")))
      .orderBy(desc(leadsTable.nextFollowUpAt), desc(leadsTable.createdAt));

    res.json(
      rows.map((row: SalesWorkshopRow) => ({
        ...row,
        lastContactAt: toIso(row.lastContactAt),
        nextFollowUpAt: toIso(row.nextFollowUpAt),
        createdAt: toIso(row.createdAt),
        ownershipSource: row.createdByUserId === employeeId ? "self_created" : "assigned",
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
        createdByUserId: employeeTasksTable.createdByUserId,
      })
      .from(employeeTasksTable)
      .leftJoin(leadsTable, eq(employeeTasksTable.leadId, leadsTable.id))
      .where(eq(employeeTasksTable.employeeId, employeeId))
      .orderBy(asc(employeeTasksTable.dueAt));

    res.json(
      rows.map((row: SalesTaskRow) => ({
        ...row,
        dueAt: toIso(row.dueAt),
        ownershipSource: row.createdByUserId === employeeId ? "self_created" : "assigned",
      })),
    );
  },
);

router.post(
  "/admin/employee/sales/customers",
  requireAuth,
  requireRolePermission("sales.customers.create_own", "هذه العملية متاحة لفريق المبيعات فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const parsed = parseSalesCustomerInput(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const payload = parsed.data;
    const [created] = await db
      .insert(leadsTable)
      .values({
        type: "customer",
        name: payload.name,
        phone: payload.phone,
        email: payload.email || null,
        area: payload.area,
        address: payload.address || null,
        carModel: payload.carModel || null,
        carYear: payload.carYear ?? null,
        source: "sales_self",
        status: "new",
        assignedEmployeeId: employeeId,
        createdByUserId: employeeId,
        nextFollowUpAt: payload.nextFollowUpAt ? new Date(payload.nextFollowUpAt) : null,
        notes: payload.notes || null,
      })
      .returning({
        id: leadsTable.id,
        name: leadsTable.name,
        phone: leadsTable.phone,
      });

    res.status(201).json({ ...created, ownershipSource: "self_created" });
  },
);

router.post(
  "/admin/employee/sales/workshops",
  requireAuth,
  requireRolePermission("sales.workshops.create_own", "هذه العملية متاحة لفريق المبيعات فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const parsed = parseSalesWorkshopInput(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const payload = parsed.data;
    const [created] = await db
      .insert(leadsTable)
      .values({
        type: "workshop",
        name: payload.name,
        contactPerson: payload.contactPerson || null,
        phone: payload.phone,
        email: payload.email || null,
        area: payload.area,
        address: payload.address || null,
        source: "sales_self",
        status: "new",
        assignedEmployeeId: employeeId,
        createdByUserId: employeeId,
        nextFollowUpAt: payload.nextFollowUpAt ? new Date(payload.nextFollowUpAt) : null,
        notes: payload.notes || null,
      })
      .returning({
        id: leadsTable.id,
        name: leadsTable.name,
        phone: leadsTable.phone,
      });

    res.status(201).json({ ...created, ownershipSource: "self_created" });
  },
);

router.post(
  "/admin/employee/sales/tasks",
  requireAuth,
  requireRolePermission("sales.tasks.create_own", "هذه العملية متاحة لفريق المبيعات فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const parsed = parseSalesTaskInput(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const payload = parsed.data;
    const [created] = await db
      .insert(employeeTasksTable)
      .values({
        employeeId,
        leadId: payload.leadId ?? null,
        title: payload.title,
        taskType: payload.taskType,
        area: payload.area || null,
        dueAt: new Date(payload.dueAt),
        status: "pending",
        notes: payload.notes || null,
        createdByUserId: employeeId,
      })
      .returning({
        id: employeeTasksTable.id,
        title: employeeTasksTable.title,
        taskType: employeeTasksTable.taskType,
        dueAt: employeeTasksTable.dueAt,
        status: employeeTasksTable.status,
        area: employeeTasksTable.area,
      });

    res.status(201).json({
      ...created,
      dueAt: toIso(created.dueAt),
      ownershipSource: "self_created",
    });
  },
);

export default router;
