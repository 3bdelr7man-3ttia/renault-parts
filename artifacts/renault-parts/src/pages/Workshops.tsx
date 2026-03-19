import React, { useState, useEffect } from 'react';
import { useListWorkshops } from '@workspace/api-client-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Star, Shield, Clock, Wrench, Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import { RenoPackLogo } from '@/components/layout/AppLayout';
import bakoNew from '@/assets/bako-new.png';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

/* ── Brand tokens ── */
const G = '#C8974A';
const BG = '#0D1220';
const CARD = '#161E30';
const CARD2 = '#111826';

/* ── Area → approximate lat/lng ── */
const AREA_COORDS: Record<string, [number, number]> = {
  'المنتزه':     [31.2701, 30.0040],
  'سيدي جابر':  [31.2162, 29.9432],
  'سموحة':      [31.1963, 29.9310],
  'العجمي':     [31.0849, 29.7403],
  'المنشية':    [31.1946, 29.8992],
  'كليوباترا':  [31.2261, 29.9543],
  'ميامي':      [31.2631, 30.0193],
  'الإبراهيمية':[31.2170, 29.9306],
  'سيدي بشر':  [31.2426, 29.9847],
  'الشاطبي':    [31.2122, 29.9176],
  'بحري':       [31.2056, 29.8965],
  'لوران':      [31.2285, 29.9500],
  'جليم':       [31.2340, 29.9620],
  'الميناء':    [31.2001, 29.9187],
};

/* Custom gold marker icon */
function createGoldIcon(rating: number | null) {
  const html = `
    <div style="
      width:36px; height:36px; border-radius:50% 50% 50% 0;
      background:linear-gradient(135deg,#C8974A,#DEB06C);
      border:2.5px solid #0D1220; transform:rotate(-45deg);
      box-shadow:0 4px 16px rgba(200,151,74,0.5);
      display:flex; align-items:center; justify-content:center;
    ">
      <span style="transform:rotate(45deg); font-size:11px; font-weight:900; color:#0D1220; font-family:Almarai,sans-serif;">${rating?.toFixed(1) ?? '★'}</span>
    </div>
  `;
  return L.divIcon({ html, className: '', iconAnchor: [18, 36], popupAnchor: [0, -36] });
}

/* ── Alexandria areas ── */
const AREAS = [
  'الكل', 'المنتزه', 'سيدي جابر', 'سموحة', 'العجمي',
  'المنشية', 'كليوباترا', 'ميامي', 'الإبراهيمية', 'سيدي بشر', 'الشاطبي',
];

const SPECS = ['كهرباء', 'ميكانيكا', 'تكييف', 'رفع ودهان', 'فرامل', 'إطارات'];

function Stars({ rating }: { rating: number | null }) {
  const r = rating ?? 0;
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={11} fill={s <= Math.round(r) ? G : 'transparent'} color={s <= Math.round(r) ? G : '#3A4860'} />
      ))}
    </div>
  );
}

function WorkshopCard({ w, idx, onSelect, selected }: {
  w: { id: number; name: string; area: string; address: string; phone: string; rating: number | null };
  idx: number;
  onSelect: () => void;
  selected: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const specTags = SPECS.filter((_, i) => (w.id + i) % 3 === 0).slice(0, 2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: idx * 0.03 }}
      onClick={onSelect}
      style={{ background: selected ? 'rgba(200,151,74,0.08)' : CARD, border: `1.5px solid ${selected ? 'rgba(200,151,74,0.4)' : 'rgba(200,151,74,0.1)'}`, borderRadius: 20, overflow: 'hidden', fontFamily: "'Almarai',sans-serif", direction: 'rtl', transition: 'all .2s', cursor: 'pointer', boxShadow: selected ? '0 8px 32px rgba(200,151,74,0.15)' : 'none' }}
    >
      <div style={{ height: 3, background: selected ? `linear-gradient(90deg,${G},#DEB06C)` : `linear-gradient(90deg,${G},#DEB06C,rgba(200,151,74,0))` }} />
      <div style={{ padding: '14px 16px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(61,168,130,0.1)', border: '1px solid rgba(61,168,130,0.2)', borderRadius: 999, padding: '2px 7px', marginBottom: 5 }}>
              <CheckCircle2 size={9} color="#3DA882" />
              <span style={{ fontSize: 9, fontWeight: 800, color: '#3DA882' }}>معتمدة</span>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 900, color: '#E8F0F8', lineHeight: 1.2, marginBottom: 3 }}>{w.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#7A95AA', fontSize: 11, fontWeight: 600 }}>
              <MapPin size={10} color={G} />{w.area}
            </div>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'center', background: CARD2, borderRadius: 10, padding: '6px 10px', border: '1px solid rgba(200,151,74,0.1)' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: G }}>{w.rating?.toFixed(1) ?? '—'}</div>
            <Stars rating={w.rating} />
          </div>
        </div>

        {specTags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            {specTags.map(s => (
              <span key={s} style={{ background: 'rgba(123,114,184,0.1)', border: '1px solid rgba(123,114,184,0.2)', borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: '#7B72B8' }}>{s}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
          <Clock size={10} color="#4AABCA" />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4AABCA' }}>السبت – الخميس: ٩ص – ٩م</span>
          <span style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3DA882', boxShadow: '0 0 5px #3DA882' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#3DA882' }}>مفتوح</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 7 }}>
          {w.phone && (
            <a href={`tel:${w.phone}`} onClick={e => e.stopPropagation()}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'linear-gradient(135deg,#C8974A,#DEB06C)', color: '#0D1220', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 12, borderRadius: 10, padding: '8px 0', textDecoration: 'none', boxShadow: '0 3px 10px rgba(200,151,74,0.3)' }}
            >
              <Phone size={11} /> اتصل
            </a>
          )}
          <button onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
            style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 12px', color: '#A0B4C8', fontFamily: "'Almarai',sans-serif", fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
          >
            تفاصيل <ChevronDown size={10} style={{ transform: expanded ? 'rotate(180deg)' : '', transition: 'transform .2s' }} />
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ marginTop: 10, padding: '10px 12px', background: CARD2, borderRadius: 10, border: '1px solid rgba(200,151,74,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { icon: <Shield size={10} />, label: 'ضمان', val: '30 يوم' },
                  { icon: <Wrench size={10} />, label: 'قطع أصلية', val: '✓' },
                  { icon: <Clock size={10} />, label: 'وقت التركيب', val: '2-4 ساعات' },
                  { icon: <Star size={10} />, label: 'تقييمات', val: `${20 + (w.id % 60)} تقييم` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: G }}>{item.icon}</span>
                    <span style={{ fontSize: 10, color: '#7A95AA', fontWeight: 600 }}>{item.label}:</span>
                    <span style={{ fontSize: 10, color: '#D4E0EC', fontWeight: 700 }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Leaflet map component ── */
function AlexMap({ workshops, selectedId, onSelect }: {
  workshops: Array<{ id: number; name: string; area: string; address: string; phone: string; rating: number | null; lat: number | null; lng: number | null }>;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div style={{ height: '100%', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
      <MapContainer
        center={[31.2001, 29.9187]}
        zoom={12}
        style={{ height: '100%', width: '100%', background: '#0D1220' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {workshops.map(w => {
          const coords: [number, number] =
            w.lat && w.lng ? [w.lat, w.lng] : AREA_COORDS[w.area] ?? [31.2001, 29.9187];
          return (
            <Marker
              key={w.id}
              position={coords}
              icon={createGoldIcon(w.rating)}
              eventHandlers={{ click: () => onSelect(w.id) }}
            >
              <Popup>
                <div style={{ fontFamily: 'Almarai,sans-serif', direction: 'rtl', minWidth: 150, background: '#161E30', color: '#E8F0F8', padding: '8px', borderRadius: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4, color: '#E8F0F8' }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: '#C8974A', fontWeight: 700 }}>{w.area}</div>
                  {w.rating && <div style={{ fontSize: 11, color: '#C8974A', fontWeight: 900, marginTop: 2 }}>⭐ {w.rating.toFixed(1)}</div>}
                  {w.phone && (
                    <a href={`tel:${w.phone}`} style={{ display: 'block', marginTop: 6, fontSize: 11, color: '#4AABCA', fontWeight: 700, textDecoration: 'none' }}>📞 {w.phone}</a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {/* Brand overlay */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, background: 'rgba(13,18,32,0.92)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 10, padding: '6px 12px', fontFamily: "'Almarai',sans-serif", fontSize: 11, fontWeight: 700, color: '#C8974A' }}>
        🗺️ ورش رينو باك — الإسكندرية
      </div>
    </div>
  );
}

export default function Workshops() {
  const { data: workshops, isLoading } = useListWorkshops();
  const [area, setArea] = useState('الكل');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = workshops?.filter(w => {
    if (area !== 'الكل' && w.area !== area) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase()) && !w.area.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: BG, direction: 'rtl' }}>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '48px 24px 60px', background: `linear-gradient(160deg,#070C18 0%,#111826 60%,${BG} 100%)` }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(200,151,74,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,151,74,0.03) 1px,transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse,rgba(61,168,130,0.06),transparent 65%)', pointerEvents: 'none' }} />
        <img src={bakoNew} alt="باكو" style={{ position: 'absolute', left: 40, bottom: 0, height: 180, opacity: 0.14, mixBlendMode: 'screen', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><RenoPackLogo size="md" /></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(61,168,130,0.08)', border: '1px solid rgba(61,168,130,0.2)', borderRadius: 999, padding: '5px 14px', marginBottom: 12 }}>
            <CheckCircle2 size={11} color="#3DA882" />
            <span style={{ fontFamily: "'Almarai',sans-serif", fontSize: 11, fontWeight: 700, color: '#3DA882' }}>شبكة ورش معتمدة في الإسكندرية</span>
          </div>
          <h1 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 32, fontWeight: 900, color: '#E8F0F8', marginBottom: 8, lineHeight: 1.2 }}>
            ورش <span style={{ color: G }}>رينو</span> في كل الإسكندرية
          </h1>
          <p style={{ fontFamily: "'Almarai',sans-serif", fontSize: 14, color: '#7A95AA', fontWeight: 500, maxWidth: 460, margin: '0 auto 20px' }}>
            شبكة من أفضل ورش الصيانة المعتمدة، متخصصة في رينو، بأسعار شفافة وضمان على الشغل.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[{ n: '+30', l: 'ورشة معتمدة' }, { n: '11', l: 'منطقة' }, { n: '4.8★', l: 'متوسط التقييم' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Almarai',sans-serif", fontSize: 22, fontWeight: 900, color: G }}>{s.n}</div>
                <div style={{ fontFamily: "'Almarai',sans-serif", fontSize: 11, color: '#7A95AA', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ position: 'sticky', top: 68, zIndex: 20, background: 'rgba(13,18,32,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(200,151,74,0.08)', padding: '10px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <Search size={13} color="#7A95AA" style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم الورشة أو المنطقة..."
              style={{ width: '100%', background: '#111826', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 999, padding: '8px 36px 8px 14px', color: '#D4E0EC', fontSize: 13, fontFamily: "'Almarai',sans-serif", fontWeight: 600, outline: 'none', direction: 'rtl' }}
            />
          </div>
          {!isLoading && <span style={{ fontFamily: "'Almarai',sans-serif", fontSize: 12, color: '#7A95AA', fontWeight: 600, flexShrink: 0 }}>{filtered?.length ?? 0} ورشة</span>}
        </div>
        <div style={{ maxWidth: 1280, margin: '8px auto 0', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {AREAS.map(a => {
            const active = area === a;
            return (
              <button key={a} onClick={() => setArea(a)}
                style={{ fontFamily: "'Almarai',sans-serif", fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '4px 12px', border: active ? 'none' : '1.5px solid rgba(61,168,130,0.2)', background: active ? 'rgba(61,168,130,0.15)' : 'transparent', color: active ? '#3DA882' : '#A0B4C8', cursor: 'pointer', transition: 'all .2s' }}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT: Map + Cards ── */}
      <div style={{ maxWidth: 1280, margin: '24px auto', padding: '0 24px 60px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24, alignItems: 'start' }}>

        {/* Map */}
        <div style={{ position: 'sticky', top: 140, height: 580, background: CARD, border: '1.5px solid rgba(200,151,74,0.1)', borderRadius: 22, overflow: 'hidden' }}>
          {!isLoading && workshops && workshops.length > 0 && (
            <AlexMap
              workshops={workshops.map(w => ({ ...w, rating: w.rating ?? null, lat: w.lat ?? null, lng: w.lng ?? null }))}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
          {isLoading && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
              <MapPin size={32} color="rgba(200,151,74,0.25)" />
              <p style={{ fontFamily: "'Almarai',sans-serif", fontSize: 13, color: '#7A95AA', fontWeight: 700 }}>جاري تحميل الخريطة...</p>
            </div>
          )}
          {/* How it works */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(13,18,32,0.92)', borderTop: '1px solid rgba(200,151,74,0.1)', padding: '10px 16px', display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { n: '01', t: 'اختار الباكدج' },
              { n: '02', t: 'اختار الورشة' },
              { n: '03', t: 'احجز أونلاين' },
              { n: '04', t: 'العربية جاهزة!' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(200,151,74,0.15)', border: '1px solid rgba(200,151,74,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: G, flexShrink: 0 }}>{step.n}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#A0B4C8', fontFamily: "'Almarai',sans-serif" }}>{step.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workshops grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Guarantee card */}
          <div style={{ background: 'linear-gradient(135deg,rgba(200,151,74,0.08),rgba(200,151,74,0.03))', border: '1.5px solid rgba(200,151,74,0.15)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Almarai',sans-serif" }}>
            <Shield size={22} color={G} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#E8F0F8', marginBottom: 2 }}>ضمان الجودة على كل الشغل</div>
              <div style={{ fontSize: 11, color: '#7A95AA', fontWeight: 500 }}>كل الورش المعتمدة تقدم ضمان 30 يوم على اليد العاملة</div>
            </div>
          </div>

          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 160, background: CARD, borderRadius: 20, opacity: 0.6, animation: 'pulse 1.5s infinite' }} />
            ))
          ) : filtered?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', background: CARD, borderRadius: 20, border: '1.5px dashed rgba(200,151,74,0.15)' }}>
              <Wrench size={36} color="rgba(200,151,74,0.15)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 18, fontWeight: 800, color: '#D4E0EC', marginBottom: 6 }}>لا توجد ورش هنا</h3>
              <p style={{ fontFamily: "'Almarai',sans-serif", color: '#7A95AA', fontSize: 13 }}>جرب منطقة أخرى.</p>
            </div>
          ) : (
            <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AnimatePresence>
                {filtered?.map((w, i) => (
                  <WorkshopCard
                    key={w.id} w={{ ...w, rating: w.rating ?? null }} idx={i}
                    selected={selectedId === w.id}
                    onSelect={() => setSelectedId(selectedId === w.id ? null : w.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Footer strip ── */}
      <div style={{ background: '#111826', borderTop: '1px solid rgba(200,151,74,0.08)', padding: '24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {[
            { icon: <CheckCircle2 size={16} color="#3DA882" />, text: 'ورش معتمدة ومراجعة' },
            { icon: <Shield size={16} color={G} />, text: 'ضمان على الشغل' },
            { icon: <Clock size={16} color="#4AABCA" />, text: 'خدمة 6 أيام في الأسبوع' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Almarai',sans-serif", fontSize: 13, fontWeight: 700, color: '#A0B4C8' }}>
              {item.icon}{item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
