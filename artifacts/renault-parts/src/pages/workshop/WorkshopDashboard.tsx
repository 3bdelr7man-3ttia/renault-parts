import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import {
  CalendarCheck, Package2, CheckCircle2, Clock, DollarSign,
  Star, ArrowLeft, Loader2, Wrench, TrendingUp,
} from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const G  = '#C8974A';
const GL = '#DEB06C';
const BG = '#0D1220';
const B2 = '#111826';
const B3 = '#161E30';
const TD = '#7A95AA';
const F  = "'Almarai',sans-serif";

function useWorkshopStats(headers: Record<string, string>) {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, '') ?? '';
    fetch(`${base}/api/workshop/stats`, { headers })
      .then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return { data, loading };
}

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

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:    { label: 'قيد المراجعة',   color: '#F59E0B' },
  confirmed:  { label: 'مؤكد',           color: '#3B82F6' },
  processing: { label: 'جاري التركيب',   color: '#8B5CF6' },
  completed:  { label: 'مكتمل',          color: '#22C55E' },
  cancelled:  { label: 'ملغي',           color: '#EF4444' },
};

export default function WorkshopDashboard() {
  const { getAuthHeaders } = useAuth();
  const headers = getAuthHeaders() as Record<string, string>;
  const { isMobile } = useBreakpoint();

  const { data: stats, loading: statsLoading } = useWorkshopStats(headers);
  const { data: appointments, loading: aptsLoading } = useWorkshopAppointments(headers);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayApts = appointments.filter(a => a.date === todayStr);
  const upcomingApts = appointments.filter(a => a.date > todayStr).slice(0, 5);

  const statCards = stats ? [
    { icon: Package2,     label: 'إجمالي الطلبات', value: stats.totalOrders,      color: '#3B82F6', sub: `منتظرة: ${stats.pendingOrders}` },
    { icon: CalendarCheck,label: 'مواعيد اليوم',   value: stats.appointmentsToday, color: G,        sub: 'موعد محجوز' },
    { icon: CheckCircle2, label: 'طلبات مكتملة',   value: stats.completedOrders,   color: '#22C55E', sub: `مؤكدة: ${stats.confirmedOrders}` },
    { icon: DollarSign,   label: 'إجمالي الأرباح', value: `${(stats.totalEarnings as number).toLocaleString('ar-EG')} ج.م`, color: GL, sub: 'من الطلبات المكتملة' },
  ] : [];

  return (
    <div style={{ fontFamily: F, direction: 'rtl' }}>
      {/* Welcome */}
      <div style={{ marginBottom: isMobile ? 20 : 28 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: '#E8F0F8', margin: '0 0 4px' }}>
          أهلاً، {stats?.workshopName ?? '...'}
        </h1>
        <p style={{ fontSize: 13, color: TD, margin: 0 }}>
          {stats?.workshopArea && `منطقة ${stats.workshopArea}`}
          {stats?.workshopRating && ` · ★ ${stats.workshopRating}`}
        </p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Loader2 size={28} color={G} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 10 : 16, marginBottom: isMobile ? 20 : 28 }}>
          {statCards.map(card => (
            <div key={card.label} style={{ background: B2, borderRadius: isMobile ? 16 : 20, padding: isMobile ? '14px' : '18px 20px', border: `1px solid rgba(255,255,255,0.05)` }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${card.color}18`, border: `1.5px solid ${card.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <card.icon size={16} color={card.color} />
              </div>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: card.color, marginBottom: 2 }}>{card.value}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#D4E0EC' }}>{card.label}</div>
              <div style={{ fontSize: 10, color: TD, marginTop: 2 }}>{card.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Appointments */}
      <div style={{ background: B2, borderRadius: isMobile ? 18 : 22, padding: isMobile ? 16 : 20, marginBottom: isMobile ? 16 : 20, border: '1px solid rgba(200,151,74,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarCheck size={16} color={G} />
            <span style={{ fontWeight: 900, fontSize: 15, color: '#E8F0F8' }}>مواعيد اليوم</span>
            {todayApts.length > 0 && (
              <span style={{ background: G, color: '#0D1220', borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 900 }}>{todayApts.length}</span>
            )}
          </div>
          <Link href="/workshop/appointments" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 12, color: G, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
              كل المواعيد <ArrowLeft size={11} />
            </span>
          </Link>
        </div>

        {aptsLoading ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}><Loader2 size={22} color={G} style={{ animation: 'spin 1s linear infinite' }} /></div>
        ) : todayApts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: TD, fontSize: 13, fontWeight: 700 }}>
            <CalendarCheck size={28} color="rgba(200,151,74,0.2)" style={{ display: 'block', margin: '0 auto 8px' }} />
            لا توجد مواعيد اليوم
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayApts.map(apt => (
              <AppointmentCard key={apt.id} apt={apt} isMobile={isMobile} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      {upcomingApts.length > 0 && (
        <div style={{ background: B2, borderRadius: isMobile ? 18 : 22, padding: isMobile ? 16 : 20, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={16} color='#3B82F6' />
            <span style={{ fontWeight: 900, fontSize: 15, color: '#E8F0F8' }}>المواعيد القادمة</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingApts.map(apt => (
              <AppointmentCard key={apt.id} apt={apt} isMobile={isMobile} />
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AppointmentCard({ apt, isMobile }: { apt: any; isMobile: boolean }) {
  const G  = '#C8974A';
  const B3 = '#161E30';
  const TD = '#7A95AA';
  const F  = "'Almarai',sans-serif";
  const orderStatus = STATUS_LABEL[apt.orderStatus] ?? { label: apt.orderStatus, color: '#888' };

  return (
    <div style={{ background: B3, borderRadius: 14, padding: isMobile ? '12px 14px' : '14px 16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      {/* Time badge */}
      <div style={{ background: `${G}18`, border: `1.5px solid ${G}30`, borderRadius: 10, padding: '8px 10px', textAlign: 'center', flexShrink: 0, minWidth: 56 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: G, fontFamily: F }}>{apt.timeSlot}</div>
        <div style={{ fontSize: 9, color: '#7A95AA', fontWeight: 700 }}>
          {apt.date === new Date().toISOString().slice(0, 10) ? 'اليوم' : apt.date}
        </div>
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: '#D4E0EC', marginBottom: 2 }}>{apt.customerName}</div>
        <div style={{ fontSize: 11, color: TD, marginBottom: 4 }}>
          {apt.carModel} {apt.carYear} · {apt.packageName}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: orderStatus.color, background: `${orderStatus.color}18`, borderRadius: 999, padding: '2px 8px' }}>{orderStatus.label}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: G }}>{Number(apt.orderTotal).toLocaleString('ar-EG')} ج.م</span>
          {apt.customerPhone && <span style={{ fontSize: 10, color: TD }}>{apt.customerPhone}</span>}
        </div>
      </div>
    </div>
  );
}
