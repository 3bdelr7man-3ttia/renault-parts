import React from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { getRoleLabel, normalizeEmployeeRole } from "@/lib/permissions";
import { ArrowLeft, Building2, ClipboardList, Loader2, Package2, PhoneCall, Target, Users, Wrench } from "lucide-react";

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

const genericCards = [
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

export default function EmployeeDashboardPage() {
  const { token, user, hasPermission } = useAuth();
  const employeeRole = normalizeEmployeeRole(user?.employeeRole);
  const isSales = employeeRole === "sales" || employeeRole === "manager";
  const { data: salesSummary, loading } = useSalesSummary(token, isSales);

  if (isSales) {
    const quickActions = [
      hasPermission("sales.customers.create_own") ? { href: "/admin/employee/customers", label: "إضافة عميل", icon: Users } : null,
      hasPermission("sales.workshops.create_own") ? { href: "/admin/employee/workshops", label: "إضافة ورشة", icon: Building2 } : null,
      hasPermission("sales.tasks.create_own") ? { href: "/admin/employee/tasks", label: "إضافة مهمة", icon: ClipboardList } : null,
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
