import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Wrench, ShieldCheck, Star, MapPin, ChevronLeft,
  Zap, Droplets, Wind, Settings, Disc, Battery, Package,
  Building2, Gift, Sparkles, CheckCircle2, BadgeCheck,
  ArrowLeftRight, Plus, Minus, Layers, Send, Bot, ChevronDown
} from 'lucide-react';
import bakoImg    from '@/assets/bako-new.png';
import bakoLogoImg from '@/assets/bako-logo.png';
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

interface ComparePart {
  id: string;
  label: string;
  img: string;
  orig: { name:string; price:number; score:number; warranty:string; origin:string; badge:string; };
  turk: { name:string; price:number; score:number; warranty:string; origin:string; badge:string; };
  aiIntro: string;
  quickQ: string[];
}

const AI_COMPARE: ComparePart[] = [
  {
    id:'oil', label:'زيت الموبيل', img: partOilImg,
    orig: { name:'Mobil 1 Full Synthetic', price:320, score:97, warranty:'24 شهر', origin:'🇩🇪 ألمانيا', badge:'أصلي أوروبي' },
    turk: { name:'Selenia WR Pure Energy', price:160, score:73, warranty:'12 شهر', origin:'🇹🇷 تركيا', badge:'بديل تركي' },
    aiIntro: 'بشوف الزيتين دول — Mobil 1 الأصلي الألماني يدي ماشياً أحسن بكتير في رينو، لكن لو سيارتك أكبر من 5 سنين، Selenia التركي بيعمل شغله كويس وبيوفر عليك 160 ج.م.',
    quickQ: ['مين أحسن؟','الفرق في الجودة إيه؟','ضمان إيه؟','الموبيل يتحمل كام كيلو؟'],
  },
  {
    id:'brk', label:'فرامل Brembo', img: partBrakesImg,
    orig: { name:'Brembo Standard', price:680, score:96, warranty:'24 شهر', origin:'🇮🇹 إيطاليا', badge:'أصلي إيطالي' },
    turk: { name:'Beral Brake Pads', price:320, score:79, warranty:'12 شهر', origin:'🇹🇷 تركيا', badge:'بديل تركي' },
    aiIntro: 'الفرامل مش وقت التوفير! Brembo الإيطالي = أمان حقيقي. Beral التركي مقبول لو بتركب الفرامل عند ورشة متخصصة وعارف إيه اللي بيعمله.',
    quickQ: ['Beral بتوقف صح؟','فرق الأداء إيه؟','الأوريجنال بيدوم كام؟','ينفع أركب التركي؟'],
  },
  {
    id:'air', label:'فلتر هواء', img: partAirImg,
    orig: { name:'Renault Original Filter', price:95, score:99, warranty:'24 شهر', origin:'🇫🇷 فرنسا', badge:'أصلي رينو' },
    turk: { name:'Knecht Air Filter', price:48, score:83, warranty:'12 شهر', origin:'🇹🇷 تركيا', badge:'بديل تركي' },
    aiIntro: 'الفرق في السعر 47 ج.م بس! هنا بنصح بالأصلي لأن فلتر الهواء بيأثر على أداء الموتور كله. بس Knecht التركي لو بتفوت إصلاح سريع — كويس.',
    quickQ: ['الفلتر بيتغير كل امتى؟','التركي بيضر الموتور؟','الأصلي يستاهل فلوسه؟','الاتنين بيناسبوا كليو؟'],
  },
];

const WORKSHOPS = [
  { name:'ورشة الميناء',    area:'الميناء',    rating:4.9, jobs:847,  color:'var(--sky)' },
  { name:'سنتر المنتزه',    area:'المنتزه',    rating:4.8, jobs:1204, color:'var(--gold)' },
  { name:'ورشة العجمي',     area:'العجمي',     rating:4.7, jobs:632,  color:'var(--lav)' },
  { name:'سنتر سيدي جابر', area:'سيدي جابر', rating:4.9, jobs:980,  color:'var(--sage)' },
];

/* ─── LOGO COMPONENT ──────────────────────────────────────────── */
function RenoPackLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm:{ logo:36, ar:14, en:9 }, md:{ logo:48, ar:18, en:10 }, lg:{ logo:68, ar:24, en:13 } }[size];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <img
        src={bakoLogoImg}
        alt="باكو"
        style={{
          width: s.logo,
          height: s.logo,
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 8px rgba(200,151,74,0.4))',
          mixBlendMode: 'screen',
        }}
      />
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

function BakoChat({ context }: { context: ComparePart }) {
  const initMsg = { from:'bako' as const, text: context.aiIntro };
  const [msgs, setMsgs] = useState<ChatMsg[]>([initMsg]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs([{ from:'bako', text: context.aiIntro }]);
  }, [context.id]);

  const getReply = (msg: string): string => {
    const lower = msg.toLowerCase();
    for (const [key, val] of Object.entries(AI_QA)) {
      if (key !== 'default' && lower.includes(key)) return val;
    }
    return AI_QA['default'];
  };

  const sendText = (txt: string) => {
    if (!txt.trim()) return;
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
    <div style={{ background:'var(--bg3)', border:'1.5px solid rgba(200,151,74,0.18)', borderRadius:22, overflow:'hidden', display:'flex', flexDirection:'column', height:340 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,var(--navy),var(--navy-lt))', padding:'12px 16px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid rgba(200,151,74,0.15)' }}>
        <img src={bakoImg} alt="باكو" style={{ width:34, height:34, borderRadius:'50%', objectFit:'cover', objectPosition:'50% 22%', border:'2px solid var(--gold)', background:'var(--navy)' }} />
        <div>
          <div style={{ fontFamily:"'Almarai',sans-serif", fontWeight:800, fontSize:13, color:'#fff' }}>باكو 🤖 — بيكلمك عن {context.label}</div>
          <div style={{ fontSize:10, color:'rgba(200,151,74,0.75)', fontWeight:700 }}>اسأله أي سؤال عن القطعتين فوق</div>
        </div>
        <div style={{ marginRight:'auto', display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#4ADE80', animation:'glowBlink 2s infinite' }} />
          <span style={{ color:'rgba(255,255,255,0.45)', fontSize:10, fontWeight:700 }}>متاح</span>
        </div>
      </div>

      {/* Quick suggestion pills from context */}
      <div style={{ padding:'8px 12px', display:'flex', gap:6, flexWrap:'wrap', borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,0.01)' }}>
        {context.quickQ.map(q=>(
          <button key={q} onClick={()=>sendText(q)}
            style={{ fontFamily:"'Almarai',sans-serif", fontSize:10, fontWeight:700, padding:'3px 11px', borderRadius:999, background:'rgba(200,151,74,0.08)', border:'1px solid rgba(200,151,74,0.2)', color:'var(--gold)', cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 12px', display:'flex', flexDirection:'column', gap:10 }}>
        {msgs.map((m, i) => (
          <div key={i} className={m.from==='bako'?'chat-bubble-in':'chat-bubble-out'} style={{ display:'flex', gap:7, alignItems:'flex-end', flexDirection: m.from==='bako'?'row':'row-reverse' }}>
            {m.from==='bako' && (
              <img src={bakoImg} alt="" style={{ width:24, height:24, borderRadius:'50%', objectFit:'cover', objectPosition:'50% 22%', flexShrink:0, border:'1.5px solid var(--gold)', background:'var(--navy)' }} />
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
            <img src={bakoImg} alt="" style={{ width:26, height:26, borderRadius:'50%', objectFit:'cover', objectPosition:'50% 22%', flexShrink:0, border:'1.5px solid var(--gold)', background:'var(--navy)' }} />
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
      <div style={{ padding:'10px 12px', borderTop:'1px solid var(--border)', display:'flex', gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ sendText(input); }}}
          placeholder="اسأل باكو أي سؤال عن القطعتين..."
          style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:999, padding:'8px 14px', color:'var(--text)', fontSize:12, fontFamily:"'Almarai',sans-serif", outline:'none', direction:'rtl' }}
          onFocus={e=>{e.target.style.borderColor='rgba(200,151,74,0.4)'}}
          onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.09)'}}
        />
        <button onClick={()=>sendText(input)} style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold),var(--gold-lt))', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 14px rgba(200,151,74,0.3)', transition:'transform .2s' }}
          onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.08)')}
          onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
          <Send size={14} color="var(--bg)" />
        </button>
      </div>
    </div>
  );
}

/* ─── 3D PACKAGE BOX ──────────────────────────────────────────── */
const PKG_META: Record<string, {
  topColor:string; sideColor:string; accent:string;
  frontGrad:string; glow:string; kmNum:string;
}> = {
  km20: { topColor:'#1A5A84', sideColor:'#0E3A56', accent:'#4AABCA', frontGrad:'linear-gradient(160deg,#1A3A52,#0D1220 85%)', glow:'rgba(74,171,202,0.5)', kmNum:'20' },
  km40: { topColor:'#7A4B0E', sideColor:'#4E3005', accent:'#C8974A', frontGrad:'linear-gradient(160deg,#3A2100,#0D1220 85%)', glow:'rgba(200,151,74,0.5)', kmNum:'40' },
  km60: { topColor:'#3A2A86', sideColor:'#241870', accent:'#7B72B8', frontGrad:'linear-gradient(160deg,#1E1448,#0D1220 85%)', glow:'rgba(123,114,184,0.5)', kmNum:'60' },
};

function PackageBox3D({ pkg, selected, onClick, boxIdx }: {
  pkg: typeof READY_PACKAGES[0]; selected: boolean; onClick: ()=>void; boxIdx: number;
}) {
  const m = PKG_META[pkg.id];
  const W = 210, H = 310, D = 40;

  return (
    <div
      onClick={onClick}
      onMouseEnter={e=>{ if(!selected)(e.currentTarget as HTMLElement).style.transform=`translateY(-10px) scale(1.02)`; }}
      onMouseLeave={e=>{ if(!selected)(e.currentTarget as HTMLElement).style.transform=`translateY(0) scale(1)`; }}
      style={{
        position:'relative',
        width: W + D,
        cursor:'pointer',
        zIndex: selected ? 10 : 1,
        transform: selected ? 'translateY(-30px) scale(1.06)' : 'translateY(0) scale(1)',
        transition:'transform .5s cubic-bezier(.34,1.4,.64,1), filter .3s ease',
        filter: selected
          ? `drop-shadow(0 32px 42px ${m.glow})`
          : 'drop-shadow(0 10px 22px rgba(0,0,0,0.6))',
      }}
    >
      {/* ── TOP FACE ── */}
      <div style={{
        width: W,
        height: D,
        background:`linear-gradient(135deg,${m.topColor}ff,${m.topColor}99)`,
        borderRadius:'10px 10px 0 0',
        marginLeft: D,
        transformOrigin:'bottom center',
        transform:'perspective(250px) rotateX(58deg)',
        position:'relative',
        overflow:'hidden',
      }}>
        {/* top shine */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(255,255,255,0.08),transparent 60%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:4, left:0, right:0, textAlign:'center', fontSize:8, letterSpacing:2.5, fontWeight:800, color:'rgba(255,255,255,0.3)' }}>RENOPACK</div>
      </div>

      <div style={{ display:'flex' }}>
        {/* ── SIDE FACE (left) ── */}
        <div style={{
          width: D,
          height: H,
          background:`linear-gradient(180deg,${m.sideColor}ff,${m.sideColor}66)`,
          borderRadius:'0 0 0 10px',
          transformOrigin:'right center',
          transform:'perspective(250px) rotateY(55deg)',
          flexShrink:0,
          position:'relative',
          overflow:'hidden',
        }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(255,255,255,0.05),transparent 50%)', pointerEvents:'none' }}/>
          {/* vertical text on spine */}
          <div style={{ position:'absolute', top:0, bottom:0, left:0, right:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ writingMode:'vertical-rl', fontSize:9, fontWeight:800, color:`${m.accent}55`, letterSpacing:3, transform:'rotate(180deg)' }}>{pkg.name}</div>
          </div>
        </div>

        {/* ── FRONT FACE ── */}
        <div style={{
          width: W,
          height: H,
          background: m.frontGrad,
          border:`1.5px solid ${m.accent}28`,
          borderTop:`3px solid ${m.accent}55`,
          borderLeft:'none',
          borderRadius:'0 0 12px 0',
          overflow:'hidden',
          position:'relative',
          padding:'18px 16px 16px',
          display:'flex', flexDirection:'column',
        }}>
          {/* glass sheen */}
          <div style={{ position:'absolute',top:0,left:0,width:'45%',height:'100%',background:'linear-gradient(to right,rgba(255,255,255,0.04),transparent)',pointerEvents:'none' }}/>
          {/* top accent line */}
          <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${m.accent}88,${m.accent}22)`,pointerEvents:'none' }}/>

          {/* Brand label */}
          <div style={{ fontSize:9, fontWeight:800, color:`${m.accent}aa`, letterSpacing:2.5, marginBottom:10 }}>RENOPACK ■</div>

          {/* BIG KM Number */}
          <div style={{ position:'relative', marginBottom:4, lineHeight:1 }}>
            <div style={{ fontSize:72, fontWeight:900, color:m.accent, opacity:0.12, position:'absolute', top:-8, left:-4, fontFamily:'monospace', letterSpacing:-4 }}>{m.kmNum}</div>
            <div style={{ fontSize:52, fontWeight:900, color:m.accent, letterSpacing:-3, position:'relative' }}>{m.kmNum}</div>
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.45)', marginBottom:14, letterSpacing:.5 }}>ألف كيلومتر</div>

          {/* Tier badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:`${m.accent}12`, border:`1px solid ${m.accent}28`, borderRadius:999, padding:'3px 10px', marginBottom:12, width:'fit-content' }}>
            <span style={{ fontSize:10, fontWeight:700, color:m.accent }}>{pkg.sub}</span>
          </div>

          {/* Package name */}
          <div style={{ fontSize:13, fontWeight:800, color:'#D0DCE8', marginBottom:'auto' }}>{pkg.name}</div>

          {/* Price block */}
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:28, fontWeight:800, color:'#E8F0F8', letterSpacing:-1.5, lineHeight:1 }}>
              {pkg.price.toLocaleString()}
              <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.35)', marginRight:4 }}> ج.م</span>
            </div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', fontWeight:700, marginTop:2 }}>شامل التركيب والضمان</div>
          </div>

          {/* Gift */}
          <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:6, background:'rgba(200,151,74,0.07)', border:'1px solid rgba(200,151,74,0.15)', borderRadius:8, padding:'5px 9px' }}>
            <Gift size={10} color="var(--gold)"/><span style={{ fontSize:9, fontWeight:700, color:'var(--gold)' }}>🎁 {pkg.gift}</span>
          </div>

          {/* Selected glow line */}
          {selected && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${m.accent},transparent)`, animation:'glowBlink 2s infinite' }}/>}
        </div>
      </div>

      {/* Shelf shadow */}
      <div style={{ position:'absolute', bottom:-20, left:'8%', right:'8%', height:20, background:`radial-gradient(ellipse at 50% 0%,${m.glow},transparent 70%)`, filter:'blur(5px)' }}/>
    </div>
  );
}

function ReadyPackages3D() {
  const [active, setActive] = useState('km40');
  const pkg = READY_PACKAGES.find(p=>p.id===active)!;
  const m   = PKG_META[active];

  return (
    <section style={{ padding:'72px 28px 80px', borderTop:'1px solid var(--border)', background:'var(--bg)', overflow:'hidden' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>

        {/* Heading */}
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(200,151,74,0.08)', border:'1px solid rgba(200,151,74,0.2)', borderRadius:999, padding:'5px 18px', marginBottom:16 }}>
            <Package size={13} color="var(--gold)"/><span style={{ color:'var(--gold)', fontSize:12, fontWeight:700 }}>باكدجات جاهزة</span>
          </div>
          <h2 style={{ fontSize:28, fontWeight:800, color:'#E8F0F8', marginBottom:8 }}>اختار الباكدج المناسب لسيارتك 📦</h2>
          <p style={{ color:'var(--text-dim)', fontSize:14 }}>كل باكدج بيشمل القطع + التركيب + الضمان + هدية</p>
        </div>

        {/* ── Shelf Scene ── */}
        <div style={{ position:'relative', display:'flex', justifyContent:'center', gap:24, alignItems:'flex-end', paddingBottom:50 }}>
          {/* Shelf surface line */}
          <div style={{ position:'absolute', bottom:22, left:'4%', right:'4%', height:2, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.09) 20%,rgba(255,255,255,0.14) 50%,rgba(255,255,255,0.09) 80%,transparent)', borderRadius:999 }}/>
          {/* Shelf ambient glow */}
          <div style={{ position:'absolute', bottom:0, left:'15%', right:'15%', height:40, background:'radial-gradient(ellipse at 50% 0%,rgba(200,151,74,0.06),transparent 70%)', filter:'blur(8px)' }}/>

          {READY_PACKAGES.map((p,i)=>(
            <PackageBox3D key={p.id} pkg={p} selected={active===p.id} onClick={()=>setActive(p.id)} boxIdx={i} />
          ))}
        </div>

        {/* ── Expanded details panel ── */}
        <div style={{ maxWidth:700, margin:'32px auto 0', background:`linear-gradient(145deg,${m.accent}0a,var(--bg3) 60%)`, border:`1.5px solid ${m.accent}22`, borderRadius:22, padding:'28px 32px', position:'relative', overflow:'hidden', transition:'all .4s ease' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${m.accent}66,transparent)` }}/>
          {/* top row */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
            <div>
              <h3 style={{ fontSize:19, fontWeight:800, color:'#E8F0F8', marginBottom:6 }}>{pkg.name}</h3>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:`${m.accent}12`, border:`1px solid ${m.accent}28`, borderRadius:999, padding:'4px 12px' }}>
                <Gift size={11} color={m.accent}/><span style={{ color:m.accent, fontSize:11, fontWeight:700 }}>هديتك: {pkg.gift}</span>
              </div>
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:34, fontWeight:800, color:m.accent, lineHeight:1, letterSpacing:-1.5 }}>{pkg.price.toLocaleString()}</div>
              <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:700 }}>ج.م شامل التركيب</div>
            </div>
          </div>
          {/* includes grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 24px', marginBottom:22 }}>
            {pkg.includes.map(s=>(
              <div key={s} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <CheckCircle2 size={13} color={m.accent} style={{ flexShrink:0 }}/>
                <span style={{ color:'var(--text)', fontSize:12, fontWeight:700 }}>{s}</span>
              </div>
            ))}
          </div>
          {/* CTA */}
          <button className="pill" style={{ width:'100%', background:`linear-gradient(135deg,${m.accent},${m.accent}bb)`, color:'#0D1220', border:'none', padding:'13px', fontWeight:800, fontSize:14, boxShadow:`0 8px 26px ${m.glow}` }}>
            احجز الباكدج واستلم الهدية ←
          </button>
        </div>

      </div>
    </section>
  );
}

/* ─── AI COMPARE SECTION ─────────────────────────────────────── */
function ScoreBar({ score, color }: { score:number; color:string }) {
  return (
    <div style={{ height:6, background:'rgba(255,255,255,0.07)', borderRadius:999, overflow:'hidden' }}>
      <div style={{ width:`${score}%`, height:'100%', background:color, borderRadius:999, transition:'width .8s ease' }} />
    </div>
  );
}

function AiCompareSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const cp = AI_COMPARE[activeIdx];

  return (
    <section style={{ padding:'64px 28px', background:'linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%)' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>

        {/* Heading */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(123,114,184,0.09)', border:'1px solid rgba(123,114,184,0.2)', borderRadius:999, padding:'5px 18px', marginBottom:16 }}>
            <Sparkles size={13} color="var(--lav)"/><span style={{ color:'var(--lav)', fontSize:12, fontWeight:700 }}>باكو يقارنلك — اختار القطعة</span>
          </div>
          <h2 style={{ fontSize:26, fontWeight:800, color:'#E8F0F8', marginBottom:8 }}>أصلي ولا تركي؟ 🤔 خلي باكو يساعدك</h2>
          <p style={{ color:'var(--text-dim)', fontSize:14 }}>اختار القطعة اللي عايز تقارن فيها — وكلم باكو تحت</p>

          {/* Part selector pills */}
          <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:18 }}>
            {AI_COMPARE.map((c,i)=>(
              <button key={c.id} onClick={()=>setActiveIdx(i)}
                style={{ fontFamily:"'Almarai',sans-serif", padding:'7px 20px', borderRadius:999, border:`1.5px solid ${i===activeIdx?'var(--gold)':'rgba(255,255,255,0.1)'}`, background: i===activeIdx?'rgba(200,151,74,0.12)':'transparent', color: i===activeIdx?'var(--gold)':'var(--text-dim)', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all .25s' }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Two Product Cards ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
          {/* Original card */}
          <div style={{ background:'var(--bg3)', border:'1.5px solid rgba(61,168,130,0.3)', borderRadius:20, overflow:'hidden', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--sage),rgba(61,168,130,0.3))' }} />
            {/* Photo */}
            <div style={{ height:180, overflow:'hidden', position:'relative' }}>
              <img src={cp.img} alt={cp.orig.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', filter:'brightness(0.85) saturate(1.1)' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 45%, var(--bg3) 100%)' }} />
              {/* Badge */}
              <div style={{ position:'absolute', top:12, right:12, background:'rgba(61,168,130,0.88)', backdropFilter:'blur(8px)', borderRadius:999, padding:'4px 12px', fontSize:11, fontWeight:800, color:'#fff', letterSpacing:.3 }}>
                ✅ {cp.orig.badge}
              </div>
              <div style={{ position:'absolute', bottom:12, left:12, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.7)' }}>
                {cp.orig.origin}
              </div>
            </div>
            {/* Info */}
            <div style={{ padding:'16px 18px 20px' }}>
              <div style={{ fontWeight:800, fontSize:15, color:'#E8F0F8', marginBottom:4 }}>{cp.orig.name}</div>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--sage)', marginBottom:14 }}>{cp.orig.price.toLocaleString()} ج.م</div>
              {/* Quality bar */}
              <div style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ color:'var(--text-dim)', fontSize:11, fontWeight:700 }}>مؤشر الجودة</span>
                  <span style={{ color:'var(--sage)', fontSize:11, fontWeight:800 }}>{cp.orig.score}%</span>
                </div>
                <ScoreBar score={cp.orig.score} color="var(--sage)" />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:12 }}>
                <div style={{ background:'rgba(61,168,130,0.1)', border:'1px solid rgba(61,168,130,0.25)', borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700, color:'var(--sage)' }}>
                  🛡️ ضمان {cp.orig.warranty}
                </div>
              </div>
            </div>
          </div>

          {/* Turkish card */}
          <div style={{ background:'var(--bg3)', border:'1.5px solid rgba(74,171,202,0.3)', borderRadius:20, overflow:'hidden', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--sky),rgba(74,171,202,0.3))' }} />
            {/* Photo with slight hue shift */}
            <div style={{ height:180, overflow:'hidden', position:'relative' }}>
              <img src={cp.img} alt={cp.turk.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', filter:'brightness(0.75) saturate(0.85) hue-rotate(15deg)' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 45%, var(--bg3) 100%)' }} />
              {/* Badge */}
              <div style={{ position:'absolute', top:12, right:12, background:'rgba(74,171,202,0.88)', backdropFilter:'blur(8px)', borderRadius:999, padding:'4px 12px', fontSize:11, fontWeight:800, color:'#fff', letterSpacing:.3 }}>
                🇹🇷 {cp.turk.badge}
              </div>
              <div style={{ position:'absolute', bottom:12, left:12, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.7)' }}>
                {cp.turk.origin}
              </div>
            </div>
            {/* Info */}
            <div style={{ padding:'16px 18px 20px' }}>
              <div style={{ fontWeight:800, fontSize:15, color:'#E8F0F8', marginBottom:4 }}>{cp.turk.name}</div>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--sky)', marginBottom:14 }}>{cp.turk.price.toLocaleString()} ج.م</div>
              {/* Quality bar */}
              <div style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ color:'var(--text-dim)', fontSize:11, fontWeight:700 }}>مؤشر الجودة</span>
                  <span style={{ color:'var(--sky)', fontSize:11, fontWeight:800 }}>{cp.turk.score}%</span>
                </div>
                <ScoreBar score={cp.turk.score} color="var(--sky)" />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:12 }}>
                <div style={{ background:'rgba(74,171,202,0.1)', border:'1px solid rgba(74,171,202,0.25)', borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700, color:'var(--sky)' }}>
                  🛡️ ضمان {cp.turk.warranty}
                </div>
                <div style={{ background:'rgba(200,151,74,0.08)', border:'1px solid rgba(200,151,74,0.2)', borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700, color:'var(--gold)' }}>
                  💰 وفر {(cp.orig.price - cp.turk.price).toLocaleString()} ج.م
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bako Chat below ── */}
        <BakoChat context={cp} />
      </div>
    </section>
  );
}

/* ─── MAIN ────────────────────────────────────────────────────── */
export function AlexandriaBlend() {
  const [activeService, setActiveService] = useState<number|null>(null);
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [searchVal, setSearchVal]         = useState('');
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

        {/* ═══ HERO — CINEMATIC ═══ */}
        <section style={{ position:'relative', minHeight:580, overflow:'hidden', display:'flex', alignItems:'center' }}>
          {/* ── Background layers ── */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
            {/* Base deep gradient */}
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 120% 100% at 70% 50%, rgba(26,35,86,0.5) 0%, var(--bg) 70%)' }}/>
            {/* Gold corona behind Bako */}
            <div style={{ position:'absolute', top:'50%', left:'62%', transform:'translate(-50%,-50%)', width:560, height:560, background:'radial-gradient(circle,rgba(200,151,74,0.13) 0%,rgba(200,151,74,0.05) 40%,transparent 70%)', borderRadius:'50%', animation:'blobMorph 8s ease-in-out infinite' }}/>
            {/* Sky halo */}
            <div style={{ position:'absolute', top:'-10%', left:'-5%', width:500, height:500, background:'radial-gradient(circle,rgba(74,171,202,0.07) 0%,transparent 65%)', animation:'blobMorph2 12s ease-in-out infinite 4s' }}/>
            {/* Perspective grid floor */}
            <svg style={{ position:'absolute', bottom:0, left:0, right:0, width:'100%', height:220, opacity:0.07 }} viewBox="0 0 1280 220" preserveAspectRatio="none">
              {[0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1].map((t,i)=>{
                const y=220-t*220;
                return <line key={i} x1={640-640*t} y1={220} x2={640+640*t} y2={y} stroke="rgba(200,151,74,1)" strokeWidth=".8"/>;
              })}
              {[...Array(9)].map((_,i)=>{
                const p=(i+1)/10;const y=220-p*220;const xL=640-640*p;const xR=640+640*p;
                return <line key={i} x1={xL} y1={y} x2={xR} y2={y} stroke="rgba(200,151,74,1)" strokeWidth=".6"/>;
              })}
            </svg>
            {/* Speed lines */}
            {[15,30,50,70,85].map((left,i)=>(
              <div key={i} style={{ position:'absolute', top:0, bottom:0, left:`${left}%`, width:1, background:`linear-gradient(to bottom,transparent,rgba(255,255,255,0.03) 40%,rgba(255,255,255,0.05) 60%,transparent)` }}/>
            ))}
            {/* Floating particles */}
            {[
              {top:'18%',left:'8%', c:'var(--gold)',d:'0s',sz:5},{top:'72%',left:'14%',c:'var(--sky)',d:'1.8s',sz:4},
              {top:'40%',left:'28%',c:'var(--lav)',d:'3.2s',sz:3},{top:'12%',left:'44%',c:'var(--sage)',d:'.6s',sz:4},
              {top:'80%',left:'52%',c:'var(--gold)',d:'2.1s',sz:3},{top:'25%',left:'76%',c:'var(--sky)',d:'1.2s',sz:5},
            ].map((p,i)=>(
              <div key={i} style={{ position:'absolute', top:p.top, left:p.left, width:p.sz, height:p.sz, borderRadius:'50%', background:p.c, boxShadow:`0 0 ${p.sz*2}px ${p.c}`, animation:`particleDrift ${4+i}s ease-in-out infinite ${p.d}` }}/>
            ))}
          </div>

          <div style={{ maxWidth:1280, margin:'0 auto', padding:'60px 28px', position:'relative', display:'grid', gridTemplateColumns:'1.15fr 0.85fr', gap:0, alignItems:'center', width:'100%' }}>

            {/* ── LEFT: Text ── */}
            <div style={{ animation:'fadeUp .7s ease both' }}>
              {/* Platform badge */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(200,151,74,0.07)', border:'1px solid rgba(200,151,74,0.22)', borderRadius:999, padding:'6px 18px', marginBottom:28 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--gold)', boxShadow:'0 0 8px var(--gold)', animation:'glowBlink 2s infinite' }}/>
                <span style={{ color:'var(--gold)', fontSize:12, fontWeight:700, letterSpacing:.3 }}>منصة قطع الغيار الأولى — الإسكندرية</span>
              </div>

              {/* BIG headline */}
              <h1 style={{ fontSize:52, fontWeight:800, lineHeight:1.2, letterSpacing:-1, marginBottom:10, color:'#E8F0F8' }}>
                مش بنبيع<br/>
                <span style={{ fontSize:62, background:'linear-gradient(130deg,var(--gold) 30%,var(--gold-lt) 60%,var(--sky))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:-2 }}>قطعة.</span>
              </h1>
              <h2 style={{ fontSize:26, fontWeight:700, color:'rgba(255,255,255,0.38)', marginBottom:28, letterSpacing:-.5 }}>بنبيع <span style={{ color:'rgba(200,151,74,0.75)', fontWeight:800 }}>باكدج كامل.</span></h2>

              <p style={{ color:'var(--text-dim)', fontSize:14, lineHeight:1.9, marginBottom:32, maxWidth:500, borderRight:'3px solid rgba(200,151,74,0.25)', paddingRight:16 }}>
                زي أوبر — إحنا الوسيط بين مراكز قطع الغيار وورش التركيب في الإسكندرية.<br/>
                إنت بتدفع <strong style={{ color:'var(--gold)' }}>مرة واحدة</strong> — القطعة، التركيب، والضمان علينا.
              </p>

              {/* Service pills */}
              <p style={{ color:'rgba(255,255,255,0.25)', fontSize:10, fontWeight:700, marginBottom:12, letterSpacing:2 }}>ابدأ من اللي محتاجه:</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:9, marginBottom:18 }}>
                {SERVICES.map((s,i)=>{
                  const on=activeService===i;
                  return (
                    <button key={i} className="pill" onClick={()=>setActiveService(on?null:i)} style={{
                      padding:'10px 20px',
                      background: on ? `${s.color}18` : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${on?s.color:'rgba(255,255,255,0.07)'}`,
                      color: on ? s.color : 'var(--text-dim)',
                      fontSize:13, fontWeight:700,
                      boxShadow: on ? `0 0 18px ${s.color}30, inset 0 0 12px ${s.color}08` : 'none',
                      transform: on ? 'translateY(-2px)' : 'none',
                    }}>
                      <s.icon size={13} style={{ marginLeft:7, display:'inline', verticalAlign:'middle' }}/>{s.label}
                    </button>
                  );
                })}
              </div>
              {activeService!==null&&(
                <div style={{ animation:'fadeUp .25s ease', background:`${SERVICES[activeService].color}08`, border:`1px solid ${SERVICES[activeService].color}22`, borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:4 }}>
                  <span style={{ color:'var(--text)', fontSize:13, fontWeight:700 }}>
                    عندنا باكدج شامل <strong style={{ color:SERVICES[activeService].color }}>{SERVICES[activeService].label}</strong> — قطعة + تركيب + ضمان
                  </span>
                  <button className="pill" style={{ background:SERVICES[activeService].color, color:'var(--bg)', padding:'7px 16px', fontWeight:800, fontSize:12, flexShrink:0, boxShadow:`0 4px 14px ${SERVICES[activeService].color}40` }}>اختار الباكدج</button>
                </div>
              )}

              {/* Stats row */}
              <div style={{ display:'flex', gap:0, marginTop:32, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { n:'1,247+', l:'عميل تخدمناه', c:'var(--gold)' },
                  { n:'4.9★',   l:'متوسط التقييم', c:'var(--sky)' },
                  { n:'32',     l:'ورشة معتمدة',   c:'var(--sage)' },
                  { n:'98%',    l:'رضا العملاء',   c:'var(--lav)' },
                ].map(({n,l,c},i)=>(
                  <div key={l} style={{ flex:1, textAlign:'center', padding:'0 8px', borderLeft: i>0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ fontSize:22, fontWeight:800, color:c, lineHeight:1 }}>{n}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontWeight:700, marginTop:4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Bako cinematic ── */}
            <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {/* Outer ring */}
              <div style={{ position:'absolute', width:340, height:340, borderRadius:'50%', border:'1px solid rgba(200,151,74,0.08)', animation:'blobMorph 6s ease-in-out infinite' }}/>
              <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', border:'1px dashed rgba(200,151,74,0.1)', animation:'blobMorph2 8s ease-in-out infinite 2s' }}/>

              {/* Bako */}
              <div style={{ position:'relative', zIndex:5, animation:'floatBako 5s ease-in-out infinite' }}>
                <img src={bakoImg} alt="باكو" style={{ width:320, height:320, objectFit:'contain', filter:'drop-shadow(0 28px 55px rgba(200,151,74,0.45)) drop-shadow(0 0 100px rgba(200,151,74,0.2))', display:'block', margin:'0 auto' }} />
                {/* Speech bubble */}
                <div style={{ position:'absolute', top:22, right:260, background:'rgba(13,18,32,0.92)', backdropFilter:'blur(12px)', border:'1.5px solid rgba(200,151,74,0.35)', borderRadius:'16px 16px 4px 16px', padding:'10px 16px', whiteSpace:'nowrap', boxShadow:'0 8px 24px rgba(0,0,0,0.4)', animation:'glowBlink 3s infinite' }}>
                  <div style={{ color:'var(--gold)', fontSize:12, fontWeight:800, marginBottom:2 }}>أهلاً! أنا باكو 👋</div>
                  <div style={{ color:'rgba(255,255,255,0.5)', fontSize:10, fontWeight:700 }}>هساعدك تختار أحسن قطعة</div>
                </div>
              </div>

              {/* Floating stat cards */}
              {[
                { top:30, left:-40, c:'var(--sky)',  icon:'🛡️', t:'ضمان 24 شهر', s:'على كل القطع' },
                { bottom:40, right:-30, c:'var(--sage)', icon:'⚡', t:'تركيب سريع', s:'خلال 24 ساعة' },
              ].map(({top,bottom,left,right,c,icon,t,s},i)=>(
                <div key={i} style={{
                  position:'absolute', top, bottom, left, right,
                  background:'rgba(13,18,32,0.88)', backdropFilter:'blur(12px)',
                  border:`1px solid ${c}25`, borderRadius:14, padding:'10px 14px',
                  boxShadow:`0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${c}12`,
                  animation:`floatBako ${5+i}s ease-in-out infinite ${i}s`,
                  zIndex:4,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:20 }}>{icon}</span>
                    <div>
                      <div style={{ color:'#E8F0F8', fontSize:12, fontWeight:800 }}>{t}</div>
                      <div style={{ color:'rgba(255,255,255,0.35)', fontSize:10, fontWeight:700 }}>{s}</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* How it works — compact */}
              <div style={{ position:'absolute', bottom:-20, left:'50%', transform:'translateX(-50%)', display:'flex', gap:10, background:'rgba(13,18,32,0.9)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'12px 20px', whiteSpace:'nowrap', zIndex:6 }}>
                {[
                  {Icon:Package,   c:'#4AABCA', l:'مراكز القطع'},
                  {Icon:ArrowLeftRight, c:'var(--gold)', l:'RenoPack'},
                  {Icon:Wrench,    c:'#C8974A', l:'ورش التركيب'},
                  {Icon:BadgeCheck,c:'#3DA882', l:'ضمان كامل'},
                ].map(({Icon,c,l},i)=>(
                  <React.Fragment key={l}>
                    {i>0&&<div style={{ width:1, background:'rgba(255,255,255,0.07)', alignSelf:'stretch' }}/>}
                    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'0 4px' }}>
                      <Icon size={13} color={c}/><span style={{ color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700 }}>{l}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PARTS SHOWCASE — MAGAZINE ═══ */}
        <section style={{ padding:'52px 28px', borderTop:'1px solid var(--border)', background:'linear-gradient(180deg,var(--bg2),var(--bg))' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
              <div>
                <h2 style={{ fontSize:22, fontWeight:800, color:'#E8F0F8', marginBottom:4 }}>قطع رينو — أصلي وتركي 🔧</h2>
                <p style={{ color:'var(--text-dim)', fontSize:13 }}>كل القطع متاحة بخيارين — الأصلي بضمان 24 شهر، التركي بضمان 12 شهر</p>
              </div>
              <button style={{ display:'flex', alignItems:'center', gap:6, color:'var(--gold)', background:'rgba(200,151,74,0.07)', border:'1px solid rgba(200,151,74,0.2)', borderRadius:999, padding:'7px 16px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                كل القطع <ChevronLeft size={13}/>
              </button>
            </div>

            {/* Magazine layout */}
            <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:16 }}>

              {/* LEFT: Featured large card */}
              {(() => {
                const p = PARTS_SHOWCASE[0];
                return (
                  <div style={{ background:'var(--bg3)', border:`1.5px solid ${p.border}28`, borderRadius:22, overflow:'hidden', position:'relative', cursor:'pointer', display:'flex', flexDirection:'column' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-3px)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform=''}
                  >
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${p.border},${p.border}44,transparent)` }}/>
                    {/* Big image */}
                    <div style={{ height:230, overflow:'hidden', position:'relative', flexShrink:0 }}>
                      <img src={p.img} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .5s ease' }}
                        onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.06)')}
                        onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
                      />
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(0,0,0,0.08) 0%,transparent 35%,var(--bg3) 100%)' }}/>
                      <div style={{ position:'absolute', top:14, right:14, background:'rgba(13,18,32,0.85)', backdropFilter:'blur(8px)', border:`1px solid ${p.badgeColor}40`, borderRadius:999, padding:'4px 12px', fontSize:10, fontWeight:800, color:p.badgeColor }}>
                        ⭐ الأكثر طلباً
                      </div>
                    </div>
                    {/* Content */}
                    <div style={{ padding:'18px 20px 20px', flex:1, display:'flex', flexDirection:'column' }}>
                      <div style={{ fontSize:16, fontWeight:800, color:'#E8F0F8', marginBottom:6 }}>{p.name}</div>
                      {/* Two price options */}
                      <div style={{ display:'flex', gap:10, marginBottom:14 }}>
                        <div style={{ flex:1, background:'rgba(61,168,130,0.07)', border:'1px solid rgba(61,168,130,0.2)', borderRadius:12, padding:'8px 12px' }}>
                          <div style={{ fontSize:9, fontWeight:700, color:'var(--sage)', marginBottom:2 }}>✅ أصلي أوروبي</div>
                          <div style={{ fontSize:18, fontWeight:800, color:'var(--sage)' }}>{p.price}</div>
                        </div>
                        <div style={{ flex:1, background:'rgba(74,171,202,0.07)', border:'1px solid rgba(74,171,202,0.2)', borderRadius:12, padding:'8px 12px' }}>
                          <div style={{ fontSize:9, fontWeight:700, color:'var(--sky)', marginBottom:2 }}>🇹🇷 تركي كفاءة</div>
                          <div style={{ fontSize:18, fontWeight:800, color:'var(--sky)' }}>160 ج.م</div>
                        </div>
                      </div>
                      <button className="pill" style={{ width:'100%', background:`linear-gradient(135deg,${p.border},${p.border}99)`, color:'#0D1220', border:'none', padding:'11px', fontWeight:800, fontSize:13, marginTop:'auto', boxShadow:`0 6px 20px ${p.border}35` }}>
                        أضف للباكدج ←
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* RIGHT: 2×3 smaller cards */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {PARTS_SHOWCASE.slice(1).map((p,i)=>(
                  <div key={i} style={{ background:'var(--bg3)', border:`1.5px solid ${p.border}22`, borderRadius:16, overflow:'hidden', position:'relative', cursor:'pointer', display:'flex', flexDirection:'column', transition:'transform .25s ease, box-shadow .25s ease' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-3px)';(e.currentTarget as HTMLElement).style.boxShadow=`0 12px 28px rgba(0,0,0,0.35), 0 0 0 1px ${p.border}20`;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='';(e.currentTarget as HTMLElement).style.boxShadow='';}}
                  >
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${p.border},transparent)` }}/>
                    <div style={{ height:96, overflow:'hidden', position:'relative', flexShrink:0 }}>
                      <img src={p.img} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .4s ease' }}
                        onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.08)')}
                        onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
                      />
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 40%,var(--bg3) 100%)' }}/>
                      <div style={{ position:'absolute', top:7, left:7, background:`${p.badgeColor}20`, border:`1px solid ${p.badgeColor}45`, borderRadius:999, padding:'2px 7px', fontSize:8, fontWeight:800, color:p.badgeColor }}>{p.badge}</div>
                    </div>
                    <div style={{ padding:'9px 12px 12px', flex:1, display:'flex', flexDirection:'column' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:6, lineHeight:1.35 }}>{p.name}</div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto' }}>
                        <div style={{ fontSize:14, fontWeight:800, color:'var(--gold)' }}>{p.price}</div>
                        <div style={{ background:`${p.border}14`, border:`1px solid ${p.border}28`, borderRadius:6, padding:'3px 8px', fontSize:9, fontWeight:700, color:p.border }}>+ أضف</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ READY PACKAGES 3D ═══ */}
        <ReadyPackages3D />

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

        {/* ═══ BAKO AI COMPARE + CHAT ═══ */}
        <AiCompareSection />

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
