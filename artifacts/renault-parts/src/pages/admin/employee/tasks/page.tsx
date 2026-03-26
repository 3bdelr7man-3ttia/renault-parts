import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, CheckSquare2, Loader2, PhoneCall, Plus, X } from "lucide-react";

type SalesTask = {
  id: number;
  title: string;
  taskType: string;
  area?: string | null;
  dueAt: string;
  status: string;
  result?: string | null;
  notes?: string | null;
  leadId?: number | null;
  leadName?: string | null;
  leadPhone?: string | null;
  leadType?: string | null;
  ownershipSource?: "self_created" | "assigned";
};

type TaskFormState = {
  title: string;
  taskType: "call" | "visit" | "follow_up" | "whatsapp" | "meeting";
  area: string;
  dueAt: string;
  notes: string;
};

const emptyTaskForm: TaskFormState = {
  title: "",
  taskType: "call",
  area: "",
  dueAt: "",
  notes: "",
};

const taskTypes = [
  { value: "call", label: "مكالمة" },
  { value: "visit", label: "زيارة" },
  { value: "follow_up", label: "متابعة" },
  { value: "whatsapp", label: "واتساب" },
  { value: "meeting", label: "اجتماع" },
] as const;

function ownershipMeta(source?: "self_created" | "assigned") {
  if (source === "self_created") {
    return { label: "أنشأتها بنفسك", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" };
  }
  return { label: "مسندة من الإدارة", className: "bg-sky-500/10 text-sky-300 border-sky-500/20" };
}

export default function EmployeeTasksPage() {
  const { getAuthHeaders, hasPermission } = useAuth();
  const { toast } = useToast();
  const headers = getAuthHeaders().headers ?? {};

  const [data, setData] = React.useState<SalesTask[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<TaskFormState>(emptyTaskForm);

  const canCreate = hasPermission("sales.tasks.create_own");
  const selfCreatedCount = data.filter((task) => task.ownershipSource === "self_created").length;

  const loadTasks = React.useCallback(async () => {
    setLoading(true);
    try {
      const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";
      const response = await fetch(`${base}/api/admin/employee/sales/tasks`, { headers });
      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch {
      setData([]);
      toast({ variant: "destructive", title: "خطأ", description: "تعذر تحميل المهام الآن." });
    } finally {
      setLoading(false);
    }
  }, [headers, toast]);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = async () => {
    if (!form.title || !form.dueAt) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "عنوان المهمة وموعدها مطلوبان." });
      return;
    }

    setSaving(true);
    try {
      const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";
      const response = await fetch(`${base}/api/admin/employee/sales/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          ...form,
          dueAt: new Date(form.dueAt).toISOString(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "فشل إضافة المهمة");
      }

      toast({ title: "تمت إضافة المهمة", description: "أصبحت المهمة الجديدة ضمن جدولك الحالي." });
      setShowAdd(false);
      setForm(emptyTaskForm);
      await loadTasks();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل إضافة المهمة",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[#F9E795] text-sm font-bold mb-2">مهامي</p>
            <h1 className="text-3xl font-black text-white mb-3">مهام موظف المبيعات اليومية</h1>
            <p className="text-white/60 text-sm leading-7 max-w-3xl">
              هذه الصفحة تعرض قائمة المهام المفتوحة والمجدولة لهذا الموظف فقط، سواء كانت مكالمات، زيارات، أو متابعات مرتبطة بعميل أو ورشة.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black text-sm hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              إضافة مهمة
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <CheckSquare2 className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">إجمالي المهام</p>
          <p className="text-white font-black text-2xl">{data.length}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <PhoneCall className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">مهام مفتوحة</p>
          <p className="text-white font-black text-2xl">{data.filter((task) => task.status === "pending" || task.status === "in_progress").length}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <CalendarClock className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">مرتبطة بفرص</p>
          <p className="text-white font-black text-2xl">{data.filter((task) => task.leadId).length}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <CheckSquare2 className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">أنشأتها بنفسك</p>
          <p className="text-white font-black text-2xl">{selfCreatedCount}</p>
        </div>
      </div>

      <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-white/50 text-sm text-center py-10">لا توجد مهام لهذا الحساب الآن. يمكنك البدء بإضافة مهمة بنفسك.</p>
        ) : (
          <div className="space-y-4">
            {data.map((task) => {
              const ownership = ownershipMeta(task.ownershipSource);
              return (
                <div key={task.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-white font-black text-lg">{task.title}</h2>
                      <p className="text-white/45 text-sm mt-1">
                        {task.taskType} {task.area ? `· ${task.area}` : ""} {task.dueAt ? `· ${new Date(task.dueAt).toLocaleString("ar-EG")}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-2 rounded-xl text-xs font-bold border ${ownership.className}`}>
                        {ownership.label}
                      </span>
                      <span className="px-3 py-2 rounded-xl text-xs font-bold bg-[#F9E795]/10 text-[#F9E795] border border-[#F9E795]/20 w-fit">
                        {task.status}
                      </span>
                    </div>
                  </div>

                  {(task.leadName || task.leadPhone) && (
                    <div className="mt-4 text-sm text-white/75">
                      مرتبط بـ: <span className="text-white font-bold">{task.leadName ?? "—"}</span>
                      {task.leadType ? <span className="text-white/40"> · {task.leadType}</span> : null}
                      {task.leadPhone ? <span className="text-white/50" dir="ltr"> · {task.leadPhone}</span> : null}
                    </div>
                  )}

                  {task.notes && <p className="mt-3 text-sm text-white/55 leading-7">{task.notes}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-2xl bg-[#111826] border border-white/10 rounded-3xl p-6 md:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-2xl font-black">إضافة مهمة جديدة</h2>
                <p className="text-white/45 text-sm mt-1">هذه المهمة ستسجل كمهمة أنشأتها بنفسك داخل جدول اليوم.</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="عنوان المهمة" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
              <select className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none" value={form.taskType} onChange={(e) => setForm((prev) => ({ ...prev, taskType: e.target.value as TaskFormState["taskType"] }))}>
                {taskTypes.map((type) => (
                  <option key={type.value} value={type.value} className="bg-[#111826]">
                    {type.label}
                  </option>
                ))}
              </select>
              <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="المنطقة" value={form.area} onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))} />
              <div className="md:col-span-2">
                <label className="block text-white/50 text-xs font-bold mb-2">موعد التنفيذ</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none" type="datetime-local" value={form.dueAt} onChange={(e) => setForm((prev) => ({ ...prev, dueAt: e.target.value }))} />
              </div>
              <textarea className="md:col-span-2 min-h-[120px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none resize-none" placeholder="ملاحظات أو تفاصيل التنفيذ" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>

            <div className="mt-6 flex flex-col-reverse md:flex-row gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold hover:bg-white/10 transition-all">
                إلغاء
              </button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-3 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black hover:opacity-90 transition-all disabled:opacity-50">
                {saving ? "جارٍ الحفظ..." : "حفظ المهمة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
