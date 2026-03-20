import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Filter, X, Loader2, PhoneCall, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const G  = '#C8974A';
const NV = '#1A2356';
const BG = '#0D1220';
const S  = '#111826';
const S2 = '#161E30';

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
  const m: Record<string, { label: string; bg: string; text: string }> = {
    confirmed:        { label: 'مؤكد',          bg: 'rgba(29,78,216,0.2)',  text: '#93c5fd' },
    change_requested: { label: 'طلب تغيير',     bg: 'rgba(180,83,9,0.2)',   text: '#fcd34d' },
    completed:        { label: 'مكتمل',          bg: 'rgba(21,128,61,0.2)',  text: '#86efac' },
    cancelled:        { label: 'ملغي',           bg: 'rgba(185,28,28,0.2)',  text: '#fca5a5' },
  };
  const d = m[s] ?? { label: s, bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.6)' };
  return (
    <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, background: d.bg, color: d.text, whiteSpace: 'nowrap' }}>
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

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0 }}>المواعيد</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>
          {loading ? '…' : `${appointments.length} موعد`}
        </p>
      </div>

      {/* Filters */}
      <div style={{ background: S2, borderRadius: 18, border: '1px solid rgba(200,151,74,0.1)', padding: 20, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color={G} />
          <span style={{ color: G, fontWeight: 800, fontSize: 13 }}>تصفية</span>
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as ApptStatus | '')}
          style={{ background: '#0D1220', border: '1.5px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '8px 12px', fontSize: 13, fontFamily: "'Almarai',sans-serif" }}
        >
          {ALL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <select
          value={filterWorkshop}
          onChange={e => setFilterWorkshop(e.target.value)}
          style={{ background: '#0D1220', border: '1.5px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '8px 12px', fontSize: 13, fontFamily: "'Almarai',sans-serif" }}
        >
          <option value="">كل الورش</option>
          {WORKSHOPS_OPTIONS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700 }}>من:</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ background: '#0D1220', border: '1.5px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '7px 10px', fontSize: 12, fontFamily: "'Almarai',sans-serif" }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700 }}>إلى:</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ background: '#0D1220', border: '1.5px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '7px 10px', fontSize: 12, fontFamily: "'Almarai',sans-serif" }} />
        </div>

        {hasFilters && (
          <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'Almarai',sans-serif" }}>
            <X size={12} /> مسح الفلاتر
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: S2, borderRadius: 18, border: '1px solid rgba(200,151,74,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
            <Loader2 style={{ color: G, width: 36, height: 36 }} className="animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>لا توجد مواعيد</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['#', 'العميل', 'السيارة', 'الورشة', 'الموعد', 'الحالة', 'إجراءات'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'right', color: 'rgba(255,255,255,0.35)', fontWeight: 800, whiteSpace: 'nowrap' }}>{h}</th>
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
                    <tr key={appt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      {/* ID */}
                      <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        <div>#{appt.id}</div>
                        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>طلب #{appt.orderId}</div>
                      </td>
                      {/* Customer */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: '#fff', fontWeight: 800 }}>{appt.customerName ?? '—'}</div>
                        {appt.customerPhone && (
                          <a href={`https://wa.me/2${appt.customerPhone.replace(/^0/, '')}`} target="_blank" rel="noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4ade80', fontSize: 11, fontWeight: 700, textDecoration: 'none', marginTop: 2 }}>
                            <PhoneCall size={11} /> {appt.customerPhone}
                          </a>
                        )}
                      </td>
                      {/* Car */}
                      <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                        <div>{appt.carModel ?? '—'}</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{appt.carYear}</div>
                      </td>
                      {/* Workshop */}
                      <td style={{ padding: '14px 16px', color: G, fontWeight: 800, whiteSpace: 'nowrap' }}>
                        {appt.workshopName}
                      </td>
                      {/* Date + Time */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fff', fontWeight: 700, fontSize: 12 }}>
                          <Calendar size={12} color={G} /> {apptDateLabel}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 3 }}>
                          <Clock size={11} /> {slotLabel(appt.timeSlot)}
                        </div>
                        {appt.changeNote && (
                          <div style={{ marginTop: 4, color: '#fcd34d', fontSize: 10, fontWeight: 700 }}>ملاحظة: {appt.changeNote}</div>
                        )}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {statusBadge(appt.status)}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                          {/* WA to customer */}
                          {customerWaPhone && (
                            <a
                              href={`https://wa.me/${customerWaPhone}?text=${encodeURIComponent(`مرحباً ${appt.customerName ?? ''}،\nتأكيد موعدك في ${appt.workshopName}\n📅 ${apptDateLabel}\n🕐 الساعة ${slotLabel(appt.timeSlot)}\nرقم الطلب: #${appt.orderId}`)}`}
                              target="_blank" rel="noreferrer"
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.25)', color: '#4ade80', borderRadius: 8, fontSize: 11, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}
                            >
                              💬 واتساب العميل
                            </a>
                          )}
                          {/* Status buttons */}
                          {isUpdating ? (
                            <Loader2 size={16} style={{ color: G }} className="animate-spin" />
                          ) : nexts.map(n => (
                            <button key={n.value} onClick={() => updateStatus(appt.id, n.value)}
                              style={{ padding: '6px 10px', background: n.value === 'cancelled' ? 'rgba(239,68,68,0.1)' : `rgba(200,151,74,0.1)`, border: `1px solid ${n.value === 'cancelled' ? 'rgba(239,68,68,0.3)' : 'rgba(200,151,74,0.3)'}`, color: n.value === 'cancelled' ? '#f87171' : G, borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Almarai',sans-serif", whiteSpace: 'nowrap' }}>
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
