import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Wrench, Search, Loader2, Phone } from 'lucide-react';
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

const PAY_MAP: Record<string, string> = {
  cash: 'كاش', cash_on_delivery: 'كاش عند الاستلام',
  card: 'فيزا', vodafone_cash: 'فودافون كاش', instapay: 'انستاباى',
};

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

export default function WorkshopOrders() {
  const { getAuthHeaders } = useAuth();
  const headers = getAuthHeaders().headers ?? {};
  const { isMobile } = useBreakpoint();
  const { data: orders, loading } = useWorkshopOrders(headers);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return o.customerName?.toLowerCase().includes(q) ||
      o.packageName?.toLowerCase().includes(q) ||
      o.carModel?.toLowerCase().includes(q);
  });

  return (
    <div style={{ fontFamily: F, direction: 'rtl' }}>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: '#E8F0F8', margin: '0 0 4px' }}>الطلبات</h1>
        <p style={{ fontSize: 12, color: TD, margin: 0 }}>{orders.length} طلب مرتبط بورشتك</p>
      </div>

      <div style={{ background: B2, borderRadius: isMobile ? 16 : 18, padding: isMobile ? '12px' : '16px', marginBottom: isMobile ? 14 : 20, border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {[['all','الكل'],['pending','قيد المراجعة'],['confirmed','مؤكد'],['processing','جاري'],['completed','مكتمل'],['cancelled','ملغي']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ fontFamily: F, fontSize: 11, fontWeight: 800, borderRadius: 999, padding: '5px 12px', border: 'none', cursor: 'pointer',
                background: filter === val ? G : 'rgba(255,255,255,0.06)', color: filter === val ? '#0D1220' : TD, transition: 'all .2s' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={13} color={TD} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم العميل أو الباكدج..."
            style={{ width: '100%', background: B3, border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 999, padding: '8px 36px 8px 14px', color: '#D4E0EC', fontSize: 13, fontFamily: F, fontWeight: 600, outline: 'none', direction: 'rtl', boxSizing: 'border-box' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader2 size={28} color={G} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: B2, borderRadius: 18, color: TD, fontSize: 13, fontWeight: 700 }}>
          لا توجد طلبات
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((order: any) => {
            const st = STATUS_MAP[order.status] ?? { label: order.status, color: '#888' };
            return (
              <div key={order.id} style={{ background: B2, borderRadius: 14, padding: isMobile ? '12px 14px' : '14px 18px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${st.color}15`, border: `1.5px solid ${st.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: st.color }}>#{order.id}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 3 }}>
                    <span style={{ fontWeight: 800, fontSize: isMobile ? 13 : 14, color: '#D4E0EC' }}>{order.customerName}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: G }}>{Number(order.total).toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  <div style={{ fontSize: 11, color: TD, marginBottom: 4 }}>
                    🚗 {order.carModel} {order.carYear} · 📦 {order.packageName}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: st.color, background: `${st.color}18`, borderRadius: 999, padding: '2px 8px' }}>{st.label}</span>
                    <span style={{ fontSize: 10, color: TD }}>{PAY_MAP[order.paymentMethod] ?? order.paymentMethod}</span>
                    <span style={{ fontSize: 10, color: TD }}>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                    {order.customerPhone && (
                      <a href={`tel:${order.customerPhone}`} style={{ textDecoration: 'none' }}>
                        <span style={{ fontSize: 10, color: '#3B82F6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Phone size={10} /> {order.customerPhone}
                        </span>
                      </a>
                    )}
                  </div>
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
