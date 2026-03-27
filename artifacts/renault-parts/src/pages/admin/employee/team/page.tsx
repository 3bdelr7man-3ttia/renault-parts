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
  employeeId: "",
  leadId: "",
  title: "",
  taskType: "call",
  area: "",
  dueAt: "",
  notes: "",
};

function getTechnicalAssignmentHint(taskType: TaskFormState["taskType"]) {
  if (taskType === "parts_return_review") {
    return "سيظهر للخبير كحالة مرتجع/قطعة ليحدد هل تُقبل أو تُراجع أو تُستبدل.";
  }
  if (taskType === "workshop_support") {
    return "سيظهر للخبير كحالة دعم ورشة ليكتب الرأي الفني أو ينسق القرار مع الورشة.";
  }
  if (taskType === "issue_resolution") {
    return "سيظهر للخبير كحالة مشكلة قائمة تحتاج تشخيصًا وخطوة تنفيذية واضحة.";
  }
  if (taskType === "expert_opinion") {
    return "سيظهر للخبير كطلب رأي فني مباشر، ثم يخرج رده منظمًا للفريق.";
  }
  return "سيظهر للخبير داخل مساحة الحالات الفنية كحالة جاهزة للرد، وليس كمهمة عامة فقط.";
}

const taskTypeLabels: Record<TaskFormState["taskType"], string> = {
  call: "مكالمة",
  visit: "زيارة",
  follow_up: "متابعة",
  whatsapp: "واتساب",
  meeting: "اجتماع",
  data_entry: "إدخال بيانات",
  issue_resolution: "حل مشكلة",
  technical_review: "مراجعة فنية",
  expert_opinion: "رأي خبير",
  parts_return_review: "مراجعة مرتجع",
  workshop_support: "دعم ورشة",
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

function getTaskTypesForAssignee(employeeRole?: TeamEmployee["employeeRole"]) {
  if (employeeRole === "technical_expert") {
    return (["technical_review", "expert_opinion", "issue_resolution", "parts_return_review", "workshop_support", "follow_up"] as const).map((value) => ({
      value,
      label: taskTypeLabels[value],
    }));
  }
  if (employeeRole === "data_entry") {
    return (["data_entry", "follow_up", "quotation"] as const).map((value) => ({
      value,
      label: taskTypeLabels[value],
    }));
  }
  if (employeeRole === "marketing_tech") {
    return (["meeting", "follow_up", "data_entry"] as const).map((value) => ({
      value,
      label: taskTypeLabels[value],
    }));
  }
  if (employeeRole === "manager") {
    return (["follow_up", "meeting", "field_follow_up"] as const).map((value) => ({
      value,
      label: taskTypeLabels[value],
    }));
  }
  return (["call", "visit", "follow_up", "whatsapp", "meeting", "quotation", "collection", "field_follow_up"] as const).map((value) => ({
    value,
    label: taskTypeLabels[value],
  }));
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
  const selectedEmployee = React.useMemo(() => employees.find((employee) => String(employee.id) === taskForm.employeeId) ?? null, [employees, taskForm.employeeId]);
  const taskTypeOptions = React.useMemo(() => getTaskTypesForAssignee(selectedEmployee?.employeeRole ?? null), [selectedEmployee?.employeeRole]);
  const allLeads = React.useMemo(() => [...customerLeads, ...workshopLeads], [customerLeads, workshopLeads]);
  const selectedLead = React.useMemo(() => allLeads.find((lead) => String(lead.id) === taskForm.leadId) ?? null, [allLeads, taskForm.leadId]);
  const isTechnicalAssignee = selectedEmployee?.employeeRole === "technical_expert";

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

  React.useEffect(() => {
    if (!taskTypeOptions.some((option) => option.value === taskForm.taskType)) {
      setTaskForm((prev) => ({
        ...prev,
        taskType: taskTypeOptions[0]?.value ?? "follow_up",
      }));
    }
  }, [taskForm.taskType, taskTypeOptions]);

  React.useEffect(() => {
    if (!isTechnicalAssignee || !selectedLead) return;

    setTaskForm((prev) => ({
      ...prev,
      title:
        prev.title.trim().length > 0 && !prev.title.startsWith("إحالة فنية:")
          ? prev.title
          : `إحالة فنية: ${selectedLead.name}`,
      area: prev.area || selectedLead.area || "",
    }));
  }, [isTechnicalAssignee, selectedLead]);

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
    if (isTechnicalAssignee && !taskForm.leadId) {
      toast({
        variant: "destructive",
        title: "حالة فنية ناقصة",
        description: "لازم تختار عميلًا أو ورشة مرتبطة حتى تظهر للخبير مباشرة داخل مساحة الحالات الفنية.",
      });
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

      toast({
        title: isTechnicalAssignee ? "تم تحويل الحالة الفنية" : "تمت إضافة المهمة",
        description:
          result?.technicalCaseSync?.message ||
          (isTechnicalAssignee
            ? "ظهرت الحالة داخل مساحة الخبير الفني وأصبحت جاهزة للرد الفني المنظم."
            : "المهمة أصبحت مسندة ضمن جدول الموظف المحدد."),
      });
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

  const unassignedCustomers = customerLeads.filter((lead) => !lead.assignedEmployeeId).length;
  const unassignedWorkshops = workshopLeads.filter((lead) => !lead.assignedEmployeeId).length;
  const registeredCustomers = customerLeads.filter((lead) => lead.registeredUserId).length;
  const openTasks = tasks.filter((task) => isOpenTask(task.status));
  const criticalLeads = allLeads.filter((lead) => !lead.assignedEmployeeId || (lead.nextFollowUpAt && new Date(lead.nextFollowUpAt).getTime() <= Date.now() + 24 * 60 * 60 * 1000));
  const urgentTasks = openTasks
    .slice()
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 5);
  const quickAssignLeads = allLeads
    .filter((lead) => !lead.assignedEmployeeId)
    .slice()
    .sort((a, b) => {
      const aTime = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : 0;
      const bTime = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : 0;
      return aTime - bTime;
    })
    .slice(0, 4);
  const quickFollowUpLeads = criticalLeads
    .filter((lead) => !!lead.assignedEmployeeId)
    .slice()
    .sort((a, b) => {
      const aTime = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })
    .slice(0, 4);
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
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-sm font-black text-[#C8974A]">إدارة الفريق</p>
            <h1 className="mb-3 text-3xl font-black text-slate-950">لوحة الإسناد للمدير والإدارة</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-500">
              هذه الصفحة مصممة لتكون مركز متابعة وقرار: ما الذي يحتاج توزيعًا الآن، من لديه حمل زائد، وما هي المهام المفتوحة التي يجب تنفيذها فورًا قبل النزول لتفاصيل الـ pipeline.
            </p>
          </div>
          <button
            onClick={() => setShowTaskModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition-all hover:bg-slate-800"
          >
            <Plus className="w-4 h-4" />
            إسناد مهمة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Users className="mb-4 h-5 w-5 text-slate-700" />
          <p className="mb-2 text-xs font-bold text-slate-500">أعضاء الفريق المتاحون</p>
          <p className="text-2xl font-black text-slate-950">{employees.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <BadgeCheck className="mb-4 h-5 w-5 text-amber-600" />
          <p className="mb-2 text-xs font-bold text-slate-500">عملاء غير موزعين</p>
          <p className="text-2xl font-black text-slate-950">{unassignedCustomers}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Building2 className="mb-4 h-5 w-5 text-violet-600" />
          <p className="mb-2 text-xs font-bold text-slate-500">ورش غير موزعة</p>
          <p className="text-2xl font-black text-slate-950">{unassignedWorkshops}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ClipboardList className="mb-4 h-5 w-5 text-sky-600" />
          <p className="mb-2 text-xs font-bold text-slate-500">مهام مفتوحة الآن</p>
          <p className="text-2xl font-black text-slate-950">{openTasks.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <h2 className="text-xl font-black text-slate-950">مركز القرار السريع</h2>
                  <p className="text-sm text-slate-500">من هنا يفترض أن يقدر المدير أن يعيّن مباشرة أو يلتقط ما يحتاج متابعة فورية، بدون النزول الطويل في الصفحة.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-bold text-slate-500">عناصر تحتاج إسنادًا</p>
                  <p className="text-2xl font-black text-slate-950">{unassignedCustomers + unassignedWorkshops}</p>
                  <p className="mt-2 text-xs text-slate-500">عملاء أو ورش ما زالوا بدون مسؤول مباشر.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-bold text-slate-500">متابعات ومهام قريبة</p>
                  <p className="text-2xl font-black text-slate-950">{quickFollowUpLeads.length + urgentTasks.length}</p>
                  <p className="mt-2 text-xs text-slate-500">عناصر يجب التحرك عليها قبل أن تتأخر.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">إسناد مباشر الآن</p>
                      <p className="mt-1 text-xs text-slate-500">هذه العناصر غير مسندة، والقرار المتوقع هنا هو تحديد المسؤول فورًا.</p>
                    </div>
                    <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                      {quickAssignLeads.length} الآن
                    </span>
                  </div>
                  {quickAssignLeads.length ? quickAssignLeads.map((lead) => (
                    <div key={`assign-${lead.type}-${lead.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-2">
                        <div>
                          <p className="font-black text-slate-950">{lead.name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {lead.type === "customer" ? "عميل" : "ورشة"} · {lead.area ?? "بدون منطقة"} · {leadStatusLabels[lead.status] ?? lead.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={assignmentDrafts[lead.id] ?? ""}
                            onChange={(event) => setAssignmentDrafts((current) => ({ ...current, [lead.id]: event.target.value }))}
                            className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all focus:border-slate-400"
                          >
                            <option value="">اختر المسؤول الآن</option>
                            {employees.map((employee) => (
                              <option key={employee.id} value={employee.id}>
                                {employee.name} {employee.employeeRole ? `· ${employeeRoleLabels[employee.employeeRole]}` : ""}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => saveAssignment(lead)}
                            disabled={savingLeadId === lead.id || !(assignmentDrafts[lead.id] ?? "")}
                            className="min-w-[96px] rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition-all hover:bg-slate-800 disabled:opacity-50"
                          >
                            {savingLeadId === lead.id ? "جارٍ..." : "إسناد"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="py-6 text-center text-sm text-slate-500">لا توجد عناصر غير مسندة الآن.</p>
                  )}
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">متابعة تحتاج قرارًا الآن</p>
                      <p className="mt-1 text-xs text-slate-500">هذه ليست للتوزيع، بل لالتقاط ما قد يتأخر أو يحتاج تدخل المدير.</p>
                    </div>
                    <span className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">
                      {quickFollowUpLeads.length + urgentTasks.length}
                    </span>
                  </div>
                  {quickFollowUpLeads.length === 0 && urgentTasks.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">لا توجد عناصر متابعة حرجة الآن.</p>
                  ) : (
                    <>
                      {quickFollowUpLeads.map((lead) => (
                        <div key={`followup-${lead.type}-${lead.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <p className="font-black text-slate-950">{lead.name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {lead.assignedEmployeeName ?? "غير محدد"} · {lead.type === "customer" ? "عميل" : "ورشة"}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {lead.nextFollowUpAt ? `المتابعة: ${new Date(lead.nextFollowUpAt).toLocaleString("ar-EG")}` : "تحتاج تحديد متابعة"} · {lead.area ?? "بدون منطقة"}
                          </p>
                        </div>
                      ))}
                      {urgentTasks.map((task) => (
                        <div key={`task-${task.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <p className="font-black text-slate-950">{task.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {task.employeeName ?? "بدون موظف"} · {taskTypeLabels[task.taskType as TaskFormState["taskType"]] ?? task.taskType}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            الاستحقاق: {new Date(task.dueAt).toLocaleString("ar-EG")}
                            {task.leadName ? ` · مرتبطة بـ ${task.leadName}` : ""}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-slate-700" />
                <div>
                  <h2 className="text-xl font-black text-slate-950">حمل الفريق الحالي</h2>
                  <p className="text-sm text-slate-500">من لديه فرص أكثر، ومن لديه مهام مفتوحة، ومن أنهى ما عليه.</p>
                </div>
              </div>

              <div className="space-y-3">
                {employeeLoad.map((employee) => (
                  <div key={employee.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-950">{employee.name}</p>
                        <p className="mt-1 text-xs font-bold text-[#C8974A]">
                          {employee.employeeRole ? employeeRoleLabels[employee.employeeRole] : "موظف"}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-black text-slate-950">{employee.assignedLeads + employee.employeeOpenTasks}</p>
                        <p className="text-[11px] text-slate-500">عنصر نشط</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="rounded-xl border border-slate-200 bg-white py-2">
                        <p className="font-black text-slate-950">{employee.assignedLeads}</p>
                        <p className="text-[11px] text-slate-500">فرص</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white py-2">
                        <p className="font-black text-slate-950">{employee.employeeOpenTasks}</p>
                        <p className="text-[11px] text-slate-500">مفتوحة</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white py-2">
                        <p className="font-black text-slate-950">{employee.employeeCompletedTasks}</p>
                        <p className="text-[11px] text-slate-500">منتهية</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-black text-slate-950">الفريق المتاح للإسناد</h2>
            <p className="mb-4 text-sm text-slate-500">
              الأدمن يرى المدير وبقية الأقسام، ومدير الفريق يرى الموظفين الذين يوزع عليهم التنفيذ اليومي.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <div key={employee.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="font-black text-slate-950">{employee.name}</p>
                  <p className="mt-2 text-xs font-bold text-[#C8974A]">
                    {employee.employeeRole ? employeeRoleLabels[employee.employeeRole] : "موظف"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500" dir="ltr">{employee.phone ?? "بدون هاتف"}</p>
                  {employee.email && <p className="mt-1 text-xs text-slate-500">{employee.email}</p>}
                  {employee.area && <p className="mt-1 text-xs text-slate-400">المنطقة: {employee.area}</p>}
                </div>
              ))}
            </div>
          </div>

          {[{ label: "عملاء الـ pipeline", leads: customerLeads }, { label: "ورش الـ pipeline", leads: workshopLeads }].map((section) => (
            <div key={section.label} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950">{section.label}</h2>
                  <p className="mt-1 text-sm text-slate-500">هذا القسم للتفاصيل والتنفيذ بعد مراجعة مركز القرار والمهام المفتوحة.</p>
                </div>
                <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
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
                  <div key={lead.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-black text-slate-950">{lead.name}</p>
                          <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                            {leadStatusLabels[lead.status] ?? lead.status}
                          </span>
                          {lead.registeredUserId && (
                            <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                              تم التسجيل على المنصة {lead.registeredUserName ? `· ${lead.registeredUserName}` : ""}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500" dir="ltr">
                          {lead.phone} {lead.email ? `· ${lead.email}` : ""}
                        </p>
                        <p className="text-sm text-slate-500">
                          {lead.area ?? "بدون منطقة"} · المصدر: {lead.source} · أُضيف بواسطة: {lead.createdByUserName ?? "غير محدد"}
                        </p>
                        {lead.nextFollowUpAt && (
                          <p className="text-xs text-slate-500">
                            متابعة قادمة: {new Date(lead.nextFollowUpAt).toLocaleString("ar-EG")}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 xl:min-w-[280px]">
                        <label className="text-xs font-bold text-slate-500">الموظف المسؤول</label>
                        <div className="flex items-center gap-2">
                          <select
                            value={assignmentDrafts[lead.id] ?? ""}
                            onChange={(event) => setAssignmentDrafts((current) => ({ ...current, [lead.id]: event.target.value }))}
                            className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all focus:border-slate-400"
                          >
                            <option value="">غير مسند</option>
                            {employees.map((employee) => (
                              <option key={employee.id} value={employee.id}>
                                {employee.name} {employee.employeeRole ? `· ${employeeRoleLabels[employee.employeeRole]}` : ""}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => saveAssignment(lead)}
                            disabled={savingLeadId === lead.id}
                            className="min-w-[88px] rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition-all hover:bg-slate-800 disabled:opacity-50"
                          >
                            {savingLeadId === lead.id ? "جارٍ..." : "حفظ"}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">
                          الحالي: {lead.assignedEmployeeName ?? "غير مسند"} · يمكن توجيه الحالة إلى المبيعات والمتابعة أو الخبير الفني أو إدخال البيانات حسب الحاجة
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {section.leads.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-500">لا توجد عناصر في هذا القسم الآن.</p>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4" onClick={() => setShowTaskModal(false)}>
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl md:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-950">{isTechnicalAssignee ? "تحويل إلى حالة فنية" : "إسناد مهمة جديدة"}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isTechnicalAssignee
                    ? "اختر الحالة المرتبطة وحدد ما الذي تريد من الخبير الفني أن يحسمه أو يرد عليه."
                    : "اختر عضو الفريق والفرصة المرتبطة ثم احفظ المهمة."}
                </p>
              </div>
              <button onClick={() => setShowTaskModal(false)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={taskForm.employeeId}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, employeeId: event.target.value }))}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all focus:border-slate-400"
              >
                <option value="">اختر عضو الفريق</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} {employee.employeeRole ? `· ${employeeRoleLabels[employee.employeeRole]}` : ""}
                  </option>
                ))}
              </select>
              {isTechnicalAssignee ? (
                <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="mb-2 text-xs font-black text-amber-700">هذه ليست مهمة عامة</p>
                  <p className="text-sm leading-7 text-slate-700">
                    بمجرد الحفظ ستتحول هذه الإحالة إلى حالة داخل مساحة الخبير الفني، وسيظهر له العميل أو الورشة المطلوب الرد عليها مباشرة.
                  </p>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    {getTechnicalAssignmentHint(taskForm.taskType)}
                  </p>
                </div>
              ) : null}

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  {isTechnicalAssignee ? "الحالة المرتبطة المطلوبة للخبير" : "الفرصة المرتبطة"}
                </label>
                <select
                  value={taskForm.leadId}
                  onChange={(event) => setTaskForm((prev) => ({ ...prev, leadId: event.target.value }))}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all focus:border-slate-400"
                >
                  {!isTechnicalAssignee ? <option value="">بدون فرصة مرتبطة</option> : null}
                  {allLeads.map((lead) => (
                    <option key={`${lead.type}-${lead.id}`} value={lead.id}>
                      {lead.name} · {lead.type === "customer" ? "عميل" : "ورشة"}
                    </option>
                  ))}
                </select>
                {isTechnicalAssignee && selectedLead ? (
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    ستظهر للخبير كحالة تخص {selectedLead.type === "workshop" ? "ورشة" : "عميل"} باسم {selectedLead.name}
                    {selectedLead.area ? ` في ${selectedLead.area}` : ""}.
                  </p>
                ) : null}
              </div>

              <input
                className="md:col-span-2 h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400"
                placeholder={isTechnicalAssignee ? "عنوان الإحالة الفنية" : "عنوان المهمة"}
                value={taskForm.title}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
              />

              <select
                value={taskForm.taskType}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, taskType: event.target.value as TaskFormState["taskType"] }))}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all focus:border-slate-400"
              >
                {taskTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400"
                placeholder="المنطقة"
                value={taskForm.area}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, area: event.target.value }))}
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-bold text-slate-500">موعد التنفيذ</label>
                <input
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all focus:border-slate-400"
                  type="datetime-local"
                  value={taskForm.dueAt}
                  onChange={(event) => setTaskForm((prev) => ({ ...prev, dueAt: event.target.value }))}
                />
              </div>

              <textarea
                className="md:col-span-2 min-h-[120px] resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400"
                placeholder={isTechnicalAssignee ? "اشرح ما المطلوب من الخبير: تشخيص، رأي فني، حسم مرتجع، أو تنسيق مع ورشة..." : "ملاحظات المهمة"}
                value={taskForm.notes}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>

            <div className="mt-6 flex flex-col-reverse md:flex-row gap-3">
              <button onClick={() => setShowTaskModal(false)} className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-3 font-bold text-slate-600 transition-all hover:bg-slate-100">
                إلغاء
              </button>
              <button onClick={handleCreateTask} disabled={savingTask} className="flex-1 rounded-2xl bg-slate-950 py-3 font-black text-white transition-all hover:bg-slate-800 disabled:opacity-50">
                {savingTask ? "جارٍ الحفظ..." : isTechnicalAssignee ? "تحويل إلى حالة فنية" : "حفظ المهمة"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs leading-7 text-slate-500">
        المسار الجديد يضمن أن العميل عندما يسجل فعليًا في المنصة لا يظهر كنسخة منفصلة، بل يظل داخل الـ pipeline نفسها مع علامة واضحة أنه أصبح مستخدمًا مسجلًا.
        كذلك يظل الأدمن قادرًا على تكليف مدير الفريق، بينما يوزع مدير الفريق العملاء والورش والمهام اليومية على بقية أعضاء الفريق حسب الدور.
      </div>
    </div>
  );
}
