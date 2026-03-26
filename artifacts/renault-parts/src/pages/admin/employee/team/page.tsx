import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck, Building2, ClipboardList, Loader2, Plus, Users, X } from "lucide-react";

type SalesRep = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
};

type TeamLead = {
  id: number;
  type: "customer" | "workshop";
  name: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  area?: string | null;
  source: string;
  status: string;
  assignedEmployeeId?: number | null;
  assignedEmployeeName?: string | null;
  createdByUserName?: string | null;
  registeredUserId?: number | null;
  registeredUserName?: string | null;
  convertedOrderId?: number | null;
  convertedWorkshopId?: number | null;
  nextFollowUpAt?: string | null;
};

type TeamTask = {
  id: number;
  employeeId: number;
  employeeName?: string | null;
  leadId?: number | null;
  leadName?: string | null;
  title: string;
  taskType: string;
  area?: string | null;
  dueAt: string;
  status: string;
  createdByUserName?: string | null;
};

type TaskFormState = {
  employeeId: string;
  leadId: string;
  title: string;
  taskType: "call" | "visit" | "follow_up" | "whatsapp" | "meeting";
  area: string;
  dueAt: string;
  notes: string;
};

const emptyTaskForm: TaskFormState = {
  employeeId: "",
  leadId: "",
  title: "",
  taskType: "call",
  area: "",
  dueAt: "",
  notes: "",
};

const taskTypeLabels: Record<TaskFormState["taskType"], string> = {
  call: "مكالمة",
  visit: "زيارة",
  follow_up: "متابعة",
  whatsapp: "واتساب",
  meeting: "اجتماع",
};

export default function EmployeeTeamPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";

  const [loading, setLoading] = React.useState(true);
  const [savingLeadId, setSavingLeadId] = React.useState<number | null>(null);
  const [savingTask, setSavingTask] = React.useState(false);
  const [showTaskModal, setShowTaskModal] = React.useState(false);

  const [employees, setEmployees] = React.useState<SalesRep[]>([]);
  const [customerLeads, setCustomerLeads] = React.useState<TeamLead[]>([]);
  const [workshopLeads, setWorkshopLeads] = React.useState<TeamLead[]>([]);
  const [tasks, setTasks] = React.useState<TeamTask[]>([]);
  const [assignmentDrafts, setAssignmentDrafts] = React.useState<Record<number, string>>({});
  const [taskForm, setTaskForm] = React.useState<TaskFormState>(emptyTaskForm);

  const loadPage = React.useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [employeesResponse, customerLeadsResponse, workshopLeadsResponse, tasksResponse] = await Promise.all([
        fetch(`${base}/api/admin/employee/team/employees`, { headers }),
        fetch(`${base}/api/admin/employee/team/leads?type=customer`, { headers }),
        fetch(`${base}/api/admin/employee/team/leads?type=workshop`, { headers }),
        fetch(`${base}/api/admin/employee/team/tasks`, { headers }),
      ]);

      const [employeesResult, customerLeadsResult, workshopLeadsResult, tasksResult] = await Promise.all([
        employeesResponse.json().catch(() => null),
        customerLeadsResponse.json().catch(() => null),
        workshopLeadsResponse.json().catch(() => null),
        tasksResponse.json().catch(() => null),
      ]);

      if (!employeesResponse.ok || !customerLeadsResponse.ok || !workshopLeadsResponse.ok || !tasksResponse.ok) {
        throw new Error(
          employeesResult?.error ||
            customerLeadsResult?.error ||
            workshopLeadsResult?.error ||
            tasksResult?.error ||
            "تعذر تحميل بيانات إدارة الفريق الآن.",
        );
      }

      const nextCustomerLeads = Array.isArray(customerLeadsResult) ? customerLeadsResult : [];
      const nextWorkshopLeads = Array.isArray(workshopLeadsResult) ? workshopLeadsResult : [];

      setEmployees(Array.isArray(employeesResult) ? employeesResult : []);
      setCustomerLeads(nextCustomerLeads);
      setWorkshopLeads(nextWorkshopLeads);
      setTasks(Array.isArray(tasksResult) ? tasksResult : []);
      setAssignmentDrafts(
        [...nextCustomerLeads, ...nextWorkshopLeads].reduce<Record<number, string>>((acc, lead) => {
          acc[lead.id] = lead.assignedEmployeeId ? String(lead.assignedEmployeeId) : "";
          return acc;
        }, {}),
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "تعذر تحميل بيانات إدارة الفريق الآن.",
      });
    } finally {
      setLoading(false);
    }
  }, [base, toast, token]);

  React.useEffect(() => {
    loadPage();
  }, [loadPage]);

  const saveAssignment = async (lead: TeamLead) => {
    if (!token) return;

    setSavingLeadId(lead.id);
    try {
      const response = await fetch(`${base}/api/admin/employee/team/leads/${lead.id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: assignmentDrafts[lead.id] ? Number(assignmentDrafts[lead.id]) : null,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "فشل حفظ الإسناد");
      }

      toast({ title: "تم حفظ الإسناد", description: "تم تحديث الموظف المسؤول عن هذه الفرصة." });
      await loadPage();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل حفظ الإسناد",
      });
    } finally {
      setSavingLeadId(null);
    }
  };

  const handleCreateTask = async () => {
    if (!token) return;
    if (!taskForm.employeeId || !taskForm.title || !taskForm.dueAt) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "اختر الموظف وأدخل عنوان المهمة وموعدها." });
      return;
    }

    setSavingTask(true);
    try {
      const response = await fetch(`${base}/api/admin/employee/team/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: Number(taskForm.employeeId),
          leadId: taskForm.leadId ? Number(taskForm.leadId) : null,
          title: taskForm.title,
          taskType: taskForm.taskType,
          area: taskForm.area || null,
          dueAt: new Date(taskForm.dueAt).toISOString(),
          notes: taskForm.notes || null,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "فشل إنشاء المهمة");
      }

      toast({ title: "تمت إضافة المهمة", description: "المهمة أصبحت مسندة ضمن جدول الموظف المحدد." });
      setShowTaskModal(false);
      setTaskForm(emptyTaskForm);
      await loadPage();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل إنشاء المهمة",
      });
    } finally {
      setSavingTask(false);
    }
  };

  const allLeads = [...customerLeads, ...workshopLeads];
  const unassignedCustomers = customerLeads.filter((lead) => !lead.assignedEmployeeId).length;
  const unassignedWorkshops = workshopLeads.filter((lead) => !lead.assignedEmployeeId).length;
  const registeredCustomers = customerLeads.filter((lead) => lead.registeredUserId).length;

  return (
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[#F9E795] text-sm font-bold mb-2">إدارة الفريق</p>
            <h1 className="text-3xl font-black text-white mb-3">لوحة الإسناد للمدير والإدارة</h1>
            <p className="text-white/60 text-sm leading-7 max-w-3xl">
              هذه الصفحة تربط pipeline بالكامل: العملاء والورش غير الموزعة، فرص المبيعات التي تم تسجيلها على المنصة،
              والمهام التي يوزعها المدير أو الأدمن على موظفي المبيعات.
            </p>
          </div>
          <button
            onClick={() => setShowTaskModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black text-sm hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            إسناد مهمة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Users className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">موظفو المبيعات</p>
          <p className="text-white font-black text-2xl">{employees.length}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <BadgeCheck className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">عملاء غير موزعين</p>
          <p className="text-white font-black text-2xl">{unassignedCustomers}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Building2 className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">ورش غير موزعة</p>
          <p className="text-white font-black text-2xl">{unassignedWorkshops}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <ClipboardList className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">تم تسجيلهم على المنصة</p>
          <p className="text-white font-black text-2xl">{registeredCustomers}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#151D33] border border-white/10 rounded-3xl p-10 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
            <h2 className="text-white font-black text-xl mb-4">فريق المبيعات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <div key={employee.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-5">
                  <p className="text-white font-black">{employee.name}</p>
                  <p className="text-white/45 text-xs mt-2" dir="ltr">{employee.phone ?? "بدون هاتف"}</p>
                  {employee.email && <p className="text-white/35 text-xs mt-1">{employee.email}</p>}
                </div>
              ))}
            </div>
          </div>

          {[{ label: "عملاء الـ pipeline", leads: customerLeads }, { label: "ورش الـ pipeline", leads: workshopLeads }].map((section) => (
            <div key={section.label} className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
              <h2 className="text-white font-black text-xl mb-4">{section.label}</h2>
              <div className="space-y-4">
                {section.leads.map((lead) => (
                  <div key={lead.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-white font-black text-lg">{lead.name}</p>
                          <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-[#F9E795]/10 text-[#F9E795] border border-[#F9E795]/20">
                            {lead.status}
                          </span>
                          {lead.registeredUserId && (
                            <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              تم التسجيل على المنصة {lead.registeredUserName ? `· ${lead.registeredUserName}` : ""}
                            </span>
                          )}
                        </div>
                        <p className="text-white/55 text-sm" dir="ltr">
                          {lead.phone} {lead.email ? `· ${lead.email}` : ""}
                        </p>
                        <p className="text-white/45 text-sm">
                          {lead.area ?? "بدون منطقة"} · المصدر: {lead.source} · أُضيف بواسطة: {lead.createdByUserName ?? "غير محدد"}
                        </p>
                        {lead.nextFollowUpAt && (
                          <p className="text-white/35 text-xs">
                            متابعة قادمة: {new Date(lead.nextFollowUpAt).toLocaleString("ar-EG")}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 xl:min-w-[280px]">
                        <label className="text-white/45 text-xs font-bold">الموظف المسؤول</label>
                        <div className="flex items-center gap-2">
                          <select
                            value={assignmentDrafts[lead.id] ?? ""}
                            onChange={(event) => setAssignmentDrafts((current) => ({ ...current, [lead.id]: event.target.value }))}
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                          >
                            <option value="" className="bg-[#111826]">غير مسند</option>
                            {employees.map((employee) => (
                              <option key={employee.id} value={employee.id} className="bg-[#111826]">
                                {employee.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => saveAssignment(lead)}
                            disabled={savingLeadId === lead.id}
                            className="px-4 py-3 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black text-sm disabled:opacity-50"
                          >
                            {savingLeadId === lead.id ? "جارٍ..." : "حفظ"}
                          </button>
                        </div>
                        <p className="text-white/35 text-xs">
                          الحالي: {lead.assignedEmployeeName ?? "غير مسند"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {section.leads.length === 0 && (
                  <p className="text-white/45 text-sm text-center py-8">لا توجد عناصر في هذا القسم الآن.</p>
                )}
              </div>
            </div>
          ))}

          <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
            <h2 className="text-white font-black text-xl mb-4">آخر المهام المسندة</h2>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-white font-black">{task.title}</p>
                      <p className="text-white/45 text-sm mt-1">
                        {taskTypeLabels[task.taskType as TaskFormState["taskType"]] ?? task.taskType}
                        {task.employeeName ? ` · ${task.employeeName}` : ""}
                        {task.leadName ? ` · ${task.leadName}` : ""}
                        {task.area ? ` · ${task.area}` : ""}
                      </p>
                    </div>
                    <div className="text-white/40 text-xs">
                      {new Date(task.dueAt).toLocaleString("ar-EG")}
                    </div>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-white/45 text-sm text-center py-8">لا توجد مهام مسندة بعد.</p>}
            </div>
          </div>
        </>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setShowTaskModal(false)}>
          <div className="w-full max-w-2xl bg-[#111826] border border-white/10 rounded-3xl p-6 md:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-2xl font-black">إسناد مهمة جديدة</h2>
                <p className="text-white/45 text-sm mt-1">اختر موظف المبيعات والفرصة المرتبطة ثم احفظ المهمة.</p>
              </div>
              <button onClick={() => setShowTaskModal(false)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={taskForm.employeeId}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, employeeId: event.target.value }))}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
              >
                <option value="" className="bg-[#111826]">اختر موظف المبيعات</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id} className="bg-[#111826]">
                    {employee.name}
                  </option>
                ))}
              </select>

              <select
                value={taskForm.leadId}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, leadId: event.target.value }))}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
              >
                <option value="" className="bg-[#111826]">بدون فرصة مرتبطة</option>
                {allLeads.map((lead) => (
                  <option key={`${lead.type}-${lead.id}`} value={lead.id} className="bg-[#111826]">
                    {lead.name} · {lead.type === "customer" ? "عميل" : "ورشة"}
                  </option>
                ))}
              </select>

              <input
                className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none"
                placeholder="عنوان المهمة"
                value={taskForm.title}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
              />

              <select
                value={taskForm.taskType}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, taskType: event.target.value as TaskFormState["taskType"] }))}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
              >
                {Object.entries(taskTypeLabels).map(([value, label]) => (
                  <option key={value} value={value} className="bg-[#111826]">
                    {label}
                  </option>
                ))}
              </select>

              <input
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none"
                placeholder="المنطقة"
                value={taskForm.area}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, area: event.target.value }))}
              />

              <div className="md:col-span-2">
                <label className="block text-white/50 text-xs font-bold mb-2">موعد التنفيذ</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                  type="datetime-local"
                  value={taskForm.dueAt}
                  onChange={(event) => setTaskForm((prev) => ({ ...prev, dueAt: event.target.value }))}
                />
              </div>

              <textarea
                className="md:col-span-2 min-h-[120px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none resize-none"
                placeholder="ملاحظات المهمة"
                value={taskForm.notes}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>

            <div className="mt-6 flex flex-col-reverse md:flex-row gap-3">
              <button onClick={() => setShowTaskModal(false)} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold hover:bg-white/10 transition-all">
                إلغاء
              </button>
              <button onClick={handleCreateTask} disabled={savingTask} className="flex-1 py-3 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black hover:opacity-90 transition-all disabled:opacity-50">
                {savingTask ? "جارٍ الحفظ..." : "حفظ المهمة"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-white/35 text-xs leading-7">
        المسار الجديد يضمن أن العميل عندما يسجل فعليًا في المنصة لا يظهر كنسخة منفصلة، بل يظل داخل الـ pipeline نفسها مع علامة واضحة أنه أصبح مستخدمًا مسجلًا.
        المدير أو الأدمن يظل قادرًا على إعادة الإسناد أو إضافة مهام متابعة حسب الحاجة.
      </div>
    </div>
  );
}
