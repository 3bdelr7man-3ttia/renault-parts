import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { adminUi } from '@/components/admin/admin-ui';
import { Download, DollarSign, Loader2, Phone, ShoppingBag, Store, TrendingDown, TrendingUp, Wrench } from 'lucide-react';

function SimpleBarChart({ weeks }: { weeks: { week: string; total: number; count: number }[] }) {
  const maxTotal = Math.max(...weeks.map((week) => week.total), 1);

  return (
    <div className="space-y-3">
      {weeks.map((week) => (
        <div key={week.week} className="flex items-center gap-3">
          <span className="w-24 flex-shrink-0 text-left text-xs text-slate-400" dir="ltr">{week.week}</span>
          <div className="relative h-8 flex-1 overflow-hidden rounded-xl bg-slate-100">
            <div
              className="h-full rounded-xl bg-gradient-to-r from-[#C8974A] to-amber-200 transition-all duration-500"
              style={{ width: `${(week.total / maxTotal) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center pr-3 text-xs font-bold text-slate-700">
              {week.total.toLocaleString()} ج.م ({week.count} طلب)
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
      .then((response) => response.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleExport = () => {
    if (!data?.exportCsv) return;
    const blob = new Blob(['\uFEFF' + data.exportCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `renault-parts-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const summaryCards = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'إجمالي الإيرادات', value: `${data.totalRevenue.toLocaleString()} ج.م`, accent: 'text-amber-800', shell: 'border-amber-200 bg-amber-50/70', icon: DollarSign },
      { label: 'إجمالي الطلبات', value: data.totalOrders, accent: 'text-sky-800', shell: 'border-sky-200 bg-sky-50/70', icon: ShoppingBag },
      { label: 'إجمالي المصروفات', value: `${data.totalExpenses.toLocaleString()} ج.م`, accent: 'text-rose-700', shell: 'border-rose-200 bg-rose-50/70', icon: TrendingDown },
      { label: 'أرباح الورش', value: `${data.totalWorkshopEarnings.toLocaleString()} ج.م`, accent: 'text-violet-800', shell: 'border-violet-200 bg-violet-50/70', icon: Store },
      {
        label: 'صافي الربح',
        value: `${data.netProfit.toLocaleString()} ج.م`,
        accent: data.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700',
        shell: data.netProfit >= 0 ? 'border-emerald-200 bg-emerald-50/70' : 'border-rose-200 bg-rose-50/70',
        icon: TrendingUp,
      },
    ];
  }, [data]);

  return (
    <div className={adminUi.page}>
      <div className={adminUi.hero}>
        <div className={adminUi.toolbar}>
          <div>
            <h1 className={adminUi.title}>تقرير المبيعات</h1>
            <p className={adminUi.subtitle}>نظرة تشغيلية على الإيرادات، أداء الورش، والمبيعات الأسبوعية بلغة مرئية أوضح.</p>
          </div>
          <button onClick={handleExport} disabled={!data} className={`${adminUi.primaryButton} flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-50`}>
            <Download className="h-4 w-4" />
            تصدير CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {summaryCards.map((card) => (
              <div key={card.label} className={`${adminUi.statCard} ${card.shell}`}>
                <card.icon className={`mb-3 h-5 w-5 ${card.accent}`} />
                <p className={`text-lg font-black ${card.accent}`}>{card.value}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{card.label}</p>
              </div>
            ))}
          </div>

          {data.byWorkshop.length > 0 ? (
            <div className={adminUi.tableShell}>
              <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
                <Wrench className="h-4 w-4 text-amber-700" />
                <h2 className="font-bold text-slate-950">تفصيل أرباح الورش</h2>
              </div>

              <div className="divide-y divide-slate-100 sm:hidden">
                {data.byWorkshop.map((workshop) => {
                  const pct = data.totalRevenue > 0 ? Math.round((workshop.total / data.totalRevenue) * 100) : 0;
                  return (
                    <div key={workshop.workshopName} className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-950">{workshop.workshopName}</p>
                          {workshop.workshopPhone ? (
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Phone className="h-3 w-3" />{workshop.workshopPhone}</p>
                          ) : null}
                        </div>
                        <div className="text-left">
                          <p className="font-black text-amber-700">{workshop.total.toLocaleString()} ج.م</p>
                          <p className="text-xs text-slate-400">{workshop.orderCount} طلب</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-[#C8974A]" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-left text-xs font-black text-amber-700">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${adminUi.tableHead} border-b border-slate-200`}>
                      <th className="px-6 py-3 text-right">الورشة</th>
                      <th className="px-4 py-3 text-right">الهاتف</th>
                      <th className="px-4 py-3 text-right">عدد الطلبات</th>
                      <th className="px-4 py-3 text-right">الأرباح</th>
                      <th className="px-4 py-3 text-right">النسبة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byWorkshop.map((workshop) => {
                      const pct = data.totalRevenue > 0 ? Math.round((workshop.total / data.totalRevenue) * 100) : 0;
                      return (
                        <tr key={workshop.workshopName} className={adminUi.tableRow}>
                          <td className="px-6 py-4 font-bold text-slate-950">{workshop.workshopName}</td>
                          <td className="px-4 py-4 text-xs text-slate-500">
                            {workshop.workshopPhone ? <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{workshop.workshopPhone}</span> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-4 text-slate-600">{workshop.orderCount} طلب</td>
                          <td className="px-4 py-4 font-black text-amber-700">{workshop.total.toLocaleString()} ج.م</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-[#C8974A]" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-10 text-left text-xs font-black text-amber-700">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className={adminUi.card}>
            <h2 className="mb-6 text-lg font-bold text-slate-950">المبيعات الأسبوعية</h2>
            {data.weeks.length === 0 ? (
              <p className="py-8 text-center font-bold text-slate-400">لا توجد بيانات بعد</p>
            ) : (
              <SimpleBarChart weeks={data.weeks} />
            )}
          </div>

          {data.weeks.length > 0 ? (
            <div className={adminUi.tableShell}>
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="font-bold text-slate-950">تفاصيل البيانات الأسبوعية</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${adminUi.tableHead} border-b border-slate-200`}>
                      <th className="px-6 py-3 text-right">الأسبوع</th>
                      <th className="px-4 py-3 text-right">الإيرادات</th>
                      <th className="px-4 py-3 text-right">عدد الطلبات</th>
                      <th className="px-4 py-3 text-right">متوسط الطلب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.weeks.map((week) => (
                      <tr key={week.week} className={adminUi.tableRow}>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600" dir="ltr">{week.week}</td>
                        <td className="px-4 py-4 font-bold text-amber-700">{week.total.toLocaleString()} ج.م</td>
                        <td className="px-4 py-4 text-slate-600">{week.count} طلب</td>
                        <td className="px-4 py-4 text-slate-500">{week.count > 0 ? Math.round(week.total / week.count).toLocaleString() : 0} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
