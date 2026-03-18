import React, { useState } from 'react';
import {
  Wrench, ShieldCheck, Star, Phone, MapPin, ChevronLeft,
  Zap, Droplets, Wind, Settings, Disc, Battery,
  CheckCircle2, ArrowLeftRight, BadgeCheck, Package, Building2, User, ChevronDown
} from 'lucide-react';

// ─── BRAND ────────────────────────────────────────────────────────────────
// Deep ocean #0B1F3A · Teal glow #00C9B1 · Amber #F59E0B · Coral #F05454
// Alexandrian dialect · Marketplace / platform concept
// ──────────────────────────────────────────────────────────────────────────

const NAV = ['الباكدجات', 'قطع الغيار', 'الورش', 'ازاي بنشتغل'];

const STEPS = [
  { n: '01', icon: Package, color: '#00C9B1', title: 'اختار الباكدج', desc: 'أصلي ولا تركي؟ 20 ألف ولا 100 ألف؟ إحنا عندنا كل حاجة ومعاها الفرق في السعر والجودة.' },
  { n: '02', icon: Building2, color: '#F59E0B', title: 'إحنا بنختار الورشة', desc: 'من شبكة ورشنا المعتمدة في الإسكندرية — بنبعتلك الأقرب والأحسن تقييماً.' },
  { n: '03', icon: BadgeCheck, color: '#F05454', title: 'الضمان علينا', desc: 'ادفع لينا إحنا. لو في أي مشكلة في القطعة أو التركيب — إحنا المسؤولين مش الورشة.' },
];

const PARTS_ORIGINAL = [
  { icon: Droplets, name: 'زيت موبيل أصلي', brand: 'Mobil 1 Original', price: 320, img: '#1B4F72' },
  { icon: Disc, name: 'طقم فرامل أصلي', brand: 'Brembo Renault', price: 680, img: '#1A5276' },
  { icon: Wind, name: 'فلتر هواء أصلي', brand: 'Renault Original', price: 180, img: '#154360' },
  { icon: Zap, name: 'شمعة NGK أصلي', brand: 'NGK Japan', price: 95, img: '#1B2631' },
];

const PARTS_TURKISH = [
  { icon: Droplets, name: 'زيت سيليكون', brand: 'Silicon Turkish', price: 180, img: '#4A235A' },
  { icon: Disc, name: 'طقم فرامل تركي', brand: 'Beral Turkey', price: 340, img: '#6C3483' },
  { icon: Wind, name: 'فلتر هواء تركي', brand: 'Knecht Turkey', price: 90, img: '#5B2C6F' },
  { icon: Zap, name: 'شمعة تركي', brand: 'Beru Turkey', price: 55, img: '#4A235A' },
];

const WORKSHOPS = [
  { name: 'ورشة الميناء', area: 'ميناء الإسكندرية', rating: 4.9, jobs: 847, color: '#00C9B1', tag: 'الأسرع' },
  { name: 'سنتر المنتزه', area: 'المنتزه', rating: 4.8, jobs: 1204, color: '#F59E0B', tag: 'الأعلى تقييماً' },
  { name: 'ورشة العجمي', area: 'العجمي – سيدي بشر', rating: 4.7, jobs: 632, color: '#F05454', tag: '' },
  { name: 'سنتر سيدي جابر', area: 'سيدي جابر', rating: 4.9, jobs: 980, color: '#7C3AED', tag: 'الأقرب' },
];

const PACKAGES = [
  { id: 'emergency', name: 'طوارئ', badge: '', price: 299, km: 'عند الحاجة', color: '#F05454', items: ['كشف عطل سريع', 'تبديل زيت', 'فحص شامل 20 بند'] },
  { id: '20k', name: '20,000 كم', badge: '', price: 1499, km: '20,000 كم', color: '#00C9B1', items: ['تبديل زيت + فلتر', 'فحص فرامل', 'ضبط إطارات', '+8 خدمات تانية'] },
  { id: '40k', name: '40,000 كم', badge: 'الأكثر طلباً', price: 2199, km: '40,000 كم', color: '#F59E0B', items: ['كل خدمات 20k', 'تبديل شمعات', 'فحص تروس', '+12 خدمة'] },
  { id: '60k', name: '60,000 كم', badge: '', price: 3499, km: '60,000 كم', color: '#7C3AED', items: ['كل خدمات 40k', 'تبديل بواجي', 'تنظيف حقن وقود', '+15 خدمة'] },
  { id: '100k', name: '100,000 كم', badge: 'الأشمل', price: 5999, km: '100,000 كم', color: '#0EA5E9', items: ['عمرة كاملة', 'كل السوائل', 'فحص كهربائي كامل', '+20 خدمة'] },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────
export function AlexandriaBlend() {
  const [partTab, setPartTab] = useState<'original' | 'turkish'>('original');
  const [activePkg, setActivePkg] = useState('40k');
  const currentPkg = PACKAGES.find(p => p.id === activePkg)!;
  const parts = partTab === 'original' ? PARTS_ORIGINAL : PARTS_TURKISH;

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo','Tajawal',sans-serif", background: '#0B1F3A', color: '#fff', minHeight: '100vh' }}>

      {/* ═══════ NAV ═══════ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 99, background: 'rgba(11,31,58,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,201,177,0.15)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#00C9B1,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(0,201,177,0.3)' }}>
              <Wrench size={20} color="#0B1F3A" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.5, lineHeight: 1 }}>رينو بارتس</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#00C9B1', letterSpacing: 1 }}>الإسكندرية</div>
            </div>
          </div>
          {/* Nav links */}
          <div style={{ display: 'flex', gap: 28 }}>
            {NAV.map(n => <span key={n} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{n}</span>)}
          </div>
          {/* CTA */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>دخول</span>
            <button style={{ background: 'linear-gradient(135deg,#00C9B1,#0EA5E9)', color: '#0B1F3A', border: 'none', borderRadius: 32, padding: '9px 22px', fontWeight: 900, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(0,201,177,0.3)' }}>
              احجز دلوقتي
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section style={{ position: 'relative', padding: '72px 28px 56px', overflow: 'hidden' }}>
        {/* BG decor */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -200, right: -200, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,201,177,0.07) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />
          {/* Grid lines */}
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${i * 20}%`, width: 1, background: 'rgba(255,255,255,0.02)' }} />
          ))}
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

          {/* LEFT: Headline */}
          <div>
            {/* Tag */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,201,177,0.1)', border: '1px solid rgba(0,201,177,0.25)', borderRadius: 32, padding: '6px 14px', marginBottom: 28 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C9B1', boxShadow: '0 0 6px #00C9B1' }} />
              <span style={{ color: '#00C9B1', fontSize: 12, fontWeight: 700 }}>فكرة جديدة في صيانة الرينو</span>
            </div>

            <h1 style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: -1 }}>
              إحنا مش ورشة،<br />
              <span style={{ background: 'linear-gradient(135deg,#00C9B1,#0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>إحنا الضمان.</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.85, margin: '0 0 12px', maxWidth: 460 }}>
              زي أوبر بالظبط — بس بين مراكز قطع الغيار والورش المتخصصة في رينو.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7, margin: '0 0 36px', maxWidth: 440 }}>
              إنت بتاختار الباكدج وبتدفع لينا إحنا. إحنا بنجيبلك القطعة — أصلي أو تركي — وبنبعتلك الورشة الأقرب المعتمدة. ولو أي حاجة مش تمام، الضمان علينا إحنا.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button style={{ background: 'linear-gradient(135deg,#00C9B1,#0EA5E9)', color: '#0B1F3A', border: 'none', borderRadius: 36, padding: '14px 32px', fontWeight: 900, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 28px rgba(0,201,177,0.25)' }}>
                شوف الباكدجات
              </button>
              <button style={{ background: 'transparent', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 36, padding: '14px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
                ازاي بنشتغل؟
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, marginTop: 44, paddingTop: 36, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {[['1,247+', 'عميل اتخدم'], ['4.9 ⭐', 'متوسط التقييم'], ['32', 'ورشة شريكة']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#00C9B1', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Marketplace diagram */}
          <div style={{ position: 'relative' }}>
            {/* Central hub */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,201,177,0.2)', borderRadius: 28, padding: 32 }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 28, letterSpacing: 1 }}>كيف بنشتغل</p>

              {/* 3-node diagram */}
              <div style={{ position: 'relative', height: 260 }}>
                {/* Center: Platform */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(0,201,177,0.2),rgba(14,165,233,0.2))', border: '2px solid rgba(0,201,177,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3, boxShadow: '0 0 32px rgba(0,201,177,0.15)' }}>
                  <Wrench size={24} color="#00C9B1" />
                  <span style={{ color: '#00C9B1', fontSize: 11, fontWeight: 900, marginTop: 4 }}>رينو بارتس</span>
                </div>

                {/* SVG connecting lines */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                  {/* Line to top-left (parts) */}
                  <line x1="50%" y1="50%" x2="18%" y2="18%" stroke="rgba(0,201,177,0.3)" strokeWidth="1.5" strokeDasharray="6,4" />
                  {/* Line to top-right (workshop) */}
                  <line x1="50%" y1="50%" x2="82%" y2="18%" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" strokeDasharray="6,4" />
                  {/* Line to bottom (customer) */}
                  <line x1="50%" y1="50%" x2="50%" y2="90%" stroke="rgba(240,84,84,0.3)" strokeWidth="1.5" strokeDasharray="6,4" />
                </svg>

                {/* Node: Parts supplier */}
                <div style={{ position: 'absolute', top: 0, right: '62%', transform: 'translateX(50%)', background: 'rgba(0,201,177,0.08)', border: '1px solid rgba(0,201,177,0.3)', borderRadius: 16, padding: '12px 16px', textAlign: 'center', minWidth: 110 }}>
                  <Package size={20} color="#00C9B1" style={{ margin: '0 auto 6px' }} />
                  <div style={{ color: '#00C9B1', fontSize: 12, fontWeight: 800 }}>مراكز القطع</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600, marginTop: 2 }}>أصلي + تركي</div>
                </div>

                {/* Node: Workshop */}
                <div style={{ position: 'absolute', top: 0, left: '62%', transform: 'translateX(-50%)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, padding: '12px 16px', textAlign: 'center', minWidth: 110 }}>
                  <Building2 size={20} color="#F59E0B" style={{ margin: '0 auto 6px' }} />
                  <div style={{ color: '#F59E0B', fontSize: 12, fontWeight: 800 }}>ورش التركيب</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600, marginTop: 2 }}>32 ورشة معتمدة</div>
                </div>

                {/* Node: Customer */}
                <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: 'rgba(240,84,84,0.08)', border: '1px solid rgba(240,84,84,0.3)', borderRadius: 16, padding: '12px 16px', textAlign: 'center', minWidth: 110 }}>
                  <User size={20} color="#F05454" style={{ margin: '0 auto 6px' }} />
                  <div style={{ color: '#F05454', fontSize: 12, fontWeight: 800 }}>العميل</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600, marginTop: 2 }}>بيدفع لينا إحنا</div>
                </div>
              </div>

              {/* Guarantee banner */}
              <div style={{ marginTop: 20, background: 'rgba(0,201,177,0.06)', border: '1px solid rgba(0,201,177,0.2)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <BadgeCheck size={18} color="#00C9B1" style={{ flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>
                  الضمان يغطي القطعة <strong style={{ color: '#00C9B1' }}>والتركيب</strong> — ادفع مرة وخليك مطمن
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section style={{ padding: '56px 28px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontSize: 30, fontWeight: 900, margin: '0 0 8px' }}>ازاي بنشتغل؟</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 600, margin: 0 }}>بسيطة زي أوبر — بس للرينو</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28, position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: 36, right: '16.5%', left: '16.5%', height: 1, background: 'linear-gradient(to left, rgba(240,84,84,0.3), rgba(245,158,11,0.3), rgba(0,201,177,0.3))', pointerEvents: 'none' }} />
            {STEPS.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}25`, borderRadius: 22, padding: '28px 24px', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${s.color}15`, border: `1.5px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <s.icon size={24} color={s.color} />
                  </div>
                  <span style={{ color: `${s.color}60`, fontWeight: 900, fontSize: 36, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>
                </div>
                <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 10px' }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.8, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PARTS: ORIGINAL vs TURKISH ═══════ */}
      <section style={{ padding: '64px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 6px' }}>إحنا بتوع الأصلي 💪</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>وعندنا التركي كمان — وهنقولك الفرق بالسعر والجودة بكل صدق</p>
            </div>
            {/* Toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 32, padding: 4, gap: 4 }}>
              {(['original', 'turkish'] as const).map(t => {
                const isActive = partTab === t;
                const labels = { original: '✅ أصلي', turkish: '🇹🇷 تركي' };
                const colors = { original: '#00C9B1', turkish: '#7C3AED' };
                return (
                  <button key={t} onClick={() => setPartTab(t)} style={{ padding: '8px 20px', borderRadius: 28, border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', background: isActive ? colors[t] : 'transparent', color: isActive ? (t === 'original' ? '#0B1F3A' : '#fff') : 'rgba(255,255,255,0.5)' }}>
                    {labels[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison note */}
          {partTab === 'turkish' && (
            <div style={{ marginBottom: 24, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 14, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 700 }}>
                التركي <strong style={{ color: '#A78BFA' }}>مش وحش</strong> — بس لازم تعرف الفرق. هنا السعر أقل، الضمان أقل، ومناسب للعربيات الأقدم. والاختيار ليك.
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
            {parts.map(({ icon: Icon, name, brand, price, img }) => {
              const accent = partTab === 'original' ? '#00C9B1' : '#7C3AED';
              return (
                <div key={name} style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${accent}20`, background: 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}50`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}20`; }}
                >
                  {/* Part image placeholder */}
                  <div style={{ height: 110, background: `linear-gradient(135deg, ${img}, ${img}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <Icon size={44} color="rgba(255,255,255,0.25)" />
                    {partTab === 'original' && (
                      <div style={{ position: 'absolute', top: 10, right: 10, background: '#00C9B1', color: '#0B1F3A', fontSize: 9, fontWeight: 900, borderRadius: 12, padding: '3px 8px' }}>أصلي 100%</div>
                    )}
                    {partTab === 'turkish' && (
                      <div style={{ position: 'absolute', top: 10, right: 10, background: '#7C3AED', color: '#fff', fontSize: 9, fontWeight: 900, borderRadius: 12, padding: '3px 8px' }}>🇹🇷 تركي</div>
                    )}
                  </div>
                  <div style={{ padding: '16px 14px' }}>
                    <p style={{ color: accent, fontSize: 10, fontWeight: 700, margin: '0 0 4px' }}>{brand}</p>
                    <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 800, margin: '0 0 12px' }}>{name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: accent, fontWeight: 900, fontSize: 18 }}>{price} <span style={{ fontSize: 11 }}>ج.م</span></span>
                      <button style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent, borderRadius: 10, padding: '5px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>أضف</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ PACKAGES ═══════ */}
      <section style={{ padding: '64px 28px', background: 'rgba(0,201,177,0.03)', borderTop: '1px solid rgba(0,201,177,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px' }}>باكدجات الصيانة</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>قطعة أصلية + ورشة معتمدة + ضمان = باكدج واحد بسعر واحد</p>
          </div>

          {/* Selector tabs */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
            {PACKAGES.map(p => (
              <button key={p.id} onClick={() => setActivePkg(p.id)} style={{ padding: '8px 18px', borderRadius: 28, border: `1.5px solid ${activePkg === p.id ? p.color : 'rgba(255,255,255,0.12)'}`, background: activePkg === p.id ? `${p.color}15` : 'transparent', color: activePkg === p.id ? p.color : 'rgba(255,255,255,0.45)', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                {p.name}
                {p.badge && <span style={{ marginRight: 6, fontSize: 9, background: p.color, color: p.id === '40k' ? '#0B1F3A' : '#fff', borderRadius: 10, padding: '1px 6px' }}>{p.badge}</span>}
              </button>
            ))}
          </div>

          {/* Active package detail */}
          <div style={{ maxWidth: 640, margin: '0 auto', background: `linear-gradient(135deg, ${currentPkg.color}10, rgba(255,255,255,0.02))`, border: `1.5px solid ${currentPkg.color}35`, borderRadius: 28, padding: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <p style={{ color: `${currentPkg.color}99`, fontSize: 12, fontWeight: 700, margin: '0 0 4px' }}>{currentPkg.km}</p>
                <h3 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: 0 }}>باكدج {currentPkg.name}</h3>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: currentPkg.color, fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{currentPkg.price.toLocaleString()}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700 }}>ج.م</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {currentPkg.items.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} color={currentPkg.color} style={{ flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '12px 16px' }}>
              <ShieldCheck size={16} color={currentPkg.color} />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700 }}>يشمل التركيب في ورشة معتمدة + ضمان 12 شهر</span>
            </div>
            <button style={{ width: '100%', background: `linear-gradient(135deg, ${currentPkg.color}, ${currentPkg.color}bb)`, color: currentPkg.id === '40k' ? '#0B1F3A' : '#fff', border: 'none', borderRadius: 16, padding: '15px', fontWeight: 900, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 8px 24px ${currentPkg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              احجز الباكدج دلوقتي <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ WORKSHOPS ═══════ */}
      <section style={{ padding: '64px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 6px' }}>ورشنا الشريكة في الإسكندرية</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>كل ورشة اتاختارت بعد تقييم دقيق — مش أي حد بيدخل معانا</p>
            </div>
            <button style={{ color: '#00C9B1', background: 'none', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
              كل الورش <ChevronLeft size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
            {WORKSHOPS.map(w => (
              <div key={w.name} style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${w.color}20`, background: 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'none'}
              >
                {/* Workshop photo placeholder */}
                <div style={{ height: 120, background: `linear-gradient(135deg, rgba(11,31,58,0.9), ${w.color}20)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `3px solid ${w.color}` }}>
                  <Building2 size={40} color={`${w.color}60`} />
                  {w.tag && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: w.color, color: '#0B1F3A', fontSize: 10, fontWeight: 900, borderRadius: 12, padding: '3px 10px' }}>{w.tag}</div>
                  )}
                  <div style={{ position: 'absolute', bottom: -14, right: 16, background: '#0B1F3A', border: `1.5px solid ${w.color}50`, borderRadius: 10, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={11} color={w.color} fill={w.color} />
                    <span style={{ color: w.color, fontSize: 12, fontWeight: 900 }}>{w.rating}</span>
                  </div>
                </div>
                <div style={{ padding: '22px 16px 16px' }}>
                  <h4 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: '0 0 4px' }}>{w.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                    <MapPin size={12} color="rgba(255,255,255,0.35)" />
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}>{w.area}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700 }}>{w.jobs.toLocaleString()} سيارة اتخدمت</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer style={{ background: '#060F1A', borderTop: '1px solid rgba(0,201,177,0.1)', padding: '48px 28px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#00C9B1,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench size={18} color="#060F1A" />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 17 }}>رينو بارتس</div>
                <div style={{ color: '#00C9B1', fontSize: 10, fontWeight: 700 }}>الإسكندرية</div>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.75, maxWidth: 260 }}>منصة الوساطة الأولى بين مراكز قطع غيار رينو وورش التركيب المعتمدة في الإسكندرية.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
              <Phone size={14} color="#00C9B1" />
              <span style={{ color: '#00C9B1', fontWeight: 800, fontSize: 14 }}>01000000000</span>
            </div>
          </div>
          {[
            { title: 'الخدمات', items: ['الباكدجات', 'قطع الغيار الأصلية', 'القطع التركية', 'الورش الشريكة'] },
            { title: 'الشركة', items: ['ازاي بنشتغل', 'انضم كورشة', 'انضم كمورد', 'تواصل معنا'] },
            { title: 'الإسكندرية', items: ['المنتزه', 'سيدي جابر', 'العجمي', 'ميناء الإسكندرية'] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 13, marginBottom: 18 }}>{col.title}</p>
              {col.items.map(i => <div key={i} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 12, cursor: 'pointer' }}>{i}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>© 2026 رينو بارتس الإسكندرية</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={12} color="#F59E0B" fill="#F59E0B" />)}
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginRight: 6 }}>4.9 / 5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
