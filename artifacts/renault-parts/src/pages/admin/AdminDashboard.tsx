import React from 'react';
import { Link } from 'wouter';
import { useGetAdminStats, useListAdminOrders } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import {
  ShoppingBag, Clock, CheckCircle2, TrendingUp,
  Users, DollarSign, ArrowLeft, Loader2, Package2, Wrench, BarChart2, Star
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: 'قيد المراجعة', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  confirmed:  { label: 'مؤكد',         color: 'bg-sky-50 text-sky-700 border border-sky-200' },
  processing: { label: 'جاري التركيب', color: 'bg-violet-50 text-violet-700 border border-violet-200' },
  completed:  { label: 'مكتمل',        color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  cancelled:  { label: 'ملغي',         color: 'bg-red-50 text-red-700 border border-red-200' },
};

type TechnicalOverview = {
  totalCases: number;
  returnsCases: number;
  urgentCases: number;
  pendingTransferCases: number;
  topCategories: Array<{ category: string | null; count: number }>;
  topReturnedContexts: Array<{ name: string; area: string | null; count: number }>;
};

const technicalCategoryLabels: Record<string, string> = {
  engine: 'محرك',
  electrical: 'كهرباء',
  cooling: 'تبريد',
  suspension: 'عفشة',
  brakes: 'فرامل',
  transmission: 'ناقل حركة',
  diagnostics: 'تشخيص',
  parts_return: 'مرتجعات وقطع',
  warranty: 'ضمان',
  workshop_relation: 'علاقة ورش',
  other: 'أخرى',
};

function MiniBarChart({ data }: { data: { week: string; total: number; count: number }[] }) {
  const maxTotal = Math.max(...data.map(d => d.total), 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end" style={{ height: '88px' }}>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-[#F9E795]/60 to-[#F9E795]/20 hover:from-[#F9E795]/80 hover:to-[#F9E795]/40 transition-all cursor-default"
              style={{ height: `${Math.max((d.total / maxTotal) * 100, 4)}%` }}
              title={`${d.week}: ${d.total.toLocaleString()} ج.م (${d.count} طلب)`}
            />
          </div>
          <span className="text-slate-400 text-[9px] leading-none">{d.week.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { token, getAuthHeaders } = useAuth();
  const headers = getAuthHeaders();
  const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, '') ?? '';

  const { data: stats, isLoading: statsLoading, isError: statsError } = useGetAdminStats({ request: headers });
  const { data: orders, isLoading: ordersLoading, isError: ordersError } = useListAdminOrders({}, { request: headers });
  const [technicalOverview, setTechnicalOverview] = React.useState<TechnicalOverview | null>(null);
  const [technicalLoading, setTechnicalLoading] = React.useState(false);

  React.useEffect(() => {
    if (!token) {
      setTechnicalOverview(null);
      return;
    }

    let cancelled = false;
    setTechnicalLoading(true);

    fetch(`${base}/api/admin/technical-overview`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(result?.error || 'تعذر تحميل الملخص الفني الآن.');
        }
        if (!cancelled) {
          setTechnicalOverview(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTechnicalOverview(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setTechnicalLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [base, token]);

  const weeklySales = Array.isArray(stats?.weeklySales) ? stats.weeklySales : [];
  const topPackages = Array.isArray(stats?.topPackages) ? stats.topPackages : [];
  const topWorkshops = Array.isArray(stats?.topWorkshops) ? stats.topWorkshops : [];
  const recentOrders = Array.isArray(orders) ? orders.slice(0, 8) : [];

  const statCards = stats
    ? [
        { icon: ShoppingBag, label: 'إجمالي الطلبات', value: stats.totalOrders, sub: `اليوم: ${stats.ordersToday}`, iconTone: 'text-sky-700 bg-sky-50 border-sky-200' },
        { icon: Clock,       label: 'قيد المراجعة',  value: stats.pendingOrders, sub: 'تحتاج مراجعة', iconTone: 'text-amber-700 bg-amber-50 border-amber-200' },
        { icon: CheckCircle2, label: 'مكتملة',       value: stats.completedOrders, sub: `مؤكدة: ${stats.confirmedOrders}`, iconTone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        { icon: DollarSign,  label: 'إجمالي الإيراد', value: `${stats.totalRevenue.toLocaleString()} ج.م`, sub: `اليوم: ${stats.revenueToday.toLocaleString()} ج.م`, iconTone: 'text-violet-700 bg-violet-50 border-violet-200', valueTone: 'text-[#C8974A]' },
        { icon: Users,       label: 'المستخدمون',    value: stats.totalUsers, sub: 'عميل مسجل', iconTone: 'text-slate-700 bg-slate-50 border-slate-200' },
        {
          icon: Star,
          label: 'متوسط التقييم',
          value: stats.avgRating != null ? `${stats.avgRating} / 5` : 'لا يوجد',
          sub: `${stats.totalReviews} تقييم`,
          iconTone: 'text-amber-700 bg-amber-50 border-amber-200',
        },
      ]
    : [];

  const formatOrderDate = (value: unknown) => {
    if (!value) return '—';
    const parsed = new Date(String(value));
    if (Number.isNaN(parsed.getTime())) return '—';
    return format(parsed, 'dd/MM/yyyy', { locale: ar });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-950 mb-1">مركز إدارة رينو باك</h1>
        <p className="text-slate-500 text-sm">من هنا ترى الصورة الكاملة، المؤشرات الحرجة، وما يحتاج قرارًا إداريًا أو إعادة توزيع.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Link href="/admin/employee/team">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 cursor-pointer hover:border-[#C8974A]/30 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[#C8974A] text-xs font-black mb-2">إدارة الفريق والتوزيع</p>
                <h2 className="text-slate-950 text-xl font-black mb-2">الإدارة العليا توجه التنفيذ من هنا</h2>
                <p className="text-slate-500 text-sm leading-7">
                  راقب أين تتعطل المتابعة، ثم وجّه مدير الفريق واطلع على ما تم إسناده وما يحتاج تدخلك في المبيعات أو المرتجعات أو الحالات الفنية.
                </p>
              </div>
              <Users className="w-7 h-7 text-[#C8974A] flex-shrink-0" />
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-[#C8974A] text-sm font-black">
              افتح إدارة الفريق <ArrowLeft className="w-4 h-4" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
          <p className="text-slate-400 text-xs font-black mb-2">دورة التشغيل الحالية</p>
          <h2 className="text-slate-950 text-lg font-black mb-3">Admin → Team Manager → Specialists</h2>
          <p className="text-slate-500 text-sm leading-7">
            الأدمن هنا ليس موظفًا منفذًا، بل صاحب قرار يرى المؤشرات، يحدد الأولويات، ويكلّف مدير الفريق الذي يحرك المبيعات والداتا والخبرة الفنية والتسويق.
          </p>
        </div>
      </div>
      {/* KPI Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-200/70 animate-pulse" />
          ))}
        </div>
      ) : statsError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          تعذر تحميل إحصاءات لوحة الإدارة الآن. جرّب تحديث الصفحة مرة أخرى.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card, i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${card.iconTone}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <p className={`mb-1 text-2xl font-black ${card.valueTone ?? 'text-slate-950'}`}>{card.value}</p>
              <p className="text-xs font-bold text-slate-700">{card.label}</p>
              <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
            </div>
          ))}
        </div>
      )}
      {/* Charts + Top lists row */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Sales Chart */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#C8974A]" />
                <h2 className="text-slate-950 font-bold">المبيعات الأسبوعية</h2>
              </div>
              <Link href="/admin/sales">
                <span className="text-[#C8974A] text-xs font-bold cursor-pointer hover:underline">تفاصيل</span>
              </Link>
            </div>
            {weeklySales.length === 0 ? (
              <p className="text-slate-400 text-center py-8 text-sm font-bold">لا توجد بيانات بعد</p>
            ) : (
              <MiniBarChart data={weeklySales} />
            )}
          </div>

          {/* Top Packages */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package2 className="w-5 h-5 text-[#C8974A]" />
              <h2 className="text-slate-950 font-bold">أكثر الباكدجات مبيعاً</h2>
            </div>
            {topPackages.length === 0 ? (
              <p className="text-slate-400 text-center py-8 text-sm font-bold">لا توجد بيانات</p>
            ) : (
              <div className="space-y-3">
                {topPackages.map((pkg, i) => {
                  const maxCount = topPackages[0]?.count ?? 1;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 text-sm font-bold truncate flex-1 ml-2">{pkg.name}</span>
                        <span className="text-[#C8974A] text-sm font-black">{pkg.count} طلب</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#C8974A] to-[#E7C27A] rounded-full"
                          style={{ width: `${(pkg.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Workshops */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-[#C8974A]" />
              <h2 className="text-slate-950 font-bold">الورش الأكثر نشاطاً</h2>
            </div>
            {topWorkshops.length === 0 ? (
              <p className="text-slate-400 text-center py-8 text-sm font-bold">لا توجد بيانات</p>
            ) : (
              <div className="space-y-3">
                {topWorkshops.map((ws, i) => {
                  const maxCount = topWorkshops[0]?.count ?? 1;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 text-sm font-bold truncate flex-1 ml-2">{ws.name}</span>
                        <span className="text-[#C8974A] text-sm font-black">{ws.count} طلب</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-sky-300 rounded-full"
                          style={{ width: `${(ws.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-slate-950 font-bold">الحالات الفنية والمرتجعات</h2>
              <p className="text-slate-400 text-xs mt-1">لمساعدة الإدارة على التقاط المشاكل المتكررة واتخاذ قرار سريع.</p>
            </div>
            <Wrench className="w-5 h-5 text-[#C8974A]" />
          </div>
          {technicalLoading ? (
            <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 text-[#F9E795] animate-spin" /></div>
          ) : technicalOverview ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-slate-400 text-xs font-bold mb-2">إجمالي الحالات</p>
                <p className="text-slate-950 font-black text-2xl">{technicalOverview.totalCases}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-slate-400 text-xs font-bold mb-2">مرتجعات ومشاكل قطع</p>
                <p className="text-slate-950 font-black text-2xl">{technicalOverview.returnsCases}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-slate-400 text-xs font-bold mb-2">أولوية مرتفعة/حرجة</p>
                <p className="text-slate-950 font-black text-2xl">{technicalOverview.urgentCases}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-slate-400 text-xs font-bold mb-2">تحتاج قرارًا</p>
                <p className="text-slate-950 font-black text-2xl">{technicalOverview.pendingTransferCases}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-8 text-center">تعذر تحميل الملخص الفني الآن.</p>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-slate-950 font-bold">أكثر الأنماط تكرارًا</h2>
              <p className="text-slate-400 text-xs mt-1">لتحديد مشكلة قطعة متكررة أو فئة تحتاج تدخلًا تشغيليًا.</p>
            </div>
            <Star className="w-5 h-5 text-[#C8974A]" />
          </div>
          {technicalLoading ? (
            <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 text-[#F9E795] animate-spin" /></div>
          ) : technicalOverview ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {technicalOverview.topCategories.length === 0 ? (
                  <p className="text-slate-400 text-sm">لا توجد تصنيفات فنية كافية بعد.</p>
                ) : technicalOverview.topCategories.map((item, index) => (
                  <div key={`${item.category ?? 'unknown'}-${index}`} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <span className="text-slate-700 text-sm font-bold">{item.category ? (technicalCategoryLabels[item.category] ?? item.category) : 'غير مصنف'}</span>
                    <span className="text-[#C8974A] text-sm font-black">{item.count}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-200">
                <p className="text-slate-500 text-xs font-bold mb-3">أكثر السياقات التي يظهر فيها مرتجع/مشكلة</p>
                {technicalOverview.topReturnedContexts.length === 0 ? (
                  <p className="text-slate-400 text-sm">لا توجد مرتجعات متكررة مرصودة بعد.</p>
                ) : technicalOverview.topReturnedContexts.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-center justify-between py-2">
                    <span className="text-slate-700 text-sm">{item.name}{item.area ? ` · ${item.area}` : ''}</span>
                    <span className="text-[#C8974A] text-sm font-black">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-8 text-center">لا توجد بيانات فنية معروضة الآن.</p>
          )}
        </div>
      </div>
      {/* Recent Orders */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-slate-950 font-bold text-lg">آخر الطلبات</h2>
          <Link href="/admin/orders">
            <div className="text-[#C8974A] text-sm font-bold flex items-center gap-1 cursor-pointer hover:underline">
              عرض الكل <ArrowLeft className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {ordersLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : ordersError ? (
          <div className="p-12 text-center text-red-700 font-bold">تعذر تحميل الطلبات الأخيرة الآن</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold">لا توجد طلبات بعد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs font-bold border-b border-slate-100">
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
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">#{order.id}</td>
                      <td className="px-4 py-4">
                        <p className="text-slate-950 font-bold">{order.userName}</p>
                        <p className="text-slate-400 text-xs" dir="ltr">{order.userPhone}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700 font-medium">{order.packageName}</td>
                      <td className="px-4 py-4 text-slate-500 text-xs">{order.carModel} {order.carYear}</td>
                      <td className="px-4 py-4 text-[#C8974A] font-bold">{order.total.toLocaleString()} ج.م</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-400 text-xs">
                        {formatOrderDate(order.createdAt)}
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
