import React from 'react';
import { useGetAdminSales } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { Download, TrendingUp, ShoppingBag, DollarSign, Loader2 } from 'lucide-react';

function SimpleBarChart({ weeks }: { weeks: { week: string; total: number; count: number }[] }) {
  const maxTotal = Math.max(...weeks.map(w => w.total), 1);

  return (
    <div className="space-y-3">
      {weeks.map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-white/40 text-xs w-24 flex-shrink-0 text-left" dir="ltr">{w.week}</span>
          <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#1E2761] to-[#F9E795]/40 rounded-lg transition-all duration-500"
              style={{ width: `${(w.total / maxTotal) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center pr-2 text-white/80 text-xs font-bold">
              {w.total.toLocaleString()} ج.م ({w.count} طلب)
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminSales() {
  const { getAuthHeaders } = useAuth();
  const headers = getAuthHeaders();
  const { data, isLoading } = useGetAdminSales({ request: headers });

  const handleExport = () => {
    if (!data?.exportCsv) return;
    const blob = new Blob(["\uFEFF" + data.exportCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `renault-parts-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">تقرير المبيعات</h1>
          <p className="text-white/50 text-sm">مبيعات أسبوعية مع إمكانية التصدير</p>
        </div>
        <button
          onClick={handleExport}
          disabled={!data}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F9E795] text-[#1E2761] rounded-xl font-bold text-sm hover:bg-[#F9E795]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          تصدير CSV
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
        </div>
      ) : !data ? null : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#1E2761] to-[#2a3580] rounded-2xl p-5 border border-[#F9E795]/20">
              <DollarSign className="w-6 h-6 text-[#F9E795] mb-3" />
              <p className="text-2xl font-black text-white mb-1">{data.totalRevenue.toLocaleString()} ج.م</p>
              <p className="text-white/60 text-sm font-bold">إجمالي الإيرادات</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 border border-white/10">
              <ShoppingBag className="w-6 h-6 text-white/70 mb-3" />
              <p className="text-2xl font-black text-white mb-1">{data.totalOrders}</p>
              <p className="text-white/60 text-sm font-bold">إجمالي الطلبات</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-5 border border-white/10">
              <TrendingUp className="w-6 h-6 text-white/70 mb-3" />
              <p className="text-2xl font-black text-white mb-1">
                {data.totalOrders > 0 ? Math.round(data.totalRevenue / data.totalOrders).toLocaleString() : 0} ج.م
              </p>
              <p className="text-white/60 text-sm font-bold">متوسط قيمة الطلب</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-[#1E2761]/60 rounded-2xl border border-white/10 p-6">
            <h2 className="text-white font-bold text-lg mb-6">المبيعات الأسبوعية</h2>
            {data.weeks.length === 0 ? (
              <p className="text-white/30 text-center py-8 font-bold">لا توجد بيانات بعد</p>
            ) : (
              <SimpleBarChart weeks={data.weeks} />
            )}
          </div>

          {/* Table */}
          {data.weeks.length > 0 && (
            <div className="bg-[#1E2761]/60 rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-white font-bold">تفاصيل البيانات الأسبوعية</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/40 text-xs font-bold border-b border-white/5 bg-white/5">
                      <th className="px-6 py-3 text-right">الأسبوع</th>
                      <th className="px-4 py-3 text-right">الإيرادات</th>
                      <th className="px-4 py-3 text-right">عدد الطلبات</th>
                      <th className="px-4 py-3 text-right">متوسط الطلب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.weeks.map((w, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white/70 font-mono text-xs" dir="ltr">{w.week}</td>
                        <td className="px-4 py-4 text-[#F9E795] font-bold">{w.total.toLocaleString()} ج.م</td>
                        <td className="px-4 py-4 text-white/70">{w.count} طلب</td>
                        <td className="px-4 py-4 text-white/50">{w.count > 0 ? Math.round(w.total / w.count).toLocaleString() : 0} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
