import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck, Building2, CalendarClock, Loader2, Save, Stethoscope, Users } from "lucide-react";

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
  notes?: string | null;
  nextFollowUpAt?: string | null;
  createdAt?: string | null;
  registeredUserId?: number | null;
  convertedOrderId?: number | null;
  convertedWorkshopId?: number | null;
};

type DraftState = {
  status: string;
  notes: string;
  nextFollowUpAt: string;
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
] as const;

const statusLabels = Object.fromEntries(statusOptions.map((status) => [status.value, status.label])) as Record<string, string>;

export default function EmployeeTechnicalPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";

  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<number | null>(null);
  const [cases, setCases] = React.useState<TechnicalCase[]>([]);
  const [drafts, setDrafts] = React.useState<Record<number, DraftState>>({});

  const loadCases = React.useCallback(async () => {
    if (!token) {
      setCases([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${base}/api/admin/employee/technical/cases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "تعذر تحميل الحالات الفنية الآن.");
      }

      const rows = Array.isArray(result) ? result : [];
      setCases(rows);
      setDrafts(
        rows.reduce<Record<number, DraftState>>((acc, item) => {
          acc[item.id] = {
            status: item.status ?? "new",
            notes: item.notes ?? "",
            nextFollowUpAt: item.nextFollowUpAt ? new Date(item.nextFollowUpAt).toISOString().slice(0, 16) : "",
          };
          return acc;
        }, {}),
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "تعذر تحميل الحالات الفنية الآن.",
      });
    } finally {
      setLoading(false);
    }
  }, [base, toast, token]);

  React.useEffect(() => {
    loadCases();
  }, [loadCases]);

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
          notes: draft.notes || null,
          nextFollowUpAt: draft.nextFollowUpAt ? new Date(draft.nextFollowUpAt).toISOString() : null,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "فشل تحديث الحالة الفنية");
      }

      toast({ title: "تم الحفظ", description: "تم تحديث الحالة الفنية وملاحظاتها بنجاح." });
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
  const customerCases = cases.filter((item) => item.type === "customer").length;
  const workshopCases = cases.filter((item) => item.type === "workshop").length;
  const resolvedCases = cases.filter((item) => item.registeredUserId || item.convertedOrderId || item.convertedWorkshopId).length;

  return (
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <p className="text-[#F9E795] text-sm font-bold mb-2">الحالات الفنية</p>
        <h1 className="text-3xl font-black text-white mb-3">مساحة الخبير الفني</h1>
        <p className="text-white/60 text-sm leading-7 max-w-3xl">
          هذه المساحة تجمع الحالات التي تحتاج رأيًا فنيًا أو مراجعة تشغيلية من الورش، مع إمكانية تحديث الحالة وتسجيل الملاحظات وموعد المتابعة القادم من مكان واحد.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Stethoscope className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">إجمالي الحالات</p>
          <p className="text-white font-black text-2xl">{totalCases}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Users className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">حالات عملاء</p>
          <p className="text-white font-black text-2xl">{customerCases}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Building2 className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">حالات ورش</p>
          <p className="text-white font-black text-2xl">{workshopCases}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <BadgeCheck className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">حالات محسومة</p>
          <p className="text-white font-black text-2xl">{resolvedCases}</p>
        </div>
      </div>

      <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
          </div>
        ) : cases.length === 0 ? (
          <p className="text-white/50 text-sm text-center py-10">لا توجد حالات فنية مسندة لهذا الحساب الآن.</p>
        ) : (
          <div className="space-y-4">
            {cases.map((item) => (
              <div key={item.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-white font-black text-lg">{item.name}</h2>
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F9E795]/10 text-[#F9E795] border border-[#F9E795]/20">
                        {item.type === "workshop" ? "ورشة" : "عميل"}
                      </span>
                    </div>
                    <p className="text-white/45 text-sm mt-2">
                      {item.area ?? "بدون منطقة"} · {item.phone} {item.email ? `· ${item.email}` : ""}
                    </p>
                    {item.contactPerson && <p className="text-white/35 text-xs mt-1">المسؤول: {item.contactPerson}</p>}
                  </div>
                  <div className="text-sm text-white/55 space-y-2">
                    <p>المصدر: <span className="text-white">{item.source}</span></p>
                    <p>الحالة الحالية: <span className="text-[#F9E795]">{statusLabels[item.status] ?? item.status}</span></p>
                    <p>
                      متابعة قادمة:
                      <span className="text-white"> {item.nextFollowUpAt ? new Date(item.nextFollowUpAt).toLocaleString("ar-EG") : "غير محددة"}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <div>
                    <label className="block text-white/50 text-xs font-bold mb-2">الحالة</label>
                    <select
                      value={drafts[item.id]?.status ?? "new"}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [item.id]: { ...(current[item.id] ?? { status: "new", notes: "", nextFollowUpAt: "" }), status: event.target.value },
                        }))
                      }
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
                    <label className="block text-white/50 text-xs font-bold mb-2">موعد المتابعة القادم</label>
                    <input
                      type="datetime-local"
                      value={drafts[item.id]?.nextFollowUpAt ?? ""}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [item.id]: { ...(current[item.id] ?? { status: "new", notes: "", nextFollowUpAt: "" }), nextFollowUpAt: event.target.value },
                        }))
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-white/50 text-xs font-bold mb-2">ملاحظات الخبير الفني</label>
                    <textarea
                      value={drafts[item.id]?.notes ?? ""}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [item.id]: { ...(current[item.id] ?? { status: "new", notes: "", nextFollowUpAt: "" }), notes: event.target.value },
                        }))
                      }
                      className="w-full min-h-[110px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none resize-none"
                      placeholder="اكتب التشخيص الأولي أو القرار المطلوب أو ما يجب تحويله للمبيعات أو الإدارة أو الورش..."
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
