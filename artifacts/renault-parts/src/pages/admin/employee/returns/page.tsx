import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { adminSemantic, adminUi } from "@/components/admin/admin-ui";
import { ArrowRightLeft, ClipboardCheck, Loader2, Package2, Plus, RefreshCcw, Save, Search, ShieldAlert, WalletCards, Wrench } from "lucide-react";

type ReturnCase = {
  id: number;
  type: "customer" | "workshop";
  name: string;
  phone: string;
  email?: string | null;
  area?: string | null;
  source: string;
  status: string;
  technicalPriority?: string | null;
  technicalActionMode?: string | null;
  transferDecision?: string | null;
  knowledgeNotes?: string | null;
  notes?: string | null;
  nextFollowUpAt?: string | null;
  createdAt?: string | null;
  createdByUserName?: string | null;
  returnRequestType?: string | null;
  returnStatus?: string | null;
  returnReceiptStatus?: string | null;
  returnResolution?: string | null;
  returnPartName?: string | null;
  returnPackageName?: string | null;
  returnInspectionNotes?: string | null;
};

type DraftState = {
  status: string;
  technicalPriority: string;
  technicalActionMode: string;
  transferDecision: string;
  returnRequestType: string;
  returnStatus: string;
  returnReceiptStatus: string;
  returnResolution: string;
  returnPartName: string;
  returnPackageName: string;
  returnInspectionNotes: string;
  knowledgeNotes: string;
  notes: string;
  nextFollowUpAt: string;
};

type CreateReturnState = {
  type: "customer" | "workshop";
  name: string;
  phone: string;
  email: string;
  area: string;
  source: string;
  technicalPriority: string;
  technicalActionMode: string;
  returnRequestType: string;
  returnPartName: string;
  returnPackageName: string;
  convertedOrderId: string;
  registeredUserId: string;
  notes: string;
  nextFollowUpAt: string;
};

type ReturnLookupResult = {
  id: string;
  sourceType: "existing_order" | "existing_lead";
  type: "customer" | "workshop";
  name: string;
  phone: string;
  email?: string | null;
  area?: string | null;
  registeredUserId?: number | null;
  convertedOrderId?: number | null;
  returnPackageName?: string | null;
  label: string;
};

type ReturnOrderContext = {
  orderId: number;
  status: string;
  total: number;
  createdAt?: string | null;
  customer: {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
    area?: string | null;
  };
  package: {
    id: number;
    name: string;
  };
  parts: Array<{
    id: number;
    name: string;
    type?: string | null;
  }>;
};

const sourceLabels: Record<string, string> = {
  sales_self: "جاءت من المبيعات",
  sales_visit: "جاءت من زيارة ميدانية",
  data_entry: "جاءت من إدخال البيانات",
  landing_page: "دخلت من المنصة مباشرة",
  manual: "أضيفت يدويًا",
  customer_comment: "جاءت من تعليق عميل",
  return_request: "جاءت من طلب مرتجع",
  workshop_referral: "جاءت من إحالة ورشة",
};

const returnCreateSourceOptions = [
  { value: "return_request", label: "بلاغ مرتجع مباشر" },
  { value: "customer_comment", label: "شكوى أو تعليق عميل" },
  { value: "sales_self", label: "جاءت من المبيعات" },
  { value: "data_entry", label: "جاءت من إدخال البيانات" },
  { value: "workshop_referral", label: "إحالة من ورشة" },
  { value: "manual", label: "إدخال يدوي" },
] as const;

const priorityOptions = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "مرتفعة" },
  { value: "critical", label: "حرجة" },
] as const;

const technicalActionModeOptions = [
  { value: "contact_directly", label: "الخبير يتواصل مباشرة" },
  { value: "write_opinion_for_sales", label: "يكتب رأيًا للمبيعات" },
  { value: "coordinate_with_workshop", label: "ينسق مع الورشة" },
  { value: "escalate_management", label: "يرفعها للإدارة" },
] as const;

const transferDecisionOptions = [
  { value: "keep_with_technical", label: "تبقى مع الخبير الفني" },
  { value: "sales", label: "تحويل إلى المبيعات" },
  { value: "workshop", label: "تحويل إلى ورشة" },
  { value: "management", label: "رفع للإدارة" },
  { value: "parts", label: "رفع لمسؤول القطع" },
] as const;

const returnRequestTypeOptions = [
  { value: "refund", label: "طلب رد مالي" },
  { value: "exchange", label: "طلب استبدال" },
  { value: "technical_review", label: "مراجعة فنية" },
  { value: "wrong_part", label: "قطعة غير مطابقة" },
  { value: "damaged_part", label: "قطعة تالفة" },
] as const;

const returnStatusOptions = [
  { value: "reported", label: "تم التبليغ" },
  { value: "awaiting_customer_handover", label: "بانتظار تسليم العميل" },
  { value: "scheduled_receipt", label: "تم ترتيب الاستلام" },
  { value: "received", label: "تم الاستلام" },
  { value: "under_inspection", label: "تحت الفحص" },
  { value: "awaiting_management_decision", label: "بانتظار قرار إداري" },
  { value: "approved_exchange", label: "اعتماد الاستبدال" },
  { value: "approved_refund", label: "اعتماد الرد المالي" },
  { value: "rejected", label: "مرفوض" },
  { value: "closed", label: "أغلق" },
] as const;

const returnReceiptStatusOptions = [
  { value: "not_received", label: "لم يُستلم بعد" },
  { value: "scheduled_pickup", label: "مجدول للاستلام" },
  { value: "received_at_workshop", label: "استلمت في الورشة" },
  { value: "received_at_hub", label: "استلمت في المخزن/النقطة" },
] as const;

const returnResolutionOptions = [
  { value: "pending", label: "بانتظار القرار" },
  { value: "exchange", label: "استبدال" },
  { value: "refund", label: "رد مالي" },
  { value: "reject", label: "رفض المرتجع" },
  { value: "technical_review", label: "استكمال مراجعة فنية" },
  { value: "need_more_info", label: "يحتاج بيانات إضافية" },
] as const;

const priorityLabels = Object.fromEntries(priorityOptions.map((item) => [item.value, item.label])) as Record<string, string>;
const actionModeLabels = Object.fromEntries(technicalActionModeOptions.map((item) => [item.value, item.label])) as Record<string, string>;
const decisionLabels = Object.fromEntries(transferDecisionOptions.map((item) => [item.value, item.label])) as Record<string, string>;
const requestTypeLabels = Object.fromEntries(returnRequestTypeOptions.map((item) => [item.value, item.label])) as Record<string, string>;
const returnStatusLabels = Object.fromEntries(returnStatusOptions.map((item) => [item.value, item.label])) as Record<string, string>;
const receiptStatusLabels = Object.fromEntries(returnReceiptStatusOptions.map((item) => [item.value, item.label])) as Record<string, string>;
const resolutionLabels = Object.fromEntries(returnResolutionOptions.map((item) => [item.value, item.label])) as Record<string, string>;

const emptyDraft = (): DraftState => ({
  status: "new",
  technicalPriority: "medium",
  technicalActionMode: "write_opinion_for_sales",
  transferDecision: "keep_with_technical",
  returnRequestType: "technical_review",
  returnStatus: "reported",
  returnReceiptStatus: "not_received",
  returnResolution: "pending",
  returnPartName: "",
  returnPackageName: "",
  returnInspectionNotes: "",
  knowledgeNotes: "",
  notes: "",
  nextFollowUpAt: "",
});

const emptyCreateReturn = (): CreateReturnState => ({
  type: "customer",
  name: "",
  phone: "",
  email: "",
  area: "",
  source: "return_request",
  technicalPriority: "medium",
  technicalActionMode: "write_opinion_for_sales",
  returnRequestType: "technical_review",
  returnPartName: "",
  returnPackageName: "",
  convertedOrderId: "",
  registeredUserId: "",
  notes: "",
  nextFollowUpAt: "",
});

export default function EmployeeReturnsPage() {
  const { token, hasPermission } = useAuth();
  const { toast } = useToast();
  const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";

  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<number | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [cases, setCases] = React.useState<ReturnCase[]>([]);
  const [drafts, setDrafts] = React.useState<Record<number, DraftState>>({});
  const [createForm, setCreateForm] = React.useState<CreateReturnState>(emptyCreateReturn());
  const [lookupQuery, setLookupQuery] = React.useState("");
  const [lookupLoading, setLookupLoading] = React.useState(false);
  const [lookupResults, setLookupResults] = React.useState<ReturnLookupResult[]>([]);
  const [orderContextLoading, setOrderContextLoading] = React.useState(false);
  const [orderContext, setOrderContext] = React.useState<ReturnOrderContext | null>(null);

  const loadCases = React.useCallback(async () => {
    if (!token) {
      setCases([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${base}/api/admin/employee/technical/returns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "تعذر تحميل المرتجعات الآن.");
      }

      const rows = Array.isArray(result) ? result : [];
      setCases(rows);
      setDrafts(
        rows.reduce<Record<number, DraftState>>((acc, item) => {
          acc[item.id] = {
            status: item.status ?? "new",
            technicalPriority: item.technicalPriority ?? "medium",
            technicalActionMode: item.technicalActionMode ?? "write_opinion_for_sales",
            transferDecision: item.transferDecision ?? "keep_with_technical",
            returnRequestType: item.returnRequestType ?? "technical_review",
            returnStatus: item.returnStatus ?? "reported",
            returnReceiptStatus: item.returnReceiptStatus ?? "not_received",
            returnResolution: item.returnResolution ?? "pending",
            returnPartName: item.returnPartName ?? "",
            returnPackageName: item.returnPackageName ?? "",
            returnInspectionNotes: item.returnInspectionNotes ?? "",
            knowledgeNotes: item.knowledgeNotes ?? "",
            notes: item.notes ?? "",
            nextFollowUpAt: item.nextFollowUpAt ? new Date(item.nextFollowUpAt).toISOString().slice(0, 16) : "",
          };
          return acc;
        }, {}),
      );
    } catch (error) {
      setCases([]);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "تعذر تحميل المرتجعات الآن.",
      });
    } finally {
      setLoading(false);
    }
  }, [base, toast, token]);

  React.useEffect(() => {
    loadCases();
  }, [loadCases]);

  React.useEffect(() => {
    if (!createOpen || !token) {
      setLookupResults([]);
      setLookupLoading(false);
      return;
    }

    const query = lookupQuery.trim();
    if (query.length < 2) {
      setLookupResults([]);
      setLookupLoading(false);
      return;
    }

    let cancelled = false;
    setLookupLoading(true);

    fetch(`${base}/api/admin/employee/technical/returns/lookups?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(result?.error || "تعذر البحث عن العميل أو الطلب الآن.");
        }
        if (!cancelled) {
          setLookupResults(Array.isArray(result) ? result : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLookupResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLookupLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [base, createOpen, lookupQuery, token]);

  React.useEffect(() => {
    if (!createOpen || !token || !createForm.convertedOrderId) {
      setOrderContext(null);
      setOrderContextLoading(false);
      return;
    }

    let cancelled = false;
    setOrderContextLoading(true);

    fetch(`${base}/api/admin/employee/technical/returns/orders/${createForm.convertedOrderId}/context`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(result?.error || "تعذر تحميل تفاصيل الطلب المرتبط.");
        }
        if (!cancelled) {
          setOrderContext(result);
          setCreateForm((current) => ({
            ...current,
            returnPackageName: result?.package?.name ?? current.returnPackageName,
            registeredUserId: result?.customer?.id ? String(result.customer.id) : current.registeredUserId,
          }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrderContext(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setOrderContextLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [base, createForm.convertedOrderId, createOpen, token]);

  const updateDraft = (caseId: number, patch: Partial<DraftState>) => {
    setDrafts((current) => ({
      ...current,
      [caseId]: {
        ...(current[caseId] ?? emptyDraft()),
        ...patch,
      },
    }));
  };

  const updateCreateForm = (patch: Partial<CreateReturnState>) => {
    setCreateForm((current) => ({ ...current, ...patch }));
  };

  const selectLookupResult = (result: ReturnLookupResult) => {
    setLookupQuery(result.label);
    setLookupResults([]);
    setCreateForm((current) => ({
      ...current,
      type: result.type,
      name: result.name,
      phone: result.phone,
      email: result.email ?? "",
      area: result.area ?? "",
      convertedOrderId: result.convertedOrderId ? String(result.convertedOrderId) : current.convertedOrderId,
      registeredUserId: result.registeredUserId ? String(result.registeredUserId) : "",
      returnPackageName: result.returnPackageName ?? current.returnPackageName,
    }));
  };

  const handleCreateReturn = async () => {
    if (!token) return;

    setCreating(true);
    try {
      const response = await fetch(`${base}/api/admin/employee/technical/returns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: createForm.type,
          name: createForm.name,
          phone: createForm.phone,
          email: createForm.email || null,
          area: createForm.area || null,
          source: createForm.source,
          technicalPriority: createForm.technicalPriority,
          technicalActionMode: createForm.technicalActionMode,
          returnRequestType: createForm.returnRequestType,
          returnPartName: createForm.returnPartName || null,
          returnPackageName: createForm.returnPackageName || null,
          convertedOrderId: createForm.convertedOrderId || null,
          registeredUserId: createForm.registeredUserId || null,
          notes: createForm.notes || null,
          nextFollowUpAt: createForm.nextFollowUpAt ? new Date(createForm.nextFollowUpAt).toISOString() : null,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "تعذر إنشاء المرتجع الآن.");
      }

      toast({
        title: "تم إنشاء المرتجع",
        description: result?.message || "تم تسجيل المرتجع وفتحه داخل المسار الفني.",
      });
      setCreateForm(emptyCreateReturn());
      setLookupQuery("");
      setLookupResults([]);
      setOrderContext(null);
      setCreateOpen(false);
      await loadCases();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "تعذر إنشاء المرتجع الآن.",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async (caseId: number) => {
    if (!token) return;
    const draft = drafts[caseId];
    if (!draft) return;

    setSavingId(caseId);
    try {
      const response = await fetch(`${base}/api/admin/employee/technical/returns/${caseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: draft.status,
          technicalPriority: draft.technicalPriority,
          technicalActionMode: draft.technicalActionMode,
          transferDecision: draft.transferDecision || null,
          returnRequestType: draft.returnRequestType,
          returnStatus: draft.returnStatus,
          returnReceiptStatus: draft.returnReceiptStatus,
          returnResolution: draft.returnResolution,
          returnPartName: draft.returnPartName || null,
          returnPackageName: draft.returnPackageName || null,
          returnInspectionNotes: draft.returnInspectionNotes || null,
          knowledgeNotes: draft.knowledgeNotes || null,
          notes: draft.notes || null,
          nextFollowUpAt: draft.nextFollowUpAt ? new Date(draft.nextFollowUpAt).toISOString() : null,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "فشل تحديث المرتجع");
      }

      toast({
        title: "تم الحفظ",
        description: result?.returnAction?.message || result?.transferAction?.message || "تم تحديث حالة المرتجع بنجاح.",
      });
      await loadCases();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل تحديث المرتجع",
      });
    } finally {
      setSavingId(null);
    }
  };

  const totalReturns = cases.length;
  const awaitingReceipt = cases.filter((item) => ["awaiting_customer_handover", "scheduled_receipt"].includes(item.returnStatus ?? "reported")).length;
  const underInspection = cases.filter((item) => item.returnStatus === "under_inspection").length;
  const awaitingDecision = cases.filter((item) => item.returnStatus === "awaiting_management_decision" || item.returnResolution === "pending").length;
  const resolved = cases.filter((item) => ["approved_exchange", "approved_refund", "rejected", "closed"].includes(item.returnStatus ?? "")).length;

  return (
    <div className={adminUi.page}>
      <div className={adminUi.hero}>
        <div className={adminUi.toolbar}>
          <div>
            <p className="mb-2 text-sm font-black text-[#C8974A]">المرتجعات</p>
            <h1 className={adminUi.title}>مسار إدارة المرتجع</h1>
            <p className={`${adminUi.subtitle} max-w-4xl`}>
              هنا يتحول المرتجع من مجرد شكوى إلى Workflow واضح: بلاغ، استلام، فحص، قرار استبدال أو رد مالي أو رفض، ثم تحويل الإجراء التالي للجهة المناسبة.
            </p>
          </div>
          {hasPermission("returns.create") ? (
            <button
              onClick={() => setCreateOpen((current) => !current)}
              className={adminUi.primaryButton}
            >
              <Plus className="h-4 w-4" />
              {createOpen ? "إخفاء نموذج المرتجع" : "إضافة مرتجع"}
            </button>
          ) : null}
        </div>
      </div>

      {createOpen ? (
        <div className={`${adminUi.card} space-y-5`}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C8974A]/10 text-[#9a6e2e]">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">تسجيل مرتجع جديد</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                افتح المرتجع مرة واحدة من هنا، واربطه بالطلب أو القطعة أو الباكدج ثم أدخله في المسار الفني والتشغيلي الصحيح.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">ابحث عن عميل أو طلب أو ورشة موجودة</label>
              <div className="relative">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className={`${adminUi.input} pr-11`}
                  placeholder="اكتب الاسم أو الهاتف أو الإيميل أو رقم الطلب"
                />
              </div>
              <p className="mt-2 text-xs font-medium leading-6 text-slate-500">
                عند اختيار عميل أو طلب موجود سيتم تعبئة البيانات الأساسية تلقائيًا وربط المرتجع به قدر الإمكان.
              </p>
            </div>

            {lookupLoading ? (
              <div className={`${adminUi.subtleCard} flex items-center gap-2 text-sm font-medium text-slate-600`}>
                <Loader2 className="h-4 w-4 animate-spin text-[#C8974A]" />
                جارٍ البحث في العملاء والطلبات الحالية...
              </div>
            ) : lookupResults.length ? (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                {lookupResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => selectLookupResult(result)}
                    className="w-full border-b border-slate-100 px-4 py-3 text-right transition last:border-b-0 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{result.label}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {result.type === "workshop" ? "ورشة" : "عميل"} {result.phone ? `· ${result.phone}` : ""} {result.area ? `· ${result.area}` : ""}
                        </p>
                      </div>
                      <span className={`${adminUi.badgeBase} ${adminSemantic.brand}`}>
                        {result.sourceType === "existing_order" ? "طلب سابق" : "بيانات موجودة"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : lookupQuery.trim().length >= 2 ? (
              <div className={`${adminUi.emptyState} px-4 py-6 text-sm font-medium text-slate-500`}>
                لا توجد نتيجة مطابقة الآن. يمكنك إدخال المرتجع يدويًا إذا كانت الحالة جديدة.
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">نوع الجهة</label>
              <select value={createForm.type} onChange={(e) => updateCreateForm({ type: e.target.value as "customer" | "workshop" })} className={adminUi.select}>
                <option value="customer">عميل</option>
                <option value="workshop">ورشة</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">الاسم</label>
              <input value={createForm.name} onChange={(e) => updateCreateForm({ name: e.target.value })} className={adminUi.input} placeholder="اسم العميل أو الورشة" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">الهاتف</label>
              <input value={createForm.phone} onChange={(e) => updateCreateForm({ phone: e.target.value })} className={adminUi.input} placeholder="رقم الهاتف" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">الإيميل</label>
              <input value={createForm.email} onChange={(e) => updateCreateForm({ email: e.target.value })} className={adminUi.input} placeholder="اختياري" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">المنطقة</label>
              <input value={createForm.area} onChange={(e) => updateCreateForm({ area: e.target.value })} className={adminUi.input} placeholder="اختياري" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">مصدر المرتجع</label>
              <select value={createForm.source} onChange={(e) => updateCreateForm({ source: e.target.value })} className={adminUi.select}>
                {returnCreateSourceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">رقم الطلب المرتبط</label>
              <input value={createForm.convertedOrderId} onChange={(e) => updateCreateForm({ convertedOrderId: e.target.value })} className={adminUi.input} placeholder="مثال: 1024" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">نوع طلب المرتجع</label>
              <select value={createForm.returnRequestType} onChange={(e) => updateCreateForm({ returnRequestType: e.target.value })} className={adminUi.select}>
                {returnRequestTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">أولوية الحالة</label>
              <select value={createForm.technicalPriority} onChange={(e) => updateCreateForm({ technicalPriority: e.target.value })} className={adminUi.select}>
                {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">أسلوب التعامل الفني</label>
              <select value={createForm.technicalActionMode} onChange={(e) => updateCreateForm({ technicalActionMode: e.target.value })} className={adminUi.select}>
                {technicalActionModeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">اسم القطعة</label>
              {orderContext?.parts?.length ? (
                <select value={createForm.returnPartName} onChange={(e) => updateCreateForm({ returnPartName: e.target.value })} className={adminUi.select}>
                  <option value="">اختر قطعة من الطلب</option>
                  {orderContext.parts.map((part) => (
                    <option key={part.id} value={part.name}>
                      {part.name}{part.type ? ` · ${part.type}` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={createForm.returnPartName} onChange={(e) => updateCreateForm({ returnPartName: e.target.value })} className={adminUi.input} placeholder="مثال: فلتر زيت" />
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">الباكدج المرتبط</label>
              <input value={createForm.returnPackageName} onChange={(e) => updateCreateForm({ returnPackageName: e.target.value })} className={adminUi.input} placeholder="مثال: باكدج 20 ألف" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">موعد المتابعة القادم</label>
              <input type="datetime-local" value={createForm.nextFollowUpAt} onChange={(e) => updateCreateForm({ nextFollowUpAt: e.target.value })} className={adminUi.input} />
            </div>
            <div className="md:col-span-2 xl:col-span-4">
              <label className="mb-2 block text-xs font-black text-slate-500">تفاصيل البلاغ</label>
              <textarea value={createForm.notes} onChange={(e) => updateCreateForm({ notes: e.target.value })} className={`${adminUi.textarea} min-h-[110px] resize-none`} placeholder="ما المشكلة؟ هل القطعة غير مطابقة؟ هل هناك طلب استبدال أو فحص أو رد مالي؟" />
            </div>
          </div>

          {orderContextLoading ? (
            <div className={`${adminUi.subtleCard} flex items-center gap-2 text-sm font-medium text-slate-600`}>
              <Loader2 className="h-4 w-4 animate-spin text-[#C8974A]" />
              جارٍ تحميل تفاصيل الطلب والباكدج المرتبط...
            </div>
          ) : orderContext ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`${adminUi.badgeBase} ${adminSemantic.brand}`}>طلب #{orderContext.orderId}</span>
                <span className={`${adminUi.badgeBase} ${adminSemantic.neutral}`}>{orderContext.package.name}</span>
                <span className={`${adminUi.badgeBase} ${adminSemantic.neutral}`}>{orderContext.total.toLocaleString("ar-EG")} ج.م</span>
              </div>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                هذا المرتجع مرتبط بطلب قائم للعميل <span className="font-bold text-slate-900">{orderContext.customer.name}</span>، ويمكنك اختيار القطعة من الباكدج الفعلي بدل إدخالها يدويًا.
              </p>
              {orderContext.parts.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {orderContext.parts.map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => updateCreateForm({ returnPartName: part.name })}
                      className={`${adminUi.badgeBase} ${createForm.returnPartName === part.name ? adminSemantic.brand : adminSemantic.neutral}`}
                    >
                      {part.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs font-medium text-slate-500">لا توجد قطع مرتبطة بالباكدج لهذا الطلب داخل البيانات الحالية.</p>
              )}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-3xl text-xs font-medium leading-6 text-slate-500">
              المرتجع يُسجل هنا كمصدر واحد للحقيقة، ثم يمكن لاحقًا فتح نفس النموذج من الطلبات أو المبيعات بشكل تلقائي التعبئة، مع ربط أوضح بالطلب والباكدج والقطع.
            </p>
            <button onClick={handleCreateReturn} disabled={creating} className={adminUi.primaryButton}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {creating ? "جارٍ إنشاء المرتجع..." : "حفظ المرتجع"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { icon: ArrowRightLeft, label: "إجمالي المرتجعات", value: totalReturns, tone: adminSemantic.brand },
          { icon: Package2, label: "بانتظار الاستلام", value: awaitingReceipt, tone: adminSemantic.warning },
          { icon: Wrench, label: "تحت الفحص", value: underInspection, tone: adminSemantic.info },
          { icon: ShieldAlert, label: "بانتظار القرار", value: awaitingDecision, tone: adminSemantic.danger },
          { icon: WalletCards, label: "محسومة", value: resolved, tone: adminSemantic.success },
        ].map((card) => (
          <div key={card.label} className={adminUi.statCard}>
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border ${card.tone}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mb-1 text-xs font-black text-slate-500">{card.label}</p>
            <p className="text-2xl font-black text-slate-950">{card.value}</p>
          </div>
        ))}
      </div>

      <div className={adminUi.card}>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#C8974A]" />
          </div>
        ) : totalReturns === 0 ? (
          <div className={adminUi.emptyState}>
            <ArrowRightLeft className="mx-auto mb-4 h-9 w-9 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">لا توجد مرتجعات مسندة لهذا الحساب الآن.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {cases.map((item) => {
              const draft = drafts[item.id] ?? emptyDraft();
              return (
                <div key={item.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-black text-slate-950">{item.name}</h2>
                          <span className={`${adminUi.badgeBase} ${adminSemantic.brand}`}>
                            {requestTypeLabels[draft.returnRequestType] ?? "مرتجع"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                          {item.area ?? "بدون منطقة"} · {item.phone} {item.email ? `· ${item.email}` : ""}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">مصدر البلاغ: {sourceLabels[item.source] ?? item.source}</p>
                        {item.createdByUserName ? <p className="mt-1 text-xs font-medium text-slate-500">أُنشئت بواسطة: {item.createdByUserName}</p> : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`${adminUi.badgeBase} ${adminSemantic.neutral}`}>
                          {priorityLabels[draft.technicalPriority] ?? "متوسطة"}
                        </span>
                        <span className={`${adminUi.badgeBase} ${adminSemantic.warning}`}>
                          {receiptStatusLabels[draft.returnReceiptStatus] ?? "غير محدد"}
                        </span>
                        <span className={`${adminUi.badgeBase} ${adminSemantic.info}`}>
                          {resolutionLabels[draft.returnResolution] ?? "بانتظار القرار"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-500">مرحلة المرتجع</label>
                        <select value={draft.returnStatus} onChange={(e) => updateDraft(item.id, { returnStatus: e.target.value })} className={adminUi.select}>
                          {returnStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-500">حالة الاستلام</label>
                        <select value={draft.returnReceiptStatus} onChange={(e) => updateDraft(item.id, { returnReceiptStatus: e.target.value })} className={adminUi.select}>
                          {returnReceiptStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-500">قرار المرتجع</label>
                        <select value={draft.returnResolution} onChange={(e) => updateDraft(item.id, { returnResolution: e.target.value })} className={adminUi.select}>
                          {returnResolutionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-500">نوع طلب المرتجع</label>
                        <select value={draft.returnRequestType} onChange={(e) => updateDraft(item.id, { returnRequestType: e.target.value })} className={adminUi.select}>
                          {returnRequestTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-500">أولوية الحالة</label>
                        <select value={draft.technicalPriority} onChange={(e) => updateDraft(item.id, { technicalPriority: e.target.value })} className={adminUi.select}>
                          {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-500">أسلوب التعامل</label>
                        <select value={draft.technicalActionMode} onChange={(e) => updateDraft(item.id, { technicalActionMode: e.target.value })} className={adminUi.select}>
                          {technicalActionModeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-500">قرار التحويل</label>
                        <select value={draft.transferDecision} onChange={(e) => updateDraft(item.id, { transferDecision: e.target.value })} className={adminUi.select}>
                          {transferDecisionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-500">موعد المتابعة القادم</label>
                        <input type="datetime-local" value={draft.nextFollowUpAt} onChange={(e) => updateDraft(item.id, { nextFollowUpAt: e.target.value })} className={adminUi.input} />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-500">اسم القطعة</label>
                        <input value={draft.returnPartName} onChange={(e) => updateDraft(item.id, { returnPartName: e.target.value })} className={adminUi.input} placeholder="مثال: طلمبة مياه" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-500">الباكدج المرتبط</label>
                        <input value={draft.returnPackageName} onChange={(e) => updateDraft(item.id, { returnPackageName: e.target.value })} className={adminUi.input} placeholder="مثال: باكدج 60 ألف كم" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-black text-slate-500">نتيجة فحص القطعة / سبب القبول أو الرفض</label>
                        <textarea value={draft.returnInspectionNotes} onChange={(e) => updateDraft(item.id, { returnInspectionNotes: e.target.value })} className={`${adminUi.textarea} min-h-[100px] resize-none`} placeholder="مثال: القطعة مركبة فعليًا وعليها آثار استخدام، أو العبوة سليمة والقطعة لم تُستخدم..." />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-black text-slate-500">سجل المعرفة الفنية</label>
                        <textarea value={draft.knowledgeNotes} onChange={(e) => updateDraft(item.id, { knowledgeNotes: e.target.value })} className={`${adminUi.textarea} min-h-[100px] resize-none`} placeholder="السياسة المعتمدة، بدائل القطعة، شروط القبول، ملاحظات الضمان..." />
                      </div>
                      <div className="md:col-span-2 xl:col-span-4">
                        <label className="mb-2 block text-xs font-black text-slate-500">ملاحظات التشغيل والمتابعة</label>
                        <textarea value={draft.notes} onChange={(e) => updateDraft(item.id, { notes: e.target.value })} className={`${adminUi.textarea} min-h-[100px] resize-none`} placeholder="من تواصل مع العميل؟ هل تم الاستلام؟ هل يحتاج قرار إداري أو تحويل لمسؤول القطع؟" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
                      <div className={adminUi.subtleCard}>
                        <p className="mb-2 text-xs font-black text-slate-500">سير العمل</p>
                        <p className="font-bold text-slate-900">{returnStatusLabels[draft.returnStatus] ?? draft.returnStatus}</p>
                      </div>
                      <div className={adminUi.subtleCard}>
                        <p className="mb-2 text-xs font-black text-slate-500">الاستلام</p>
                        <p className="font-bold text-slate-900">{receiptStatusLabels[draft.returnReceiptStatus] ?? draft.returnReceiptStatus}</p>
                      </div>
                      <div className={adminUi.subtleCard}>
                        <p className="mb-2 text-xs font-black text-slate-500">الإجراء التالي</p>
                        <p className="font-bold text-slate-900">{decisionLabels[draft.transferDecision] ?? "تبقى مع الخبير الفني"}</p>
                      </div>
                      <div className={adminUi.subtleCard}>
                        <p className="mb-2 text-xs font-black text-slate-500">النتيجة الحالية</p>
                        <p className="font-bold text-slate-900">{resolutionLabels[draft.returnResolution] ?? "بانتظار القرار"}</p>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                        <ClipboardCheck className="h-4 w-4" />
                        {item.createdAt ? `تم البلاغ ${new Date(item.createdAt).toLocaleDateString("ar-EG")}` : "مرتجع داخل المسار الفني"}
                      </div>
                      <button onClick={() => handleSave(item.id)} disabled={savingId === item.id} className={adminUi.primaryButton}>
                        {savingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {savingId === item.id ? "جارٍ الحفظ..." : "حفظ الإجراء"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={adminUi.card}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C8974A]/10 text-[#9a6e2e]">
            <RefreshCcw className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black text-slate-950">خطوات المرتجع على النظام</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-5">
          {[
            "1. تبليغ من المبيعات أو العميل أو الورشة",
            "2. تسجيل نوع المرتجع وترتيب الاستلام",
            "3. استلام القطعة وفحصها فنيًا",
            "4. قرار استبدال أو رد مالي أو رفض",
            "5. إنشاء مهمة تلقائية للجهة المنفذة",
          ].map((step) => (
            <div key={step} className={`${adminUi.subtleCard} font-medium leading-7 text-slate-600`}>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
