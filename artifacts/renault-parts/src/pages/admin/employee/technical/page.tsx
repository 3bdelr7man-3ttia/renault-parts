import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
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

const statusLabels = Object.fromEntries(statusOptions.map((status) => [status.value, status.label])) as Record<string, string>;
const technicalCategoryLabels = Object.fromEntries(technicalCategoryOptions.map((item) => [item.value, item.label])) as Record<string, string>;
const priorityLabels = Object.fromEntries(priorityOptions.map((item) => [item.value, item.label])) as Record<string, string>;
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
        description: result?.transferAction?.message || "تم تحديث الحالة الفنية وقرارها التشغيلي بنجاح.",
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

    return (
      <div key={item.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-5 space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-white font-black text-lg">{item.name}</h2>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F9E795]/10 text-[#F9E795] border border-[#F9E795]/20">
                {item.type === "workshop" ? "ورشة" : "عميل"}
              </span>
              {item.registeredUserId ? <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">مسجل على المنصة</span> : null}
            </div>
              <p className="text-white/45 text-sm mt-2">
                {item.area ?? "بدون منطقة"} · {item.phone} {item.email ? `· ${item.email}` : ""}
              </p>
              {item.contactPerson ? <p className="text-white/35 text-xs mt-1">المسؤول: {item.contactPerson}</p> : null}
              <p className="text-white/35 text-xs mt-1">مصدر الطلب الفني: {sourceLabels[item.source] ?? item.source}</p>
              {item.createdByUserName ? <p className="text-white/35 text-xs mt-1">أُنشئت بواسطة: {item.createdByUserName}</p> : null}
            </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/70">
              {technicalCategoryLabels[draft.technicalCategory] ?? "بدون تصنيف"}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#F9E795]/10 border border-[#F9E795]/20 text-[#F9E795]">
              {priorityLabels[draft.technicalPriority] ?? "متوسطة"}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300">
              {transferDecisionLabels[draft.transferDecision] ?? "بدون قرار"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-white/50 text-xs font-bold mb-2">حالة المتابعة</label>
            <select
              value={draft.status}
              onChange={(event) => updateDraft(item.id, { status: event.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value} className="bg-[#111826]">
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-bold mb-2">التصنيف الفني</label>
            <select
              value={draft.technicalCategory}
              onChange={(event) => updateDraft(item.id, { technicalCategory: event.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
            >
              {technicalCategoryOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#111826]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-bold mb-2">أولوية الحالة</label>
            <select
              value={draft.technicalPriority}
              onChange={(event) => updateDraft(item.id, { technicalPriority: event.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#111826]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-bold mb-2">قرار التحويل</label>
            <select
              value={draft.transferDecision}
              onChange={(event) => updateDraft(item.id, { transferDecision: event.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
            >
              {transferDecisionOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#111826]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/50 text-xs font-bold mb-2">ملاحظات الخبير الفني</label>
            <textarea
              value={draft.notes}
              onChange={(event) => updateDraft(item.id, { notes: event.target.value })}
              className="w-full min-h-[110px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none resize-none"
              placeholder="اكتب التشخيص الأولي أو ما الذي يحتاج مراجعة أو موافقة..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/50 text-xs font-bold mb-2">سجل المعرفة الفنية / اقتراحات قطع وبدائل ومرتجعات</label>
            <textarea
              value={draft.knowledgeNotes}
              onChange={(event) => updateDraft(item.id, { knowledgeNotes: event.target.value })}
              className="w-full min-h-[110px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none resize-none"
              placeholder="مثال: القطعة الأصلية يفضل استبدالها بالبديل التركي X عند عدم التوفر، أو المرتجع يقبل إذا كانت العبوة سليمة..."
            />
          </div>
          <div className="md:col-span-2 xl:col-span-1">
            <label className="block text-white/50 text-xs font-bold mb-2">موعد المتابعة القادم</label>
            <input
              type="datetime-local"
              value={draft.nextFollowUpAt}
              onChange={(event) => updateDraft(item.id, { nextFollowUpAt: event.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
            />
          </div>
          <div className="md:col-span-2 xl:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 h-full text-sm text-white/65 space-y-2">
              <p>المصدر: <span className="text-white">{item.source}</span></p>
              <p>الحالة الحالية: <span className="text-[#F9E795]">{statusLabels[item.status] ?? item.status}</span></p>
              <p>آخر متابعة: <span className="text-white">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("ar-EG") : "غير متاحة"}</span></p>
              <p>المتابعة القادمة: <span className="text-white">{item.nextFollowUpAt ? new Date(item.nextFollowUpAt).toLocaleString("ar-EG") : "غير محددة"}</span></p>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-white/35 text-xs inline-flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            {item.createdAt ? `أضيفت ${new Date(item.createdAt).toLocaleDateString("ar-EG")}` : "سجل موجود داخل المسار الفني"}
          </div>
          <button
            onClick={() => handleSave(item.id)}
            disabled={savingId === item.id}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black text-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {savingId === item.id ? "جارٍ الحفظ..." : "حفظ التحديث"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <p className="text-[#F9E795] text-sm font-bold mb-2">الحالات الفنية</p>
        <h1 className="text-3xl font-black text-white mb-3">مساحة الخبير الفني</h1>
        <p className="text-white/60 text-sm leading-7 max-w-4xl">
          هذه المساحة تجمع الحالات التي تحتاج رأيًا فنيًا، مع تصنيف فني واضح، أولوية، قرار تحويل، وسجل معرفة خاص بالقطع والبدائل والمرتجعات حتى لا تتحول المتابعة إلى ملاحظات متناثرة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Stethoscope className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">إجمالي الحالات</p>
          <p className="text-white font-black text-2xl">{totalCases}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <AlertTriangle className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">أولوية عالية أو حرجة</p>
          <p className="text-white font-black text-2xl">{urgentCases}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <ArrowRightLeft className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">تنتظر قرار تحويل</p>
          <p className="text-white font-black text-2xl">{pendingTransferCases}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <BookOpenText className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">مشاكل قطع ومرتجعات</p>
          <p className="text-white font-black text-2xl">{issueTasks.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Users className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">أسئلة وحالات العملاء</p>
          <p className="text-white font-black text-2xl">{customerCases.length}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Building2 className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">شبكة الورش والعلاقات</p>
          <p className="text-white font-black text-2xl">{workshopCases.length}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <BadgeCheck className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">حالات سُجلت أو تحولت</p>
          <p className="text-white font-black text-2xl">{cases.filter((item) => item.registeredUserId || item.convertedOrderId || item.convertedWorkshopId).length}</p>
        </div>
      </div>

      <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
          </div>
        ) : totalCases === 0 && issueTasks.length === 0 ? (
          <p className="text-white/50 text-sm text-center py-10">لا توجد عناصر تشغيلية مسندة لهذا الحساب الآن.</p>
        ) : (
          <div className="space-y-8">
            <section className="space-y-4">
              <div>
                <h2 className="text-white font-black text-xl">حالات العملاء الفنية</h2>
                <p className="text-white/45 text-sm mt-1">استفسارات العملاء الفنية، الأعطال المبدئية، وما يحتاج رأيًا فنيًا قبل تحويله للمبيعات أو الطلب.</p>
              </div>
              {customerCases.length ? customerCases.map(renderCaseCard) : <p className="text-white/45 text-sm text-center py-6">لا توجد حالات عملاء فنية الآن.</p>}
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-white font-black text-xl">شبكة الورش والعلاقات</h2>
                <p className="text-white/45 text-sm mt-1">ورش ومعارف تحتاج تقييمًا فنيًا أو رأيًا تشغيليًا أو دعمًا قبل التصعيد أو الاعتماد.</p>
              </div>
              {workshopCases.length ? workshopCases.map(renderCaseCard) : <p className="text-white/45 text-sm text-center py-6">لا توجد حالات ورش مسندة الآن.</p>}
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-white font-black text-xl">مشاكل القطع والمرتجعات</h2>
                <p className="text-white/45 text-sm mt-1">المهام التي تتعلق بحل مشاكل القطع، مراجعة المرتجعات، أو قرارات التسعير والإغلاق الفني.</p>
              </div>
              {issueTasks.length ? (
                <div className="space-y-4">
                  {issueTasks.map((task) => (
                    <div key={task.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-white font-black text-lg">{task.title}</h3>
                          <p className="text-white/45 text-sm mt-2">
                            {taskTypeLabels[task.taskType] ?? task.taskType} {task.area ? `· ${task.area}` : ""} {task.dueAt ? `· ${new Date(task.dueAt).toLocaleString("ar-EG")}` : ""}
                          </p>
                          {(task.leadName || task.leadType) ? (
                            <p className="text-white/35 text-xs mt-1">
                              مرتبطة بـ: {task.leadName ?? "حالة غير مسماة"} {task.leadType ? `· ${task.leadType === "workshop" ? "ورشة" : "عميل"}` : ""}
                            </p>
                          ) : null}
                        </div>
                        <span className="px-3 py-2 rounded-xl text-xs font-bold bg-[#F9E795]/10 text-[#F9E795] border border-[#F9E795]/20 w-fit">
                          {taskStatusLabels[task.status] ?? task.status}
                        </span>
                      </div>
                      {task.result ? <p className="text-white/55 text-sm mt-3">النتيجة: {task.result}</p> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/45 text-sm text-center py-6">لا توجد مهام قطع أو مرتجعات حالية.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
