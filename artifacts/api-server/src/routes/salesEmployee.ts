import { Router, type IRouter, type Response } from "express";
import { and, asc, count, desc, eq, gte, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";
import { db, employeeDailyReportsTable, employeeTasksTable, leadsTable, usersTable } from "@workspace/db";
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
  registeredUserId?: number | null;
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
  registeredUserId?: number | null;
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

type TeamLeadRow = {
  id: number;
  type: string;
  name: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  area?: string | null;
  address?: string | null;
  source: string;
  status: string;
  notes?: string | null;
  assignedEmployeeId?: number | null;
  createdByUserId?: number | null;
  registeredUserId?: number | null;
  convertedOrderId?: number | null;
  convertedWorkshopId?: number | null;
  lastContactAt?: Date | string | null;
  nextFollowUpAt?: Date | string | null;
  createdAt?: Date | string | null;
};

type TeamTaskRow = {
  id: number;
  employeeId: number;
  leadId?: number | null;
  title: string;
  taskType: string;
  area?: string | null;
  dueAt: Date | string | null;
  status: string;
  notes?: string | null;
  createdByUserId?: number | null;
};

type DailyReportRow = {
  id: number;
  reportDate: string | Date;
  summary: string;
  achievements?: string | null;
  blockers?: string | null;
  nextSteps?: string | null;
  createdAt?: string | Date;
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
  taskType:
    | "call"
    | "visit"
    | "follow_up"
    | "whatsapp"
    | "meeting"
    | "data_entry"
    | "issue_resolution"
    | "quotation"
    | "collection"
    | "field_follow_up";
  area: string | null;
  dueAt: string;
  notes: string | null;
  leadId: number | null;
};

type AssignLeadInput = {
  employeeId: number | null;
};

type CreateManagedTaskInput = {
  employeeId: number;
  title: string;
  taskType: CreateSalesTaskInput["taskType"];
  area: string | null;
  dueAt: string;
  notes: string | null;
  leadId: number | null;
};

type UpdateSalesTaskInput = {
  status: "pending" | "in_progress" | "completed" | "cancelled" | "postponed";
  result: string | null;
};

type CreateDailyReportInput = {
  reportDate: string;
  summary: string;
  achievements: string | null;
  blockers: string | null;
  nextSteps: string | null;
};

type CreateDataEntryLeadInput = {
  type: "customer" | "workshop";
  name: string;
  contactPerson: string | null;
  phone: string;
  email: string | null;
  area: string;
  address: string | null;
  carModel: string | null;
  carYear: number | null;
  nextFollowUpAt: string | null;
  notes: string | null;
  assignedEmployeeId: number | null;
};

const VALID_TASK_TYPES = [
  "call",
  "visit",
  "follow_up",
  "whatsapp",
  "meeting",
  "data_entry",
  "issue_resolution",
  "quotation",
  "collection",
  "field_follow_up",
] as const;

const VALID_TASK_STATUSES = ["pending", "in_progress", "completed", "cancelled", "postponed"] as const;

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
  const leadIdRaw = payload.leadId;
  const leadId = leadIdRaw === null || leadIdRaw === undefined || leadIdRaw === "" ? null : Number(leadIdRaw);

  if (!title || title.length < 3) return { success: false, error: "عنوان المهمة مطلوب" };
  if (!dueAt || !isIsoDateTime(dueAt)) return { success: false, error: "موعد المهمة غير صحيح" };
  if (!taskType || !VALID_TASK_TYPES.includes(taskType)) return { success: false, error: "نوع المهمة غير صحيح" };
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

function parseUpdateSalesTaskInput(body: unknown): ParsedResult<UpdateSalesTaskInput> {
  const payload = (body ?? {}) as Record<string, unknown>;
  const status = asNullableString(payload.status) as UpdateSalesTaskInput["status"] | null;
  const result = asNullableString(payload.result);

  if (!status || !VALID_TASK_STATUSES.includes(status)) {
    return { success: false, error: "حالة المهمة غير صحيحة" };
  }

  return {
    success: true,
    data: {
      status,
      result,
    },
  };
}

function parseDailyReportInput(body: unknown): ParsedResult<CreateDailyReportInput> {
  const payload = (body ?? {}) as Record<string, unknown>;
  const reportDate = asNullableString(payload.reportDate);
  const summary = asNullableString(payload.summary);

  if (!reportDate || Number.isNaN(Date.parse(reportDate))) {
    return { success: false, error: "تاريخ التقرير غير صحيح" };
  }

  if (!summary || summary.length < 5) {
    return { success: false, error: "ملخص التقرير مطلوب" };
  }

  return {
    success: true,
    data: {
      reportDate,
      summary,
      achievements: asNullableString(payload.achievements),
      blockers: asNullableString(payload.blockers),
      nextSteps: asNullableString(payload.nextSteps),
    },
  };
}

function parseDataEntryLeadInput(body: unknown): ParsedResult<CreateDataEntryLeadInput> {
  const payload = (body ?? {}) as Record<string, unknown>;
  const type = asNullableString(payload.type) as "customer" | "workshop" | null;
  const assignedEmployeeIdRaw = payload.assignedEmployeeId;
  const assignedEmployeeId =
    assignedEmployeeIdRaw === null || assignedEmployeeIdRaw === undefined || assignedEmployeeIdRaw === ""
      ? null
      : Number(assignedEmployeeIdRaw);

  if (assignedEmployeeId !== null && (!Number.isInteger(assignedEmployeeId) || assignedEmployeeId <= 0)) {
    return { success: false, error: "الموظف المسند غير صحيح" };
  }

  if (type === "customer") {
    const parsed = parseSalesCustomerInput(body);
    if (!parsed.success) return parsed;
    return {
      success: true,
      data: {
        type,
        name: parsed.data.name,
        contactPerson: null,
        phone: parsed.data.phone,
        email: parsed.data.email,
        area: parsed.data.area,
        address: parsed.data.address,
        carModel: parsed.data.carModel,
        carYear: parsed.data.carYear,
        nextFollowUpAt: parsed.data.nextFollowUpAt,
        notes: parsed.data.notes,
        assignedEmployeeId,
      },
    };
  }

  if (type === "workshop") {
    const parsed = parseSalesWorkshopInput(body);
    if (!parsed.success) return parsed;
    return {
      success: true,
      data: {
        type,
        name: parsed.data.name,
        contactPerson: parsed.data.contactPerson,
        phone: parsed.data.phone,
        email: parsed.data.email,
        area: parsed.data.area,
        address: parsed.data.address,
        carModel: null,
        carYear: null,
        nextFollowUpAt: parsed.data.nextFollowUpAt,
        notes: parsed.data.notes,
        assignedEmployeeId,
      },
    };
  }

  return { success: false, error: "نوع السجل غير صحيح" };
}

function parseAssignLeadInput(body: unknown): ParsedResult<AssignLeadInput> {
  const payload = (body ?? {}) as Record<string, unknown>;
  const rawEmployeeId = payload.employeeId;
  const employeeId = rawEmployeeId === null || rawEmployeeId === undefined || rawEmployeeId === "" ? null : Number(rawEmployeeId);

  if (employeeId !== null && (!Number.isInteger(employeeId) || employeeId <= 0)) {
    return { success: false, error: "الموظف المختار غير صحيح" };
  }

  return { success: true, data: { employeeId } };
}

function parseManagedTaskInput(body: unknown): ParsedResult<CreateManagedTaskInput> {
  const parsedTask = parseSalesTaskInput(body);
  if (!parsedTask.success) return parsedTask;

  const payload = (body ?? {}) as Record<string, unknown>;
  const employeeId = Number(payload.employeeId);

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return { success: false, error: "الموظف المختار غير صحيح" };
  }

  return {
    success: true,
    data: {
      employeeId,
      ...parsedTask.data,
    },
  };
}

type UserNameMapValue = {
  name: string;
  role: string;
  employeeRole: string | null;
};

async function loadUserNameMap(userIds: Array<number | null | undefined>): Promise<Map<number, UserNameMapValue>> {
  const normalizedIds = Array.from(new Set(userIds.filter((value): value is number => typeof value === "number" && value > 0)));

  if (normalizedIds.length === 0) {
    return new Map<number, { name: string; role: string; employeeRole: string | null }>();
  }

  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      role: usersTable.role,
      employeeRole: usersTable.employeeRole,
    })
    .from(usersTable)
    .where(inArray(usersTable.id, normalizedIds));

  return new Map<number, UserNameMapValue>(
    users.map((user: { id: number; name: string; role: string; employeeRole: string | null }) => [
      user.id,
      {
        name: user.name,
        role: user.role,
        employeeRole: user.employeeRole,
      },
    ]),
  );
}

async function ensureSalesEmployee(employeeId: number) {
  const [employee] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      role: usersTable.role,
      employeeRole: usersTable.employeeRole,
    })
    .from(usersTable)
    .where(eq(usersTable.id, employeeId));

  if (!employee || employee.role !== "employee" || employee.employeeRole !== "sales") {
    return null;
  }

  return employee;
}

async function ensureAssignableEmployee(actor: AuthenticatedRequest["user"], employeeId: number) {
  const [employee] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      role: usersTable.role,
      employeeRole: usersTable.employeeRole,
    })
    .from(usersTable)
    .where(eq(usersTable.id, employeeId));

  if (!employee || employee.role !== "employee" || !employee.employeeRole) {
    return null;
  }

  if (actor?.role === "admin") {
    return employee;
  }

  if (actor?.role === "employee" && actor.employeeRole === "manager") {
    return employee.employeeRole === "manager" ? null : employee;
  }

  return null;
}

async function ensureDataEntryAssignee(actor: AuthenticatedRequest["user"], employeeId: number) {
  const [employee] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      role: usersTable.role,
      employeeRole: usersTable.employeeRole,
    })
    .from(usersTable)
    .where(eq(usersTable.id, employeeId));

  if (!employee || employee.role !== "employee" || !employee.employeeRole) {
    return null;
  }

  if (actor?.role === "admin" && ["manager", "sales", "technical_expert", "marketing_tech", "customer_service"].includes(employee.employeeRole)) {
    return employee;
  }

  if (actor?.role === "employee" && actor.employeeRole === "manager" && ["sales", "technical_expert", "marketing_tech", "customer_service"].includes(employee.employeeRole)) {
    return employee;
  }

  if (actor?.role === "employee" && actor.employeeRole === "data_entry" && ["sales", "technical_expert", "marketing_tech", "customer_service"].includes(employee.employeeRole)) {
    return employee;
  }

  return null;
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
      .where(
        and(
          eq(leadsTable.assignedEmployeeId, employeeId),
          eq(leadsTable.type, "customer"),
          or(isNotNull(leadsTable.convertedOrderId), isNotNull(leadsTable.registeredUserId)),
        ),
      );

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
        registeredUserId: leadsTable.registeredUserId,
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
        registeredUserId: leadsTable.registeredUserId,
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
  requireRolePermission("employee.tasks.view_own", "هذه الصفحة متاحة للموظفين فقط"),
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

router.get(
  "/admin/employee/team/employees",
  requireAuth,
  requireRolePermission("sales.team.view", "هذه الصفحة متاحة لمدير الفريق والإدارة فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const allowedEmployeeRoles =
      req.user?.role === "admin"
        ? ["manager", "sales", "data_entry", "technical_expert", "marketing_tech", "customer_service"]
        : ["sales", "data_entry", "technical_expert", "marketing_tech", "customer_service"];

    const rows = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        phone: usersTable.phone,
        email: usersTable.email,
        role: usersTable.role,
        employeeRole: usersTable.employeeRole,
        area: usersTable.area,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(and(eq(usersTable.role, "employee"), inArray(usersTable.employeeRole, allowedEmployeeRoles)))
      .orderBy(asc(usersTable.name));

    res.json(rows);
  },
);

router.get(
  "/admin/employee/team/leads",
  requireAuth,
  requireRolePermission("sales.team.view", "هذه الصفحة متاحة لمدير الفريق والإدارة فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const type = typeof req.query.type === "string" ? req.query.type : null;
    const baseQuery = db
      .select({
        id: leadsTable.id,
        type: leadsTable.type,
        name: leadsTable.name,
        contactPerson: leadsTable.contactPerson,
        phone: leadsTable.phone,
        email: leadsTable.email,
        area: leadsTable.area,
        address: leadsTable.address,
        source: leadsTable.source,
        status: leadsTable.status,
        notes: leadsTable.notes,
        assignedEmployeeId: leadsTable.assignedEmployeeId,
        createdByUserId: leadsTable.createdByUserId,
        registeredUserId: leadsTable.registeredUserId,
        convertedOrderId: leadsTable.convertedOrderId,
        convertedWorkshopId: leadsTable.convertedWorkshopId,
        lastContactAt: leadsTable.lastContactAt,
        nextFollowUpAt: leadsTable.nextFollowUpAt,
        createdAt: leadsTable.createdAt,
      })
      .from(leadsTable);

    const rows = type === "customer" || type === "workshop"
      ? await baseQuery.where(eq(leadsTable.type, type)).orderBy(desc(leadsTable.createdAt))
      : await baseQuery.orderBy(desc(leadsTable.createdAt));

    const nameMap = await loadUserNameMap(
      rows.flatMap((row: TeamLeadRow) => [row.assignedEmployeeId, row.createdByUserId, row.registeredUserId]),
    );

    res.json(
      rows.map((row: TeamLeadRow) => ({
        ...row,
        lastContactAt: toIso(row.lastContactAt),
        nextFollowUpAt: toIso(row.nextFollowUpAt),
        createdAt: toIso(row.createdAt),
        assignedEmployeeName: row.assignedEmployeeId ? nameMap.get(row.assignedEmployeeId)?.name ?? null : null,
        createdByUserName: row.createdByUserId ? nameMap.get(row.createdByUserId)?.name ?? null : null,
        registeredUserName: row.registeredUserId ? nameMap.get(row.registeredUserId)?.name ?? null : null,
      })),
    );
  },
);

router.post(
  "/admin/employee/team/leads/:id/assign",
  requireAuth,
  requireRolePermission("sales.team.assign", "هذه العملية متاحة لمدير الفريق والإدارة فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const leadId = Number(req.params.id);
    if (!Number.isInteger(leadId) || leadId <= 0) {
      res.status(400).json({ error: "الفرصة المطلوبة غير صحيحة" });
      return;
    }

    const parsed = parseAssignLeadInput(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    if (parsed.data.employeeId !== null) {
      const assignee = await ensureAssignableEmployee(req.user, parsed.data.employeeId);
      if (!assignee) {
        res.status(400).json({ error: "لا يمكن الإسناد إلا لموظف صالح ضمن نطاقك الإداري" });
        return;
      }
    }

    const [updated] = await db
      .update(leadsTable)
      .set({
        assignedEmployeeId: parsed.data.employeeId,
        updatedAt: new Date(),
      })
      .where(eq(leadsTable.id, leadId))
      .returning({
        id: leadsTable.id,
        assignedEmployeeId: leadsTable.assignedEmployeeId,
      });

    if (!updated) {
      res.status(404).json({ error: "الفرصة المطلوبة غير موجودة" });
      return;
    }

    const nameMap = await loadUserNameMap([updated.assignedEmployeeId]);

    res.json({
      ...updated,
      assignedEmployeeName: updated.assignedEmployeeId ? nameMap.get(updated.assignedEmployeeId)?.name ?? null : null,
    });
  },
);

router.get(
  "/admin/employee/team/tasks",
  requireAuth,
  requireRolePermission("sales.team.view", "هذه الصفحة متاحة لمدير الفريق والإدارة فقط"),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const rows = await db
      .select({
        id: employeeTasksTable.id,
        employeeId: employeeTasksTable.employeeId,
        leadId: employeeTasksTable.leadId,
        title: employeeTasksTable.title,
        taskType: employeeTasksTable.taskType,
        area: employeeTasksTable.area,
        dueAt: employeeTasksTable.dueAt,
        status: employeeTasksTable.status,
        notes: employeeTasksTable.notes,
        createdByUserId: employeeTasksTable.createdByUserId,
      })
      .from(employeeTasksTable)
      .orderBy(desc(employeeTasksTable.createdAt))
      .limit(20);

    const nameMap = await loadUserNameMap(rows.flatMap((row: TeamTaskRow) => [row.employeeId, row.createdByUserId]));
    const leadIds = Array.from(new Set(rows.map((row: TeamTaskRow) => row.leadId).filter((value: number | null | undefined): value is number => typeof value === "number" && value > 0)));
    const leadRows = leadIds.length
      ? await db.select({ id: leadsTable.id, name: leadsTable.name }).from(leadsTable).where(inArray(leadsTable.id, leadIds))
      : [];
    const leadMap = new Map<number, string>(leadRows.map((lead: { id: number; name: string }) => [lead.id, lead.name]));

    res.json(
      rows.map((row: TeamTaskRow) => ({
        ...row,
        dueAt: toIso(row.dueAt),
        employeeName: nameMap.get(row.employeeId)?.name ?? null,
        createdByUserName: row.createdByUserId ? nameMap.get(row.createdByUserId)?.name ?? null : null,
        leadName: row.leadId ? leadMap.get(row.leadId) ?? null : null,
      })),
    );
  },
);

router.post(
  "/admin/employee/team/tasks",
  requireAuth,
  requireRolePermission("sales.team.assign", "هذه العملية متاحة لمدير الفريق والإدارة فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const managerId = getScopedEmployeeId(req);
    if (!managerId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const parsed = parseManagedTaskInput(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const assignee = await ensureAssignableEmployee(req.user, parsed.data.employeeId);
    if (!assignee) {
      res.status(400).json({ error: "لا يمكن إسناد المهمة إلا لموظف صالح ضمن نطاقك الإداري" });
      return;
    }

    if (parsed.data.leadId) {
      const [lead] = await db.select({ id: leadsTable.id }).from(leadsTable).where(eq(leadsTable.id, parsed.data.leadId));
      if (!lead) {
        res.status(400).json({ error: "الفرصة المرتبطة غير موجودة" });
        return;
      }
    }

    const [created] = await db
      .insert(employeeTasksTable)
      .values({
        employeeId: parsed.data.employeeId,
        leadId: parsed.data.leadId ?? null,
        title: parsed.data.title,
        taskType: parsed.data.taskType,
        area: parsed.data.area ?? null,
        dueAt: new Date(parsed.data.dueAt),
        status: "pending",
        notes: parsed.data.notes ?? null,
        createdByUserId: managerId,
      })
      .returning({
        id: employeeTasksTable.id,
        employeeId: employeeTasksTable.employeeId,
        title: employeeTasksTable.title,
      });

    res.status(201).json(created);
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
  requireRolePermission("employee.tasks.create_own", "هذه العملية متاحة للموظفين فقط"),
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

router.patch(
  "/admin/employee/sales/tasks/:id",
  requireAuth,
  requireRolePermission("employee.tasks.update_own", "هذه العملية متاحة للموظفين فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    const taskId = Number(req.params.id);

    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    if (!Number.isInteger(taskId) || taskId <= 0) {
      res.status(400).json({ error: "المهمة المطلوبة غير صحيحة" });
      return;
    }

    const parsed = parseUpdateSalesTaskInput(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const [task] = await db
      .select({ id: employeeTasksTable.id, employeeId: employeeTasksTable.employeeId })
      .from(employeeTasksTable)
      .where(eq(employeeTasksTable.id, taskId));

    if (!task || task.employeeId !== employeeId) {
      res.status(404).json({ error: "المهمة المطلوبة غير موجودة" });
      return;
    }

    const [updated] = await db
      .update(employeeTasksTable)
      .set({
        status: parsed.data.status,
        result: parsed.data.result ?? null,
        updatedAt: new Date(),
      })
      .where(eq(employeeTasksTable.id, taskId))
      .returning({
        id: employeeTasksTable.id,
        status: employeeTasksTable.status,
        result: employeeTasksTable.result,
      });

    res.json(updated);
  },
);

router.get(
  "/admin/employee/daily-reports/me",
  requireAuth,
  requireRolePermission("employee.reports.view_own", "هذه الصفحة متاحة للموظفين فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const rows = await db
      .select({
        id: employeeDailyReportsTable.id,
        reportDate: employeeDailyReportsTable.reportDate,
        summary: employeeDailyReportsTable.summary,
        achievements: employeeDailyReportsTable.achievements,
        blockers: employeeDailyReportsTable.blockers,
        nextSteps: employeeDailyReportsTable.nextSteps,
        createdAt: employeeDailyReportsTable.createdAt,
      })
      .from(employeeDailyReportsTable)
      .where(eq(employeeDailyReportsTable.employeeId, employeeId))
      .orderBy(desc(employeeDailyReportsTable.reportDate))
      .limit(14);

    res.json(
      rows.map((row: DailyReportRow) => ({
        ...row,
        createdAt: toIso(row.createdAt),
      })),
    );
  },
);

router.post(
  "/admin/employee/daily-reports/me",
  requireAuth,
  requireRolePermission("employee.reports.create_own", "هذه العملية متاحة للموظفين فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const parsed = parseDailyReportInput(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const normalizedReportDate = new Date(parsed.data.reportDate).toISOString().slice(0, 10);
    const [existing] = await db
      .select({ id: employeeDailyReportsTable.id })
      .from(employeeDailyReportsTable)
      .where(and(eq(employeeDailyReportsTable.employeeId, employeeId), eq(employeeDailyReportsTable.reportDate, normalizedReportDate)));

    const values = {
      summary: parsed.data.summary,
      achievements: parsed.data.achievements ?? null,
      blockers: parsed.data.blockers ?? null,
      nextSteps: parsed.data.nextSteps ?? null,
      updatedAt: new Date(),
    };

    if (existing) {
      const [updated] = await db
        .update(employeeDailyReportsTable)
        .set(values)
        .where(eq(employeeDailyReportsTable.id, existing.id))
        .returning({
          id: employeeDailyReportsTable.id,
          reportDate: employeeDailyReportsTable.reportDate,
          summary: employeeDailyReportsTable.summary,
        });
      res.json(updated);
      return;
    }

    const [created] = await db
      .insert(employeeDailyReportsTable)
      .values({
        employeeId,
        reportDate: normalizedReportDate,
        summary: parsed.data.summary,
        achievements: parsed.data.achievements ?? null,
        blockers: parsed.data.blockers ?? null,
        nextSteps: parsed.data.nextSteps ?? null,
      })
      .returning({
        id: employeeDailyReportsTable.id,
        reportDate: employeeDailyReportsTable.reportDate,
        summary: employeeDailyReportsTable.summary,
      });

    res.status(201).json(created);
  },
);

router.get(
  "/admin/employee/data-entry/assignees",
  requireAuth,
  requireRolePermission("data_entry.leads.view", "هذه الصفحة متاحة لفريق إدخال البيانات فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const allowedRoles =
      req.user?.role === "admin"
        ? ["manager", "sales", "technical_expert", "marketing_tech", "customer_service"]
        : ["sales", "technical_expert", "marketing_tech", "customer_service"];

    const rows = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        employeeRole: usersTable.employeeRole,
        phone: usersTable.phone,
        email: usersTable.email,
      })
      .from(usersTable)
      .where(and(eq(usersTable.role, "employee"), inArray(usersTable.employeeRole, allowedRoles)))
      .orderBy(asc(usersTable.name));

    res.json(rows);
  },
);

router.get(
  "/admin/employee/data-entry/summary",
  requireAuth,
  requireRolePermission("data_entry.leads.view", "هذه الصفحة متاحة لفريق إدخال البيانات فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    const scopeCondition =
      req.user?.role === "admin" || (req.user?.role === "employee" && req.user.employeeRole === "manager")
        ? eq(leadsTable.source, "data_entry")
        : and(eq(leadsTable.source, "data_entry"), eq(leadsTable.createdByUserId, employeeId!));

    const [totalRow] = await db.select({ count: count() }).from(leadsTable).where(scopeCondition);
    const [unassignedRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(and(scopeCondition, isNull(leadsTable.assignedEmployeeId)));
    const [registeredRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(and(scopeCondition, isNotNull(leadsTable.registeredUserId)));
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [todayRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(and(scopeCondition, gte(leadsTable.createdAt, todayStart)));

    res.json({
      total: totalRow.count,
      unassigned: unassignedRow.count,
      registered: registeredRow.count,
      addedToday: todayRow.count,
    });
  },
);

router.get(
  "/admin/employee/data-entry/leads",
  requireAuth,
  requireRolePermission("data_entry.leads.view", "هذه الصفحة متاحة لفريق إدخال البيانات فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    const type = typeof req.query.type === "string" ? req.query.type : null;
    const whereConditions = [eq(leadsTable.source, "data_entry")];

    if (!(req.user?.role === "admin" || (req.user?.role === "employee" && req.user.employeeRole === "manager"))) {
      whereConditions.push(eq(leadsTable.createdByUserId, employeeId!));
    }

    if (type === "customer" || type === "workshop") {
      whereConditions.push(eq(leadsTable.type, type));
    }

    const rows = await db
      .select({
        id: leadsTable.id,
        type: leadsTable.type,
        name: leadsTable.name,
        contactPerson: leadsTable.contactPerson,
        phone: leadsTable.phone,
        email: leadsTable.email,
        area: leadsTable.area,
        address: leadsTable.address,
        source: leadsTable.source,
        status: leadsTable.status,
        notes: leadsTable.notes,
        assignedEmployeeId: leadsTable.assignedEmployeeId,
        createdByUserId: leadsTable.createdByUserId,
        registeredUserId: leadsTable.registeredUserId,
        lastContactAt: leadsTable.lastContactAt,
        nextFollowUpAt: leadsTable.nextFollowUpAt,
        createdAt: leadsTable.createdAt,
      })
      .from(leadsTable)
      .where(and(...whereConditions))
      .orderBy(desc(leadsTable.createdAt));

    const nameMap = await loadUserNameMap(rows.flatMap((row: TeamLeadRow) => [row.assignedEmployeeId, row.createdByUserId, row.registeredUserId]));
    res.json(
      rows.map((row: TeamLeadRow) => ({
        ...row,
        lastContactAt: toIso(row.lastContactAt),
        nextFollowUpAt: toIso(row.nextFollowUpAt),
        createdAt: toIso(row.createdAt),
        assignedEmployeeName: row.assignedEmployeeId ? nameMap.get(row.assignedEmployeeId)?.name ?? null : null,
        createdByUserName: row.createdByUserId ? nameMap.get(row.createdByUserId)?.name ?? null : null,
        registeredUserName: row.registeredUserId ? nameMap.get(row.registeredUserId)?.name ?? null : null,
      })),
    );
  },
);

router.post(
  "/admin/employee/data-entry/leads",
  requireAuth,
  requireRolePermission("data_entry.leads.create", "هذه العملية متاحة لفريق إدخال البيانات فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const parsed = parseDataEntryLeadInput(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    if (parsed.data.assignedEmployeeId !== null) {
      const assignee = await ensureDataEntryAssignee(req.user, parsed.data.assignedEmployeeId);
      if (!assignee) {
        res.status(400).json({ error: "لا يمكن إسناد السجل إلى هذا الموظف" });
        return;
      }
    }

    const [created] = await db
      .insert(leadsTable)
      .values({
        type: parsed.data.type,
        name: parsed.data.name,
        contactPerson: parsed.data.contactPerson ?? null,
        phone: parsed.data.phone,
        email: parsed.data.email ?? null,
        area: parsed.data.area,
        address: parsed.data.address ?? null,
        carModel: parsed.data.carModel ?? null,
        carYear: parsed.data.carYear ?? null,
        source: "data_entry",
        status: "new",
        assignedEmployeeId: parsed.data.assignedEmployeeId ?? null,
        createdByUserId: employeeId,
        nextFollowUpAt: parsed.data.nextFollowUpAt ? new Date(parsed.data.nextFollowUpAt) : null,
        notes: parsed.data.notes ?? null,
      })
      .returning({
        id: leadsTable.id,
        name: leadsTable.name,
        type: leadsTable.type,
        assignedEmployeeId: leadsTable.assignedEmployeeId,
      });

    res.status(201).json(created);
  },
);

export default router;
