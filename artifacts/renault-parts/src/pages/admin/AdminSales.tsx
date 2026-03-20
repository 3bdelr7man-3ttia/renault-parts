import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Download, TrendingUp, ShoppingBag, DollarSign, Loader2, TrendingDown, Wrench, Phone, Store } from 'lucide-react';

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

type SalesData = {
  weeks: { week: string; total: number; count: number }[];
  totalRevenue: number;
  totalOrders: number;
  totalExpenses: number;
  totalWorkshopEarnings: number;
  netProfit: number;
  byWorkshop: { workshopId: number | null; workshopName: string; workshopPhone: string | null; total: number; orderCount: number }[];
  exportCsv: string;
};

export default function AdminSales() {
  const { token } = useAuth();
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const [data, setData] = useState<SalesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/sales', { headers: authHeader })
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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

  const netProfit = data?.netProfit ?? 0;
  const totalWorkshopEarnings = data?.totalWorkshopEarnings ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-white mb-1">تقرير المبيعات</h1>
          <p className="text-white/50 text-sm">مبيعات أسبوعية وتفصيل الورش مع إمكانية التصدير</p>
        </div>
        <button
          onClick={handleExport}
          disabled={!data}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F9E795] text-[#1E2761] rounded-xl font-bold text-sm hover:bg-[#F9E795]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
          {/* KPI Cards — 2 cols mobile, 5 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* 1 — إجمالي الإيرادات (completed orders only) */}
            <div className="bg-gradient-to-br from-[#1E2761] to-[#2a3580] rounded-2xl p-4 border border-[#F9E795]/20">
              <DollarSign className="w-5 h-5 text-[#F9E795] mb-2" />
              <p className="text-lg font-black text-white mb-0.5">{data.totalRevenue.toLocaleString()} ج.م</p>
              <p className="text-white/60 text-xs font-bold">إجمالي الإيرادات</p>
            </div>
            {/* 2 — إجمالي الطلبات */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-4 border border-white/10">
              <ShoppingBag className="w-5 h-5 text-white/70 mb-2" />
              <p className="text-lg font-black text-white mb-0.5">{data.totalOrders}</p>
              <p className="text-white/60 text-xs font-bold">إجمالي الطلبات</p>
            </div>
            {/* 3 — إجمالي المصروفات */}
            <div className="rounded-2xl p-4 border" style={{ background: 'linear-gradient(135deg,#7f1d1d50,#991b1b30)', borderColor: '#ef444430' }}>
              <TrendingDown className="w-5 h-5 text-red-400 mb-2" />
              <p className="text-lg font-black text-red-400 mb-0.5">{(data.totalExpenses ?? 0).toLocaleString()} ج.م</p>
              <p className="text-white/60 text-xs font-bold">إجمالي المصروفات</p>
            </div>
            {/* 4 — أرباح الورش */}
            <div className="rounded-2xl p-4 border" style={{ background: 'linear-gradient(135deg,#2e1a0050,#92400e30)', borderColor: '#C8974A30' }}>
              <Store className="w-5 h-5 text-[#C8974A] mb-2" />
              <p className="text-lg font-black text-[#C8974A] mb-0.5">{totalWorkshopEarnings.toLocaleString()} ج.م</p>
              <p className="text-white/60 text-xs font-bold">أرباح الورش</p>
            </div>
            {/* 5 — صافي الربح = الإيرادات − أرباح الورش − المصروفات */}
            <div className="col-span-2 sm:col-span-1 rounded-2xl p-4 border" style={{
              background: netProfit >= 0 ? 'linear-gradient(135deg,#14532d50,#15803d30)' : 'linear-gradient(135deg,#7f1d1d50,#991b1b30)',
              borderColor: netProfit >= 0 ? '#22c55e30' : '#ef444430',
            }}>
              <TrendingUp className="w-5 h-5 mb-2" style={{ color: netProfit >= 0 ? '#22c55e' : '#ef4444' }} />
              <p className="text-lg font-black mb-0.5" style={{ color: netProfit >= 0 ? '#22c55e' : '#ef4444' }}>{netProfit.toLocaleString()} ج.م</p>
              <p className="text-white/60 text-xs font-bold">صافي الربح</p>
            </div>
          </div>

          {/* Workshop Breakdown */}
          {data.byWorkshop.length > 0 && (
            <div className="bg-[#1E2761]/60 rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#F9E795]" />
                <h2 className="text-white font-bold">تفصيل أرباح الورش</h2>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-white/5">
                {data.byWorkshop.map((w, i) => {
                  const pct = data.totalRevenue > 0 ? Math.round((w.total / data.totalRevenue) * 100) : 0;
                  return (
                    <div key={i} className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#F9E795]/10 flex items-center justify-center flex-shrink-0">
                            <Wrench size={13} className="text-[#F9E795]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-bold text-sm truncate">{w.workshopName}</p>
                            {w.workshopPhone && (
                              <p className="text-white/40 text-xs flex items-center gap-1">
                                <Phone size={9} />{w.workshopPhone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-left flex-shrink-0">
                          <p className="text-[#C8974A] font-black text-base">{w.total.toLocaleString()} ج.م</p>
                          <p className="text-white/40 text-xs text-left">{w.orderCount} طلب</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#C8974A]" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[#C8974A] text-xs font-black w-8 text-left">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/40 text-xs font-bold border-b border-white/5 bg-white/5">
                      <th className="px-6 py-3 text-right">الورشة</th>
                      <th className="px-4 py-3 text-right">الهاتف</th>
                      <th className="px-4 py-3 text-right">عدد الطلبات</th>
                      <th className="px-4 py-3 text-right">الأرباح</th>
                      <th className="px-4 py-3 text-right">النسبة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byWorkshop.map((w, i) => {
                      const pct = data.totalRevenue > 0 ? Math.round((w.total / data.totalRevenue) * 100) : 0;
                      return (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#F9E795]/10 flex items-center justify-center flex-shrink-0">
                                <Wrench size={12} className="text-[#F9E795]" />
                              </div>
                              <span className="text-white font-bold">{w.workshopName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {w.workshopPhone
                              ? <span className="text-white/60 text-xs flex items-center gap-1"><Phone size={10} />{w.workshopPhone}</span>
                              : <span className="text-white/20 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-4 text-white/70">{w.orderCount} طلب</td>
                          <td className="px-4 py-4 text-[#C8974A] font-black text-base">{w.total.toLocaleString()} ج.م</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-[#C8974A]" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[#C8974A] text-xs font-black w-10 text-left">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Weekly Chart */}
          <div className="bg-[#1E2761]/60 rounded-2xl border border-white/10 p-6">
            <h2 className="text-white font-bold text-lg mb-6">المبيعات الأسبوعية</h2>
            {data.weeks.length === 0 ? (
              <p className="text-white/30 text-center py-8 font-bold">لا توجد بيانات بعد</p>
            ) : (
              <SimpleBarChart weeks={data.weeks} />
            )}
          </div>

          {/* Weekly Table */}
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
