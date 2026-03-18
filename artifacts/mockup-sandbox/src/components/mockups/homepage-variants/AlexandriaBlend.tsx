import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Wrench, ShieldCheck, Star, MapPin, ChevronLeft, ChevronDown,
  Zap, Droplets, Wind, Settings, Disc, Battery, Package,
  Building2, Gift, Sparkles, CheckCircle2, BadgeCheck,
  ArrowLeftRight, Plus, Minus, Layers
} from 'lucide-react';

/* ─── STYLES ─────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0E1620;
    --bg2:      #121C2C;
    --bg3:      #17243A;
    --gold:     #C8974A;
    --gold-lt:  #E2B96F;
    --sky:      #5BB8D4;
    --sky-lt:   #87CFDE;
    --lav:      #8B7FC7;
    --lav-lt:   #A89ED8;
    --sage:     #4BAD8C;
    --coral:    #C06B5A;
    --text:     #C8D8E8;
    --text-dim: #637A90;
    --border:   rgba(255,255,255,0.07);
    --card:     rgba(255,255,255,0.04);
  }

  @keyframes waveFloat {
    0%   { transform: translateY(0px) rotate(0deg) scale(1); }
    33%  { transform: translateY(-14px) rotate(1.5deg) scale(1.03); }
    66%  { transform: translateY(-6px) rotate(-1deg) scale(0.98); }
    100% { transform: translateY(0px) rotate(0deg) scale(1); }
  }
  @keyframes waveFloat2 {
    0%   { transform: translateY(0px) rotate(0deg); }
    40%  { transform: translateY(-18px) rotate(-2deg); }
    70%  { transform: translateY(-4px) rotate(1.5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  @keyframes blobPulse {
    0%,100% { transform: scale(1) translate(0,0); border-radius: 60% 40% 70% 30% / 50% 60% 40% 70%; }
    25%     { transform: scale(1.06) translate(-15px,10px); border-radius: 40% 60% 30% 70% / 60% 40% 70% 30%; }
    50%     { transform: scale(0.96) translate(12px,-8px); border-radius: 70% 30% 60% 40% / 30% 70% 40% 60%; }
    75%     { transform: scale(1.04) translate(-5px,14px); border-radius: 30% 70% 40% 60% / 70% 30% 60% 40%; }
  }
  @keyframes blobPulse2 {
    0%,100% { transform: scale(1) translate(0,0); border-radius: 40% 60% 50% 50% / 60% 40% 60% 40%; }
    33%     { transform: scale(1.08) translate(20px,-12px); border-radius: 60% 40% 40% 60% / 40% 60% 50% 50%; }
    66%     { transform: scale(0.94) translate(-10px,18px); border-radius: 50% 50% 60% 40% / 50% 50% 40% 60%; }
  }
  @keyframes dashFlow {
    to { stroke-dashoffset: -32; }
  }
  @keyframes glowPulse {
    0%,100% { opacity:.5; }
    50%     { opacity:1; }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes particleFloat {
    0%,100% { transform: translateY(0) translateX(0); opacity:.4; }
    50%     { transform: translateY(-20px) translateX(8px); opacity:.8; }
  }
  @keyframes shimmer {
    0%   { background-position:-400px 0; }
    100% { background-position: 400px 0; }
  }
  .pill {
    font-family: 'Almarai', sans-serif;
    border-radius: 999px;
    cursor: pointer;
    transition: all .25s cubic-bezier(.34,1.56,.64,1);
    border: none;
    outline: none;
  }
  .pill:hover { transform: translateY(-2px) scale(1.04); }
  .card3d {
    transition: transform .15s ease, box-shadow .15s ease;
    transform-style: preserve-3d;
  }
  .part-piece {
    font-family:'Almarai',sans-serif;
    transition: all .25s cubic-bezier(.34,1.56,.64,1);
    cursor:pointer;
  }
  .part-piece:hover { transform: translateY(-3px) scale(1.03); }
`;

/* ─── DATA ─────────────────────────────────────────────────────── */
const SERVICES = [
  { icon: Droplets, label: 'تغيير زيت', color: 'var(--gold)' },
  { icon: Disc,     label: 'فرامل', color: 'var(--sky)' },
  { icon: Wind,     label: 'فلتر هواء', color: 'var(--lav)' },
  { icon: Zap,      label: 'كهرباء', color: 'var(--gold-lt)' },
  { icon: Settings, label: 'عفشة وتروس', color: 'var(--sage)' },
  { icon: Wrench,   label: 'عمرة شاملة', color: 'var(--sky-lt)' },
];

const READY_PACKAGES = [
  {
    id: 'km20',
    name: 'صيانة ٢٠ألف كم',
    subtitle: 'أول صيانة',
    price: 1299,
    includes: ['زيت + فلتر زيت', 'فلتر هواء', 'فحص الفرامل', 'ضبط الإطارات'],
    gift: 'ملصق رينو الرسمي',
    color: 'var(--sky)',
  },
  {
    id: 'km40',
    name: 'صيانة ٤٠ألف كم',
    subtitle: 'الأكثر طلباً ⭐',
    price: 2299,
    includes: ['كل خدمات ٢٠ك', 'شمعات الإشعال', 'ترموستات + كاوتش', 'فحص كهرباء كامل'],
    gift: 'فرشاة عجلات احترافية',
    color: 'var(--gold)',
  },
  {
    id: 'km60',
    name: 'صيانة ٦٠ألف كم',
    subtitle: 'الشاملة الكاملة 🔥',
    price: 3999,
    includes: ['كل خدمات ٤٠ك', 'سير التوقيت', 'مضخة الماء', 'فحص التروس', '+٤ خدمات'],
    gift: 'فلتر هواء مجاناً (قيمة 95 ج.م)',
    color: 'var(--lav)',
  },
];

const PUZZLE_PARTS = [
  { id: 'oil',     icon: Droplets, label: 'زيت موبيل ١ أصلي',      price: 320, cat: 'سوائل' },
  { id: 'oil_f',   icon: Settings,  label: 'فلتر زيت',              price: 95,  cat: 'سوائل' },
  { id: 'air_f',   icon: Wind,      label: 'فلتر هواء',             price: 95,  cat: 'فلاتر' },
  { id: 'cabin_f', icon: Wind,      label: 'فلتر كابينة',           price: 75,  cat: 'فلاتر' },
  { id: 'brakes',  icon: Disc,      label: 'طقم فرامل أمامي',       price: 680, cat: 'فرامل' },
  { id: 'pads',    icon: Disc,      label: 'تيل فرامل خلفي',        price: 420, cat: 'فرامل' },
  { id: 'spark',   icon: Zap,       label: 'طقم شمعات إشعال',       price: 320, cat: 'كهرباء' },
  { id: 'bat',     icon: Battery,   label: 'بطارية ٦٠ أمبير',       price: 850, cat: 'كهرباء' },
  { id: 'tie',     icon: Settings,  label: 'روبير كفرات',           price: 180, cat: 'عفشة' },
  { id: 'mount',   icon: Settings,  label: 'مساعد أمامي واحد',      price: 550, cat: 'عفشة' },
];

const GIFT_TIERS = [
  { min: 0,    max: 499,  gift: null,                   icon: '—' },
  { min: 500,  max: 1499, gift: 'فرشاة عجلات',          icon: '🎁' },
  { min: 1500, max: 2999, gift: 'فلتر هواء مجاناً',    icon: '🎁' },
  { min: 3000, max: Infinity, gift: 'ستالايت رينو + فلتر هواء', icon: '🎁🎁' },
];

const AI_PARTS_DATA = [
  { name: 'زيت موبيل', origP: 320, turkP: 160, origBrand: 'Mobil 1 — ألمانيا', turkBrand: 'Selenia — تركيا', origScore: 97, turkScore: 73 },
  { name: 'فرامل Brembo', origP: 680, turkP: 320, origBrand: 'Brembo — إيطاليا', turkBrand: 'Beral — تركيا', origScore: 96, turkScore: 79 },
  { name: 'فلتر زيت', origP: 95, turkP: 48, origBrand: 'Renault Original', turkBrand: 'Knecht — تركيا', origScore: 99, turkScore: 83 },
];

const WORKSHOPS = [
  { name: 'ورشة الميناء',      area: 'الميناء',     rating: 4.9, jobs: 847,  color: 'var(--sky)' },
  { name: 'سنتر المنتزه',      area: 'المنتزه',     rating: 4.8, jobs: 1204, color: 'var(--gold)' },
  { name: 'ورشة العجمي',       area: 'العجمي',      rating: 4.7, jobs: 632,  color: 'var(--lav)' },
  { name: 'سنتر سيدي جابر',   area: 'سيدي جابر',   rating: 4.9, jobs: 980,  color: 'var(--sage)' },
];

/* ─── SUB COMPONENTS ──────────────────────────────────────────── */
function FluidHeroBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Blobs */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-8%',
        width: 600, height: 600,
        background: 'radial-gradient(circle at 40% 40%, rgba(91,184,212,0.12) 0%, rgba(91,184,212,0.04) 50%, transparent 70%)',
        animation: 'blobPulse 9s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-5%',
        width: 500, height: 500,
        background: 'radial-gradient(circle at 60% 60%, rgba(200,151,74,0.1) 0%, rgba(200,151,74,0.03) 50%, transparent 70%)',
        animation: 'blobPulse2 11s ease-in-out infinite 2s',
      }} />
      <div style={{
        position: 'absolute', top: '35%', left: '30%',
        width: 350, height: 350,
        background: 'radial-gradient(circle at 50% 50%, rgba(139,127,199,0.08) 0%, transparent 65%)',
        animation: 'blobPulse 13s ease-in-out infinite 4s',
      }} />
      {/* Floating particles */}
      {[
        { top:'15%', right:'22%', color:'var(--gold)', delay:'0s', size:4 },
        { top:'45%', right:'8%',  color:'var(--sky)',  delay:'1.5s', size:3 },
        { top:'70%', right:'35%', color:'var(--lav)',  delay:'3s', size:5 },
        { top:'25%', left:'15%',  color:'var(--sage)', delay:'0.8s', size:3 },
        { top:'60%', left:'8%',   color:'var(--gold)', delay:'2.2s', size:4 },
      ].map((p, i) => (
        <div key={i} style={{
          position:'absolute', top:p.top, right: p.right, left: p.left,
          width: p.size, height: p.size, borderRadius:'50%', background: p.color,
          boxShadow: `0 0 8px ${p.color}`,
          animation: `particleFloat ${4 + i}s ease-in-out infinite ${p.delay}`,
        }} />
      ))}
      {/* Subtle grid */}
      {[...Array(7)].map((_,i) => (
        <div key={i} style={{ position:'absolute', top:0, bottom:0, left:`${i*16.6}%`, width:1, background:'rgba(255,255,255,0.025)' }} />
      ))}
      {[...Array(5)].map((_,i) => (
        <div key={i} style={{ position:'absolute', right:0, left:0, top:`${i*25}%`, height:1, background:'rgba(255,255,255,0.02)' }} />
      ))}
    </div>
  );
}

function Card3D({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width  - 0.5;
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;
    setRot({ x: -cy * 12, y: cx * 12 });
  }, []);

  return (
    <div
      ref={ref}
      className="card3d"
      onMouseMove={onMove}
      onMouseLeave={() => setRot({ x: 0, y: 0 })}
      style={{
        ...style,
        transform: `perspective(900px) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
        boxShadow: `${rot.y * -1.5}px ${rot.x * 1.5}px 40px rgba(0,0,0,0.35)`,
      }}
    >
      {children}
    </div>
  );
}

function NeonDiagram() {
  return (
    <div style={{ position: 'relative', height: 240 }}>
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible' }}>
        <defs>
          <filter id="f-sky"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="f-gold"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="f-lav"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <line x1="50%" y1="47%" x2="18%" y2="14%" stroke="#5BB8D4" strokeWidth="1.5" strokeOpacity=".6" strokeDasharray="8,6" style={{animation:'dashFlow 1.8s linear infinite'}} filter="url(#f-sky)" />
        <line x1="50%" y1="47%" x2="82%" y2="14%" stroke="#C8974A" strokeWidth="1.5" strokeOpacity=".6" strokeDasharray="8,6" style={{animation:'dashFlow 2.2s linear infinite'}} filter="url(#f-gold)" />
        <line x1="50%" y1="47%" x2="50%" y2="90%" stroke="#8B7FC7" strokeWidth="1.5" strokeOpacity=".6" strokeDasharray="8,6" style={{animation:'dashFlow 2s linear infinite'}} filter="url(#f-lav)" />
      </svg>

      {/* Center */}
      <div style={{ position:'absolute', top:'47%', left:'50%', transform:'translate(-50%,-50%)', width:84, height:84, borderRadius:'50%', background:'rgba(91,184,212,0.08)', border:'2px solid rgba(91,184,212,0.35)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:3, boxShadow:'0 0 28px rgba(91,184,212,0.18)', animation:'glowPulse 3s ease-in-out infinite' }}>
        <Wrench size={20} color="#5BB8D4" />
        <span style={{ color:'#5BB8D4', fontSize:10, fontWeight:800, marginTop:5, textAlign:'center', lineHeight:1.2 }}>رينو<br/>بارتس</span>
      </div>

      {[
        { label:'مراكز القطع', sub:'أصلي + تركي', Icon:Package, color:'#5BB8D4', top:'0%', left:'0%' },
        { label:'ورش التركيب', sub:'32 ورشة',    Icon:Building2, color:'#C8974A', top:'0%', right:'0%' },
        { label:'عميل + ضمان', sub:'ادفع لينا',  Icon:BadgeCheck, color:'#8B7FC7', bottom:'0%', left:'50%', transform:'translateX(-50%)' },
      ].map((n,i) => (
        <div key={i} style={{ position:'absolute', top:n.top, left:n.left, right:n.right, bottom:n.bottom, transform:n.transform, background:`${n.color}0A`, border:`1px solid ${n.color}25`, borderRadius:14, padding:'10px 12px', textAlign:'center', minWidth:100 }}>
          <n.Icon size={16} color={n.color} style={{ margin:'0 auto 5px', display:'block' }} />
          <div style={{ color:n.color, fontSize:11, fontWeight:800 }}>{n.label}</div>
          <div style={{ color:'rgba(255,255,255,0.3)', fontSize:9, marginTop:2 }}>{n.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export function AlexandriaBlend() {
  const [activeService, setActiveService] = useState<number|null>(null);
  const [readyPkg, setReadyPkg] = useState('km40');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [aiIdx, setAiIdx] = useState(0);
  const [aiReady, setAiReady] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const total = [...selected].reduce((s, id) => {
    const p = PUZZLE_PARTS.find(x => x.id === id);
    return s + (p?.price ?? 0);
  }, 0);

  const currentGift = [...GIFT_TIERS].reverse().find(t => total >= t.min) ?? GIFT_TIERS[0];
  const nextGift = GIFT_TIERS.find(t => t.min > total);
  const rPkg = READY_PACKAGES.find(p => p.id === readyPkg)!;
  const aiPart = AI_PARTS_DATA[aiIdx];

  const togglePart = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  useEffect(() => {
    setAiReady(false);
    const t = setTimeout(() => setAiReady(true), 400);
    return () => clearTimeout(t);
  }, [aiIdx]);

  return (
    <>
      <style>{STYLES}</style>
      <div dir="rtl" style={{ fontFamily:"'Almarai','Cairo',sans-serif", background:'var(--bg)', color:'var(--text)', minHeight:'100vh' }}>

        {/* ═══ NAV ═══ */}
        <nav style={{ position:'sticky', top:0, zIndex:99, background:'rgba(14,22,32,0.94)', backdropFilter:'blur(24px)', borderBottom:'1px solid var(--border)' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 28px', height:64, display:'flex', alignItems:'center', gap:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,var(--sky),var(--lav))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 16px rgba(91,184,212,0.3)' }}>
                <Wrench size={18} color="#0E1620" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:17, lineHeight:1, color:'#E8F0F8' }}>رينو بارتس</div>
                <div style={{ color:'var(--sky)', fontSize:9, fontWeight:700, letterSpacing:2 }}>ALEXANDRIA</div>
              </div>
            </div>

            <div style={{ flex:1, position:'relative' }}>
              <Search size={15} color="var(--text-dim)" style={{ position:'absolute', top:'50%', right:14, transform:'translateY(-50%)', pointerEvents:'none' }} />
              <input value={searchVal} onChange={e=>setSearchVal(e.target.value)}
                placeholder="دور على قطعة أو خدمة... مثال: فلتر زيت رينو كليو"
                style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:999, padding:'9px 42px 9px 18px', color:'var(--text)', fontSize:13, fontFamily:"'Almarai',sans-serif", outline:'none' }}
                onFocus={e=>{e.target.style.borderColor='rgba(91,184,212,0.45)'}}
                onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.09)'}}
              />
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:20, flexShrink:0 }}>
              {['الباكدجات','قطع الغيار','الورش'].map(n=>(
                <span key={n} style={{ color:'var(--text-dim)', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', transition:'color .2s' }}
                  onMouseEnter={e=>(e.currentTarget.style.color='var(--text)')}
                  onMouseLeave={e=>(e.currentTarget.style.color='var(--text-dim)')}
                >{n}</span>
              ))}
              <button className="pill" style={{ background:'var(--sky)', color:'var(--bg)', padding:'8px 20px', fontWeight:800, fontSize:13, boxShadow:'0 4px 16px rgba(91,184,212,0.25)' }}>
                احجز دلوقتي
              </button>
            </div>
          </div>
        </nav>

        {/* ═══ HERO ═══ */}
        <section style={{ position:'relative', padding:'72px 28px 60px', overflow:'hidden' }}>
          <FluidHeroBackground />
          <div style={{ maxWidth:1280, margin:'0 auto', position:'relative', display:'grid', gridTemplateColumns:'1.15fr 0.85fr', gap:56, alignItems:'center' }}>

            {/* Left */}
            <div style={{ animation:'fadeUp .7s ease both' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(91,184,212,0.08)', border:'1px solid rgba(91,184,212,0.18)', borderRadius:999, padding:'5px 16px', marginBottom:28 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--sky)', boxShadow:'0 0 8px var(--sky)', animation:'glowPulse 2s infinite' }} />
                <span style={{ color:'var(--sky)', fontSize:12, fontWeight:700 }}>منصة قطع الغيار الأولى — الإسكندرية</span>
              </div>

              <h1 style={{ fontSize:50, fontWeight:800, lineHeight:1.25, letterSpacing:-0.5, marginBottom:18, color:'#E8F0F8' }}>
                مش بنبيع قطع —<br/>
                <span style={{ background:'linear-gradient(130deg,var(--gold),var(--gold-lt),var(--sky))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  بنبيع باكدج كامل.
                </span>
              </h1>
              <p style={{ color:'var(--text-dim)', fontSize:15, lineHeight:1.85, marginBottom:10, maxWidth:480 }}>
                زي أوبر — إحنا الوسيط بين مراكز قطع الغيار وورش التركيب المعتمدة في الإسكندرية.
              </p>
              <p style={{ color:'rgba(99,122,144,0.7)', fontSize:13, lineHeight:1.8, marginBottom:40, maxWidth:460 }}>
                إنت بتدفع لينا مرة واحدة، إحنا بنجيب القطعة — أصلي أو تركي وانت اللي بتختار — وبنبعتلك الورشة الأقرب. الضمان على القطعة <em>والتركيب</em> علينا إحنا.
              </p>

              <p style={{ color:'var(--text-dim)', fontSize:11, fontWeight:700, marginBottom:14, letterSpacing:1 }}>ابدأ من اللي محتاجه:</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:9 }}>
                {SERVICES.map((s,i) => {
                  const on = activeService===i;
                  return (
                    <button key={i} className="pill" onClick={()=>setActiveService(on?null:i)} style={{
                      padding:'9px 20px', background: on ? `${s.color}18` : 'rgba(255,255,255,0.04)',
                      border:`1.5px solid ${on ? s.color : 'rgba(255,255,255,0.09)'}`,
                      color: on ? s.color : 'var(--text-dim)', fontSize:13, fontWeight:700,
                      boxShadow: on ? `0 0 14px ${s.color}30` : 'none',
                    }}>
                      <s.icon size={13} style={{ marginLeft:6, display:'inline', verticalAlign:'middle' }} />
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {activeService !== null && (
                <div style={{ marginTop:18, animation:'fadeUp .3s ease', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <span style={{ color:'var(--text)', fontSize:13, fontWeight:700, lineHeight:1.5 }}>
                    عندنا باكدج بيشمل <strong style={{ color: SERVICES[activeService].color }}>{SERVICES[activeService].label}</strong> — قطعة + تركيب + ضمان
                  </span>
                  <button className="pill" style={{ background: SERVICES[activeService].color, color:'var(--bg)', padding:'7px 16px', fontWeight:800, fontSize:12, flexShrink:0 }}>
                    اختار الباكدج
                  </button>
                </div>
              )}

              <div style={{ display:'flex', gap:32, marginTop:40, paddingTop:28, borderTop:'1px solid var(--border)' }}>
                {[['1,247+','عميل تخدم'],['4.9 ★','تقييم'],['32','ورشة شريكة']].map(([n,l])=>(
                  <div key={l}>
                    <div style={{ fontSize:22, fontWeight:800, color:'var(--gold)' }}>{n}</div>
                    <div style={{ fontSize:11, color:'var(--text-dim)', fontWeight:700, marginTop:3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — 3D card */}
            <div style={{ animation:'waveFloat 7s ease-in-out infinite' }}>
              <Card3D style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:28, padding:30, overflow:'hidden', position:'relative' }}>
                <div style={{ position:'absolute', top:0, right:0, width:130, height:130, background:'radial-gradient(circle at top right, rgba(91,184,212,0.1), transparent)', borderRadius:'0 28px 0 100%', pointerEvents:'none' }} />
                <p style={{ color:'var(--text-dim)', fontSize:11, fontWeight:700, letterSpacing:2, textAlign:'center', marginBottom:24 }}>كيف بنشتغل</p>
                <NeonDiagram />
                <div style={{ marginTop:20, background:'rgba(91,184,212,0.05)', border:'1px solid rgba(91,184,212,0.14)', borderRadius:12, padding:'11px 14px', display:'flex', gap:10, alignItems:'center' }}>
                  <ShieldCheck size={15} color="var(--sky)" style={{ flexShrink:0 }} />
                  <span style={{ color:'var(--text-dim)', fontSize:12, fontWeight:700, lineHeight:1.4 }}>الضمان على القطعة <strong style={{ color:'var(--sky)' }}>والتركيب</strong> — ادفع مرة وخليك مطمن</span>
                </div>
              </Card3D>
            </div>
          </div>
        </section>

        {/* ═══ PACKAGES — Ready ═══ */}
        <section style={{ padding:'64px 28px', borderTop:'1px solid var(--border)' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              <h2 style={{ fontSize:30, fontWeight:800, color:'#E8F0F8', marginBottom:8 }}>باكدجات جاهزة حسب الصيانة 🛠️</h2>
              <p style={{ color:'var(--text-dim)', fontSize:14 }}>اختار باكدج جاهز على حسب كيلومترات سيارتك — أو ابني باكدجك الخاص أدناه</p>
            </div>

            {/* Tab selector */}
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:36, flexWrap:'wrap' }}>
              {READY_PACKAGES.map(p => {
                const on = readyPkg===p.id;
                return (
                  <button key={p.id} className="pill" onClick={()=>setReadyPkg(p.id)} style={{
                    padding:'10px 24px', background: on ? `${p.color}14` : 'var(--card)',
                    border:`1.5px solid ${on ? p.color : 'rgba(255,255,255,0.09)'}`,
                    color: on ? p.color : 'var(--text-dim)', fontWeight:800, fontSize:14,
                    boxShadow: on ? `0 0 20px ${p.color}20` : 'none',
                  }}>
                    {p.name}
                    <span style={{ display:'block', fontSize:9, opacity:.7, fontWeight:700, marginTop:2 }}>{p.subtitle}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ maxWidth:580, margin:'0 auto', background:`linear-gradient(150deg, ${rPkg.color}08, rgba(14,22,32,0.8))`, border:`1.5px solid ${rPkg.color}25`, borderRadius:26, padding:34, animation:'fadeUp .3s ease', boxShadow:`0 16px 50px ${rPkg.color}12` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
                <div>
                  <h3 style={{ fontSize:22, fontWeight:800, color:'#E8F0F8', marginBottom:8 }}>{rPkg.name}</h3>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:`${rPkg.color}12`, border:`1px solid ${rPkg.color}28`, borderRadius:999, padding:'5px 14px' }}>
                    <Gift size={13} color={rPkg.color} />
                    <span style={{ color:rPkg.color, fontSize:12, fontWeight:700 }}>هديتك: {rPkg.gift}</span>
                  </div>
                </div>
                <div style={{ textAlign:'left' }}>
                  <div style={{ color:rPkg.color, fontSize:36, fontWeight:800, lineHeight:1 }}>{rPkg.price.toLocaleString()}</div>
                  <div style={{ color:'var(--text-dim)', fontSize:12, fontWeight:700 }}>ج.م شامل التركيب</div>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:22 }}>
                {rPkg.includes.map(s => (
                  <div key={s} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <CheckCircle2 size={13} color={rPkg.color} style={{ flexShrink:0 }} />
                    <span style={{ color:'var(--text)', fontSize:12, fontWeight:700 }}>{s}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:9, marginBottom:16 }}>
                {[['نوع القطعة','أصلي (افتراضي)','var(--sky)'],['الضمان','12 شهر','var(--lav)']].map(([k,v,c])=>(
                  <div key={k} style={{ flex:1, background:'var(--card)', borderRadius:12, padding:'10px 14px', textAlign:'center', border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:10, color:'var(--text-dim)', fontWeight:700, marginBottom:3 }}>{k}</div>
                    <div style={{ fontSize:12, fontWeight:800, color:c }}>{v}</div>
                  </div>
                ))}
              </div>

              <button className="pill" style={{ width:'100%', background:`linear-gradient(135deg,${rPkg.color},${rPkg.color}cc)`, color:'var(--bg)', border:'none', padding:'13px', fontWeight:800, fontSize:15, boxShadow:`0 8px 24px ${rPkg.color}30` }}>
                احجز الباكدج + استلم الهدية <ChevronLeft size={17} style={{ display:'inline', verticalAlign:'middle' }} />
              </button>
            </div>
          </div>
        </section>

        {/* ═══ PUZZLE BUILDER ═══ */}
        <section style={{ padding:'64px 28px', background:'var(--bg2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(200,151,74,0.1)', border:'1px solid rgba(200,151,74,0.2)', borderRadius:999, padding:'5px 16px', marginBottom:14 }}>
                <Layers size={13} color="var(--gold)" />
                <span style={{ color:'var(--gold)', fontSize:12, fontWeight:700 }}>ابني باكدجك بنفسك</span>
              </div>
              <h2 style={{ fontSize:28, fontWeight:800, color:'#E8F0F8', marginBottom:8 }}>البازل — اختار قطعك بنفسك 🧩</h2>
              <p style={{ color:'var(--text-dim)', fontSize:14 }}>اختار اللي عايزه وهنجمعلك الباكدج — وعلى حسب القيمة بتاعتك هتاخد هدية</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:32, alignItems:'start' }}>
              {/* Parts grid */}
              <div>
                {/* Category groups */}
                {['سوائل','فلاتر','فرامل','كهرباء','عفشة'].map(cat => {
                  const parts = PUZZLE_PARTS.filter(p=>p.cat===cat);
                  return (
                    <div key={cat} style={{ marginBottom:24 }}>
                      <p style={{ color:'var(--text-dim)', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:12 }}>{cat}</p>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
                        {parts.map(p => {
                          const on = selected.has(p.id);
                          return (
                            <div key={p.id} className="part-piece" onClick={()=>togglePart(p.id)} style={{
                              background: on ? 'rgba(200,151,74,0.08)' : 'var(--card)',
                              border:`1.5px solid ${on ? 'rgba(200,151,74,0.4)' : 'rgba(255,255,255,0.07)'}`,
                              borderRadius:16, padding:'14px 16px', display:'flex', alignItems:'center', gap:12,
                              boxShadow: on ? '0 0 18px rgba(200,151,74,0.12)' : 'none',
                            }}>
                              <div style={{ width:38, height:38, borderRadius:12, background: on ? 'rgba(200,151,74,0.15)' : 'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background .25s' }}>
                                <p.icon size={17} color={on ? 'var(--gold)' : 'var(--text-dim)'} />
                              </div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:12, fontWeight:700, color: on ? '#E8F0F8' : 'var(--text)', marginBottom:2 }}>{p.label}</div>
                                <div style={{ fontSize:12, fontWeight:800, color: on ? 'var(--gold)' : 'var(--text-dim)' }}>{p.price} ج.م</div>
                              </div>
                              <div style={{ width:22, height:22, borderRadius:'50%', background: on ? 'var(--gold)' : 'rgba(255,255,255,0.06)', border:`1.5px solid ${on ? 'var(--gold)' : 'rgba(255,255,255,0.12)'}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .25s', flexShrink:0 }}>
                                {on ? <Minus size={11} color="var(--bg)" /> : <Plus size={11} color="var(--text-dim)" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary sidebar */}
              <div style={{ position:'sticky', top:80 }}>
                <div style={{ background:'var(--bg3)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:22, padding:24 }}>
                  <h4 style={{ fontSize:16, fontWeight:800, color:'#E8F0F8', marginBottom:20 }}>ملخص الباكدج</h4>

                  {/* Gift progress */}
                  <div style={{ marginBottom:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ color:'var(--text-dim)', fontSize:12, fontWeight:700 }}>إنت دلوقتي عند</span>
                      <span style={{ color:'var(--gold)', fontWeight:800, fontSize:14 }}>{total.toLocaleString()} ج.م</span>
                    </div>
                    {/* Tier progress bar */}
                    {[GIFT_TIERS[1],GIFT_TIERS[2],GIFT_TIERS[3]].map((tier,i)=>{
                      const pct = Math.min(100, (total/tier.min)*100);
                      const reached = total >= tier.min;
                      return (
                        <div key={i} style={{ marginBottom:10 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                            <span style={{ fontSize:11, color: reached ? 'var(--gold)':'var(--text-dim)', fontWeight:700 }}>{tier.icon} {tier.gift}</span>
                            <span style={{ fontSize:10, color:'var(--text-dim)', fontWeight:700 }}>{tier.min.toLocaleString()} ج.م</span>
                          </div>
                          <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:999 }}>
                            <div style={{ height:'100%', width:`${pct}%`, background: reached ? 'var(--gold)':'linear-gradient(90deg,var(--gold-lt),var(--gold))', borderRadius:999, transition:'width .5s ease', opacity: reached ? 1 : 0.6 }} />
                          </div>
                        </div>
                      );
                    })}
                    {nextGift && (
                      <p style={{ color:'var(--text-dim)', fontSize:11, fontWeight:700, marginTop:8 }}>
                        بعد {(nextGift.min - total).toLocaleString()} ج.م هتاخد: <strong style={{ color:'var(--gold)' }}>{nextGift.gift}</strong> {nextGift.icon}
                      </p>
                    )}
                    {currentGift.gift && (
                      <div style={{ background:'rgba(200,151,74,0.1)', border:'1px solid rgba(200,151,74,0.25)', borderRadius:12, padding:'10px 14px', marginTop:12, display:'flex', gap:9, alignItems:'center' }}>
                        <Gift size={14} color="var(--gold)" />
                        <span style={{ color:'var(--gold)', fontSize:12, fontWeight:700 }}>هديتك: {currentGift.gift}</span>
                      </div>
                    )}
                  </div>

                  {/* Selected list */}
                  <div style={{ maxHeight:200, overflowY:'auto', marginBottom:16 }}>
                    {selected.size === 0 ? (
                      <p style={{ color:'rgba(99,122,144,0.5)', fontSize:13, textAlign:'center', padding:'20px 0', fontWeight:700 }}>اختار من القطع على الشمال</p>
                    ) : (
                      [...selected].map(id => {
                        const p = PUZZLE_PARTS.find(x=>x.id===id)!;
                        return (
                          <div key={id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                            <span style={{ color:'var(--text)', fontSize:12, fontWeight:700 }}>{p.label}</span>
                            <span style={{ color:'var(--gold)', fontSize:12, fontWeight:800 }}>{p.price} ج.م</span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {selected.size > 0 && (
                    <>
                      <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderTop:'2px solid var(--border)', marginBottom:12 }}>
                        <span style={{ color:'#E8F0F8', fontWeight:800, fontSize:15 }}>الإجمالي</span>
                        <span style={{ color:'var(--gold)', fontWeight:800, fontSize:18 }}>{total.toLocaleString()} ج.م</span>
                      </div>
                      <button className="pill" style={{ width:'100%', background:'linear-gradient(135deg,var(--gold),var(--gold-lt))', color:'var(--bg)', border:'none', padding:'12px', fontWeight:800, fontSize:14, boxShadow:'0 6px 20px rgba(200,151,74,0.25)' }}>
                        احجز الباكدج ده
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ AI COMPARISON ═══ */}
        <section style={{ padding:'64px 28px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36, flexWrap:'wrap', gap:20 }}>
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(139,127,199,0.1)', border:'1px solid rgba(139,127,199,0.22)', borderRadius:999, padding:'5px 14px', marginBottom:12 }}>
                  <Sparkles size={13} color="var(--lav)" />
                  <span style={{ color:'var(--lav)', fontSize:11, fontWeight:700 }}>مقارنة بالذكاء الاصطناعي</span>
                </div>
                <h2 style={{ fontSize:26, fontWeight:800, color:'#E8F0F8', marginBottom:4 }}>أصلي ولا تركي؟ 🤖 هنقولك</h2>
                <p style={{ color:'var(--text-dim)', fontSize:14 }}>بالسعر والجودة والضمان — بكل صراحة بدون دعاية</p>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginBottom:28, flexWrap:'wrap' }}>
              {AI_PARTS_DATA.map((p,i)=>(
                <button key={i} className="pill" onClick={()=>setAiIdx(i)} style={{
                  padding:'8px 20px', background: aiIdx===i ? 'rgba(139,127,199,0.1)' : 'var(--card)',
                  border:`1.5px solid ${aiIdx===i ? 'rgba(139,127,199,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: aiIdx===i ? 'var(--lav)' : 'var(--text-dim)', fontWeight:700, fontSize:13,
                }}>
                  {p.name}
                </button>
              ))}
            </div>

            {aiReady && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:16, alignItems:'start', maxWidth:820, margin:'0 auto', animation:'fadeUp .35s ease' }}>

                <div style={{ background:'rgba(91,184,212,0.05)', border:'1.5px solid rgba(91,184,212,0.18)', borderRadius:22, padding:26 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                    <div>
                      <div style={{ color:'var(--sky)', fontSize:11, fontWeight:700, marginBottom:3 }}>✅ أصلي</div>
                      <div style={{ fontSize:15, fontWeight:800, color:'#E8F0F8' }}>{aiPart.origBrand}</div>
                    </div>
                    <div style={{ background:'var(--sky)', color:'var(--bg)', fontSize:10, fontWeight:800, borderRadius:999, padding:'3px 10px' }}>موصى به</div>
                  </div>
                  <div style={{ fontSize:30, fontWeight:800, color:'var(--sky)', marginBottom:16 }}>{aiPart.origP} <span style={{ fontSize:14 }}>ج.م</span></div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ color:'var(--text-dim)', fontSize:11, fontWeight:700 }}>تقييم الجودة</span>
                      <span style={{ color:'var(--sky)', fontWeight:800, fontSize:12 }}>{aiPart.origScore}%</span>
                    </div>
                    <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:999 }}>
                      <div style={{ height:'100%', width:`${aiPart.origScore}%`, background:'linear-gradient(90deg,var(--sky),var(--sky-lt))', borderRadius:999 }} />
                    </div>
                  </div>
                  {[['الضمان','24 شهر'],['المصدر','أوروبا'],['مناسب لـ','كل السيارات']].map(([k,v])=>(
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', paddingTop:9, borderTop:'1px solid var(--border)' }}>
                      <span style={{ color:'var(--text-dim)', fontSize:12 }}>{k}</span>
                      <span style={{ color:'var(--text)', fontSize:12, fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, paddingTop:40 }}>
                  <ArrowLeftRight size={18} color="var(--text-dim)" />
                  <span style={{ color:'var(--text-dim)', fontSize:11, fontWeight:800 }}>VS</span>
                  <Sparkles size={14} color="var(--lav)" />
                </div>

                <div style={{ background:'rgba(139,127,199,0.05)', border:'1.5px solid rgba(139,127,199,0.18)', borderRadius:22, padding:26 }}>
                  <div style={{ marginBottom:18 }}>
                    <div style={{ color:'var(--lav)', fontSize:11, fontWeight:700, marginBottom:3 }}>🇹🇷 تركي</div>
                    <div style={{ fontSize:15, fontWeight:800, color:'#E8F0F8' }}>{aiPart.turkBrand}</div>
                  </div>
                  <div style={{ fontSize:30, fontWeight:800, color:'var(--lav)', marginBottom:16 }}>{aiPart.turkP} <span style={{ fontSize:14 }}>ج.م</span></div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ color:'var(--text-dim)', fontSize:11, fontWeight:700 }}>تقييم الجودة</span>
                      <span style={{ color:'var(--lav)', fontWeight:800, fontSize:12 }}>{aiPart.turkScore}%</span>
                    </div>
                    <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:999 }}>
                      <div style={{ height:'100%', width:`${aiPart.turkScore}%`, background:'linear-gradient(90deg,var(--lav),var(--lav-lt))', borderRadius:999 }} />
                    </div>
                  </div>
                  {[['الضمان','12 شهر'],['المصدر','تركيا'],['مناسب لـ','سيارات +5 سنين']].map(([k,v])=>(
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', paddingTop:9, borderTop:'1px solid var(--border)' }}>
                      <span style={{ color:'var(--text-dim)', fontSize:12 }}>{k}</span>
                      <span style={{ color:'var(--text)', fontSize:12, fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiReady && (
              <div style={{ maxWidth:820, margin:'18px auto 0', background:'rgba(139,127,199,0.06)', border:'1px solid rgba(139,127,199,0.18)', borderRadius:14, padding:'13px 18px', display:'flex', gap:10, alignItems:'center', animation:'fadeUp .4s ease' }}>
                <Sparkles size={14} color="var(--lav)" style={{ flexShrink:0 }} />
                <span style={{ color:'var(--text-dim)', fontSize:13, fontWeight:700, lineHeight:1.55 }}>
                  <strong style={{ color:'var(--lav)' }}>الذكاء الاصطناعي:</strong> لو سيارتك أقل من ٥ سنين — خد الأصلي. لو أكبر، التركي كافي وهيوفر عليك <strong style={{ color:'var(--gold)' }}>{(aiPart.origP - aiPart.turkP).toLocaleString()} ج.م</strong> مع ضمان ١٢ شهر.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ═══ WORKSHOPS ═══ */}
        <section style={{ padding:'64px 28px', background:'var(--bg2)', borderTop:'1px solid var(--border)' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:32 }}>
              <div>
                <h2 style={{ fontSize:26, fontWeight:800, color:'#E8F0F8', marginBottom:4 }}>ورشنا في الإسكندرية</h2>
                <p style={{ color:'var(--text-dim)', fontSize:14 }}>كل ورشة اتاختارت بمعايير — مش أي حد بيدخل معانا</p>
              </div>
              <button style={{ color:'var(--sky)', background:'none', border:'none', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}>
                كل الورش <ChevronLeft size={15} />
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
              {WORKSHOPS.map(w=>(
                <div key={w.name} style={{ borderRadius:18, overflow:'hidden', border:`1px solid rgba(255,255,255,0.06)`, background:'var(--card)', cursor:'pointer', transition:'transform .25s ease, box-shadow .25s ease' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow=`0 12px 32px rgba(0,0,0,0.2)`;}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform=''; (e.currentTarget as HTMLDivElement).style.boxShadow='';}}
                >
                  <div style={{ height:100, background:`linear-gradient(145deg,var(--bg3),${w.color}14)`, display:'flex', alignItems:'center', justifyContent:'center', borderBottom:`1px solid rgba(255,255,255,0.05)`, position:'relative' }}>
                    <Building2 size={34} color={`${w.color}40`} />
                    <div style={{ position:'absolute', bottom:-12, right:14, background:'var(--bg)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:999, padding:'3px 10px', display:'flex', alignItems:'center', gap:5 }}>
                      <Star size={10} color="var(--gold)" fill="var(--gold)" />
                      <span style={{ color:'var(--gold)', fontSize:11, fontWeight:800 }}>{w.rating}</span>
                    </div>
                  </div>
                  <div style={{ padding:'20px 14px 14px' }}>
                    <h4 style={{ color:'#E8F0F8', fontSize:14, fontWeight:800, marginBottom:5 }}>{w.name}</h4>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
                      <MapPin size={10} color="var(--text-dim)" />
                      <span style={{ color:'var(--text-dim)', fontSize:12, fontWeight:700 }}>{w.area}</span>
                    </div>
                    <div style={{ color:'rgba(99,122,144,0.6)', fontSize:11, fontWeight:700 }}>{w.jobs.toLocaleString()} سيارة اتصلحت</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:28, background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(200,151,74,0.2)', borderRadius:16, padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:15, color:'#E8F0F8', marginBottom:3 }}>عندك ورشة في الإسكندرية؟</div>
                <div style={{ color:'var(--text-dim)', fontSize:13 }}>انضم لشبكتنا واحصل على عملاء مضمونين كل يوم</div>
              </div>
              <button className="pill" style={{ background:'rgba(200,151,74,0.1)', border:'1.5px solid rgba(200,151,74,0.28)', color:'var(--gold)', padding:'9px 22px', fontWeight:800, fontSize:13 }}>
                انضم كورشة شريكة
              </button>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer style={{ background:'#080E18', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'44px 28px 22px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:44, marginBottom:36 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,var(--sky),var(--lav))', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Wrench size={15} color="#080E18" />
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:15, color:'#E8F0F8' }}>رينو بارتس</div>
                  <div style={{ color:'var(--sky)', fontSize:9, letterSpacing:2, fontWeight:700 }}>ALEXANDRIA</div>
                </div>
              </div>
              <p style={{ color:'var(--text-dim)', fontSize:12, lineHeight:1.75, maxWidth:240, fontWeight:300, marginBottom:14 }}>المنصة الأولى بين مراكز قطع غيار رينو والورش المعتمدة في الإسكندرية.</p>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--sage)', animation:'glowPulse 2s infinite' }} />
                <span style={{ color:'var(--sage)', fontWeight:700, fontSize:12 }}>متاح ٢٤/٧</span>
              </div>
            </div>
            {[
              { title:'الخدمات', items:['الباكدجات الجاهزة','ابني باكدجك','قطع أصلية','قطع تركية'] },
              { title:'الشركة',  items:['ازاي بنشتغل','انضم كورشة','انضم كمورد','تواصل معنا'] },
              { title:'مناطق',  items:['المنتزه','سيدي جابر','العجمي','الميناء'] },
            ].map(col=>(
              <div key={col.title}>
                <p style={{ color:'var(--text-dim)', fontWeight:700, fontSize:11, marginBottom:14, letterSpacing:1 }}>{col.title}</p>
                {col.items.map(i=>(
                  <div key={i} style={{ color:'rgba(99,122,144,0.55)', fontSize:12, marginBottom:9, cursor:'pointer', fontWeight:400, transition:'color .2s' }}
                    onMouseEnter={e=>(e.currentTarget.style.color='var(--text-dim)')}
                    onMouseLeave={e=>(e.currentTarget.style.color='rgba(99,122,144,0.55)')}
                  >{i}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', paddingTop:18, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            <span style={{ color:'rgba(99,122,144,0.35)', fontSize:11 }}>© 2026 رينو بارتس الإسكندرية</span>
            <div style={{ display:'flex', gap:4, alignItems:'center' }}>
              {[1,2,3,4,5].map(i=><Star key={i} size={10} color="var(--gold)" fill="var(--gold)" />)}
              <span style={{ color:'rgba(99,122,144,0.4)', fontSize:10, marginRight:6 }}>4.9 من 1,247 تقييم</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
