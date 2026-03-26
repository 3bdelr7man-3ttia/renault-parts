import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { CalendarCheck, Search, Loader2, ChevronRight, ChevronLeft, Phone } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const G  = '#C8974A';
const B2 = '#111826';
const B3 = '#161E30';
const TD = '#7A95AA';
const F  = "'Almarai',sans-serif";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: 'قيد المراجعة', color: '#F59E0B' },
  confirmed:  { label: 'مؤكد',         color: '#3B82F6' },
  processing: { label: 'جاري التركيب', color: '#8B5CF6' },
  completed:  { label: 'مكتمل',        color: '#22C55E' },
  cancelled:  { label: 'ملغي',         color: '#EF4444' },
};

function useWorkshopAppointments(headers: Record<string, string>) {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, '') ?? '';
    fetch(`${base}/api/workshop/appointments`, { headers })
      .then(r => r.json()).then(d => setData(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return { data, loading };
}

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const DAYS_AR = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

export default function WorkshopAppointments() {
  const { getAuthHeaders } = useAuth();
  const headers = getAuthHeaders().headers ?? {};
  const { isMobile } = useBreakpoint();
  const { data: appointments, loading } = useWorkshopAppointments(headers);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');

  const todayStr = new Date().toISOString().slice(0, 10);

  const filtered = appointments.filter(a => {
    if (filter === 'today') return a.date === todayStr;
    if (filter === 'upcoming') return a.date > todayStr;
    if (filter === 'past') return a.date < todayStr;
    return true;
  }).filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.customerName?.toLowerCase().includes(q) ||
      a.carModel?.toLowerCase().includes(q) ||
      a.packageName?.toLowerCase().includes(q) ||
      a.date?.includes(q) ||
      a.customerPhone?.includes(q);
  });

  const grouped = filtered.reduce<Record<string, any[]>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ fontFamily: F, direction: 'rtl' }}>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: '#E8F0F8', margin: '0 0 4px' }}>
          المواعيد
        </h1>
        <p style={{ fontSize: 12, color: TD, margin: 0 }}>{appointments.length} موعد إجمالاً</p>
      </div>

      {/* Filter + Search */}
      <div style={{ background: B2, borderRadius: isMobile ? 16 : 18, padding: isMobile ? '12px' : '16px', marginBottom: isMobile ? 14 : 20, border: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {([['all','الكل'],['today','اليوم'],['upcoming','القادمة'],['past','السابقة']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{
                fontFamily: F, fontSize: 11, fontWeight: 800, borderRadius: 999,
                padding: '5px 12px', border: 'none', cursor: 'pointer',
                background: filter === val ? G : 'rgba(255,255,255,0.06)',
                color: filter === val ? '#0D1220' : TD,
                transition: 'all .2s',
              }}>
              {label}
              {val === 'today' && appointments.filter(a => a.date === todayStr).length > 0 && (
                <span style={{ marginRight: 4, background: filter === 'today' ? '#0D1220' : G, color: filter === 'today' ? G : '#0D1220', borderRadius: 999, padding: '0 5px', fontSize: 10 }}>
                  {appointments.filter(a => a.date === todayStr).length}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={13} color={TD} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم العميل، الباكدج، السيارة..."
            style={{ width: '100%', background: B3, border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 999, padding: '8px 36px 8px 14px', color: '#D4E0EC', fontSize: 13, fontFamily: F, fontWeight: 600, outline: 'none', direction: 'rtl', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader2 size={28} color={G} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: B2, borderRadius: 18 }}>
          <CalendarCheck size={40} color="rgba(200,151,74,0.2)" style={{ display: 'block', margin: '0 auto 12px' }} />
          <p style={{ color: TD, fontWeight: 700, fontSize: 14 }}>لا توجد مواعيد</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 20 }}>
          {sortedDates.map(date => {
            const d = new Date(date);
            const dayName = DAYS_AR[d.getDay()];
            const isToday = date === todayStr;
            const dateLabel = isToday ? 'اليوم' : `${dayName} ${d.getDate()} ${MONTHS_AR[d.getMonth()]}`;

            return (
              <div key={date}>
                {/* Date header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ background: isToday ? G : 'rgba(255,255,255,0.06)', color: isToday ? '#0D1220' : TD, borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 900 }}>
                    {dateLabel}
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                  <span style={{ fontSize: 11, color: TD }}>{grouped[date].length} موعد</span>
                </div>

                {/* Appointment cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {grouped[date]
                    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                    .map(apt => {
                      const orderStatus = STATUS_MAP[apt.orderStatus] ?? { label: apt.orderStatus, color: '#888' };
                      return (
                        <div key={apt.id}
                          style={{ background: B2, borderRadius: 14, padding: isMobile ? '12px' : '14px 16px', border: `1px solid ${isToday ? 'rgba(200,151,74,0.15)' : 'rgba(255,255,255,0.05)'}`, display: 'flex', gap: 12 }}>
                          {/* Time */}
                          <div style={{ background: `${G}15`, border: `1.5px solid ${G}25`, borderRadius: 10, padding: '8px', textAlign: 'center', flexShrink: 0, minWidth: 52 }}>
                            <div style={{ fontSize: 12, fontWeight: 900, color: G }}>{apt.timeSlot}</div>
                            <div style={{ fontSize: 9, color: TD, fontWeight: 700 }}>الموعد</div>
                          </div>
                          {/* Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
                              <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 14, color: '#D4E0EC' }}>{apt.customerName}</div>
                              <span style={{ fontSize: 10, fontWeight: 800, color: orderStatus.color, background: `${orderStatus.color}18`, borderRadius: 999, padding: '2px 8px', flexShrink: 0 }}>{orderStatus.label}</span>
                            </div>
                            <div style={{ fontSize: 11, color: TD, marginTop: 3 }}>
                              🚗 {apt.carModel} {apt.carYear}
                            </div>
                            <div style={{ fontSize: 11, color: TD, marginTop: 2 }}>
                              📦 {apt.packageName}
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ fontSize: 12, fontWeight: 900, color: G }}>{Number(apt.orderTotal).toLocaleString('ar-EG')} ج.م</span>
                              {apt.customerPhone && (
                                <a href={`tel:${apt.customerPhone}`} style={{ textDecoration: 'none' }}>
                                  <span style={{ fontSize: 10, color: '#3B82F6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Phone size={10} /> {apt.customerPhone}
                                  </span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
