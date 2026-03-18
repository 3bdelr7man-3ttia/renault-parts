import React, { useState } from 'react';
import { useListAdminOrders, useUpdateOrderStatus } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Filter, Calendar, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

const ALL_STATUSES: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'جميع الطلبات' },
  { value: 'pending',    label: 'قيد المراجعة' },
  { value: 'confirmed',  label: 'مؤكد' },
  { value: 'processing', label: 'جاري التركيب' },
  { value: 'completed',  label: 'مكتمل' },
  { value: 'cancelled',  label: 'ملغي' },
];

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  confirmed:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  processing: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  completed:  'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled:  'bg-red-500/20 text-red-300 border-red-500/30',
};

const STATUS_NEXT: Record<string, { value: OrderStatus; label: string }[]> = {
  pending:    [{ value: 'confirmed', label: 'تأكيد' }, { value: 'cancelled', label: 'إلغاء' }],
  confirmed:  [{ value: 'processing', label: 'بدء التركيب' }, { value: 'cancelled', label: 'إلغاء' }],
  processing: [{ value: 'completed', label: 'إتمام' }],
  completed:  [],
  cancelled:  [],
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

  const clearFilters = () => { setFilterStatus(''); setDateFrom(''); setDateTo(''); };

  const { mutate: updateStatus } = useUpdateOrderStatus({
    request: headers,
    mutation: {
      onSuccess: (updated) => {
        toast({ title: 'تم تحديث حالة الطلب', description: `الطلب #${updated.id} → ${ALL_STATUSES.find(s => s.value === updated.status)?.label}` });
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">إدارة الطلبات</h1>
            <p className="text-white/50 text-sm">{orders?.length ?? 0} طلب</p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all"
            >
              <X className="w-4 h-4" />
              مسح الفلاتر
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-[#1E2761]/60 border border-white/10 rounded-xl px-4 py-2">
            <Filter className="w-4 h-4 text-white/50" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as OrderStatus | '')}
              className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer"
            >
              {ALL_STATUSES.map(s => (
                <option key={s.value} value={s.value} className="bg-[#1E2761]">{s.label}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="flex items-center gap-2 bg-[#1E2761]/60 border border-white/10 rounded-xl px-4 py-2">
            <Calendar className="w-4 h-4 text-white/50" />
            <label className="text-white/40 text-xs font-bold ml-1">من</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-2 bg-[#1E2761]/60 border border-white/10 rounded-xl px-4 py-2">
            <Calendar className="w-4 h-4 text-white/50" />
            <label className="text-white/40 text-xs font-bold ml-1">إلى</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#1E2761]/60 rounded-2xl border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-bold">لا توجد طلبات</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs font-bold border-b border-white/10 bg-white/5">
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
                  const colorClass = STATUS_COLORS[order.status] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30';
                  const statusLabel = ALL_STATUSES.find(s => s.value === order.status)?.label ?? order.status;
                  const nextActions = STATUS_NEXT[order.status] ?? [];
                  const isUpdating = updatingId === order.id;
                  return (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/50 font-mono text-xs">#{order.id}</td>
                      <td className="px-4 py-4">
                        <p className="text-white font-bold whitespace-nowrap">{order.userName}</p>
                        <p className="text-white/40 text-xs" dir="ltr">{order.userPhone}</p>
                      </td>
                      <td className="px-4 py-4 text-white/80 font-medium whitespace-nowrap">{order.packageName}</td>
                      <td className="px-4 py-4 text-white/60 text-xs whitespace-nowrap">{order.carModel} {order.carYear}</td>
                      <td className="px-4 py-4 text-white/60 text-xs">
                        {order.workshopName ?? <span className="text-[#F9E795]/80">توصيل منزلي</span>}
                        {order.deliveryArea && <span className="block text-white/40">{order.deliveryArea}</span>}
                      </td>
                      <td className="px-4 py-4 text-white/60 text-xs whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentMethod === 'cash' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          {order.paymentMethod === 'cash' ? 'كاش' : 'إلكتروني'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[#F9E795] font-bold whitespace-nowrap">{order.total.toLocaleString()} ج.م</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${colorClass}`}>{statusLabel}</span>
                      </td>
                      <td className="px-4 py-4 text-white/40 text-xs whitespace-nowrap">
                        {format(new Date(order.createdAt), 'dd/MM/yy HH:mm', { locale: ar })}
                      </td>
                      <td className="px-4 py-4">
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 text-[#F9E795] animate-spin" />
                        ) : nextActions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {nextActions.map(action => (
                              <button
                                key={action.value}
                                onClick={() => handleStatusChange(order.id, action.value)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  action.value === 'cancelled'
                                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/40 border border-red-500/30'
                                    : 'bg-[#F9E795]/20 text-[#F9E795] hover:bg-[#F9E795]/40 border border-[#F9E795]/30'
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
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
