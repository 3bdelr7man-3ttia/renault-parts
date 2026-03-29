import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { adminSemantic, adminUi } from "@/components/admin/admin-ui";
import { CalendarClock, CheckSquare2, Loader2, PhoneCall, Plus, Save, X } from "lucide-react";

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
  { value: "data_entry", label: "إدخال بيانات" },
  { value: "issue_resolution", label: "حل مشكلة" },
  { value: "technical_review", label: "مراجعة فنية" },
  { value: "expert_opinion", label: "رأي خبير" },
  { value: "parts_return_review", label: "مراجعة مرتجع" },
  { value: "workshop_support", label: "دعم ورشة" },
  { value: "quotation", label: "عرض سعر" },
  { value: "collection", label: "تحصيل/إغلاق" },
  { value: "field_follow_up", label: "متابعة ميدانية" },
] as const;

const taskStatusOptions = [
  { value: "pending", label: "معلقة" },
  { value: "in_progress", label: "قيد التنفيذ" },
  { value: "completed", label: "تمت" },
  { value: "postponed", label: "مؤجلة" },
  { value: "cancelled", label: "ملغية" },
] as const;

const taskTypeLabels = Object.fromEntries(taskTypes.map((type) => [type.value, type.label])) as Record<string, string>;
const taskStatusLabels = Object.fromEntries(taskStatusOptions.map((status) => [status.value, status.label])) as Record<string, string>;

type StructuredTechnicalNote = {
  title: string;
  items: string[];
};

function parseStructuredTechnicalNote(notes?: string | null): StructuredTechnicalNote | null {
  if (!notes) return null;
  const lines = notes
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length || lines[0] !== "ملخص الرد الفني") return null;

  return {
    title: lines[0],
    items: lines.slice(1),
  };
}

function getTaskTypesForEmployeeRole(employeeRole?: string | null) {
  if (employeeRole === "technical_expert") {
    return taskTypes.filter((type) =>
      ["technical_review", "expert_opinion", "issue_resolution", "parts_return_review", "workshop_support", "follow_up"].includes(type.value),
    );
  }
  if (employeeRole === "data_entry") {
    return taskTypes.filter((type) =>
      ["data_entry", "follow_up", "quotation"].includes(type.value),
    );
  }
  if (employeeRole === "marketing_tech") {
    return taskTypes.filter((type) =>
      ["meeting", "follow_up", "data_entry"].includes(type.value),
    );
  }
  return taskTypes.filter((type) =>
    ["call", "visit", "follow_up", "whatsapp", "meeting", "quotation", "collection", "field_follow_up"].includes(type.value),
  );
}

function ownershipMeta(source?: "self_created" | "assigned") {
  if (source === "self_created") {
    return { label: "أنشأتها بنفسك", className: `${adminUi.badgeBase} ${adminSemantic.success}` };
  }
  return { label: "مسندة من الإدارة", className: `${adminUi.badgeBase} ${adminSemantic.info}` };
}

function getRoleHeadline(employeeRole?: string | null) {
  if (employeeRole === "data_entry") return "المهام والتنفيذ لمسؤول القطع والداتا";
  if (employeeRole === "sales") return "المهام والمتابعة للمبيعات";
  if (employeeRole === "technical_expert") return "المهام والتنبيهات التنفيذية للخبير الفني";
  if (employeeRole === "marketing_tech") return "المهام التشغيلية للتسويق والتقنية";
  return "مهامي اليومية";
}

function getRoleDescription(employeeRole?: string | null) {
  if (employeeRole === "data_entry") {
    return "هنا تظهر لك مهام القطع والداتا، ومنها التحويلات القادمة من الخبير الفني لمراجعة قطعة أو بديل أو مرتجع.";
  }
  if (employeeRole === "sales") {
    return "هنا تظهر لك مهام المتابعة والمبيعات، ومنها الردود الفنية المنظمة القادمة من الخبير الفني لتكمل بها التواصل مع العميل أو الورشة.";
  }
  if (employeeRole === "technical_expert") {
    return "هذه الصفحة تعرض التنبيهات التنفيذية التابعة للحالات الفنية، إلى جانب إمكانية تحديث نتائج التنفيذ.";
  }
  return "هذه الصفحة تعرض المهام اليومية لهذا الموظف فقط، مع إمكانية تحديث حالتها ونتيجتها سواء كانت تواصلًا، إدخال بيانات، حل مشكلة، أو متابعة ميدانية.";
}

export default function EmployeeTasksPage() {
  const { token, hasPermission, user } = useAuth();
  const { toast } = useToast();

  const [data, setData] = React.useState<SalesTask[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savingTaskId, setSavingTaskId] = React.useState<number | null>(null);
  const [taskDrafts, setTaskDrafts] = React.useState<Record<number, { status: string; result: string }>>({});
  const [form, setForm] = React.useState<TaskFormState>(emptyTaskForm);

  const canCreate = hasPermission("employee.tasks.create_own");
  const availableTaskTypes = React.useMemo(() => getTaskTypesForEmployeeRole(user?.employeeRole), [user?.employeeRole]);
  const selfCreatedCount = data.filter((task) => task.ownershipSource === "self_created").length;
  const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";
  const structuredTasksCount = data.filter((task) => parseStructuredTechnicalNote(task.notes)).length;

  React.useEffect(() => {
    if (!availableTaskTypes.some((type) => type.value === form.taskType)) {
      setForm((prev) => ({
        ...prev,
        taskType: availableTaskTypes[0]?.value ?? "call",
      }));
    }
  }, [availableTaskTypes, form.taskType]);

  const loadTasks = React.useCallback(async () => {
    if (!token) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${base}/api/admin/employee/sales/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "تعذر تحميل المهام الآن.");
      }
      const rows = Array.isArray(result) ? result : [];
      setData(rows);
      setTaskDrafts(
        rows.reduce<Record<number, { status: string; result: string }>>((acc, task) => {
          acc[task.id] = {
            status: task.status ?? "pending",
            result: task.result ?? "",
          };
          return acc;
        }, {}),
      );
    } catch (error) {
      setData([]);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "تعذر تحميل المهام الآن.",
      });
    } finally {
      setLoading(false);
    }
  }, [base, toast, token]);

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
      if (!token) {
        throw new Error("انتهت الجلسة، برجاء تسجيل الدخول مرة أخرى.");
      }

      const response = await fetch(`${base}/api/admin/employee/sales/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

  const handleUpdateTask = async (taskId: number) => {
    if (!token) return;

    const draft = taskDrafts[taskId];
    if (!draft) return;

    setSavingTaskId(taskId);
    try {
      const response = await fetch(`${base}/api/admin/employee/sales/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: draft.status,
          result: draft.result || null,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "فشل تحديث حالة المهمة");
      }

      toast({
        title: "تم تحديث المهمة",
        description: draft.status === "completed" ? "تم وضع المهمة كمكتملة." : "تم حفظ حالة المهمة الجديدة.",
      });
      await loadTasks();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل تحديث حالة المهمة",
      });
    } finally {
      setSavingTaskId(null);
    }
  };

  return (
    <div className={adminUi.page}>
      <div className={adminUi.hero}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-sm font-black text-[#C8974A]">مهامي</p>
            <h1 className={adminUi.title}>{getRoleHeadline(user?.employeeRole)}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              {getRoleDescription(user?.employeeRole)}
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowAdd(true)}
              className={adminUi.primaryButton}
            >
              <Plus className="w-4 h-4" />
              إضافة مهمة
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className={`${adminUi.statCard} border-slate-200 bg-white`}>
          <CheckSquare2 className="mb-4 h-5 w-5 text-slate-700" />
          <p className="mb-2 text-xs font-bold text-slate-500">إجمالي المهام</p>
          <p className="text-2xl font-black text-slate-950">{data.length}</p>
        </div>
        <div className={`${adminUi.statCard} border-amber-200 bg-amber-50/70`}>
          <PhoneCall className="mb-4 h-5 w-5 text-amber-700" />
          <p className="mb-2 text-xs font-bold text-slate-500">مهام مفتوحة</p>
          <p className="text-2xl font-black text-amber-700">{data.filter((task) => task.status === "pending" || task.status === "in_progress").length}</p>
        </div>
        <div className={`${adminUi.statCard} border-sky-200 bg-sky-50/70`}>
          <CalendarClock className="mb-4 h-5 w-5 text-sky-700" />
          <p className="mb-2 text-xs font-bold text-slate-500">مرتبطة بفرص</p>
          <p className="text-2xl font-black text-sky-700">{data.filter((task) => task.leadId).length}</p>
        </div>
        <div className={`${adminUi.statCard} border-emerald-200 bg-emerald-50/70`}>
          <CheckSquare2 className="mb-4 h-5 w-5 text-emerald-700" />
          <p className="mb-2 text-xs font-bold text-slate-500">أنشأتها بنفسك</p>
          <p className="text-2xl font-black text-emerald-700">{selfCreatedCount}</p>
        </div>
        <div className={`${adminUi.statCard} border-violet-200 bg-violet-50/70`}>
          <CheckSquare2 className="mb-4 h-5 w-5 text-violet-700" />
          <p className="mb-2 text-xs font-bold text-slate-500">قرارات فنية مستلمة</p>
          <p className="text-2xl font-black text-violet-700">{structuredTasksCount}</p>
        </div>
      </div>

      <div className={adminUi.card}>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : data.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">لا توجد مهام لهذا الحساب الآن. يمكنك البدء بإضافة مهمة بنفسك.</p>
        ) : (
          <div className="space-y-4">
            {data.map((task) => {
              const ownership = ownershipMeta(task.ownershipSource);
              const structuredNote = parseStructuredTechnicalNote(task.notes);
              return (
                <div key={task.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-950">{task.title}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {taskTypeLabels[task.taskType] ?? task.taskType} {task.area ? `· ${task.area}` : ""} {task.dueAt ? `· ${new Date(task.dueAt).toLocaleString("ar-EG")}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={ownership.className}>
                        {ownership.label}
                      </span>
                      <span className={`${adminUi.badgeBase} ${
                        task.status === "completed"
                          ? adminSemantic.success
                          : task.status === "cancelled"
                            ? adminSemantic.danger
                            : task.status === "postponed"
                              ? adminSemantic.warning
                              : adminSemantic.info
                      }`}>
                        {taskStatusLabels[task.status] ?? task.status}
                      </span>
                    </div>
                  </div>

                  {(task.leadName || task.leadPhone) && (
                    <div className="mt-4 text-sm text-slate-600">
                      مرتبط بـ: <span className="font-bold text-slate-950">{task.leadName ?? "—"}</span>
                      {task.leadType ? <span className="text-slate-400"> · {task.leadType}</span> : null}
                      {task.leadPhone ? <span className="text-slate-500" dir="ltr"> · {task.leadPhone}</span> : null}
                    </div>
                  )}

                  {structuredNote ? (
                    <div className="mt-4 space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div>
                        <p className="text-xs font-black text-amber-700">قرار فني مستلم</p>
                        <p className="mt-1 text-xs text-slate-500">
                          هذا الرد جاءك من الخبير الفني بصياغة تنفيذية حتى تتحرك مباشرة بدون الرجوع للحالة الأصلية.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {structuredNote.items.map((line) => (
                          <div key={line} className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                            {line.replace(/^- /, "")}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : task.notes ? (
                    <p className="mt-3 text-sm leading-7 text-slate-500">{task.notes}</p>
                  ) : null}

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={taskDrafts[task.id]?.status ?? task.status}
                      onChange={(event) =>
                        setTaskDrafts((current) => ({
                          ...current,
                          [task.id]: {
                            status: event.target.value,
                            result: current[task.id]?.result ?? task.result ?? "",
                          },
                        }))
                      }
                      className={adminUi.select}
                    >
                      {taskStatusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <input
                      value={taskDrafts[task.id]?.result ?? task.result ?? ""}
                      onChange={(event) =>
                        setTaskDrafts((current) => ({
                          ...current,
                          [task.id]: {
                            status: current[task.id]?.status ?? task.status,
                            result: event.target.value,
                          },
                        }))
                      }
                      className={`md:col-span-2 ${adminUi.input}`}
                      placeholder="نتيجة التنفيذ أو ملاحظة الإغلاق"
                    />
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleUpdateTask(task.id)}
                      disabled={savingTaskId === task.id}
                      className={adminUi.primaryButton}
                    >
                      <Save className="w-4 h-4" />
                      {savingTaskId === task.id ? "جارٍ الحفظ..." : "حفظ الحالة"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className={adminUi.modalOverlay} onClick={() => setShowAdd(false)}>
          <div className={`${adminUi.modalPanel} max-w-2xl`} onClick={(event) => event.stopPropagation()}>
            <div className={adminUi.modalHeader}>
              <div>
                <h2 className="text-2xl font-black text-slate-950">إضافة مهمة جديدة</h2>
                <p className="mt-1 text-sm text-slate-500">هذه المهمة ستسجل كمهمة أنشأتها بنفسك داخل جدول اليوم.</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <input className={`md:col-span-2 ${adminUi.input}`} placeholder="عنوان المهمة" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
              <select className={adminUi.select} value={form.taskType} onChange={(e) => setForm((prev) => ({ ...prev, taskType: e.target.value as TaskFormState["taskType"] }))}>
                {availableTaskTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <input className={adminUi.input} placeholder="المنطقة" value={form.area} onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))} />
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-bold text-slate-500">موعد التنفيذ</label>
                <input className={adminUi.input} type="datetime-local" value={form.dueAt} onChange={(e) => setForm((prev) => ({ ...prev, dueAt: e.target.value }))} />
              </div>
              <textarea className={`md:col-span-2 ${adminUi.textarea} min-h-[120px] resize-none`} placeholder="ملاحظات أو تفاصيل التنفيذ" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>

            <div className={adminUi.modalFooter}>
              <button onClick={() => setShowAdd(false)} className={`flex-1 ${adminUi.secondaryButton}`}>
                إلغاء
              </button>
              <button onClick={handleCreate} disabled={saving} className={`flex-1 ${adminUi.primaryButton}`}>
                {saving ? "جارٍ الحفظ..." : "حفظ المهمة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
