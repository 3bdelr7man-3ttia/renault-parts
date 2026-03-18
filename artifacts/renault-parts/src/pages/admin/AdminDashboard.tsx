import React from 'react';
import { Link } from 'wouter';
import { useGetAdminStats, useListAdminOrders } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import {
  ShoppingBag, Clock, CheckCircle2, TrendingUp,
  Users, DollarSign, ArrowLeft, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: 'قيد المراجعة', color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
  confirmed:  { label: 'مؤكد',         color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  processing: { label: 'جاري التركيب', color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
  completed:  { label: 'مكتمل',        color: 'bg-green-500/20 text-green-300 border border-green-500/30' },
  cancelled:  { label: 'ملغي',         color: 'bg-red-500/20 text-red-300 border border-red-500/30' },
};

export default function AdminDashboard() {
  const { getAuthHeaders } = useAuth();
  const headers = getAuthHeaders();

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({ request: headers });
  const { data: orders, isLoading: ordersLoading } = useListAdminOrders({}, { request: headers });

  const recentOrders = orders?.slice(0, 8) ?? [];

  const statCards = stats
    ? [
        { icon: ShoppingBag, label: 'إجمالي الطلبات', value: stats.totalOrders, sub: `اليوم: ${stats.ordersToday}`, color: 'from-blue-600 to-blue-800' },
        { icon: Clock,       label: 'قيد المراجعة',  value: stats.pendingOrders, sub: 'تحتاج مراجعة', color: 'from-yellow-600 to-yellow-800' },
        { icon: CheckCircle2, label: 'مكتملة',       value: stats.completedOrders, sub: `مؤكدة: ${stats.confirmedOrders}`, color: 'from-green-600 to-green-800' },
        { icon: DollarSign,  label: 'إجمالي الإيراد', value: `${stats.totalRevenue.toLocaleString()} ج.م`, sub: `اليوم: ${stats.revenueToday.toLocaleString()} ج.م`, color: 'from-[#1E2761] to-[#2a3580]', border: 'border-[#F9E795]/30' },
        { icon: Users,       label: 'المستخدمون',    value: stats.totalUsers, sub: 'عميل مسجل', color: 'from-purple-600 to-purple-800' },
        { icon: TrendingUp,  label: 'إيراد اليوم',   value: `${stats.revenueToday.toLocaleString()} ج.م`, sub: `${stats.ordersToday} طلب اليوم`, color: 'from-rose-600 to-rose-800' },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">لوحة التحكم</h1>
        <p className="text-white/50 text-sm">مرحباً بك في لوحة إدارة رينو بارتس</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 border ${card.border ?? 'border-white/10'} shadow-xl`}
            >
              <div className="flex items-start justify-between mb-3">
                <card.icon className="w-6 h-6 text-white/70" />
              </div>
              <p className="text-2xl font-black text-white mb-1">{card.value}</p>
              <p className="text-white/80 font-bold text-xs">{card.label}</p>
              <p className="text-white/50 text-xs mt-1">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-[#1E2761]/60 rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">آخر الطلبات</h2>
          <Link href="/admin/orders">
            <div className="text-[#F9E795] text-sm font-bold flex items-center gap-1 cursor-pointer hover:underline">
              عرض الكل <ArrowLeft className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {ordersLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-bold">لا توجد طلبات بعد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs font-bold border-b border-white/5">
                  <th className="px-6 py-3 text-right">#</th>
                  <th className="px-4 py-3 text-right">العميل</th>
                  <th className="px-4 py-3 text-right">الباكدج</th>
                  <th className="px-4 py-3 text-right">السيارة</th>
                  <th className="px-4 py-3 text-right">الإجمالي</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const st = STATUS_MAP[order.status] ?? { label: order.status, color: 'bg-gray-500/20 text-gray-300' };
                  return (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/60 font-mono text-xs">#{order.id}</td>
                      <td className="px-4 py-4">
                        <p className="text-white font-bold">{order.userName}</p>
                        <p className="text-white/40 text-xs" dir="ltr">{order.userPhone}</p>
                      </td>
                      <td className="px-4 py-4 text-white/80 font-medium">{order.packageName}</td>
                      <td className="px-4 py-4 text-white/60 text-xs">{order.carModel} {order.carYear}</td>
                      <td className="px-4 py-4 text-[#F9E795] font-bold">{order.total.toLocaleString()} ج.م</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-4 text-white/40 text-xs">
                        {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: ar })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
