import React from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { getRoleLabel, normalizeEmployeeRole } from "@/lib/permissions";
import { AlertTriangle, ArrowLeft, ArrowRightLeft, BarChart2, Building2, ClipboardList, Database, FileText, Loader2, Package2, PhoneCall, Star, Stethoscope, Target, Users, Wrench } from "lucide-react";

type SalesSummary = {
  totalCustomers: number;
  newCustomersToday: number;
  followUpsToday: number;
  convertedCustomers: number;
  assignedWorkshops: number;
  activeTasks: number;
  openTasks: Array<{
    id: number;
    title: string;
    taskType: string;
    dueAt: string;
    status: string;
    area?: string | null;
  }>;
};

type TechnicalSummary = {
  totalCases: number;
  customerCases: number;
  workshopCases: number;
  returnsCases: number;
  dueToday: number;
  resolvedCases: number;
  activeTasks: number;
  openCases: Array<{
    id: number;
    type: "customer" | "workshop";
    name: string;
    status: string;
    area?: string | null;
    nextFollowUpAt?: string | null;
  }>;
};

type DataEntrySummary = {
  total: number;
  unassigned: number;
  registered: number;
  addedToday: number;
};

type ManagerTeamEmployee = {
  id: number;
  name: string;
  employeeRole?: "sales" | "data_entry" | "technical_expert" | "marketing_tech" | "manager" | null;
};

type ManagerLead = {
  id: number;
  type: "customer" | "workshop";
  name: string;
  area?: string | null;
  assignedEmployeeId?: number | null;
  assignedEmployeeName?: string | null;
  nextFollowUpAt?: string | null;
  registeredUserId?: number | null;
};

type ManagerTask = {
  id: number;
  employeeId: number;
  employeeName?: string | null;
  title: string;
  taskType: string;
  dueAt: string;
  status: string;
  leadName?: string | null;
};

type ManagerReturn = {
  id: number;
  name: string;
  returnStatus?: string | null;
  returnResolution?: string | null;
  returnPartName?: string | null;
  transferDecision?: string | null;
};

type ManagerSummary = {
  employees: ManagerTeamEmployee[];
  customerLeads: ManagerLead[];
  workshopLeads: ManagerLead[];
  tasks: ManagerTask[];
  returnsCases: ManagerReturn[];
};

const genericCards = [
  {
    href: "/admin/employee/data-entry",
    label: "إدخال البيانات",
    description: "إضافة العملاء والورش الأولية وتحويلها لمسار المتابعة المناسب.",
    permission: "data_entry.leads.view" as const,
    icon: Database,
  },
  {
    href: "/admin/employee/reports",
    label: "التقرير اليومي",
    description: "تسجيل ما تم إنجازه اليوم والمعوقات والخطوات التالية.",
    permission: "employee.reports.view_own" as const,
    icon: FileText,
  },
  {
    href: "/admin/employee/tasks",
    label: "مهامي",
    description: "متابعة المهام اليومية وتحديث حالتها ونتيجة التنفيذ.",
    permission: "employee.tasks.view_own" as const,
    icon: ClipboardList,
  },
  {
    href: "/admin/orders",
    label: "إدارة الطلبات",
    description: "مراجعة الطلبات الحالية وتحديث حالتها ومتابعة العملاء.",
    permission: "orders.view" as const,
    icon: ClipboardList,
  },
  {
    href: "/admin/packages",
    label: "الباكدجات",
    description: "إضافة الباكدجات وتعديل الأسعار والمحتوى.",
    permission: "packages.edit" as const,
    icon: Package2,
  },
  {
    href: "/admin/workshops",
    label: "الورش",
    description: "متابعة الورش وطلبات الانضمام.",
    permission: "workshops.manage" as const,
    icon: Wrench,
  },
];

const salesSections = [
  {
    href: "/admin/employee/customers",
    label: "عملائي",
    description: "قائمة العملاء المسندين لك مع حالة كل عميل وموعد المتابعة القادمة.",
    icon: Users,
  },
  {
    href: "/admin/employee/workshops",
    label: "ورش المتابعة",
    description: "الورش المكلف بها موظف المبيعات وحالة كل ورشة داخل دورة الإقناع والانضمام.",
    icon: Building2,
  },
  {
    href: "/admin/employee/tasks",
    label: "مهامي",
    description: "مكالمات اليوم، الزيارات، والمتابعات المفتوحة التي تحتاج تنفيذًا فعليًا.",
    icon: PhoneCall,
  },
  {
    href: "/admin/employee/team",
    label: "إدارة الفريق",
    description: "توزيع العملاء والورش والمهام على موظفي المبيعات ومتابعة تسجيلهم داخل المنصة.",
    icon: Users,
  },
];

const taskTypeLabels: Record<string, string> = {
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

const technicalStatusLabels: Record<string, string> = {
  new: "جديد",
  attempted_contact: "محاولة تواصل",
  contacted: "تم التواصل",
  interested: "مهتم",
  follow_up_later: "متابعة لاحقًا",
  negotiation: "تفاوض",
  registered_on_platform: "سجل على المنصة",
  converted_to_order: "تحول إلى طلب",
  converted_to_application: "تحول إلى طلب انضمام",
};

function useSalesSummary(token: string | null, enabled: boolean) {
  const [data, setData] = React.useState<SalesSummary | null>(null);
  const [loading, setLoading] = React.useState(enabled);

  React.useEffect(() => {
    if (!enabled || !token) {
      setLoading(false);
      return;
    }

    const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";
    setLoading(true);
    fetch(`${base}/api/admin/employee/sales/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.error) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enabled, token]);

  return { data, loading };
}

function useTechnicalSummary(token: string | null, enabled: boolean) {
  const [data, setData] = React.useState<TechnicalSummary | null>(null);
  const [loading, setLoading] = React.useState(enabled);

  React.useEffect(() => {
    if (!enabled || !token) {
      setLoading(false);
      return;
    }

    const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";
    setLoading(true);
    fetch(`${base}/api/admin/employee/technical/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.error) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enabled, token]);

  return { data, loading };
}

function useDataEntrySummary(token: string | null, enabled: boolean) {
  const [data, setData] = React.useState<DataEntrySummary | null>(null);
  const [loading, setLoading] = React.useState(enabled);

  React.useEffect(() => {
    if (!enabled || !token) {
      setLoading(false);
      return;
    }

    const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";
    setLoading(true);
    fetch(`${base}/api/admin/employee/data-entry/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.error) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enabled, token]);

  return { data, loading };
}

function useManagerSummary(token: string | null, enabled: boolean) {
  const [data, setData] = React.useState<ManagerSummary | null>(null);
  const [loading, setLoading] = React.useState(enabled);

  React.useEffect(() => {
    if (!enabled || !token) {
      setLoading(false);
      return;
    }

    const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";
    setLoading(true);

    Promise.allSettled([
      fetch(`${base}/api/admin/employee/team/employees`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${base}/api/admin/employee/team/leads?type=customer`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${base}/api/admin/employee/team/leads?type=workshop`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${base}/api/admin/employee/team/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${base}/api/admin/employee/technical/returns`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async (responses) => {
        const [employeesResponse, customerResponse, workshopResponse, tasksResponse, returnsResponse] = responses;
        const parseJson = async (response: PromiseSettledResult<Response>) => {
          if (response.status !== "fulfilled") return [];
          const body = await response.value.json().catch(() => []);
          return response.value.ok && Array.isArray(body) ? body : [];
        };

        const [employees, customerLeads, workshopLeads, tasks, returnsCases] = await Promise.all([
          parseJson(employeesResponse),
          parseJson(customerResponse),
          parseJson(workshopResponse),
          parseJson(tasksResponse),
          parseJson(returnsResponse),
        ]);

        setData({
          employees,
          customerLeads,
          workshopLeads,
          tasks,
          returnsCases,
        });
      })
      .catch(() => {
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [enabled, token]);

  return { data, loading };
}

export default function EmployeeDashboardPage() {
  const { token, user, hasPermission } = useAuth();
  const employeeRole = normalizeEmployeeRole(user?.employeeRole);
  const isManager = employeeRole === "manager";
  const isSales = employeeRole === "sales";
  const isTechnical = employeeRole === "technical_expert";
  const isDataEntry = employeeRole === "data_entry";
  const isMarketingTech = employeeRole === "marketing_tech";
  const { data: salesSummary, loading } = useSalesSummary(token, isSales);
  const { data: technicalSummary, loading: technicalLoading } = useTechnicalSummary(token, isTechnical);
  const { data: dataEntrySummary, loading: dataEntryLoading } = useDataEntrySummary(token, isDataEntry);
  const { data: managerSummary, loading: managerLoading } = useManagerSummary(token, isManager);

  if (isManager) {
    const customerLeads = managerSummary?.customerLeads ?? [];
    const workshopLeads = managerSummary?.workshopLeads ?? [];
    const allLeads = [...customerLeads, ...workshopLeads];
    const tasks = managerSummary?.tasks ?? [];
    const returnsCases = managerSummary?.returnsCases ?? [];
    const employees = managerSummary?.employees ?? [];
    const now = Date.now();
    const nextDay = now + 24 * 60 * 60 * 1000;

    const openTasks = tasks.filter((task) => ["pending", "in_progress", "postponed"].includes(task.status));
    const overdueTasks = openTasks.filter((task) => new Date(task.dueAt).getTime() <= now);
    const unassignedCustomers = customerLeads.filter((lead) => !lead.assignedEmployeeId).length;
    const unassignedWorkshops = workshopLeads.filter((lead) => !lead.assignedEmployeeId).length;
    const dueFollowUps = allLeads.filter((lead) => {
      if (!lead.nextFollowUpAt) return false;
      const time = new Date(lead.nextFollowUpAt).getTime();
      return time <= nextDay;
    }).length;
    const registeredCustomers = customerLeads.filter((lead) => lead.registeredUserId).length;
    const pendingReturns = returnsCases.filter((item) =>
      ["pending", "technical_review", "need_more_info"].includes(item.returnResolution ?? "pending") ||
      ["reported", "under_inspection", "awaiting_management_decision"].includes(item.returnStatus ?? "reported"),
    ).length;
    const employeeLoad = employees
      .map((employee) => ({
        ...employee,
        assignedLeads: allLeads.filter((lead) => lead.assignedEmployeeId === employee.id).length,
        openTasks: openTasks.filter((task) => task.employeeId === employee.id).length,
      }))
      .sort((a, b) => (b.assignedLeads + b.openTasks) - (a.assignedLeads + a.openTasks))
      .slice(0, 6);
    const urgentDecisionItems = [
      ...allLeads
        .filter((lead) => !lead.assignedEmployeeId)
        .slice(0, 3)
        .map((lead) => ({
          key: `lead-${lead.id}`,
          title: `${lead.type === "workshop" ? "ورشة" : "عميل"} غير مسند`,
          subtitle: lead.name,
          meta: lead.area ? `المنطقة: ${lead.area}` : "يحتاج تحديد مسؤول الآن",
          href: "/admin/employee/team",
          tone: "amber" as const,
        })),
      ...overdueTasks.slice(0, 3).map((task) => ({
        key: `task-${task.id}`,
        title: "مهمة متأخرة",
        subtitle: task.title,
        meta: `${task.employeeName ?? "بدون موظف"} · ${new Date(task.dueAt).toLocaleString("ar-EG")}`,
        href: "/admin/employee/team",
        tone: "red" as const,
      })),
      ...returnsCases
        .filter((item) => ["pending", "technical_review", "need_more_info"].includes(item.returnResolution ?? "pending"))
        .slice(0, 3)
        .map((item) => ({
          key: `return-${item.id}`,
          title: "مرتجع ينتظر قرارًا",
          subtitle: item.returnPartName || item.name,
          meta: item.returnStatus ? `الحالة: ${item.returnStatus}` : "راجع البلاغ الحالي",
          href: "/admin/employee/returns",
          tone: "violet" as const,
        })),
    ].slice(0, 6);

    const managerCards = [
      hasPermission("sales.team.view") ? { href: "/admin/employee/team", label: "إدارة الفريق", description: "توزيع العملاء والورش والمهام ومراقبة ما يحتاج قرارًا سريعًا.", icon: Users } : null,
      hasPermission("returns.view") ? { href: "/admin/employee/returns", label: "المرتجعات", description: "متابعة البلاغات المفتوحة وما يحتاج فحصًا أو قرار استبدال أو رد مالي.", icon: Package2 } : null,
      hasPermission("technical.cases.view_own") ? { href: "/admin/employee/technical", label: "الحالات الفنية", description: "مراجعة ما وصل إلى الخبير الفني وما ينتظر رأيًا أو تصعيدًا.", icon: Stethoscope } : null,
      hasPermission("data_entry.leads.view") ? { href: "/admin/employee/data-entry", label: "إدخال البيانات", description: "مراجعة ما أُضيف من عملاء وورش وتجهيزه للإسناد أو المتابعة.", icon: Database } : null,
      hasPermission("orders.view") ? { href: "/admin/orders", label: "الطلبات", description: "متابعة التنفيذ الحالي وما يرتبط به من شكاوى أو مرتجعات أو تأخير.", icon: ClipboardList } : null,
      hasPermission("employee.reports.view_own") ? { href: "/admin/employee/reports", label: "التقارير اليومية", description: "مراجعة ما أنجزه الفريق وما تعطل وما يحتاج قرارًا إداريًا.", icon: FileText } : null,
      ].filter(Boolean) as Array<{ href: string; label: string; description: string; icon: typeof Users }>;

    return (
      <div className="space-y-8">
        <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
          <p className="text-[#F9E795] text-sm font-bold mb-2">لوحة مدير الفريق</p>
          <h1 className="text-3xl font-black text-white mb-3">مرحبًا {user?.name}</h1>
          <p className="text-white/60 text-sm leading-7 max-w-4xl">
            هنا تتابع ما تم إسناده من الإدارة، وتعيد توزيعه على الفريق، وتراقب ما يحتاج قرارًا سريعًا بين المبيعات والداتا والخبير الفني والمرتجعات.
          </p>
        </div>

        {managerLoading ? (
          <div className="bg-[#151D33] border border-white/10 rounded-3xl p-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[
                { label: "فرص غير مسندة", value: unassignedCustomers + unassignedWorkshops, icon: AlertTriangle, tone: "bg-amber-500/12 text-amber-300 border-amber-500/25" },
                { label: "متابعات خلال 24 ساعة", value: dueFollowUps, icon: PhoneCall, tone: "bg-sky-500/12 text-sky-300 border-sky-500/25" },
                { label: "مهام مفتوحة", value: openTasks.length, icon: ClipboardList, tone: "bg-blue-500/12 text-blue-300 border-blue-500/25" },
                { label: "مهام متأخرة", value: overdueTasks.length, icon: AlertTriangle, tone: "bg-red-500/12 text-red-300 border-red-500/25" },
                { label: "مرتجعات تحتاج قرارًا", value: pendingReturns, icon: ArrowRightLeft, tone: "bg-violet-500/12 text-violet-300 border-violet-500/25" },
                { label: "عملاء سجلوا من الـ pipeline", value: registeredCustomers, icon: Users, tone: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25" },
              ].map((card) => (
                <div key={card.label} className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-4 ${card.tone}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <p className="text-white/40 text-xs font-bold mb-2">{card.label}</p>
                  <p className="text-white font-black text-2xl">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_.9fr] gap-5">
              <div className="bg-[#151D33] border border-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="text-[#F9E795] text-xs font-black mb-2">مركز القرار السريع</p>
                    <h2 className="text-white text-xl font-black">ما الذي يحتاج تدخلًا الآن؟</h2>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-[#F9E795]" />
                </div>
                {urgentDecisionItems.length ? (
                  <div className="space-y-3">
                    {urgentDecisionItems.map((item) => (
                      <Link key={item.key} href={item.href}>
                        <div className="bg-[#10182C] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-[#F9E795]/25 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-white font-black">{item.title}</p>
                              <p className="text-white/70 text-sm mt-1">{item.subtitle}</p>
                              <p className="text-white/40 text-xs mt-2">{item.meta}</p>
                            </div>
                            <span className={`px-3 py-2 rounded-xl text-xs font-black border ${
                              item.tone === "red"
                                ? "bg-red-500/12 text-red-300 border-red-500/25"
                                : item.tone === "violet"
                                  ? "bg-violet-500/12 text-violet-300 border-violet-500/25"
                                  : "bg-amber-500/12 text-amber-300 border-amber-500/25"
                            }`}>
                              تحرك الآن
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/45 text-sm">لا توجد عناصر حرجة واضحة الآن. يمكنك النزول لحمولة الفريق وتفاصيل التنفيذ.</p>
                )}
              </div>

              <div className="bg-[#151D33] border border-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="text-[#F9E795] text-xs font-black mb-2">حمل الفريق الحالي</p>
                    <h2 className="text-white text-xl font-black">من يحمل ضغطًا أكبر الآن؟</h2>
                  </div>
                  <Users className="w-5 h-5 text-[#F9E795]" />
                </div>
                <div className="space-y-3">
                  {employeeLoad.length ? employeeLoad.map((employee) => (
                    <div key={employee.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-white font-black">{employee.name}</p>
                          <p className="text-white/40 text-xs mt-1">
                            {employee.employeeRole === "sales" ? "مبيعات ومتابعة" : employee.employeeRole === "technical_expert" ? "خبير فني" : employee.employeeRole === "data_entry" ? "داتا وقطع" : employee.employeeRole === "marketing_tech" ? "تسويق وتقنية" : "مدير فريق"}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-[#F9E795] font-black text-lg">{employee.assignedLeads + employee.openTasks}</p>
                          <p className="text-white/35 text-xs">عناصر مفتوحة</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-xs">
                        <span className="px-3 py-2 rounded-xl bg-sky-500/12 text-sky-300 border border-sky-500/20">فرص: {employee.assignedLeads}</span>
                        <span className="px-3 py-2 rounded-xl bg-amber-500/12 text-amber-300 border border-amber-500/20">مهام: {employee.openTasks}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-white/45 text-sm">لا توجد بيانات حمل فريق متاحة الآن.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {managerCards.map((card) => (
                <Link key={card.href} href={card.href}>
                  <div className="group bg-[#1E2761]/60 border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-[#F9E795]/30 hover:bg-[#1E2761]/80 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
                      <card.icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-white font-black text-lg mb-2">{card.label}</h2>
                    <p className="text-white/50 text-sm leading-6 min-h-[72px]">{card.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-[#F9E795] text-sm font-bold">
                      الدخول للقسم
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (isSales) {
    const quickActions = [
      hasPermission("sales.customers.create_own") ? { href: "/admin/employee/customers", label: "إضافة عميل", icon: Users } : null,
      hasPermission("sales.workshops.create_own") ? { href: "/admin/employee/workshops", label: "إضافة ورشة", icon: Building2 } : null,
      hasPermission("employee.tasks.create_own") ? { href: "/admin/employee/tasks", label: "إضافة مهمة", icon: ClipboardList } : null,
      hasPermission("employee.reports.create_own") ? { href: "/admin/employee/reports", label: "رفع تقرير يومي", icon: FileText } : null,
      hasPermission("sales.team.view") ? { href: "/admin/employee/team", label: "إدارة الفريق", icon: Users } : null,
    ].filter(Boolean) as Array<{ href: string; label: string; icon: typeof Users }>;

    const statCards = [
      { label: "العملاء المسندون", value: salesSummary?.totalCustomers ?? 0, icon: Users },
      { label: "عملاء جدد اليوم", value: salesSummary?.newCustomersToday ?? 0, icon: Target },
      { label: "متابعات اليوم", value: salesSummary?.followUpsToday ?? 0, icon: PhoneCall },
      { label: "تحويلات إلى طلب", value: salesSummary?.convertedCustomers ?? 0, icon: Package2 },
      { label: "ورش المتابعة", value: salesSummary?.assignedWorkshops ?? 0, icon: Building2 },
      { label: "مهام مفتوحة", value: salesSummary?.activeTasks ?? 0, icon: ClipboardList },
    ];

    return (
      <div className="space-y-8">
        <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
          <p className="text-[#F9E795] text-sm font-bold mb-2">لوحة المبيعات</p>
          <h1 className="text-3xl font-black text-white mb-3">مرحبًا {user?.name}</h1>
          <p className="text-white/60 text-sm leading-7 max-w-3xl">
            هذه النسخة تعرض الآن بيانات تشغيل حقيقية لموظف المبيعات: العملاء المسندين، الورش المسندة، ومهام اليوم المفتوحة.
          </p>
          {quickActions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black text-sm cursor-pointer hover:opacity-90 transition-all">
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="bg-[#151D33] border border-white/10 rounded-3xl p-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {statCards.map((card) => (
                <div key={card.label} className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <p className="text-white/40 text-xs font-bold mb-2">{card.label}</p>
                  <p className="text-white font-black text-2xl">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {salesSections
                .filter((card) => card.href !== "/admin/employee/team" || hasPermission("sales.team.view"))
                .map((card) => (
                <Link key={card.href} href={card.href}>
                  <div className="group bg-[#1E2761]/60 border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-[#F9E795]/30 hover:bg-[#1E2761]/80 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
                      <card.icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-white font-black text-lg mb-2">{card.label}</h2>
                    <p className="text-white/50 text-sm leading-6 min-h-[72px]">{card.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-[#F9E795] text-sm font-bold">
                      الدخول للقسم
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="bg-[#151D33] border border-white/10 rounded-3xl p-6">
              <h2 className="text-white font-black text-xl mb-4">أقرب المهام المفتوحة</h2>
              {salesSummary?.openTasks?.length ? (
                <div className="space-y-3">
                  {salesSummary.openTasks.map((task) => (
                    <div key={task.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-white font-black">{task.title}</p>
                        <p className="text-white/45 text-sm mt-1">
                          {taskTypeLabels[task.taskType] ?? task.taskType} {task.area ? `· ${task.area}` : ""} {task.dueAt ? `· ${new Date(task.dueAt).toLocaleString("ar-EG")}` : ""}
                        </p>
                      </div>
                      <span className="px-3 py-2 rounded-xl text-xs font-bold bg-[#F9E795]/10 text-[#F9E795] border border-[#F9E795]/20 w-fit">
                        {taskStatusLabels[task.status] ?? task.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/45 text-sm">لا توجد مهام مفتوحة لهذا الحساب الآن.</p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  if (isTechnical) {
    const statCards = [
      { label: "إجمالي الحالات", value: technicalSummary?.totalCases ?? 0, icon: Stethoscope },
      { label: "حالات عملاء", value: technicalSummary?.customerCases ?? 0, icon: Users },
      { label: "حالات ورش", value: technicalSummary?.workshopCases ?? 0, icon: Building2 },
      { label: "المرتجعات", value: technicalSummary?.returnsCases ?? 0, icon: Package2 },
      { label: "متابعة اليوم", value: technicalSummary?.dueToday ?? 0, icon: PhoneCall },
      { label: "حالات محسومة", value: technicalSummary?.resolvedCases ?? 0, icon: Target },
      { label: "مهام مفتوحة", value: technicalSummary?.activeTasks ?? 0, icon: ClipboardList },
    ];

    const quickActions = [
      hasPermission("technical.cases.view_own") ? { href: "/admin/employee/technical", label: "الحالات الفنية", icon: Stethoscope } : null,
      hasPermission("technical.cases.view_own") ? { href: "/admin/employee/returns", label: "المرتجعات", icon: Package2 } : null,
      hasPermission("employee.tasks.view_own") ? { href: "/admin/employee/tasks", label: "مهامي", icon: ClipboardList } : null,
      hasPermission("employee.reports.view_own") ? { href: "/admin/employee/reports", label: "تقاريري اليومية", icon: FileText } : null,
    ].filter(Boolean) as Array<{ href: string; label: string; icon: typeof Stethoscope }>;

    return (
      <div className="space-y-8">
        <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
          <p className="text-[#F9E795] text-sm font-bold mb-2">لوحة الخبير الفني</p>
          <h1 className="text-3xl font-black text-white mb-3">مرحبًا {user?.name}</h1>
          <p className="text-white/60 text-sm leading-7 max-w-3xl">
            هذه النسخة تعرض الحالات الفنية المسندة لك، وما يحتاج متابعة اليوم، مع وصول سريع للمهام والمواعيد والتقييمات ذات الصلة.
          </p>
          {quickActions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black text-sm cursor-pointer hover:opacity-90 transition-all">
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {technicalLoading ? (
          <div className="bg-[#151D33] border border-white/10 rounded-3xl p-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {statCards.map((card) => (
                <div key={card.label} className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <p className="text-white/40 text-xs font-bold mb-2">{card.label}</p>
                  <p className="text-white font-black text-2xl">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { href: "/admin/employee/technical", label: "الحالات الفنية", description: "الحالات المسندة للخبير الفني مع الملاحظات وقرار المتابعة التالي.", icon: Stethoscope },
                { href: "/admin/employee/returns", label: "المرتجعات", description: "طلبات المرتجع من لحظة البلاغ حتى الاستلام والفحص والاستبدال أو الرد المالي.", icon: Package2 },
                { href: "/admin/employee/tasks", label: "المهام الفنية", description: "المهام التشغيلية والفنية اليومية مع تحديث التنفيذ والنتيجة.", icon: ClipboardList },
                { href: "/admin/employee/reports", label: "التقرير اليومي", description: "تلخيص ما تم تشخيصه أو تصعيده للمبيعات أو الإدارة أو الورش.", icon: FileText },
              ].map((card) => (
                <Link key={card.href} href={card.href}>
                  <div className="group bg-[#1E2761]/60 border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-[#F9E795]/30 hover:bg-[#1E2761]/80 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
                      <card.icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-white font-black text-lg mb-2">{card.label}</h2>
                    <p className="text-white/50 text-sm leading-6 min-h-[72px]">{card.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-[#F9E795] text-sm font-bold">
                      الدخول للقسم
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="bg-[#151D33] border border-white/10 rounded-3xl p-6">
              <h2 className="text-white font-black text-xl mb-4">أقرب الحالات المفتوحة</h2>
              {technicalSummary?.openCases?.length ? (
                <div className="space-y-3">
                  {technicalSummary.openCases.map((item) => (
                    <div key={item.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-white font-black">{item.name}</p>
                        <p className="text-white/45 text-sm mt-1">
                          {item.type === "workshop" ? "ورشة" : "عميل"} {item.area ? `· ${item.area}` : ""} {item.nextFollowUpAt ? `· ${new Date(item.nextFollowUpAt).toLocaleString("ar-EG")}` : ""}
                        </p>
                      </div>
                      <span className="px-3 py-2 rounded-xl text-xs font-bold bg-[#F9E795]/10 text-[#F9E795] border border-[#F9E795]/20 w-fit">
                        {technicalStatusLabels[item.status] ?? item.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/45 text-sm">لا توجد حالات فنية مفتوحة لهذا الحساب الآن.</p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  if (isDataEntry) {
    const statCards = [
      { label: "إجمالي السجلات", value: dataEntrySummary?.total ?? 0, icon: Database },
      { label: "أضيفت اليوم", value: dataEntrySummary?.addedToday ?? 0, icon: Users },
      { label: "غير مسندة", value: dataEntrySummary?.unassigned ?? 0, icon: Target },
      { label: "تم تسجيلها", value: dataEntrySummary?.registered ?? 0, icon: Package2 },
    ];

    const cards = [
      hasPermission("data_entry.leads.view") ? { href: "/admin/employee/data-entry", label: "إدخال البيانات", description: "تجهيز العملاء والورش ومراجعة ما يحتاج إسنادًا أو تدقيقًا.", icon: Database } : null,
      hasPermission("returns.view") ? { href: "/admin/employee/returns", label: "المرتجعات", description: "استلام قرارات الخبير الفني الخاصة بالقطع والمرتجعات والتحرك عليها مباشرة.", icon: Package2 } : null,
      hasPermission("parts.edit") ? { href: "/admin/parts", label: "القطع", description: "مراجعة القطع والأسعار وما يحتاج تحديثًا أو بديلًا معتمدًا.", icon: Wrench } : null,
      hasPermission("packages.edit") ? { href: "/admin/packages", label: "الباكدجات", description: "تحديث محتوى الباكدجات وربط الملاحظات التنفيذية بها عند الحاجة.", icon: Package2 } : null,
      hasPermission("employee.tasks.view_own") ? { href: "/admin/employee/tasks", label: "مهامي", description: "المهام اليومية والقرارات الفنية الواصلة لمسؤول الداتا والقطع.", icon: ClipboardList } : null,
      hasPermission("employee.reports.view_own") ? { href: "/admin/employee/reports", label: "تقاريري اليومية", description: "تلخيص ما تم إدخاله أو مراجعته أو تنفيذه اليوم.", icon: FileText } : null,
    ].filter(Boolean) as Array<{ href: string; label: string; description: string; icon: typeof Database }>;

    return (
      <div className="space-y-8">
        <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
          <p className="text-[#F9E795] text-sm font-bold mb-2">لوحة الداتا والقطع</p>
          <h1 className="text-3xl font-black text-white mb-3">مرحبًا {user?.name}</h1>
          <p className="text-white/60 text-sm leading-7 max-w-3xl">
            هذه المساحة تركز على تجهيز السجلات، مراجعة القطع، واستقبال القرارات الفنية التي تحتاج تنفيذًا من جهة الداتا والقطع.
          </p>
        </div>

        {dataEntryLoading ? (
          <div className="bg-[#151D33] border border-white/10 rounded-3xl p-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {statCards.map((card) => (
                <div key={card.label} className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <p className="text-white/40 text-xs font-bold mb-2">{card.label}</p>
                  <p className="text-white font-black text-2xl">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {cards.map((card) => (
                <Link key={card.href} href={card.href}>
                  <div className="group bg-[#1E2761]/60 border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-[#F9E795]/30 hover:bg-[#1E2761]/80 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
                      <card.icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-white font-black text-lg mb-2">{card.label}</h2>
                    <p className="text-white/50 text-sm leading-6 min-h-[72px]">{card.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-[#F9E795] text-sm font-bold">
                      الدخول للقسم
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (isMarketingTech) {
    const cards = [
      hasPermission("reports.sales") ? { href: "/admin/sales", label: "أداء المبيعات", description: "متابعة المؤشرات العامة للمبيعات والتحويلات والاتجاهات.", icon: BarChart2 } : null,
      hasPermission("reviews.view") ? { href: "/admin/reviews", label: "السمعة والتقييمات", description: "قراءة تقييمات العملاء ومتابعة الملاحظات التي تؤثر على الصورة العامة.", icon: Star } : null,
      hasPermission("employee.tasks.view_own") ? { href: "/admin/employee/tasks", label: "مهامي", description: "مهام المتابعة الخاصة بالتسويق أو التقنية أو التحسينات التشغيلية.", icon: ClipboardList } : null,
      hasPermission("employee.reports.view_own") ? { href: "/admin/employee/reports", label: "تقاريري اليومية", description: "تسجيل ما تم تنفيذه من حملات أو تحسينات أو متابعات يومية.", icon: FileText } : null,
    ].filter(Boolean) as Array<{ href: string; label: string; description: string; icon: typeof BarChart2 }>;

    return (
      <div className="space-y-8">
        <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
          <p className="text-[#F9E795] text-sm font-bold mb-2">لوحة التسويق والتقنية</p>
          <h1 className="text-3xl font-black text-white mb-3">مرحبًا {user?.name}</h1>
          <p className="text-white/60 text-sm leading-7 max-w-3xl">
            هذه المساحة مخصصة لمتابعة الأداء العام، السمعة، الملاحظات، والمهام المرتبطة بالتسويق والتقنية وتحسين التجربة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {cards.map((card) => (
            <Link key={card.href} href={card.href}>
              <div className="group bg-[#1E2761]/60 border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-[#F9E795]/30 hover:bg-[#1E2761]/80 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
                  <card.icon className="w-5 h-5" />
                </div>
                <h2 className="text-white font-black text-lg mb-2">{card.label}</h2>
                <p className="text-white/50 text-sm leading-6 min-h-[72px]">{card.description}</p>
                <div className="mt-4 flex items-center gap-2 text-[#F9E795] text-sm font-bold">
                  الدخول للقسم
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const visibleCards = genericCards.filter((card) => hasPermission(card.permission));

  return (
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <p className="text-[#F9E795] text-sm font-bold mb-2">لوحة الموظف</p>
        <h1 className="text-3xl font-black text-white mb-3">مرحبًا {user?.name}</h1>
        <p className="text-white/60 text-sm leading-7 max-w-3xl">
          هذه الواجهة تعرض فقط الأقسام المصرح لك بها حسب دورك الحالي.
          <span className="text-white/80 font-bold"> {getRoleLabel(user?.role, user?.employeeRole)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div className="group bg-[#1E2761]/60 border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-[#F9E795]/30 hover:bg-[#1E2761]/80 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
                <card.icon className="w-5 h-5" />
              </div>
              <h2 className="text-white font-black text-lg mb-2">{card.label}</h2>
              <p className="text-white/50 text-sm leading-6 min-h-[72px]">{card.description}</p>
              <div className="mt-4 flex items-center gap-2 text-[#F9E795] text-sm font-bold">
                الدخول للقسم
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
