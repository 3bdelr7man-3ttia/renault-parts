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

type TechnicalCaseRow = {
  id: number;
  type: "customer" | "workshop";
  name: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  area?: string | null;
  source: string;
  status: string;
  technicalCategory?: string | null;
  technicalPriority?: string | null;
  technicalActionMode?: string | null;
  transferDecision?: string | null;
  knowledgeNotes?: string | null;
  notes?: string | null;
  nextFollowUpAt?: Date | string | null;
  createdAt?: Date | string | null;
  createdByUserId?: number | null;
  registeredUserId?: number | null;
  convertedOrderId?: number | null;
  convertedWorkshopId?: number | null;
};

type TechnicalSummaryCaseRow = {
  id: number;
  type: "customer" | "workshop";
  name: string;
  status: string;
  area?: string | null;
  nextFollowUpAt?: Date | string | null;
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
    | "technical_review"
    | "expert_opinion"
    | "parts_return_review"
    | "workshop_support"
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

type UpdateTechnicalCaseInput = {
  status: string;
  technicalCategory: string | null;
  technicalPriority: string;
  technicalActionMode: string;
  transferDecision: string | null;
  knowledgeNotes: string | null;
  notes: string | null;
  nextFollowUpAt: string | null;
};

type ReturnCaseRow = TechnicalCaseRow & {
  returnRequestType?: string | null;
  returnStatus?: string | null;
  returnReceiptStatus?: string | null;
  returnResolution?: string | null;
  returnPartName?: string | null;
  returnPackageName?: string | null;
  returnInspectionNotes?: string | null;
};

type UpdateReturnCaseInput = {
  status: string;
  technicalPriority: string;
  technicalActionMode: string;
  transferDecision: string | null;
  returnRequestType: string;
  returnStatus: string;
  returnReceiptStatus: string;
  returnResolution: string;
  returnPartName: string | null;
  returnPackageName: string | null;
  returnInspectionNotes: string | null;
  knowledgeNotes: string | null;
  notes: string | null;
  nextFollowUpAt: string | null;
};

const VALID_TASK_TYPES = [
  "call",
  "visit",
  "follow_up",
  "whatsapp",
  "meeting",
  "data_entry",
  "issue_resolution",
  "technical_review",
  "expert_opinion",
  "parts_return_review",
  "workshop_support",
  "quotation",
  "collection",
  "field_follow_up",
] as const;

const VALID_TASK_STATUSES = ["pending", "in_progress", "completed", "cancelled", "postponed"] as const;
const VALID_TECHNICAL_CASE_STATUSES = [
  "new",
  "attempted_contact",
  "contacted",
  "interested",
  "follow_up_later",
  "negotiation",
  "registered_on_platform",
  "converted_to_order",
  "converted_to_application",
  "closed",
] as const;
const VALID_TECHNICAL_CATEGORIES = [
  "engine",
  "electrical",
  "cooling",
  "suspension",
  "brakes",
  "transmission",
  "diagnostics",
  "parts_return",
  "warranty",
  "workshop_relation",
  "other",
] as const;
const VALID_TECHNICAL_PRIORITIES = ["low", "medium", "high", "critical"] as const;
const VALID_TECHNICAL_ACTION_MODES = ["contact_directly", "write_opinion_for_sales", "coordinate_with_workshop", "escalate_management"] as const;
const VALID_TRANSFER_DECISIONS = ["sales", "workshop", "management", "parts", "keep_with_technical"] as const;
const VALID_RETURN_REQUEST_TYPES = ["refund", "exchange", "technical_review", "wrong_part", "damaged_part"] as const;
const VALID_RETURN_STATUSES = [
  "reported",
  "awaiting_customer_handover",
  "scheduled_receipt",
  "received",
  "under_inspection",
  "awaiting_management_decision",
  "approved_exchange",
  "approved_refund",
  "rejected",
  "closed",
] as const;
const VALID_RETURN_RECEIPT_STATUSES = ["not_received", "scheduled_pickup", "received_at_workshop", "received_at_hub"] as const;
const VALID_RETURN_RESOLUTIONS = ["pending", "exchange", "refund", "reject", "technical_review", "need_more_info"] as const;

const SOURCE_LABELS: Record<string, string> = {
  sales_self: "جاءت من المبيعات",
  sales_visit: "جاءت من زيارة ميدانية",
  data_entry: "جاءت من إدخال البيانات",
  landing_page: "دخلت من المنصة مباشرة",
  manual: "أضيفت يدويًا",
  customer_comment: "جاءت من تعليق عميل",
  return_request: "جاءت من طلب مرتجع",
  workshop_referral: "جاءت من إحالة ورشة",
};

const TRANSFER_TARGET_CONFIG = {
  sales: {
    targetRole: "sales" as const,
    taskType: "follow_up" as const,
    titlePrefix: "استكمال متابعة مبيعات",
  },
  workshop: {
    targetRole: "sales" as const,
    taskType: "field_follow_up" as const,
    titlePrefix: "تنسيق إحالة إلى ورشة",
  },
  management: {
    targetRole: "manager" as const,
    taskType: "follow_up" as const,
    titlePrefix: "مراجعة إدارية من الخبير الفني",
  },
  parts: {
    targetRole: "data_entry" as const,
    taskType: "data_entry" as const,
    titlePrefix: "مراجعة قطع ومرتجعات",
  },
} satisfies Record<Exclude<(typeof VALID_TRANSFER_DECISIONS)[number], "keep_with_technical">, {
  targetRole: "sales" | "manager" | "data_entry";
  taskType: CreateSalesTaskInput["taskType"];
  titlePrefix: string;
}>;

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

function parseTechnicalCaseUpdateInput(body: unknown): ParsedResult<UpdateTechnicalCaseInput> {
  const payload = (body ?? {}) as Record<string, unknown>;
  const status = asNullableString(payload.status);
  const nextFollowUpAt = asNullableString(payload.nextFollowUpAt);
  const technicalCategory = asNullableString(payload.technicalCategory);
  const technicalPriority = asNullableString(payload.technicalPriority) ?? "medium";
  const technicalActionMode = asNullableString(payload.technicalActionMode) ?? "write_opinion_for_sales";
  const transferDecision = asNullableString(payload.transferDecision);

  if (!status || !VALID_TECHNICAL_CASE_STATUSES.includes(status as (typeof VALID_TECHNICAL_CASE_STATUSES)[number])) {
    return { success: false, error: "حالة الحالة الفنية غير صحيحة" };
  }

  if (technicalCategory && !VALID_TECHNICAL_CATEGORIES.includes(technicalCategory as (typeof VALID_TECHNICAL_CATEGORIES)[number])) {
    return { success: false, error: "التصنيف الفني غير صحيح" };
  }

  if (!VALID_TECHNICAL_PRIORITIES.includes(technicalPriority as (typeof VALID_TECHNICAL_PRIORITIES)[number])) {
    return { success: false, error: "أولوية الحالة غير صحيحة" };
  }

  if (!VALID_TECHNICAL_ACTION_MODES.includes(technicalActionMode as (typeof VALID_TECHNICAL_ACTION_MODES)[number])) {
    return { success: false, error: "أسلوب التعامل الفني غير صحيح" };
  }

  if (transferDecision && !VALID_TRANSFER_DECISIONS.includes(transferDecision as (typeof VALID_TRANSFER_DECISIONS)[number])) {
    return { success: false, error: "قرار التحويل غير صحيح" };
  }

  if (nextFollowUpAt && !isIsoDateTime(nextFollowUpAt)) {
    return { success: false, error: "موعد المتابعة غير صحيح" };
  }

  return {
    success: true,
    data: {
      status,
      technicalCategory,
      technicalPriority,
      technicalActionMode,
      transferDecision,
      knowledgeNotes: asNullableString(payload.knowledgeNotes),
      notes: asNullableString(payload.notes),
      nextFollowUpAt,
    },
  };
}

function parseReturnCaseUpdateInput(body: unknown): ParsedResult<UpdateReturnCaseInput> {
  const payload = (body ?? {}) as Record<string, unknown>;
  const status = asNullableString(payload.status);
  const technicalPriority = asNullableString(payload.technicalPriority) ?? "medium";
  const technicalActionMode = asNullableString(payload.technicalActionMode) ?? "write_opinion_for_sales";
  const transferDecision = asNullableString(payload.transferDecision);
  const returnRequestType = asNullableString(payload.returnRequestType) ?? "technical_review";
  const returnStatus = asNullableString(payload.returnStatus) ?? "reported";
  const returnReceiptStatus = asNullableString(payload.returnReceiptStatus) ?? "not_received";
  const returnResolution = asNullableString(payload.returnResolution) ?? "pending";
  const nextFollowUpAt = asNullableString(payload.nextFollowUpAt);

  if (!status || !VALID_TECHNICAL_CASE_STATUSES.includes(status as (typeof VALID_TECHNICAL_CASE_STATUSES)[number])) {
    return { success: false, error: "حالة المتابعة غير صحيحة" };
  }

  if (!VALID_TECHNICAL_PRIORITIES.includes(technicalPriority as (typeof VALID_TECHNICAL_PRIORITIES)[number])) {
    return { success: false, error: "أولوية المرتجع غير صحيحة" };
  }

  if (!VALID_TECHNICAL_ACTION_MODES.includes(technicalActionMode as (typeof VALID_TECHNICAL_ACTION_MODES)[number])) {
    return { success: false, error: "أسلوب التعامل الفني غير صحيح" };
  }

  if (transferDecision && !VALID_TRANSFER_DECISIONS.includes(transferDecision as (typeof VALID_TRANSFER_DECISIONS)[number])) {
    return { success: false, error: "قرار التحويل غير صحيح" };
  }

  if (!VALID_RETURN_REQUEST_TYPES.includes(returnRequestType as (typeof VALID_RETURN_REQUEST_TYPES)[number])) {
    return { success: false, error: "نوع طلب المرتجع غير صحيح" };
  }

  if (!VALID_RETURN_STATUSES.includes(returnStatus as (typeof VALID_RETURN_STATUSES)[number])) {
    return { success: false, error: "مرحلة المرتجع غير صحيحة" };
  }

  if (!VALID_RETURN_RECEIPT_STATUSES.includes(returnReceiptStatus as (typeof VALID_RETURN_RECEIPT_STATUSES)[number])) {
    return { success: false, error: "حالة الاستلام غير صحيحة" };
  }

  if (!VALID_RETURN_RESOLUTIONS.includes(returnResolution as (typeof VALID_RETURN_RESOLUTIONS)[number])) {
    return { success: false, error: "قرار المرتجع غير صحيح" };
  }

  if (nextFollowUpAt && !isIsoDateTime(nextFollowUpAt)) {
    return { success: false, error: "موعد المتابعة غير صحيح" };
  }

  return {
    success: true,
    data: {
      status,
      technicalPriority,
      technicalActionMode,
      transferDecision,
      returnRequestType,
      returnStatus,
      returnReceiptStatus,
      returnResolution,
      returnPartName: asNullableString(payload.returnPartName),
      returnPackageName: asNullableString(payload.returnPackageName),
      returnInspectionNotes: asNullableString(payload.returnInspectionNotes),
      knowledgeNotes: asNullableString(payload.knowledgeNotes),
      notes: asNullableString(payload.notes),
      nextFollowUpAt,
    },
  };
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

async function findEmployeeByEmployeeRole(employeeRole: "sales" | "manager" | "data_entry") {
  const [employee] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      role: usersTable.role,
      employeeRole: usersTable.employeeRole,
    })
    .from(usersTable)
    .where(and(eq(usersTable.role, "employee"), eq(usersTable.employeeRole, employeeRole)))
    .orderBy(asc(usersTable.id))
    .limit(1);

  return employee ?? null;
}

function getTechnicalCategoryFromTaskType(taskType: CreateManagedTaskInput["taskType"]): string {
  if (taskType === "parts_return_review") return "parts_return";
  if (taskType === "workshop_support") return "workshop_relation";
  if (taskType === "expert_opinion" || taskType === "technical_review") return "diagnostics";
  return "other";
}

async function syncLeadIntoTechnicalWorkflow(params: {
  leadId: number;
  employeeId: number;
  taskType: CreateManagedTaskInput["taskType"];
  dueAt: string;
  notes: string | null;
}) {
  const [lead] = await db
    .select({
      id: leadsTable.id,
      technicalCategory: leadsTable.technicalCategory,
      technicalPriority: leadsTable.technicalPriority,
      technicalActionMode: leadsTable.technicalActionMode,
      transferDecision: leadsTable.transferDecision,
      nextFollowUpAt: leadsTable.nextFollowUpAt,
      notes: leadsTable.notes,
    })
    .from(leadsTable)
    .where(eq(leadsTable.id, params.leadId));

  if (!lead) return null;

  const mergedNotes = [lead.notes, params.notes].filter(Boolean).join("\n\n");

  const [updated] = await db
    .update(leadsTable)
    .set({
      assignedEmployeeId: params.employeeId,
      technicalCategory: lead.technicalCategory ?? getTechnicalCategoryFromTaskType(params.taskType),
      technicalPriority: lead.technicalPriority ?? "medium",
      technicalActionMode: lead.technicalActionMode ?? "write_opinion_for_sales",
      transferDecision: lead.transferDecision ?? "keep_with_technical",
      nextFollowUpAt: lead.nextFollowUpAt ?? new Date(params.dueAt),
      notes: mergedNotes || null,
      updatedAt: new Date(),
    })
    .where(eq(leadsTable.id, params.leadId))
    .returning({
      id: leadsTable.id,
      technicalCategory: leadsTable.technicalCategory,
      technicalPriority: leadsTable.technicalPriority,
    });

  return updated ?? null;
}

async function maybeCreateTechnicalTransferTask(params: {
  actorId: number;
  leadId: number;
  leadName: string;
  leadType: string;
  leadArea: string | null;
  leadSource: string;
  decision: UpdateTechnicalCaseInput["transferDecision"];
  technicalCategory: string | null;
  technicalPriority: string;
  technicalActionMode: string;
  knowledgeNotes: string | null;
  notes: string | null;
  nextFollowUpAt: string | null;
  previousDecision: string | null | undefined;
}) {
  const decision = params.decision;
  if (!decision || decision === "keep_with_technical" || decision === params.previousDecision) {
    return null;
  }

  const targetConfig = TRANSFER_TARGET_CONFIG[decision];
  if (!targetConfig) {
    return null;
  }

  const assignee = await findEmployeeByEmployeeRole(targetConfig.targetRole);
  if (!assignee) {
    return {
      created: false as const,
      targetRole: targetConfig.targetRole,
      message: "تم حفظ قرار التحويل لكن لم يتم العثور على موظف مناسب لهذه الجهة.",
    };
  }

  const dueAt = params.nextFollowUpAt ? new Date(params.nextFollowUpAt) : new Date(Date.now() + 2 * 60 * 60 * 1000);
  const sourceLabel = SOURCE_LABELS[params.leadSource] ?? params.leadSource;
  const leadTypeLabel = params.leadType === "workshop" ? "ورشة" : "عميل";
  const categoryLabel = params.technicalCategory ?? "غير محدد";
  const priorityLabel = params.technicalPriority ?? "medium";
  const actionModeLabel =
    params.technicalActionMode === "contact_directly"
      ? "الخبير سيتواصل مباشرة"
      : params.technicalActionMode === "coordinate_with_workshop"
        ? "تنسيق مباشر مع ورشة"
        : params.technicalActionMode === "escalate_management"
          ? "تصعيد للإدارة"
          : "رأي فني للمبيعات";

  const [createdTask] = await db
    .insert(employeeTasksTable)
    .values({
      employeeId: assignee.id,
      leadId: params.leadId,
      title: `${targetConfig.titlePrefix}: ${params.leadName}`,
      taskType: targetConfig.taskType,
      area: params.leadArea ?? null,
      dueAt,
      status: "pending",
      notes: [
        `مصدر الحالة: ${sourceLabel}`,
        `نوع السجل: ${leadTypeLabel}`,
        `التصنيف الفني: ${categoryLabel}`,
        `الأولوية: ${priorityLabel}`,
        `أسلوب التعامل الفني: ${actionModeLabel}`,
        params.notes ? `ملاحظات الخبير الفني: ${params.notes}` : null,
        params.knowledgeNotes ? `سجل المعرفة الفنية: ${params.knowledgeNotes}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      createdByUserId: params.actorId,
    })
    .returning({
      id: employeeTasksTable.id,
      employeeId: employeeTasksTable.employeeId,
      title: employeeTasksTable.title,
    });

  return {
    created: true as const,
    taskId: createdTask.id,
    employeeId: assignee.id,
    employeeName: assignee.name,
    targetRole: targetConfig.targetRole,
    message: `تم إنشاء مهمة تلقائيًا وتحويلها إلى ${assignee.name}.`,
  };
}

async function maybeCreateReturnWorkflowTask(params: {
  actorId: number;
  leadId: number;
  leadName: string;
  leadArea: string | null;
  returnResolution: string;
  previousResolution: string | null | undefined;
  returnPartName: string | null;
  returnPackageName: string | null;
  notes: string | null;
  returnInspectionNotes: string | null;
}) {
  if (!params.returnResolution || params.returnResolution === params.previousResolution || params.returnResolution === "pending" || params.returnResolution === "technical_review") {
    return null;
  }

  const resolutionConfig = {
    exchange: {
      targetRole: "data_entry" as const,
      taskType: "data_entry" as const,
      title: `تجهيز استبدال قطعة للعميل ${params.leadName}`,
    },
    refund: {
      targetRole: "manager" as const,
      taskType: "collection" as const,
      title: `اعتماد رد مالي لمرتجع ${params.leadName}`,
    },
    reject: {
      targetRole: "sales" as const,
      taskType: "follow_up" as const,
      title: `إبلاغ العميل بقرار رفض المرتجع ${params.leadName}`,
    },
    need_more_info: {
      targetRole: "sales" as const,
      taskType: "follow_up" as const,
      title: `استكمال بيانات مرتجع ${params.leadName}`,
    },
  } as const;

  const config = resolutionConfig[params.returnResolution as keyof typeof resolutionConfig];
  if (!config) return null;

  const assignee = await findEmployeeByEmployeeRole(config.targetRole);
  if (!assignee) {
    return {
      created: false as const,
      message: "تم حفظ قرار المرتجع لكن لا يوجد موظف مناسب لتنفيذ الإجراء التالي.",
    };
  }

  const [task] = await db
    .insert(employeeTasksTable)
    .values({
      employeeId: assignee.id,
      leadId: params.leadId,
      title: config.title,
      taskType: config.taskType,
      area: params.leadArea,
      dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: "pending",
      notes: [
        params.returnPartName ? `القطعة: ${params.returnPartName}` : null,
        params.returnPackageName ? `الباكدج: ${params.returnPackageName}` : null,
        params.returnInspectionNotes ? `نتيجة الفحص: ${params.returnInspectionNotes}` : null,
        params.notes ? `ملاحظات إضافية: ${params.notes}` : null,
      ].filter(Boolean).join("\n"),
      createdByUserId: params.actorId,
    })
    .returning({ id: employeeTasksTable.id });

  return {
    created: true as const,
    taskId: task.id,
    employeeId: assignee.id,
    employeeName: assignee.name,
    message: `تم إنشاء مهمة تلقائيًا بسبب قرار المرتجع وتحويلها إلى ${assignee.name}.`,
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
  "/admin/employee/technical/summary",
  requireAuth,
  requireRolePermission("technical.dashboard.view", "هذه الصفحة متاحة للخبير الفني فقط"),
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

    const [totalCasesRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(eq(leadsTable.assignedEmployeeId, employeeId));

    const [customerCasesRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(and(eq(leadsTable.assignedEmployeeId, employeeId), eq(leadsTable.type, "customer")));

    const [workshopCasesRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(and(eq(leadsTable.assignedEmployeeId, employeeId), eq(leadsTable.type, "workshop")));

    const [dueTodayRow] = await db
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

    const [resolvedCasesRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(
        and(
          eq(leadsTable.assignedEmployeeId, employeeId),
          or(isNotNull(leadsTable.registeredUserId), isNotNull(leadsTable.convertedOrderId), isNotNull(leadsTable.convertedWorkshopId)),
        ),
      );

    const [returnsCasesRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(and(eq(leadsTable.assignedEmployeeId, employeeId), eq(leadsTable.technicalCategory, "parts_return")));

    const [activeTasksRow] = await db
      .select({ count: count() })
      .from(employeeTasksTable)
      .where(and(eq(employeeTasksTable.employeeId, employeeId), or(eq(employeeTasksTable.status, "pending"), eq(employeeTasksTable.status, "in_progress"))));

    const openCases = await db
      .select({
        id: leadsTable.id,
        type: leadsTable.type,
        name: leadsTable.name,
        status: leadsTable.status,
        area: leadsTable.area,
        nextFollowUpAt: leadsTable.nextFollowUpAt,
      })
      .from(leadsTable)
      .where(eq(leadsTable.assignedEmployeeId, employeeId))
      .orderBy(asc(leadsTable.nextFollowUpAt), desc(leadsTable.createdAt))
      .limit(5);

    res.json({
      totalCases: totalCasesRow.count,
      customerCases: customerCasesRow.count,
      workshopCases: workshopCasesRow.count,
      dueToday: dueTodayRow.count,
      resolvedCases: resolvedCasesRow.count,
      returnsCases: returnsCasesRow.count,
      activeTasks: activeTasksRow.count,
      openCases: openCases.map((item: TechnicalSummaryCaseRow) => ({
        ...item,
        nextFollowUpAt: toIso(item.nextFollowUpAt),
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
  "/admin/employee/technical/cases",
  requireAuth,
  requireRolePermission("technical.cases.view_own", "هذه الصفحة متاحة للخبير الفني فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
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
        source: leadsTable.source,
        status: leadsTable.status,
        technicalCategory: leadsTable.technicalCategory,
        technicalPriority: leadsTable.technicalPriority,
        technicalActionMode: leadsTable.technicalActionMode,
        transferDecision: leadsTable.transferDecision,
        knowledgeNotes: leadsTable.knowledgeNotes,
        notes: leadsTable.notes,
        nextFollowUpAt: leadsTable.nextFollowUpAt,
        createdAt: leadsTable.createdAt,
        createdByUserId: leadsTable.createdByUserId,
        registeredUserId: leadsTable.registeredUserId,
        convertedOrderId: leadsTable.convertedOrderId,
        convertedWorkshopId: leadsTable.convertedWorkshopId,
      })
      .from(leadsTable)
      .where(eq(leadsTable.assignedEmployeeId, employeeId))
      .orderBy(asc(leadsTable.nextFollowUpAt), desc(leadsTable.createdAt));

    const nameMap = await loadUserNameMap(rows.map((row: TechnicalCaseRow) => row.createdByUserId));

    res.json(
      rows.map((row: TechnicalCaseRow) => ({
        ...row,
        nextFollowUpAt: toIso(row.nextFollowUpAt),
        createdAt: toIso(row.createdAt),
        createdByUserName: row.createdByUserId ? nameMap.get(row.createdByUserId)?.name ?? null : null,
      })),
    );
  },
);

router.get(
  "/admin/employee/technical/returns",
  requireAuth,
  requireRolePermission("technical.cases.view_own", "هذه الصفحة متاحة للخبير الفني فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    if (!employeeId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
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
        source: leadsTable.source,
        status: leadsTable.status,
        technicalCategory: leadsTable.technicalCategory,
        technicalPriority: leadsTable.technicalPriority,
        technicalActionMode: leadsTable.technicalActionMode,
        transferDecision: leadsTable.transferDecision,
        knowledgeNotes: leadsTable.knowledgeNotes,
        notes: leadsTable.notes,
        nextFollowUpAt: leadsTable.nextFollowUpAt,
        createdAt: leadsTable.createdAt,
        createdByUserId: leadsTable.createdByUserId,
        registeredUserId: leadsTable.registeredUserId,
        convertedOrderId: leadsTable.convertedOrderId,
        convertedWorkshopId: leadsTable.convertedWorkshopId,
        returnRequestType: leadsTable.returnRequestType,
        returnStatus: leadsTable.returnStatus,
        returnReceiptStatus: leadsTable.returnReceiptStatus,
        returnResolution: leadsTable.returnResolution,
        returnPartName: leadsTable.returnPartName,
        returnPackageName: leadsTable.returnPackageName,
        returnInspectionNotes: leadsTable.returnInspectionNotes,
      })
      .from(leadsTable)
      .where(
        and(
          eq(leadsTable.assignedEmployeeId, employeeId),
          or(eq(leadsTable.technicalCategory, "parts_return"), eq(leadsTable.source, "return_request")),
        ),
      )
      .orderBy(asc(leadsTable.nextFollowUpAt), desc(leadsTable.createdAt));

    const nameMap = await loadUserNameMap(rows.map((row: ReturnCaseRow) => row.createdByUserId));

    res.json(
      rows.map((row: ReturnCaseRow) => ({
        ...row,
        nextFollowUpAt: toIso(row.nextFollowUpAt),
        createdAt: toIso(row.createdAt),
        createdByUserName: row.createdByUserId ? nameMap.get(row.createdByUserId)?.name ?? null : null,
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

    const updatePayload: Record<string, unknown> = {
      assignedEmployeeId: parsed.data.employeeId,
      updatedAt: new Date(),
    };

    if (parsed.data.employeeId !== null) {
      const assignee = await ensureAssignableEmployee(req.user, parsed.data.employeeId);
      if (!assignee) {
        res.status(400).json({ error: "لا يمكن الإسناد إلا لموظف صالح ضمن نطاقك الإداري" });
        return;
      }

      if (assignee.employeeRole === "technical_expert") {
        const [lead] = await db
          .select({
            id: leadsTable.id,
            technicalCategory: leadsTable.technicalCategory,
            technicalPriority: leadsTable.technicalPriority,
            technicalActionMode: leadsTable.technicalActionMode,
            transferDecision: leadsTable.transferDecision,
            nextFollowUpAt: leadsTable.nextFollowUpAt,
          })
          .from(leadsTable)
          .where(eq(leadsTable.id, leadId));

        if (lead) {
          updatePayload.technicalCategory = lead.technicalCategory ?? "diagnostics";
          updatePayload.technicalPriority = lead.technicalPriority ?? "medium";
          updatePayload.technicalActionMode = lead.technicalActionMode ?? "write_opinion_for_sales";
          updatePayload.transferDecision = lead.transferDecision ?? "keep_with_technical";
          updatePayload.nextFollowUpAt = lead.nextFollowUpAt ?? new Date(Date.now() + 4 * 60 * 60 * 1000);
        }
      }
    }

    const [updated] = await db
      .update(leadsTable)
      .set(updatePayload)
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

    const isTechnicalAssignee = assignee.employeeRole === "technical_expert";
    if (isTechnicalAssignee && !parsed.data.leadId) {
      res.status(400).json({ error: "مهمة الخبير الفني يجب أن ترتبط بعميل أو ورشة حتى تظهر كحالة فنية داخل مساحته." });
      return;
    }

    if (parsed.data.leadId) {
      const [lead] = await db.select({ id: leadsTable.id }).from(leadsTable).where(eq(leadsTable.id, parsed.data.leadId));
      if (!lead) {
        res.status(400).json({ error: "الفرصة المرتبطة غير موجودة" });
        return;
      }
    }

    let technicalCaseSync: { id: number; technicalCategory: string | null; technicalPriority: string | null } | null = null;
    if (isTechnicalAssignee && parsed.data.leadId) {
      technicalCaseSync = await syncLeadIntoTechnicalWorkflow({
        leadId: parsed.data.leadId,
        employeeId: parsed.data.employeeId,
        taskType: parsed.data.taskType,
        dueAt: parsed.data.dueAt,
        notes: parsed.data.notes ?? null,
      });
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

    res.status(201).json({
      ...created,
      technicalCaseSync: technicalCaseSync
        ? {
            leadId: technicalCaseSync.id,
            technicalCategory: technicalCaseSync.technicalCategory,
            technicalPriority: technicalCaseSync.technicalPriority,
            message: "تم إسناد الحالة للخبير الفني وظهرت أيضًا داخل مساحة الحالات الفنية.",
          }
        : null,
    });
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

router.patch(
  "/admin/employee/technical/cases/:id",
  requireAuth,
  requireRolePermission("technical.cases.update_own", "هذه العملية متاحة للخبير الفني فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    const caseId = Number(req.params.id);

    if (!employeeId || !Number.isInteger(caseId) || caseId <= 0) {
      res.status(400).json({ error: "الحالة المطلوبة غير صحيحة" });
      return;
    }

    const parsed = parseTechnicalCaseUpdateInput(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const [lead] = await db
      .select({
        id: leadsTable.id,
        name: leadsTable.name,
        type: leadsTable.type,
        area: leadsTable.area,
        source: leadsTable.source,
        transferDecision: leadsTable.transferDecision,
      })
      .from(leadsTable)
      .where(and(eq(leadsTable.id, caseId), eq(leadsTable.assignedEmployeeId, employeeId)));

    if (!lead) {
      res.status(404).json({ error: "الحالة غير موجودة ضمن نطاقك الحالي" });
      return;
    }

    const [updated] = await db
      .update(leadsTable)
      .set({
        status: parsed.data.status,
        technicalCategory: parsed.data.technicalCategory,
        technicalPriority: parsed.data.technicalPriority,
        technicalActionMode: parsed.data.technicalActionMode,
        transferDecision: parsed.data.transferDecision,
        knowledgeNotes: parsed.data.knowledgeNotes,
        notes: parsed.data.notes,
        nextFollowUpAt: parsed.data.nextFollowUpAt ? new Date(parsed.data.nextFollowUpAt) : null,
        lastContactAt: new Date(),
      })
      .where(eq(leadsTable.id, caseId))
      .returning({
        id: leadsTable.id,
        type: leadsTable.type,
        name: leadsTable.name,
        status: leadsTable.status,
        technicalCategory: leadsTable.technicalCategory,
        technicalPriority: leadsTable.technicalPriority,
        technicalActionMode: leadsTable.technicalActionMode,
        transferDecision: leadsTable.transferDecision,
        knowledgeNotes: leadsTable.knowledgeNotes,
        notes: leadsTable.notes,
        nextFollowUpAt: leadsTable.nextFollowUpAt,
      });

    const transferAction = await maybeCreateTechnicalTransferTask({
      actorId: employeeId,
      leadId: lead.id,
      leadName: lead.name,
      leadType: lead.type,
      leadArea: lead.area ?? null,
      leadSource: lead.source,
      decision: parsed.data.transferDecision,
      technicalCategory: parsed.data.technicalCategory,
      technicalPriority: parsed.data.technicalPriority,
      technicalActionMode: parsed.data.technicalActionMode,
      knowledgeNotes: parsed.data.knowledgeNotes,
      notes: parsed.data.notes,
      nextFollowUpAt: parsed.data.nextFollowUpAt,
      previousDecision: lead.transferDecision,
    });

    res.json({
      ...updated,
      nextFollowUpAt: toIso(updated?.nextFollowUpAt),
      transferAction,
    });
  },
);

router.patch(
  "/admin/employee/technical/returns/:id",
  requireAuth,
  requireRolePermission("technical.cases.update_own", "هذه العملية متاحة للخبير الفني فقط"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const employeeId = getScopedEmployeeId(req);
    const caseId = Number(req.params.id);

    if (!employeeId || !Number.isInteger(caseId) || caseId <= 0) {
      res.status(400).json({ error: "المرتجع المطلوب غير صحيح" });
      return;
    }

    const parsed = parseReturnCaseUpdateInput(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const [lead] = await db
      .select({
        id: leadsTable.id,
        name: leadsTable.name,
        area: leadsTable.area,
        source: leadsTable.source,
        transferDecision: leadsTable.transferDecision,
        returnResolution: leadsTable.returnResolution,
      })
      .from(leadsTable)
      .where(
        and(
          eq(leadsTable.id, caseId),
          eq(leadsTable.assignedEmployeeId, employeeId),
          or(eq(leadsTable.technicalCategory, "parts_return"), eq(leadsTable.source, "return_request")),
        ),
      );

    if (!lead) {
      res.status(404).json({ error: "المرتجع غير موجود ضمن نطاقك الحالي" });
      return;
    }

    const [updated] = await db
      .update(leadsTable)
      .set({
        status: parsed.data.status,
        technicalCategory: "parts_return",
        technicalPriority: parsed.data.technicalPriority,
        technicalActionMode: parsed.data.technicalActionMode,
        transferDecision: parsed.data.transferDecision,
        returnRequestType: parsed.data.returnRequestType,
        returnStatus: parsed.data.returnStatus,
        returnReceiptStatus: parsed.data.returnReceiptStatus,
        returnResolution: parsed.data.returnResolution,
        returnPartName: parsed.data.returnPartName,
        returnPackageName: parsed.data.returnPackageName,
        returnInspectionNotes: parsed.data.returnInspectionNotes,
        knowledgeNotes: parsed.data.knowledgeNotes,
        notes: parsed.data.notes,
        nextFollowUpAt: parsed.data.nextFollowUpAt ? new Date(parsed.data.nextFollowUpAt) : null,
        lastContactAt: new Date(),
      })
      .where(eq(leadsTable.id, caseId))
      .returning({
        id: leadsTable.id,
        status: leadsTable.status,
        technicalPriority: leadsTable.technicalPriority,
        technicalActionMode: leadsTable.technicalActionMode,
        transferDecision: leadsTable.transferDecision,
        returnRequestType: leadsTable.returnRequestType,
        returnStatus: leadsTable.returnStatus,
        returnReceiptStatus: leadsTable.returnReceiptStatus,
        returnResolution: leadsTable.returnResolution,
        returnPartName: leadsTable.returnPartName,
        returnPackageName: leadsTable.returnPackageName,
        returnInspectionNotes: leadsTable.returnInspectionNotes,
        knowledgeNotes: leadsTable.knowledgeNotes,
        notes: leadsTable.notes,
        nextFollowUpAt: leadsTable.nextFollowUpAt,
      });

    const transferAction = await maybeCreateTechnicalTransferTask({
      actorId: employeeId,
      leadId: lead.id,
      leadName: lead.name,
      leadType: "customer",
      leadArea: lead.area ?? null,
      leadSource: lead.source,
      decision: parsed.data.transferDecision,
      technicalCategory: "parts_return",
      technicalPriority: parsed.data.technicalPriority,
      technicalActionMode: parsed.data.technicalActionMode,
      knowledgeNotes: parsed.data.knowledgeNotes,
      notes: parsed.data.notes,
      nextFollowUpAt: parsed.data.nextFollowUpAt,
      previousDecision: lead.transferDecision,
    });

    const returnAction = await maybeCreateReturnWorkflowTask({
      actorId: employeeId,
      leadId: lead.id,
      leadName: lead.name,
      leadArea: lead.area ?? null,
      returnResolution: parsed.data.returnResolution,
      previousResolution: lead.returnResolution,
      returnPartName: parsed.data.returnPartName,
      returnPackageName: parsed.data.returnPackageName,
      notes: parsed.data.notes,
      returnInspectionNotes: parsed.data.returnInspectionNotes,
    });

    res.json({
      ...updated,
      nextFollowUpAt: toIso(updated?.nextFollowUpAt),
      transferAction,
      returnAction,
    });
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
