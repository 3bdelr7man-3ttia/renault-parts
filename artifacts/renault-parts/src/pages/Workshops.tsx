import React, { useState, useEffect, useRef } from 'react';
import { useListWorkshops } from '@workspace/api-client-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Shield, Clock, Wrench, Search, ChevronDown, CheckCircle2, Navigation, Zap, Settings } from 'lucide-react';
import { RenoPackLogo } from '@/components/layout/AppLayout';
import bakoNew from '@/assets/bako-new.png';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { publicStyles, publicTheme } from '@/components/public/public-ui';

/* ── Brand tokens ── */
const G  = '#C8974A';
const GL = '#DEB06C';
const BG = publicTheme.page;
const CARD  = publicTheme.surface;
const CARD2 = publicTheme.surfaceAlt;
const TD = publicTheme.muted;
const F  = "'Almarai',sans-serif";

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

/* ── Workshop card color palettes (deterministic) ── */
const WORKSHOP_PALETTES = [
  { from: '#edf5fb', to: '#dfeef9', accent: '#3f83b9' },
  { from: '#fff6e7', to: '#f7ead4', accent: '#c8974a' },
  { from: '#edf8f1', to: '#deefe5', accent: '#2f9162' },
  { from: '#f5effb', to: '#e8def7', accent: '#7c63d6' },
  { from: '#fff1ef', to: '#f8dfdb', accent: '#d46464' },
  { from: '#eef4ff', to: '#dce7fb', accent: '#4e7fe5' },
];

/* ── Area filter list ── */
const AREAS = [
  'الكل', 'المنتزه', 'سيدي جابر', 'سموحة', 'العجمي',
  'المنشية', 'كليوباترا', 'ميامي', 'الإبراهيمية', 'سيدي بشر', 'الشاطبي',
];

const SPECS = ['كهرباء', 'ميكانيكا', 'تكييف', 'رفع ودهان', 'فرامل', 'إطارات'];

/* ── MapFlyTo helper ── */
function MapFlyTo({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], zoom, { duration: 1.0 }); }, [lat, lng, zoom]);
  return null;
}

/* ── Custom map marker ── */
function createWorkshopIcon(selected: boolean, accent: string) {
  const size = selected ? 44 : 36;
  const html = `
    <div style="
      width:${size}px; height:${size}px; border-radius:50% 50% 50% 0;
      background:${selected ? G : accent};
      border:2.5px solid #fff;
      transform:rotate(-45deg);
      box-shadow:0 4px 18px ${selected ? 'rgba(200,151,74,0.7)' : 'rgba(0,0,0,0.35)'};
      display:flex; align-items:center; justify-content:center;
      transition:all .2s;
    ">
      <span style="transform:rotate(45deg); font-size:${selected ? 14 : 11}px; font-weight:900; color:#fff; font-family:Almarai,sans-serif;">🔧</span>
    </div>`;
  return L.divIcon({ html, className: '', iconAnchor: [size / 2, size], popupAnchor: [0, -size] });
}

/* ── Stars ── */
function Stars({ rating }: { rating: number | null }) {
  const r = rating ?? 0;
  return (
    <div style={{ display: 'flex', gap: 1.5 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={11} fill={s <= Math.round(r) ? G : 'transparent'} color={s <= Math.round(r) ? G : publicTheme.borderStrong} />
      ))}
    </div>
  );
}

/* ── Workshop cover banner (placeholder image) ── */
function WorkshopCover({ w, selected }: { w: { id: number; name: string; area: string }; selected: boolean }) {
  const palette = WORKSHOP_PALETTES[w.id % WORKSHOP_PALETTES.length];
  const initials = w.name.slice(0, 2);
  return (
    <div style={{
      height: 90, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(135deg,${palette.from},${palette.to})`,
      borderBottom: `1px solid ${publicTheme.border}`,
    }}>
      {/* Subtle grid texture */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(23,32,51,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(23,32,51,0.035) 1px,transparent 1px)`, backgroundSize: '20px 20px', pointerEvents: 'none' }} />
      {/* Glow blob */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle,${palette.accent}28,transparent 70%)`, pointerEvents: 'none' }} />
      {/* Workshop icon circle */}
      <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 56, height: 56, borderRadius: 16, background: `${palette.accent}18`, border: `1.5px solid ${palette.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <Wrench size={18} color={palette.accent} />
        <span style={{ fontSize: 9, fontWeight: 800, color: palette.accent, fontFamily: F }}>{initials}</span>
      </div>
      {/* Area badge */}
      <div style={{ position: 'absolute', left: 12, bottom: 10, background: 'rgba(255,253,248,0.78)', backdropFilter: 'blur(10px)', border: `1px solid ${palette.accent}25`, borderRadius: 999, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <MapPin size={9} color={palette.accent} />
        <span style={{ fontSize: 10, fontWeight: 700, color: publicTheme.textSoft, fontFamily: F }}>{w.area}</span>
      </div>
      {/* Selected shimmer */}
      {selected && (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg,${G}18,transparent)`, pointerEvents: 'none' }} />
      )}
    </div>
  );
}

/* ── Workshop card ── */
function WorkshopCard({ w, idx, onSelect, selected }: {
  w: { id: number; name: string; area: string; address: string; phone: string; rating: number | null };
  idx: number;
  onSelect: () => void;
  selected: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const specTags = SPECS.filter((_, i) => (w.id + i) % 3 === 0).slice(0, 3);
  const palette = WORKSHOP_PALETTES[w.id % WORKSHOP_PALETTES.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: idx * 0.04 }}
      onClick={onSelect}
      style={{
        background: selected ? `${palette.accent}0f` : CARD,
        border: `1.5px solid ${selected ? palette.accent + '40' : publicTheme.border}`,
        borderRadius: 24, overflow: 'hidden', fontFamily: F, direction: 'rtl',
        transition: 'all .22s', cursor: 'pointer',
        boxShadow: selected ? `0 12px 28px ${palette.accent}18` : publicTheme.shadowSoft,
      }}
    >
      {/* Cover image / banner */}
      <WorkshopCover w={w} selected={selected} />

      <div style={{ padding: '12px 14px 14px' }}>
        {/* Name + rating row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: publicTheme.successSoft, border: '1px solid rgba(24,121,78,0.18)', borderRadius: 999, padding: '2px 7px', marginBottom: 5 }}>
              <CheckCircle2 size={9} color={publicTheme.success} />
              <span style={{ fontSize: 9, fontWeight: 800, color: publicTheme.success }}>ورشة معتمدة</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: publicTheme.text, lineHeight: 1.2, margin: 0 }}>{w.name}</h3>
            <p style={{ fontSize: 11, color: TD, margin: '3px 0 0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.address}</p>
          </div>
          {/* Rating badge */}
          <div style={{ flexShrink: 0, textAlign: 'center', background: CARD2, borderRadius: 14, padding: '6px 10px', border: `1px solid ${selected ? palette.accent + '30' : publicTheme.border}`, marginRight: 10 }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: palette.accent, lineHeight: 1 }}>{w.rating?.toFixed(1) ?? '—'}</div>
            <Stars rating={w.rating} />
          </div>
        </div>

        {/* Hours + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, background: publicTheme.surfaceAlt, borderRadius: 10, padding: '6px 10px', border: `1px solid ${publicTheme.border}` }}>
          <Clock size={10} color={palette.accent} />
          <span style={{ fontSize: 10, fontWeight: 700, color: palette.accent, flex: 1 }}>السبت – الخميس: ٩ص – ٩م</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: publicTheme.success, boxShadow: `0 0 6px ${publicTheme.success}` }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: publicTheme.success }}>مفتوح</span>
          </div>
        </div>

        {/* Spec tags */}
        {specTags.length > 0 && (
          <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
            {specTags.map(s => (
              <span key={s} style={{ background: `${palette.accent}12`, border: `1px solid ${palette.accent}25`, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: palette.accent }}>{s}</span>
            ))}
          </div>
        )}

        {/* Details toggle */}
        <button onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: `${palette.accent}0D`, border: `1px solid ${palette.accent}25`, borderRadius: 12, padding: '9px', color: palette.accent, fontFamily: F, fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all .15s' }}
        >
          <Settings size={11} />
          تفاصيل الورشة
          <ChevronDown size={11} style={{ transform: expanded ? 'rotate(180deg)' : '', transition: 'transform .2s' }} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
              <div style={{ marginTop: 10, padding: '12px', background: CARD2, borderRadius: 14, border: `1px solid ${palette.accent}12`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { icon: <Shield size={12} />, label: 'ضمان', val: '30 يوم' },
                  { icon: <Zap size={12} />,    label: 'وقت التركيب', val: '2-4 ساعات' },
                  { icon: <Wrench size={12} />, label: 'قطع أصلية', val: '✓ مضمونة' },
                  { icon: <Star size={12} />,   label: 'تقييمات', val: `${20 + (w.id % 60)} تقييم` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: publicTheme.surface, borderRadius: 10, padding: '6px 8px', border: `1px solid ${publicTheme.border}` }}>
                    <span style={{ color: palette.accent }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 9, color: TD, fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: publicTheme.text, fontWeight: 800 }}>{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
      <div style={{ marginTop: 8, padding: '8px 12px', background: publicTheme.successSoft, borderRadius: 10, border: '1px solid rgba(24,121,78,0.12)', fontSize: 11, color: publicTheme.success, fontWeight: 700 }}>
                🏆 هذه الورشة جزء من شبكة رينو باك المعتمدة — كل الحجوزات تتم عبر الباكدج
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Map fly target tracker ── */
function MapController({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  const prev = useRef({ lat, lng, zoom });
  useEffect(() => {
    if (prev.current.lat !== lat || prev.current.lng !== lng) {
      map.flyTo([lat, lng], zoom, { duration: 0.9 });
      prev.current = { lat, lng, zoom };
    }
  }, [lat, lng, zoom]);
  return null;
}

/* ── Leaflet map ── */
function AlexMap({ workshops, selectedId, onSelect, focusCoords }: {
  workshops: Array<{ id: number; name: string; area: string; address: string; rating: number | null; lat: number | null; lng: number | null }>;
  selectedId: number | null;
  onSelect: (id: number) => void;
  focusCoords: { lat: number; lng: number; zoom: number };
}) {
  return (
    <div style={{ height: '100%', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
      <MapContainer
        center={[focusCoords.lat, focusCoords.lng]}
        zoom={focusCoords.zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Standard Carto Voyager — Google Maps-like look */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        <MapController lat={focusCoords.lat} lng={focusCoords.lng} zoom={focusCoords.zoom} />

        {workshops.map(w => {
          const coords: [number, number] =
            w.lat && w.lng ? [w.lat, w.lng] : AREA_COORDS[w.area] ?? [31.2001, 29.9187];
          const palette = WORKSHOP_PALETTES[w.id % WORKSHOP_PALETTES.length];
          const isSelected = selectedId === w.id;
          return (
            <Marker
              key={w.id}
              position={coords}
              icon={createWorkshopIcon(isSelected, palette.accent)}
              eventHandlers={{ click: () => onSelect(w.id) }}
            >
              <Popup>
                <div style={{ fontFamily: F, direction: 'rtl', minWidth: 160, padding: 4 }}>
                  <div style={{ fontWeight: 900, fontSize: 14, color: palette.accent, marginBottom: 3 }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{w.address}</div>
                  <div style={{ display: 'flex', gap: 6, fontSize: 11, alignItems: 'center' }}>
                    {w.rating && <span style={{ fontWeight: 800, color: '#f59e0b' }}>★ {w.rating.toFixed(1)}</span>}
                    <span style={{ background: 'rgba(61,168,130,0.1)', color: '#3DA882', borderRadius: 999, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>معتمدة</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map label */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: '1px solid rgba(200,151,74,0.25)', borderRadius: 10, padding: '5px 12px', fontFamily: F, fontSize: 11, fontWeight: 800, color: '#1A2356', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        🗺️ ورش رينو باك — الإسكندرية
      </div>

      {/* Leaflet popup styles */}
      <style>{`
        .leaflet-popup-content-wrapper { background: #fff !important; border-radius: 12px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important; border: none !important; }
        .leaflet-popup-tip { background: #fff !important; }
        .leaflet-popup-content { margin: 12px !important; }
        .leaflet-control-zoom a { background: rgba(255,255,255,0.95) !important; color: #1A2356 !important; border-color: rgba(0,0,0,0.1) !important; font-weight: 900; }
        .leaflet-control-zoom a:hover { background: #fff !important; }
      `}</style>
    </div>
  );
}

export default function Workshops() {
  const { data: workshops, isLoading } = useListWorkshops();
  const { isMobile, isTablet, isMobileOrTablet } = useBreakpoint();
  const [area, setArea]         = useState('الكل');
  const [search, setSearch]     = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Focus coordinates for the map
  const [focusCoords, setFocusCoords] = useState({ lat: 31.2001, lng: 29.9187, zoom: 12 });

  const filtered = workshops?.filter(w => {
    if (area !== 'الكل' && w.area !== area) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase()) && !w.area.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // When area filter changes → pan map to that area
  const handleAreaChange = (a: string) => {
    setArea(a);
    setSelectedId(null);
    if (a === 'الكل') {
      setFocusCoords({ lat: 31.2001, lng: 29.9187, zoom: 12 });
    } else if (AREA_COORDS[a]) {
      setFocusCoords({ lat: AREA_COORDS[a][0], lng: AREA_COORDS[a][1], zoom: 14 });
    }
  };

  // When workshop selected → pan map to workshop
  const handleWorkshopSelect = (id: number) => {
    const wid = selectedId === id ? null : id;
    setSelectedId(wid);
    if (wid && workshops) {
      const w = workshops.find(x => x.id === wid);
      if (w) {
        const coords = (w.lat && w.lng) ? [w.lat, w.lng] : AREA_COORDS[w.area];
        if (coords) setFocusCoords({ lat: coords[0], lng: coords[1], zoom: 15 });
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, direction: 'rtl' }}>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '44px 24px 52px', ...publicStyles.hero }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(200,151,74,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,151,74,0.03) 1px,transparent 1px)`, backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '40%', transform: 'translate(-50%,-50%)', width: 600, height: 300, ...publicStyles.heroGlow, pointerEvents: 'none' }} />
        <img src={bakoNew} alt="باكو" style={{ position: 'absolute', left: 32, bottom: 0, height: 170, opacity: 0.1, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><RenoPackLogo size="md" /></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(61,168,130,0.08)', border: '1px solid rgba(61,168,130,0.2)', borderRadius: 999, padding: '4px 14px', marginBottom: 14 }}>
            <CheckCircle2 size={11} color="#3DA882" />
            <span style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: '#3DA882' }}>شبكة ورش معتمدة في الإسكندرية</span>
          </div>
          <h1 style={{ fontFamily: F, fontSize: 30, fontWeight: 900, color: publicTheme.text, marginBottom: 8, lineHeight: 1.2 }}>
            ورش <span style={{ color: G }}>رينو باك</span> في كل الإسكندرية
          </h1>
          <p style={{ fontFamily: F, fontSize: 14, color: TD, fontWeight: 500, maxWidth: 460, margin: '0 auto 20px' }}>
            أقرب ورشة متخصصة في رينو — بأسعار شفافة وضمان على الشغل وتركيب ضمن الباكدج.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 36, flexWrap: 'wrap' }}>
            {[{ n: '+30', l: 'ورشة معتمدة' }, { n: '11', l: 'منطقة' }, { n: '4.8★', l: 'متوسط التقييم' }, { n: '30', l: 'يوم ضمان' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: F, fontSize: 22, fontWeight: 900, color: G }}>{s.n}</div>
                <div style={{ fontFamily: F, fontSize: 11, color: TD, fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ position: 'sticky', top: 68, zIndex: 20, background: 'rgba(246,247,251,0.92)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${publicTheme.border}`, padding: '10px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <Search size={13} color={TD} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم الورشة أو المنطقة..."
              style={{ width: '100%', ...publicStyles.input, borderRadius: 999, padding: '8px 36px 8px 14px', fontSize: 13, fontFamily: F, fontWeight: 600, outline: 'none', direction: 'rtl' }}
            />
          </div>
          {!isLoading && (
            <span style={{ fontFamily: F, fontSize: 12, color: publicTheme.textSoft, fontWeight: 600, flexShrink: 0, background: publicTheme.brandSoft, borderRadius: 999, padding: '4px 12px' }}>
              {filtered?.length ?? 0} ورشة
            </span>
          )}
        </div>
        {/* Area filter pills */}
        <div style={{ maxWidth: 1280, margin: '8px auto 0', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {AREAS.map(a => {
            const active = area === a;
            return (
              <button key={a} onClick={() => handleAreaChange(a)}
                style={{ fontFamily: F, fontSize: 11, fontWeight: 800, borderRadius: 999, padding: '5px 13px', border: active ? 'none' : `1.5px solid ${publicTheme.borderStrong}`, background: active ? G : publicTheme.surface, color: active ? '#0D1220' : publicTheme.textSoft, cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {a !== 'الكل' && active && <Navigation size={9} />}
                {a}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT: cards + map ── */}
      <div style={{ maxWidth: 1280, margin: '20px auto', padding: isMobile ? '0 14px 80px' : '0 20px 60px', display: 'grid', gridTemplateColumns: isMobileOrTablet ? '1fr' : '380px 1fr', gap: isMobile ? 14 : 20, alignItems: 'start' }}>

        {/* Workshop cards (right in RTL) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Info banner */}
          <div style={{ background: publicTheme.surface, border: `1px solid ${publicTheme.border}`, borderRadius: 18, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: F, boxShadow: publicTheme.shadowSoft }}>
            <Shield size={20} color={G} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: publicTheme.text, marginBottom: 1 }}>ضمان الجودة على كل الشغل</div>
              <div style={{ fontSize: 11, color: TD, fontWeight: 500 }}>ضمان 30 يوم على اليد العاملة في كل الورش المعتمدة</div>
            </div>
          </div>

          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 190, background: CARD, borderRadius: 24, opacity: 0.5 + i * 0.1, animation: 'shimmer 1.5s infinite', border: `1px solid ${publicTheme.border}` }} />
            ))
          ) : filtered?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', background: CARD, borderRadius: 24, border: '1.5px dashed rgba(200,151,74,0.15)', boxShadow: publicTheme.shadowSoft }}>
              <Wrench size={36} color="rgba(200,151,74,0.15)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontFamily: F, fontSize: 18, fontWeight: 800, color: publicTheme.text, marginBottom: 6 }}>لا توجد ورش هنا</h3>
              <p style={{ fontFamily: F, color: TD, fontSize: 13 }}>جرب منطقة أخرى.</p>
            </div>
          ) : (
            <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AnimatePresence>
                {filtered?.map((w, i) => (
                  <WorkshopCard
                    key={w.id}
                    w={{ ...w, rating: w.rating ?? null }}
                    idx={i}
                    selected={selectedId === w.id}
                    onSelect={() => handleWorkshopSelect(w.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Map (left in RTL) */}
        <div style={{ position: isMobileOrTablet ? 'relative' : 'sticky', top: isMobileOrTablet ? 'auto' : 138, height: isMobile ? 260 : isTablet ? 360 : 620, background: CARD, border: `1px solid ${publicTheme.border}`, borderRadius: isMobile ? 16 : 22, overflow: 'hidden', boxShadow: publicTheme.shadow }}>
          {!isLoading && workshops && workshops.length > 0 ? (
            <AlexMap
              workshops={workshops.map(w => ({ ...w, rating: w.rating ?? null, lat: w.lat ?? null, lng: w.lng ?? null }))}
              selectedId={selectedId}
              onSelect={handleWorkshopSelect}
              focusCoords={focusCoords}
            />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
              <MapPin size={32} color="rgba(200,151,74,0.25)" />
              <p style={{ fontFamily: F, fontSize: 13, color: TD, fontWeight: 700 }}>جاري تحميل الخريطة...</p>
            </div>
          )}

          {/* Steps strip at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(0,0,0,0.08)', padding: '10px 16px', display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { n: '01', t: 'اختار الباكدج', c: G },
              { n: '02', t: 'اختار الورشة', c: '#4AABCA' },
              { n: '03', t: 'احجز أونلاين', c: '#3DA882' },
              { n: '04', t: 'العربية جاهزة!', c: '#7B72B8' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: `${step.c}18`, border: `1.5px solid ${step.c}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: step.c, flexShrink: 0 }}>{step.n}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1A2356', fontFamily: F }}>{step.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer strip ── */}
      <div style={{ background: publicTheme.surface, borderTop: `1px solid ${publicTheme.border}`, padding: '20px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {[
            { icon: <CheckCircle2 size={15} color="#3DA882" />, text: 'ورش معتمدة ومراجعة' },
            { icon: <Shield size={15} color={G} />, text: 'ضمان 30 يوم على الشغل' },
            { icon: <Clock size={15} color="#4AABCA" />, text: 'خدمة 6 أيام في الأسبوع' },
            { icon: <Zap size={15} color="#7B72B8" />, text: 'تركيب سريع خلال 24 ساعة' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: F, fontSize: 12, fontWeight: 700, color: publicTheme.textSoft }}>
              {item.icon}{item.text}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
