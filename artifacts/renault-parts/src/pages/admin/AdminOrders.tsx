import React, { useMemo, useState } from 'react';
import { useListAdminOrders, useUpdateOrderStatus } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { adminUi } from '@/components/admin/admin-ui';
import { Calendar, Filter, Loader2, PackageCheck, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

const ALL_STATUSES: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'جميع الطلبات' },
  { value: 'pending', label: 'قيد المراجعة' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'processing', label: 'جاري التركيب' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-sky-50 text-sky-700 border-sky-200',
  processing: 'bg-violet-50 text-violet-700 border-violet-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const STATUS_NEXT: Record<string, { value: OrderStatus; label: string }[]> = {
  pending: [{ value: 'confirmed', label: 'تأكيد' }, { value: 'cancelled', label: 'إلغاء' }],
  confirmed: [{ value: 'processing', label: 'بدء التركيب' }, { value: 'cancelled', label: 'إلغاء' }],
  processing: [{ value: 'completed', label: 'إتمام' }],
  completed: [],
  cancelled: [],
};

export default function AdminOrders() {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const headers = getAuthHeaders();

  const queryParams: { status?: string; dateFrom?: string; dateTo?: string } = {};
  if (filterStatus) queryParams.status = filterStatus;
  if (dateFrom) queryParams.dateFrom = dateFrom;
  if (dateTo) queryParams.dateTo = dateTo;

  const { data: orders, isLoading } = useListAdminOrders(queryParams, { request: headers });

  const orderSummary = useMemo(() => {
    const rows = orders ?? [];
    return {
      total: rows.length,
      pending: rows.filter((row) => row.status === 'pending').length,
      running: rows.filter((row) => row.status === 'processing').length,
      completed: rows.filter((row) => row.status === 'completed').length,
    };
  }, [orders]);

  const clearFilters = () => {
    setFilterStatus('');
    setDateFrom('');
    setDateTo('');
  };

  const { mutate: updateStatus } = useUpdateOrderStatus({
    request: headers,
    mutation: {
      onSuccess: (updated) => {
        toast({
          title: 'تم تحديث حالة الطلب',
          description: `الطلب #${updated.id} → ${ALL_STATUSES.find((s) => s.value === updated.status)?.label}`,
        });
        queryClient.invalidateQueries();
        setUpdatingId(null);
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحديث الحالة' });
        setUpdatingId(null);
      },
    },
  });

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    updateStatus({ id: orderId, data: { status: newStatus } });
  };

  const hasActiveFilters = filterStatus !== '' || dateFrom !== '' || dateTo !== '';

  return (
    <div className={adminUi.page}>
      <div className={adminUi.hero}>
        <div className={adminUi.toolbar}>
          <div>
            <h1 className={adminUi.title}>إدارة الطلبات</h1>
            <p className={adminUi.subtitle}>لوحة تنفيذ يومية للطلبات الجارية، والتأكيدات، والحالات التي تحتاج قرارًا سريعًا.</p>
          </div>
          {hasActiveFilters ? (
            <button onClick={clearFilters} className={adminUi.destructiveButton}>
              <X className="h-4 w-4" />
              مسح الفلاتر
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'إجمالي الطلبات', value: orderSummary.total, accent: 'text-slate-900', icon: PackageCheck, shell: 'border-slate-200 bg-white' },
          { label: 'قيد المراجعة', value: orderSummary.pending, accent: 'text-amber-700', icon: Filter, shell: 'border-amber-200 bg-amber-50/70' },
          { label: 'جاري التنفيذ', value: orderSummary.running, accent: 'text-violet-700', icon: PackageCheck, shell: 'border-violet-200 bg-violet-50/70' },
          { label: 'مكتمل', value: orderSummary.completed, accent: 'text-emerald-700', icon: PackageCheck, shell: 'border-emerald-200 bg-emerald-50/70' },
        ].map((card) => (
          <div key={card.label} className={`${adminUi.statCard} ${card.shell}`}>
            <card.icon className={`mb-3 h-5 w-5 ${card.accent}`} />
            <p className={`text-2xl font-black ${card.accent}`}>{card.value}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className={`${adminUi.card} space-y-4`}>
        <div className="flex flex-wrap gap-3">
          <div className={`${adminUi.searchShell} min-w-[220px]`}>
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as OrderStatus | '')}
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
            >
              {ALL_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className={`${adminUi.searchShell} min-w-[190px]`}>
            <Calendar className="h-4 w-4 text-slate-400" />
            <label className="text-xs font-bold text-slate-500">من</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none [color-scheme:light]"
            />
          </div>

          <div className={`${adminUi.searchShell} min-w-[190px]`}>
            <Calendar className="h-4 w-4 text-slate-400" />
            <label className="text-xs font-bold text-slate-500">إلى</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none [color-scheme:light]"
            />
          </div>
        </div>
      </div>

      <div className={adminUi.tableShell}>
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="p-12 text-center font-bold text-slate-400">لا توجد طلبات مطابقة للفلاتر الحالية.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${adminUi.tableHead} border-b border-slate-200`}>
                  <th className="px-6 py-4 text-right">#</th>
                  <th className="px-4 py-4 text-right">العميل</th>
                  <th className="px-4 py-4 text-right">الباكدج</th>
                  <th className="px-4 py-4 text-right">السيارة</th>
                  <th className="px-4 py-4 text-right">مكان التركيب</th>
                  <th className="px-4 py-4 text-right">الدفع</th>
                  <th className="px-4 py-4 text-right">الإجمالي</th>
                  <th className="px-4 py-4 text-right">الحالة</th>
                  <th className="px-4 py-4 text-right">التاريخ</th>
                  <th className="px-4 py-4 text-right">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const colorClass = STATUS_COLORS[order.status] ?? 'bg-slate-50 text-slate-700 border-slate-200';
                  const statusLabel = ALL_STATUSES.find((s) => s.value === order.status)?.label ?? order.status;
                  const nextActions = STATUS_NEXT[order.status] ?? [];
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr key={order.id} className={adminUi.tableRow}>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">#{order.id}</td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950 whitespace-nowrap">{order.userName}</p>
                        <p className="text-xs text-slate-500" dir="ltr">{order.userPhone}</p>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">{order.packageName}</td>
                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">{order.carModel} {order.carYear}</td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {order.workshopName ?? <span className="font-bold text-amber-700">توصيل منزلي</span>}
                        {order.deliveryArea ? <span className="block text-slate-400">{order.deliveryArea}</span> : null}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 font-bold ${order.paymentMethod === 'cash' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-sky-200 bg-sky-50 text-sky-700'}`}>
                          {order.paymentMethod === 'cash' ? 'كاش' : 'إلكتروني'}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-amber-700 whitespace-nowrap">{order.total.toLocaleString()} ج.م</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${colorClass}`}>{statusLabel}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {format(new Date(order.createdAt), 'dd/MM/yy HH:mm', { locale: ar })}
                      </td>
                      <td className="px-4 py-4">
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                        ) : nextActions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {nextActions.map((action) => (
                              <button
                                key={action.value}
                                onClick={() => handleStatusChange(order.id, action.value)}
                                className={
                                  action.value === 'cancelled'
                                    ? 'rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100'
                                    : 'rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100'
                                }
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
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
