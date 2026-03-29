import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { adminSemantic, adminUi } from "@/components/admin/admin-ui";
import { CalendarDays, FileText, Loader2, Save } from "lucide-react";

type DailyReport = {
  id: number;
  reportDate: string;
  summary: string;
  achievements?: string | null;
  blockers?: string | null;
  nextSteps?: string | null;
  createdAt?: string | null;
};

type ReportFormState = {
  reportDate: string;
  summary: string;
  achievements: string;
  blockers: string;
  nextSteps: string;
};

const todayValue = new Date().toISOString().slice(0, 10);

export default function EmployeeReportsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [reports, setReports] = React.useState<DailyReport[]>([]);
  const [form, setForm] = React.useState<ReportFormState>({
    reportDate: todayValue,
    summary: "",
    achievements: "",
    blockers: "",
    nextSteps: "",
  });

  const loadReports = React.useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${base}/api/admin/employee/daily-reports/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "تعذر تحميل التقارير اليومية الآن.");
      }
      const rows = Array.isArray(result) ? result : [];
      setReports(rows);
      const existingToday = rows.find((row) => row.reportDate === form.reportDate);
      if (existingToday) {
        setForm({
          reportDate: existingToday.reportDate,
          summary: existingToday.summary ?? "",
          achievements: existingToday.achievements ?? "",
          blockers: existingToday.blockers ?? "",
          nextSteps: existingToday.nextSteps ?? "",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "تعذر تحميل التقارير اليومية الآن.",
      });
    } finally {
      setLoading(false);
    }
  }, [base, form.reportDate, toast, token]);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleSave = async () => {
    if (!token) return;
    if (!form.summary || form.summary.trim().length < 5) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "اكتب ملخصًا واضحًا لليوم." });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${base}/api/admin/employee/daily-reports/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "فشل حفظ التقرير اليومي");
      }

      toast({ title: "تم حفظ التقرير", description: "أصبح التقرير اليومي محفوظًا ويمكن الرجوع إليه." });
      await loadReports();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل حفظ التقرير اليومي",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={adminUi.page}>
      <div className={adminUi.hero}>
        <p className="mb-2 text-sm font-black text-[#C8974A]">التقرير اليومي</p>
        <h1 className={adminUi.title}>تقاريري اليومية</h1>
        <p className={`${adminUi.subtitle} max-w-3xl`}>
          سجّل ما أنجزته اليوم، المعوقات التي واجهتها، والخطوات التالية المطلوبة. هذه الصفحة هي مرجع التنفيذ اليومي لكل موظف.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="space-y-4 rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,251,235,0.8),rgba(255,255,255,0.98))] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#C8974A]" />
            <h2 className="text-slate-950 font-black text-xl">تقرير اليوم</h2>
          </div>

          <div>
            <label className="block text-slate-500 text-xs font-bold mb-2">تاريخ التقرير</label>
            <input
              type="date"
              value={form.reportDate}
              onChange={(event) => setForm((prev) => ({ ...prev, reportDate: event.target.value }))}
              className={adminUi.input}
            />
          </div>

          <textarea
            className={`${adminUi.textarea} min-h-[110px] resize-none`}
            placeholder="ملخص اليوم"
            value={form.summary}
            onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
          />
          <textarea
            className={`${adminUi.textarea} min-h-[90px] resize-none`}
            placeholder="أهم الإنجازات"
            value={form.achievements}
            onChange={(event) => setForm((prev) => ({ ...prev, achievements: event.target.value }))}
          />
          <textarea
            className={`${adminUi.textarea} min-h-[90px] resize-none`}
            placeholder="المعوقات أو المشاكل"
            value={form.blockers}
            onChange={(event) => setForm((prev) => ({ ...prev, blockers: event.target.value }))}
          />
          <textarea
            className={`${adminUi.textarea} min-h-[90px] resize-none`}
            placeholder="الخطوات التالية"
            value={form.nextSteps}
            onChange={(event) => setForm((prev) => ({ ...prev, nextSteps: event.target.value }))}
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className={adminUi.primaryButton}
          >
            <Save className="w-4 h-4" />
            {saving ? "جارٍ الحفظ..." : "حفظ التقرير"}
          </button>
        </div>

        <div className="rounded-[28px] border border-sky-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.72),rgba(255,255,255,0.98))] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-3 mb-4">
            <CalendarDays className="w-5 h-5 text-[#C8974A]" />
            <h2 className="text-slate-950 font-black text-xl">آخر التقارير</h2>
          </div>

          {loading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-8 h-8 text-[#C8974A] animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className={adminUi.emptyState}>
              <p className="text-sm font-bold text-slate-500">لا توجد تقارير مسجلة بعد.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-sky-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(239,246,255,0.5))] p-4">
                  <span className={`${adminUi.badgeBase} ${adminSemantic.brand}`}>{report.reportDate}</span>
                  <p className="mt-3 text-slate-950 font-black">{report.summary}</p>
                  {report.achievements && <p className="text-slate-600 text-sm mt-3">الإنجازات: {report.achievements}</p>}
                  {report.blockers && <p className="text-slate-600 text-sm mt-2">المعوقات: {report.blockers}</p>}
                  {report.nextSteps && <p className="text-slate-600 text-sm mt-2">الخطوات التالية: {report.nextSteps}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
