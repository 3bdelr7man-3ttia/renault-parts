import React, { useState, useMemo, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useGetPackageBySlug, getGetPackageBySlugQueryKey } from '@workspace/api-client-react';
import { CheckCircle2, Shield, Wrench, ArrowRight, ShoppingCart, Car, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCar } from '@/lib/car-context';

type Variant = 'original' | 'turkish' | 'chinese';

const G = '#C8974A';
const BG = '#0D1220';
const B2 = '#111826';
const NV = '#1A2356';

const PART_TYPE_LABELS: Record<string, string> = {
  filter: 'فلتر', oil: 'زيت', spark_plugs: 'شمعات إشعال', belt: 'سير',
  brake: 'فرامل', suspension: 'تعليق', battery: 'بطارية', tire: 'إطار', lights: 'كشافات',
};
function getPartTypeLabel(t: string) { return PART_TYPE_LABELS[t] ?? t; }
function isCompatible(models: string | null | undefined, carModel: string) {
  if (!models) return true;
  return models.includes(carModel) || models.includes('جميع موديلات رينو');
}

type OriginBadge = { label: string; color: string; bg: string };
function getOriginBadges(p: { priceOriginal?: number | null; priceTurkish?: number | null; priceChinese?: number | null }): OriginBadge[] {
  const badges: OriginBadge[] = [];
  if (p.priceOriginal != null) badges.push({ label: 'أصلي', color: '#1A2356', bg: '#C8974A' });
  if (p.priceTurkish != null) badges.push({ label: 'تركي', color: '#fff', bg: '#0369a1' });
  if (p.priceChinese != null) badges.push({ label: 'صيني', color: '#fff', bg: '#555' });
  return badges;
}

export default function PackageDetail() {
  const [, params] = useRoute('/packages/:slug');
  const slug = params?.slug || '';
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { car } = useCar();

  const { data: pkg, isLoading, isError } = useGetPackageBySlug(slug, {
    query: { queryKey: getGetPackageBySlugQueryKey(slug), enabled: !!slug }
  });

  // ── hooks must always run (before any early returns) ──────────────────────
  const defaultSelections = useMemo<Record<number, Variant>>(() => {
    const s: Record<number, Variant> = {};
    pkg?.parts?.forEach(p => {
      if (p.priceChinese != null) s[p.id] = 'chinese';
      else if (p.priceTurkish != null) s[p.id] = 'turkish';
      else s[p.id] = 'original';
    });
    return s;
  }, [pkg?.parts]);

  const [partSelections, setPartSelections] = useState<Record<number, Variant>>({});

  // Sync default selections when package data first arrives
  useEffect(() => {
    if (pkg?.parts?.length) {
      setPartSelections(defaultSelections);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg?.id]);

  const liveTotal = useMemo(() => {
    if (!pkg?.parts) return 0;
    return pkg.parts.reduce((sum, p) => {
      const v = partSelections[p.id];
      const price =
        v === 'original' ? Number(p.priceOriginal ?? 0) :
        v === 'turkish'  ? Number(p.priceTurkish ?? 0)  :
                           Number(p.priceChinese ?? 0);
      return sum + price;
    }, 0);
  }, [pkg?.parts, partSelections]);
  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
        <Loader2 style={{ width: 44, height: 44, color: G }} className="animate-spin" />
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Almarai',sans-serif" }}>الباكدج غير موجود</p>
        <Link href="/packages" style={{ color: G, fontFamily: "'Almarai',sans-serif", fontWeight: 700 }}>العودة للباكدجات</Link>
      </div>
    );
  }

  const basePrice = Number(pkg.basePrice);
  const savings = basePrice > liveTotal ? basePrice - liveTotal : 0;

  const handleOrderClick = () => {
    if (!user) setLocation('/login?redirect=/checkout/' + pkg.id);
    else setLocation('/checkout/' + pkg.id);
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 80, fontFamily: "'Almarai',sans-serif", direction: 'rtl' }}>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${NV} 0%, #0F1B3A 100%)`, paddingTop: 56, paddingBottom: 120, paddingLeft: 24, paddingRight: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 60% at 30% 50%, ${G}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link href="/packages" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: G, fontWeight: 700, fontSize: 14, marginBottom: 32, textDecoration: 'none' }}>
            <ArrowRight size={16} /> عودة للكتالوج
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,151,74,0.15)', border: `1px solid ${G}40`, borderRadius: 999, padding: '6px 16px', marginBottom: 16 }}>
            <Shield size={14} style={{ color: G }} />
            <span style={{ color: G, fontSize: 13, fontWeight: 700 }}>ضمان {pkg.warrantyMonths} شهور</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>{pkg.name}</h1>
          {pkg.description && <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', maxWidth: 600, lineHeight: 1.7 }}>{pkg.description}</p>}
          {car && (
            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '8px 14px' }}>
              <Car size={15} style={{ color: G }} />
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>العرض مخصص لـ {car.model} - {car.year}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', marginTop: -60, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 28, alignItems: 'start' }}
          className="pkg-grid">

          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Parts List */}
            <div style={{ background: B2, borderRadius: 24, border: `1px solid ${G}25`, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, background: `${G}20`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wrench size={18} style={{ color: G }} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>القطع المشمولة في الباكدج</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
                {pkg.parts?.map((part) => {
                  const compatible = car ? isCompatible(part.compatibleModels, car.model) : true;
                  const origins = getOriginBadges(part);
                  return (
                    <div key={part.id} style={{
                      background: compatible ? 'rgba(255,255,255,0.04)' : 'rgba(245,158,11,0.07)',
                      border: `1px solid ${compatible ? 'rgba(255,255,255,0.08)' : 'rgba(245,158,11,0.25)'}`,
                      borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start'
                    }}>
                      <CheckCircle2 size={20} style={{ color: compatible ? '#22c55e' : '#f59e0b', flexShrink: 0, marginTop: 2 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, color: '#fff', fontSize: 14, margin: 0 }}>{part.name}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '3px 0 6px' }}>
                          {getPartTypeLabel(part.type)}
                          {part.oemCode && <span style={{ marginRight: 8 }}>OEM: {part.oemCode}</span>}
                        </p>
                        {origins.length > 0 && (
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {origins.map(b => (
                              <span key={b.label} style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: b.bg, color: b.color }}>{b.label}</span>
                            ))}
                          </div>
                        )}
                        {!compatible && car && (
                          <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>تحقق من التوافق مع {car.model}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price comparison — interactive variant selector */}
            <div style={{ background: B2, borderRadius: 24, border: `1px solid ${G}25`, padding: 28, overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>اختر جودة كل قطعة</h2>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>اضغط على السعر لاختياره — يتحدث الإجمالي تلقائياً</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: 420 }}>
                <thead>
                  <tr>
                    <th style={{ paddingBottom: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>القطعة</th>
                    <th style={{ paddingBottom: 14, color: '#C8974A', fontWeight: 700, fontSize: 13, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      أصلي<br/><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.6 }}>الجودة العليا</span>
                    </th>
                    <th style={{ paddingBottom: 14, color: '#60a5fa', fontWeight: 700, fontSize: 13, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      تركي<br/><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.6 }}>جودة عالية</span>
                    </th>
                    <th style={{ paddingBottom: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 13, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      صيني<br/><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.6 }}>اقتصادي</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pkg.parts?.map((part) => {
                    const sel = partSelections[part.id];
                    const cellStyle = (v: Variant, avail: boolean, activeColor: string) => ({
                      padding: '10px 12px', textAlign: 'center' as const, fontWeight: sel === v ? 800 : 600,
                      fontSize: 13, cursor: avail ? 'pointer' : 'default', transition: 'all 0.15s',
                      background: sel === v ? `${activeColor}18` : 'transparent',
                      borderRadius: 10, border: sel === v ? `1.5px solid ${activeColor}` : '1.5px solid transparent',
                      color: sel === v ? activeColor : avail ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
                    });
                    return (
                      <tr key={part.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 0' }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{part.name}</span>
                          <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{getPartTypeLabel(part.type)}</span>
                        </td>
                        <td style={cellStyle('original', part.priceOriginal != null, '#C8974A')}
                          onClick={() => part.priceOriginal != null && setPartSelections(s => ({ ...s, [part.id]: 'original' }))}>
                          {part.priceOriginal != null ? `${Number(part.priceOriginal).toLocaleString('ar-EG')} ج.م` : <span>—</span>}
                        </td>
                        <td style={cellStyle('turkish', part.priceTurkish != null, '#60a5fa')}
                          onClick={() => part.priceTurkish != null && setPartSelections(s => ({ ...s, [part.id]: 'turkish' }))}>
                          {part.priceTurkish != null ? `${Number(part.priceTurkish).toLocaleString('ar-EG')} ج.م` : <span>—</span>}
                        </td>
                        <td style={cellStyle('chinese', part.priceChinese != null, '#a1a1aa')}
                          onClick={() => part.priceChinese != null && setPartSelections(s => ({ ...s, [part.id]: 'chinese' }))}>
                          {part.priceChinese != null ? `${Number(part.priceChinese).toLocaleString('ar-EG')} ج.م` : <span>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ paddingTop: 16, fontWeight: 900, color: '#fff', fontSize: 14 }}>الإجمالي</td>
                    <td colSpan={3} style={{ paddingTop: 16, textAlign: 'center', fontWeight: 900, fontSize: 20, color: G }}>
                      {liveTotal.toLocaleString('ar-EG')} ج.م
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Features */}
            <div style={{ background: B2, borderRadius: 24, border: `1px solid ${G}25`, padding: 28 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 20 }}>ماذا تشمل الخدمة؟</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
                {[
                  { icon: '🚗', title: 'تسليم للعميل', desc: 'نسلمك الباكدج وأنت تختار الورشة المناسبة لك' },
                  { icon: '🔰', title: `ضمان ${pkg.warrantyMonths} شهور`, desc: 'ضمان حقيقي على جميع القطع في الباكدج' },
                  { icon: '📦', title: 'توصيل للبيت', desc: 'نوصل الباكدج لحد بيتك في الإسكندرية' },
                  { icon: '💰', title: `وفر ${savings.toLocaleString()} ج.م`, desc: 'أسعارنا أقل من السوق بضمان الجودة' },
                ].map(f => (
                  <div key={f.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 18, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
                    <p style={{ fontWeight: 800, color: '#fff', fontSize: 14, marginBottom: 4 }}>{f.title}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ background: `linear-gradient(160deg, ${NV} 0%, #0A1128 100%)`, borderRadius: 28, border: `2px solid ${G}35`, padding: 28, boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${G}15 inset` }}>
              {/* Badge */}
              <div style={{ background: `${G}15`, border: `1px solid ${G}30`, borderRadius: 12, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: G, textAlign: 'center', marginBottom: 20 }}>
                سعر باكدج رينو باك
              </div>

              {car && (
                <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Car size={14} style={{ color: G }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{car.model} — {car.year}</span>
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>سعر السوق المرجعي</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                    {basePrice.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 16, color: '#fff', fontWeight: 700 }}>إجمالي اختيارك</span>
                  <span style={{ fontSize: 28, fontWeight: 900, color: G, transition: 'all 0.2s' }}>{liveTotal.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'left', marginBottom: 12 }}>
                  يتغير حسب الجودة التي تختارها في الجدول ↑
                </div>
                {savings > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>أنت توفر</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#22c55e' }}>{savings.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { icon: '📦', text: 'استلام الباكدج من مركز التوزيع أو توصيل للبيت' },
                  { icon: '🔰', text: `ضمان ${pkg.warrantyMonths} شهور على القطع` },
                  { icon: '✅', text: 'قطع مضمونة الجودة والأصالة' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleOrderClick}
                style={{
                  width: '100%', padding: '16px 0', borderRadius: 16, fontSize: 17, fontWeight: 900,
                  background: G, color: NV, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: `0 8px 24px ${G}50`, fontFamily: "'Almarai',sans-serif",
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <ShoppingCart size={20} /> اطلب الآن
              </button>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 10 }}>
                فيزا / ماستر / فودافون كاش / انستاباى
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .pkg-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
