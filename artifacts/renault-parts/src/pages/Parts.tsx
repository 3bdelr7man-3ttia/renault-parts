import React, { useState } from 'react';
import { useListParts } from '@workspace/api-client-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Layers, Zap, Shield, Star, ChevronDown, ChevronUp, Plus, Check } from 'lucide-react';
import { useLocation } from 'wouter';
import { RenoPackLogo } from '@/components/layout/AppLayout';
import { usePartCart } from '@/lib/part-cart-context';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import bakoNew from '@/assets/bako-new.png';

/* ── Brand colours ── */
const G = '#C8974A';   // gold
const BG = '#0D1220';
const CARD = '#161E30';
const CARD2 = '#1A2340';

/* ── Part type filters ── */
const PART_TYPES = [
  { value: null,      label: 'الكل',         icon: <Layers size={14} /> },
  { value: 'زيت',    label: 'زيت المحرك',   icon: '🛢️' },
  { value: 'فلتر',   label: 'فلاتر',         icon: '🔧' },
  { value: 'بطارية', label: 'بطاريات',       icon: '⚡' },
  { value: 'بريك',   label: 'فرامل',         icon: '🔴' },
  { value: 'تعليق',  label: 'تعليق',         icon: '🔩' },
  { value: 'شمع',    label: 'شموع الإشعال',  icon: '✨' },
];

/* ── Origin filters ── */
const ORIGINS = [
  { value: 'all',      label: 'كل الأصناف'  },
  { value: 'original', label: 'أصلي (OEM)'  },
  { value: 'turkish',  label: 'تركي',        },
  { value: 'chinese',  label: 'صيني',        },
];

/* ── Renault models ── */
const RENAULT_MODELS = [
  'الكل', 'لوجان', 'ساندرو', 'ميجان', 'داستر', 'كليو', 'كابتور', 'تاليسمان', 'فلوانس'
];

const PART_IMAGES: Record<string, string> = {
  'زيت':    'part-oil.jpg',
  'فلتر':   'part-airfilter.jpg',
  'بطارية': 'part-battery.jpg',
  'بريك':   'part-brakes.jpg',
  'تعليق':  'part-suspension.jpg',
  'شمع':    'part-sparks.jpg',
};

function formatPrice(v: number | null | undefined) {
  if (v == null) return null;
  return `${v.toLocaleString('ar-EG')} ج.م`;
}

function parseModels(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const s = raw.trim();
  if (s.startsWith('[')) {
    try { return JSON.parse(s) as string[]; } catch { /* fall through */ }
  }
  return s.split(',').map(m => m.trim()).filter(Boolean);
}

function PartCard({ part, origin }: {
  part: {
    id: number; name: string; oemCode: string | null; type: string;
    priceOriginal: number | null; priceTurkish: number | null; priceChinese: number | null;
    compatibleModels: string | null; supplier: string | null;
  };
  origin: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { addPart, removePart, hasItem } = usePartCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const inCart = hasItem(part.id);
  const imgFile = PART_IMAGES[part.type];
  const imgSrc = imgFile ? `${import.meta.env.BASE_URL}images/${imgFile}` : undefined;

  const prices = [
    { label: 'أصلي', val: part.priceOriginal, color: '#3DA882', key: 'original' },
    { label: 'تركي', val: part.priceTurkish,  color: '#4AABCA', key: 'turkish'  },
    { label: 'صيني', val: part.priceChinese,  color: '#C8974A', key: 'chinese'  },
  ].filter(p => p.val !== null && (origin === 'all' || origin === p.key));

  const lowestPrice = prices.reduce((min, p) => (!min || (p.val && p.val < min)) ? p.val : min, null as number | null);

  const handleCartClick = () => {
    if (!user) {
      toast({ title: 'سجّل دخولك أولاً', description: 'لازم تكون مسجّل دخول عشان تضيف قطع للباكدج.' });
      setLocation('/login');
      return;
    }
    if (inCart) {
      removePart(part.id);
      toast({ title: 'اتشالت من الباكدج', description: part.name });
    } else {
      const price = lowestPrice ?? 0;
      addPart({ id: part.id, label: part.name, price });
      toast({ title: 'اتضافت للباكدج ✓', description: `${part.name} — ${formatPrice(price)}` });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{ background: CARD, border: `1.5px solid rgba(200,151,74,0.1)`, borderRadius: 20, overflow: 'hidden', fontFamily: "'Almarai',sans-serif", transition: 'border-color .2s, box-shadow .2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,151,74,0.28)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,151,74,0.1)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      {/* Image / Type banner */}
      <div style={{ position: 'relative', height: 120, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {imgSrc ? (
          <img src={imgSrc} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
        ) : (
          <span style={{ fontSize: 40 }}>🔩</span>
        )}
        {/* Type badge */}
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(13,18,32,0.85)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: G }}>
          {part.type}
        </div>
        {/* Lowest price */}
        {lowestPrice && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(13,18,32,0.9))', padding: '20px 14px 10px', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: G }}>من {formatPrice(lowestPrice)}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#E8F0F8', marginBottom: 4, lineHeight: 1.3 }}>{part.name}</h3>
        {part.oemCode && (
          <div style={{ fontSize: 11, color: '#7A95AA', fontWeight: 600, marginBottom: 8, direction: 'ltr', textAlign: 'right' }}>OEM: {part.oemCode}</div>
        )}

        {/* Price pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {prices.map(p => (
            <div key={p.key} style={{ background: `${p.color}18`, border: `1px solid ${p.color}40`, borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: p.color }}>
              {p.label}: {formatPrice(p.val)}
            </div>
          ))}
          {prices.length === 0 && <span style={{ fontSize: 12, color: '#7A95AA' }}>السعر عند الطلب</span>}
        </div>

        {/* Add to package button */}
        <button
          onClick={handleCartClick}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginTop: 10, marginBottom: 6,
            padding: '9px 16px',
            borderRadius: 12,
            border: inCart ? '1.5px solid rgba(61,168,130,0.4)' : '1.5px solid rgba(200,151,74,0.3)',
            background: inCart ? 'rgba(61,168,130,0.1)' : 'rgba(200,151,74,0.08)',
            color: inCart ? '#3DA882' : G,
            fontFamily: "'Almarai',sans-serif",
            fontWeight: 800, fontSize: 13,
            cursor: 'pointer',
            transition: 'all .2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = inCart ? 'rgba(61,168,130,0.18)' : 'rgba(200,151,74,0.16)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = inCart ? 'rgba(61,168,130,0.1)' : 'rgba(200,151,74,0.08)'; }}
        >
          {inCart ? <Check size={14} /> : <Plus size={14} />}
          {inCart ? 'اتضافت للباكدج ✓' : 'أضف للباكدج'}
        </button>

        {/* Compatible models toggle */}
        {(() => {
          const models = parseModels(part.compatibleModels);
          if (models.length === 0) return null;
          return (
            <>
              <button
                onClick={() => setExpanded(x => !x)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#7A95AA', fontSize: 12, fontWeight: 600, padding: 0, fontFamily: "'Almarai',sans-serif", marginBottom: 0 }}
              >
                الموديلات المتوافقة ({models.length})
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                      {models.map(m => (
                        <span key={m} style={{ background: 'rgba(74,171,202,0.1)', border: '1px solid rgba(74,171,202,0.2)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#4AABCA', fontWeight: 600 }}>{m}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          );
        })()}
      </div>
    </motion.div>
  );
}

export default function Parts() {
  const { data: parts, isLoading } = useListParts();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [origin, setOrigin] = useState('all');
  const [modelFilter, setModelFilter] = useState('الكل');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = parts?.filter(p => {
    if (typeFilter && p.type !== typeFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.oemCode?.toLowerCase().includes(search.toLowerCase()))) return false;
    if (modelFilter !== 'الكل' && p.compatibleModels) {
      if (!p.compatibleModels.includes(modelFilter) && !p.compatibleModels.includes('جميع موديلات رينو')) return false;
    }
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: BG, direction: 'rtl' }}>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '56px 24px 72px', background: `linear-gradient(160deg,#070C18 0%,#0F1828 60%,${BG} 100%)` }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(200,151,74,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,151,74,0.03) 1px,transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 300, background: 'radial-gradient(ellipse,rgba(74,171,202,0.06),transparent 65%)', pointerEvents: 'none' }} />

        {/* Bako mascot */}
        <img src={bakoNew} alt="باكو" style={{ position: 'absolute', left: 40, bottom: 0, height: 200, opacity: 0.18, mixBlendMode: 'screen', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><RenoPackLogo size="md" /></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,171,202,0.08)', border: '1px solid rgba(74,171,202,0.2)', borderRadius: 999, padding: '5px 16px', marginBottom: 14 }}>
            <Zap size={12} color="#4AABCA" />
            <span style={{ fontFamily: "'Almarai',sans-serif", fontSize: 12, fontWeight: 700, color: '#4AABCA' }}>كتالوج قطع الغيار الأصلية والبديلة</span>
          </div>
          <h1 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 38, fontWeight: 900, color: '#E8F0F8', marginBottom: 10, lineHeight: 1.2 }}>
            كل قطعة تحتاجها لـ<span style={{ color: G }}> رينو</span>
          </h1>
          <p style={{ fontFamily: "'Almarai',sans-serif", fontSize: 16, color: '#7A95AA', fontWeight: 500, maxWidth: 500, margin: '0 auto 24px' }}>
            أصلي أو تركي أو صيني — نوفر ليك الخيار بأسعار شفافة من أفضل الموردين في الإسكندرية.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[
              { n: '+500', l: 'قطعة' },
              { n: '3', l: 'أصناف' },
              { n: '24h', l: 'توصيل' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Almarai',sans-serif", fontSize: 22, fontWeight: 900, color: G }}>{s.n}</div>
                <div style={{ fontFamily: "'Almarai',sans-serif", fontSize: 12, color: '#7A95AA', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky search + filter bar ── */}
      <div style={{ position: 'sticky', top: 68, zIndex: 20, background: 'rgba(13,18,32,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(200,151,74,0.1)', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} color="#7A95AA" style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث باسم القطعة أو رقم OEM..."
              style={{ width: '100%', background: '#111826', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 999, padding: '9px 38px 9px 16px', color: '#D4E0EC', fontSize: 14, fontFamily: "'Almarai',sans-serif", fontWeight: 600, outline: 'none', direction: 'rtl' }}
            />
          </div>
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(x => !x)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: showFilters ? 'rgba(200,151,74,0.15)' : '#111826', border: `1.5px solid ${showFilters ? 'rgba(200,151,74,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 999, padding: '9px 18px', color: showFilters ? G : '#A0B4C8', fontFamily: "'Almarai',sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'all .2s' }}
          >
            <SlidersHorizontal size={14} /> الفلاتر
          </button>
          {/* Results count */}
          {!isLoading && (
            <span style={{ fontFamily: "'Almarai',sans-serif", fontSize: 13, color: '#7A95AA', fontWeight: 600, flexShrink: 0 }}>
              {filtered?.length ?? 0} قطعة
            </span>
          )}
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ maxWidth: 1200, margin: '12px auto 0', display: 'flex', gap: 20, flexWrap: 'wrap', paddingBottom: 4 }}>
                {/* Type filters */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Almarai',sans-serif", fontSize: 12, color: '#7A95AA', fontWeight: 700 }}>النوع:</span>
                  {PART_TYPES.map(t => {
                    const active = typeFilter === t.value;
                    return (
                      <button key={String(t.value)} onClick={() => setTypeFilter(t.value)}
                        style={{ fontFamily: "'Almarai',sans-serif", fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '5px 14px', border: active ? 'none' : '1.5px solid rgba(200,151,74,0.2)', background: active ? 'linear-gradient(135deg,#C8974A,#DEB06C)' : 'transparent', color: active ? '#0D1220' : '#A0B4C8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {t.icon}{t.label}
                      </button>
                    );
                  })}
                </div>
                {/* Origin filters */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Almarai',sans-serif", fontSize: 12, color: '#7A95AA', fontWeight: 700 }}>الصنف:</span>
                  {ORIGINS.map(o => {
                    const active = origin === o.value;
                    return (
                      <button key={o.value} onClick={() => setOrigin(o.value)}
                        style={{ fontFamily: "'Almarai',sans-serif", fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '5px 14px', border: active ? 'none' : '1.5px solid rgba(74,171,202,0.2)', background: active ? 'rgba(74,171,202,0.15)' : 'transparent', color: active ? '#4AABCA' : '#A0B4C8', cursor: 'pointer' }}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
                {/* Model filter */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Almarai',sans-serif", fontSize: 12, color: '#7A95AA', fontWeight: 700 }}>الموديل:</span>
                  {RENAULT_MODELS.map(m => {
                    const active = modelFilter === m;
                    return (
                      <button key={m} onClick={() => setModelFilter(m)}
                        style={{ fontFamily: "'Almarai',sans-serif", fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '5px 14px', border: active ? 'none' : '1.5px solid rgba(123,114,184,0.2)', background: active ? 'rgba(123,114,184,0.2)' : 'transparent', color: active ? '#7B72B8' : '#A0B4C8', cursor: 'pointer' }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Grid ── */}
      <div style={{ maxWidth: 1200, margin: '32px auto', padding: '0 24px 60px' }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ height: 280, background: CARD, borderRadius: 20, opacity: 0.6, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#111826', borderRadius: 24, border: '1.5px dashed rgba(200,151,74,0.15)' }}>
            <span style={{ fontSize: 48 }}>🔍</span>
            <h3 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 22, fontWeight: 800, color: '#D4E0EC', margin: '16px 0 8px' }}>لا توجد قطع مطابقة</h3>
            <p style={{ fontFamily: "'Almarai',sans-serif", color: '#7A95AA', fontSize: 15 }}>جرب تغيير الفلاتر أو البحث بكلمة أخرى.</p>
          </div>
        ) : (
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            <AnimatePresence>
              {filtered?.map(part => (
                <PartCard key={part.id} part={{ ...part, oemCode: part.oemCode ?? null, priceOriginal: part.priceOriginal ?? null, priceTurkish: part.priceTurkish ?? null, priceChinese: part.priceChinese ?? null, compatibleModels: part.compatibleModels ?? null, supplier: part.supplier ?? null }} origin={origin} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Guarantee strip ── */}
      <div style={{ background: '#111826', borderTop: '1px solid rgba(200,151,74,0.08)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {[
            { icon: <Shield size={18} color="#3DA882" />, text: 'ضمان الجودة على جميع القطع' },
            { icon: <Star size={18} color={G} />, text: 'قطع أصلية ومعتمدة' },
            { icon: <Zap size={18} color="#4AABCA" />, text: 'توصيل خلال 24 ساعة بالإسكندرية' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Almarai',sans-serif", fontSize: 14, fontWeight: 700, color: '#A0B4C8' }}>
              {item.icon}{item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
