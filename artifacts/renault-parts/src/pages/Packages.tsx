import React, { useState } from 'react';
import { useListPackages } from '@workspace/api-client-react';
import { PackageCard } from '@/components/PackageCard';
import { Filter, Search, Car, X, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarSelectorModal } from '@/components/CarSelectorModal';
import { useCar, getRecommendedKm } from '@/lib/car-context';
import { RenoPackLogo } from '@/components/layout/AppLayout';
import { publicStyles, publicTheme } from '@/components/public/public-ui';

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
    <div style={{ position: 'relative', overflow: 'hidden', padding: '64px 24px 80px', ...publicStyles.hero }}>
      {/* grid lines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(200,151,74,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,151,74,0.04) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
      {/* glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, ...publicStyles.heroGlow, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <RenoPackLogo size="md" />
        </div>
        <h1 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 36, fontWeight: 900, color: publicTheme.text, marginBottom: 10, lineHeight: 1.2 }}>{title}</h1>
        <p style={{ fontFamily: "'Almarai',sans-serif", fontSize: 16, color: publicTheme.muted, fontWeight: 500, maxWidth: 520, margin: '0 auto 20px' }}>{subtitle}</p>
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

  // Do NOT auto-show modal — user opens it voluntarily via the button in the hero

  const filteredPackages = packages?.filter(pkg => {
    // Hide custom puzzle-builder packages from the main listing
    if (pkg.slug?.startsWith('custom-')) return false;
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
    <div style={{ minHeight: '100vh', ...publicStyles.shell, paddingBottom: 80 }}>
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
          <div style={{ display: 'inline-block', background: publicTheme.brandSoft, border: '1px solid rgba(200,151,74,0.28)', borderRadius: 999, padding: '6px 16px', color: publicTheme.brandStrong, fontFamily: "'Almarai',sans-serif", fontSize: 13, fontWeight: 700 }}>
            نرشح لـ {car.model} ({car.year}): باكدج {(recommendedKm / 1000).toLocaleString('ar-EG')},000 كم
          </div>
        )}

        {/* Car chip */}
        {car && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: publicTheme.surface, border: `1px solid ${publicTheme.border}`, borderRadius: 999, padding: '7px 18px', color: publicTheme.textSoft, boxShadow: publicTheme.shadowSoft, fontFamily: "'Almarai',sans-serif", fontSize: 13, fontWeight: 700 }}>
              <Car size={13} color={publicTheme.brandStrong} />
              <span>{car.model} - {car.year}</span>
              <button onClick={() => setShowCarModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: publicTheme.muted, display: 'flex' }}><Pencil size={12} /></button>
              <button onClick={clearCar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: publicTheme.muted, display: 'flex' }}><X size={12} /></button>
            </div>
          </div>
        )}
        {!car && (
          <button
            onClick={() => setShowCarModal(true)}
            style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, background: publicTheme.brandGradient, color: publicTheme.text, fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 14, borderRadius: 999, padding: '10px 24px', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(200,151,74,0.26)' }}
          >
            <Car size={14} /> حدد سيارتك للحصول على توصيات مخصصة
          </button>
        )}
      </PageHero>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Filters card */}
        <div style={{ marginTop: -28, position: 'relative', zIndex: 10, background: publicTheme.surface, border: `1.5px solid ${publicTheme.border}`, borderRadius: 18, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 36, boxShadow: publicTheme.shadow }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: publicTheme.muted, fontFamily: "'Almarai',sans-serif", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            <Filter size={15} color={publicTheme.brandStrong} />
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
                    border: active ? 'none' : `1.5px solid ${publicTheme.borderStrong}`,
                    background: active ? publicTheme.brandGradient : 'transparent',
                    color: active ? publicTheme.text : publicTheme.textSoft,
                    cursor: 'pointer',
                    transition: 'all .2s',
                    boxShadow: active ? '0 8px 18px rgba(200,151,74,0.24)' : 'none',
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
              <div key={i} style={{ height: 420, background: publicTheme.surface, border: `1px solid ${publicTheme.border}`, borderRadius: 24, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : filteredPackages?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: publicTheme.surface, borderRadius: 24, border: `1.5px dashed ${publicTheme.borderStrong}` }}>
            <Search size={48} color="rgba(200,151,74,0.2)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 22, fontWeight: 800, color: publicTheme.text, marginBottom: 8 }}>لا توجد باكدجات مطابقة</h3>
            <p style={{ fontFamily: "'Almarai',sans-serif", color: publicTheme.muted, fontSize: 15 }}>جرب تغيير فلتر الكيلومترات.</p>
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
