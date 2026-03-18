import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Wrench, ShieldCheck, Star, MapPin, ChevronLeft,
  Zap, Droplets, Wind, Settings, Disc, Battery, Package,
  Building2, Gift, Sparkles, CheckCircle2, BadgeCheck,
  ArrowLeftRight, Plus, Minus, Layers, Send, Bot, ChevronDown
} from 'lucide-react';
import bakoImg from '@/assets/bako.png';
import partOilImg    from '@/assets/part-oil.jpg';
import partBrakesImg from '@/assets/part-brakes.jpg';
import partAirImg    from '@/assets/part-airfilter.jpg';
import partSparksImg from '@/assets/part-sparks.jpg';
import partBatImg    from '@/assets/part-battery.jpg';
import partSuspImg   from '@/assets/part-suspension.jpg';

/* ─── BRAND COLORS (matching RenoPack mascot) ──────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy:     #1A2356;
    --navy-lt:  #243070;
    --bg:       #0D1220;
    --bg2:      #111826;
    --bg3:      #161E30;
    --gold:     #C8974A;
    --gold-lt:  #DEB06C;
    --gold-dim: rgba(200,151,74,0.15);
    --sky:      #4AABCA;
    --lav:      #7B72B8;
    --sage:     #3DA882;
    --text:     #C5D3E0;
    --text-dim: #5C7488;
    --border:   rgba(255,255,255,0.07);
    --card:     rgba(255,255,255,0.04);
  }
  @keyframes blobMorph {
    0%,100% { border-radius:60% 40% 70% 30%/50% 60% 40% 70%; transform:translate(0,0) scale(1); }
    25%     { border-radius:40% 60% 30% 70%/60% 40% 70% 30%; transform:translate(-18px,12px) scale(1.05); }
    50%     { border-radius:70% 30% 60% 40%/30% 70% 40% 60%; transform:translate(14px,-10px) scale(0.96); }
    75%     { border-radius:30% 70% 40% 60%/70% 30% 60% 40%; transform:translate(-6px,16px) scale(1.03); }
  }
  @keyframes blobMorph2 {
    0%,100% { border-radius:40% 60% 50% 50%/60% 40% 60% 40%; transform:translate(0,0) scale(1); }
    33%     { border-radius:60% 40% 40% 60%/40% 60% 50% 50%; transform:translate(22px,-14px) scale(1.07); }
    66%     { border-radius:50% 50% 60% 40%/50% 50% 40% 60%; transform:translate(-12px,20px) scale(0.95); }
  }
  @keyframes floatBako {
    0%,100% { transform:translateY(0) rotate(-1deg); }
    50%     { transform:translateY(-14px) rotate(1.5deg); }
  }
  @keyframes dashFlow { to { stroke-dashoffset:-30; } }
  @keyframes glowBlink { 0%,100%{opacity:.45;} 50%{opacity:1;} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
  @keyframes sparkle {
    0%,100%{transform:scale(1) rotate(0deg);opacity:.7;}
    50%{transform:scale(1.3) rotate(20deg);opacity:1;}
  }
  @keyframes typing {
    0%,60%,100%{opacity:.3;} 30%{opacity:1;}
  }
  @keyframes particleDrift {
    0%,100%{transform:translateY(0) translateX(0);opacity:.3;}
    50%{transform:translateY(-22px) translateX(10px);opacity:.7;}
  }
  .pill {
    font-family:'Almarai',sans-serif;
    border-radius:999px;
    cursor:pointer;
    border:none;
    outline:none;
    transition:all .25s cubic-bezier(.34,1.56,.64,1);
  }
  .pill:hover { transform:translateY(-2px) scale(1.04); }
  .card3d { transition:transform .12s ease,box-shadow .12s ease; transform-style:preserve-3d; }
  .part-tile { transition:all .25s cubic-bezier(.34,1.56,.64,1); cursor:pointer; }
  .part-tile:hover { transform:translateY(-3px) scale(1.02); }
  .chat-bubble-in  { animation:fadeUp .3s ease; }
  .chat-bubble-out { animation:fadeUp .3s ease; }
  .dot1{animation:typing 1.2s .0s infinite;}
  .dot2{animation:typing 1.2s .2s infinite;}
  .dot3{animation:typing 1.2s .4s infinite;}
`;

/* ─── DATA ─────────────────────────────────────────────────────── */
const SERVICES = [
  { icon:Droplets, label:'تغيير زيت',    color:'var(--gold)' },
  { icon:Disc,     label:'فرامل',         color:'var(--sky)' },
  { icon:Wind,     label:'فلتر هواء',    color:'var(--lav)' },
  { icon:Zap,      label:'كهرباء',       color:'var(--gold-lt)' },
  { icon:Settings, label:'عفشة وتروس',  color:'var(--sage)' },
  { icon:Wrench,   label:'عمرة شاملة',  color:'var(--sky)' },
];

const READY_PACKAGES = [
  { id:'km20', name:'صيانة ٢٠ألف كم', sub:'أول صيانة', price:1299, color:'var(--sky)',  includes:['زيت + فلتر زيت','فلتر هواء','فحص الفرامل','ضبط الإطارات'], gift:'ملصق RenoPack الرسمي' },
  { id:'km40', name:'صيانة ٤٠ألف كم', sub:'⭐ الأكثر طلباً', price:2299, color:'var(--gold)', includes:['كل خدمات ٢٠ك','شمعات إشعال','ترموستات + كاوتش','فحص كهرباء كامل'], gift:'فرشاة عجلات احترافية' },
  { id:'km60', name:'صيانة ٦٠ألف كم', sub:'🔥 الشاملة', price:3999, color:'var(--lav)',  includes:['كل خدمات ٤٠ك','سير التوقيت','مضخة الماء','فحص التروس','+٤ خدمات إضافية'], gift:'فلتر هواء مجاناً (قيمة 95 ج.م)' },
];

const PARTS_SHOWCASE = [
  { name:'زيت موبيل 1',      img: partOilImg,    border:'#3DA882',          price:'320 ج.م', badge:'أصلي', badgeColor:'var(--sage)' },
  { name:'طقم فرامل Brembo', img: partBrakesImg, border:'var(--sky)',        price:'680 ج.م', badge:'إيطالي', badgeColor:'var(--sky)' },
  { name:'فلتر هواء',         img: partAirImg,    border:'var(--lav)',        price:'95 ج.م',  badge:'أصلي', badgeColor:'var(--lav)' },
  { name:'شمعات إشعال',       img: partSparksImg, border:'var(--gold)',       price:'320 ج.م', badge:'أصلي', badgeColor:'var(--gold)' },
  { name:'مساعد أمامي',       img: partSuspImg,   border:'rgba(255,255,255,.2)', price:'550 ج.م', badge:'تركي', badgeColor:'var(--text-dim)' },
  { name:'بطارية ٦٠ أمبير',   img: partBatImg,    border:'var(--sage)',       price:'850 ج.م', badge:'أصلي', badgeColor:'var(--sage)' },
];

const PUZZLE_PARTS = [
  { id:'oil',    icon:Droplets, label:'زيت موبيل 1 أصلي',   price:320, cat:'سوائل' },
  { id:'oil_f',  icon:Settings, label:'فلتر زيت',            price:95,  cat:'سوائل' },
  { id:'air_f',  icon:Wind,     label:'فلتر هواء',           price:95,  cat:'فلاتر' },
  { id:'cab_f',  icon:Wind,     label:'فلتر كابينة',         price:75,  cat:'فلاتر' },
  { id:'brk',    icon:Disc,     label:'طقم فرامل أمامي',     price:680, cat:'فرامل' },
  { id:'pads',   icon:Disc,     label:'تيل فرامل خلفي',      price:420, cat:'فرامل' },
  { id:'spark',  icon:Zap,      label:'طقم شمعات إشعال',     price:320, cat:'كهرباء' },
  { id:'bat',    icon:Battery,  label:'بطارية ٦٠ أمبير',     price:850, cat:'كهرباء' },
  { id:'tie',    icon:Settings, label:'روبير كفرات',         price:180, cat:'عفشة' },
  { id:'mnt',    icon:Settings, label:'مساعد أمامي',         price:550, cat:'عفشة' },
];

const GIFT_TIERS = [
  { min:500,  gift:'فرشاة عجلات',          icon:'🎁' },
  { min:1500, gift:'فلتر هواء مجاناً',     icon:'🎁' },
  { min:3000, gift:'ستالايت RenoPack + فلتر', icon:'🎁🎁' },
];

const AI_QA: Record<string, string> = {
  'أصلي':    'الأصلي بيجيلك من أوروبا، ضمانه 24 شهر وجودته 97% حسب معاييرنا. لو سيارتك أقل من 5 سنين خد الأصلي وأنت مرتاح.',
  'تركي':    'التركي كويس لو سيارتك أكبر من 5 سنين أو ميزانيتك محدودة. ضمانه 12 شهر وجودته بتراوح من 73% لـ 83% حسب القطعة.',
  'زيت':     'موبيل 1 الأصلي الألماني هو الأفضل لرينو، بس Selenia التركي كمان كويس للسيارات الأقدم. الفرق في السعر 160 ج.م.',
  'فرامل':   'بريمبو الإيطالي هو الأصلي، Beral التركي اختيار كويس لو الميزانية محدودة. الأثنين عندنا بضمان كامل.',
  'ضمان':    'كل القطع اللي بنبيعها عندها ضمان — الأصلي 24 شهر، التركي 12 شهر. والضمان بيشمل القطعة والتركيب مع بعض.',
  'سعر':     'الأسعار بتختلف حسب القطعة والنوع. الأصلي أغلى بس ضمانه أطول. التركي بيوفر 40-50% مع ضمان كافي.',
  'باكدج':   'عندنا باكدجات جاهزة حسب الكيلو (20ك / 40ك / 60ك) وكمان بيلدر تعمل فيه الباكدج بتاعك بنفسك. كل باكدج فيه هدية!',
  'default': 'ممكن تسألني عن أي قطعة أو خدمة! أنا باكو 🤖 وأنا هنا أساعدك تاخد أحسن قرار لسيارتك بأفضل سعر.',
};

const WORKSHOPS = [
  { name:'ورشة الميناء',    area:'الميناء',    rating:4.9, jobs:847,  color:'var(--sky)' },
  { name:'سنتر المنتزه',    area:'المنتزه',    rating:4.8, jobs:1204, color:'var(--gold)' },
  { name:'ورشة العجمي',     area:'العجمي',     rating:4.7, jobs:632,  color:'var(--lav)' },
  { name:'سنتر سيدي جابر', area:'سيدي جابر', rating:4.9, jobs:980,  color:'var(--sage)' },
];

/* ─── LOGO COMPONENT ──────────────────────────────────────────── */
function RenoPackLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm:{ logo:28, ar:14, en:9 }, md:{ logo:38, ar:18, en:10 }, lg:{ logo:52, ar:24, en:13 } }[size];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:s.logo, height:s.logo, borderRadius:s.logo*0.28, background:'linear-gradient(145deg,var(--navy-lt),var(--navy))', border:'2px solid rgba(200,151,74,0.4)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 14px rgba(200,151,74,0.25)', overflow:'hidden', position:'relative' }}>
        {/* Car silhouette */}
        <svg width={s.logo*0.7} height={s.logo*0.7} viewBox="0 0 40 24" fill="none">
          <path d="M6 16 Q8 10 14 9 L26 8 Q31 8 34 12 L36 16 Q30 18 10 18 Z" fill="var(--gold)" opacity="0.9"/>
          <circle cx="12" cy="18" r="3" fill="var(--navy)" stroke="var(--gold)" strokeWidth="1.5"/>
          <circle cx="28" cy="18" r="3" fill="var(--navy)" stroke="var(--gold)" strokeWidth="1.5"/>
          <path d="M16 9 L18 5 L24 5 L27 9" stroke="var(--gold)" strokeWidth="1.2" fill="none"/>
        </svg>
      </div>
      <div>
        <div style={{ fontFamily:"'Almarai',sans-serif", fontWeight:800, fontSize:s.ar, lineHeight:1, letterSpacing:-0.3 }}>
          <span style={{ color:'var(--text)' }}>رينو </span>
          <span style={{ color:'var(--gold)' }}>باك</span>
        </div>
        <div style={{ fontFamily:'inherit', fontWeight:700, fontSize:s.en, letterSpacing:1.5, color:'var(--text-dim)', marginTop:1 }}>
          Reno<span style={{ color:'var(--gold)' }}>Pack</span>
        </div>
      </div>
    </div>
  );
}

/* ─── 3D CARD ─────────────────────────────────────────────────── */
function Card3D({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x:0, y:0 });
  const onMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    setRot({ x:-(((e.clientY-r.top)/r.height)-0.5)*12, y:(((e.clientX-r.left)/r.width)-0.5)*12 });
  }, []);
  return (
    <div ref={ref} className="card3d" onMouseMove={onMove} onMouseLeave={()=>setRot({x:0,y:0})}
      style={{ ...style, transform:`perspective(900px) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`, boxShadow:`${rot.y*-2}px ${rot.x*2}px 44px rgba(0,0,0,0.4)` }}>
      {children}
    </div>
  );
}

/* ─── AI CHAT COMPONENT ───────────────────────────────────────── */
interface ChatMsg { from:'user'|'bako'; text:string; }

function BakoChat() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { from:'bako', text:'أهلاً! أنا باكو 🤖 مساعد RenoPack. اسألني عن أي قطعة أو قارن بين الأصلي والتركي!' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const getReply = (msg: string): string => {
    const lower = msg.toLowerCase();
    for (const [key, val] of Object.entries(AI_QA)) {
      if (key !== 'default' && lower.includes(key)) return val;
    }
    return AI_QA['default'];
  };

  const send = () => {
    const txt = input.trim();
    if (!txt) return;
    setInput('');
    setMsgs(p => [...p, { from:'user', text:txt }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(p => [...p, { from:'bako', text:getReply(txt) }]);
    }, 1200 + Math.random()*600);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, typing]);

  return (
    <div style={{ background:'var(--bg3)', border:'1.5px solid rgba(200,151,74,0.18)', borderRadius:22, overflow:'hidden', display:'flex', flexDirection:'column', height:420 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,var(--navy),var(--navy-lt))', padding:'14px 18px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid rgba(200,151,74,0.15)' }}>
        <img src={bakoImg} alt="باكو" style={{ width:38, height:38, borderRadius:'50%', objectFit:'cover', objectPosition:'top', border:'2px solid var(--gold)', background:'var(--navy)' }} />
        <div>
          <div style={{ fontFamily:"'Almarai',sans-serif", fontWeight:800, fontSize:14, color:'#fff' }}>باكو 🤖</div>
          <div style={{ fontSize:10, color:'rgba(200,151,74,0.8)', fontWeight:700 }}>مساعد RenoPack الذكي — بيكلم عربي!</div>
        </div>
        <div style={{ marginRight:'auto', display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#4ADE80', animation:'glowBlink 2s infinite' }} />
          <span style={{ color:'rgba(255,255,255,0.45)', fontSize:10, fontWeight:700 }}>متاح دلوقتي</span>
        </div>
      </div>

      {/* Quick suggestion pills */}
      <div style={{ padding:'10px 14px', display:'flex', gap:7, flexWrap:'wrap', borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,0.01)' }}>
        {['أصلي ولا تركي؟','الفرق في الزيت','ضمان كام؟','الفرامل الأحسن'].map(q=>(
          <button key={q} onClick={()=>{ setInput(q); setTimeout(()=>{ send(); }, 50); }}
            style={{ fontFamily:"'Almarai',sans-serif", fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:999, background:'rgba(200,151,74,0.08)', border:'1px solid rgba(200,151,74,0.2)', color:'var(--gold)', cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 14px', display:'flex', flexDirection:'column', gap:12 }}>
        {msgs.map((m, i) => (
          <div key={i} className={m.from==='bako'?'chat-bubble-in':'chat-bubble-out'} style={{ display:'flex', gap:8, alignItems:'flex-end', flexDirection: m.from==='bako'?'row':'row-reverse' }}>
            {m.from==='bako' && (
              <img src={bakoImg} alt="" style={{ width:26, height:26, borderRadius:'50%', objectFit:'cover', objectPosition:'top', flexShrink:0, border:'1.5px solid var(--gold)', background:'var(--navy)' }} />
            )}
            <div style={{
              maxWidth:'78%', padding:'10px 14px', borderRadius: m.from==='bako'?'4px 16px 16px 16px':'16px 4px 16px 16px',
              background: m.from==='bako'?'rgba(26,35,86,0.7)':'linear-gradient(135deg,var(--gold),var(--gold-lt))',
              color: m.from==='bako'?'var(--text)':'var(--bg)', fontSize:13, fontWeight: m.from==='bako'?400:700,
              lineHeight:1.55, border: m.from==='bako'?'1px solid rgba(200,151,74,0.12)':'none',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
            <img src={bakoImg} alt="" style={{ width:26, height:26, borderRadius:'50%', objectFit:'cover', objectPosition:'top', flexShrink:0, border:'1.5px solid var(--gold)', background:'var(--navy)' }} />
            <div style={{ padding:'12px 16px', borderRadius:'4px 16px 16px 16px', background:'rgba(26,35,86,0.7)', border:'1px solid rgba(200,151,74,0.12)', display:'flex', gap:5, alignItems:'center' }}>
              <div className="dot1" style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold)' }} />
              <div className="dot2" style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold)' }} />
              <div className="dot3" style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold)' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding:'12px 14px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="اسأل باكو أي سؤال عن القطع..."
          style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:999, padding:'9px 16px', color:'var(--text)', fontSize:13, fontFamily:"'Almarai',sans-serif", outline:'none', direction:'rtl' }}
          onFocus={e=>{e.target.style.borderColor='rgba(200,151,74,0.4)'}}
          onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.09)'}}
        />
        <button onClick={send} style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold),var(--gold-lt))', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 14px rgba(200,151,74,0.3)', transition:'transform .2s' }}
          onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.08)')}
          onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
          <Send size={15} color="var(--bg)" />
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN ────────────────────────────────────────────────────── */
export function AlexandriaBlend() {
  const [activeService, setActiveService] = useState<number|null>(null);
  const [readyPkg, setReadyPkg]           = useState('km40');
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [searchVal, setSearchVal]         = useState('');
  const rPkg = READY_PACKAGES.find(p=>p.id===readyPkg)!;
  const total = [...selected].reduce((s,id)=>{ const p=PUZZLE_PARTS.find(x=>x.id===id); return s+(p?.price??0); },0);
  const currentGift = [...GIFT_TIERS].reverse().find(t=>total>=t.min);
  const nextGift    = GIFT_TIERS.find(t=>t.min>total);
  const togglePart  = (id:string)=>setSelected(p=>{ const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });

  return (
    <>
      <style>{STYLES}</style>
      <div dir="rtl" style={{ fontFamily:"'Almarai','Cairo',sans-serif", background:'var(--bg)', color:'var(--text)', minHeight:'100vh' }}>

        {/* ═══ NAV ═══ */}
        <nav style={{ position:'sticky', top:0, zIndex:99, background:'rgba(13,18,32,0.95)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(200,151,74,0.1)' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 28px', height:64, display:'flex', alignItems:'center', gap:22 }}>
            <RenoPackLogo size="md" />
            <div style={{ flex:1, position:'relative' }}>
              <Search size={14} color="var(--text-dim)" style={{ position:'absolute', top:'50%', right:14, transform:'translateY(-50%)', pointerEvents:'none' }} />
              <input value={searchVal} onChange={e=>setSearchVal(e.target.value)} placeholder="دور على قطعة أو خدمة..."
                style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.08)', borderRadius:999, padding:'9px 40px 9px 18px', color:'var(--text)', fontSize:13, fontFamily:"'Almarai',sans-serif", outline:'none' }}
                onFocus={e=>{e.target.style.borderColor='rgba(200,151,74,0.4)'}}
                onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)'}}
              />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:18, flexShrink:0 }}>
              {['الباكدجات','القطع','الورش'].map(n=>(
                <span key={n} style={{ color:'var(--text-dim)', fontSize:13, fontWeight:700, cursor:'pointer', transition:'color .2s' }}
                  onMouseEnter={e=>(e.currentTarget.style.color='var(--text)')}
                  onMouseLeave={e=>(e.currentTarget.style.color='var(--text-dim)')}>{n}</span>
              ))}
              <button className="pill" style={{ background:'linear-gradient(135deg,var(--gold),var(--gold-lt))', color:'var(--bg)', padding:'8px 20px', fontWeight:800, fontSize:13, boxShadow:'0 4px 14px rgba(200,151,74,0.3)' }}>
                احجز دلوقتي
              </button>
            </div>
          </div>
        </nav>

        {/* ═══ HERO ═══ */}
        <section style={{ position:'relative', padding:'60px 28px 50px', overflow:'hidden' }}>
          {/* Fluid blobs */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-20%', right:'-6%', width:560, height:560, background:'radial-gradient(circle at 45% 45%, rgba(74,171,202,0.09) 0%, transparent 65%)', animation:'blobMorph 10s ease-in-out infinite' }} />
            <div style={{ position:'absolute', bottom:'-18%', left:'-4%', width:460, height:460, background:'radial-gradient(circle at 55% 55%, rgba(200,151,74,0.08) 0%, transparent 65%)', animation:'blobMorph2 12s ease-in-out infinite 3s' }} />
            <div style={{ position:'absolute', top:'30%', left:'32%', width:320, height:320, background:'radial-gradient(circle at 50% 50%, rgba(123,114,184,0.07) 0%, transparent 65%)', animation:'blobMorph 15s ease-in-out infinite 6s' }} />
            {[{top:'12%',right:'20%',c:'var(--gold)',d:'0s'},{top:'50%',right:'6%',c:'var(--sky)',d:'1.5s'},{top:'72%',right:'38%',c:'var(--lav)',d:'3s'},{top:'22%',left:'12%',c:'var(--sage)',d:'0.8s'},{top:'65%',left:'6%',c:'var(--gold)',d:'2.2s'}].map((p,i)=>(
              <div key={i} style={{ position:'absolute', top:p.top, right:p.right, left:p.left, width:4, height:4, borderRadius:'50%', background:p.c, boxShadow:`0 0 8px ${p.c}`, animation:`particleDrift ${4+i}s ease-in-out infinite ${p.d}` }} />
            ))}
            {[...Array(7)].map((_,i)=><div key={i} style={{ position:'absolute', top:0, bottom:0, left:`${i*16.6}%`, width:1, background:'rgba(255,255,255,0.02)' }} />)}
          </div>

          <div style={{ maxWidth:1280, margin:'0 auto', position:'relative', display:'grid', gridTemplateColumns:'1.1fr 0.9fr', gap:52, alignItems:'center' }}>

            {/* Left text */}
            <div style={{ animation:'fadeUp .7s ease both' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(200,151,74,0.08)', border:'1px solid rgba(200,151,74,0.2)', borderRadius:999, padding:'5px 16px', marginBottom:24 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--gold)', animation:'glowBlink 2s infinite' }} />
                <span style={{ color:'var(--gold)', fontSize:12, fontWeight:700 }}>منصة قطع الغيار الأولى — الإسكندرية</span>
              </div>

              <h1 style={{ fontSize:48, fontWeight:800, lineHeight:1.25, letterSpacing:-0.5, marginBottom:16, color:'#E8F0F8' }}>
                مش بنبيع قطع —<br/>
                <span style={{ background:'linear-gradient(125deg,var(--gold),var(--gold-lt),var(--sky))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  بنبيع باكدج كامل.
                </span>
              </h1>
              <p style={{ color:'var(--text-dim)', fontSize:15, lineHeight:1.85, marginBottom:36, maxWidth:480 }}>
                زي أوبر — إحنا الوسيط بين مراكز قطع الغيار وورش التركيب في الإسكندرية. إنت بتدفع لينا مرة واحدة، القطعة والتركيب والضمان علينا.
              </p>

              <p style={{ color:'var(--text-dim)', fontSize:11, fontWeight:700, marginBottom:12, letterSpacing:1 }}>ابدأ من اللي محتاجه:</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                {SERVICES.map((s,i)=>{
                  const on=activeService===i;
                  return (
                    <button key={i} className="pill" onClick={()=>setActiveService(on?null:i)} style={{
                      padding:'9px 18px', background:on?`${s.color}15`:'rgba(255,255,255,0.04)',
                      border:`1.5px solid ${on?s.color:'rgba(255,255,255,0.08)'}`,
                      color:on?s.color:'var(--text-dim)', fontSize:13, fontWeight:700,
                      boxShadow:on?`0 0 14px ${s.color}28`:'none',
                    }}>
                      <s.icon size={13} style={{ marginLeft:6, display:'inline', verticalAlign:'middle' }}/>{s.label}
                    </button>
                  );
                })}
              </div>
              {activeService!==null&&(
                <div style={{ animation:'fadeUp .3s ease', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <span style={{ color:'var(--text)', fontSize:13, fontWeight:700 }}>
                    عندنا باكدج بيشمل <strong style={{ color:SERVICES[activeService].color }}>{SERVICES[activeService].label}</strong> — قطعة + تركيب + ضمان
                  </span>
                  <button className="pill" style={{ background:SERVICES[activeService].color, color:'var(--bg)', padding:'6px 14px', fontWeight:800, fontSize:12, flexShrink:0 }}>اختار الباكدج</button>
                </div>
              )}

              <div style={{ display:'flex', gap:28, marginTop:36, paddingTop:24, borderTop:'1px solid var(--border)' }}>
                {[['1,247+','عميل تخدم'],['4.9 ★','تقييم'],['32','ورشة']].map(([n,l])=>(
                  <div key={l}><div style={{ fontSize:22, fontWeight:800, color:'var(--gold)' }}>{n}</div><div style={{ fontSize:11, color:'var(--text-dim)', fontWeight:700, marginTop:2 }}>{l}</div></div>
                ))}
              </div>
            </div>

            {/* Right: Bako + 3D diagram */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Bako mascot */}
              <div style={{ textAlign:'center', animation:'floatBako 5s ease-in-out infinite', position:'relative' }}>
                <img src={bakoImg} alt="باكو — مساعد RenoPack" style={{ width:220, height:220, objectFit:'contain', objectPosition:'top', filter:'drop-shadow(0 20px 40px rgba(200,151,74,0.3))', margin:'0 auto', display:'block' }} />
                <div style={{ position:'absolute', top:20, left:'50%', transform:'translateX(-120%)', background:'rgba(26,35,86,0.9)', border:'1.5px solid rgba(200,151,74,0.3)', borderRadius:'16px 16px 16px 4px', padding:'8px 14px', whiteSpace:'nowrap', animation:'glowBlink 3s infinite' }}>
                  <span style={{ color:'var(--gold)', fontSize:12, fontWeight:700 }}>أنا باكو! 👋 هساعدك تختار</span>
                </div>
              </div>

              {/* 3D diagram card */}
              <Card3D style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:22, padding:22, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, right:0, width:100, height:100, background:'radial-gradient(circle at top right, rgba(200,151,74,0.1), transparent)', pointerEvents:'none' }} />
                <p style={{ color:'var(--text-dim)', fontSize:10, fontWeight:700, letterSpacing:2, textAlign:'center', marginBottom:18 }}>كيف بنشتغل</p>
                <div style={{ position:'relative', height:180 }}>
                  <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible' }}>
                    <defs>
                      {['sky','gold','lav'].map(id=>(
                        <filter key={id} id={`gf-${id}`}><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                      ))}
                    </defs>
                    <line x1="50%" y1="44%" x2="18%" y2="12%" stroke="#4AABCA" strokeWidth="1.5" strokeOpacity=".55" strokeDasharray="7,5" style={{animation:'dashFlow 1.8s linear infinite'}} filter="url(#gf-sky)" />
                    <line x1="50%" y1="44%" x2="82%" y2="12%" stroke="#C8974A" strokeWidth="1.5" strokeOpacity=".55" strokeDasharray="7,5" style={{animation:'dashFlow 2.2s linear infinite'}} filter="url(#gf-gold)" />
                    <line x1="50%" y1="44%" x2="50%" y2="88%" stroke="#7B72B8" strokeWidth="1.5" strokeOpacity=".55" strokeDasharray="7,5" style={{animation:'dashFlow 2s linear infinite'}} filter="url(#gf-lav)" />
                  </svg>
                  <div style={{ position:'absolute', top:'44%', left:'50%', transform:'translate(-50%,-50%)', width:70, height:70, borderRadius:'50%', background:'rgba(200,151,74,0.08)', border:'2px solid rgba(200,151,74,0.35)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:3, boxShadow:'0 0 24px rgba(200,151,74,0.18)' }}>
                    <span style={{ fontSize:20 }}>🤖</span>
                    <span style={{ color:'var(--gold)', fontSize:8, fontWeight:800, marginTop:3, textAlign:'center' }}>RenoPack</span>
                  </div>
                  {[
                    { label:'مراكز القطع', sub:'أصلي + تركي', Icon:Package, color:'#4AABCA', top:'0%', right:'68%' },
                    { label:'ورش التركيب', sub:'32 ورشة',      Icon:Building2, color:'#C8974A', top:'0%', left:'68%' },
                    { label:'عميل + ضمان', sub:'ادفع لينا',    Icon:BadgeCheck, color:'#7B72B8', bottom:'0%', left:'50%', tx:'-50%' },
                  ].map((n,i)=>(
                    <div key={i} style={{ position:'absolute', top:n.top, left:n.left, right:n.right, bottom:n.bottom, transform:n.tx?`translateX(${n.tx})`:'', background:`${n.color}0A`, border:`1px solid ${n.color}22`, borderRadius:12, padding:'8px 10px', textAlign:'center', minWidth:88 }}>
                      <n.Icon size={14} color={n.color} style={{ margin:'0 auto 4px', display:'block' }}/>
                      <div style={{ color:n.color, fontSize:10, fontWeight:800 }}>{n.label}</div>
                      <div style={{ color:'rgba(255,255,255,0.25)', fontSize:8, marginTop:1 }}>{n.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:14, background:'rgba(200,151,74,0.05)', border:'1px solid rgba(200,151,74,0.13)', borderRadius:10, padding:'9px 12px', display:'flex', gap:8, alignItems:'center' }}>
                  <ShieldCheck size={13} color="var(--gold)" style={{ flexShrink:0 }}/>
                  <span style={{ color:'var(--text-dim)', fontSize:11, fontWeight:700 }}>الضمان على القطعة <strong style={{ color:'var(--gold)' }}>والتركيب</strong> — معانا</span>
                </div>
              </Card3D>
            </div>
          </div>
        </section>

        {/* ═══ PARTS SHOWCASE ═══ */}
        <section style={{ padding:'48px 28px', borderTop:'1px solid var(--border)', background:'rgba(255,255,255,0.01)' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
              <div>
                <h2 style={{ fontSize:24, fontWeight:800, color:'#E8F0F8', marginBottom:4 }}>قطع رينو الأصيلة 🔧</h2>
                <p style={{ color:'var(--text-dim)', fontSize:13 }}>أصلي وتركي — كلهم عندنا بضمان</p>
              </div>
              <span style={{ color:'var(--gold)', fontSize:13, fontWeight:700, cursor:'pointer' }}>كل القطع ←</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
              {PARTS_SHOWCASE.map((p,i)=>(
                <div key={i} className="part-tile" style={{ background:'var(--bg3)', border:`1.5px solid ${p.border}30`, borderRadius:16, overflow:'hidden', position:'relative' }}>
                  {/* Real part photo */}
                  <div style={{ height:110, overflow:'hidden', position:'relative' }}>
                    <img src={p.img} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .4s ease', display:'block' }}
                      onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.08)')}
                      onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
                    />
                    {/* gradient overlay */}
                    <div style={{ position:'absolute', inset:0, background:`linear-gradient(to bottom, transparent 40%, var(--bg3) 100%)` }} />
                    {/* badge top-right */}
                    <div style={{ position:'absolute', top:8, left:8, background:`${p.badgeColor}22`, border:`1px solid ${p.badgeColor}50`, borderRadius:999, padding:'2px 8px', fontSize:9, fontWeight:800, color:p.badgeColor }}>
                      {p.badge}
                    </div>
                  </div>
                  <div style={{ padding:'10px 12px 14px' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:5, lineHeight:1.3 }}>{p.name}</div>
                    <div style={{ fontSize:14, fontWeight:800, color:'var(--gold)' }}>{p.price}</div>
                  </div>
                  <div style={{ position:'absolute', top:0, right:0, left:0, height:2, background:p.border, opacity:.4 }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ READY PACKAGES ═══ */}
        <section style={{ padding:'64px 28px', borderTop:'1px solid var(--border)' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:36 }}>
              <h2 style={{ fontSize:28, fontWeight:800, color:'#E8F0F8', marginBottom:8 }}>باكدجات جاهزة حسب الصيانة 🛠️</h2>
              <p style={{ color:'var(--text-dim)', fontSize:14 }}>اختار باكدج جاهز على حسب كيلومترات سيارتك</p>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:32, flexWrap:'wrap' }}>
              {READY_PACKAGES.map(p=>{const on=readyPkg===p.id;return(
                <button key={p.id} className="pill" onClick={()=>setReadyPkg(p.id)} style={{ padding:'10px 22px', background:on?`${p.color}14`:'rgba(255,255,255,0.03)', border:`1.5px solid ${on?p.color:'rgba(255,255,255,0.08)'}`, color:on?p.color:'var(--text-dim)', fontWeight:800, fontSize:13, boxShadow:on?`0 0 18px ${p.color}18`:'none' }}>
                  {p.name}<span style={{ display:'block', fontSize:9, opacity:.7, fontWeight:700, marginTop:1 }}>{p.sub}</span>
                </button>
              );})}
            </div>
            <div style={{ maxWidth:560, margin:'0 auto', background:`linear-gradient(150deg,${rPkg.color}08,rgba(13,18,32,0.8))`, border:`1.5px solid ${rPkg.color}22`, borderRadius:24, padding:32, animation:'fadeUp .3s ease', boxShadow:`0 14px 44px ${rPkg.color}10` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
                <div>
                  <h3 style={{ fontSize:20, fontWeight:800, color:'#E8F0F8', marginBottom:8 }}>{rPkg.name}</h3>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:`${rPkg.color}10`, border:`1px solid ${rPkg.color}25`, borderRadius:999, padding:'5px 12px' }}>
                    <Gift size={12} color={rPkg.color}/><span style={{ color:rPkg.color, fontSize:11, fontWeight:700 }}>هديتك: {rPkg.gift}</span>
                  </div>
                </div>
                <div style={{ textAlign:'left' }}>
                  <div style={{ color:rPkg.color, fontSize:34, fontWeight:800, lineHeight:1 }}>{rPkg.price.toLocaleString()}</div>
                  <div style={{ color:'var(--text-dim)', fontSize:11, fontWeight:700 }}>ج.م شامل التركيب</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
                {rPkg.includes.map(s=>(
                  <div key={s} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <CheckCircle2 size={12} color={rPkg.color} style={{ flexShrink:0 }}/>
                    <span style={{ color:'var(--text)', fontSize:12, fontWeight:700 }}>{s}</span>
                  </div>
                ))}
              </div>
              <button className="pill" style={{ width:'100%', background:`linear-gradient(135deg,${rPkg.color},${rPkg.color}bb)`, color:'var(--bg)', border:'none', padding:'12px', fontWeight:800, fontSize:14, boxShadow:`0 6px 22px ${rPkg.color}28` }}>
                احجز الباكدج + استلم الهدية ←
              </button>
            </div>
          </div>
        </section>

        {/* ═══ PUZZLE BUILDER ═══ */}
        <section style={{ padding:'64px 28px', background:'var(--bg2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:36 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(200,151,74,0.09)', border:'1px solid rgba(200,151,74,0.2)', borderRadius:999, padding:'5px 16px', marginBottom:14 }}>
                <Layers size={13} color="var(--gold)"/><span style={{ color:'var(--gold)', fontSize:12, fontWeight:700 }}>ابني باكدجك بنفسك</span>
              </div>
              <h2 style={{ fontSize:26, fontWeight:800, color:'#E8F0F8', marginBottom:8 }}>البازل — اختار قطعك وجمّع باكدجك 🧩</h2>
              <p style={{ color:'var(--text-dim)', fontSize:14 }}>على حسب قيمة الباكدج بتاعك هتاخد هدية تلقائياً</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:28, alignItems:'start' }}>
              <div>
                {['سوائل','فلاتر','فرامل','كهرباء','عفشة'].map(cat=>{
                  const parts=PUZZLE_PARTS.filter(p=>p.cat===cat);
                  return (
                    <div key={cat} style={{ marginBottom:20 }}>
                      <p style={{ color:'var(--text-dim)', fontSize:10, fontWeight:700, letterSpacing:1.5, marginBottom:10 }}>{cat}</p>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:9 }}>
                        {parts.map(p=>{const on=selected.has(p.id);return(
                          <div key={p.id} className="part-tile" onClick={()=>togglePart(p.id)} style={{ background:on?'rgba(200,151,74,0.07)':'var(--card)', border:`1.5px solid ${on?'rgba(200,151,74,0.38)':'rgba(255,255,255,0.06)'}`, borderRadius:14, padding:'12px 14px', display:'flex', alignItems:'center', gap:10, boxShadow:on?'0 0 16px rgba(200,151,74,0.1)':'none' }}>
                            <div style={{ width:34, height:34, borderRadius:10, background:on?'rgba(200,151,74,0.13)':'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background .25s' }}>
                              <p.icon size={15} color={on?'var(--gold)':'var(--text-dim)'}/>
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:11, fontWeight:700, color:on?'#E8F0F8':'var(--text)', marginBottom:2 }}>{p.label}</div>
                              <div style={{ fontSize:12, fontWeight:800, color:on?'var(--gold)':'var(--text-dim)' }}>{p.price} ج.م</div>
                            </div>
                            <div style={{ width:20, height:20, borderRadius:'50%', background:on?'var(--gold)':'rgba(255,255,255,0.05)', border:`1.5px solid ${on?'var(--gold)':'rgba(255,255,255,0.1)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .25s' }}>
                              {on?<Minus size={10} color="var(--bg)"/>:<Plus size={10} color="var(--text-dim)"/>}
                            </div>
                          </div>
                        );})}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Sidebar */}
              <div style={{ position:'sticky', top:80 }}>
                <div style={{ background:'var(--bg3)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:22 }}>
                  <h4 style={{ fontSize:15, fontWeight:800, color:'#E8F0F8', marginBottom:18 }}>ملخص الباكدج</h4>
                  <div style={{ marginBottom:18 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                      <span style={{ color:'var(--text-dim)', fontSize:12, fontWeight:700 }}>إجمالي الباكدج</span>
                      <span style={{ color:'var(--gold)', fontWeight:800, fontSize:16 }}>{total.toLocaleString()} ج.م</span>
                    </div>
                    {GIFT_TIERS.map(tier=>{const pct=Math.min(100,(total/tier.min)*100);const ok=total>=tier.min;return(
                      <div key={tier.min} style={{ marginBottom:9 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                          <span style={{ fontSize:10, color:ok?'var(--gold)':'var(--text-dim)', fontWeight:700 }}>{tier.icon} {tier.gift}</span>
                          <span style={{ fontSize:9, color:'var(--text-dim)', fontWeight:700 }}>{tier.min.toLocaleString()} ج.م</span>
                        </div>
                        <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:999 }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:ok?'var(--gold)':'linear-gradient(90deg,var(--gold-lt),var(--gold))', borderRadius:999, transition:'width .5s ease', opacity:ok?1:.55 }}/>
                        </div>
                      </div>
                    );})}
                    {nextGift&&<p style={{ color:'var(--text-dim)', fontSize:10, fontWeight:700, marginTop:8 }}>بعد {(nextGift.min-total).toLocaleString()} ج.م: <strong style={{ color:'var(--gold)' }}>{nextGift.gift} {nextGift.icon}</strong></p>}
                    {currentGift&&<div style={{ background:'rgba(200,151,74,0.09)', border:'1px solid rgba(200,151,74,0.22)', borderRadius:10, padding:'8px 12px', marginTop:10, display:'flex', gap:7, alignItems:'center' }}>
                      <Gift size={13} color="var(--gold)"/><span style={{ color:'var(--gold)', fontSize:11, fontWeight:700 }}>هديتك: {currentGift.gift}</span>
                    </div>}
                  </div>
                  <div style={{ maxHeight:170, overflowY:'auto', marginBottom:14 }}>
                    {selected.size===0?<p style={{ color:'rgba(92,116,136,0.5)', fontSize:12, textAlign:'center', padding:'18px 0', fontWeight:700 }}>اختار من القطع على الشمال</p>
                    :[...selected].map(id=>{const p=PUZZLE_PARTS.find(x=>x.id===id)!;return(
                      <div key={id} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                        <span style={{ color:'var(--text)', fontSize:12, fontWeight:700 }}>{p.label}</span>
                        <span style={{ color:'var(--gold)', fontSize:12, fontWeight:800 }}>{p.price} ج.م</span>
                      </div>
                    );})}
                  </div>
                  {selected.size>0&&<>
                    <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:'2px solid var(--border)', marginBottom:10 }}>
                      <span style={{ color:'#E8F0F8', fontWeight:800, fontSize:14 }}>الإجمالي</span>
                      <span style={{ color:'var(--gold)', fontWeight:800, fontSize:16 }}>{total.toLocaleString()} ج.م</span>
                    </div>
                    <button className="pill" style={{ width:'100%', background:'linear-gradient(135deg,var(--gold),var(--gold-lt))', color:'var(--bg)', border:'none', padding:'11px', fontWeight:800, fontSize:13, boxShadow:'0 5px 18px rgba(200,151,74,0.25)' }}>
                      احجز الباكدج ده
                    </button>
                  </>}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ BAKO AI CHAT ═══ */}
        <section style={{ padding:'64px 28px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
            {/* Left explainer */}
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(123,114,184,0.09)', border:'1px solid rgba(123,114,184,0.2)', borderRadius:999, padding:'5px 16px', marginBottom:20 }}>
                <Sparkles size={13} color="var(--lav)"/><span style={{ color:'var(--lav)', fontSize:12, fontWeight:700 }}>ذكاء اصطناعي — عربي كامل</span>
              </div>
              <h2 style={{ fontSize:28, fontWeight:800, color:'#E8F0F8', marginBottom:12 }}>اسأل باكو 🤖 اللي في دماغك</h2>
              <p style={{ color:'var(--text-dim)', fontSize:15, lineHeight:1.85, marginBottom:24 }}>
                باكو مساعدنا الذكي — بيكلم عربي مصري ويقدر يساعدك تقارن بين الأصلي والتركي، تختار الباكدج المناسب لسيارتك، أو تسأل عن أي قطعة.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[['🤖','بيكلم عربي مصري','مش إنجليزي ولا فصحى — ده باكو الإسكندراني'],['⚖️','مقارنة أصلي vs تركي','بيقولك الفرق بالسعر والجودة والضمان'],['🎯','توصيات على حسب سيارتك','عمر السيارة + الكيلومترات + ميزانيتك']].map(([ic,t,s])=>(
                  <div key={t} style={{ display:'flex', gap:14, alignItems:'flex-start', background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:'12px 16px' }}>
                    <span style={{ fontSize:22, flexShrink:0 }}>{ic}</span>
                    <div><div style={{ color:'#E8F0F8', fontWeight:800, fontSize:14, marginBottom:2 }}>{t}</div><div style={{ color:'var(--text-dim)', fontSize:12, fontWeight:400 }}>{s}</div></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <BakoChat />
          </div>
        </section>

        {/* ═══ WORKSHOPS ═══ */}
        <section style={{ padding:'56px 28px', background:'var(--bg2)', borderTop:'1px solid var(--border)' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28 }}>
              <div>
                <h2 style={{ fontSize:24, fontWeight:800, color:'#E8F0F8', marginBottom:4 }}>ورشنا في الإسكندرية</h2>
                <p style={{ color:'var(--text-dim)', fontSize:13 }}>كل ورشة اتاختارت بمعايير صارمة</p>
              </div>
              <button style={{ color:'var(--sky)', background:'none', border:'none', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}>كل الورش ←</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
              {WORKSHOPS.map(w=>(
                <div key={w.name} style={{ borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)', background:'var(--card)', cursor:'pointer', transition:'transform .25s,box-shadow .25s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(-4px)';(e.currentTarget as HTMLDivElement).style.boxShadow='0 12px 30px rgba(0,0,0,0.2)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform='';(e.currentTarget as HTMLDivElement).style.boxShadow='';}}>
                  <div style={{ height:90, background:`linear-gradient(145deg,var(--bg3),${w.color}12)`, display:'flex', alignItems:'center', justifyContent:'center', borderBottom:'1px solid rgba(255,255,255,0.04)', position:'relative' }}>
                    <Building2 size={30} color={`${w.color}35`}/>
                    <div style={{ position:'absolute', bottom:-10, right:12, background:'var(--bg)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:999, padding:'2px 9px', display:'flex', alignItems:'center', gap:4 }}>
                      <Star size={9} color="var(--gold)" fill="var(--gold)"/><span style={{ color:'var(--gold)', fontSize:10, fontWeight:800 }}>{w.rating}</span>
                    </div>
                  </div>
                  <div style={{ padding:'18px 14px 14px' }}>
                    <h4 style={{ color:'#E8F0F8', fontSize:13, fontWeight:800, marginBottom:4 }}>{w.name}</h4>
                    <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:6 }}>
                      <MapPin size={9} color="var(--text-dim)"/><span style={{ color:'var(--text-dim)', fontSize:11, fontWeight:700 }}>{w.area}</span>
                    </div>
                    <div style={{ color:'rgba(92,116,136,0.55)', fontSize:10, fontWeight:700 }}>{w.jobs.toLocaleString()} سيارة</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:24, background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(200,151,74,0.18)', borderRadius:14, padding:'16px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:14, color:'#E8F0F8', marginBottom:2 }}>عندك ورشة في الإسكندرية؟</div>
                <div style={{ color:'var(--text-dim)', fontSize:12 }}>انضم لشبكة RenoPack</div>
              </div>
              <button className="pill" style={{ background:'rgba(200,151,74,0.09)', border:'1.5px solid rgba(200,151,74,0.25)', color:'var(--gold)', padding:'8px 20px', fontWeight:800, fontSize:12 }}>انضم كورشة</button>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer style={{ background:'#07091426', borderTop:'1px solid rgba(255,255,255,0.04)', padding:'40px 28px 20px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:32 }}>
            <div>
              <RenoPackLogo size="sm" />
              <p style={{ color:'var(--text-dim)', fontSize:12, lineHeight:1.75, maxWidth:230, fontWeight:300, margin:'14px 0' }}>المنصة الأولى بين مراكز قطع غيار رينو والورش المعتمدة في الإسكندرية.</p>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--sage)', animation:'glowBlink 2s infinite' }}/>
                <span style={{ color:'var(--sage)', fontWeight:700, fontSize:11 }}>متاح ٢٤/٧</span>
              </div>
            </div>
            {[
              { t:'الخدمات', i:['الباكدجات الجاهزة','ابني باكدجك','قطع أصلية','قطع تركية'] },
              { t:'الشركة',  i:['ازاي بنشتغل','انضم كورشة','انضم كمورد','تواصل معنا'] },
              { t:'مناطق',  i:['المنتزه','سيدي جابر','العجمي','الميناء'] },
            ].map(col=>(
              <div key={col.t}>
                <p style={{ color:'var(--text-dim)', fontWeight:700, fontSize:10, marginBottom:12, letterSpacing:1.5 }}>{col.t}</p>
                {col.i.map(i=><div key={i} style={{ color:'rgba(92,116,136,0.5)', fontSize:11, marginBottom:8, cursor:'pointer', fontWeight:400 }}>{i}</div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', paddingTop:16, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
            <span style={{ color:'rgba(92,116,136,0.3)', fontSize:10 }}>© 2026 RenoPack — الإسكندرية</span>
            <div style={{ display:'flex', gap:3, alignItems:'center' }}>
              {[1,2,3,4,5].map(i=><Star key={i} size={9} color="var(--gold)" fill="var(--gold)"/>)}
              <span style={{ color:'rgba(92,116,136,0.35)', fontSize:9, marginRight:5 }}>4.9 من 1,247 تقييم</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
