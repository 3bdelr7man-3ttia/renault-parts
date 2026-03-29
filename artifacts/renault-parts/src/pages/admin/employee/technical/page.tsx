import React from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { adminSemantic, adminUi } from "@/components/admin/admin-ui";
import { AlertTriangle, ArrowRightLeft, BadgeCheck, BookOpenText, Building2, CalendarClock, ClipboardList, Loader2, Save, Stethoscope, Users } from "lucide-react";

type TechnicalCase = {
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
  nextFollowUpAt?: string | null;
  createdAt?: string | null;
  createdByUserName?: string | null;
  registeredUserId?: number | null;
  convertedOrderId?: number | null;
  convertedWorkshopId?: number | null;
};

type DraftState = {
  status: string;
  technicalCategory: string;
  technicalPriority: string;
  technicalActionMode: string;
  transferDecision: string;
  knowledgeNotes: string;
  notes: string;
  nextFollowUpAt: string;
};

type TechnicalTask = {
  id: number;
  title: string;
  taskType: string;
  area?: string | null;
  dueAt: string;
  status: string;
  result?: string | null;
  leadId?: number | null;
  leadName?: string | null;
  leadType?: string | null;
};

const statusOptions = [
  { value: "new", label: "جديد" },
  { value: "attempted_contact", label: "محاولة تواصل" },
  { value: "contacted", label: "تم التواصل" },
  { value: "interested", label: "مهتم" },
  { value: "follow_up_later", label: "متابعة لاحقًا" },
  { value: "negotiation", label: "تفاوض" },
  { value: "registered_on_platform", label: "سجل على المنصة" },
  { value: "converted_to_order", label: "تحول إلى طلب" },
  { value: "converted_to_application", label: "تحول إلى طلب انضمام" },
  { value: "closed", label: "أغلقت فنيًا" },
] as const;

const technicalCategoryOptions = [
  { value: "engine", label: "محرك" },
  { value: "electrical", label: "كهرباء" },
  { value: "cooling", label: "تبريد" },
  { value: "suspension", label: "عفشة" },
  { value: "brakes", label: "فرامل" },
  { value: "transmission", label: "ناقل حركة" },
  { value: "diagnostics", label: "فحص وتشخيص" },
  { value: "parts_return", label: "قطع ومرتجعات" },
  { value: "warranty", label: "ضمان" },
  { value: "workshop_relation", label: "علاقة ورشة" },
  { value: "other", label: "أخرى" },
] as const;

const priorityOptions = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "مرتفعة" },
  { value: "critical", label: "حرجة" },
] as const;

const transferDecisionOptions = [
  { value: "keep_with_technical", label: "تبقى مع الخبير الفني" },
  { value: "sales", label: "تحويل إلى المبيعات" },
  { value: "workshop", label: "تحويل إلى ورشة" },
  { value: "management", label: "رفع للإدارة" },
  { value: "parts", label: "رفع لمسؤول القطع" },
] as const;
const technicalActionModeOptions = [
  { value: "contact_directly", label: "الخبير يتواصل مباشرة" },
  { value: "write_opinion_for_sales", label: "يكتب رأيًا للمبيعات" },
  { value: "coordinate_with_workshop", label: "ينسق مع الورشة مباشرة" },
  { value: "escalate_management", label: "يرفعها للإدارة" },
] as const;

const statusLabels = Object.fromEntries(statusOptions.map((status) => [status.value, status.label])) as Record<string, string>;
const technicalCategoryLabels = Object.fromEntries(technicalCategoryOptions.map((item) => [item.value, item.label])) as Record<string, string>;
const priorityLabels = Object.fromEntries(priorityOptions.map((item) => [item.value, item.label])) as Record<string, string>;
const technicalActionModeLabels = Object.fromEntries(technicalActionModeOptions.map((item) => [item.value, item.label])) as Record<string, string>;
const transferDecisionLabels = Object.fromEntries(transferDecisionOptions.map((item) => [item.value, item.label])) as Record<string, string>;
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

function getRequiredActionLabel(actionMode: string, type: TechnicalCase["type"]) {
  if (actionMode === "contact_directly") {
    return type === "workshop"
      ? "المطلوب الآن: تواصل مباشرة مع الورشة وحدد المعلومة أو القرار الفني المطلوب."
      : "المطلوب الآن: تواصل مباشرة مع العميل وافهم تفاصيل الشكوى أو الحالة الفنية.";
  }
  if (actionMode === "coordinate_with_workshop") {
    return "المطلوب الآن: نسّق مع الورشة وحدد هل الحالة تحتاج تنفيذًا أو مراجعة على الأرض.";
  }
  if (actionMode === "escalate_management") {
    return "المطلوب الآن: جهّز ملخصًا فنيًا واضحًا وارفعه للإدارة لاتخاذ قرار.";
  }
  return "المطلوب الآن: اكتب رأيك الفني المنظم ليصل إلى المبيعات أو الفريق المسؤول بشكل واضح.";
}

function getTransferEffectLabel(decision: string) {
  if (decision === "sales") return "بعد الحفظ: سيتم إنشاء إجراء منظم للمبيعات للرد على العميل أو المتابعة التجارية.";
  if (decision === "workshop") return "بعد الحفظ: سيتم إنشاء إجراء متابعة للورشة لتنفيذ الخطوة الفنية المطلوبة.";
  if (decision === "management") return "بعد الحفظ: سترتفع الحالة إلى الإدارة بملخص فني واضح لاتخاذ القرار.";
  if (decision === "parts") return "بعد الحفظ: ستذهب التوصية لمسؤول القطع/الداتا لمراجعة القطعة أو البديل أو المرتجع.";
  return "بعد الحفظ: ستظل الحالة عندك كخبير فني حتى تقرر الخطوة التالية.";
}

function buildStructuredResponsePreview(item: TechnicalCase, draft: DraftState) {
  return [
    `مصدر الحالة: ${sourceLabels[item.source] ?? item.source}`,
    `التصنيف الفني: ${technicalCategoryLabels[draft.technicalCategory] ?? "غير محدد"}`,
    `الأولوية: ${priorityLabels[draft.technicalPriority] ?? "متوسطة"}`,
    `أسلوب التعامل: ${technicalActionModeLabels[draft.technicalActionMode] ?? "غير محدد"}`,
    draft.notes ? `التشخيص الفني: ${draft.notes}` : "التشخيص الفني: لم يُكتب بعد",
    draft.knowledgeNotes ? `الرأي الفني والتوصية: ${draft.knowledgeNotes}` : "الرأي الفني والتوصية: لم تُكتب بعد",
    `قرار التحويل: ${transferDecisionLabels[draft.transferDecision] ?? "بدون قرار"}`,
    draft.nextFollowUpAt ? `المتابعة القادمة: ${new Date(draft.nextFollowUpAt).toLocaleString("ar-EG")}` : "المتابعة القادمة: غير محددة",
  ];
}

const taskTypeLabels: Record<string, string> = {
  issue_resolution: "حل مشكلة",
  quotation: "عرض سعر",
  collection: "تحصيل/إغلاق",
  follow_up: "متابعة",
  call: "مكالمة",
  visit: "زيارة",
  whatsapp: "واتساب",
  meeting: "اجتماع",
  data_entry: "إدخال بيانات",
  field_follow_up: "متابعة ميدانية",
};

const taskStatusLabels: Record<string, string> = {
  pending: "معلقة",
  in_progress: "قيد التنفيذ",
  completed: "تمت",
  postponed: "مؤجلة",
  cancelled: "ملغية",
};

const emptyDraft = (): DraftState => ({
  status: "new",
  technicalCategory: "other",
  technicalPriority: "medium",
  technicalActionMode: "write_opinion_for_sales",
  transferDecision: "keep_with_technical",
  knowledgeNotes: "",
  notes: "",
  nextFollowUpAt: "",
});

export default function EmployeeTechnicalPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";

  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<number | null>(null);
  const [cases, setCases] = React.useState<TechnicalCase[]>([]);
  const [tasks, setTasks] = React.useState<TechnicalTask[]>([]);
  const [drafts, setDrafts] = React.useState<Record<number, DraftState>>({});

  const loadCases = React.useCallback(async () => {
    if (!token) {
      setCases([]);
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [casesResponse, tasksResponse] = await Promise.allSettled([
        fetch(`${base}/api/admin/employee/technical/cases`, { headers }),
        fetch(`${base}/api/admin/employee/sales/tasks`, { headers }),
      ]);

      if (casesResponse.status !== "fulfilled") {
        throw new Error("تعذر الوصول إلى الحالات الفنية الآن.");
      }

      const casesResult = await casesResponse.value.json().catch(() => null);
      if (!casesResponse.value.ok) {
        throw new Error(casesResult?.error || "تعذر تحميل الحالات الفنية الآن.");
      }

      const rows = Array.isArray(casesResult) ? casesResult : [];
      setCases(rows);
      setDrafts(
        rows.reduce<Record<number, DraftState>>((acc, item) => {
          acc[item.id] = {
            status: item.status ?? "new",
            technicalCategory: item.technicalCategory ?? "other",
            technicalPriority: item.technicalPriority ?? "medium",
            technicalActionMode: item.technicalActionMode ?? "write_opinion_for_sales",
            transferDecision: item.transferDecision ?? "keep_with_technical",
            knowledgeNotes: item.knowledgeNotes ?? "",
            notes: item.notes ?? "",
            nextFollowUpAt: item.nextFollowUpAt ? new Date(item.nextFollowUpAt).toISOString().slice(0, 16) : "",
          };
          return acc;
        }, {}),
      );

      if (tasksResponse.status === "fulfilled") {
        const taskResult = await tasksResponse.value.json().catch(() => null);
        setTasks(tasksResponse.value.ok && Array.isArray(taskResult) ? taskResult : []);
      } else {
        setTasks([]);
      }
    } catch (error) {
      setCases([]);
      setTasks([]);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "تعذر تحميل مساحة الخبير الفني الآن.",
      });
    } finally {
      setLoading(false);
    }
  }, [base, toast, token]);

  React.useEffect(() => {
    loadCases();
  }, [loadCases]);

  const updateDraft = (caseId: number, patch: Partial<DraftState>) => {
    setDrafts((current) => ({
      ...current,
      [caseId]: {
        ...(current[caseId] ?? emptyDraft()),
        ...patch,
      },
    }));
  };

  const handleSave = async (caseId: number) => {
    if (!token) return;
    const draft = drafts[caseId];
    if (!draft) return;

    setSavingId(caseId);
    try {
      const response = await fetch(`${base}/api/admin/employee/technical/cases/${caseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: draft.status,
          technicalCategory: draft.technicalCategory || null,
          technicalPriority: draft.technicalPriority,
          technicalActionMode: draft.technicalActionMode,
          transferDecision: draft.transferDecision || null,
          knowledgeNotes: draft.knowledgeNotes || null,
          notes: draft.notes || null,
          nextFollowUpAt: draft.nextFollowUpAt ? new Date(draft.nextFollowUpAt).toISOString() : null,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "فشل تحديث الحالة الفنية");
      }

      toast({
        title: "تم الحفظ",
        description: result?.transferAction?.message || "تم حفظ الرد الفني المنظم، والحالة أصبحت جاهزة للتنفيذ أو المتابعة حسب قرارك.",
      });
      await loadCases();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل تحديث الحالة الفنية",
      });
    } finally {
      setSavingId(null);
    }
  };

  const totalCases = cases.length;
  const customerCases = cases.filter((item) => item.type === "customer");
  const workshopCases = cases.filter((item) => item.type === "workshop");
  const issueTasks = tasks.filter((task) => ["issue_resolution", "quotation", "collection"].includes(task.taskType));
  const urgentCases = cases.filter((item) => ["high", "critical"].includes(item.technicalPriority ?? "medium")).length;
  const pendingTransferCases = cases.filter((item) => !item.transferDecision || item.transferDecision === "keep_with_technical").length;

  const renderCaseCard = (item: TechnicalCase) => {
    const draft = drafts[item.id] ?? emptyDraft();
    const responsePreview = buildStructuredResponsePreview(item, draft);
    const requiredAction = getRequiredActionLabel(draft.technicalActionMode, item.type);
    const transferEffect = getTransferEffectLabel(draft.transferDecision);

    return (
      <div key={item.id} className={`${adminUi.card} space-y-5`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-slate-950 font-black text-lg">{item.name}</h2>
              <span className={`${adminUi.badgeBase} ${adminSemantic.brand}`}>
                {item.type === "workshop" ? "ورشة" : "عميل"}
              </span>
              {item.registeredUserId ? <span className={`${adminUi.badgeBase} ${adminSemantic.success}`}>مسجل على المنصة</span> : null}
            </div>
              <p className="text-slate-500 text-sm mt-2">
                {item.area ?? "بدون منطقة"} · {item.phone} {item.email ? `· ${item.email}` : ""}
              </p>
              {item.contactPerson ? <p className="text-slate-400 text-xs mt-1">المسؤول: {item.contactPerson}</p> : null}
              <p className="text-slate-400 text-xs mt-1">مصدر الطلب الفني: {sourceLabels[item.source] ?? item.source}</p>
              {item.createdByUserName ? <p className="text-slate-400 text-xs mt-1">أُنشئت بواسطة: {item.createdByUserName}</p> : null}
            </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`${adminUi.badgeBase} ${adminSemantic.neutral}`}>
              {technicalCategoryLabels[draft.technicalCategory] ?? "بدون تصنيف"}
            </span>
            <span className={`${adminUi.badgeBase} ${adminSemantic.warning}`}>
              {priorityLabels[draft.technicalPriority] ?? "متوسطة"}
            </span>
            <span className={`${adminUi.badgeBase} border-indigo-200 bg-indigo-50 text-indigo-700`}>
              {technicalActionModeLabels[draft.technicalActionMode] ?? "أسلوب غير محدد"}
            </span>
            <span className={`${adminUi.badgeBase} ${adminSemantic.info}`}>
              {transferDecisionLabels[draft.transferDecision] ?? "بدون قرار"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className={`${adminUi.subtleCard} border-amber-200 bg-amber-50/70 space-y-2`}>
            <p className="text-amber-700 text-xs font-black">المطلوب الآن من الخبير الفني</p>
            <p className="text-slate-900 text-sm leading-7">{requiredAction}</p>
            <p className="text-slate-500 text-xs leading-6">
              {item.createdByUserName ? `الحالة محوّلة من ${item.createdByUserName}.` : "الحالة محوّلة من أحد أفراد الفريق."}{" "}
              الهدف هنا ليس مجرد تنفيذ مهمة، بل إصدار رد فني واضح قابل للتنفيذ.
            </p>
          </div>
          <div className={`${adminUi.subtleCard} border-sky-200 bg-sky-50/70 space-y-2`}>
            <p className="text-sky-700 text-xs font-black">ما الذي سيحدث بعد الحفظ</p>
            <p className="text-slate-900 text-sm leading-7">{transferEffect}</p>
            <p className="text-slate-500 text-xs leading-6">
              لو كانت الحالة مرتبطة بمرتجع أو قطعة، سيُستخدم هذا الرد الفني كأساس للقرار التنفيذي وليس كملاحظة عامة فقط.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-slate-500 text-xs font-bold mb-2">حالة المتابعة</label>
            <select
              value={draft.status}
              onChange={(event) => updateDraft(item.id, { status: event.target.value })}
              className={adminUi.select}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-500 text-xs font-bold mb-2">التصنيف الفني</label>
            <select
              value={draft.technicalCategory}
              onChange={(event) => updateDraft(item.id, { technicalCategory: event.target.value })}
              className={adminUi.select}
            >
              {technicalCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-500 text-xs font-bold mb-2">أولوية الحالة</label>
            <select
              value={draft.technicalPriority}
              onChange={(event) => updateDraft(item.id, { technicalPriority: event.target.value })}
              className={adminUi.select}
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-500 text-xs font-bold mb-2">أسلوب التعامل الفني</label>
            <select
              value={draft.technicalActionMode}
              onChange={(event) => updateDraft(item.id, { technicalActionMode: event.target.value })}
              className={adminUi.select}
            >
              {technicalActionModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-500 text-xs font-bold mb-2">قرار التحويل</label>
            <select
              value={draft.transferDecision}
              onChange={(event) => updateDraft(item.id, { transferDecision: event.target.value })}
              className={adminUi.select}
            >
              {transferDecisionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-slate-500 text-xs font-bold mb-2">التشخيص الفني</label>
            <textarea
              value={draft.notes}
              onChange={(event) => updateDraft(item.id, { notes: event.target.value })}
              className={`${adminUi.textarea} min-h-[110px] resize-none`}
              placeholder="اكتب التشخيص الفني: ما المشكلة؟ ما السبب المرجح؟ وهل الحالة تحتاج فحص أو استبدال أو تصعيد؟"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-slate-500 text-xs font-bold mb-2">الرأي الفني المنظم / التوصية التنفيذية</label>
            <textarea
              value={draft.knowledgeNotes}
              onChange={(event) => updateDraft(item.id, { knowledgeNotes: event.target.value })}
              className={`${adminUi.textarea} min-h-[110px] resize-none`}
              placeholder="اكتب الرد الذي سيصل للفريق: ماذا تقول للمبيعات أو للقطع أو للإدارة؟ مثال: يفضّل استبدال القطعة، أو يقبل المرتجع بشرط كذا، أو البديل المناسب هو..."
            />
          </div>
          <div className="md:col-span-2 xl:col-span-1">
            <label className="block text-slate-500 text-xs font-bold mb-2">موعد المتابعة القادم</label>
            <input
              type="datetime-local"
              value={draft.nextFollowUpAt}
              onChange={(event) => updateDraft(item.id, { nextFollowUpAt: event.target.value })}
              className={adminUi.input}
            />
          </div>
          <div className="md:col-span-2 xl:col-span-1">
            <div className={`${adminUi.subtleCard} h-full text-sm text-slate-600 space-y-2`}>
              <p>المصدر: <span className="text-slate-950">{item.source}</span></p>
              <p>الحالة الحالية: <span className="text-[#9a6e2e]">{statusLabels[item.status] ?? item.status}</span></p>
              <p>آخر متابعة: <span className="text-slate-950">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("ar-EG") : "غير متاحة"}</span></p>
              <p>المتابعة القادمة: <span className="text-slate-950">{item.nextFollowUpAt ? new Date(item.nextFollowUpAt).toLocaleString("ar-EG") : "غير محددة"}</span></p>
            </div>
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <div className={`${adminUi.subtleCard} border-indigo-200 bg-indigo-50/70 space-y-3`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-indigo-700 text-xs font-black">الرد الفني المنظم الذي سيصل للفريق</p>
                  <p className="text-slate-500 text-xs mt-1">هذه الصياغة تساعد المبيعات أو القطع أو الإدارة أن تتحرك فورًا بدون الرجوع لنفس الحالة أكثر من مرة.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {responsePreview.map((line) => (
                  <div key={line} className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-slate-400 text-xs inline-flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            {item.createdAt ? `أضيفت ${new Date(item.createdAt).toLocaleDateString("ar-EG")}` : "سجل موجود داخل المسار الفني"}
          </div>
          <button
            onClick={() => handleSave(item.id)}
            disabled={savingId === item.id}
            className={adminUi.primaryButton}
          >
            <Save className="w-4 h-4" />
            {savingId === item.id ? "جارٍ الحفظ..." : "حفظ التحديث"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`${adminUi.page} pb-8`}>
      <div className={adminUi.hero}>
        <p className="text-[#C8974A] text-sm font-bold mb-2">الحالات الفنية</p>
        <h1 className={adminUi.title}>مساحة الخبير الفني</h1>
        <p className={`${adminUi.subtitle} max-w-4xl`}>
          هذه المساحة تجمع الحالات التي تحتاج رأيًا فنيًا، مع تصنيف فني واضح، أولوية، قرار تحويل، وسجل معرفة خاص بالقطع والبدائل والمرتجعات حتى لا تتحول المتابعة إلى ملاحظات متناثرة.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={adminUi.statCard}>
          <Stethoscope className="w-5 h-5 text-[#C8974A] mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">إجمالي الحالات</p>
          <p className="text-slate-950 font-black text-2xl">{totalCases}</p>
        </div>
        <div className={adminUi.statCard}>
          <AlertTriangle className="w-5 h-5 text-rose-600 mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">أولوية عالية أو حرجة</p>
          <p className="text-slate-950 font-black text-2xl">{urgentCases}</p>
        </div>
        <div className={adminUi.statCard}>
          <ArrowRightLeft className="w-5 h-5 text-violet-600 mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">تنتظر قرار تحويل</p>
          <p className="text-slate-950 font-black text-2xl">{pendingTransferCases}</p>
        </div>
        <div className={adminUi.statCard}>
          <BookOpenText className="w-5 h-5 text-sky-600 mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">مشاكل قطع ومرتجعات</p>
          <p className="text-slate-950 font-black text-2xl">{issueTasks.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className={adminUi.statCard}>
          <Users className="w-5 h-5 text-emerald-600 mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">أسئلة وحالات العملاء</p>
          <p className="text-slate-950 font-black text-2xl">{customerCases.length}</p>
        </div>
        <div className={adminUi.statCard}>
          <Building2 className="w-5 h-5 text-sky-600 mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">شبكة الورش والعلاقات</p>
          <p className="text-slate-950 font-black text-2xl">{workshopCases.length}</p>
        </div>
        <div className={adminUi.statCard}>
          <BadgeCheck className="w-5 h-5 text-[#C8974A] mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">حالات سُجلت أو تحولت</p>
          <p className="text-slate-950 font-black text-2xl">{cases.filter((item) => item.registeredUserId || item.convertedOrderId || item.convertedWorkshopId).length}</p>
        </div>
      </div>

      <Link href="/admin/employee/returns">
        <div className={`${adminUi.card} cursor-pointer transition-all hover:-translate-y-0.5 hover:border-[#C8974A]/35`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[#C8974A] text-xs font-bold mb-2">مسار مستقل</p>
              <h2 className="text-slate-950 font-black text-lg mb-2">صفحة المرتجعات وقرارات الاستبدال</h2>
              <p className="text-slate-500 text-sm leading-7">ادخل هنا لو الحالة مرتبطة باسترجاع قطعة أو استبدال أو رد مالي، بدل متابعة المرتجع من داخل الملاحظات العامة فقط.</p>
            </div>
            <ArrowRightLeft className="w-6 h-6 text-[#C8974A] flex-shrink-0" />
          </div>
        </div>
      </Link>

      <div className={adminUi.card}>
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#C8974A] animate-spin" />
          </div>
        ) : totalCases === 0 && issueTasks.length === 0 ? (
          <div className={adminUi.emptyState}>
            <p className="text-slate-500 text-sm font-bold">لا توجد عناصر تشغيلية مسندة لهذا الحساب الآن.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="space-y-4">
              <div>
                <h2 className="text-slate-950 font-black text-xl">حالات العملاء الفنية</h2>
                <p className="text-slate-500 text-sm mt-1">استفسارات العملاء الفنية، الأعطال المبدئية، وما يحتاج رأيًا فنيًا قبل تحويله للمبيعات أو الطلب.</p>
              </div>
              {customerCases.length ? customerCases.map(renderCaseCard) : <p className="text-slate-500 text-sm text-center py-6">لا توجد حالات عملاء فنية الآن.</p>}
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-slate-950 font-black text-xl">شبكة الورش والعلاقات</h2>
                <p className="text-slate-500 text-sm mt-1">ورش ومعارف تحتاج تقييمًا فنيًا أو رأيًا تشغيليًا أو دعمًا قبل التصعيد أو الاعتماد.</p>
              </div>
              {workshopCases.length ? workshopCases.map(renderCaseCard) : <p className="text-slate-500 text-sm text-center py-6">لا توجد حالات ورش مسندة الآن.</p>}
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-slate-950 font-black text-xl">مشاكل القطع والمرتجعات</h2>
                <p className="text-slate-500 text-sm mt-1">هذه ليست “مهام عامة” فقط، بل إشعارات تنفيذية مرتبطة بحالات القطع والمرتجعات التي تحتاج منك حسمًا أو متابعة.</p>
              </div>
              {issueTasks.length ? (
                <div className="space-y-4">
                  {issueTasks.map((task) => (
                    <div key={task.id} className={`${adminUi.subtleCard} border-slate-200 bg-white p-5 shadow-sm`}>
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-slate-950 font-black text-lg">{task.title}</h3>
                          <p className="text-slate-500 text-sm mt-2">
                            {taskTypeLabels[task.taskType] ?? task.taskType} {task.area ? `· ${task.area}` : ""} {task.dueAt ? `· ${new Date(task.dueAt).toLocaleString("ar-EG")}` : ""}
                          </p>
                          {(task.leadName || task.leadType) ? (
                            <p className="text-slate-400 text-xs mt-1">
                              مرتبطة بـ: {task.leadName ?? "حالة غير مسماة"} {task.leadType ? `· ${task.leadType === "workshop" ? "ورشة" : "عميل"}` : ""}
                            </p>
                          ) : null}
                        </div>
                        <span className={`${adminUi.badgeBase} ${adminSemantic.warning} w-fit`}>
                          {taskStatusLabels[task.status] ?? task.status}
                        </span>
                      </div>
                      {task.result ? <p className="text-slate-500 text-sm mt-3">النتيجة: {task.result}</p> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-6">لا توجد مهام قطع أو مرتجعات حالية.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
