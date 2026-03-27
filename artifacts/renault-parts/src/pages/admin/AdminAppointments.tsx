import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { adminSemantic, adminUi } from '@/components/admin/admin-ui';
import { Calendar, Filter, X, Loader2, PhoneCall, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const G  = '#C8974A';

type ApptStatus = 'confirmed' | 'change_requested' | 'cancelled' | 'completed';

const ALL_STATUSES: { value: ApptStatus | ''; label: string; color: string; icon: typeof CheckCircle2 }[] = [
  { value: '',                label: 'جميع المواعيد',    color: 'rgba(255,255,255,0.15)', icon: Calendar },
  { value: 'confirmed',       label: 'مؤكد',             color: '#1d4ed8',               icon: CheckCircle2 },
  { value: 'change_requested',label: 'طلب تغيير',        color: '#b45309',               icon: AlertCircle },
  { value: 'completed',       label: 'مكتمل',            color: '#15803d',               icon: CheckCircle2 },
  { value: 'cancelled',       label: 'ملغي',             color: '#b91c1c',               icon: XCircle },
];

const STATUS_NEXT: Record<string, { value: ApptStatus; label: string }[]> = {
  confirmed:        [{ value: 'completed', label: '✓ إتمام' }, { value: 'cancelled', label: '✗ إلغاء' }],
  change_requested: [{ value: 'confirmed', label: '✓ تأكيد من جديد' }, { value: 'cancelled', label: '✗ إلغاء' }],
  completed:        [],
  cancelled:        [],
};

type Appt = {
  id: number;
  orderId: number;
  workshopId: number;
  workshopName: string;
  date: string;
  timeSlot: string;
  status: string;
  changeNote: string | null;
  createdAt: string;
  customerName: string | null;
  customerPhone: string | null;
  carModel: string | null;
  carYear: number | null;
  orderTotal: number | null;
};

function statusBadge(s: string) {
  const m: Record<string, { label: string; tone: string }> = {
    confirmed:        { label: 'مؤكد', tone: adminSemantic.info },
    change_requested: { label: 'طلب تغيير', tone: adminSemantic.warning },
    completed:        { label: 'مكتمل', tone: adminSemantic.success },
    cancelled:        { label: 'ملغي', tone: adminSemantic.danger },
  };
  const d = m[s] ?? { label: s, tone: adminSemantic.neutral };
  return (
    <span className={`${adminUi.badgeBase} ${d.tone} whitespace-nowrap`}>
      {d.label}
    </span>
  );
}

function slotLabel(t: string) {
  const [h] = t.split(':');
  const hour = Number(h);
  const suffix = hour < 12 ? 'ص' : 'م';
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h12}:00 ${suffix}`;
}

const WORKSHOPS_OPTIONS = [
  { id: 1, name: 'ورشة الميناء' },
  { id: 2, name: 'سنتر المنتزه' },
  { id: 3, name: 'ورشة العجمي' },
  { id: 4, name: 'سنتر سيدي جابر' },
];

export default function AdminAppointments() {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [filterStatus,    setFilterStatus]    = useState<ApptStatus | ''>('');
  const [filterWorkshop,  setFilterWorkshop]  = useState('');
  const [dateFrom,        setDateFrom]        = useState('');
  const [dateTo,          setDateTo]          = useState('');

  const headers = getAuthHeaders().headers ?? {};

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus)   params.set('status', filterStatus);
      if (filterWorkshop) params.set('workshopId', filterWorkshop);
      if (dateFrom)       params.set('dateFrom', dateFrom);
      if (dateTo)         params.set('dateTo', dateTo);
      const res = await fetch(`/api/admin/appointments?${params}`, { headers });
      if (!res.ok) throw new Error();
      setAppointments(await res.json());
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحميل المواعيد' });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterWorkshop, dateFrom, dateTo]);

  React.useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: ApptStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast({ title: 'تم التحديث', description: `حالة الموعد: ${ALL_STATUSES.find(s => s.value === status)?.label ?? status}` });
      load();
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحديث الحالة' });
    } finally {
      setUpdatingId(null);
    }
  };

  const clearFilters = () => { setFilterStatus(''); setFilterWorkshop(''); setDateFrom(''); setDateTo(''); };

  const hasFilters = filterStatus || filterWorkshop || dateFrom || dateTo;
  const confirmedCount = appointments.filter((item) => item.status === 'confirmed').length;
  const changeRequestedCount = appointments.filter((item) => item.status === 'change_requested').length;
  const completedCount = appointments.filter((item) => item.status === 'completed').length;
  const cancelledCount = appointments.filter((item) => item.status === 'cancelled').length;

  return (
    <div className={adminUi.page} style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>
      <div className={adminUi.hero}>
        <div className={adminUi.toolbar}>
          <div>
            <p className="mb-2 text-sm font-black text-[#C8974A]">التشغيل والمتابعة</p>
            <h1 className={adminUi.title}>إدارة المواعيد</h1>
            <p className={adminUi.subtitle}>
              {loading ? 'جارٍ التحميل...' : `${appointments.length} موعد`} مع رؤية سريعة للتأكيدات وطلبات التغيير والمكتملات.
            </p>
          </div>
          {hasFilters ? (
            <button onClick={clearFilters} className={adminUi.destructiveButton}>
              <X className="h-4 w-4" /> مسح الفلاتر
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'إجمالي المواعيد', value: appointments.length, icon: Calendar, tone: adminSemantic.brand },
          { label: 'مؤكدة', value: confirmedCount, icon: CheckCircle2, tone: adminSemantic.info },
          { label: 'طلبات تغيير', value: changeRequestedCount, icon: AlertCircle, tone: adminSemantic.warning },
          { label: 'مكتملة', value: completedCount, icon: CheckCircle2, tone: adminSemantic.success },
          { label: 'ملغاة', value: cancelledCount, icon: XCircle, tone: adminSemantic.danger },
        ].map((card) => (
          <div key={card.label} className={adminUi.statCard}>
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border ${card.tone}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mb-1 text-xs font-black text-slate-500">{card.label}</p>
            <p className="text-2xl font-black text-slate-950">{card.value}</p>
          </div>
        ))}
      </div>

      <div className={`${adminUi.card} space-y-4`}>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#C8974A]" />
          <span className="text-sm font-black text-slate-900">تصفية وجدولة المتابعة</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as ApptStatus | '')}
            className={adminUi.select}
          >
            {ALL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select
            value={filterWorkshop}
            onChange={e => setFilterWorkshop(e.target.value)}
            className={adminUi.select}
          >
            <option value="">كل الورش</option>
            {WORKSHOPS_OPTIONS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>

          <div>
            <label className="mb-2 block text-xs font-black text-slate-500">من</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={adminUi.input} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-black text-slate-500">إلى</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={adminUi.input} />
          </div>
          <div className="flex items-end">
            <button onClick={load} className={`${adminUi.secondaryButton} w-full justify-center`}>
              تحديث القائمة
            </button>
          </div>
        </div>
      </div>

      <div className={adminUi.tableShell}>
        {loading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#C8974A]" />
          </div>
        ) : appointments.length === 0 ? (
          <div className={adminUi.emptyState}>
            <Calendar className="mx-auto mb-4 h-9 w-9 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">لا توجد مواعيد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className={`${adminUi.tableHead} border-b border-slate-200`}>
                  {['#', 'العميل', 'السيارة', 'الورشة', 'الموعد', 'الحالة', 'إجراءات'].map(h => (
                    <th key={h} className="whitespace-nowrap px-4 py-4 text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => {
                  const nexts = STATUS_NEXT[appt.status] ?? [];
                  const isUpdating = updatingId === appt.id;
                  const customerWaPhone = appt.customerPhone?.replace(/^0/, '2') ?? '';
                  const apptDateLabel = appt.date
                    ? format(new Date(appt.date), 'EEEE d MMMM yyyy', { locale: ar })
                    : appt.date;
                  return (
                    <tr key={appt.id} className={adminUi.tableRow}>
                      <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-slate-400">
                        <div>#{appt.id}</div>
                        <div className="text-[10px] text-slate-300">طلب #{appt.orderId}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-black text-slate-950">{appt.customerName ?? '—'}</div>
                        {appt.customerPhone && (
                          <a href={`https://wa.me/2${appt.customerPhone.replace(/^0/, '')}`} target="_blank" rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 no-underline">
                            <PhoneCall size={11} /> {appt.customerPhone}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        <div>{appt.carModel ?? '—'}</div>
                        <div className="text-xs text-slate-400">{appt.carYear}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 font-black text-amber-700">
                        {appt.workshopName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <Calendar size={12} color={G} /> {apptDateLabel}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Clock size={11} /> {slotLabel(appt.timeSlot)}
                        </div>
                        {appt.changeNote && (
                          <div className="mt-2 text-[11px] font-bold text-amber-700">ملاحظة: {appt.changeNote}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {statusBadge(appt.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {customerWaPhone && (
                            <a
                              href={`https://wa.me/${customerWaPhone}?text=${encodeURIComponent(`مرحباً ${appt.customerName ?? ''}،\nتأكيد موعدك في ${appt.workshopName}\n📅 ${apptDateLabel}\n🕐 الساعة ${slotLabel(appt.timeSlot)}\nرقم الطلب: #${appt.orderId}`)}`}
                              target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 no-underline"
                            >
                              💬 واتساب العميل
                            </a>
                          )}
                          {isUpdating ? (
                            <Loader2 size={16} className="animate-spin text-[#C8974A]" />
                          ) : nexts.map(n => (
                            <button key={n.value} onClick={() => updateStatus(appt.id, n.value)}
                              className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-black ${
                                n.value === 'cancelled'
                                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                                  : 'border-amber-200 bg-amber-50 text-amber-700'
                              }`}>
                              {n.label}
                            </button>
                          ))}
                        </div>
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
