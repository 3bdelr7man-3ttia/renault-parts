import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { CalendarDays, Check, Save, Loader2, Info, RotateCcw } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const G  = '#C8974A';
const GL = '#DEB06C';
const BG = '#0D1220';
const B2 = '#111826';
const B3 = '#161E30';
const TD = '#7A95AA';
const F  = "'Almarai',sans-serif";

const ALL_SLOTS = [
  '07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00',
];

const DAYS = [
  { index: 0, short: 'الأحد',    full: 'الأحد' },
  { index: 1, short: 'الاثنين',  full: 'الاثنين' },
  { index: 2, short: 'الثلاثاء', full: 'الثلاثاء' },
  { index: 3, short: 'الأربعاء', full: 'الأربعاء' },
  { index: 4, short: 'الخميس',   full: 'الخميس' },
  { index: 5, short: 'الجمعة',   full: 'الجمعة' },
  { index: 6, short: 'السبت',    full: 'السبت' },
];

function slotLabel(s: string) {
  const [hStr] = s.split(':');
  const h = parseInt(hStr);
  const suffix = h < 12 ? 'ص' : 'م';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:00 ${suffix}`;
}

type SlotKey = `${number}-${string}`;

export default function WorkshopSchedule() {
  const { getAuthHeaders } = useAuth();
  const { isMobile } = useBreakpoint();
  const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, '') ?? '';
  const headers = (getAuthHeaders() as any).headers ?? {};

  const [activeDay, setActiveDay] = useState(1);
  const [selected, setSelected] = useState<Set<SlotKey>>(new Set());
  const [maxBookings, setMaxBookings] = useState(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${base}/api/workshop/availability`, { headers })
      .then(r => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const set = new Set<SlotKey>(data.map(d => `${d.dayOfWeek}-${d.timeSlot}` as SlotKey));
          setSelected(set);
          setMaxBookings(data[0]?.maxBookings ?? 2);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSlot = (dayIndex: number, slot: string) => {
    const key = `${dayIndex}-${slot}` as SlotKey;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setSaved(false);
  };

  const selectAllDay = (dayIndex: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      ALL_SLOTS.forEach(s => next.add(`${dayIndex}-${s}` as SlotKey));
      return next;
    });
    setSaved(false);
  };

  const clearDay = (dayIndex: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      ALL_SLOTS.forEach(s => next.delete(`${dayIndex}-${s}` as SlotKey));
      return next;
    });
    setSaved(false);
  };

  const daySlotCount = (dayIndex: number) =>
    ALL_SLOTS.filter(s => selected.has(`${dayIndex}-${s}` as SlotKey)).length;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const slots = Array.from(selected).map(key => {
        const [dayStr, timeSlot] = key.split('-', 2) as [string, string];
        return { dayOfWeek: parseInt(dayStr), timeSlot };
      });
      const res = await fetch(`${base}/api/workshop/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ slots, maxBookings }),
      });
      if (!res.ok) throw new Error('فشل الحفظ');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('حدث خطأ أثناء الحفظ. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const totalSlots = selected.size;

  return (
    <div style={{ fontFamily: F, direction: 'rtl', maxWidth: 700, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ background: `${G}20`, borderRadius: 10, padding: 8 }}>
            <CalendarDays size={20} color={G} />
          </div>
          <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: '#E8F0F8', margin: 0 }}>
            جدول المواعيد المتاحة
          </h1>
        </div>
        <p style={{ fontSize: 12, color: TD, margin: 0, paddingRight: 42 }}>
          حدد الأيام والأوقات التي تقبل فيها حجوزات العملاء
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader2 size={28} color={G} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 10px' }} />
          <span style={{ fontSize: 13, color: TD }}>جارٍ تحميل الجدول...</span>
        </div>
      ) : (
        <>
          {/* Max bookings */}
          <div style={{ background: B2, borderRadius: 16, padding: isMobile ? '14px' : '16px 20px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 800, color: '#D4E0EC' }}>
                الحد الأقصى للحجوزات في الساعة
              </p>
              <p style={{ margin: 0, fontSize: 11, color: TD }}>
                كم عميل يمكنك خدمتهم في نفس الوقت؟
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setMaxBookings(m => Math.max(1, m - 1))}
                style={{ width: 34, height: 34, borderRadius: 8, background: B3, border: '1.5px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}
              >−</button>
              <span style={{ fontSize: 22, fontWeight: 900, color: G, minWidth: 32, textAlign: 'center' }}>{maxBookings}</span>
              <button
                onClick={() => setMaxBookings(m => Math.min(10, m + 1))}
                style={{ width: 34, height: 34, borderRadius: 8, background: B3, border: '1.5px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}
              >+</button>
            </div>
          </div>

          {/* Day tabs */}
          <div style={{ background: B2, borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.06)', scrollbarWidth: 'none' }}>
              {DAYS.map(day => {
                const count = daySlotCount(day.index);
                const isActive = activeDay === day.index;
                return (
                  <button key={day.index} onClick={() => setActiveDay(day.index)}
                    style={{
                      flex: '1 0 auto', padding: isMobile ? '10px 8px' : '12px 14px',
                      background: isActive ? `${G}18` : 'transparent',
                      border: 'none', borderBottom: `2.5px solid ${isActive ? G : 'transparent'}`,
                      color: isActive ? G : TD,
                      fontFamily: F, fontWeight: 800, fontSize: isMobile ? 11 : 13,
                      cursor: 'pointer', transition: 'all .18s', position: 'relative',
                    }}>
                    {day.short}
                    {count > 0 && (
                      <span style={{
                        marginRight: 4, background: isActive ? G : 'rgba(200,151,74,0.3)',
                        color: isActive ? '#0D1220' : G,
                        borderRadius: 999, padding: '0 5px', fontSize: 9, fontWeight: 900,
                      }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Slot grid for active day */}
            <div style={{ padding: isMobile ? '14px' : '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#D4E0EC' }}>
                  {DAYS[activeDay].full}
                  <span style={{ fontSize: 11, fontWeight: 600, color: TD, marginRight: 8 }}>
                    ({daySlotCount(activeDay)} وقت محدد)
                  </span>
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => selectAllDay(activeDay)}
                    style={{ fontSize: 11, fontWeight: 700, color: G, background: `${G}15`, border: `1px solid ${G}30`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontFamily: F }}>
                    تحديد الكل
                  </button>
                  <button onClick={() => clearDay(activeDay)}
                    style={{ fontSize: 11, fontWeight: 700, color: TD, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontFamily: F }}>
                    <RotateCcw size={10} style={{ marginLeft: 3, verticalAlign: 'middle' }} />
                    مسح
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(7, 1fr)', gap: isMobile ? 8 : 10 }}>
                {ALL_SLOTS.map(slot => {
                  const key = `${activeDay}-${slot}` as SlotKey;
                  const isOn = selected.has(key);
                  return (
                    <button key={slot} onClick={() => toggleSlot(activeDay, slot)}
                      style={{
                        padding: isMobile ? '8px 4px' : '10px 6px',
                        borderRadius: 10,
                        background: isOn ? `${G}25` : 'rgba(255,255,255,0.04)',
                        border: `2px solid ${isOn ? G : 'rgba(255,255,255,0.08)'}`,
                        color: isOn ? GL : TD,
                        fontFamily: F, fontWeight: 800,
                        fontSize: isMobile ? 11 : 12,
                        cursor: 'pointer', transition: 'all .15s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        boxShadow: isOn ? `0 0 12px ${G}25` : 'none',
                      }}>
                      {isOn && <Check size={10} color={G} />}
                      {slotLabel(slot)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Info banner */}
          {totalSlots === 0 && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Info size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                لم تحدد أي مواعيد بعد. سيظهر للعملاء جميع أوقات اليوم (من 7 ص إلى 8 م) حتى تضبط جدولك.
              </p>
            </div>
          )}

          {/* Summary */}
          {totalSlots > 0 && (
            <div style={{ background: `${G}10`, border: `1px solid ${G}25`, borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                <strong style={{ color: G }}>ملخص الجدول:</strong>{' '}
                {DAYS.map(d => {
                  const c = daySlotCount(d.index);
                  if (c === 0) return null;
                  return <span key={d.index} style={{ marginLeft: 4 }}>{d.short} ({c}) ·</span>;
                })}
                {' '}إجمالي <strong style={{ color: G }}>{totalSlots}</strong> ساعة في الأسبوع
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '10px 16px', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#EF4444', fontWeight: 700 }}>{error}</p>
            </div>
          )}

          {/* Save button */}
          <button onClick={handleSave} disabled={saving}
            style={{
              width: '100%', padding: isMobile ? '14px' : '16px',
              borderRadius: 14, background: saved ? '#22c55e' : saving ? '#333' : G,
              color: saved ? '#fff' : saving ? '#666' : '#0D1220',
              fontFamily: F, fontWeight: 900, fontSize: 15,
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all .25s', boxShadow: saved ? '0 0 20px rgba(34,197,94,0.3)' : saving ? 'none' : `0 4px 20px ${G}40`,
            }}>
            {saving ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> جارٍ الحفظ...</>
            ) : saved ? (
              <><Check size={18} /> تم حفظ الجدول بنجاح!</>
            ) : (
              <><Save size={18} /> حفظ الجدول ({totalSlots} ساعة)</>
            )}
          </button>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
