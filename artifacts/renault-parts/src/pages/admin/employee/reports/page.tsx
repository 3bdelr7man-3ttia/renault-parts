import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
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
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <p className="text-[#F9E795] text-sm font-bold mb-2">التقرير اليومي</p>
        <h1 className="text-3xl font-black text-white mb-3">تقاريري اليومية</h1>
        <p className="text-white/60 text-sm leading-7 max-w-3xl">
          سجّل ما أنجزته اليوم، المعوقات التي واجهتها، والخطوات التالية المطلوبة. هذه الصفحة هي مرجع التنفيذ اليومي لكل موظف.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#F9E795]" />
            <h2 className="text-white font-black text-xl">تقرير اليوم</h2>
          </div>

          <div>
            <label className="block text-white/50 text-xs font-bold mb-2">تاريخ التقرير</label>
            <input
              type="date"
              value={form.reportDate}
              onChange={(event) => setForm((prev) => ({ ...prev, reportDate: event.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
            />
          </div>

          <textarea
            className="w-full min-h-[110px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none resize-none"
            placeholder="ملخص اليوم"
            value={form.summary}
            onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
          />
          <textarea
            className="w-full min-h-[90px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none resize-none"
            placeholder="أهم الإنجازات"
            value={form.achievements}
            onChange={(event) => setForm((prev) => ({ ...prev, achievements: event.target.value }))}
          />
          <textarea
            className="w-full min-h-[90px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none resize-none"
            placeholder="المعوقات أو المشاكل"
            value={form.blockers}
            onChange={(event) => setForm((prev) => ({ ...prev, blockers: event.target.value }))}
          />
          <textarea
            className="w-full min-h-[90px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none resize-none"
            placeholder="الخطوات التالية"
            value={form.nextSteps}
            onChange={(event) => setForm((prev) => ({ ...prev, nextSteps: event.target.value }))}
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "جارٍ الحفظ..." : "حفظ التقرير"}
          </button>
        </div>

        <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CalendarDays className="w-5 h-5 text-[#F9E795]" />
            <h2 className="text-white font-black text-xl">آخر التقارير</h2>
          </div>

          {loading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <p className="text-white/45 text-sm text-center py-10">لا توجد تقارير مسجلة بعد.</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-4">
                  <p className="text-[#F9E795] text-xs font-bold mb-2">{report.reportDate}</p>
                  <p className="text-white font-black">{report.summary}</p>
                  {report.achievements && <p className="text-white/60 text-sm mt-3">الإنجازات: {report.achievements}</p>}
                  {report.blockers && <p className="text-white/60 text-sm mt-2">المعوقات: {report.blockers}</p>}
                  {report.nextSteps && <p className="text-white/60 text-sm mt-2">الخطوات التالية: {report.nextSteps}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
