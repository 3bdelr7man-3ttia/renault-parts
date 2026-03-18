import React, { useState, useEffect } from 'react';
import {
  Search, Wrench, ShieldCheck, Star, Phone, MapPin, ChevronLeft,
  Zap, Droplets, Wind, Settings, Disc, Battery, Package,
  Building2, Gift, Sparkles, CheckCircle2, X, BadgeCheck, ArrowLeftRight
} from 'lucide-react';

/* ─── KEYFRAME ANIMATIONS ─────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap');

  * { box-sizing: border-box; }

  @keyframes pulseGlow {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes neonPulse {
    0%, 100% { box-shadow: 0 0 8px currentColor; }
    50% { box-shadow: 0 0 24px currentColor, 0 0 48px currentColor; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes dash {
    to { stroke-dashoffset: -30; }
  }
  .pill-btn {
    font-family: 'Almarai', sans-serif;
    border-radius: 999px;
    border: 1.5px solid transparent;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  .pill-btn:hover { transform: translateY(-2px) scale(1.03); }
  .service-pill {
    font-family: 'Almarai', sans-serif;
    border-radius: 999px;
    padding: 10px 22px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    border: 1.5px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.65);
  }
  .service-pill:hover, .service-pill.active {
    transform: translateY(-3px) scale(1.06);
  }
  .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
  .card-hover:hover { transform: translateY(-4px); }
  .glow-teal { color: #00E5D0; }
  .glow-orange { color: #FF7A3D; }
  .glow-purple { color: #B06EF7; }
  .neon-line {
    stroke-dasharray: 8, 6;
    animation: dash 1.5s linear infinite;
  }
`;

/* ─── DATA ─────────────────────────────────────────────────────────── */
const SERVICES = [
  { icon: Droplets, label: 'تغيير زيت', color: '#FF7A3D', glow: 'rgba(255,122,61,0.4)' },
  { icon: Disc, label: 'فرامل', color: '#00E5D0', glow: 'rgba(0,229,208,0.4)' },
  { icon: Wind, label: 'فلتر هواء', color: '#B06EF7', glow: 'rgba(176,110,247,0.4)' },
  { icon: Zap, label: 'كهرباء وبطارية', color: '#F59E0B', glow: 'rgba(245,158,11,0.4)' },
  { icon: Settings, label: 'تروس وعفشة', color: '#22D3EE', glow: 'rgba(34,211,238,0.4)' },
  { icon: Wrench, label: 'عمرة كاملة', color: '#34D399', glow: 'rgba(52,211,153,0.4)' },
];

const AI_PARTS = [
  { name: 'زيت موبيل 1', origPrice: 320, turkPrice: 160, origBrand: 'Mobil 1 Germany', turkBrand: 'Selenia Turkey', origScore: 98, turkScore: 74, winner: 'orig' },
  { name: 'طقم فرامل', origPrice: 680, turkPrice: 320, origBrand: 'Brembo Italy', turkBrand: 'Beral Turkey', origScore: 96, turkScore: 79, winner: 'orig' },
  { name: 'فلتر زيت', origPrice: 95, turkPrice: 48, origBrand: 'Renault Original', turkBrand: 'Knecht Turkey', origScore: 99, turkScore: 82, winner: 'orig' },
];

const PACKAGES = [
  { id: 'lite', name: 'باكدج لايت', badge: '', price: 999, color: '#00E5D0', services: ['تغيير زيت + فلتر', 'فحص فرامل', 'ضبط الإطارات'], gift: 'فرشاة عجلات' },
  { id: 'standard', name: 'باكدج ستاندرد', badge: '⭐ الأكثر طلباً', price: 2199, color: '#FF7A3D', services: ['كل خدمات لايت', 'تبديل شمعات', 'فحص كهرباء كامل', 'غسيل ثروتل'], gift: 'قسيمة تخفيض 20%' },
  { id: 'pro', name: 'باكدج برو', badge: '🔥 الأشمل', price: 3999, color: '#B06EF7', services: ['كل خدمات ستاندرد', 'فحص تروس + عفشة', 'تغيير بواجي', 'تقرير صحة شامل', '+5 خدمات'], gift: '🎁 فلتر هواء مجاناً' },
];

const WORKSHOPS = [
  { name: 'ورشة الميناء', area: 'الميناء', rating: 4.9, jobs: 847, accent: '#00E5D0' },
  { name: 'سنتر المنتزه', area: 'المنتزه', rating: 4.8, jobs: 1204, accent: '#FF7A3D' },
  { name: 'ورشة العجمي', area: 'العجمي', rating: 4.7, jobs: 632, accent: '#B06EF7' },
  { name: 'سنتر سيدي جابر', area: 'سيدي جابر', rating: 4.9, jobs: 980, accent: '#F59E0B' },
];

/* ─── COMPONENT ────────────────────────────────────────────────────── */
export function AlexandriaBlend() {
  const [activeService, setActiveService] = useState<number | null>(null);
  const [selectedPkg, setSelectedPkg] = useState('standard');
  const [aiPart, setAiPart] = useState(0);
  const [aiMode, setAiMode] = useState<'orig' | 'turk'>('orig');
  const [searchVal, setSearchVal] = useState('');
  const [showAiResult, setShowAiResult] = useState(false);
  const currentPkg = PACKAGES.find(p => p.id === selectedPkg)!;
  const part = AI_PARTS[aiPart];

  useEffect(() => {
    if (showAiResult) return;
    const t = setTimeout(() => setShowAiResult(true), 300);
    return () => clearTimeout(t);
  }, [aiPart, showAiResult]);

  const handlePartChange = (i: number) => {
    setShowAiResult(false);
    setAiPart(i);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div dir="rtl" style={{ fontFamily: "'Almarai', 'Cairo', sans-serif", background: '#080D18', color: '#fff', minHeight: '100vh' }}>

        {/* ═══ NAV ═══ */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 99, background: 'rgba(8,13,24,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,229,208,0.1)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', gap: 24 }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#00E5D0,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(0,229,208,0.35)' }}>
                <Wrench size={19} color="#080D18" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1, letterSpacing: -0.3 }}>رينو بارتس</div>
                <div style={{ color: '#00E5D0', fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>ALEXANDRIA</div>
              </div>
            </div>

            {/* Search bar — center, prominent */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} color="rgba(255,255,255,0.35)" style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="دور على قطعة أو خدمة... مثال: فلتر زيت رينو كليو"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 999, padding: '9px 42px 9px 18px', color: '#fff', fontSize: 13, fontFamily: "'Almarai',sans-serif",
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(0,229,208,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Nav + CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
              {['الباكدجات', 'قطع الغيار', 'الورش'].map(n => (
                <span key={n} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>{n}</span>
              ))}
              <button className="pill-btn" style={{ background: 'linear-gradient(135deg,#00E5D0,#0EA5E9)', color: '#080D18', padding: '8px 20px', fontWeight: 800, fontSize: 13, border: 'none', boxShadow: '0 4px 18px rgba(0,229,208,0.3)' }}>
                احجز دلوقتي
              </button>
            </div>
          </div>
        </nav>

        {/* ═══ HERO — Service-first ═══ */}
        <section style={{ position: 'relative', padding: '72px 28px 56px', overflow: 'hidden' }}>
          {/* Animated background orbs */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -120, right: -80, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,208,0.08) 0%, transparent 65%)', animation: 'pulseGlow 4s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: -80, left: 60, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,61,0.07) 0%, transparent 65%)', animation: 'pulseGlow 5s ease-in-out infinite 1s' }} />
            <div style={{ position: 'absolute', top: '30%', left: '40%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(176,110,247,0.06) 0%, transparent 65%)', animation: 'pulseGlow 6s ease-in-out infinite 2s' }} />
            {/* Grid */}
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${i * 14.3}%`, width: 1, background: 'rgba(255,255,255,0.018)' }} />
            ))}
          </div>

          <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 56, alignItems: 'center' }}>

            {/* LEFT */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,208,0.08)', border: '1px solid rgba(0,229,208,0.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 28 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00E5D0', boxShadow: '0 0 8px #00E5D0', animation: 'pulseGlow 2s infinite' }} />
                <span style={{ color: '#00E5D0', fontSize: 12, fontWeight: 700 }}>منصة قطع الغيار الأولى — الإسكندرية</span>
              </div>

              <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.2, margin: '0 0 18px', letterSpacing: -0.5 }}>
                إحنا مش بنبيع قطع،<br />
                <span style={{ background: 'linear-gradient(135deg,#00E5D0,#0EA5E9,#B06EF7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                  إحنا بنبيع باكدج.
                </span>
              </h1>

              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.9, margin: '0 0 10px', maxWidth: 480 }}>
                زي أوبر — إحنا الوسيط بين مراكز قطع غيار رينو وورش التركيب المعتمدة في الإسكندرية.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.8, margin: '0 0 40px', maxWidth: 460 }}>
                إنت بتدفع لينا، إحنا بنجيب القطعة — أصلي أو تركي وانت اللي بتختار — وبنبعتلك الورشة الأقرب. والضمان على القطعة والتركيب علينا إحنا.
              </p>

              {/* Service pills */}
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>ابدأ من اللي محتاجه:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {SERVICES.map((s, i) => {
                  const isActive = activeService === i;
                  return (
                    <button
                      key={i}
                      className="service-pill"
                      onClick={() => setActiveService(isActive ? null : i)}
                      style={{
                        borderColor: isActive ? s.color : undefined,
                        background: isActive ? `${s.color}15` : undefined,
                        color: isActive ? s.color : undefined,
                        boxShadow: isActive ? `0 0 14px ${s.glow}` : undefined,
                      }}
                    >
                      <s.icon size={14} style={{ marginLeft: 6, display: 'inline', verticalAlign: 'middle' }} />
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {activeService !== null && (
                <div style={{ marginTop: 20, animation: 'slideUp 0.3s ease', background: `${SERVICES[activeService].color}10`, border: `1px solid ${SERVICES[activeService].color}30`, borderRadius: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 700 }}>
                    عندنا باكدج بيشمل <strong style={{ color: SERVICES[activeService].color }}>{SERVICES[activeService].label}</strong> — هنوفرلك أصلي وتركي ومعاه الورشة
                  </span>
                  <button className="pill-btn" style={{ background: SERVICES[activeService].color, color: '#080D18', padding: '7px 18px', fontWeight: 800, fontSize: 12, border: 'none', flexShrink: 0 }}>
                    اختار الباكدج
                  </button>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'flex', gap: 36, marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[['1,247+', 'عميل تخدم'], ['4.9 ★', 'تقييم'], ['32', 'ورشة شريكة']].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#00E5D0' }}>{n}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Neon engine diagram style */}
            <div style={{ position: 'relative', animation: 'float 5s ease-in-out infinite' }}>
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 28, padding: 32, position: 'relative', overflow: 'hidden' }}>
                {/* Animated corner accent */}
                <div style={{ position: 'absolute', top: -1, right: -1, width: 100, height: 100, background: 'linear-gradient(135deg,rgba(0,229,208,0.15),transparent)', borderRadius: '0 28px 0 80%' }} />

                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textAlign: 'center', marginBottom: 28 }}>كيف بنشتغل</p>

                {/* SVG marketplace diagram with neon lines */}
                <div style={{ position: 'relative', height: 240 }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                    <defs>
                      <filter id="glow-teal">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                      <filter id="glow-orange">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>
                    {/* Lines from center to nodes */}
                    <line x1="50%" y1="50%" x2="16%" y2="15%" stroke="#00E5D0" strokeWidth="1.5" strokeOpacity="0.5" className="neon-line" filter="url(#glow-teal)" />
                    <line x1="50%" y1="50%" x2="84%" y2="15%" stroke="#FF7A3D" strokeWidth="1.5" strokeOpacity="0.5" className="neon-line" filter="url(#glow-orange)" />
                    <line x1="50%" y1="50%" x2="50%" y2="92%" stroke="#B06EF7" strokeWidth="1.5" strokeOpacity="0.5" className="neon-line" />
                  </svg>

                  {/* Center node */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-53%)', width: 86, height: 86, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(0,229,208,0.15),rgba(14,165,233,0.15))', border: '2px solid rgba(0,229,208,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3, boxShadow: '0 0 30px rgba(0,229,208,0.2), inset 0 0 20px rgba(0,229,208,0.05)' }}>
                    <Wrench size={22} color="#00E5D0" />
                    <span style={{ color: '#00E5D0', fontSize: 10, fontWeight: 800, marginTop: 5, textAlign: 'center', lineHeight: 1.2 }}>رينو<br />بارتس</span>
                  </div>

                  {/* Node: Parts */}
                  <div style={{ position: 'absolute', top: 0, right: '68%', transform: 'translateX(50%)', background: 'rgba(0,229,208,0.07)', border: '1px solid rgba(0,229,208,0.25)', borderRadius: 16, padding: '11px 14px', textAlign: 'center', boxShadow: '0 0 16px rgba(0,229,208,0.1)' }}>
                    <Package size={18} color="#00E5D0" style={{ margin: '0 auto 5px' }} />
                    <div style={{ color: '#00E5D0', fontSize: 11, fontWeight: 800 }}>مراكز القطع</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 2 }}>أصلي + تركي</div>
                  </div>

                  {/* Node: Workshop */}
                  <div style={{ position: 'absolute', top: 0, left: '68%', transform: 'translateX(-50%)', background: 'rgba(255,122,61,0.07)', border: '1px solid rgba(255,122,61,0.25)', borderRadius: 16, padding: '11px 14px', textAlign: 'center', boxShadow: '0 0 16px rgba(255,122,61,0.1)' }}>
                    <Building2 size={18} color="#FF7A3D" style={{ margin: '0 auto 5px' }} />
                    <div style={{ color: '#FF7A3D', fontSize: 11, fontWeight: 800 }}>ورش التركيب</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 2 }}>32 ورشة</div>
                  </div>

                  {/* Node: Customer */}
                  <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: 'rgba(176,110,247,0.07)', border: '1px solid rgba(176,110,247,0.25)', borderRadius: 16, padding: '11px 14px', textAlign: 'center', boxShadow: '0 0 16px rgba(176,110,247,0.1)' }}>
                    <BadgeCheck size={18} color="#B06EF7" style={{ margin: '0 auto 5px' }} />
                    <div style={{ color: '#B06EF7', fontSize: 11, fontWeight: 800 }}>العميل + ضمان</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 2 }}>بيدفع لينا</div>
                  </div>
                </div>

                {/* Guarantee strip */}
                <div style={{ marginTop: 20, background: 'rgba(0,229,208,0.05)', border: '1px solid rgba(0,229,208,0.15)', borderRadius: 12, padding: '11px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <ShieldCheck size={16} color="#00E5D0" style={{ flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>الضمان على القطعة <strong style={{ color: '#00E5D0' }}>والتركيب</strong> — ادفع مرة وخليك مطمن</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PACKAGES — Builder with Gift ═══ */}
        <section style={{ padding: '64px 28px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 8px' }}>ابني باكدجك 🛠️</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>مش بنبيع قطع منفردة — كل باكدج = قطعة + تركيب + ضمان + هدية</p>
            </div>

            {/* Package selector pills */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
              {PACKAGES.map(p => {
                const isActive = selectedPkg === p.id;
                return (
                  <button key={p.id} className="pill-btn" onClick={() => setSelectedPkg(p.id)} style={{
                    padding: '10px 24px', background: isActive ? `${p.color}18` : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${isActive ? p.color : 'rgba(255,255,255,0.1)'}`,
                    color: isActive ? p.color : 'rgba(255,255,255,0.45)', fontWeight: 800, fontSize: 14,
                    boxShadow: isActive ? `0 0 20px ${p.color}25` : 'none',
                  }}>
                    {p.name}
                    {p.badge && <span style={{ display: 'block', fontSize: 9, opacity: 0.8, fontWeight: 700, marginTop: 2 }}>{p.badge}</span>}
                  </button>
                );
              })}
            </div>

            {/* Active package */}
            <div style={{ maxWidth: 600, margin: '0 auto', background: `linear-gradient(145deg, ${currentPkg.color}0D, rgba(8,13,24,0.8))`, border: `1.5px solid ${currentPkg.color}30`, borderRadius: 28, padding: 36, animation: 'slideUp 0.3s ease', boxShadow: `0 20px 60px ${currentPkg.color}15` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>{currentPkg.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${currentPkg.color}15`, border: `1px solid ${currentPkg.color}30`, borderRadius: 999, padding: '5px 14px', width: 'fit-content' }}>
                    <Gift size={13} color={currentPkg.color} />
                    <span style={{ color: currentPkg.color, fontSize: 12, fontWeight: 700 }}>هديتك: {currentPkg.gift}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: currentPkg.color, fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{currentPkg.price.toLocaleString()}</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 700 }}>ج.م شامل التركيب</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
                {currentPkg.services.map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={14} color={currentPkg.color} style={{ flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 700 }}>{s}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 14px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 2 }}>نوع القطعة</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#00E5D0' }}>✅ أصلي (الافتراضي)</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 14px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 2 }}>الضمان</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#B06EF7' }}>🛡️ 12 شهر</div>
                </div>
              </div>

              <button className="pill-btn" style={{ width: '100%', background: `linear-gradient(135deg,${currentPkg.color},${currentPkg.color}bb)`, color: currentPkg.id === 'standard' ? '#080D18' : '#fff', border: 'none', padding: '14px', fontWeight: 800, fontSize: 16, marginTop: 8, boxShadow: `0 8px 28px ${currentPkg.color}35` }}>
                احجز الباكدج + استلم هديتك <ChevronLeft size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </button>
            </div>
          </div>
        </section>

        {/* ═══ AI COMPARISON ═══ */}
        <section style={{ padding: '64px 28px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 20 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(176,110,247,0.1)', border: '1px solid rgba(176,110,247,0.25)', borderRadius: 999, padding: '5px 14px', marginBottom: 12 }}>
                  <Sparkles size={13} color="#B06EF7" />
                  <span style={{ color: '#B06EF7', fontSize: 11, fontWeight: 700 }}>مقارنة بالذكاء الاصطناعي</span>
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px' }}>أصلي ولا تركي؟ هنقولك الفرق 🤖</h2>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: 0 }}>بالسعر والجودة والضمان — بكل صراحة بدون دعاية</p>
              </div>
            </div>

            {/* Part selector */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
              {AI_PARTS.map((p, i) => (
                <button key={i} className="pill-btn" onClick={() => handlePartChange(i)} style={{
                  padding: '8px 20px', background: aiPart === i ? 'rgba(176,110,247,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${aiPart === i ? '#B06EF7' : 'rgba(255,255,255,0.1)'}`,
                  color: aiPart === i ? '#B06EF7' : 'rgba(255,255,255,0.45)', fontWeight: 700, fontSize: 13,
                }}>
                  {p.name}
                </button>
              ))}
            </div>

            {/* Comparison card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'start', maxWidth: 860, margin: '0 auto', animation: showAiResult ? 'slideUp 0.35s ease' : 'none' }}>

              {/* Original */}
              <div style={{ background: 'rgba(0,229,208,0.05)', border: '1.5px solid rgba(0,229,208,0.2)', borderRadius: 22, padding: 26 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div>
                    <div style={{ color: '#00E5D0', fontSize: 11, fontWeight: 700, marginBottom: 3 }}>✅ أصلي</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{part.origBrand}</div>
                  </div>
                  {part.winner === 'orig' && <div style={{ background: '#00E5D0', color: '#080D18', fontSize: 10, fontWeight: 800, borderRadius: 999, padding: '3px 10px' }}>الأحسن</div>}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#00E5D0', marginBottom: 16 }}>{part.origPrice} <span style={{ fontSize: 14, fontWeight: 700 }}>ج.م</span></div>
                {/* Score bar */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700 }}>تقييم الجودة</span>
                    <span style={{ color: '#00E5D0', fontWeight: 800, fontSize: 12 }}>{part.origScore}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 999 }}>
                    <div style={{ height: '100%', width: `${part.origScore}%`, background: 'linear-gradient(90deg,#00E5D0,#0EA5E9)', borderRadius: 999, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
                {[['الضمان', '24 شهر'], ['المصدر', 'أوروبا'], ['مناسب لـ', 'كل السيارات']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{k}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* VS */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 40 }}>
                <ArrowLeftRight size={20} color="rgba(255,255,255,0.2)" />
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 800 }}>مقارنة</span>
                <div style={{ background: 'rgba(176,110,247,0.1)', border: '1px solid rgba(176,110,247,0.2)', borderRadius: 999, padding: '4px 10px' }}>
                  <Sparkles size={11} color="#B06EF7" />
                </div>
              </div>

              {/* Turkish */}
              <div style={{ background: 'rgba(176,110,247,0.05)', border: '1.5px solid rgba(176,110,247,0.2)', borderRadius: 22, padding: 26 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div>
                    <div style={{ color: '#B06EF7', fontSize: 11, fontWeight: 700, marginBottom: 3 }}>🇹🇷 تركي</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{part.turkBrand}</div>
                  </div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#B06EF7', marginBottom: 16 }}>{part.turkPrice} <span style={{ fontSize: 14, fontWeight: 700 }}>ج.م</span></div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700 }}>تقييم الجودة</span>
                    <span style={{ color: '#B06EF7', fontWeight: 800, fontSize: 12 }}>{part.turkScore}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 999 }}>
                    <div style={{ height: '100%', width: `${part.turkScore}%`, background: 'linear-gradient(90deg,#B06EF7,#7C3AED)', borderRadius: 999, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
                {[['الضمان', '12 شهر'], ['المصدر', 'تركيا'], ['مناسب لـ', 'السيارات +5 سنين']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{k}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI recommendation */}
            {showAiResult && (
              <div style={{ maxWidth: 860, margin: '20px auto 0', background: 'rgba(176,110,247,0.06)', border: '1px solid rgba(176,110,247,0.2)', borderRadius: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, animation: 'slideUp 0.35s ease' }}>
                <Sparkles size={16} color="#B06EF7" style={{ flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 700, lineHeight: 1.5 }}>
                  <strong style={{ color: '#B06EF7' }}>الذكاء الاصطناعي:</strong> لو سيارتك أقل من 5 سنين خد الأصلي — الفرق في الجودة يستاهل فلوسه. لو أكبر، التركي كافي وهيوفر عليك {part.origPrice - part.turkPrice} ج.م.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ═══ WORKSHOPS ═══ */}
        <section style={{ padding: '64px 28px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px' }}>ورشنا في الإسكندرية</h2>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>كل ورشة اتاختارت بمعايير صارمة — مش أي حد بيدخل معانا</p>
              </div>
              <button style={{ color: '#00E5D0', background: 'none', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                كل الورش <ChevronLeft size={15} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
              {WORKSHOPS.map(w => (
                <div key={w.name} className="card-hover" style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${w.accent}18`, background: 'rgba(255,255,255,0.025)', cursor: 'pointer' }}>
                  {/* Photo placeholder with neon accent */}
                  <div style={{ height: 110, background: `linear-gradient(145deg, rgba(8,13,24,0.9), ${w.accent}18)`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `2px solid ${w.accent}40`, position: 'relative' }}>
                    <Building2 size={36} color={`${w.accent}50`} />
                    <div style={{ position: 'absolute', bottom: -12, right: 14, background: '#080D18', border: `1px solid ${w.accent}40`, borderRadius: 999, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Star size={11} color={w.accent} fill={w.accent} />
                      <span style={{ color: w.accent, fontSize: 12, fontWeight: 800 }}>{w.rating}</span>
                    </div>
                  </div>
                  <div style={{ padding: '20px 16px 16px' }}>
                    <h4 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: '0 0 5px' }}>{w.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                      <MapPin size={11} color="rgba(255,255,255,0.3)" />
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 700 }}>{w.area}</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 700 }}>{w.jobs.toLocaleString()} سيارة اتصلحت</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA: Join as workshop */}
            <div style={{ marginTop: 32, background: 'rgba(255,122,61,0.06)', border: '1px dashed rgba(255,122,61,0.25)', borderRadius: 18, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>عندك ورشة في الإسكندرية؟ 🔧</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>انضم لشبكتنا واحصل على عملاء مضمونين كل يوم</div>
              </div>
              <button className="pill-btn" style={{ background: 'rgba(255,122,61,0.12)', border: '1.5px solid rgba(255,122,61,0.35)', color: '#FF7A3D', padding: '10px 24px', fontWeight: 800, fontSize: 14 }}>
                انضم كورشة شريكة
              </button>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer style={{ background: '#04080F', borderTop: '1px solid rgba(0,229,208,0.08)', padding: '48px 28px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#00E5D0,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wrench size={17} color="#04080F" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>رينو بارتس</div>
                  <div style={{ color: '#00E5D0', fontSize: 9, letterSpacing: 2, fontWeight: 700 }}>ALEXANDRIA</div>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, lineHeight: 1.75, maxWidth: 260, fontWeight: 300 }}>المنصة الأولى بين مراكز قطع غيار رينو والورش المعتمدة في الإسكندرية. باكدج واحد يشمل كل حاجة.</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Phone size={13} color="#00E5D0" />
                <span style={{ color: '#00E5D0', fontWeight: 800, fontSize: 13 }}>01000000000</span>
              </div>
            </div>
            {[
              { title: 'الخدمات', items: ['الباكدجات', 'قطع غيار أصلية', 'قطع تركي', 'مقارنة بالذكاء الاصطناعي'] },
              { title: 'الشركة', items: ['ازاي بنشتغل', 'انضم كورشة', 'انضم كمورد', 'تواصل معنا'] },
              { title: 'مناطق الإسكندرية', items: ['المنتزه', 'سيدي جابر', 'العجمي', 'الميناء'] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 700, fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>{col.title}</p>
                {col.items.map(i => <div key={i} style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginBottom: 10, cursor: 'pointer', fontWeight: 300 }}>{i}</div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>© 2026 رينو بارتس الإسكندرية</span>
            <div style={{ display: 'flex', gap: 5 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={11} color="#FF7A3D" fill="#FF7A3D" />)}
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginRight: 6 }}>4.9 من 1,247 تقييم</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
