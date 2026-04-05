import React, { useState, useMemo, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useGetPackageBySlug, getGetPackageBySlugQueryKey } from '@workspace/api-client-react';
import { CheckCircle2, Shield, Wrench, ArrowRight, ShoppingCart, Car, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCar } from '@/lib/car-context';
import { usePartCart } from '@/lib/part-cart-context';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { publicStyles, publicTheme } from '@/components/public/public-ui';

type Variant = 'original' | 'turkish' | 'chinese';

const G = '#C8974A';
const BG = '#f6f7fb';
const B2 = '#ffffff';
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
  const { setCartPackage, cartPackage } = usePartCart();
  const { isMobile, isTablet } = useBreakpoint();
  const isMobileOrTablet = isMobile || isTablet;

  const { data: pkg, isLoading, isError } = useGetPackageBySlug(slug, {
    query: { queryKey: getGetPackageBySlugQueryKey(slug), enabled: !!slug }
  });

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
        <p style={{ fontSize: 22, fontWeight: 800, color: publicTheme.text, fontFamily: "'Almarai',sans-serif" }}>الباكدج غير موجود</p>
        <Link href="/packages" style={{ color: G, fontFamily: "'Almarai',sans-serif", fontWeight: 700 }}>العودة للباكدجات</Link>
      </div>
    );
  }

  const basePrice = Number(pkg.basePrice);
  const savings = basePrice > liveTotal ? basePrice - liveTotal : 0;
  const isInCart = cartPackage?.id === pkg.id;

  const handleOrderClick = () => {
    if (!user) {
      setLocation('/login?redirect=/packages/' + pkg.slug);
      return;
    }
    if (isInCart) return;
    setCartPackage({ id: pkg.id, name: pkg.name, slug: pkg.slug, price: liveTotal });
  };

  const cardPad = isMobile ? 16 : 28;

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: isMobileOrTablet ? 100 : 80, fontFamily: "'Almarai',sans-serif", direction: 'rtl' }}>

      {/* Hero */}
      <div style={{
        ...publicStyles.hero,
        paddingTop: isMobile ? 36 : 56,
        paddingBottom: isMobile ? 80 : 120,
        paddingLeft: isMobile ? 16 : 24,
        paddingRight: isMobile ? 16 : 24,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 60% at 30% 50%, ${G}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link href="/packages" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: G, fontWeight: 700, fontSize: 13, marginBottom: 20, textDecoration: 'none' }}>
            <ArrowRight size={15} /> عودة للكتالوج
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,151,74,0.15)', border: `1px solid ${G}40`, borderRadius: 999, padding: '5px 14px', marginBottom: 12 }}>
            <Shield size={13} style={{ color: G }} />
            <span style={{ color: G, fontSize: 12, fontWeight: 700 }}>ضمان {pkg.warrantyMonths} شهور</span>
          </div>
          <h1 style={{ fontSize: isMobile ? 24 : 'clamp(28px,5vw,52px)', fontWeight: 900, color: publicTheme.text, lineHeight: 1.2, marginBottom: 10 }}>{pkg.name}</h1>
          {pkg.description && <p style={{ fontSize: isMobile ? 14 : 17, color: publicTheme.muted, maxWidth: 600, lineHeight: 1.7 }}>{pkg.description}</p>}
          {car && (
            <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, background: publicTheme.surface, border: `1px solid ${publicTheme.border}`, borderRadius: 12, padding: '7px 12px', boxShadow: publicTheme.shadowSoft }}>
              <Car size={14} style={{ color: G }} />
              <span style={{ color: publicTheme.text, fontSize: 12, fontWeight: 700 }}>العرض مخصص لـ {car.model} - {car.year}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: `0 ${isMobile ? 12 : 16}px`, marginTop: isMobile ? -40 : -60, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobileOrTablet ? '1fr' : 'minmax(0,1fr) 340px', gap: isMobile ? 16 : 28, alignItems: 'start' }}>

          {/* Sidebar — shown first on mobile via order */}
          <div style={{ position: isMobileOrTablet ? 'static' : 'sticky', top: 100, order: isMobileOrTablet ? -1 : 1 }}>
            <div style={{ background: publicTheme.surface, borderRadius: isMobile ? 20 : 28, border: `1.5px solid ${publicTheme.border}`, padding: cardPad, boxShadow: publicTheme.shadow }}>

              {/* Badge */}
              <div style={{ background: `${G}15`, border: `1px solid ${G}30`, borderRadius: 10, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: G, textAlign: 'center', marginBottom: 16 }}>
                سعر باكدج رينو باك
              </div>

              {car && (
                <div style={{ background: publicTheme.surfaceAlt, borderRadius: 10, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, border: `1px solid ${publicTheme.border}` }}>
                  <Car size={13} style={{ color: G }} />
                  <span style={{ fontSize: 12, color: publicTheme.textSoft, fontWeight: 700 }}>{car.model} — {car.year}</span>
                </div>
              )}

              {/* Price row — compact on mobile */}
              <div style={{ marginBottom: isMobile ? 16 : 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: publicTheme.muted }}>سعر السوق المرجعي</span>
                  <span style={{ fontSize: 13, color: publicTheme.mutedSoft, textDecoration: 'line-through' }}>
                    {basePrice.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: publicTheme.text, fontWeight: 700 }}>إجمالي اختيارك</span>
                  <span style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: G, transition: 'all 0.2s' }}>{liveTotal.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div style={{ fontSize: 10, color: publicTheme.mutedSoft, textAlign: 'left', marginBottom: 10 }}>
                  يتغير حسب الجودة التي تختارها في الجدول ↓
                </div>
                {savings > 0 && (
                  <div style={{ borderTop: `1px solid ${publicTheme.border}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>أنت توفر</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#22c55e' }}>{savings.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                )}
              </div>

              {/* Features list — hide on mobile to save space */}
              {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    { icon: '📦', text: 'استلام الباكدج من مركز التوزيع أو توصيل للبيت' },
                    { icon: '🔰', text: `ضمان ${pkg.warrantyMonths} شهور على القطع` },
                    { icon: '✅', text: 'قطع مضمونة الجودة والأصالة' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 15 }}>{item.icon}</span>
                      <span style={{ fontSize: 12, color: publicTheme.textSoft, lineHeight: 1.5 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleOrderClick}
                style={{
                  width: '100%', padding: isMobile ? '13px 0' : '16px 0', borderRadius: 14, fontSize: isMobile ? 15 : 17, fontWeight: 900,
                  background: isInCart ? '#22c55e' : G,
                  color: isInCart ? '#fff' : NV,
                  border: 'none', cursor: isInCart ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: isInCart ? '0 8px 24px rgba(34,197,94,0.4)' : `0 8px 24px ${G}50`,
                  fontFamily: "'Almarai',sans-serif",
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { if (!isInCart) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {isInCart ? (
                  <><CheckCircle2 size={18} /> في السلة ✓</>
                ) : (
                  <><ShoppingCart size={18} /> أضف للسلة</>
                )}
              </button>
              {isInCart && (
                <p style={{ textAlign: 'center', fontSize: 11, color: '#22c55e', marginTop: 7, fontWeight: 700 }}>
                  شوف السلة ← تقدر تضيف قطع زيادة أو تكمل الطلب
                </p>
              )}
                <p style={{ textAlign: 'center', fontSize: 10, color: publicTheme.mutedSoft, marginTop: 8 }}>
                فيزا / ماستر / فودافون كاش / انستاباى
              </p>
            </div>
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 24, order: isMobileOrTablet ? 1 : 0 }}>

            {/* Parts List */}
            <div style={{ background: B2, borderRadius: isMobile ? 20 : 24, border: `1px solid ${publicTheme.border}`, padding: cardPad, boxShadow: publicTheme.shadowSoft }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: `${G}20`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Wrench size={16} style={{ color: G }} />
                </div>
                <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, color: publicTheme.text, margin: 0 }}>القطع المشمولة في الباكدج</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
                {pkg.parts?.map((part) => {
                  const compatible = car ? isCompatible(part.compatibleModels, car.model) : true;
                  const origins = getOriginBadges(part);
                  return (
                    <div key={part.id} style={{
                      background: compatible ? publicTheme.surfaceAlt : 'rgba(245,158,11,0.07)',
                      border: `1px solid ${compatible ? publicTheme.border : 'rgba(245,158,11,0.25)'}`,
                      borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start'
                    }}>
                      <CheckCircle2 size={18} style={{ color: compatible ? '#22c55e' : '#f59e0b', flexShrink: 0, marginTop: 2 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, color: publicTheme.text, fontSize: 13, margin: 0 }}>{part.name}</p>
                        <p style={{ fontSize: 11, color: publicTheme.muted, margin: '2px 0 5px' }}>
                          {getPartTypeLabel(part.type)}
                          {part.oemCode && <span style={{ marginRight: 8 }}>OEM: {part.oemCode}</span>}
                        </p>
                        {origins.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {origins.map(b => (
                              <span key={b.label} style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: b.bg, color: b.color }}>{b.label}</span>
                            ))}
                          </div>
                        )}
                        {!compatible && car && (
                          <p style={{ fontSize: 10, color: '#f59e0b', marginTop: 3 }}>تحقق من التوافق مع {car.model}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price comparison */}
            <div style={{ background: B2, borderRadius: isMobile ? 20 : 24, border: `1px solid ${publicTheme.border}`, padding: cardPad, boxShadow: publicTheme.shadowSoft }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, color: publicTheme.text, margin: 0 }}>اختر جودة كل قطعة</h2>
                {!isMobile && <span style={{ fontSize: 11, color: publicTheme.muted }}>اضغط على السعر لاختياره</span>}
              </div>

              {isMobile ? (
                /* Mobile: card-per-part layout */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pkg.parts?.map((part) => {
                    const sel = partSelections[part.id];
                    const variants: { v: Variant; label: string; price: number | null | undefined; color: string }[] = [
                      { v: 'original', label: 'أصلي', price: part.priceOriginal, color: '#C8974A' },
                      { v: 'turkish',  label: 'تركي',  price: part.priceTurkish,  color: '#60a5fa' },
                      { v: 'chinese',  label: 'صيني',  price: part.priceChinese,  color: '#a1a1aa' },
                    ].filter(v => v.price != null);
                    return (
                      <div key={part.id} style={{ background: publicTheme.surfaceAlt, border: `1px solid ${publicTheme.border}`, borderRadius: 14, padding: '12px 14px' }}>
                        <p style={{ color: publicTheme.text, fontWeight: 800, fontSize: 13, margin: '0 0 4px' }}>{part.name}</p>
                        <p style={{ color: publicTheme.muted, fontSize: 11, margin: '0 0 10px' }}>{getPartTypeLabel(part.type)}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {variants.map(({ v, label, price, color }) => {
                            const active = sel === v;
                            return (
                              <button key={v} onClick={() => setPartSelections(s => ({ ...s, [part.id]: v }))}
                                style={{
                                  flex: 1, minWidth: 80, padding: '8px 4px', borderRadius: 10, border: `1.5px solid ${active ? color : publicTheme.border}`,
                                  background: active ? `${color}18` : 'transparent', color: active ? color : publicTheme.muted,
                                  fontSize: 12, fontWeight: active ? 800 : 600, cursor: 'pointer', transition: 'all .15s',
                                  fontFamily: "'Almarai',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
                                }}>
                                <span>{label}</span>
                                <span style={{ fontSize: 11, fontWeight: 800 }}>{Number(price).toLocaleString('ar-EG')} ج.م</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${publicTheme.border}` }}>
                    <span style={{ color: publicTheme.text, fontWeight: 900, fontSize: 14 }}>الإجمالي</span>
                    <span style={{ color: G, fontWeight: 900, fontSize: 20 }}>{liveTotal.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                </div>
              ) : (
                /* Desktop: table */
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: 380 }}>
                    <thead>
                      <tr>
                        <th style={{ paddingBottom: 12, color: publicTheme.muted, fontWeight: 700, fontSize: 13, borderBottom: `1px solid ${publicTheme.border}` }}>القطعة</th>
                        <th style={{ paddingBottom: 12, color: '#C8974A', fontWeight: 700, fontSize: 13, textAlign: 'center', borderBottom: `1px solid ${publicTheme.border}` }}>
                          أصلي<br/><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.6 }}>الجودة العليا</span>
                        </th>
                        <th style={{ paddingBottom: 12, color: '#60a5fa', fontWeight: 700, fontSize: 13, textAlign: 'center', borderBottom: `1px solid ${publicTheme.border}` }}>
                          تركي<br/><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.6 }}>جودة عالية</span>
                        </th>
                        <th style={{ paddingBottom: 12, color: publicTheme.muted, fontWeight: 700, fontSize: 13, textAlign: 'center', borderBottom: `1px solid ${publicTheme.border}` }}>
                          صيني<br/><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.6 }}>اقتصادي</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pkg.parts?.map((part) => {
                        const sel = partSelections[part.id];
                        const cellStyle = (v: Variant, avail: boolean, activeColor: string) => ({
                          padding: '10px 10px', textAlign: 'center' as const, fontWeight: sel === v ? 800 : 600,
                          fontSize: 13, cursor: avail ? 'pointer' : 'default', transition: 'all 0.15s',
                          background: sel === v ? `${activeColor}18` : 'transparent',
                          borderRadius: 10, border: sel === v ? `1.5px solid ${activeColor}` : '1.5px solid transparent',
                          color: sel === v ? activeColor : avail ? publicTheme.muted : '#cbd5e1',
                        });
                        return (
                          <tr key={part.id} style={{ borderBottom: `1px solid ${publicTheme.border}` }}>
                            <td style={{ padding: '12px 0' }}>
                              <span style={{ color: publicTheme.text, fontWeight: 700, fontSize: 14 }}>{part.name}</span>
                              <span style={{ display: 'block', fontSize: 11, color: publicTheme.muted, marginTop: 2 }}>{getPartTypeLabel(part.type)}</span>
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
                        <td style={{ paddingTop: 14, fontWeight: 900, color: publicTheme.text, fontSize: 14 }}>الإجمالي</td>
                        <td colSpan={3} style={{ paddingTop: 14, textAlign: 'center', fontWeight: 900, fontSize: 20, color: G }}>
                          {liveTotal.toLocaleString('ar-EG')} ج.م
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Features */}
            <div style={{ background: B2, borderRadius: isMobile ? 20 : 24, border: `1px solid ${publicTheme.border}`, padding: cardPad, boxShadow: publicTheme.shadowSoft }}>
              <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, color: publicTheme.text, marginBottom: 16 }}>ماذا تشمل الخدمة؟</h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill,minmax(170px,1fr))', gap: isMobile ? 10 : 14 }}>
                {[
                  { icon: '🚗', title: 'تسليم للعميل', desc: 'أنت تختار الورشة المناسبة لك' },
                  { icon: '🔰', title: `ضمان ${pkg.warrantyMonths} شهور`, desc: 'على جميع القطع في الباكدج' },
                  { icon: '📦', title: 'توصيل للبيت', desc: 'نوصل الباكدج في الإسكندرية' },
                  { icon: '💰', title: savings > 0 ? `وفر ${savings.toLocaleString()} ج.م` : 'أفضل سعر', desc: 'أسعارنا أقل من السوق بضمان الجودة' },
                ].map(f => (
                  <div key={f.title} style={{ background: publicTheme.surfaceAlt, border: `1px solid ${publicTheme.border}`, borderRadius: 14, padding: isMobile ? 14 : 18, textAlign: 'center' }}>
                    <div style={{ fontSize: isMobile ? 24 : 28, marginBottom: 6 }}>{f.icon}</div>
                    <p style={{ fontWeight: 800, color: publicTheme.text, fontSize: isMobile ? 12 : 14, marginBottom: 4 }}>{f.title}</p>
                    <p style={{ fontSize: isMobile ? 11 : 12, color: publicTheme.muted, lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
