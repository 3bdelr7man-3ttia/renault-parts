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
const NV = '#1A2356';
const BG = '#0D1220';
const S  = '#111826';
const S2 = '#161E30';

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

const navItems: NavItem[] = [
  { href: '/admin',                        label: 'الرئيسية',         icon: LayoutDashboard, group: 'overview', exact: true, adminOnly: true },
  { href: '/admin/employee/dashboard',     label: 'لوحة الموظف',      icon: LayoutDashboard, group: 'overview', employeeOnly: true },
  { href: '/admin/employee/customers',     label: 'عملائي',           icon: Users, group: 'employee', employeeOnly: true, permission: 'sales.customers.view_own', employeeRoles: ['sales', 'manager'] },
  { href: '/admin/employee/workshops',     label: 'ورش المتابعة',     icon: Wrench, group: 'employee', employeeOnly: true, permission: 'sales.workshops.view_own', employeeRoles: ['sales', 'manager'] },
  { href: '/admin/employee/technical',     label: 'الحالات الفنية',   icon: Stethoscope, group: 'employee', employeeOnly: true, permission: 'technical.cases.view_own', employeeRoles: ['technical_expert', 'manager'] },
  { href: '/admin/employee/returns',       label: 'المرتجعات',        icon: ArrowRightLeft, group: 'employee', permission: 'returns.view', employeeRoles: ['technical_expert', 'data_entry', 'manager'] },
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

  const isActive = (href: string, exact?: boolean) =>
    exact ? location === href : location.startsWith(href);

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (isRole('admin')) return true;
      if (item.adminOnly) return isRole('admin');
      if (item.employeeOnly && !isRole('employee')) return false;
      if (item.employeeRoles && (!employeeRole || !item.employeeRoles.includes(employeeRole))) return false;
      if (!isRole('employee')) return false;
      if (!item.permission) return true;
      return hasPermission(item.permission);
    });
  }, [employeeRole, hasPermission, isRole]);

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

  const mobileNavItems = visibleNavItems.slice(0, 5);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: BG, direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', insetBlock: 0, right: 0, zIndex: 50,
        width: 272, background: S,
        borderLeft: '1px solid rgba(200,151,74,0.1)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s ease',
      }}
        className="lg-sidebar"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '22px 22px 18px', borderBottom: '1px solid rgba(200,151,74,0.08)' }}>
          <div style={{ width: 44, height: 44, background: `linear-gradient(135deg,${NV},#2A3570)`, borderRadius: 14, border: `1.5px solid rgba(200,151,74,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 16px rgba(200,151,74,0.15)` }}>
            <img src={bakoLogo} alt="باكو" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 17, color: '#E8F0F8', lineHeight: 1.2 }}>
              <span style={{ color: '#fff' }}>رينو</span>
              <span style={{ color: G }}> باك</span>
            </p>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: G, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <ShieldCheck size={11} /> لوحة الإدارة
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(200,151,74,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: `rgba(200,151,74,0.1)`, border: `2px solid rgba(200,151,74,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: G, fontWeight: 900, fontSize: 15 }}>{user?.name?.[0]}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: '#E8F0F8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{getRoleLabel(user?.role, user?.employeeRole)}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(Object.entries(groupedNavItems) as Array<[NavItem['group'], NavItem[]]>).map(([groupKey, items]) => {
            if (!items.length) return null;
            return (
              <div key={groupKey} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ margin: '0 10px 4px', color: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 900, letterSpacing: '.04em' }}>
                  {groupLabels[groupKey]}
                </p>
                {items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        onClick={() => setSidebarOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12,
                          cursor: 'pointer', transition: 'all .18s',
                          background: active ? G : 'transparent',
                          color: active ? NV : 'rgba(255,255,255,0.6)',
                          fontWeight: 800, fontSize: 13,
                        }}
                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,74,0.08)'; (e.currentTarget as HTMLElement).style.color = active ? NV : '#fff'; }}
                        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = active ? NV : 'rgba(255,255,255,0.6)'; }}
                      >
                        <item.icon size={16} style={{ flexShrink: 0, color: active ? NV : 'inherit' }} />
                        <span>{item.label}</span>
                        {active && <div style={{ marginRight: 'auto', width: 6, height: 6, borderRadius: '50%', background: NV, opacity: 0.6 }} />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(200,151,74,0.08)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Link href="/">
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all .18s', color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 13 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
            >
              <Store size={15} style={{ flexShrink: 0 }} />
              العودة للمتجر
            </div>
          </Link>
          <button
            onClick={() => { logout(); setLocation('/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all .18s', color: '#EF4444', fontWeight: 700, fontSize: 13, background: 'none', border: 'none', fontFamily: "'Almarai',sans-serif", width: '100%', textAlign: 'right' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
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
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)' }}
          className="lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0, overflow: 'hidden' }} className="admin-main">

        {/* Top bar */}
        <header style={{ flexShrink: 0, zIndex: 30, background: `${S}CC`, backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(200,151,74,0.08)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}
          >
            <Menu size={22} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e80', animation: 'pulse 2s infinite' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600 }}>النظام يعمل بشكل طبيعي</span>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: isMobile ? '14px 12px 80px' : 24, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav for admin - quick access to main sections */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: `${S}F5`, backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(200,151,74,0.1)',
        display: 'flex', height: 60,
      }} className="lg:hidden">
        {mobileNavItems.map(item => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href} style={{ flex: 1, textDecoration: 'none' }}>
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer', color: active ? G : 'rgba(255,255,255,0.35)', transition: 'color .2s' }}>
                <item.icon size={18} style={{ strokeWidth: active ? 2.5 : 1.8 }} />
                <span style={{ fontSize: 9, fontWeight: 800, fontFamily: "'Almarai',sans-serif" }}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { position: relative !important; transform: translateX(0) !important; }
          .admin-main { margin-right: 0 !important; }
          .lg\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
