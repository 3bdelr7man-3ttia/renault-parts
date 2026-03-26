import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, BadgeCheck, Building2, ClipboardList, Loader2, Plus, Users, X } from "lucide-react";

type TeamEmployee = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  role?: string | null;
  employeeRole?: "sales" | "data_entry" | "technical_expert" | "marketing_tech" | "manager" | null;
  area?: string | null;
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
  taskType:
    | "call"
    | "visit"
    | "follow_up"
    | "whatsapp"
    | "meeting"
    | "data_entry"
    | "issue_resolution"
    | "quotation"
    | "collection"
    | "field_follow_up";
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
  data_entry: "إدخال بيانات",
  issue_resolution: "حل مشكلة",
  quotation: "عرض سعر",
  collection: "تحصيل/إغلاق",
  field_follow_up: "متابعة ميدانية",
};

const taskStatusLabels: Record<string, string> = {
  pending: "معلقة",
  in_progress: "قيد التنفيذ",
  completed: "تمت",
  postponed: "مؤجلة",
  cancelled: "ملغية",
};

const employeeRoleLabels: Record<NonNullable<TeamEmployee["employeeRole"]>, string> = {
  sales: "مبيعات ومتابعة",
  data_entry: "داتا وقطع",
  technical_expert: "خبير فني",
  marketing_tech: "تسويق وتقنية",
  manager: "مدير فريق",
};

const leadStatusLabels: Record<string, string> = {
  new: "جديد",
  attempted_contact: "محاولة تواصل",
  contacted: "تم التواصل",
  interested: "مهتم",
  not_interested: "غير مهتم",
  follow_up_later: "متابعة لاحقًا",
  converted_to_order: "تحول إلى طلب",
  converted_to_application: "تحول إلى طلب انضمام",
  negotiation: "تفاوض",
  registered_on_platform: "سجل على المنصة",
};

function isOpenTask(status: string) {
  return status === "pending" || status === "in_progress" || status === "postponed";
}

export default function EmployeeTeamPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";

  const [loading, setLoading] = React.useState(true);
  const [savingLeadId, setSavingLeadId] = React.useState<number | null>(null);
  const [savingTask, setSavingTask] = React.useState(false);
  const [showTaskModal, setShowTaskModal] = React.useState(false);

  const [employees, setEmployees] = React.useState<TeamEmployee[]>([]);
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
  const openTasks = tasks.filter((task) => isOpenTask(task.status));
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const criticalLeads = allLeads.filter((lead) => !lead.assignedEmployeeId || (lead.nextFollowUpAt && new Date(lead.nextFollowUpAt).getTime() <= Date.now() + 24 * 60 * 60 * 1000));
  const urgentTasks = openTasks
    .slice()
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 5);
  const focusLeads = criticalLeads
    .slice()
    .sort((a, b) => {
      const aTime = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : 0;
      const bTime = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : 0;
      if (!a.assignedEmployeeId && b.assignedEmployeeId) return -1;
      if (a.assignedEmployeeId && !b.assignedEmployeeId) return 1;
      return aTime - bTime;
    })
    .slice(0, 6);
  const employeeLoad = employees
    .map((employee) => {
      const assignedLeads = allLeads.filter((lead) => lead.assignedEmployeeId === employee.id).length;
      const employeeOpenTasks = openTasks.filter((task) => task.employeeId === employee.id).length;
      const employeeCompletedTasks = tasks.filter((task) => task.employeeId === employee.id && task.status === "completed").length;
      return { ...employee, assignedLeads, employeeOpenTasks, employeeCompletedTasks };
    })
    .sort((a, b) => (b.assignedLeads + b.employeeOpenTasks) - (a.assignedLeads + a.employeeOpenTasks));

  return (
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[#F9E795] text-sm font-bold mb-2">إدارة الفريق</p>
            <h1 className="text-3xl font-black text-white mb-3">لوحة الإسناد للمدير والإدارة</h1>
            <p className="text-white/60 text-sm leading-7 max-w-3xl">
              هذه الصفحة مصممة لتكون مركز متابعة وقرار: ما الذي يحتاج توزيعًا الآن، من لديه حمل زائد، وما هي المهام المفتوحة التي يجب تنفيذها فورًا قبل النزول لتفاصيل الـ pipeline.
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
          <p className="text-white/40 text-xs font-bold mb-2">أعضاء الفريق المتاحون</p>
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
          <p className="text-white/40 text-xs font-bold mb-2">مهام مفتوحة الآن</p>
          <p className="text-white font-black text-2xl">{openTasks.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#151D33] border border-white/10 rounded-3xl p-10 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#F9E795]" />
                <div>
                  <h2 className="text-white font-black text-xl">مركز القرار السريع</h2>
                  <p className="text-white/45 text-sm">هذه العناصر هي التي تحتاج متابعة أو توزيعًا أو قرارًا سريعًا الآن.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="bg-[#10182C] border border-white/10 rounded-2xl p-4">
                  <p className="text-white/45 text-xs font-bold mb-2">عناصر تحتاج إسنادًا</p>
                  <p className="text-white font-black text-2xl">{unassignedCustomers + unassignedWorkshops}</p>
                  <p className="text-white/35 text-xs mt-2">عملاء أو ورش ما زالوا بدون مسؤول مباشر.</p>
                </div>
                <div className="bg-[#10182C] border border-white/10 rounded-2xl p-4">
                  <p className="text-white/45 text-xs font-bold mb-2">متابعات ومهام قريبة</p>
                  <p className="text-white font-black text-2xl">{focusLeads.length + urgentTasks.length}</p>
                  <p className="text-white/35 text-xs mt-2">عناصر يجب التحرك عليها قبل أن تتأخر.</p>
                </div>
              </div>

              <div className="space-y-3">
                {focusLeads.length === 0 && urgentTasks.length === 0 ? (
                  <p className="text-white/45 text-sm text-center py-8">لا توجد عناصر حرجة الآن. توزيع الفريق مستقر.</p>
                ) : (
                  <>
                    {focusLeads.map((lead) => (
                      <div key={`focus-${lead.type}-${lead.id}`} className="bg-[#10182C] border border-white/10 rounded-2xl p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-white font-black">{lead.name}</p>
                            <p className="text-white/45 text-sm mt-1">
                              {lead.type === "customer" ? "عميل" : "ورشة"} · {lead.area ?? "بدون منطقة"} · {leadStatusLabels[lead.status] ?? lead.status}
                            </p>
                            <p className="text-white/35 text-xs mt-2">
                              {lead.assignedEmployeeName ? `المسؤول الحالي: ${lead.assignedEmployeeName}` : "غير مسند حتى الآن"}
                              {lead.nextFollowUpAt ? ` · متابعة: ${new Date(lead.nextFollowUpAt).toLocaleString("ar-EG")}` : ""}
                            </p>
                          </div>
                          <div className={`px-3 py-2 rounded-xl text-xs font-bold border ${lead.assignedEmployeeId ? "bg-sky-500/10 text-sky-300 border-sky-500/20" : "bg-amber-500/10 text-amber-300 border-amber-500/20"}`}>
                            {lead.assignedEmployeeId ? "تحتاج متابعة" : "تحتاج إسناد"}
                          </div>
                        </div>
                      </div>
                    ))}

                    {urgentTasks.map((task) => (
                      <div key={`task-${task.id}`} className="bg-[#10182C] border border-white/10 rounded-2xl p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-white font-black">{task.title}</p>
                            <p className="text-white/45 text-sm mt-1">
                              {task.employeeName ?? "بدون موظف"} · {taskTypeLabels[task.taskType as TaskFormState["taskType"]] ?? task.taskType}
                            </p>
                            <p className="text-white/35 text-xs mt-2">
                              الاستحقاق: {new Date(task.dueAt).toLocaleString("ar-EG")}
                              {task.leadName ? ` · مرتبطة بـ ${task.leadName}` : ""}
                            </p>
                          </div>
                          <div className="px-3 py-2 rounded-xl text-xs font-bold border bg-[#F9E795]/10 text-[#F9E795] border-[#F9E795]/20">
                            {taskStatusLabels[task.status] ?? task.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-[#F9E795]" />
                <div>
                  <h2 className="text-white font-black text-xl">حمل الفريق الحالي</h2>
                  <p className="text-white/45 text-sm">من لديه فرص أكثر، ومن لديه مهام مفتوحة، ومن أنهى ما عليه.</p>
                </div>
              </div>

              <div className="space-y-3">
                {employeeLoad.map((employee) => (
                  <div key={employee.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-black">{employee.name}</p>
                        <p className="text-[#F9E795] text-xs font-bold mt-1">
                          {employee.employeeRole ? employeeRoleLabels[employee.employeeRole] : "موظف"}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-black text-lg">{employee.assignedLeads + employee.employeeOpenTasks}</p>
                        <p className="text-white/35 text-[11px]">عنصر نشط</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="bg-white/5 rounded-xl py-2">
                        <p className="text-white font-black">{employee.assignedLeads}</p>
                        <p className="text-white/35 text-[11px]">فرص</p>
                      </div>
                      <div className="bg-white/5 rounded-xl py-2">
                        <p className="text-white font-black">{employee.employeeOpenTasks}</p>
                        <p className="text-white/35 text-[11px]">مفتوحة</p>
                      </div>
                      <div className="bg-white/5 rounded-xl py-2">
                        <p className="text-white font-black">{employee.employeeCompletedTasks}</p>
                        <p className="text-white/35 text-[11px]">منتهية</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-white font-black text-xl mb-1">آخر المهام المسندة</h2>
                <p className="text-white/45 text-sm">المهام المفتوحة تأتي أولًا حتى يعرف المدير ما الذي يحتاج متابعة فورية.</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-2 rounded-xl bg-[#F9E795]/10 text-[#F9E795] border border-[#F9E795]/20 font-bold">
                  مفتوحة: {openTasks.length}
                </span>
                <span className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  تمت: {completedTasks}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {tasks
                .slice()
                .sort((a, b) => {
                  const aOpen = isOpenTask(a.status) ? 0 : 1;
                  const bOpen = isOpenTask(b.status) ? 0 : 1;
                  if (aOpen !== bOpen) return aOpen - bOpen;
                  return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
                })
                .map((task) => (
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
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <span className={`px-3 py-2 rounded-xl text-xs font-bold border ${isOpenTask(task.status) ? "bg-[#F9E795]/10 text-[#F9E795] border-[#F9E795]/20" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"}`}>
                          {taskStatusLabels[task.status] ?? task.status}
                        </span>
                        <div className="text-white/40 text-xs">
                          {new Date(task.dueAt).toLocaleString("ar-EG")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {tasks.length === 0 && <p className="text-white/45 text-sm text-center py-8">لا توجد مهام مسندة بعد.</p>}
            </div>
          </div>

          <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
            <h2 className="text-white font-black text-xl mb-2">الفريق المتاح للإسناد</h2>
            <p className="text-white/45 text-sm mb-4">
              الأدمن يرى المدير وبقية الأقسام، ومدير الفريق يرى الموظفين الذين يوزع عليهم التنفيذ اليومي.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <div key={employee.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-5">
                  <p className="text-white font-black">{employee.name}</p>
                  <p className="text-[#F9E795] text-xs font-bold mt-2">
                    {employee.employeeRole ? employeeRoleLabels[employee.employeeRole] : "موظف"}
                  </p>
                  <p className="text-white/45 text-xs mt-2" dir="ltr">{employee.phone ?? "بدون هاتف"}</p>
                  {employee.email && <p className="text-white/35 text-xs mt-1">{employee.email}</p>}
                  {employee.area && <p className="text-white/30 text-xs mt-1">المنطقة: {employee.area}</p>}
                </div>
              ))}
            </div>
          </div>

          {[{ label: "عملاء الـ pipeline", leads: customerLeads }, { label: "ورش الـ pipeline", leads: workshopLeads }].map((section) => (
            <div key={section.label} className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-white font-black text-xl">{section.label}</h2>
                  <p className="text-white/45 text-sm mt-1">هذا القسم للتفاصيل والتنفيذ بعد مراجعة مركز القرار والمهام المفتوحة.</p>
                </div>
                <span className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 text-white/70 border border-white/10">
                  {section.leads.length} عنصر
                </span>
              </div>
              <div className="space-y-4">
                {section.leads
                  .slice()
                  .sort((a, b) => {
                    if (!a.assignedEmployeeId && b.assignedEmployeeId) return -1;
                    if (a.assignedEmployeeId && !b.assignedEmployeeId) return 1;
                    const aTime = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : Number.MAX_SAFE_INTEGER;
                    const bTime = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : Number.MAX_SAFE_INTEGER;
                    return aTime - bTime;
                  })
                  .map((lead) => (
                  <div key={lead.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-white font-black text-lg">{lead.name}</p>
                          <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-[#F9E795]/10 text-[#F9E795] border border-[#F9E795]/20">
                            {leadStatusLabels[lead.status] ?? lead.status}
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
                                {employee.name} {employee.employeeRole ? `· ${employeeRoleLabels[employee.employeeRole]}` : ""}
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
                          الحالي: {lead.assignedEmployeeName ?? "غير مسند"} · يمكن توجيه الحالة إلى المبيعات والمتابعة أو الخبير الفني أو إدخال البيانات حسب الحاجة
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
        </>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setShowTaskModal(false)}>
          <div className="w-full max-w-2xl bg-[#111826] border border-white/10 rounded-3xl p-6 md:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-2xl font-black">إسناد مهمة جديدة</h2>
                <p className="text-white/45 text-sm mt-1">اختر عضو الفريق والفرصة المرتبطة ثم احفظ المهمة.</p>
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
                <option value="" className="bg-[#111826]">اختر عضو الفريق</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id} className="bg-[#111826]">
                    {employee.name} {employee.employeeRole ? `· ${employeeRoleLabels[employee.employeeRole]}` : ""}
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
        كذلك يظل الأدمن قادرًا على تكليف مدير الفريق، بينما يوزع مدير الفريق العملاء والورش والمهام اليومية على بقية أعضاء الفريق حسب الدور.
      </div>
    </div>
  );
}
