import React from 'react';
import { Link } from 'wouter';
import { ShieldX, Home, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AccessDenied() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f1535] flex items-center justify-center p-6" dir="rtl">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20">
            <ShieldX className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black text-white mb-3">غير مصرح بالدخول</h1>
          <p className="text-white/50 text-base leading-relaxed">
            عذراً، هذه الصفحة مخصصة للمديرين فقط.
            {user && (
              <span className="block mt-2 text-white/40 text-sm">
                أنت مسجل دخول كـ <strong className="text-white/60">{user.name}</strong> بدور{' '}
                <strong className="text-white/60">{user.role === 'customer' ? 'عميل' : user.role}</strong>
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/">
            <div className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#F9E795] text-[#1E2761] rounded-xl font-bold hover:bg-[#F9E795]/80 transition-all cursor-pointer">
              <Home className="w-5 h-5" />
              العودة للصفحة الرئيسية
            </div>
          </Link>
          {user && (
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white/10 text-white/70 rounded-xl font-bold hover:bg-white/20 hover:text-white transition-all"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
