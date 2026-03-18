import React, { useState, useEffect } from 'react';
import { useListPackages } from '@workspace/api-client-react';
import { PackageCard } from '@/components/PackageCard';
import { Filter, Search, Car, X, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarSelectorModal } from '@/components/CarSelectorModal';
import { useCar, getRecommendedKm } from '@/lib/car-context';
import { RenoPackLogo } from '@/components/layout/AppLayout';

const KILOMETER_FILTERS = [
  { label: 'الكل',      value: null  },
  { label: '20,000 كم', value: 20000 },
  { label: '40,000 كم', value: 40000 },
  { label: '60,000 كم', value: 60000 },
  { label: '100,000 كم',value: 100000},
  { label: 'طوارئ',     value: 0     },
];

/* ── Reusable page header ── */
function PageHero({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', padding: '64px 24px 80px', background: 'linear-gradient(160deg,#0B1220 0%,#131B2E 60%,#0D1A28 100%)' }}>
      {/* grid lines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(200,151,74,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(200,151,74,0.035) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
      {/* glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse,rgba(200,151,74,0.08),transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <RenoPackLogo size="md" />
        </div>
        <h1 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 36, fontWeight: 900, color: '#E8F0F8', marginBottom: 10, lineHeight: 1.2 }}>{title}</h1>
        <p style={{ fontFamily: "'Almarai',sans-serif", fontSize: 16, color: '#7A95AA', fontWeight: 500, maxWidth: 520, margin: '0 auto 20px' }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export default function Packages() {
  const { data: packages, isLoading } = useListPackages();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [showCarModal, setShowCarModal] = useState(false);
  const { car, clearCar } = useCar();
  const recommendedKm = car ? getRecommendedKm(car.year) : null;

  useEffect(() => { if (!car) setShowCarModal(true); }, []);

  const filteredPackages = packages?.filter(pkg => {
    const kmMatch = activeFilter !== null ? pkg.kmService === activeFilter : true;
    if (!kmMatch) return false;
    if (car && pkg.parts && pkg.parts.length > 0) {
      const hasCompatible = pkg.parts.some(part =>
        !part.compatibleModels ||
        part.compatibleModels.includes(car.model) ||
        part.compatibleModels.includes('جميع موديلات رينو')
      );
      if (!hasCompatible) return false;
    }
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0D1220', paddingBottom: 80 }}>
      <AnimatePresence>
        {showCarModal && (
          <CarSelectorModal onComplete={() => setShowCarModal(false)} onSkip={() => setShowCarModal(false)} />
        )}
      </AnimatePresence>

      <PageHero
        title="كتالوج الباكدجات"
        subtitle="اختر باكدج الصيانة المناسب لسيارتك بناءً على الكيلومترات. أفضل القطع بأنسب الأسعار في الإسكندرية."
      >
        {/* Recommended badge */}
        {car && recommendedKm && (
          <div style={{ display: 'inline-block', background: 'rgba(200,151,74,0.1)', border: '1px solid rgba(200,151,74,0.25)', borderRadius: 999, padding: '6px 16px', color: '#C8974A', fontFamily: "'Almarai',sans-serif", fontSize: 13, fontWeight: 700 }}>
            نرشح لـ {car.model} ({car.year}): باكدج {(recommendedKm / 1000).toLocaleString('ar-EG')},000 كم
          </div>
        )}

        {/* Car chip */}
        {car && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '7px 18px', color: '#D4E0EC', fontFamily: "'Almarai',sans-serif", fontSize: 13, fontWeight: 700 }}>
              <Car size={13} color="#C8974A" />
              <span>{car.model} - {car.year}</span>
              <button onClick={() => setShowCarModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}><Pencil size={12} /></button>
              <button onClick={clearCar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}><X size={12} /></button>
            </div>
          </div>
        )}
        {!car && (
          <button
            onClick={() => setShowCarModal(true)}
            style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#C8974A,#DEB06C)', color: '#0D1220', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 14, borderRadius: 999, padding: '10px 24px', border: 'none', cursor: 'pointer', boxShadow: '0 6px 22px rgba(200,151,74,0.35)' }}
          >
            <Car size={14} /> حدد سيارتك للحصول على توصيات مخصصة
          </button>
        )}
      </PageHero>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Filters card */}
        <div style={{ marginTop: -28, position: 'relative', zIndex: 10, background: '#161E30', border: '1.5px solid rgba(200,151,74,0.14)', borderRadius: 18, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 36, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7A95AA', fontFamily: "'Almarai',sans-serif", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            <Filter size={15} color="#C8974A" />
            تصفية بالمسافة:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {KILOMETER_FILTERS.map(f => {
              const active = activeFilter === f.value;
              return (
                <button
                  key={f.label}
                  onClick={() => setActiveFilter(f.value)}
                  style={{
                    fontFamily: "'Almarai',sans-serif",
                    fontWeight: 700, fontSize: 13,
                    borderRadius: 999, padding: '7px 18px',
                    border: active ? 'none' : '1.5px solid rgba(200,151,74,0.2)',
                    background: active ? 'linear-gradient(135deg,#C8974A,#DEB06C)' : 'transparent',
                    color: active ? '#0D1220' : '#A0B4C8',
                    cursor: 'pointer',
                    transition: 'all .2s',
                    boxShadow: active ? '0 4px 14px rgba(200,151,74,0.35)' : 'none',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 28 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: 420, background: '#161E30', borderRadius: 24, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : filteredPackages?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#111826', borderRadius: 24, border: '1.5px dashed rgba(200,151,74,0.15)' }}>
            <Search size={48} color="rgba(200,151,74,0.2)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 22, fontWeight: 800, color: '#D4E0EC', marginBottom: 8 }}>لا توجد باكدجات مطابقة</h3>
            <p style={{ fontFamily: "'Almarai',sans-serif", color: '#7A95AA', fontSize: 15 }}>جرب تغيير فلتر الكيلومترات.</p>
          </div>
        ) : (
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 28 }}>
            {filteredPackages?.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} recommended={recommendedKm !== null && pkg.kmService === recommendedKm} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
