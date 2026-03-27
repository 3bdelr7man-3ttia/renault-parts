import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { getRoleLabel, normalizeEmployeeRole, type Permission } from '@/lib/permissions';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Wrench,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Package2,
  Star,
  BarChart2,
  Settings2,
  TrendingDown,
  FileCheck,
  Store,
  CalendarCheck,
  PhoneCall,
  Database,
  FileText,
  Stethoscope,
  ArrowRightLeft,
} from 'lucide-react';
import bakoLogo from '@/assets/bako-logo.png';

const G  = '#C8974A';
const NV = '#1F2937';
const BG = '#F7F8FA';
const S  = '#FFFFFF';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  group: 'overview' | 'employee' | 'team' | 'operations' | 'catalog' | 'finance' | 'system';
  exact?: boolean;
  adminOnly?: boolean;
  employeeOnly?: boolean;
  permission?: Permission;
  employeeRoles?: Array<'sales' | 'data_entry' | 'technical_expert' | 'marketing_tech' | 'manager'>;
};

const mobilePriorityByRole: Record<string, string[]> = {
  admin: ['/admin', '/admin/employee/team', '/admin/orders', '/admin/employee/returns', '/admin/users'],
  manager: ['/admin/employee/dashboard', '/admin/employee/team', '/admin/orders', '/admin/employee/returns', '/admin/employee/reports'],
  sales: ['/admin/employee/dashboard', '/admin/employee/customers', '/admin/employee/workshops', '/admin/employee/tasks', '/admin/employee/reports'],
  technical_expert: ['/admin/employee/technical', '/admin/employee/returns', '/admin/employee/tasks', '/admin/employee/reports', '/admin/employee/dashboard'],
  data_entry: ['/admin/employee/data-entry', '/admin/employee/returns', '/admin/parts', '/admin/employee/tasks', '/admin/employee/reports'],
  marketing_tech: ['/admin/employee/dashboard', '/admin/sales', '/admin/reviews', '/admin/employee/tasks', '/admin/employee/reports'],
};

const navItems: NavItem[] = [
  { href: '/admin',                        label: 'الرئيسية',         icon: LayoutDashboard, group: 'overview', exact: true, adminOnly: true },
  { href: '/admin/employee/dashboard',     label: 'لوحة الموظف',      icon: LayoutDashboard, group: 'overview', employeeOnly: true },
  { href: '/admin/employee/customers',     label: 'عملائي',           icon: Users, group: 'employee', employeeOnly: true, permission: 'sales.customers.view_own', employeeRoles: ['sales', 'manager'] },
  { href: '/admin/employee/workshops',     label: 'ورش المتابعة',     icon: Wrench, group: 'employee', employeeOnly: true, permission: 'sales.workshops.view_own', employeeRoles: ['sales', 'manager'] },
  { href: '/admin/employee/technical',     label: 'الحالات الفنية',   icon: Stethoscope, group: 'employee', employeeOnly: true, permission: 'technical.cases.view_own', employeeRoles: ['technical_expert', 'manager'] },
  { href: '/admin/employee/returns',       label: 'المرتجعات',        icon: ArrowRightLeft, group: 'operations', permission: 'returns.view' },
  { href: '/admin/employee/data-entry',    label: 'إدخال البيانات',   icon: Database, group: 'employee', employeeOnly: true, permission: 'data_entry.leads.view', employeeRoles: ['data_entry', 'manager'] },
  { href: '/admin/employee/tasks',         label: 'مهامي',            icon: PhoneCall, group: 'employee', employeeOnly: true, permission: 'employee.tasks.view_own' },
  { href: '/admin/employee/reports',       label: 'تقاريري اليومية',  icon: FileText, group: 'employee', employeeOnly: true, permission: 'employee.reports.view_own' },
  { href: '/admin/employee/team',          label: 'إدارة الفريق',     icon: Users, group: 'team', permission: 'sales.team.view' as const },
  { href: '/admin/orders',                 label: 'الطلبات',          icon: ClipboardList, group: 'operations', permission: 'orders.view' as const },
  { href: '/admin/appointments',           label: 'المواعيد',         icon: CalendarCheck, group: 'operations', permission: 'appointments.view' as const, employeeRoles: ['manager'] },
  { href: '/admin/packages',               label: 'الباكدجات',        icon: Package2, group: 'catalog', permission: 'packages.edit' as const },
  { href: '/admin/workshops',              label: 'الورش',            icon: Wrench, group: 'catalog', permission: 'workshops.manage' as const, employeeRoles: ['manager'] },
  { href: '/admin/workshop-applications',  label: 'طلبات الانضمام',   icon: FileCheck, group: 'catalog', permission: 'workshops.manage' as const, employeeRoles: ['manager'] },
  { href: '/admin/parts',                  label: 'القطع',            icon: Settings2, group: 'catalog', permission: 'parts.edit' as const },
  { href: '/admin/reviews',                label: 'التقييمات',        icon: Star, group: 'operations', permission: 'reviews.view' as const, employeeRoles: ['manager', 'marketing_tech'] },
  { href: '/admin/sales',                  label: 'المبيعات',         icon: BarChart2, group: 'finance', permission: 'reports.sales' as const, employeeRoles: ['manager', 'marketing_tech'] },
  { href: '/admin/expenses',               label: 'المصروفات',        icon: TrendingDown, group: 'finance', permission: 'reports.financial' as const },
  { href: '/admin/users',                  label: 'المستخدمون',       icon: Users, group: 'system', permission: 'employees.manage' as const },
];

const groupLabels: Record<NavItem['group'], string> = {
  overview: 'نظرة عامة',
  employee: 'مساحة العمل',
  team: 'إدارة الفريق',
  operations: 'التشغيل والمتابعة',
  catalog: 'المحتوى والشركاء',
  finance: 'الماليات',
  system: 'إدارة النظام',
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout, hasPermission, isRole } = useAuth();
  const { isMobile } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const employeeRole = normalizeEmployeeRole(user?.employeeRole);
  const isAdminUser = isRole('admin');
  const isEmployeeUser = isRole('employee');
  const isManager = employeeRole === 'manager';

  const isActive = (href: string, exact?: boolean) =>
    exact ? location === href : location.startsWith(href);

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (item.adminOnly) return isAdminUser;

      if (isAdminUser) {
        if (item.employeeOnly) return false;
        return item.permission ? hasPermission(item.permission) : true;
      }

      if (item.employeeOnly && !isEmployeeUser) return false;
      if (item.employeeRoles && (!employeeRole || !item.employeeRoles.includes(employeeRole))) return false;
      if (!isEmployeeUser) return false;
      if (!item.permission) return true;
      return hasPermission(item.permission);
    });
  }, [employeeRole, hasPermission, isAdminUser, isEmployeeUser]);

  const currentGroupLabels = useMemo<Record<NavItem['group'], string>>(() => {
    if (isAdminUser) {
      return {
        overview: 'مركز القرار',
        employee: 'مساحات الفريق',
        team: 'إدارة الفريق',
        operations: 'التشغيل والمتابعة',
        catalog: 'المحتوى والشركاء',
        finance: 'المؤشرات والماليات',
        system: 'إدارة النظام',
      };
    }

    if (isManager) {
      return {
        overview: 'نظرة المدير',
        employee: 'متابعة التنفيذ',
        team: 'إدارة الفريق',
        operations: 'التشغيل والمتابعة',
        catalog: 'المحتوى والشركاء',
        finance: 'المؤشرات',
        system: 'إدارة النظام',
      };
    }

    if (employeeRole === 'sales') {
      return {
        overview: 'لوحة المبيعات',
        employee: 'عملائي والمتابعة',
        team: 'تنسيق الفريق',
        operations: 'تنفيذ اليوم',
        catalog: 'الورش والشركاء',
        finance: 'الأداء',
        system: 'أدوات النظام',
      };
    }

    if (employeeRole === 'technical_expert') {
      return {
        overview: 'القيادة الفنية',
        employee: 'الحالات الفنية',
        team: 'تنسيق الفريق',
        operations: 'المرتجعات والتنفيذ',
        catalog: 'الورش والعلاقات',
        finance: 'المؤشرات',
        system: 'أدوات النظام',
      };
    }

    if (employeeRole === 'data_entry') {
      return {
        overview: 'لوحة الداتا',
        employee: 'السجلات والإدخال',
        team: 'تنسيق الفريق',
        operations: 'المهام والتنفيذ',
        catalog: 'القطع والباكدجات',
        finance: 'المؤشرات',
        system: 'أدوات النظام',
      };
    }

    if (employeeRole === 'marketing_tech') {
      return {
        overview: 'لوحة التسويق والتقنية',
        employee: 'التشغيل اليومي',
        team: 'تنسيق الفريق',
        operations: 'السمعة والمتابعة',
        catalog: 'المحتوى والشركاء',
        finance: 'الأداء والتحليل',
        system: 'أدوات النظام',
      };
    }

    return groupLabels;
  }, [employeeRole, isAdminUser, isManager]);

  const brandSubtitle =
    isAdminUser
      ? 'لوحة الإدارة'
      : isManager
        ? 'لوحة مدير الفريق'
        : employeeRole === 'sales'
          ? 'لوحة المبيعات'
          : employeeRole === 'technical_expert'
            ? 'لوحة الخبير الفني'
            : employeeRole === 'data_entry'
              ? 'لوحة الداتا والقطع'
              : employeeRole === 'marketing_tech'
                ? 'لوحة التسويق والتقنية'
                : 'مساحة العمل';

  const employeeDashboardLabel =
    isManager
      ? 'لوحة المدير'
      : employeeRole === 'sales'
        ? 'لوحة المبيعات'
        : employeeRole === 'technical_expert'
          ? 'لوحة الخبير الفني'
          : employeeRole === 'data_entry'
            ? 'لوحة الداتا والقطع'
            : employeeRole === 'marketing_tech'
              ? 'لوحة التسويق والتقنية'
              : 'لوحة الموظف';

  const groupedNavItems = useMemo(() => {
    return visibleNavItems.reduce<Record<NavItem['group'], NavItem[]>>((acc, item) => {
      acc[item.group].push(item);
      return acc;
    }, {
      overview: [],
      employee: [],
      team: [],
      operations: [],
      catalog: [],
      finance: [],
      system: [],
    });
  }, [visibleNavItems]);

  const mobileNavItems = useMemo(() => {
    const roleKey = isAdminUser ? 'admin' : employeeRole ?? 'employee';
    const preferred = mobilePriorityByRole[roleKey] ?? [];
    const rank = (href: string) => {
      const index = preferred.indexOf(href);
      return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    };

    return visibleNavItems
      .slice()
      .sort((a, b) => {
        const rankDifference = rank(a.href) - rank(b.href);
        if (rankDifference !== 0) return rankDifference;
        return navItems.findIndex((item) => item.href === a.href) - navItems.findIndex((item) => item.href === b.href);
      })
      .slice(0, 5);
  }, [employeeRole, isAdminUser, visibleNavItems]);

  const topbarTitle =
    isAdminUser
      ? 'مركز الإدارة'
      : isManager
        ? 'مركز مدير الفريق'
        : employeeDashboardLabel;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', background: BG, direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', insetBlock: 0, right: 0, zIndex: 50,
        width: 286, background: S,
        borderLeft: '1px solid rgba(15,23,42,0.08)',
        display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s ease',
        boxShadow: '0 10px 40px rgba(15,23,42,0.08)',
      }}
        className="lg-sidebar"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '22px 22px 18px', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
          <div style={{ width: 44, height: 44, background: `linear-gradient(135deg,#FFFFFF,#F8FAFC)`, borderRadius: 14, border: `1px solid rgba(15,23,42,0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 8px 24px rgba(15,23,42,0.08)` }}>
            <img src={bakoLogo} alt="باكو" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 17, color: '#0F172A', lineHeight: 1.2 }}>
              <span style={{ color: '#0F172A' }}>رينو</span>
              <span style={{ color: G }}> باك</span>
            </p>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: G, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <ShieldCheck size={11} /> {brandSubtitle}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(15,23,42,0.45)', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: `rgba(200,151,74,0.1)`, border: `2px solid rgba(200,151,74,0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: G, fontWeight: 900, fontSize: 15 }}>{user?.name?.[0]}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(15,23,42,0.45)' }}>{getRoleLabel(user?.role, user?.employeeRole)}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(Object.entries(groupedNavItems) as Array<[NavItem['group'], NavItem[]]>).map(([groupKey, items]) => {
            if (!items.length) return null;
            return (
              <div key={groupKey} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ margin: '0 10px 2px', color: 'rgba(15,23,42,0.34)', fontSize: 10, fontWeight: 900, letterSpacing: '.04em' }}>
                  {currentGroupLabels[groupKey]}
                </p>
                {items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        onClick={() => setSidebarOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14,
                          cursor: 'pointer', transition: 'all .18s',
                          background: active ? 'rgba(200,151,74,0.14)' : 'transparent',
                          color: active ? '#0F172A' : 'rgba(15,23,42,0.72)',
                          fontWeight: 800, fontSize: 13,
                          border: active ? '1px solid rgba(200,151,74,0.24)' : '1px solid transparent',
                        }}
                        onMouseEnter={e => {
                          if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(15,23,42,0.04)';
                          (e.currentTarget as HTMLElement).style.color = '#0F172A';
                        }}
                        onMouseLeave={e => {
                          if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = active ? '#0F172A' : 'rgba(15,23,42,0.72)';
                        }}
                      >
                        <item.icon size={16} style={{ flexShrink: 0, color: active ? NV : 'inherit' }} />
                        <span>{item.href === '/admin/employee/dashboard' && item.employeeOnly ? employeeDashboardLabel : item.label}</span>
                        {active && <div style={{ marginRight: 'auto', width: 7, height: 7, borderRadius: '50%', background: G, opacity: 0.9 }} />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(15,23,42,0.08)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Link href="/">
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all .18s', color: 'rgba(15,23,42,0.62)', fontWeight: 700, fontSize: 13 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(15,23,42,0.04)'; (e.currentTarget as HTMLElement).style.color = '#0F172A'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(15,23,42,0.62)'; }}
            >
              <Store size={15} style={{ flexShrink: 0 }} />
              العودة للمتجر
            </div>
          </Link>
          <button
            onClick={() => { logout(); setLocation('/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all .18s', color: '#DC2626', fontWeight: 700, fontSize: 13, background: 'none', border: 'none', fontFamily: "'Almarai',sans-serif", width: '100%', textAlign: 'right' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(15,23,42,0.35)' }}
          className="lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }} className="admin-main">

        {/* Top bar */}
        <header style={{ position: 'sticky', top: 0, flexShrink: 0, zIndex: 30, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(15,23,42,0.08)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(15,23,42,0.65)' }}
          >
            <Menu size={22} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <p style={{ margin: 0, color: '#0F172A', fontSize: 15, fontWeight: 900 }}>{topbarTitle}</p>
              <p style={{ margin: 0, color: 'rgba(15,23,42,0.45)', fontSize: 11, fontWeight: 700 }}>مسار واضح حسب دورك الحالي</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 8px rgba(22,163,74,0.35)', animation: 'pulse 2s infinite' }} />
            <span style={{ color: 'rgba(15,23,42,0.55)', fontSize: 13, fontWeight: 700 }}>النظام يعمل بشكل طبيعي</span>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: isMobile ? '14px 12px 80px' : 24 }}>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav for admin - quick access to main sections */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: `rgba(255,255,255,0.95)`, backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(15,23,42,0.08)',
        display: 'flex', height: 60,
      }} className="lg:hidden">
        {mobileNavItems.map(item => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href} style={{ flex: 1, textDecoration: 'none' }}>
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer', color: active ? G : 'rgba(15,23,42,0.4)', transition: 'color .2s' }}>
                <item.icon size={18} style={{ strokeWidth: active ? 2.5 : 1.8 }} />
                <span style={{ fontSize: 9, fontWeight: 800, fontFamily: "'Almarai',sans-serif" }}>{item.href === '/admin/employee/dashboard' && item.employeeOnly ? employeeDashboardLabel : item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { position: sticky !important; top: 0 !important; transform: translateX(0) !important; height: 100vh !important; }
          .admin-main { margin-right: 0 !important; }
          .lg\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
