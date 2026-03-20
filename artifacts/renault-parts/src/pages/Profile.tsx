import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { useCar } from '@/lib/car-context';
import { useListOrders, getGetCurrentUserQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  User, Phone, MapPin, Car, Calendar, Package,
  ArrowLeft, LogOut, Pencil, ShieldCheck, CheckCircle2,
  ClipboardList, Star, Home, Save, X, Loader2,
} from 'lucide-react';
import { RenoPackLogo } from '@/components/layout/AppLayout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { CarSelectorModal } from '@/components/CarSelectorModal';
import { useToast } from '@/hooks/use-toast';
import bakoNew from '@/assets/bako-new.png';

const ALEX_AREAS = [
  'المنتزه', 'سيدي جابر', 'سموحة', 'العجمي', 'المنشية',
  'كليوباترا', 'ميامي', 'الإبراهيمية', 'سيدي بشر', 'الشاطبي',
  'الدخيلة', 'العامرية', 'بيكوزي', 'مصطفى كامل', 'المزاريطة',
  'زيزينيا', 'الورديان', 'البيطاش', 'كرموز', 'باب شرق',
];

const G = '#C8974A';
const BG = '#0D1220';
const CARD = '#161E30';
const CARD2 = '#111826';
const TD = '#7A95AA';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'قيد المراجعة',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  confirmed:  { label: 'مؤكد',          color: '#4AABCA', bg: 'rgba(74,171,202,0.1)'   },
  processing: { label: 'جاري التركيب',  color: '#7B72B8', bg: 'rgba(123,114,184,0.1)'  },
  completed:  { label: 'مكتمل',         color: '#3DA882', bg: 'rgba(61,168,130,0.1)'   },
  cancelled:  { label: 'ملغي',          color: '#EF4444', bg: 'rgba(239,68,68,0.1)'    },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, color: TD, bg: 'rgba(122,149,170,0.1)' };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30`, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 800, fontFamily: "'Almarai',sans-serif" }}>
      {s.label}
    </span>
  );
}

export default function Profile() {
  const { isMobile, isTablet } = useBreakpoint();
  const { user, logout, getAuthHeaders, token } = useAuth();
  const { car, clearCar, syncFromUser } = useCar();

  // Sync car from user DB data (runs when user data loads/changes)
  useEffect(() => {
    if (user) {
      syncFromUser((user as any).carModel, (user as any).carYear);
    }
  }, [user]);

  const { data: orders, isLoading: ordersLoading } = useListOrders({ request: getAuthHeaders() });
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({ phone: '', address: '', area: '' });
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  if (!user) { setLocation('/login'); return null; }

  const handleLogout = () => {
    logout();
    toast({ title: 'تم تسجيل الخروج', description: 'نراك قريباً!' });
    setLocation('/');
  };

  const openDeliveryEdit = () => {
    setDeliveryForm({
      phone:   (user as any).phone   ?? '',
      address: (user as any).address ?? '',
      area:    (user as any).area    ?? '',
    });
    setEditingDelivery(true);
  };

  const saveDelivery = async () => {
    setSavingDelivery(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';
      const res = await fetch(`${base}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(deliveryForm),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error((e as any).error ?? 'فشل الحفظ');
      }
      await queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      setEditingDelivery(false);
      toast({ title: 'تم الحفظ', description: 'ستظهر بياناتك تلقائياً عند الطلب' });
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setSavingDelivery(false);
    }
  };

  const recentOrders = orders?.slice(0, 5) ?? [];
  const totalSpent = orders?.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0) ?? 0;

  return (
    <div style={{ minHeight: '100vh', background: BG, direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>
      <AnimatePresence>
        {showCarModal && (
          <CarSelectorModal onComplete={() => setShowCarModal(false)} onSkip={() => setShowCarModal(false)} />
        )}
      </AnimatePresence>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: isMobile ? '32px 16px 60px' : '48px 24px 80px', background: 'linear-gradient(160deg,#070C18 0%,#111826 60%,#0D1220 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(200,151,74,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,151,74,0.03) 1px,transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse,rgba(200,151,74,0.07),transparent 65%)', pointerEvents: 'none' }} />
        <img src={bakoNew} alt="" style={{ position: 'absolute', left: 24, bottom: 0, height: 160, opacity: 0.12, mixBlendMode: 'screen', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><RenoPackLogo size="md" /></div>

          {/* Avatar */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#1A2356,#2A3570)', border: `3px solid rgba(200,151,74,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 32px rgba(200,151,74,0.2)' }}>
            <User size={32} color={G} />
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#E8F0F8', marginBottom: 4 }}>{user.name}</h1>
          <div style={{ fontSize: 13, color: TD, marginBottom: 20 }}>عضو في RenoPack</div>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[
              { n: orders?.length ?? 0,                                     l: 'طلب' },
              { n: orders?.filter(o => o.status === 'completed').length ?? 0, l: 'مكتمل' },
              { n: `${totalSpent.toLocaleString('ar-EG')} ج.م`,             l: 'إجمالي' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: G }}>{s.n}</div>
                <div style={{ fontSize: 11, color: TD, fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 900, margin: '-32px auto 80px', padding: isMobile ? '0 14px' : '0 24px', display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20, position: 'relative', zIndex: 5 }}>

        {/* Personal Info Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ background: CARD, border: '1.5px solid rgba(200,151,74,0.12)', borderRadius: 24, overflow: 'hidden' }}
        >
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: '#E8F0F8' }}>
              <User size={15} color={G} /> بياناتي الشخصية
            </div>
          </div>
          <div style={{ padding: isMobile ? '16px' : '20px 22px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 16 }}>
            {[
              { icon: <User size={14} color={G} />,    label: 'الاسم',    val: user.name         },
              { icon: <Phone size={14} color={G} />,   label: 'التليفون', val: user.phone ?? '—' },
            ].map(item => (
              <div key={item.label} style={{ background: CARD2, borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: TD, fontSize: 10, fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {item.icon} {item.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#D4E0EC' }}>{item.val}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Delivery Info Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          style={{ background: CARD, border: '1.5px solid rgba(200,151,74,0.12)', borderRadius: 24, overflow: 'hidden' }}
        >
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: '#E8F0F8' }}>
              <Home size={15} color={G} /> بيانات التوصيل
            </div>
            {!editingDelivery && (
              <button
                onClick={openDeliveryEdit}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(200,151,74,0.08)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 8, padding: '5px 12px', color: G, fontFamily: "'Almarai',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                <Pencil size={11} /> تعديل
              </button>
            )}
            {editingDelivery && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setEditingDelivery(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '5px 12px', color: '#EF4444', fontFamily: "'Almarai',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  <X size={11} /> إلغاء
                </button>
                <button
                  onClick={saveDelivery}
                  disabled={savingDelivery}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg,#C8974A,#DEB06C)', border: 'none', borderRadius: 8, padding: '5px 14px', color: '#0D1220', fontFamily: "'Almarai',sans-serif", fontSize: 12, fontWeight: 800, cursor: savingDelivery ? 'not-allowed' : 'pointer', opacity: savingDelivery ? 0.7 : 1 }}
                >
                  {savingDelivery ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={11} />}
                  {savingDelivery ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            )}
          </div>

          {!editingDelivery ? (
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(user as any).address || (user as any).area || user.phone ? (
                <>
                  {user.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: CARD2, borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <Phone size={15} color={G} />
                      <div>
                        <div style={{ fontSize: 10, color: TD, fontWeight: 700, marginBottom: 2 }}>رقم التليفون</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#D4E0EC' }}>{user.phone}</div>
                      </div>
                    </div>
                  )}
                  {(user as any).area && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: CARD2, borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <MapPin size={15} color={G} />
                      <div>
                        <div style={{ fontSize: 10, color: TD, fontWeight: 700, marginBottom: 2 }}>المنطقة</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#D4E0EC' }}>{(user as any).area}</div>
                      </div>
                    </div>
                  )}
                  {(user as any).address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: CARD2, borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <Home size={15} color={G} />
                      <div>
                        <div style={{ fontSize: 10, color: TD, fontWeight: 700, marginBottom: 2 }}>العنوان التفصيلي</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#D4E0EC' }}>{(user as any).address}</div>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(61,168,130,0.06)', border: '1px solid rgba(61,168,130,0.15)', borderRadius: 10, padding: '8px 12px' }}>
                    <CheckCircle2 size={13} color="#3DA882" />
                    <span style={{ fontSize: 12, color: '#3DA882', fontWeight: 700 }}>ستُملأ هذه البيانات تلقائياً عند الطلب</span>
                  </div>
                </>
              ) : (
                <div style={{ padding: '20px 22px', textAlign: 'center' }}>
                  <MapPin size={36} color="rgba(200,151,74,0.2)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ color: TD, fontSize: 13, marginBottom: 14 }}>لم تضف عنوان التوصيل بعد</p>
                  <button
                    onClick={openDeliveryEdit}
                    style={{ background: 'linear-gradient(135deg,#C8974A,#DEB06C)', border: 'none', borderRadius: 999, padding: '9px 22px', color: '#0D1220', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                  >
                    أضف عنوان التوصيل
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: TD, marginBottom: 6 }}>
                  <Phone size={12} color={G} style={{ display: 'inline', marginLeft: 4 }} />رقم التليفون
                </label>
                <input
                  type="tel"
                  value={deliveryForm.phone}
                  onChange={e => setDeliveryForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="01xxxxxxxxx"
                  style={{ width: '100%', background: CARD2, border: '1.5px solid rgba(200,151,74,0.2)', borderRadius: 10, padding: '10px 14px', color: '#D4E0EC', fontFamily: "'Almarai',sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box', direction: 'ltr', textAlign: 'right' }}
                  onFocus={e => { e.target.style.borderColor = G; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(200,151,74,0.2)'; }}
                />
              </div>
              {/* Area */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: TD, marginBottom: 6 }}>
                  <MapPin size={12} color={G} style={{ display: 'inline', marginLeft: 4 }} />المنطقة
                </label>
                <select
                  value={deliveryForm.area}
                  onChange={e => setDeliveryForm(f => ({ ...f, area: e.target.value }))}
                  style={{ width: '100%', background: CARD2, border: '1.5px solid rgba(200,151,74,0.2)', borderRadius: 10, padding: '10px 14px', color: deliveryForm.area ? '#D4E0EC' : TD, fontFamily: "'Almarai',sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                  onFocus={e => { e.target.style.borderColor = G; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(200,151,74,0.2)'; }}
                >
                  <option value="" style={{ color: TD }}>اختر منطقتك</option>
                  {ALEX_AREAS.map(a => <option key={a} value={a} style={{ background: CARD2, color: '#D4E0EC' }}>{a}</option>)}
                </select>
              </div>
              {/* Address */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: TD, marginBottom: 6 }}>
                  <Home size={12} color={G} style={{ display: 'inline', marginLeft: 4 }} />العنوان التفصيلي
                </label>
                <textarea
                  value={deliveryForm.address}
                  onChange={e => setDeliveryForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="مثال: شارع النصر، بجوار مسجد القدس، الدور الثالث"
                  rows={3}
                  style={{ width: '100%', background: CARD2, border: '1.5px solid rgba(200,151,74,0.2)', borderRadius: 10, padding: '10px 14px', color: '#D4E0EC', fontFamily: "'Almarai',sans-serif", fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={e => { e.target.style.borderColor = G; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(200,151,74,0.2)'; }}
                />
              </div>
              <div style={{ fontSize: 11, color: TD, display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle2 size={11} color="#3DA882" />
                ستُملأ هذه البيانات تلقائياً في صفحة الطلب
              </div>
            </div>
          )}
        </motion.div>

        {/* Car Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: CARD, border: '1.5px solid rgba(200,151,74,0.12)', borderRadius: 24, overflow: 'hidden' }}
        >
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: '#E8F0F8' }}>
              <Car size={15} color={G} /> سيارتي
            </div>
            <button
              onClick={() => setShowCarModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(200,151,74,0.08)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 8, padding: '5px 12px', color: G, fontFamily: "'Almarai',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              <Pencil size={11} /> تعديل
            </button>
          </div>

          {car ? (
            <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,rgba(200,151,74,0.12),rgba(200,151,74,0.05))', border: '1.5px solid rgba(200,151,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 32 }}>🚗</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#E8F0F8', marginBottom: 4 }}>{car.model}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(200,151,74,0.1)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: G }}>
                    <Calendar size={10} style={{ display: 'inline', marginLeft: 3 }} />{car.year}
                  </span>
                  <span style={{ background: 'rgba(61,168,130,0.08)', border: '1px solid rgba(61,168,130,0.2)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#3DA882' }}>
                    <CheckCircle2 size={10} style={{ display: 'inline', marginLeft: 3 }} />رينو معتمدة
                  </span>
                </div>
              </div>
              <button onClick={async () => {
                clearCar();
                // Also clear from DB if logged in
                if (user && token) {
                  try {
                    const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';
                    await fetch(`${base}/api/users/${user.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ carModel: null, carYear: null }),
                    });
                  } catch {}
                }
              }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 11, fontWeight: 700, fontFamily: "'Almarai',sans-serif" }}>
                حذف
              </button>
            </div>
          ) : (
            <div style={{ padding: '28px 22px', textAlign: 'center' }}>
              <Car size={36} color="rgba(200,151,74,0.2)" style={{ margin: '0 auto 10px' }} />
              <p style={{ color: TD, fontSize: 13, marginBottom: 14 }}>لم تحدد سيارتك بعد</p>
              <button
                onClick={() => setShowCarModal(true)}
                style={{ background: 'linear-gradient(135deg,#C8974A,#DEB06C)', border: 'none', borderRadius: 999, padding: '9px 22px', color: '#0D1220', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                حدد سيارتك
              </button>
            </div>
          )}
        </motion.div>

        {/* Orders Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: CARD, border: '1.5px solid rgba(200,151,74,0.12)', borderRadius: 24, overflow: 'hidden' }}
        >
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: '#E8F0F8' }}>
              <ClipboardList size={15} color={G} /> طلباتي السابقة
            </div>
            {orders && orders.length > 5 && (
              <Link href="/my-orders" style={{ fontSize: 12, fontWeight: 700, color: G, textDecoration: 'none' }}>
                عرض الكل
              </Link>
            )}
          </div>

          {ordersLoading ? (
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 64, background: CARD2, borderRadius: 14, opacity: 0.6, animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div style={{ padding: '40px 22px', textAlign: 'center' }}>
              <Package size={40} color="rgba(200,151,74,0.15)" style={{ margin: '0 auto 10px' }} />
              <p style={{ color: TD, fontSize: 13, marginBottom: 14 }}>لم تقم بأي طلب حتى الآن</p>
              <Link href="/packages">
                <button style={{ background: 'linear-gradient(135deg,#C8974A,#DEB06C)', border: 'none', borderRadius: 999, padding: '9px 22px', color: '#0D1220', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                  تصفح الباكدجات
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentOrders.map(order => (
                <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{ background: CARD2, borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,151,74,0.2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.04)'; }}
                  >
                    {/* Icon */}
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(200,151,74,0.08)', border: '1px solid rgba(200,151,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package size={16} color={G} />
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#D4E0EC', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.package?.name ?? `طلب #${order.id}`}
                      </div>
                      <div style={{ fontSize: 11, color: TD, fontWeight: 600 }}>
                        {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: ar })}
                        {order.workshop?.name && <span style={{ marginRight: 8 }}>• {order.workshop.name}</span>}
                      </div>
                    </div>
                    {/* Price + status */}
                    <div style={{ textAlign: 'left', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: G, marginBottom: 4, textAlign: 'right' }}>{order.total} ج.م</div>
                      <StatusBadge status={order.status} />
                    </div>
                    <ArrowLeft size={14} color={TD} style={{ flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 12 }}
        >
          <Link href="/packages" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'rgba(200,151,74,0.07)', border: '1.5px solid rgba(200,151,74,0.18)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'background .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,74,0.13)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,74,0.07)'; }}
            >
              <Package size={18} color={G} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#E8F0F8' }}>الباكدجات</div>
                <div style={{ fontSize: 11, color: TD }}>تصفح وأحجز</div>
              </div>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            style={{ background: 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.15)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'background .2s', width: '100%', fontFamily: "'Almarai',sans-serif", textAlign: 'right' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}
          >
            <LogOut size={18} color="#EF4444" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#EF4444' }}>تسجيل الخروج</div>
              <div style={{ fontSize: 11, color: TD }}>خروج من حسابك</div>
            </div>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
