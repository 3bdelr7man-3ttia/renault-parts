import React from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { getRoleLabel, normalizeEmployeeRole } from "@/lib/permissions";
import { ClipboardList, CalendarCheck, Package2, Settings2, Star, BarChart2, Users, Wrench, ArrowLeft, PhoneCall, FileSpreadsheet, Target, Building2 } from "lucide-react";

const cards = [
  {
    href: "/admin/orders",
    label: "إدارة الطلبات",
    description: "مراجعة الطلبات الحالية وتحديث حالتها ومتابعة العملاء.",
    permission: "orders.view" as const,
    icon: ClipboardList,
  },
  {
    href: "/admin/appointments",
    label: "المواعيد",
    description: "متابعة مواعيد التركيب مع الورش والعملاء.",
    permission: "appointments.view" as const,
    icon: CalendarCheck,
  },
  {
    href: "/admin/packages",
    label: "الباكدجات",
    description: "إضافة الباكدجات وتعديل الأسعار والمحتوى.",
    permission: "packages.edit" as const,
    icon: Package2,
  },
  {
    href: "/admin/parts",
    label: "القطع",
    description: "إدارة القطع والأسعار والمخزون.",
    permission: "parts.edit" as const,
    icon: Settings2,
  },
  {
    href: "/admin/reviews",
    label: "التقييمات",
    description: "متابعة مراجعات العملاء والرد عليها.",
    permission: "reviews.view" as const,
    icon: Star,
  },
  {
    href: "/admin/sales",
    label: "تقارير المبيعات",
    description: "عرض تقارير المبيعات والأداء التجاري.",
    permission: "reports.sales" as const,
    icon: BarChart2,
  },
  {
    href: "/admin/users",
    label: "إدارة الموظفين",
    description: "إدارة أدوار المستخدمين والموظفين.",
    permission: "employees.manage" as const,
    icon: Users,
  },
  {
    href: "/admin/workshops",
    label: "الورش",
    description: "متابعة الورش وطلبات الانضمام.",
    permission: "workshops.manage" as const,
    icon: Wrench,
  },
];

const salesCards = [
  {
    href: "/admin/employee/customers",
    label: "عملائي",
    description: "عرض العملاء المكلفين بك، وتحديد أولويات المتابعة اليومية لكل عميل.",
    icon: Users,
  },
  {
    href: "/admin/employee/workshops",
    label: "ورش المتابعة",
    description: "إدارة الورش التابعة لك ومتابعة ضم الورش الجديدة أو تحويلها لشراكة فعلية.",
    icon: Building2,
  },
];

const salesHighlights = [
  { label: "نظام العمل في هذه المرحلة", value: "Sales Workspace", icon: Target },
  { label: "ما هو متاح الآن", value: "قاعدة عملاء + ورش", icon: PhoneCall },
  { label: "القادم بعد هذه المرحلة", value: "Tasks + Daily Report", icon: FileSpreadsheet },
];

export default function EmployeeDashboardPage() {
  const { user, hasPermission } = useAuth();
  const employeeRole = normalizeEmployeeRole(user?.employeeRole);

  if (employeeRole === "sales") {
    return (
      <div className="space-y-8">
        <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
          <p className="text-[#F9E795] text-sm font-bold mb-2">لوحة المبيعات</p>
          <h1 className="text-3xl font-black text-white mb-3">مرحبًا {user?.name}</h1>
          <p className="text-white/60 text-sm leading-7 max-w-3xl">
            هذه المساحة مخصصة لموظف المبيعات فقط، وتم فصلها عن تقارير الإدارة والمصروفات والطلبات العامة حتى تركز على
            العملاء والورش المكلفين بك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {salesHighlights.map((item) => (
            <div key={item.label} className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
              <div className="w-11 h-11 rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <p className="text-white/40 text-xs font-bold mb-2">{item.label}</p>
              <p className="text-white font-black text-lg">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {salesCards.map((card) => (
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
          <h2 className="text-white font-black text-xl mb-3">المرحلة التالية</h2>
          <p className="text-white/55 text-sm leading-7">
            في المرحلة التالية سنربط هذه المساحة بمهام اليوم، والتقرير اليومي، وتوزيع العملاء والورش على موظف المبيعات بشكل فعلي،
            بحيث تظهر فقط الحالات المسندة لك بدل أي بيانات عامة.
          </p>
        </div>
      </div>
    );
  }

  const visibleCards = cards.filter((card) => hasPermission(card.permission));

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

      {visibleCards.length === 0 && (
        <div className="bg-[#1E2761]/40 border border-white/10 rounded-3xl p-8 text-center">
          <p className="text-white/70 font-bold">لا توجد أقسام مفعلة لهذا الحساب حاليًا.</p>
          <p className="text-white/40 text-sm mt-2">يمكن للإدارة تحديث صلاحياتك من لوحة المستخدمين.</p>
        </div>
      )}
    </div>
  );
}
