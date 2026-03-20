import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { DollarSign, Package2, CheckCircle2, Clock, Loader2, TrendingUp } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const G  = '#C8974A';
const GL = '#DEB06C';
const B2 = '#111826';
const B3 = '#161E30';
const TD = '#7A95AA';
const F  = "'Almarai',sans-serif";

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function useWorkshopOrders(headers: Record<string, string>) {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, '') ?? '';
    fetch(`${base}/api/workshop/orders`, { headers })
      .then(r => r.json()).then(d => setData(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return { data, loading };
}

function useWorkshopEarnings(headers: Record<string, string>) {
  const [data, setData] = React.useState<{ month: string; total: number; count: number }[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, '') ?? '';
    fetch(`${base}/api/workshop/earnings`, { headers })
      .then(r => r.json()).then(d => setData(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return { data, loading };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: 'قيد المراجعة', color: '#F59E0B' },
  confirmed:  { label: 'مؤكد',         color: '#3B82F6' },
  processing: { label: 'جاري التركيب', color: '#8B5CF6' },
  completed:  { label: 'مكتمل',        color: '#22C55E' },
  cancelled:  { label: 'ملغي',         color: '#EF4444' },
};

const PAY_MAP: Record<string, string> = {
  cash: 'كاش', cash_on_delivery: 'كاش عند الاستلام',
  card: 'فيزا', vodafone_cash: 'فودافون كاش', instapay: 'انستاباى',
};

export default function WorkshopEarnings() {
  const { getAuthHeaders } = useAuth();
  const headers = getAuthHeaders() as Record<string, string>;
  const { isMobile } = useBreakpoint();
  const { data: orders, loading: ordersLoading } = useWorkshopOrders(headers);
  const { data: monthly, loading: earningsLoading } = useWorkshopEarnings(headers);

  const totalEarnings = orders.filter(o => o.status === 'completed').reduce((s: number, o: any) => s + Number(o.total), 0);
  const pendingValue = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').reduce((s: number, o: any) => s + Number(o.total), 0);
  const completedCount = orders.filter(o => o.status === 'completed').length;

  const maxMonthly = Math.max(...monthly.map(m => m.total), 1);

  return (
    <div style={{ fontFamily: F, direction: 'rtl' }}>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: '#E8F0F8', margin: '0 0 4px' }}>الحسابات والأرباح</h1>
        <p style={{ fontSize: 12, color: TD, margin: 0 }}>متابعة مالية شاملة لأداء ورشتك</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 10 : 16, marginBottom: isMobile ? 16 : 24 }}>
        {[
          { icon: DollarSign,   label: 'إجمالي الأرباح',     value: `${totalEarnings.toLocaleString('ar-EG')} ج.م`, color: G,        sub: 'من الطلبات المكتملة' },
          { icon: Package2,     label: 'قيد التحصيل',        value: `${pendingValue.toLocaleString('ar-EG')} ج.م`,  color: '#F59E0B', sub: 'طلبات لم تكتمل بعد' },
          { icon: CheckCircle2, label: 'طلبات مكتملة',       value: completedCount,                                   color: '#22C55E', sub: 'من إجمالي الطلبات' },
        ].map(card => (
          <div key={card.label} style={{ background: B2, borderRadius: isMobile ? 16 : 20, padding: isMobile ? '14px' : '18px 20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${card.color}18`, border: `1.5px solid ${card.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <card.icon size={15} color={card.color} />
            </div>
            <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, color: card.color, marginBottom: 2 }}>{card.value}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#D4E0EC' }}>{card.label}</div>
            <div style={{ fontSize: 10, color: TD, marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly earnings chart */}
      {!earningsLoading && monthly.length > 0 && (
        <div style={{ background: B2, borderRadius: isMobile ? 18 : 22, padding: isMobile ? 16 : 20, marginBottom: isMobile ? 16 : 20, border: '1px solid rgba(200,151,74,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <TrendingUp size={15} color={G} />
            <span style={{ fontWeight: 900, fontSize: 15, color: '#E8F0F8' }}>الأرباح الشهرية</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? 6 : 10, height: 100 }}>
            {monthly.map(m => {
              const heightPct = Math.max((m.total / maxMonthly) * 100, 4);
              const monthLabel = MONTHS_AR[parseInt(m.month.slice(5, 7)) - 1] ?? m.month;
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 9, color: G, fontWeight: 900 }}>{m.total > 0 ? `${(m.total / 1000).toFixed(1)}k` : ''}</span>
                  <div style={{ width: '100%', background: `linear-gradient(to top, ${G}90, ${G}20)`, borderRadius: '4px 4px 0 0', height: `${heightPct}%`, transition: 'height .5s ease', cursor: 'default' }}
                    title={`${monthLabel}: ${m.total.toLocaleString('ar-EG')} ج.م (${m.count} طلب)`} />
                  <span style={{ fontSize: isMobile ? 8 : 9, color: TD, fontWeight: 700, textAlign: 'center' }}>{monthLabel.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Orders table/list */}
      <div style={{ background: B2, borderRadius: isMobile ? 18 : 22, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: isMobile ? '14px 16px' : '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package2 size={15} color={G} />
          <span style={{ fontWeight: 900, fontSize: 15, color: '#E8F0F8' }}>سجل الطلبات</span>
          <span style={{ fontSize: 11, color: TD, marginRight: 4 }}>{orders.length} طلب</span>
        </div>

        {ordersLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader2 size={24} color={G} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: TD, fontSize: 13, fontWeight: 700 }}>
            لا توجد طلبات بعد
          </div>
        ) : isMobile ? (
          // Mobile: card list
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {orders.map((order: any) => {
              const st = STATUS_MAP[order.status] ?? { label: order.status, color: '#888' };
              return (
                <div key={order.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#D4E0EC' }}>{order.customerName}</span>
                      <span style={{ fontSize: 12, fontWeight: 900, color: G }}>{Number(order.total).toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <div style={{ fontSize: 11, color: TD }}>📦 {order.packageName} · 🚗 {order.carModel}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: st.color, background: `${st.color}18`, borderRadius: 999, padding: '2px 8px' }}>{st.label}</span>
                      <span style={{ fontSize: 10, color: TD }}>{PAY_MAP[order.paymentMethod] ?? order.paymentMethod}</span>
                      <span style={{ fontSize: 10, color: TD }}>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Desktop: table
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: F }}>
              <thead>
                <tr style={{ background: B3 }}>
                  {['#', 'العميل', 'الباكدج', 'السيارة', 'المبلغ', 'الدفع', 'الحالة', 'التاريخ'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontWeight: 800, color: TD, textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => {
                  const st = STATUS_MAP[order.status] ?? { label: order.status, color: '#888' };
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      <td style={{ padding: '10px 14px', color: TD }}>#{order.id}</td>
                      <td style={{ padding: '10px 14px', color: '#D4E0EC', fontWeight: 700 }}>{order.customerName}</td>
                      <td style={{ padding: '10px 14px', color: TD }}>{order.packageName}</td>
                      <td style={{ padding: '10px 14px', color: TD, whiteSpace: 'nowrap' }}>{order.carModel} {order.carYear}</td>
                      <td style={{ padding: '10px 14px', color: G, fontWeight: 800, whiteSpace: 'nowrap' }}>{Number(order.total).toLocaleString('ar-EG')} ج.م</td>
                      <td style={{ padding: '10px 14px', color: TD }}>{PAY_MAP[order.paymentMethod] ?? order.paymentMethod}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: st.color, background: `${st.color}18`, borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap' }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: TD, whiteSpace: 'nowrap' }}>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
