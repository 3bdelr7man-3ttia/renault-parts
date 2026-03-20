import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard, CalendarCheck, DollarSign, LogOut,
  Menu, X, Wrench, Store, ChevronRight, Bell, Tag, CalendarDays,
} from 'lucide-react';
import bakoLogo from '@/assets/bako-logo.png';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const G   = '#C8974A';
const NV  = '#1A2356';
const BG  = '#0D1220';
const S   = '#111826';
const S2  = '#161E30';

const navItems = [
  { href: '/workshop',              label: 'الرئيسية',  icon: LayoutDashboard, exact: true },
  { href: '/workshop/appointments', label: 'المواعيد',  icon: CalendarCheck },
  { href: '/workshop/schedule',     label: 'الجدول',    icon: CalendarDays },
  { href: '/workshop/orders',       label: 'الطلبات',   icon: Wrench },
  { href: '/workshop/earnings',     label: 'الحسابات',  icon: DollarSign },
  { href: '/workshop/pricing',      label: 'التسعير',   icon: Tag },
];

export function WorkshopLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { isMobile } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? location === href : location.startsWith(href);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: BG, direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', insetBlock: 0, right: 0, zIndex: 50,
        width: 260, background: S,
        borderLeft: '1px solid rgba(200,151,74,0.12)',
        display: 'flex', flexDirection: 'column',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s ease',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
      }}
        className="ws-sidebar"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 16px', borderBottom: '1px solid rgba(200,151,74,0.08)' }}>
          <div style={{ width: 42, height: 42, background: `linear-gradient(135deg,${NV},#2A3570)`, borderRadius: 14, border: `1.5px solid rgba(200,151,74,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={bakoLogo} alt="باكو" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 15, color: '#E8F0F8', lineHeight: 1.2 }}>
              <span style={{ color: '#fff' }}>رينو</span>
              <span style={{ color: G }}> باك</span>
            </p>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: G, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Wrench size={9} /> بوابة الورشة
            </p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Workshop Info */}
        <div style={{ padding: '12px 20px 12px', borderBottom: '1px solid rgba(200,151,74,0.08)', background: 'rgba(200,151,74,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(200,151,74,0.12)', border: '2px solid rgba(200,151,74,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: G, fontWeight: 900, fontSize: 14 }}>{user?.name?.[0]}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 12, color: '#E8F0F8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: 10, color: G, fontWeight: 700 }}>مسؤول ورشة</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link key={item.href} href={item.href}>
                <div onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12,
                    cursor: 'pointer', transition: 'all .18s',
                    background: active ? G : 'transparent',
                    color: active ? NV : 'rgba(255,255,255,0.6)',
                    fontWeight: 800, fontSize: 13,
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,74,0.08)'; (e.currentTarget as HTMLElement).style.color = '#fff'; } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; } }}
                >
                  <item.icon size={15} style={{ flexShrink: 0, color: active ? NV : 'inherit' }} />
                  <span>{item.label}</span>
                  {active && <ChevronRight size={12} style={{ marginRight: 'auto', color: NV, opacity: 0.6 }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '10px', borderTop: '1px solid rgba(200,151,74,0.08)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Link href="/">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all .18s', color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 12 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
            >
              <Store size={14} style={{ flexShrink: 0 }} /> العودة للمتجر
            </div>
          </Link>
          <button onClick={() => { logout(); setLocation('/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all .18s', color: '#EF4444', fontWeight: 700, fontSize: 12, background: 'none', border: 'none', fontFamily: "'Almarai',sans-serif", width: '100%', textAlign: 'right' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <LogOut size={14} style={{ flexShrink: 0 }} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.65)' }}
          className="lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }} className="ws-main">

        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: `${S}CC`, backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(200,151,74,0.08)',
          padding: isMobile ? '12px 16px' : '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4 }}>
              <Menu size={22} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wrench size={14} color={G} />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700 }}>بوابة الورشة</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e80' }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}>متصل</span>
          </div>
        </header>

        {/* Bottom nav for mobile */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: `${S}F5`, backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(200,151,74,0.12)',
          display: 'flex', height: 62,
        }} className="lg:hidden ws-bottom-nav">
          {navItems.map(item => {
            const active = isActive(item.href, item.exact);
            return (
              <Link key={item.href} href={item.href} style={{ flex: 1, textDecoration: 'none' }}>
                <div style={{
                  height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 3, cursor: 'pointer',
                  color: active ? G : 'rgba(255,255,255,0.35)',
                  transition: 'color .2s',
                }}>
                  <item.icon size={19} style={{ strokeWidth: active ? 2.5 : 1.8 }} />
                  <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "'Almarai',sans-serif" }}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, padding: isMobile ? '16px 14px 80px' : '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .ws-sidebar { position: relative !important; transform: translateX(0) !important; }
          .ws-main { margin-right: 260px; }
          .ws-bottom-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
