import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  Search, Wrench, ShieldCheck, Star, MapPin, ChevronLeft,
  Zap, Droplets, Wind, Settings, Disc, Battery, Package,
  Building2, Gift, Sparkles, CheckCircle2, BadgeCheck,
  ArrowLeftRight, Plus, Minus, Layers, Send, Bot, ChevronDown,
} from 'lucide-react';
import { useListPackages } from '@workspace/api-client-react';
import bakoImg    from '@/assets/bako-new.png';
import bakoLogoImg from '@/assets/bako-logo.png';
import partOilImg    from '@/assets/part-oil.jpg';
import partBrakesImg from '@/assets/part-brakes.jpg';
import partAirImg    from '@/assets/part-airfilter.jpg';
import partSparksImg from '@/assets/part-sparks.jpg';
import partBatImg    from '@/assets/part-battery.jpg';
import partSuspImg   from '@/assets/part-suspension.jpg';

/* ── Shortcuts ── */
const G  = '#C8974A'; // gold
const GL = '#DEB06C'; // gold-lt
const SK = '#4AABCA'; // sky
const LV = '#7B72B8'; // lav
const SG = '#3DA882'; // sage
const BG = '#0D1220'; // bg
const B2 = '#111826'; // bg2
const B3 = '#161E30'; // bg3
const NV = '#1A2356'; // navy
const TX = '#D4E0EC'; // text
const TD = '#7A95AA'; // text-dim
const BD = 'rgba(255,255,255,0.10)'; // border

/* ── Static data ── */
const SERVICES = [
  { icon: Droplets, label: 'تغيير زيت',   color: G  },
  { icon: Disc,     label: 'فرامل',        color: SK },
  { icon: Wind,     label: 'فلتر هواء',   color: LV },
  { icon: Zap,      label: 'كهرباء',      color: GL },
  { icon: Settings, label: 'عفشة وتروس', color: SG },
  { icon: Wrench,   label: 'عمرة شاملة', color: SK },
];

const PARTS_SHOWCASE = [
  { name: 'زيت موبيل 1',      img: partOilImg,    border: SG,  price: '320 ج.م', badge: 'أصلي',    badgeColor: SG  },
  { name: 'طقم فرامل Brembo', img: partBrakesImg, border: SK,  price: '680 ج.م', badge: 'إيطالي',  badgeColor: SK  },
  { name: 'فلتر هواء',         img: partAirImg,    border: LV,  price: '95 ج.م',  badge: 'أصلي',    badgeColor: LV  },
  { name: 'شمعات إشعال',       img: partSparksImg, border: G,   price: '320 ج.م', badge: 'أصلي',    badgeColor: G   },
  { name: 'مساعد أمامي',       img: partSuspImg,   border: TD,  price: '550 ج.م', badge: 'تركي',    badgeColor: TD  },
  { name: 'بطارية ٦٠ أمبير',   img: partBatImg,    border: SG,  price: '850 ج.م', badge: 'أصلي',    badgeColor: SG  },
];

const STATIC_PACKAGES = [
  { id: 'km20', name: 'صيانة ٢٠ألف كم', sub: 'أول صيانة',       price: 1299, color: SK,
    includes: ['زيت + فلتر زيت', 'فلتر هواء', 'فحص الفرامل', 'ضبط الإطارات'],    gift: 'ملصق RenoPack الرسمي' },
  { id: 'km40', name: 'صيانة ٤٠ألف كم', sub: '⭐ الأكثر طلباً', price: 2299, color: G,
    includes: ['كل خدمات ٢٠ك', 'شمعات إشعال', 'ترموستات + كاوتش', 'فحص كهرباء كامل'], gift: 'فرشاة عجلات احترافية' },
  { id: 'km60', name: 'صيانة ٦٠ألف كم', sub: '🔥 الشاملة',      price: 3999, color: LV,
    includes: ['كل خدمات ٤٠ك', 'سير التوقيت', 'مضخة الماء', 'فحص التروس', '+٤ خدمات إضافية'], gift: 'فلتر هواء مجاناً' },
];

const PUZZLE_PARTS = [
  { id: 'oil',   icon: Droplets, label: 'زيت موبيل 1 أصلي',  price: 320, cat: 'سوائل'  },
  { id: 'oil_f', icon: Settings, label: 'فلتر زيت',           price: 95,  cat: 'سوائل'  },
  { id: 'air_f', icon: Wind,     label: 'فلتر هواء',          price: 95,  cat: 'فلاتر'  },
  { id: 'cab_f', icon: Wind,     label: 'فلتر كابينة',        price: 75,  cat: 'فلاتر'  },
  { id: 'brk',   icon: Disc,     label: 'طقم فرامل أمامي',    price: 680, cat: 'فرامل'  },
  { id: 'pads',  icon: Disc,     label: 'تيل فرامل خلفي',     price: 420, cat: 'فرامل'  },
  { id: 'spark', icon: Zap,      label: 'طقم شمعات إشعال',    price: 320, cat: 'كهرباء' },
  { id: 'bat',   icon: Battery,  label: 'بطارية ٦٠ أمبير',    price: 850, cat: 'كهرباء' },
  { id: 'tie',   icon: Settings, label: 'روبير كفرات',        price: 180, cat: 'عفشة'   },
  { id: 'mnt',   icon: Settings, label: 'مساعد أمامي',        price: 550, cat: 'عفشة'   },
];

const GIFT_TIERS = [
  { min: 500,  gift: 'فرشاة عجلات',              icon: '🎁' },
  { min: 1500, gift: 'فلتر هواء مجاناً',         icon: '🎁' },
  { min: 3000, gift: 'ستالايت RenoPack + فلتر', icon: '🎁🎁' },
];

const AI_QA: Record<string, string> = {
  'أصلي':  'الأصلي بيجيلك من أوروبا، ضمانه 24 شهر وجودته 97%. لو سيارتك أقل من 5 سنين خد الأصلي.',
  'تركي':  'التركي كويس لو سيارتك أكبر من 5 سنين أو ميزانيتك محدودة. ضمانه 12 شهر.',
  'زيت':   'موبيل 1 الأصلي الألماني هو الأفضل لرينو. الفرق في السعر مع التركي 160 ج.م.',
  'فرامل': 'بريمبو الإيطالي هو الأصلي، Beral التركي اختيار كويس لو الميزانية محدودة.',
  'ضمان':  'كل القطع عندها ضمان — الأصلي 24 شهر، التركي 12 شهر. والضمان بيشمل القطعة والتركيب.',
  'سعر':   'الأسعار بتختلف حسب القطعة والنوع. الأصلي أغلى بس ضمانه أطول.',
  'باكدج': 'عندنا باكدجات جاهزة حسب الكيلو (20ك/40ك/60ك) وكمان بيلدر تعمل فيه الباكدج بنفسك!',
  'default':'ممكن تسألني عن أي قطعة أو خدمة! أنا باكو 🤖 وأنا هنا أساعدك تاخد أحسن قرار.',
};

interface ComparePart {
  id: string; label: string; img: string;
  orig: { name: string; price: number; score: number; warranty: string; origin: string; badge: string; };
  turk: { name: string; price: number; score: number; warranty: string; origin: string; badge: string; };
  aiIntro: string; quickQ: string[];
}

const AI_COMPARE: ComparePart[] = [
  { id: 'oil', label: 'زيت الموبيل', img: partOilImg,
    orig: { name: 'Mobil 1 Full Synthetic', price: 320, score: 97, warranty: '24 شهر', origin: '🇩🇪 ألمانيا', badge: 'أصلي أوروبي' },
    turk: { name: 'Selenia WR Pure Energy', price: 160, score: 73, warranty: '12 شهر', origin: '🇹🇷 تركيا',  badge: 'بديل تركي'  },
    aiIntro: 'بشوف الزيتين — Mobil 1 الأصلي الألماني يدي ماشياً أحسن في رينو، لكن لو سيارتك أكبر من 5 سنين، Selenia التركي بيعمل شغله كويس وبيوفر 160 ج.م.',
    quickQ: ['مين أحسن؟', 'الفرق في الجودة إيه؟', 'ضمان إيه؟', 'الموبيل يتحمل كام كيلو؟'],
  },
  { id: 'brk', label: 'فرامل Brembo', img: partBrakesImg,
    orig: { name: 'Brembo Standard', price: 680, score: 96, warranty: '24 شهر', origin: '🇮🇹 إيطاليا', badge: 'أصلي إيطالي' },
    turk: { name: 'Beral Brake Pads', price: 320, score: 79, warranty: '12 شهر', origin: '🇹🇷 تركيا',   badge: 'بديل تركي'  },
    aiIntro: 'الفرامل مش وقت التوفير! Brembo الإيطالي = أمان حقيقي. Beral التركي مقبول لو عند ورشة متخصصة.',
    quickQ: ['Beral بتوقف صح؟', 'فرق الأداء إيه؟', 'الأوريجنال بيدوم كام؟', 'ينفع أركب التركي؟'],
  },
  { id: 'air', label: 'فلتر هواء', img: partAirImg,
    orig: { name: 'Renault Original Filter', price: 95, score: 99, warranty: '24 شهر', origin: '🇫🇷 فرنسا', badge: 'أصلي رينو' },
    turk: { name: 'Knecht Air Filter',       price: 48, score: 83, warranty: '12 شهر', origin: '🇹🇷 تركيا', badge: 'بديل تركي' },
    aiIntro: 'الفرق في السعر 47 ج.م بس! هنا بنصح بالأصلي لأن فلتر الهواء بيأثر على الموتور كله.',
    quickQ: ['الفلتر بيتغير كل امتى؟', 'التركي بيضر الموتور؟', 'الأصلي يستاهل؟', 'الاتنين بيناسبوا كليو؟'],
  },
];

const WORKSHOPS = [
  { name: 'ورشة الميناء',     area: 'الميناء',     rating: 4.9, jobs: 847,  color: SK },
  { name: 'سنتر المنتزه',     area: 'المنتزه',     rating: 4.8, jobs: 1204, color: G  },
  { name: 'ورشة العجمي',      area: 'العجمي',      rating: 4.7, jobs: 632,  color: LV },
  { name: 'سنتر سيدي جابر',  area: 'سيدي جابر',  rating: 4.9, jobs: 980,  color: SG },
];

/* ── Score bar ── */
function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(90deg,${color},${color}99)`, borderRadius: 999, transition: 'width .8s ease' }} />
    </div>
  );
}

/* ── Bako chat (local AI) ── */
interface ChatMsg { from: 'user' | 'bako'; text: string; }

function BakoChat({ context }: { context: ComparePart }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ from: 'bako', text: context.aiIntro }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMsgs([{ from: 'bako', text: context.aiIntro }]); }, [context.id]);

  const getReply = (msg: string) => {
    const lower = msg.toLowerCase();
    for (const [k, v] of Object.entries(AI_QA)) if (k !== 'default' && lower.includes(k)) return v;
    return AI_QA['default'];
  };

  const send = (txt: string) => {
    if (!txt.trim()) return;
    setInput('');
    setMsgs(p => [...p, { from: 'user', text: txt }]);
    setTyping(true);
    setTimeout(() => { setTyping(false); setMsgs(p => [...p, { from: 'bako', text: getReply(txt) }]); }, 1200 + Math.random() * 600);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const chatBg    = B3;
  const chatHdr   = `linear-gradient(135deg,${NV},#243070)`;
  const bubbleIn  = 'rgba(26,35,86,0.7)';
  const bubbleOut = `linear-gradient(135deg,${G},${GL})`;

  return (
    <div style={{ background: chatBg, border: `1.5px solid rgba(200,151,74,0.18)`, borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 340 }}>
      <div style={{ background: chatHdr, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid rgba(200,151,74,0.15)` }}>
        <img src={bakoImg} alt="باكو" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 22%', border: `2px solid ${G}`, background: NV }} />
        <div>
          <div style={{ fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 13, color: '#fff' }}>باكو 🤖 — بيكلمك عن {context.label}</div>
          <div style={{ fontSize: 10, color: `rgba(200,151,74,0.75)`, fontWeight: 700 }}>اسأله أي سؤال عن القطعتين فوق</div>
        </div>
        <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', animation: 'rp-glow-blink 2s infinite' }} />
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700 }}>متاح</span>
        </div>
      </div>

      <div style={{ padding: '8px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: `1px solid ${BD}`, background: 'rgba(255,255,255,0.01)' }}>
        {context.quickQ.map(q => (
          <button key={q} className="rp-pill" onClick={() => send(q)} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`, color: TD, fontSize: 10, fontWeight: 700, padding: '4px 10px' }}>{q}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-end', flexDirection: m.from === 'bako' ? 'row' : 'row-reverse' }}>
            {m.from === 'bako' && (
              <img src={bakoImg} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 22%', flexShrink: 0, border: `1.5px solid ${G}`, background: NV }} />
            )}
            <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: m.from === 'bako' ? '4px 16px 16px 16px' : '16px 4px 16px 16px', background: m.from === 'bako' ? bubbleIn : bubbleOut, border: m.from === 'bako' ? `1px solid rgba(200,151,74,0.12)` : 'none', fontSize: 12, fontWeight: 700, color: m.from === 'bako' ? TX : BG, lineHeight: 1.6 }}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <img src={bakoImg} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 22%', flexShrink: 0, border: `1.5px solid ${G}`, background: NV }} />
            <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: bubbleIn, border: `1px solid rgba(200,151,74,0.12)`, display: 'flex', gap: 5, alignItems: 'center' }}>
              <div className="rp-dot1" style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
              <div className="rp-dot2" style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
              <div className="rp-dot3" style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '10px 12px', borderTop: `1px solid ${BD}`, display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="اسأل باكو..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: '9px 14px', color: TX, fontSize: 12, fontFamily: "'Almarai',sans-serif", fontWeight: 700, outline: 'none' }} />
        <button onClick={() => send(input)} style={{ background: `linear-gradient(135deg,${G},${GL})`, border: 'none', borderRadius: 12, padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Send size={13} color={BG} />
        </button>
      </div>
    </div>
  );
}

/* ── AI Compare section ── */
function AiCompareSection() {
  const [sel, setSel] = useState(0);
  const part = AI_COMPARE[sel];
  const savings = part.orig.price - part.turk.price;

  return (
    <section style={{ padding: '64px 28px', background: `linear-gradient(180deg,${B2},${BG})`, borderTop: `1px solid ${BD}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: `rgba(200,151,74,0.08)`, border: `1px solid rgba(200,151,74,0.2)`, borderRadius: 999, padding: '5px 16px', marginBottom: 14 }}>
            <Bot size={13} color={G} /><span style={{ color: G, fontSize: 12, fontWeight: 700 }}>باكو AI — مقارنة ذكية</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#E8F0F8', marginBottom: 8, fontFamily: "'Almarai',sans-serif" }}>أصلي ولا تركي؟ باكو يقولك الإجابة 🤖</h2>
          <p style={{ color: TD, fontSize: 14 }}>مقارنة لحظية بالجودة والسعر والضمان — وباكو موجود يشرحلك</p>
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 36 }}>
          {AI_COMPARE.map((p, i) => (
            <button key={p.id} className="rp-pill" onClick={() => setSel(i)} style={{
              padding: '10px 22px', fontSize: 13, fontWeight: 700,
              background: sel === i ? `rgba(200,151,74,0.12)` : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${sel === i ? G : BD}`,
              color: sel === i ? G : TD,
              boxShadow: sel === i ? `0 0 18px rgba(200,151,74,0.2)` : 'none',
            }}>{p.label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Original */}
          <div style={{ background: B3, border: `1.5px solid ${SG}22`, borderRadius: 20, padding: 22, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -10, right: 20, background: SG, borderRadius: 999, padding: '3px 12px', fontSize: 10, fontWeight: 800, color: BG }}>{part.orig.badge}</div>
            <div style={{ height: 120, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              <img src={part.img} alt={part.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#E8F0F8', marginBottom: 4 }}>{part.orig.name}</div>
            <div style={{ fontSize: 10, color: TD, marginBottom: 14 }}>{part.orig.origin} · ضمان {part.orig.warranty}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: TD, fontSize: 11, fontWeight: 700 }}>نقاط الجودة</span>
              <span style={{ color: SG, fontWeight: 800, fontSize: 14 }}>{part.orig.score}/100</span>
            </div>
            <ScoreBar score={part.orig.score} color={SG} />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: SG }}>{part.orig.price} ج.م</span>
            </div>
          </div>

          {/* Turkish */}
          <div style={{ background: B3, border: `1.5px solid ${SK}22`, borderRadius: 20, padding: 22, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -10, right: 20, background: SK, borderRadius: 999, padding: '3px 12px', fontSize: 10, fontWeight: 800, color: BG }}>{part.turk.badge}</div>
            <div style={{ position: 'absolute', top: 12, left: 12, background: `rgba(200,151,74,0.9)`, borderRadius: 8, padding: '4px 10px', fontSize: 10, fontWeight: 800, color: BG }}>
              وفّر {savings} ج.م
            </div>
            <div style={{ height: 120, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              <img src={part.img} alt={part.label} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'hue-rotate(180deg) saturate(0.7)' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#E8F0F8', marginBottom: 4 }}>{part.turk.name}</div>
            <div style={{ fontSize: 10, color: TD, marginBottom: 14 }}>{part.turk.origin} · ضمان {part.turk.warranty}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: TD, fontSize: 11, fontWeight: 700 }}>نقاط الجودة</span>
              <span style={{ color: SK, fontWeight: 800, fontSize: 14 }}>{part.turk.score}/100</span>
            </div>
            <ScoreBar score={part.turk.score} color={SK} />
            <div style={{ marginTop: 16 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: SK }}>{part.turk.price} ج.م</span>
            </div>
          </div>
        </div>

        {/* Bako chat */}
        <BakoChat context={part} />
      </div>
    </section>
  );
}

/* ── Ready packages section (uses real API data) ── */
function ReadyPackagesSection({ realPackages }: { realPackages?: Array<{ id: number; name: string; slug: string; price: string | number; description?: string }> }) {
  const [active, setActive] = useState(1);

  const pkgs = realPackages && realPackages.length >= 3
    ? realPackages.slice(0, 3).map((p, i) => ({
        id: p.slug,
        name: p.name,
        sub: i === 1 ? '⭐ الأكثر طلباً' : i === 2 ? '🔥 الشاملة' : 'أول صيانة',
        price: (typeof p.price === 'string' ? parseInt(p.price, 10) : (p.price as number)) || 0,
        color: [SK, G, LV][i],
        includes: STATIC_PACKAGES[i].includes,
        gift: STATIC_PACKAGES[i].gift,
      }))
    : STATIC_PACKAGES;

  return (
    <section style={{ padding: '64px 28px', background: B2, borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: `rgba(200,151,74,0.09)`, border: `1px solid rgba(200,151,74,0.2)`, borderRadius: 999, padding: '5px 16px', marginBottom: 14 }}>
            <Package size={13} color={G} /><span style={{ color: G, fontSize: 12, fontWeight: 700 }}>الباكدجات الجاهزة</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#E8F0F8', marginBottom: 8, fontFamily: "'Almarai',sans-serif" }}>اختار الباكدج حسب عداد سيارتك</h2>
          <p style={{ color: TD, fontSize: 14 }}>قطعة + تركيب + ضمان — كل ده في سعر واحد</p>
        </div>

        {/* 3 package cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
          {pkgs.map((pkg, i) => {
            const on = active === i;
            return (
              <div key={pkg.id} onClick={() => setActive(i)} style={{
                background: B3, border: `2px solid ${on ? pkg.color : BD}`,
                borderRadius: 22, padding: 24, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                transform: on ? 'translateY(-8px)' : 'none',
                boxShadow: on ? `0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px ${pkg.color}30, 0 0 60px ${pkg.color}12` : 'none',
                transition: 'all .35s cubic-bezier(.34,1.56,.64,1)',
              }}>
                {on && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${pkg.color},${pkg.color}44,transparent)` }} />}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${pkg.color}15`, border: `1px solid ${pkg.color}30`, borderRadius: 999, padding: '4px 12px', marginBottom: 16 }}>
                  <span style={{ color: pkg.color, fontSize: 11, fontWeight: 700 }}>{pkg.sub}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#E8F0F8', marginBottom: 8, fontFamily: "'Almarai',sans-serif" }}>{pkg.name}</h3>
                <div style={{ fontSize: 28, fontWeight: 800, color: pkg.color, marginBottom: 16 }}>
                  {pkg.price.toLocaleString()} <span style={{ fontSize: 14, color: TD }}>ج.م</span>
                </div>
                <div style={{ marginBottom: 20 }}>
                  {pkg.includes.map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: TX, fontWeight: 700 }}>
                      <CheckCircle2 size={12} color={pkg.color} />{item}
                    </div>
                  ))}
                </div>
                <div style={{ background: `rgba(200,151,74,0.06)`, border: `1px solid rgba(200,151,74,0.15)`, borderRadius: 10, padding: '8px 12px', display: 'flex', gap: 7, alignItems: 'center', marginBottom: 16 }}>
                  <Gift size={12} color={G} /><span style={{ color: G, fontSize: 11, fontWeight: 700 }}>هدية: {pkg.gift}</span>
                </div>
                <Link href={`/packages/${typeof pkg.id === 'string' ? pkg.id : String(i + 1)}`} style={{
                  display: 'block', width: '100%', background: on ? `linear-gradient(135deg,${pkg.color},${pkg.color}99)` : `${pkg.color}18`,
                  border: `1.5px solid ${pkg.color}${on ? '' : '30'}`, borderRadius: 12, padding: '11px', textAlign: 'center',
                  fontWeight: 800, fontSize: 13, color: on ? BG : pkg.color, textDecoration: 'none', cursor: 'pointer', fontFamily: "'Almarai',sans-serif",
                  boxShadow: on ? `0 6px 20px ${pkg.color}35` : 'none', transition: 'all .25s ease',
                }}>
                  احجز الباكدج ده ←
                </Link>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link href="/packages" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: G, background: `rgba(200,151,74,0.07)`, border: `1px solid rgba(200,151,74,0.2)`, borderRadius: 999, padding: '9px 22px', fontWeight: 700, fontSize: 13, textDecoration: 'none', fontFamily: "'Almarai',sans-serif" }}>
            كل الباكدجات <ChevronLeft size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════ MAIN HOME PAGE ══════════════════ */
export default function Home() {
  const { data: packages, isLoading } = useListPackages();
  const [activeService, setActiveService] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const togglePart = (id: string) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const total = [...selected].reduce((s, id) => s + (PUZZLE_PARTS.find(p => p.id === id)?.price ?? 0), 0);
  const currentGift = [...GIFT_TIERS].reverse().find(t => total >= t.min);
  const nextGift    = GIFT_TIERS.find(t => total < t.min);

  const sectionBg: React.CSSProperties = { background: BG, color: TX, fontFamily: "'Almarai',sans-serif", direction: 'rtl' };

  return (
    <div style={{ ...sectionBg, minHeight: '100vh' }}>

      {/* ═══ HERO ═══ */}
      <section style={{ position: 'relative', minHeight: 580, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        {/* Background layers */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 120% 100% at 70% 50%, rgba(26,35,86,0.5) 0%, ${BG} 70%)` }} />
          <div style={{ position: 'absolute', top: '50%', left: '62%', transform: 'translate(-50%,-50%)', width: 560, height: 560, background: `radial-gradient(circle,rgba(200,151,74,0.13) 0%,rgba(200,151,74,0.05) 40%,transparent 70%)`, borderRadius: '50%', animation: 'rp-blob1 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, background: `radial-gradient(circle,rgba(74,171,202,0.07) 0%,transparent 65%)`, animation: 'rp-blob2 12s ease-in-out infinite 4s' }} />
          {/* Grid floor */}
          <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: 220, opacity: 0.07 }} viewBox="0 0 1280 220" preserveAspectRatio="none">
            {[0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1].map((t, i) => {
              const y = 220 - t * 220;
              return <line key={i} x1={640 - 640 * t} y1={220} x2={640 + 640 * t} y2={y} stroke="rgba(200,151,74,1)" strokeWidth=".8" />;
            })}
            {[...Array(9)].map((_, i) => {
              const p = (i + 1) / 10; const y = 220 - p * 220;
              return <line key={i} x1={640 - 640 * p} y1={y} x2={640 + 640 * p} y2={y} stroke="rgba(200,151,74,1)" strokeWidth=".6" />;
            })}
          </svg>
          {/* Particles */}
          {[{ top: '18%', left: '8%', c: G, d: '0s', sz: 5 }, { top: '72%', left: '14%', c: SK, d: '1.8s', sz: 4 }, { top: '40%', left: '28%', c: LV, d: '3.2s', sz: 3 }, { top: '12%', left: '44%', c: SG, d: '.6s', sz: 4 }, { top: '80%', left: '52%', c: G, d: '2.1s', sz: 3 }, { top: '25%', left: '76%', c: SK, d: '1.2s', sz: 5 }].map((p, i) => (
            <div key={i} style={{ position: 'absolute', top: p.top, left: p.left, width: p.sz, height: p.sz, borderRadius: '50%', background: p.c, boxShadow: `0 0 ${p.sz * 2}px ${p.c}`, animation: `rp-particle ${4 + i}s ease-in-out infinite ${p.d}` }} />
          ))}
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 28px', position: 'relative', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 0, alignItems: 'center', width: '100%' }}>

          {/* LEFT: Copy */}
          <div style={{ animation: 'rp-fade-up .7s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,151,74,0.07)', border: '1px solid rgba(200,151,74,0.22)', borderRadius: 999, padding: '6px 18px', marginBottom: 28 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: G, boxShadow: `0 0 8px ${G}`, animation: 'rp-glow-blink 2s infinite' }} />
              <span style={{ color: G, fontSize: 12, fontWeight: 700, letterSpacing: .3 }}>منصة باكدجات الصيانة الأولى — الإسكندرية</span>
            </div>

            <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.2, letterSpacing: -1, marginBottom: 10, color: '#E8F0F8' }}>
              مش بنبيع<br />
              <span style={{ fontSize: 62, background: `linear-gradient(130deg,${G} 30%,${GL} 60%,${SK})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -2 }}>قطعة.</span>
            </h1>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.38)', marginBottom: 28, letterSpacing: -.5 }}>
              بنبيع <span style={{ color: `rgba(200,151,74,0.75)`, fontWeight: 800 }}>باكدج كامل.</span>
            </h2>

            <p style={{ color: TD, fontSize: 14, lineHeight: 1.9, marginBottom: 32, maxWidth: 500, borderRight: `3px solid rgba(200,151,74,0.25)`, paddingRight: 16 }}>
              زي أوبر — إحنا الوسيط بين مراكز قطع الغيار وورش التركيب في الإسكندرية.<br />
              إنت بتدفع <strong style={{ color: G }}>مرة واحدة</strong> — القطعة، التركيب، والضمان علينا.
            </p>

            {/* Service pills */}
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, marginBottom: 12, letterSpacing: 2 }}>ابدأ بالصيانة اللي محتاجها:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 18 }}>
              {SERVICES.map((s, i) => {
                const on = activeService === i;
                return (
                  <button key={i} className="rp-pill" onClick={() => setActiveService(on ? null : i)} style={{
                    padding: '10px 20px',
                    background: on ? `${s.color}18` : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${on ? s.color : BD}`,
                    color: on ? s.color : TD,
                    fontSize: 13, fontWeight: 700,
                    boxShadow: on ? `0 0 18px ${s.color}30, inset 0 0 12px ${s.color}08` : 'none',
                    transform: on ? 'translateY(-2px)' : 'none',
                  }}>
                    <s.icon size={13} style={{ marginLeft: 7, display: 'inline', verticalAlign: 'middle' }} />{s.label}
                  </button>
                );
              })}
            </div>

            {activeService !== null && (
              <div style={{ animation: 'rp-fade-up .25s ease', background: `${SERVICES[activeService].color}08`, border: `1px solid ${SERVICES[activeService].color}22`, borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                <span style={{ color: TX, fontSize: 13, fontWeight: 700 }}>
                  عندنا باكدج شامل <strong style={{ color: SERVICES[activeService].color }}>{SERVICES[activeService].label}</strong> — قطعة + تركيب + ضمان
                </span>
                <Link href="/packages" className="rp-pill" style={{ background: SERVICES[activeService].color, color: BG, padding: '7px 16px', fontWeight: 800, fontSize: 12, flexShrink: 0, boxShadow: `0 4px 14px ${SERVICES[activeService].color}40`, textDecoration: 'none', display: 'inline-block' }}>اختار الباكدج</Link>
              </div>
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 0, marginTop: 32, paddingTop: 24, borderTop: `1px solid rgba(255,255,255,0.06)` }}>
              {[{ n: '1,247+', l: 'عميل تخدمناه', c: G }, { n: '4.9★', l: 'متوسط التقييم', c: SK }, { n: '32', l: 'ورشة معتمدة', c: SG }, { n: '98%', l: 'رضا العملاء', c: LV }].map(({ n, l, c }, i) => (
                <div key={l} style={{ flex: 1, textAlign: 'center', padding: '0 8px', borderLeft: i > 0 ? `1px solid rgba(255,255,255,0.06)` : 'none' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: c, lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Bako cinematic */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', border: '1px solid rgba(200,151,74,0.08)', animation: 'rp-blob1 6s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', border: '1px dashed rgba(200,151,74,0.1)', animation: 'rp-blob2 8s ease-in-out infinite 2s' }} />

            {/* Bako */}
            <div style={{ position: 'relative', zIndex: 5, animation: 'rp-float 5s ease-in-out infinite' }}>
              <img src={bakoImg} alt="باكو" style={{ width: 320, height: 320, objectFit: 'contain', filter: `drop-shadow(0 28px 55px rgba(200,151,74,0.45)) drop-shadow(0 0 100px rgba(200,151,74,0.2))`, display: 'block', margin: '0 auto' }} />
              {/* Speech bubble */}
              <div style={{ position: 'absolute', top: -62, left: '50%', transform: 'translateX(-38%)', background: 'rgba(13,18,32,0.94)', backdropFilter: 'blur(14px)', border: `1.5px solid rgba(200,151,74,0.38)`, borderRadius: '16px 16px 16px 4px', padding: '10px 18px', whiteSpace: 'nowrap', boxShadow: '0 8px 28px rgba(0,0,0,0.5)', animation: 'rp-glow-blink 3s infinite', zIndex: 10 }}>
                <div style={{ color: G, fontSize: 12, fontWeight: 800, marginBottom: 2 }}>أهلاً! أنا باكو 👋</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 700 }}>هساعدك تختار الباكدج المناسب</div>
                <div style={{ position: 'absolute', bottom: -8, right: 24, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `8px solid rgba(200,151,74,0.38)` }} />
              </div>
            </div>

            {/* Floating stat cards */}
            {[
              { top: 30, left: -40,  c: SK, icon: '🛡️', t: 'ضمان 24 شهر',   s: 'على كل القطع'   },
              { bottom: 40, right: -30, c: SG, icon: '⚡', t: 'تركيب سريع', s: 'خلال 24 ساعة' },
            ].map(({ top, bottom, left, right, c, icon, t, s }: any, i) => (
              <div key={i} style={{ position: 'absolute', top, bottom, left, right, background: 'rgba(13,18,32,0.88)', backdropFilter: 'blur(12px)', border: `1px solid ${c}25`, borderRadius: 14, padding: '10px 14px', boxShadow: `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${c}12`, animation: `rp-float ${5 + i}s ease-in-out infinite ${i}s`, zIndex: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div>
                    <div style={{ color: '#E8F0F8', fontSize: 12, fontWeight: 800 }}>{t}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700 }}>{s}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* How it works bar */}
            <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10, background: 'rgba(13,18,32,0.9)', backdropFilter: 'blur(12px)', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 16, padding: '12px 20px', whiteSpace: 'nowrap', zIndex: 6 }}>
              {[{ Icon: Package, c: SK, l: 'مراكز القطع' }, { Icon: ArrowLeftRight, c: G, l: 'RenoPack' }, { Icon: Wrench, c: G, l: 'ورش التركيب' }, { Icon: BadgeCheck, c: SG, l: 'ضمان كامل' }].map(({ Icon, c, l }, i) => (
                <React.Fragment key={l}>
                  {i > 0 && <div style={{ width: 1, background: 'rgba(255,255,255,0.07)', alignSelf: 'stretch' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px' }}>
                    <Icon size={13} color={c} /><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700 }}>{l}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PARTS SHOWCASE ═══ */}
      <section style={{ padding: '52px 28px', borderTop: `1px solid ${BD}`, background: `linear-gradient(180deg,${B2},${BG})` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(200,151,74,0.08)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 999, padding: '4px 14px', marginBottom: 10 }}>
                <Package size={11} color={G} /><span style={{ color: G, fontSize: 11, fontWeight: 700 }}>ما بداخل الباكدجات</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E8F0F8', marginBottom: 4 }}>اختار نوع القطعة في باكدجك 🔧</h2>
              <p style={{ color: TD, fontSize: 13 }}>أصلي أوروبي (ضمان 24 شهر) أو تركي (ضمان 12 شهر) — كلاهما داخل الباكدج</p>
            </div>
            <Link href="/packages" style={{ display: 'flex', alignItems: 'center', gap: 6, color: G, background: 'rgba(200,151,74,0.07)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 999, padding: '7px 16px', fontWeight: 700, fontSize: 12, textDecoration: 'none', fontFamily: "'Almarai',sans-serif" }}>
              كل الباكدجات <ChevronLeft size={13} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
            {/* Featured large */}
            {(() => {
              const p = PARTS_SHOWCASE[0];
              return (
                <div style={{ background: B3, border: `1.5px solid ${p.border}28`, borderRadius: 22, overflow: 'hidden', position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'transform .25s ease' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ''}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${p.border},${p.border}44,transparent)` }} />
                  <div style={{ height: 230, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                    <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom,rgba(0,0,0,0.08) 0%,transparent 35%,${B3} 100%)` }} />
                    <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(13,18,32,0.85)', backdropFilter: 'blur(8px)', border: `1px solid ${p.badgeColor}40`, borderRadius: 999, padding: '4px 12px', fontSize: 10, fontWeight: 800, color: p.badgeColor }}>
                      ⭐ الأكثر في الباكدجات
                    </div>
                  </div>
                  <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#E8F0F8', marginBottom: 6 }}>{p.name}</div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                      <div style={{ flex: 1, background: 'rgba(61,168,130,0.07)', border: '1px solid rgba(61,168,130,0.2)', borderRadius: 12, padding: '8px 12px' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: SG, marginBottom: 2 }}>✅ أصلي أوروبي</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: SG }}>{p.price}</div>
                      </div>
                      <div style={{ flex: 1, background: 'rgba(74,171,202,0.07)', border: '1px solid rgba(74,171,202,0.2)', borderRadius: 12, padding: '8px 12px' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: SK, marginBottom: 2 }}>🇹🇷 تركي كفاءة</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: SK }}>160 ج.م</div>
                      </div>
                    </div>
                    <Link href="/packages" className="rp-pill" style={{ width: '100%', background: `linear-gradient(135deg,${p.border},${p.border}99)`, color: BG, border: 'none', padding: '11px', fontWeight: 800, fontSize: 13, marginTop: 'auto', boxShadow: `0 6px 20px ${p.border}35`, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                      أضف للباكدج ←
                    </Link>
                  </div>
                </div>
              );
            })()}

            {/* 2×3 small cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {PARTS_SHOWCASE.slice(1).map((p, i) => (
                <div key={i} className="rp-part-tile" style={{ background: B3, border: `1.5px solid ${p.border}22`, borderRadius: 16, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 28px rgba(0,0,0,0.35), 0 0 0 1px ${p.border}20`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${p.border},transparent)` }} />
                  <div style={{ height: 96, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                    <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom,transparent 40%,${B3} 100%)` }} />
                    <div style={{ position: 'absolute', top: 7, left: 7, background: `${p.badgeColor}20`, border: `1px solid ${p.badgeColor}45`, borderRadius: 999, padding: '2px 7px', fontSize: 8, fontWeight: 800, color: p.badgeColor }}>{p.badge}</div>
                  </div>
                  <div style={{ padding: '9px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: TX, marginBottom: 6, lineHeight: 1.35 }}>{p.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: G }}>{p.price}</div>
                      <div style={{ background: `${p.border}14`, border: `1px solid ${p.border}28`, borderRadius: 6, padding: '3px 8px', fontSize: 9, fontWeight: 700, color: p.border }}>+ للباكدج</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ READY PACKAGES ═══ */}
      <ReadyPackagesSection realPackages={packages?.map(p => ({ id: p.id, name: p.name, slug: p.slug, price: p.price, description: p.description }))} />

      {/* ═══ PUZZLE BUILDER ═══ */}
      <section style={{ padding: '64px 28px', background: B2, borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(200,151,74,0.09)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 999, padding: '5px 16px', marginBottom: 14 }}>
              <Layers size={13} color={G} /><span style={{ color: G, fontSize: 12, fontWeight: 700 }}>ابني باكدجك بنفسك</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#E8F0F8', marginBottom: 8 }}>البازل — اختار قطعك وجمّع باكدجك 🧩</h2>
            <p style={{ color: TD, fontSize: 14 }}>على حسب قيمة الباكدج بتاعك هتاخد هدية تلقائياً</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}>
            <div>
              {['سوائل', 'فلاتر', 'فرامل', 'كهرباء', 'عفشة'].map(cat => {
                const parts = PUZZLE_PARTS.filter(p => p.cat === cat);
                return (
                  <div key={cat} style={{ marginBottom: 20 }}>
                    <p style={{ color: TD, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>{cat}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 9 }}>
                      {parts.map(p => { const on = selected.has(p.id); return (
                        <div key={p.id} className="rp-part-tile" onClick={() => togglePart(p.id)} style={{ background: on ? 'rgba(200,151,74,0.07)' : 'var(--rp-card)', border: `1.5px solid ${on ? 'rgba(200,151,74,0.38)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: on ? '0 0 16px rgba(200,151,74,0.1)' : 'none' }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: on ? 'rgba(200,151,74,0.13)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .25s' }}>
                            <p.icon size={15} color={on ? G : TD} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: on ? '#E8F0F8' : TX, marginBottom: 2 }}>{p.label}</div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: on ? G : TD }}>{p.price} ج.م</div>
                          </div>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: on ? G : 'rgba(255,255,255,0.05)', border: `1.5px solid ${on ? G : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .25s' }}>
                            {on ? <Minus size={10} color={BG} /> : <Plus size={10} color={TD} />}
                          </div>
                        </div>
                      ); })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar */}
            <div style={{ position: 'sticky', top: 80 }}>
              <div style={{ background: B3, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 20, padding: 22 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#E8F0F8', marginBottom: 18 }}>ملخص الباكدج</h4>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ color: TD, fontSize: 12, fontWeight: 700 }}>إجمالي الباكدج</span>
                    <span style={{ color: G, fontWeight: 800, fontSize: 16 }}>{total.toLocaleString()} ج.م</span>
                  </div>
                  {GIFT_TIERS.map(tier => { const pct = Math.min(100, (total / tier.min) * 100); const ok = total >= tier.min; return (
                    <div key={tier.min} style={{ marginBottom: 9 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: ok ? G : TD, fontWeight: 700 }}>{tier.icon} {tier.gift}</span>
                        <span style={{ fontSize: 9, color: TD, fontWeight: 700 }}>{tier.min.toLocaleString()} ج.م</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 999 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: ok ? G : `linear-gradient(90deg,${GL},${G})`, borderRadius: 999, transition: 'width .5s ease', opacity: ok ? 1 : .55 }} />
                      </div>
                    </div>
                  ); })}
                  {nextGift && <p style={{ color: TD, fontSize: 10, fontWeight: 700, marginTop: 8 }}>بعد {(nextGift.min - total).toLocaleString()} ج.م: <strong style={{ color: G }}>{nextGift.gift} {nextGift.icon}</strong></p>}
                  {currentGift && <div style={{ background: 'rgba(200,151,74,0.09)', border: '1px solid rgba(200,151,74,0.22)', borderRadius: 10, padding: '8px 12px', marginTop: 10, display: 'flex', gap: 7, alignItems: 'center' }}>
                    <Gift size={13} color={G} /><span style={{ color: G, fontSize: 11, fontWeight: 700 }}>هديتك: {currentGift.gift}</span>
                  </div>}
                </div>
                <div style={{ maxHeight: 170, overflowY: 'auto', marginBottom: 14 }}>
                  {selected.size === 0
                    ? <p style={{ color: 'rgba(92,116,136,0.5)', fontSize: 12, textAlign: 'center', padding: '18px 0', fontWeight: 700 }}>اختار من القطع على الشمال</p>
                    : [...selected].map(id => { const p = PUZZLE_PARTS.find(x => x.id === id)!; return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${BD}` }}>
                        <span style={{ color: TX, fontSize: 12, fontWeight: 700 }}>{p.label}</span>
                        <span style={{ color: G, fontSize: 12, fontWeight: 800 }}>{p.price} ج.م</span>
                      </div>
                    ); })}
                </div>
                {selected.size > 0 && <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: `2px solid ${BD}`, marginBottom: 10 }}>
                    <span style={{ color: '#E8F0F8', fontWeight: 800, fontSize: 14 }}>الإجمالي</span>
                    <span style={{ color: G, fontWeight: 800, fontSize: 16 }}>{total.toLocaleString()} ج.م</span>
                  </div>
                  <Link href="/packages" className="rp-pill" style={{ width: '100%', background: `linear-gradient(135deg,${G},${GL})`, color: BG, border: 'none', padding: '11px', fontWeight: 800, fontSize: 13, boxShadow: `0 5px 18px rgba(200,151,74,0.25)`, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                    احجز الباكدج ده
                  </Link>
                </>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ AI COMPARE + CHAT ═══ */}
      <AiCompareSection />

      {/* ═══ WORKSHOPS ═══ */}
      <section style={{ padding: '56px 28px', background: B2, borderTop: `1px solid ${BD}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#E8F0F8', marginBottom: 4 }}>ورشنا في الإسكندرية</h2>
              <p style={{ color: TD, fontSize: 13 }}>كل ورشة اتاختارت بمعايير صارمة</p>
            </div>
            <button style={{ color: SK, background: 'none', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Almarai',sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>كل الورش ←</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {WORKSHOPS.map(w => (
              <div key={w.name} style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid rgba(255,255,255,0.06)`, background: 'var(--rp-card)', cursor: 'pointer', transition: 'transform .25s,box-shadow .25s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>
                <div style={{ height: 90, background: `linear-gradient(145deg,${B3},${w.color}12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid rgba(255,255,255,0.04)`, position: 'relative' }}>
                  <Building2 size={30} color={`${w.color}35`} />
                  <div style={{ position: 'absolute', bottom: -10, right: 12, background: BG, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 999, padding: '2px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={9} color={G} fill={G} /><span style={{ color: G, fontSize: 10, fontWeight: 800 }}>{w.rating}</span>
                  </div>
                </div>
                <div style={{ padding: '18px 14px 14px' }}>
                  <h4 style={{ color: '#E8F0F8', fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{w.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                    <MapPin size={9} color={TD} /><span style={{ color: TD, fontSize: 11, fontWeight: 700 }}>{w.area}</span>
                  </div>
                  <div style={{ color: 'rgba(122,149,170,0.55)', fontSize: 10, fontWeight: 700 }}>{w.jobs.toLocaleString()} سيارة</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(200,151,74,0.18)', borderRadius: 14, padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#E8F0F8', marginBottom: 2 }}>عندك ورشة في الإسكندرية؟</div>
              <div style={{ color: TD, fontSize: 12 }}>انضم لشبكة RenoPack</div>
            </div>
            <button className="rp-pill" style={{ background: 'rgba(200,151,74,0.09)', border: `1.5px solid rgba(200,151,74,0.25)`, color: G, padding: '8px 20px', fontWeight: 800, fontSize: 12 }}>انضم كورشة</button>
          </div>
        </div>
      </section>
    </div>
  );
}
