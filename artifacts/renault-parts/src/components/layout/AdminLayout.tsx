import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
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
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'الرئيسية', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'الطلبات', icon: ClipboardList },
  { href: '/admin/packages', label: 'الباكدجات', icon: Package2 },
  { href: '/admin/workshops', label: 'الورش', icon: Wrench },
  { href: '/admin/workshop-applications', label: 'طلبات الانضمام', icon: FileCheck },
  { href: '/admin/parts', label: 'القطع', icon: Settings2 },
  { href: '/admin/reviews', label: 'التقييمات', icon: Star },
  { href: '/admin/sales', label: 'المبيعات', icon: BarChart2 },
  { href: '/admin/expenses', label: 'المصروفات', icon: TrendingDown },
  { href: '/admin/users', label: 'المستخدمون', icon: Users },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? location === href : location.startsWith(href);

  return (
    <div className="min-h-screen flex bg-[#0f1535]" dir="rtl">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-[#1E2761] border-l border-white/10
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-10 h-10 bg-[#F9E795] rounded-xl flex items-center justify-center flex-shrink-0">
            <Wrench className="w-6 h-6 text-[#1E2761]" />
          </div>
          <div>
            <p className="text-white font-black text-lg leading-tight">رينو بارتس</p>
            <p className="text-[#F9E795] text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> لوحة الإدارة
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden mr-auto text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F9E795]/20 border-2 border-[#F9E795]/40 flex items-center justify-center flex-shrink-0">
              <span className="text-[#F9E795] font-bold text-sm">{user?.name?.[0]}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{user?.name}</p>
              <p className="text-white/50 text-xs">مدير النظام</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                  isActive(item.href, item.exact)
                    ? 'bg-[#F9E795] text-[#1E2761]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href, item.exact) ? 'text-[#1E2761]' : ''}`} />
                <span className="font-bold text-sm">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="px-4 py-4 border-t border-white/10 space-y-2">
          <Link href="/">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 cursor-pointer transition-all text-sm font-bold">
              <Wrench className="w-4 h-4" />
              العودة للمتجر
            </div>
          </Link>
          <button
            onClick={() => { logout(); setLocation('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#1E2761]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/60 text-sm font-medium">النظام يعمل بشكل طبيعي</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
