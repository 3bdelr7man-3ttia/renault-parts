import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Search, Wrench, ShieldCheck, Star, MapPin, ChevronLeft,
  Zap, Droplets, Wind, Settings, Disc, Battery, Package,
  Building2, Gift, Sparkles, CheckCircle2, BadgeCheck,
  ArrowLeftRight, ArrowLeft, Plus, Minus, Layers, Send, Bot, ChevronDown, Truck,
} from 'lucide-react';
import { useListPackages, useListParts } from '@workspace/api-client-react';
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
  { id: 'oil',   icon: Droplets, label: 'زيت موبيل 1 أصلي',  price: 320, cat: 'سوائل',  img: partOilImg    },
  { id: 'oil_f', icon: Settings, label: 'فلتر زيت',           price: 95,  cat: 'سوائل',  img: partOilImg    },
  { id: 'air_f', icon: Wind,     label: 'فلتر هواء',          price: 95,  cat: 'فلاتر',  img: partAirImg    },
  { id: 'cab_f', icon: Wind,     label: 'فلتر كابينة',        price: 75,  cat: 'فلاتر',  img: partAirImg    },
  { id: 'brk',   icon: Disc,     label: 'طقم فرامل أمامي',    price: 680, cat: 'فرامل',  img: partBrakesImg },
  { id: 'pads',  icon: Disc,     label: 'تيل فرامل خلفي',     price: 420, cat: 'فرامل',  img: partBrakesImg },
  { id: 'spark', icon: Zap,      label: 'طقم شمعات إشعال',    price: 320, cat: 'كهرباء', img: partSparksImg },
  { id: 'bat',   icon: Battery,  label: 'بطارية ٦٠ أمبير',    price: 850, cat: 'كهرباء', img: partBatImg    },
  { id: 'tie',   icon: Settings, label: 'روبير كفرات',        price: 180, cat: 'عفشة',   img: partSuspImg   },
  { id: 'mnt',   icon: Settings, label: 'مساعد أمامي',        price: 550, cat: 'عفشة',   img: partSuspImg   },
];

const GIFT_TIERS = [
  { min: 500,  gift: 'فرشاة عجلات',              icon: '🎁' },
  { min: 1500, gift: 'فلتر هواء مجاناً',         icon: '🎁' },
  { min: 3000, gift: 'ستالايت RenoPack + فلتر', icon: '🎁🎁' },
];

const AI_QA: Record<string, string> = {
  'أصلي':   'الأصلي بيجيلك من أوروبا، ضمانه 24 شهر وجودته 97%. لو سيارتك أقل من 5 سنين خد الأصلي.',
  'تركي':   'التركي كويس لو سيارتك أكبر من 5 سنين أو ميزانيتك محدودة. ضمانه 12 شهر.',
  'زيت':    'موبيل 1 الأصلي الألماني هو الأفضل لرينو. الفرق في السعر مع التركي 160 ج.م.',
  'فرامل':  'بريمبو الإيطالي هو الأصلي، Beral التركي اختيار كويس لو الميزانية محدودة.',
  'ضمان':   'كل القطع عندها ضمان — الأصلي 24 شهر، التركي 12 شهر. والضمان بيشمل القطعة والتركيب.',
  'سعر':    'الأسعار بتختلف حسب القطعة والنوع. الأصلي أغلى بس ضمانه أطول.',
  'باكدج':  'عندنا باكدجات جاهزة حسب الكيلو (20ك/40ك/60ك) وكمان بيلدر تعمل فيه الباكدج بنفسك!',
  'ورشة':   'كل الورش اللي عندنا اتاختارت بمعايير صارمة — صيانة دورية، تقييم 4.7+ ، وفريق متخصص في رينو.',
  'حجز':    'بتحجز من الموقع وبنبعتلك تأكيد فوراً. بعدين الورشة بتتواصل معاك لتحديد الموعد.',
  'موعد':   'غالباً بنقدر نوفّر موعد خلال 24-48 ساعة. الورش بتشتغل من 9 صباحاً لـ 9 مساءاً.',
  'منطقة':  'عندنا ورش في الميناء، المنتزه، العجمي، وسيدي جابر. قريبين منك!',
  'default': 'ممكن تسألني عن أي قطعة أو خدمة! أنا باكو 🤖 وأنا هنا أساعدك تاخد أحسن قرار.',
};

const CN = '#E53935'; // chinese red accent

interface VariantInfo {
  name: string; price: number; score: number; warranty: string; origin: string; badge: string;
  available: boolean;
}
interface ComparePart {
  id: string; label: string; img: string;
  orig: VariantInfo;
  turk: VariantInfo;
  chin: VariantInfo;
  aiIntro: string; quickQ: string[];
}

type RealPart = {
  id: number; name: string; type: string;
  priceOriginal: number | null; priceTurkish: number | null; priceChinese: number | null;
  imageUrl?: string | null; supplier?: string | null;
};

function buildCompareParts(parts: RealPart[]): ComparePart[] | null {
  const eligible = parts.filter(p => p.priceOriginal || p.priceTurkish || p.priceChinese);
  if (eligible.length === 0) return null;
  return eligible.map(p => {
    const hasOrig = !!(p.priceOriginal && p.priceOriginal > 0);
    const hasTurk = !!(p.priceTurkish && p.priceTurkish > 0);
    const hasChin = !!(p.priceChinese && p.priceChinese > 0);
    const availableCount = [hasOrig, hasTurk, hasChin].filter(Boolean).length;
    const intros = [];
    if (hasOrig) intros.push(`الأصلي بـ ${p.priceOriginal} ج.م`);
    if (hasTurk) intros.push(`التركي بـ ${p.priceTurkish} ج.م`);
    if (hasChin) intros.push(`الصيني بـ ${p.priceChinese} ج.م`);
    return {
      id: String(p.id),
      label: p.name,
      img: (p.imageUrl as string) || partOilImg,
      orig: hasOrig
        ? { name: p.name, price: p.priceOriginal!, score: 95, warranty: '24 شهر', origin: '🇫🇷 أصلي', badge: 'أصلي', available: true }
        : { name: p.name, price: 0, score: 0, warranty: '—', origin: '—', badge: 'أصلي', available: false },
      turk: hasTurk
        ? { name: p.name, price: p.priceTurkish!, score: 78, warranty: '12 شهر', origin: '🇹🇷 تركيا', badge: 'بديل تركي', available: true }
        : { name: p.name, price: 0, score: 0, warranty: '—', origin: '—', badge: 'تركي', available: false },
      chin: hasChin
        ? { name: p.name, price: p.priceChinese!, score: 58, warranty: '6 شهور', origin: '🇨🇳 الصين', badge: 'صيني', available: true }
        : { name: p.name, price: 0, score: 0, warranty: '—', origin: '—', badge: 'صيني', available: false },
      aiIntro: availableCount > 1
        ? `${p.name} متاح بـ ${intros.join(' و ')}. الأصلي أفضل جودة وضمانه أطول — اختار حسب ميزانيتك.`
        : `${p.name} متاح ${intros[0] ?? ''}. تواصل معنا لمعرفة المزيد.`,
      quickQ: ['أنهي أحسن؟', 'الفرق في الجودة إيه؟', 'الضمان إيه؟', 'الأرخص آمن؟'],
    };
  });
}

const AI_COMPARE: ComparePart[] = [
  { id: 'oil', label: 'زيت الموبيل', img: partOilImg,
    orig: { name: 'Mobil 1 Full Synthetic',   price: 320, score: 97, warranty: '24 شهر', origin: '🇩🇪 ألمانيا', badge: 'أصلي أوروبي', available: true },
    turk: { name: 'Selenia WR Pure Energy',   price: 160, score: 73, warranty: '12 شهر', origin: '🇹🇷 تركيا',   badge: 'بديل تركي',   available: true },
    chin: { name: 'Great Wall Motor Oil',     price: 85,  score: 51, warranty: '6 شهور', origin: '🇨🇳 الصين',    badge: 'صيني',         available: true },
    aiIntro: 'Mobil 1 الأصلي الألماني الأفضل على طول. الصيني السعر رخيص بس الجودة والضمان أضعف بكثير — مش بنصح بيه للرينو.',
    quickQ: ['مين أحسن؟', 'الفرق في الجودة إيه؟', 'ضمان إيه؟', 'الموبيل يتحمل كام كيلو؟'],
  },
  { id: 'brk', label: 'فرامل Brembo', img: partBrakesImg,
    orig: { name: 'Brembo Standard',          price: 680, score: 96, warranty: '24 شهر', origin: '🇮🇹 إيطاليا', badge: 'أصلي إيطالي', available: true },
    turk: { name: 'Beral Brake Pads',         price: 320, score: 79, warranty: '12 شهر', origin: '🇹🇷 تركيا',   badge: 'بديل تركي',   available: true },
    chin: { name: 'Yida Brake Pads',          price: 170, score: 58, warranty: '6 شهور', origin: '🇨🇳 الصين',    badge: 'صيني',         available: true },
    aiIntro: 'الفرامل مش وقت التوفير! Brembo الإيطالي = أمان حقيقي. الصيني سعره أرخص لكن المسافة الكابحة أطول وبيتآكل أسرع.',
    quickQ: ['Beral بتوقف صح؟', 'فرق الأداء إيه؟', 'الأوريجنال بيدوم كام؟', 'الصيني آمن؟'],
  },
  { id: 'air', label: 'فلتر هواء', img: partAirImg,
    orig: { name: 'Renault Original Filter',  price: 95,  score: 99, warranty: '24 شهر', origin: '🇫🇷 فرنسا',   badge: 'أصلي رينو',   available: true },
    turk: { name: 'Knecht Air Filter',        price: 48,  score: 83, warranty: '12 شهر', origin: '🇹🇷 تركيا',   badge: 'بديل تركي',   available: true },
    chin: { name: 'Sakura Air Filter',        price: 22,  score: 55, warranty: '6 شهور', origin: '🇨🇳 الصين',    badge: 'صيني',         available: true },
    aiIntro: 'الأصلي الفرنسي هو الأفضل. التركي Knecht مقبول. الصيني Sakura رخيص جداً بس كفاءة التصفية ضعيفة — خطر على الموتور.',
    quickQ: ['الفلتر بيتغير كل امتى؟', 'التركي بيضر الموتور؟', 'الأصلي يستاهل؟', 'الصيني مناسب؟'],
  },
];

const WORKSHOPS = [
  { name: 'ورشة الميناء',    area: 'الميناء',    rating: 4.9, jobs: 847,  color: SK, phone: '201001234567', address: 'شارع الميناء الكبير، بجوار كوبري القباري', hours: '٩ ص – ٩ م' },
  { name: 'سنتر المنتزه',    area: 'المنتزه',    rating: 4.8, jobs: 1204, color: G,  phone: '201112345678', address: 'شارع خالد بن الوليد، المنتزه الجنوبي',     hours: '٨ ص – ١٠ م' },
  { name: 'ورشة العجمي',     area: 'العجمي',     rating: 4.7, jobs: 632,  color: LV, phone: '201223456789', address: 'شارع الهانوفيل، بجوار دوار العجمي',       hours: '٩ ص – ٩ م' },
  { name: 'سنتر سيدي جابر', area: 'سيدي جابر', rating: 4.9, jobs: 980,  color: SG, phone: '201334567890', address: 'شارع النصر، أمام محطة سيدي جابر',         hours: '٨ ص – ١١ م' },
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

function BakoChat({ context, hideHeader }: { context: ComparePart; hideHeader?: boolean }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ from: 'bako', text: context.aiIntro }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setMsgs([{ from: 'bako', text: context.aiIntro }]); }, [context.id]);

  const getReply = (msg: string): string => {
    const lower = msg;
    const { label, orig, turk, chin } = context;

    // أنهي أحسن / مين أحسن / التوصية
    if (lower.includes('أحسن') || lower.includes('أفضل') || lower.includes('توصية') || lower.includes('بتنصح') || lower.includes('نصيحة')) {
      if (orig.available)
        return `بالنسبة لـ ${label}، الأصلي (${orig.origin}) هو الأفضل على الإطلاق — سكور جودة ${orig.score}% وضمان ${orig.warranty}. لو ميزانيتك ${orig.price} ج.م متاحة خده على طول.${turk.available ? ` لو ميزانية محدودة، التركي ${turk.name} بـ ${turk.price} ج.م مقبول جداً.` : ''}`;
      if (turk.available)
        return `بالنسبة لـ ${label}، التركي ${turk.name} هو الأفضل المتاح — سكور ${turk.score}% وضمان ${turk.warranty} بسعر ${turk.price} ج.م.`;
      return `${label} متاح بخيار واحد دلوقتي — تواصل معنا لمزيد من التفاصيل.`;
    }

    // الفرق في الجودة
    if (lower.includes('جودة') || lower.includes('فرق') || lower.includes('أداء') || lower.includes('مقارنة')) {
      const lines: string[] = [];
      if (orig.available) lines.push(`• الأصلي (${orig.origin}): جودة ${orig.score}% — الأعلى`);
      if (turk.available) lines.push(`• التركي (${turk.origin}): جودة ${turk.score}% — كويس`);
      if (chin.available) lines.push(`• الصيني (${chin.origin}): جودة ${chin.score}% — مقبول`);
      return `الفرق في جودة ${label}:\n${lines.join('\n')}\n\nالفرق في الأداء بيتحس خصوصاً بعد 10,000 كم.`;
    }

    // الضمان
    if (lower.includes('ضمان') || lower.includes('كفالة') || lower.includes('يضمن')) {
      const lines: string[] = [];
      if (orig.available) lines.push(`الأصلي: ضمان ${orig.warranty}`);
      if (turk.available) lines.push(`التركي: ضمان ${turk.warranty}`);
      if (chin.available) lines.push(`الصيني: ضمان ${chin.warranty}`);
      return `ضمان ${label}:\n${lines.join(' | ')}\n\nالضمان بيشمل القطعة والتركيب — لو في عيب بنستبدلها مجاناً.`;
    }

    // الأرخص / السعر
    if (lower.includes('رخيص') || lower.includes('سعر') || lower.includes('فلوس') || lower.includes('تمن') || lower.includes('بكام') || lower.includes('كام')) {
      const lines: string[] = [];
      if (orig.available) lines.push(`الأصلي: ${orig.price} ج.م`);
      if (turk.available) lines.push(`التركي: ${turk.price} ج.م`);
      if (chin.available) lines.push(`الصيني: ${chin.price} ج.م`);
      const cheapest = [orig, turk, chin].filter(v => v.available).sort((a, b) => a.price - b.price)[0];
      return `أسعار ${label}:\n${lines.join(' | ')}\n\nالأرخص هو ${cheapest?.badge ?? 'الصيني'} — لكن تذكر إن السعر بيفرق في الجودة والضمان.`;
    }

    // الأصلي تحديداً
    if (lower.includes('أصلي') || lower.includes('اوريجنال') || lower.includes('original')) {
      if (!orig.available) return `${label} الأصلي مش متاح دلوقتي. ${turk.available ? `عندنا التركي ${turk.name} بـ ${turk.price} ج.م كبديل ممتاز.` : 'تواصل معنا للمزيد.'}`;
      return `${label} الأصلي: ${orig.name} (${orig.origin}) — سعره ${orig.price} ج.م، ضمان ${orig.warranty}، وجودته ${orig.score}%. ده أفضل اختيار لو سيارتك أقل من 5 سنين.`;
    }

    // التركي
    if (lower.includes('تركي') || lower.includes('turkish')) {
      if (!turk.available) return `${label} التركي مش متاح دلوقتي. ${orig.available ? `عندنا الأصلي بـ ${orig.price} ج.م.` : ''}`;
      return `${label} التركي: ${turk.name} (${turk.origin}) — سعره ${turk.price} ج.م، ضمان ${turk.warranty}، وجودته ${turk.score}%. اختيار كويس لو ميزانيتك محدودة.`;
    }

    // الصيني
    if (lower.includes('صيني') || lower.includes('chinese')) {
      if (!chin.available) return `${label} الصيني مش متاح عندنا — بنركز على الأصلي والتركي عشان نضمن الجودة.`;
      return `${label} الصيني: ${chin.name} (${chin.origin}) — سعره ${chin.price} ج.م وضمانه ${chin.warranty}. الجودة ${chin.score}% — مناسب للسيارات الأقدم أو التنقل القصير.`;
    }

    // متى يتغير / عمر القطعة
    if (lower.includes('امتى') || lower.includes('كل') || lower.includes('مدة') || lower.includes('عمر') || lower.includes('يتغير')) {
      return `${label} عادةً بيتغير كل صيانة دورية — سواء كل 10,000 أو 20,000 كم حسب نوع السيارة والاستخدام. الأصلي بيدوم أكتر.`;
    }

    // باكدج / حجز
    if (lower.includes('باكدج') || lower.includes('حجز') || lower.includes('موعد') || lower.includes('اطلب')) {
      return `ممكن تضيف ${label} لباكدجك من صفحة القطع، أو تحجز الباكدج الجاهز من صفحة الباكدجات. بنوصّلك القطعة وبتروح الورشة اللي تختارها.`;
    }

    // default — but part-specific
    return `أنا باكو، وأنا مختص في ${label} دلوقتي! اسألني عن: الجودة، الضمان، الأسعار، أو أنهي نوع أحسن ليك 🤖`;
  };

  const send = (txt: string) => {
    if (!txt.trim()) return;
    setInput('');
    setMsgs(p => [...p, { from: 'user', text: txt }]);
    setTyping(true);
    setTimeout(() => { setTyping(false); setMsgs(p => [...p, { from: 'bako', text: getReply(txt) }]); }, 1200 + Math.random() * 600);
  };

  // Scroll inside the chat box only — never touches the page scroll
  useEffect(() => {
    if (msgs.length <= 1 && !typing) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  return (
    <div style={{ background: '#0F1928', border: hideHeader ? 'none' : `1.5px solid rgba(200,151,74,0.25)`, borderRadius: hideHeader ? 0 : 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 240 }}>
      {/* Header — hidden when parent wrapper provides its own */}
      {!hideHeader && (
        <div style={{ background: `linear-gradient(135deg,${NV},#243070)`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: `1px solid rgba(200,151,74,0.2)`, flexShrink: 0 }}>
          <img src={bakoImg} alt="باكو" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 22%', border: `2px solid ${G}`, background: NV, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 12, color: '#fff' }}>باكو 🤖 — بيكلمك عن {context.label}</div>
            <div style={{ fontSize: 10, color: `rgba(200,151,74,0.8)`, fontWeight: 700 }}>اسأله أي سؤال عن القطعتين</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', animation: 'rp-glow-blink 2s infinite' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700 }}>متاح</span>
          </div>
        </div>
      )}

      {/* Quick questions */}
      <div style={{ padding: '5px 10px', display: 'flex', gap: 5, flexWrap: 'wrap', borderBottom: `1px solid rgba(255,255,255,0.06)`, background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
        {context.quickQ.map(q => (
          <button key={q} className="rp-pill" onClick={() => send(q)} style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid rgba(255,255,255,0.12)`, color: '#C4D4E0', fontSize: 10, fontWeight: 700, padding: '3px 9px' }}>{q}</button>
        ))}
      </div>

      {/* Messages — scrollable container */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-end', flexDirection: m.from === 'bako' ? 'row' : 'row-reverse' }}>
            {m.from === 'bako' && (
              <img src={bakoImg} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 22%', flexShrink: 0, border: `1.5px solid ${G}`, background: NV }} />
            )}
            <div style={{
              maxWidth: '78%', padding: '9px 13px',
              borderRadius: m.from === 'bako' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
              background: m.from === 'bako' ? '#1E2E4A' : `linear-gradient(135deg,${G},${GL})`,
              border: m.from === 'bako' ? `1px solid rgba(200,151,74,0.18)` : 'none',
              fontSize: 12, fontWeight: 700,
              color: m.from === 'bako' ? '#E0EAF5' : '#0D1220',
              lineHeight: 1.65,
            }}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
            <img src={bakoImg} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 22%', flexShrink: 0, border: `1.5px solid ${G}`, background: NV }} />
            <div style={{ padding: '10px 14px', borderRadius: '4px 16px 16px 16px', background: '#1E2E4A', border: `1px solid rgba(200,151,74,0.18)`, display: 'flex', gap: 5, alignItems: 'center' }}>
              <div className="rp-dot1" style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
              <div className="rp-dot2" style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
              <div className="rp-dot3" style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 12px', borderTop: `1px solid rgba(255,255,255,0.07)`, display: 'flex', gap: 8, background: '#0F1928', flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="اسأل باكو..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 12, padding: '8px 13px', color: '#E0EAF5', fontSize: 12, fontFamily: "'Almarai',sans-serif", fontWeight: 700, outline: 'none' }} />
        <button onClick={() => send(input)} style={{ background: `linear-gradient(135deg,${G},${GL})`, border: 'none', borderRadius: 12, padding: '8px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Send size={13} color="#0D1220" />
        </button>
      </div>
    </div>
  );
}

/* ── Bako chat general (workshops / general queries) ── */
function BakoChatSimple({ label, initMsg, quickQ }: { label: string; initMsg: string; quickQ: string[] }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ from: 'bako', text: initMsg }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    setTimeout(() => { setTyping(false); setMsgs(p => [...p, { from: 'bako', text: getReply(txt) }]); }, 1100 + Math.random() * 500);
  };
  // Scroll inside the chat box only
  useEffect(() => {
    if (msgs.length <= 1 && !typing) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  return (
    <div style={{ background: '#0F1928', border: `1.5px solid rgba(200,151,74,0.25)`, borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 270 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,#1A2356,#243070)`, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: `1px solid rgba(200,151,74,0.2)`, flexShrink: 0 }}>
        <img src={bakoImg} alt="باكو" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 22%', border: `2px solid ${G}`, background: NV, flexShrink: 0 }} />
        <div style={{ flex: 1, fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 12, color: '#fff' }}>باكو 🤖 — {label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>متاح</span>
        </div>
      </div>

      {/* Quick questions */}
      <div style={{ padding: '5px 10px', display: 'flex', gap: 5, flexWrap: 'wrap', borderBottom: `1px solid rgba(255,255,255,0.06)`, background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
        {quickQ.map(q => (
          <button key={q} className="rp-pill" onClick={() => send(q)} style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid rgba(255,255,255,0.12)`, color: '#C4D4E0', fontSize: 10, fontWeight: 700, padding: '3px 9px' }}>{q}</button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexDirection: m.from === 'bako' ? 'row' : 'row-reverse' }}>
            {m.from === 'bako' && <img src={bakoImg} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 22%', flexShrink: 0, border: `1.5px solid ${G}`, background: NV }} />}
            <div style={{
              maxWidth: '80%', padding: '8px 12px',
              borderRadius: m.from === 'bako' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
              background: m.from === 'bako' ? '#1E2E4A' : `linear-gradient(135deg,${G},${GL})`,
              border: m.from === 'bako' ? `1px solid rgba(200,151,74,0.18)` : 'none',
              fontSize: 11, fontWeight: 700,
              color: m.from === 'bako' ? '#E0EAF5' : '#0D1220',
              lineHeight: 1.65,
            }}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
            <img src={bakoImg} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 22%', flexShrink: 0, border: `1.5px solid ${G}`, background: NV }} />
            <div style={{ padding: '9px 13px', borderRadius: '4px 14px 14px 14px', background: '#1E2E4A', border: `1px solid rgba(200,151,74,0.18)`, display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 1, 2].map(n => <div key={n} className={`rp-dot${n + 1}`} style={{ width: 5, height: 5, borderRadius: '50%', background: G }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 10px', borderTop: `1px solid rgba(255,255,255,0.07)`, display: 'flex', gap: 7, background: '#0F1928', flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="اسأل باكو..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 10, padding: '7px 12px', color: '#E0EAF5', fontSize: 11, fontFamily: "'Almarai',sans-serif", fontWeight: 700, outline: 'none' }} />
        <button onClick={() => send(input)} style={{ background: `linear-gradient(135deg,${G},${GL})`, border: 'none', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Send size={12} color="#0D1220" />
        </button>
      </div>
    </div>
  );
}

/* ── Score Ring ── */
function ScoreRing({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray .8s ease', filter: `drop-shadow(0 0 6px ${color}88)` }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="middle" style={{ transform: 'rotate(90deg)', transformOrigin: `${size / 2}px ${size / 2}px`, fill: color, fontSize: 16, fontWeight: 800, fontFamily: "'Cairo',sans-serif" }}>{score}</text>
    </svg>
  );
}

/* ── AI Compare section ── */
function AiCompareSection({ compareData }: { compareData?: ComparePart[] | null }) {
  const data = (compareData && compareData.length > 0) ? compareData : AI_COMPARE;
  const [sel, setSel] = useState(0);
  const safeIdx = sel >= data.length ? 0 : sel;
  const part = data[safeIdx];

  const availableScores = [
    part.orig.available ? part.orig.score : -1,
    part.turk.available ? part.turk.score : -1,
    part.chin.available ? part.chin.score : -1,
  ];
  const bestScore = Math.max(...availableScores);
  const bestIdx = availableScores.indexOf(bestScore);

  const COL = [
    { key: 'orig' as const, color: SG, accent: SG },
    { key: 'turk' as const, color: SK, accent: SK },
    { key: 'chin' as const, color: CN, accent: CN },
  ];

  const GRID = '1fr 44px 1fr 44px 1fr';
  const isFromDB = !!(compareData && compareData.length > 0);

  const rowVal = (v: VariantInfo, type: 'score' | 'price' | 'warranty' | 'origin') => {
    if (!v.available) return 'غير متوفر';
    if (type === 'score') return `${v.score}%`;
    if (type === 'price') return `${v.price.toLocaleString('ar-EG')} ج.م`;
    if (type === 'warranty') return v.warranty;
    return v.origin;
  };

  const rowColor = (v: VariantInfo, baseColor: string) => v.available ? baseColor : 'rgba(255,255,255,0.2)';

  return (
    <section style={{ padding: '48px 28px', background: `linear-gradient(180deg,${B2},${BG})`, borderTop: `1px solid ${BD}` }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: `rgba(200,151,74,0.08)`, border: `1px solid rgba(200,151,74,0.2)`, borderRadius: 999, padding: '5px 16px', marginBottom: 12 }}>
            <Bot size={13} color={G} />
            <span style={{ color: G, fontSize: 12, fontWeight: 700 }}>
              باكو AI — مقارنة ثلاثية {isFromDB && <span style={{ color: SG }}>• بيانات حقيقية</span>}
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E8F0F8', marginBottom: 6 }}>أصلي ولا تركي ولا صيني؟ باكو بيحلّلها ليك 🤖</h2>
          <p style={{ color: TD, fontSize: 13 }}>
            {isFromDB ? 'أسعار القطع من قاعدة البيانات الفعلية — متحدثة في الوقت الفعلي' : 'اختار القطعة وشوف الفرق في الجودة والسعر والضمان'}
          </p>
        </div>

        {/* Part selector — dropdown */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative', minWidth: 260 }}>
            <select
              value={safeIdx}
              onChange={e => setSel(Number(e.target.value))}
              style={{
                width: '100%', appearance: 'none',
                background: B3, border: `1.5px solid rgba(200,151,74,0.28)`,
                borderRadius: 14, padding: '11px 44px 11px 18px',
                color: G, fontSize: 14, fontFamily: "'Almarai',sans-serif",
                fontWeight: 800, outline: 'none', cursor: 'pointer', direction: 'rtl',
                boxShadow: `0 4px 20px rgba(200,151,74,0.1)`,
              }}
            >
              {data.map((p, i) => {
                const avail = [p.orig.available, p.turk.available, p.chin.available].filter(Boolean).length;
                return (
                  <option key={p.id} value={i}>{p.label} ({avail}/3 متوفر)</option>
                );
              })}
            </select>
            <ChevronDown size={16} color={G} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Comparison table — 3 columns */}
        <div style={{ background: B3, border: `1.5px solid rgba(255,255,255,0.07)`, borderRadius: 18, overflow: 'hidden', marginBottom: 14 }}>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: GRID, background: 'rgba(255,255,255,0.025)', borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
            {COL.map((c, ci) => {
              const v = part[c.key];
              const isBest = ci === bestIdx && v.available;
              return (
                <React.Fragment key={c.key}>
                  <div style={{
                    padding: '13px 14px', textAlign: 'center',
                    borderLeft: ci > 0 ? `1px solid rgba(255,255,255,0.05)` : undefined,
                    opacity: v.available ? 1 : 0.45,
                  }}>
                    {isBest && (
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ background: G, color: BG, fontSize: 9, fontWeight: 800, borderRadius: 999, padding: '2px 8px' }}>👑 الأفضل</span>
                      </div>
                    )}
                    {/* Availability badge */}
                    <div style={{ marginBottom: 4 }}>
                      {v.available ? (
                        <span style={{ fontSize: 9, fontWeight: 800, color: SG, background: 'rgba(61,168,130,0.12)', border: '1px solid rgba(61,168,130,0.25)', borderRadius: 999, padding: '2px 8px' }}>✓ متوفر</span>
                      ) : (
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 999, padding: '2px 8px' }}>✗ غير متوفر</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: v.available ? c.color : 'rgba(255,255,255,0.25)' }}>{v.badge}</div>
                    <div style={{ fontSize: 10, color: TD, marginTop: 2, lineHeight: 1.4 }}>{v.name}</div>
                    {ci > 0 && v.available && part.orig.available && (part.orig.price - v.price) > 0 && (
                      <div style={{ fontSize: 9, color: G, fontWeight: 700, marginTop: 3 }}>💰 وفّر {(part.orig.price - v.price).toLocaleString('ar-EG')} ج.م</div>
                    )}
                  </div>
                  {ci < 2 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 900, color: G, background: `${G}18`, border: `1px solid ${G}35`, borderRadius: 999, padding: '3px 7px' }}>VS</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Data rows */}
          {(['score', 'price', 'warranty', 'origin'] as const).map((type, ri) => {
            const labels: Record<string, string> = { score: 'الجودة', price: 'السعر', warranty: 'الضمان', origin: 'المنشأ' };
            const baseColors: [string, string, string] = type === 'score' ? [SG, SK, CN] : [TX, TX, TX];
            return (
              <div key={type} style={{ display: 'grid', gridTemplateColumns: GRID, borderBottom: ri < 3 ? `1px solid rgba(255,255,255,0.05)` : 'none', background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)' }}>
                {COL.map((c, vi) => (
                  <React.Fragment key={c.key}>
                    <div style={{ padding: '10px 14px', textAlign: 'center', borderLeft: vi > 0 ? `1px solid rgba(255,255,255,0.04)` : undefined }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: rowColor(part[c.key], baseColors[vi]) }}>
                        {rowVal(part[c.key], type)}
                      </span>
                    </div>
                    {vi < 2 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>{labels[type]}</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>

        {/* Bako ask section */}
        <div style={{ border: `1.5px solid rgba(200,151,74,0.28)`, borderRadius: 16, overflow: 'hidden', boxShadow: `0 4px 24px rgba(200,151,74,0.07)` }}>
          <div style={{ background: `linear-gradient(135deg,rgba(26,35,86,0.9),rgba(36,48,112,0.85))`, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid rgba(200,151,74,0.18)` }}>
            <img src={bakoImg} alt="باكو" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 22%', border: `2px solid ${G}`, background: NV, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#fff', fontFamily: "'Almarai',sans-serif" }}>
                اسأل باكو عن <span style={{ color: G }}>{part.label}</span>
              </div>
              <div style={{ fontSize: 10, color: `rgba(200,151,74,0.8)`, fontWeight: 700, marginTop: 1 }}>بيجاوبك على أصلي ولا تركي ولا صيني بناءً على المقارنة فوق</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 999, padding: '3px 10px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', animation: 'rp-glow-blink 2s infinite', flexShrink: 0 }} />
              <span style={{ color: '#4ADE80', fontSize: 10, fontWeight: 700 }}>متاح</span>
            </div>
          </div>
          <BakoChat context={part} hideHeader />
        </div>
      </div>
    </section>
  );
}

/* ── 3D Package Box (exact mockup design) ── */
const PKG_META: Record<string, { topColor: string; sideColor: string; accent: string; frontGrad: string; glow: string; kmNum: string }> = {
  km20: { topColor: '#1A5A84', sideColor: '#0E3A56', accent: SK,  frontGrad: `linear-gradient(160deg,#1A3A52,${BG} 85%)`, glow: `rgba(74,171,202,0.5)`,   kmNum: '20' },
  km40: { topColor: '#7A4B0E', sideColor: '#4E3005', accent: G,   frontGrad: `linear-gradient(160deg,#3A2100,${BG} 85%)`, glow: `rgba(200,151,74,0.5)`,  kmNum: '40' },
  km60: { topColor: '#3A2A86', sideColor: '#241870', accent: LV,  frontGrad: `linear-gradient(160deg,#1E1448,${BG} 85%)`, glow: `rgba(123,114,184,0.5)`, kmNum: '60' },
};

function PackageBox3D({ pkg, selected, onClick }: { pkg: typeof STATIC_PACKAGES[0]; selected: boolean; onClick: () => void }) {
  const id = pkg.id as 'km20' | 'km40' | 'km60';
  const m = PKG_META[id] ?? PKG_META['km40'];
  const W = 210, H = 310, D = 40;

  return (
    <div
      onClick={onClick}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.transform = 'translateY(-10px) scale(1.02)'; }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'; }}
      style={{
        position: 'relative', width: W + D, cursor: 'pointer', zIndex: selected ? 10 : 1,
        transform: selected ? 'translateY(-30px) scale(1.06)' : 'translateY(0) scale(1)',
        transition: 'transform .5s cubic-bezier(.34,1.4,.64,1), filter .3s ease',
        filter: selected ? `drop-shadow(0 32px 42px ${m.glow})` : 'drop-shadow(0 10px 22px rgba(0,0,0,0.6))',
      }}
    >
      {/* TOP FACE */}
      <div style={{ width: W, height: D, background: `linear-gradient(135deg,${m.topColor}ff,${m.topColor}99)`, borderRadius: '10px 10px 0 0', marginLeft: D, transformOrigin: 'bottom center', transform: 'perspective(250px) rotateX(58deg)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(255,255,255,0.08),transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 8, letterSpacing: 2.5, fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>RENOPACK</div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* SIDE FACE */}
        <div style={{ width: D, height: H, background: `linear-gradient(180deg,${m.sideColor}ff,${m.sideColor}66)`, borderRadius: '0 0 0 10px', transformOrigin: 'right center', transform: 'perspective(250px) rotateY(55deg)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(255,255,255,0.05),transparent 50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ writingMode: 'vertical-rl', fontSize: 9, fontWeight: 800, color: `${m.accent}55`, letterSpacing: 3, transform: 'rotate(180deg)' }}>{pkg.name}</div>
          </div>
        </div>

        {/* FRONT FACE */}
        <div style={{ width: W, height: H, background: m.frontGrad, border: `1.5px solid ${m.accent}28`, borderTop: `3px solid ${m.accent}55`, borderLeft: 'none', borderRadius: '0 0 12px 0', overflow: 'hidden', position: 'relative', padding: '18px 16px 16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '45%', height: '100%', background: 'linear-gradient(to right,rgba(255,255,255,0.04),transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${m.accent}88,${m.accent}22)`, pointerEvents: 'none' }} />

          <div style={{ fontSize: 9, fontWeight: 800, color: `${m.accent}aa`, letterSpacing: 2.5, marginBottom: 10 }}>RENOPACK ■</div>

          <div style={{ position: 'relative', marginBottom: 4, lineHeight: 1 }}>
            <div style={{ fontSize: 72, fontWeight: 900, color: m.accent, opacity: 0.12, position: 'absolute', top: -8, left: -4, fontFamily: 'monospace', letterSpacing: -4 }}>{m.kmNum}</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: m.accent, letterSpacing: -3, position: 'relative' }}>{m.kmNum}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 14, letterSpacing: .5 }}>ألف كيلومتر</div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${m.accent}12`, border: `1px solid ${m.accent}28`, borderRadius: 999, padding: '3px 10px', marginBottom: 12, width: 'fit-content' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: m.accent }}>{pkg.sub}</span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 800, color: '#D0DCE8', marginBottom: 'auto' }}>{pkg.name}</div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#E8F0F8', letterSpacing: -1.5, lineHeight: 1 }}>
              {pkg.price.toLocaleString()}
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginRight: 4 }}> ج.م</span>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginTop: 2 }}>شامل التركيب والضمان</div>
          </div>

          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(200,151,74,0.07)', border: '1px solid rgba(200,151,74,0.15)', borderRadius: 8, padding: '5px 9px' }}>
            <Gift size={10} color={G} /><span style={{ fontSize: 9, fontWeight: 700, color: G }}>🎁 {pkg.gift}</span>
          </div>

          {selected && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${m.accent},transparent)`, animation: 'rp-glow-blink 2s infinite' }} />}
        </div>
      </div>

      {/* Shelf shadow */}
      <div style={{ position: 'absolute', bottom: -20, left: '8%', right: '8%', height: 20, background: `radial-gradient(ellipse at 50% 0%,${m.glow},transparent 70%)`, filter: 'blur(5px)' }} />
    </div>
  );
}

/* ── Ready packages section 3D ── */
function ReadyPackagesSection({ realPackages }: { realPackages?: Array<{ id: number; name: string; slug: string; price: string | number; kmService?: number | null; description?: string }> }) {
  const [active, setActive] = useState('km40');

  // Only use km-based packages (20k, 40k, 60k) — exclude custom/emergency (kmService=0 or null)
  const kmPkgs = realPackages
    ? realPackages
        .filter(p => p.kmService && p.kmService > 0)
        .sort((a, b) => (a.kmService as number) - (b.kmService as number))
        .slice(0, 3)
    : null;

  const pkgs: typeof STATIC_PACKAGES = kmPkgs && kmPkgs.length >= 3
    ? kmPkgs.map((p, i) => ({
        id: STATIC_PACKAGES[i].id,
        name: p.name,
        sub: STATIC_PACKAGES[i].sub,
        price: (typeof p.price === 'string' ? parseInt(p.price, 10) : (p.price as number)) || STATIC_PACKAGES[i].price,
        color: STATIC_PACKAGES[i].color,
        includes: STATIC_PACKAGES[i].includes,
        gift: STATIC_PACKAGES[i].gift,
      }))
    : STATIC_PACKAGES;

  const pkg = pkgs.find(p => p.id === active) ?? pkgs[1];
  const m = PKG_META[active] ?? PKG_META['km40'];
  const pkgSlug = kmPkgs?.find((_, i) => STATIC_PACKAGES[i]?.id === active)?.slug ?? active;

  return (
    <section style={{ padding: '72px 28px 80px', borderTop: `1px solid ${BD}`, background: BG, overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(200,151,74,0.08)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 999, padding: '5px 18px', marginBottom: 16 }}>
            <Package size={13} color={G} /><span style={{ color: G, fontSize: 12, fontWeight: 700 }}>باكدجات جاهزة</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#E8F0F8', marginBottom: 8 }}>اختار الباكدج المناسب لسيارتك 📦</h2>
          <p style={{ color: TD, fontSize: 14 }}>كل باكدج بيشمل القطع + التركيب + الضمان + هدية</p>
        </div>

        {/* ── 3D Shelf Scene ── */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'flex-end', paddingBottom: 50 }}>
          <div style={{ position: 'absolute', bottom: 22, left: '4%', right: '4%', height: 2, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.09) 20%,rgba(255,255,255,0.14) 50%,rgba(255,255,255,0.09) 80%,transparent)', borderRadius: 999 }} />
          <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 40, background: 'radial-gradient(ellipse at 50% 0%,rgba(200,151,74,0.06),transparent 70%)', filter: 'blur(8px)' }} />
          {pkgs.map(p => (
            <PackageBox3D key={p.id} pkg={p} selected={active === p.id} onClick={() => setActive(p.id)} />
          ))}
        </div>

        {/* ── Expanded details panel ── */}
        <div style={{ maxWidth: 700, margin: '32px auto 0', background: `linear-gradient(145deg,${m.accent}0a,${B3} 60%)`, border: `1.5px solid ${m.accent}22`, borderRadius: 22, padding: '28px 32px', position: 'relative', overflow: 'hidden', transition: 'all .4s ease' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${m.accent}66,transparent)` }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
            <div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: '#E8F0F8', marginBottom: 6 }}>{pkg.name}</h3>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${m.accent}12`, border: `1px solid ${m.accent}28`, borderRadius: 999, padding: '4px 12px' }}>
                <Gift size={11} color={m.accent} /><span style={{ color: m.accent, fontSize: 11, fontWeight: 700 }}>هديتك: {pkg.gift}</span>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: m.accent, lineHeight: 1, letterSpacing: -1.5 }}>{pkg.price.toLocaleString()}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700 }}>ج.م شامل التركيب</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 22 }}>
            {pkg.includes.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={13} color={m.accent} style={{ flexShrink: 0 }} />
                <span style={{ color: TX, fontSize: 12, fontWeight: 700 }}>{s}</span>
              </div>
            ))}
          </div>
          <Link href={`/packages/${pkgSlug}`} style={{ display: 'block', width: '100%', background: `linear-gradient(135deg,${m.accent},${m.accent}bb)`, color: BG, border: 'none', borderRadius: 999, padding: '13px', textAlign: 'center', fontWeight: 800, fontSize: 14, boxShadow: `0 8px 26px ${m.glow}`, textDecoration: 'none', fontFamily: "'Almarai',sans-serif", cursor: 'pointer' }}>
            احجز الباكدج واستلم الهدية ←
          </Link>
        </div>

      </div>
    </section>
  );
}

/* ══════════════════ BOOKING MODAL ══════════════════ */
type Workshop = typeof WORKSHOPS[0];

const TIME_SLOTS = ['٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص', '١٢:٠٠ م', '٢:٠٠ م', '٣:٠٠ م', '٤:٠٠ م', '٦:٠٠ م'];

function BookingModal({ workshop, onClose }: { workshop: Workshop; onClose: () => void }) {
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const [date, setDate] = useState(minDate);
  const [slot, setSlot] = useState('');
  const [sent, setSent] = useState(false);

  const dateLabel = date ? new Intl.DateTimeFormat('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date + 'T12:00:00')) : '';

  const waMsg = encodeURIComponent(
    `مرحباً ${workshop.name} 👋\nأنا عميل من RenoPack وعايز أحجز موعد لتركيب باكدج الصيانة.\n📅 التاريخ: ${dateLabel}\n⏰ الوقت: ${slot}\n\nالرجاء التأكيد، شكراً!`
  );
  const waLink = `https://wa.me/${workshop.phone}?text=${waMsg}`;

  const canBook = date && slot;

  const handleBook = () => {
    setSent(true);
    window.open(waLink, '_blank');
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(7,9,20,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#111826', border: `1.5px solid ${workshop.color}30`, borderRadius: 24, padding: '0', width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: `0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px ${workshop.color}15` }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${workshop.color}14,rgba(26,35,86,0.6))`, padding: '20px 24px 16px', borderBottom: `1px solid ${workshop.color}18`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${workshop.color},${workshop.color}44)` }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${workshop.color}15`, border: `1.5px solid ${workshop.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={22} color={workshop.color} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: '#E8F0F8', lineHeight: 1.2 }}>{workshop.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <MapPin size={10} color={TD} />
                  <span style={{ color: TD, fontSize: 11, fontWeight: 700 }}>{workshop.address}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TD, fontSize: 18, flexShrink: 0 }}>×</button>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={11} color={G} fill={G} />
              <span style={{ color: G, fontWeight: 800, fontSize: 13 }}>{workshop.rating}</span>
              <span style={{ color: TD, fontSize: 10, fontWeight: 600 }}>تقييم</span>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12 }}>🕐</span>
              <span style={{ color: TD, fontSize: 11, fontWeight: 700 }}>{workshop.hours}</span>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12 }}>🚗</span>
              <span style={{ color: workshop.color, fontWeight: 800, fontSize: 12 }}>{workshop.jobs.toLocaleString()}</span>
              <span style={{ color: TD, fontSize: 10 }}>سيارة</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Date picker */}
          <div>
            <label style={{ display: 'block', color: G, fontWeight: 800, fontSize: 12, marginBottom: 8, letterSpacing: 0.5 }}>📅 اختار يوم الموعد</label>
            <input
              type="date"
              value={date}
              min={minDate}
              onChange={e => setDate(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${date ? workshop.color + '40' : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, padding: '11px 14px', color: '#E8F0F8', fontSize: 14, fontFamily: "'Almarai',sans-serif", fontWeight: 700, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
            />
            {date && <div style={{ color: TD, fontSize: 11, fontWeight: 600, marginTop: 5 }}>📆 {dateLabel}</div>}
          </div>

          {/* Time slots */}
          <div>
            <label style={{ display: 'block', color: G, fontWeight: 800, fontSize: 12, marginBottom: 10, letterSpacing: 0.5 }}>⏰ اختار الوقت المناسب</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {TIME_SLOTS.map(s => (
                <button key={s} onClick={() => setSlot(s)} style={{
                  background: slot === s ? `${workshop.color}18` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${slot === s ? workshop.color + '60' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10, padding: '9px 4px', color: slot === s ? workshop.color : TD,
                  fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: "'Almarai',sans-serif",
                  transition: 'all .15s', transform: slot === s ? 'scale(1.03)' : 'scale(1)',
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Contact fallback */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ color: TD, fontSize: 11, fontWeight: 600, marginBottom: 2 }}>أو تواصل مباشرة</div>
              <div style={{ color: '#E8F0F8', fontWeight: 800, fontSize: 14, direction: 'ltr' }}>+{workshop.phone}</div>
            </div>
            <a href={`tel:+${workshop.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(74,171,202,0.1)', border: '1px solid rgba(74,171,202,0.2)', borderRadius: 10, padding: '8px 14px', color: SK, fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>
              📞 اتصال
            </a>
          </div>

          {/* Book button */}
          {!sent ? (
            <button
              onClick={handleBook}
              disabled={!canBook}
              style={{
                width: '100%', border: 'none', borderRadius: 14, padding: '14px',
                background: canBook ? 'linear-gradient(135deg,#25D366,#1da851)' : 'rgba(255,255,255,0.06)',
                color: canBook ? '#fff' : 'rgba(255,255,255,0.25)',
                fontFamily: "'Almarai',sans-serif", fontWeight: 900, fontSize: 15,
                cursor: canBook ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: canBook ? '0 8px 24px rgba(37,211,102,0.3)' : 'none',
                transition: 'all .2s',
              }}
            >
              <span style={{ fontSize: 18 }}>💬</span>
              {canBook ? `تأكيد الحجز عبر واتساب` : 'اختار التاريخ والوقت أولاً'}
            </button>
          ) : (
            <div style={{ background: 'rgba(37,211,102,0.1)', border: '1.5px solid rgba(37,211,102,0.3)', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
              <div style={{ color: '#4ADE80', fontWeight: 900, fontSize: 15, marginBottom: 4 }}>✅ تم فتح واتساب!</div>
              <div style={{ color: TD, fontSize: 12, fontWeight: 600 }}>راسل الورشة وهيتواصلوا معاك لتأكيد الموعد</div>
            </div>
          )}

          <div style={{ textAlign: 'center', color: 'rgba(122,149,170,0.4)', fontSize: 11, fontWeight: 600 }}>
            هتوصلك رسالة تأكيد من الورشة على واتساب بعد تأكيد الموعد
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════ MAIN HOME PAGE ══════════════════ */
export default function Home() {
  const { data: packages, isLoading } = useListPackages();
  const { data: realParts } = useListParts();
  const compareData = React.useMemo(
    () => realParts ? buildCompareParts(realParts as RealPart[]) : null,
    [realParts]
  );
  const [activeService, setActiveService] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bookingWorkshop, setBookingWorkshop] = useState<Workshop | null>(null);
  const [, navigate] = useLocation();

  const togglePart = (id: string) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const total = [...selected].reduce((s, id) => s + (PUZZLE_PARTS.find(p => p.id === id)?.price ?? 0), 0);

  const goToCustomCheckout = () => {
    const parts = [...selected].map(id => {
      const p = PUZZLE_PARTS.find(x => x.id === id)!;
      return { id: p.id, label: p.label, price: p.price };
    });
    sessionStorage.setItem('customPuzzle', JSON.stringify({ parts, total }));
    navigate('/checkout/custom');
  };
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

            <h1 style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.2, letterSpacing: -1, marginBottom: 10, color: '#E8F0F8' }}>
              بنقدم لك<br />
              <span style={{ fontSize: 56, background: `linear-gradient(130deg,${G} 30%,${GL} 60%,${SK})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -2 }}>باكدج كامل</span>
            </h1>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.55)', marginBottom: 8, letterSpacing: -.5, lineHeight: 1.5 }}>
              قطع الغيار <span style={{ color: G, fontWeight: 800 }}>+ التركيب مجاناً</span><br />
              <span style={{ fontSize: 17, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>بأقرب ورشة معتمدة ليك في الإسكندرية</span>
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
              {[{ n: '1,247+', l: 'باكدج اتوصّل', c: G }, { n: '4.9★', l: 'متوسط التقييم', c: SK }, { n: '32', l: 'ورشة معتمدة', c: SG }, { n: '98%', l: 'رضا العملاء', c: LV }].map(({ n, l, c }, i) => (
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
              {[{ Icon: Package, c: SK, l: 'الموردين' }, { Icon: ArrowLeftRight, c: G, l: 'RenoPack' }, { Icon: Wrench, c: G, l: 'ورش التركيب' }, { Icon: BadgeCheck, c: SG, l: 'ضمان كامل' }].map(({ Icon, c, l }, i) => (
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

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ padding: '60px 28px', borderTop: `1px solid ${BD}`, background: `linear-gradient(180deg,${B2},${BG})` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(200,151,74,0.08)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 999, padding: '5px 16px', marginBottom: 14 }}>
              <Zap size={12} color={G} /><span style={{ color: G, fontSize: 12, fontWeight: 700 }}>إزاي بيشتغل RenoPack</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#E8F0F8', marginBottom: 8 }}>٣ خطوات — وعربيتك تتصلح</h2>
            <p style={{ color: TD, fontSize: 14 }}>مش محتاج تدور على قطعة، مش محتاج تتعامل مع الورشة — إحنا بنعمل كل ده عنك</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, position: 'relative' }}>
            {/* Connector lines */}
            <div style={{ position: 'absolute', top: 48, right: '33.3%', width: '33.3%', height: 2, background: `linear-gradient(90deg,${G}50,${G}20)`, zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 48, right: '66.6%', width: '33.3%', height: 2, background: `linear-gradient(90deg,${SK}50,${SK}20)`, zIndex: 0, pointerEvents: 'none' }} />

            {[
              {
                num: '١', icon: Package, color: G,
                title: 'اختار الباكدج',
                sub: 'اختار من الباكدجات الجاهزة أو ابني باكدجك بنفسك من القطع اللي تحتاجها',
                tags: ['صيانة 20,000 كم', 'صيانة 40,000 كم', 'باكدج مخصص'],
                tagColor: G,
              },
              {
                num: '٢', icon: Truck, color: SK,
                title: 'نيجيلك بالباكدج',
                sub: 'بنختارلك القطعة الأنسب — أصلي أو تركي — وبنوصّل الباكدج لحد بيتك أو تاخده من مركز التوزيع',
                tags: ['توصيل للبيت', 'استلام من المركز', 'أصلي أو تركي أو صيني'],
                tagColor: SK,
              },
              {
                num: '٣', icon: BadgeCheck, color: SG,
                title: 'روح الورشة وركّب',
                sub: 'تاخد الباكدج وتروح الورشة اللي تختارها أنت — وعندك ضمان حقيقي على كل القطع',
                tags: ['اختيار ورشتك', 'ضمان على القطع', 'راحة بالك كاملة'],
                tagColor: SG,
              },
            ].map(({ num, icon: Icon, color, title, sub, tags, tagColor }, i) => (
              <div key={i} style={{ background: B3, border: `1.5px solid ${color}18`, borderRadius: 24, padding: '28px 24px 24px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px rgba(0,0,0,0.3), 0 0 0 1.5px ${color}30`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ''}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${color},${color}30,transparent)`, borderRadius: '24px 24px 0 0' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `${color}12`, border: `1.5px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: color, letterSpacing: 1, marginBottom: 2 }}>الخطوة {num}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#E8F0F8', lineHeight: 1.2 }}>{title}</div>
                  </div>
                </div>

                <p style={{ color: TD, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{sub}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                  {tags.map(t => (
                    <span key={t} style={{ background: `${tagColor}0d`, border: `1px solid ${tagColor}22`, borderRadius: 999, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: tagColor }}>✓ {t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link href="/packages" className="rp-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${G},${GL})`, color: BG, border: 'none', padding: '13px 32px', fontWeight: 800, fontSize: 14, boxShadow: `0 8px 24px rgba(200,151,74,0.3)`, textDecoration: 'none' }}>
              <Package size={16} />اختار باكدجك دلوقتي
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ READY PACKAGES ═══ */}
      <ReadyPackagesSection realPackages={packages?.map(p => ({ id: p.id, name: p.name, slug: p.slug, price: p.sellPrice, kmService: p.kmService, description: p.description }))} />

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
          <div style={{ display: 'grid', gridTemplateColumns: selected.size >= 2 ? '1fr 270px 260px' : '1fr 270px', gap: 20, alignItems: 'start', transition: 'grid-template-columns .3s ease' }}>
            {/* ── LEFT: Parts categories ── */}
            <div>
              {['سوائل', 'فلاتر', 'فرامل', 'كهرباء', 'عفشة'].map(cat => {
                const parts = PUZZLE_PARTS.filter(p => p.cat === cat);
                return (
                  <div key={cat} style={{ marginBottom: 20 }}>
                    <p style={{ color: TD, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>{cat}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 9 }}>
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

            {/* ── MIDDLE: Puzzle Visual (shown when ≥2 parts) ── */}
            {selected.size >= 2 && (
              <div style={{ position: 'sticky', top: 80, animation: 'rp-fade-up .3s ease both' }}>
                <div style={{ background: B3, border: `1.5px solid rgba(200,151,74,0.25)`, borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${G},transparent)` }} />
                  <div style={{ padding: '14px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#E8F0F8' }}>🧩 باكدجك يتشكّل</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: G, background: 'rgba(200,151,74,0.1)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 999, padding: '2px 8px' }}>{selected.size} قطعة</span>
                  </div>
                  <div style={{ padding: '0 14px 14px', display: 'grid', gridTemplateColumns: selected.size >= 4 ? 'repeat(3,1fr)' : 'repeat(2,1fr)', gap: 7 }}>
                    {[...selected].map((id, idx) => {
                      const p = PUZZLE_PARTS.find(x => x.id === id)!;
                      if (!p) return null;
                      const puzColors = [G, SK, LV, SG, GL, TD];
                      const borderCol = puzColors[idx % puzColors.length];
                      return (
                        <div key={id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `2px solid ${borderCol}55`, aspectRatio: '1', cursor: 'pointer', transition: 'transform .2s', boxShadow: `0 4px 14px rgba(0,0,0,0.3), inset 0 0 0 1px ${borderCol}22` }}
                          onClick={() => togglePart(id)}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ''}>
                          <img src={p.img} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.85)' }} />
                          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.75))` }} />
                          <div style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: '50%', background: borderCol, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: BG }}>✓</div>
                          <div style={{ position: 'absolute', bottom: 4, right: 0, left: 0, padding: '0 6px' }}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: '#fff', lineHeight: 1.2, textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{p.label.length > 12 ? p.label.slice(0,12) + '…' : p.label}</div>
                          </div>
                        </div>
                      );
                    })}
                    {selected.size < 6 && selected.size < 4 && (
                      <div style={{ borderRadius: 12, border: '2px dashed rgba(200,151,74,0.18)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 18, opacity: 0.3 }}>🧩</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(200,151,74,0.35)' }}>أضف قطعة</span>
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: `1px solid rgba(255,255,255,0.05)`, padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: TD }}>اضغط على صورة لإزالتها 🔧</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: G }}>{total.toLocaleString()} ج.م</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── RIGHT: Summary card (always visible) ── */}
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
                  <button onClick={goToCustomCheckout} className="rp-pill" style={{ width: '100%', background: `linear-gradient(135deg,${G},${GL})`, color: BG, border: 'none', padding: '11px', fontWeight: 800, fontSize: 13, boxShadow: `0 5px 18px rgba(200,151,74,0.25)`, cursor: 'pointer' }}>
                    احجز الباكدج ده
                  </button>
                </>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ AI COMPARE + CHAT ═══ */}
      <AiCompareSection compareData={compareData} />

      {/* ═══ WORKSHOPS ═══ */}
      <section style={{ padding: '64px 28px', background: B2, borderTop: `1px solid ${BD}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(200,151,74,0.08)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 999, padding: '4px 14px', marginBottom: 12 }}>
                <Building2 size={11} color={G} />
                <span style={{ color: G, fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>الورش المعتمدة</span>
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#E8F0F8', marginBottom: 6, lineHeight: 1.2 }}>ورشنا في الإسكندرية</h2>
              <p style={{ color: TD, fontSize: 13, fontWeight: 600 }}>كل ورشة اتختارت بمعايير صارمة للجودة والخدمة</p>
            </div>
            <Link href="/workshops" style={{ display: 'flex', alignItems: 'center', gap: 6, color: G, background: 'rgba(200,151,74,0.08)', border: '1.5px solid rgba(200,151,74,0.2)', borderRadius: 999, padding: '8px 18px', fontWeight: 800, fontSize: 13, textDecoration: 'none', transition: 'background .2s' }}>
              كل الورش <ArrowLeft size={13} />
            </Link>
          </div>

          {/* 4-column workshop cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
            {WORKSHOPS.map((w, idx) => (
              <div key={w.name}
                style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid rgba(255,255,255,0.07)`, background: B3, cursor: 'pointer', transition: 'transform .25s, box-shadow .25s, border-color .25s', position: 'relative' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px rgba(0,0,0,0.3)`; (e.currentTarget as HTMLDivElement).style.borderColor = `${w.color}40`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                {/* Top accent bar */}
                <div style={{ height: 4, background: `linear-gradient(90deg,${w.color},${w.color}55)` }} />

                {/* Banner area */}
                <div style={{ height: 90, background: `linear-gradient(145deg,${BG},${w.color}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: `${w.color}14`, border: `1.5px solid ${w.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={24} color={w.color} />
                  </div>
                  {/* Rank badge */}
                  {idx === 0 && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: `linear-gradient(135deg,${G},${GL})`, color: '#0D1220', borderRadius: 999, padding: '2px 8px', fontSize: 9, fontWeight: 900 }}>الأعلى تقييماً</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '14px 16px 16px' }}>
                  <h4 style={{ color: '#E8F0F8', fontSize: 14, fontWeight: 900, marginBottom: 6, lineHeight: 1.3 }}>{w.name}</h4>

                  {/* Area */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                    <MapPin size={10} color={TD} />
                    <span style={{ color: TD, fontSize: 11, fontWeight: 700 }}>{w.area}</span>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '7px 0', textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: w.color, lineHeight: 1 }}>{w.jobs.toLocaleString()}</div>
                      <div style={{ fontSize: 9, color: TD, fontWeight: 700, marginTop: 2 }}>سيارة خُدمت</div>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '7px 0', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                        <Star size={11} color={G} fill={G} />
                        <span style={{ fontSize: 15, fontWeight: 900, color: G, lineHeight: 1 }}>{w.rating}</span>
                      </div>
                      <div style={{ fontSize: 9, color: TD, fontWeight: 700, marginTop: 2 }}>تقييم العملاء</div>
                    </div>
                  </div>

                  {/* Rating bar */}
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ height: '100%', width: `${(w.rating / 5) * 100}%`, background: `linear-gradient(90deg,${w.color},${w.color}88)`, borderRadius: 999 }} />
                  </div>

                  {/* CTA */}
                  <button onClick={() => setBookingWorkshop(w)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: `${w.color}10`, border: `1px solid ${w.color}25`, borderRadius: 10, padding: '8px', color: w.color, fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: "'Almarai',sans-serif", transition: 'background .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${w.color}1e`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${w.color}10`; }}>
                    احجز موعد <ArrowLeft size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Join as workshop banner */}
          <div style={{ background: `linear-gradient(135deg,rgba(200,151,74,0.07),rgba(26,35,86,0.4))`, border: `1.5px solid rgba(200,151,74,0.2)`, borderRadius: 18, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 140, height: 140, background: `radial-gradient(circle,rgba(200,151,74,0.06),transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: `rgba(200,151,74,0.12)`, border: `1px solid rgba(200,151,74,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={22} color={G} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 15, color: '#E8F0F8', marginBottom: 4 }}>عندك ورشة في الإسكندرية؟</div>
                <div style={{ color: TD, fontSize: 12, fontWeight: 700 }}>انضم لشبكة RenoPack واستقبل طلبات أكثر — مجاناً تماماً</div>
              </div>
            </div>
            <Link href="/join-workshop" style={{ background: `linear-gradient(135deg,${G},${GL})`, color: '#0D1220', borderRadius: 12, padding: '11px 24px', fontWeight: 900, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: `0 6px 20px rgba(200,151,74,0.25)`, display: 'flex', alignItems: 'center', gap: 6 }}>
              انضم كورشة <ArrowLeft size={13} />
            </Link>
          </div>

        </div>
      </section>

      {/* Booking Modal */}
      {bookingWorkshop && <BookingModal workshop={bookingWorkshop} onClose={() => setBookingWorkshop(null)} />}

    </div>
  );
}
