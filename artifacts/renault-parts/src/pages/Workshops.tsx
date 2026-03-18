import React, { useState } from 'react';
import { useListWorkshops } from '@workspace/api-client-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Star, Shield, Clock, Wrench, Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import { RenoPackLogo } from '@/components/layout/AppLayout';
import bakoNew from '@/assets/bako-new.png';

/* ── Brand tokens ── */
const G = '#C8974A';
const BG = '#0D1220';
const CARD = '#161E30';
const CARD2 = '#111826';

/* ── Alexandria areas ── */
const AREAS = [
  'الكل', 'المنتزه', 'سيدي جابر', 'سموحة', 'العجمي',
  'المنشية', 'كليوباترا', 'ميامي', 'الإبراهيمية', 'سيدي بشر', 'الشاطبي',
];

/* ── Workshop specialties (UI only) ── */
const SPECS = ['كهرباء', 'ميكانيكا', 'تكييف', 'رفع ودهان', 'فرامل', 'إطارات'];

/* ── Stars renderer ── */
function Stars({ rating }: { rating: number | null }) {
  const r = rating ?? 0;
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={12} fill={s <= Math.round(r) ? G : 'transparent'} color={s <= Math.round(r) ? G : '#3A4860'} />
      ))}
    </div>
  );
}

/* ── Workshop Card ── */
function WorkshopCard({ w, idx }: {
  w: { id: number; name: string; area: string; address: string; phone: string; rating: number | null };
  idx: number;
}) {
  const [expanded, setExpanded] = useState(false);
  /* assign deterministic specialty tags based on id */
  const specTags = SPECS.filter((_, i) => (w.id + i) % 3 === 0).slice(0, 3);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: idx * 0.04 }}
      style={{ background: CARD, border: '1.5px solid rgba(200,151,74,0.1)', borderRadius: 22, overflow: 'hidden', fontFamily: "'Almarai',sans-serif", direction: 'rtl', transition: 'border-color .2s, box-shadow .2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,151,74,0.28)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 36px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,151,74,0.1)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      {/* Top colored bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg,${G},#DEB06C,rgba(200,151,74,0))` }} />

      {/* Main content */}
      <div style={{ padding: '18px 20px 16px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            {/* Verified badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(61,168,130,0.1)', border: '1px solid rgba(61,168,130,0.2)', borderRadius: 999, padding: '2px 8px', marginBottom: 6 }}>
              <CheckCircle2 size={10} color="#3DA882" />
              <span style={{ fontSize: 10, fontWeight: 800, color: '#3DA882' }}>ورشة معتمدة</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#E8F0F8', lineHeight: 1.2, marginBottom: 4 }}>{w.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#7A95AA', fontSize: 12, fontWeight: 600 }}>
              <MapPin size={11} color={G} />
              <span>{w.area}</span>
            </div>
          </div>
          {/* Rating box */}
          <div style={{ flexShrink: 0, textAlign: 'center', background: CARD2, borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(200,151,74,0.1)' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: G, lineHeight: 1 }}>{w.rating?.toFixed(1) ?? '—'}</div>
            <Stars rating={w.rating} />
          </div>
        </div>

        {/* Specialty tags */}
        {specTags.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
            {specTags.map(s => (
              <span key={s} style={{ background: 'rgba(123,114,184,0.1)', border: '1px solid rgba(123,114,184,0.2)', borderRadius: 6, padding: '2px 9px', fontSize: 11, fontWeight: 700, color: '#7B72B8' }}>{s}</span>
            ))}
          </div>
        )}

        {/* Address */}
        {w.address && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: '#5A7080', fontSize: 12, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>
            <MapPin size={11} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{w.address}</span>
          </div>
        )}

        {/* Working hours placeholder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <Clock size={11} color="#4AABCA" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4AABCA' }}>السبت – الخميس: ٩ص – ٩م</span>
          <span style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: '#3DA882' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3DA882', boxShadow: '0 0 6px #3DA882' }} />
            مفتوح الآن
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {w.phone && (
            <a
              href={`tel:${w.phone}`}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'linear-gradient(135deg,#C8974A,#DEB06C)', color: '#0D1220', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 13, borderRadius: 12, padding: '10px 0', textDecoration: 'none', boxShadow: '0 4px 14px rgba(200,151,74,0.3)' }}
            >
              <Phone size={13} /> اتصل بالورشة
            </a>
          )}
          <button
            onClick={() => setExpanded(x => !x)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 14px', color: '#A0B4C8', fontFamily: "'Almarai',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            تفاصيل <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} />
          </button>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ marginTop: 14, padding: '12px 14px', background: CARD2, borderRadius: 12, border: '1px solid rgba(200,151,74,0.08)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#7A95AA', marginBottom: 8 }}>معلومات إضافية</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    { icon: <Shield size={11} />, label: 'ضمان العمل', val: '30 يوم' },
                    { icon: <Wrench size={11} />, label: 'قطع أصلية', val: '✓' },
                    { icon: <Clock size={11} />, label: 'وقت الصيانة', val: '2-4 ساعات' },
                    { icon: <Star size={11} />, label: 'تقييمات', val: `${Math.floor(Math.random() * 80 + 20)} تقييم` },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ color: G }}>{item.icon}</span>
                      <span style={{ fontSize: 11, color: '#7A95AA', fontWeight: 600 }}>{item.label}:</span>
                      <span style={{ fontSize: 11, color: '#D4E0EC', fontWeight: 700 }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── MAP placeholder card ── */
function MapCard() {
  return (
    <div style={{ background: CARD, border: '1.5px solid rgba(200,151,74,0.1)', borderRadius: 22, overflow: 'hidden', position: 'relative', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0B1220,#161E30)', opacity: 0.9 }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <MapPin size={36} color="rgba(200,151,74,0.3)" />
        <p style={{ fontFamily: "'Almarai',sans-serif", fontSize: 13, color: '#7A95AA', fontWeight: 700, marginTop: 8 }}>خريطة الورش<br /><span style={{ color: '#3A4860', fontWeight: 600 }}>قريباً...</span></p>
      </div>
    </div>
  );
}

export default function Workshops() {
  const { data: workshops, isLoading } = useListWorkshops();
  const [area, setArea] = useState('الكل');
  const [search, setSearch] = useState('');

  const filtered = workshops?.filter(w => {
    if (area !== 'الكل' && w.area !== area) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase()) && !w.area.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: BG, direction: 'rtl' }}>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '56px 24px 72px', background: `linear-gradient(160deg,#070C18 0%,#111826 60%,${BG} 100%)` }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(200,151,74,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,151,74,0.03) 1px,transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse,rgba(61,168,130,0.06),transparent 65%)', pointerEvents: 'none' }} />

        {/* Bako mascot */}
        <img src={bakoNew} alt="باكو" style={{ position: 'absolute', left: 40, bottom: 0, height: 200, opacity: 0.15, mixBlendMode: 'screen', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><RenoPackLogo size="md" /></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(61,168,130,0.08)', border: '1px solid rgba(61,168,130,0.2)', borderRadius: 999, padding: '5px 16px', marginBottom: 14 }}>
            <CheckCircle2 size={12} color="#3DA882" />
            <span style={{ fontFamily: "'Almarai',sans-serif", fontSize: 12, fontWeight: 700, color: '#3DA882' }}>شبكة ورش معتمدة في الإسكندرية</span>
          </div>
          <h1 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 38, fontWeight: 900, color: '#E8F0F8', marginBottom: 10, lineHeight: 1.2 }}>
            ورش <span style={{ color: G }}>رينو</span> في كل الإسكندرية
          </h1>
          <p style={{ fontFamily: "'Almarai',sans-serif", fontSize: 16, color: '#7A95AA', fontWeight: 500, maxWidth: 500, margin: '0 auto 28px' }}>
            شبكة من أفضل ورش الصيانة المعتمدة، متخصصة في سيارات رينو، بأسعار شفافة وضمان على الشغل.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {[
              { n: '+30', l: 'ورشة معتمدة' },
              { n: '11', l: 'منطقة' },
              { n: '4.8★', l: 'متوسط التقييم' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Almarai',sans-serif", fontSize: 24, fontWeight: 900, color: G }}>{s.n}</div>
                <div style={{ fontFamily: "'Almarai',sans-serif", fontSize: 12, color: '#7A95AA', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AREA FILTER BAR ── */}
      <div style={{ position: 'sticky', top: 68, zIndex: 20, background: 'rgba(13,18,32,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(200,151,74,0.08)', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={13} color="#7A95AA" style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث باسم الورشة أو المنطقة..."
              style={{ width: '100%', background: '#111826', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 999, padding: '9px 38px 9px 16px', color: '#D4E0EC', fontSize: 14, fontFamily: "'Almarai',sans-serif", fontWeight: 600, outline: 'none', direction: 'rtl' }}
            />
          </div>
          {/* Results */}
          {!isLoading && (
            <span style={{ fontFamily: "'Almarai',sans-serif", fontSize: 13, color: '#7A95AA', fontWeight: 600, flexShrink: 0 }}>
              {filtered?.length ?? 0} ورشة
            </span>
          )}
        </div>

        {/* Area pills */}
        <div style={{ maxWidth: 1200, margin: '10px auto 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {AREAS.map(a => {
            const active = area === a;
            return (
              <button key={a} onClick={() => setArea(a)}
                style={{ fontFamily: "'Almarai',sans-serif", fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '5px 14px', border: active ? 'none' : '1.5px solid rgba(61,168,130,0.2)', background: active ? 'rgba(61,168,130,0.15)' : 'transparent', color: active ? '#3DA882' : '#A0B4C8', cursor: 'pointer', transition: 'all .2s' }}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: '32px auto', padding: '0 24px 60px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28, alignItems: 'start' }}>

        {/* Workshops grid */}
        <div>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 20 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: 280, background: CARD, borderRadius: 22, opacity: 0.6, animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : filtered?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: '#111826', borderRadius: 24, border: '1.5px dashed rgba(200,151,74,0.15)' }}>
              <Wrench size={48} color="rgba(200,151,74,0.15)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 22, fontWeight: 800, color: '#D4E0EC', marginBottom: 8 }}>لا توجد ورش في هذه المنطقة</h3>
              <p style={{ fontFamily: "'Almarai',sans-serif", color: '#7A95AA', fontSize: 15 }}>جرب منطقة أخرى.</p>
            </div>
          ) : (
            <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 20 }}>
              <AnimatePresence>
                {filtered?.map((w, i) => <WorkshopCard key={w.id} w={w} idx={i} />)}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 160 }}>
          <MapCard />

          {/* How it works */}
          <div style={{ background: CARD, border: '1.5px solid rgba(200,151,74,0.1)', borderRadius: 22, padding: '20px 18px', fontFamily: "'Almarai',sans-serif" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#C8974A', marginBottom: 14 }}>كيف يعمل النظام؟</h3>
            {[
              { n: '01', text: 'اختار قطعتك أو باكدجك' },
              { n: '02', text: 'اختار الورشة الأقرب ليك' },
              { n: '03', text: 'حجز الموعد أونلاين' },
              { n: '04', text: 'خلي العربية جاهزة!' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(200,151,74,0.1)', border: '1px solid rgba(200,151,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 900, color: G }}>{step.n}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#A0B4C8' }}>{step.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg,rgba(200,151,74,0.1),rgba(200,151,74,0.04))', border: '1.5px solid rgba(200,151,74,0.2)', borderRadius: 22, padding: '20px 18px', textAlign: 'center', fontFamily: "'Almarai',sans-serif" }}>
            <Shield size={28} color={G} style={{ margin: '0 auto 10px' }} />
            <h4 style={{ fontSize: 15, fontWeight: 800, color: '#E8F0F8', marginBottom: 6 }}>ضمان الجودة</h4>
            <p style={{ fontSize: 12, color: '#7A95AA', lineHeight: 1.7, fontWeight: 500 }}>كل الورش المعتمدة تقدم ضمان 30 يوم على الشغل واليد العاملة.</p>
          </div>
        </div>
      </div>

      {/* ── Guarantee strip ── */}
      <div style={{ background: '#111826', borderTop: '1px solid rgba(200,151,74,0.08)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {[
            { icon: <CheckCircle2 size={18} color="#3DA882" />, text: 'ورش معتمدة ومراجعة' },
            { icon: <Shield size={18} color={G} />, text: 'ضمان على الشغل' },
            { icon: <Clock size={18} color="#4AABCA" />, text: 'خدمة 6 أيام في الأسبوع' },
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
