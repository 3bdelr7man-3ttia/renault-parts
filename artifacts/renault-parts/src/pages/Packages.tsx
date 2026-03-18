import React, { useState, useEffect } from 'react';
import { useListPackages } from '@workspace/api-client-react';
import { PackageCard } from '@/components/PackageCard';
import { Button } from '@/components/ui/button';
import { Filter, Search, Car, X, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarSelectorModal } from '@/components/CarSelectorModal';
import { useCar, getRecommendedKm } from '@/lib/car-context';

const KILOMETER_FILTERS = [
  { label: 'الكل', value: null },
  { label: '20,000 كم', value: 20000 },
  { label: '40,000 كم', value: 40000 },
  { label: '60,000 كم', value: 60000 },
  { label: '100,000 كم', value: 100000 },
  { label: 'طوارئ', value: 0 },
];

export default function Packages() {
  const { data: packages, isLoading } = useListPackages();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [showCarModal, setShowCarModal] = useState(false);
  const { car, clearCar } = useCar();
  const recommendedKm = car ? getRecommendedKm(car.year) : null;

  useEffect(() => {
    if (!car) {
      setShowCarModal(true);
    }
  }, []);

  const filteredPackages = packages?.filter(pkg => {
    const kmMatch = activeFilter !== null ? pkg.kmService === activeFilter : true;
    if (!kmMatch) return false;

    if (car && pkg.parts && pkg.parts.length > 0) {
      const hasCompatiblePart = pkg.parts.some(part => {
        if (!part.compatibleModels) return true;
        return (
          part.compatibleModels.includes(car.model) ||
          part.compatibleModels.includes('جميع موديلات رينو')
        );
      });
      if (!hasCompatiblePart) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Car Selector Modal */}
      <AnimatePresence>
        {showCarModal && (
          <CarSelectorModal
            onComplete={() => setShowCarModal(false)}
            onSkip={() => setShowCarModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="bg-primary py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/pattern-bg.png)` }} />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">كتالوج الصيانة المتكامل</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto font-medium">
            اختر باكدج الصيانة المناسب لسيارتك بناءً على الكيلومترات. نوفر لك أفضل القطع بأنسب الأسعار في السوق.
          </p>

          {/* Car Badge */}
          {car && recommendedKm && (
            <div className="mt-4 text-primary-foreground/80 text-sm font-medium">
              بناءً على سنة سيارتك ({car.year}) نرشح لك{' '}
              <span className="text-accent font-bold">
                باكدج {(recommendedKm / 1000).toLocaleString('ar-EG')},000 كم
              </span>
            </div>
          )}

          {car && (
            <div className="mt-3 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold">
              <Car className="w-4 h-4 text-accent" />
              <span>{car.model} - {car.year}</span>
              <button
                onClick={() => setShowCarModal(true)}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="تغيير السيارة"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={clearCar}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="إزالة السيارة"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!car && (
            <button
              onClick={() => setShowCarModal(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-primary font-bold text-sm hover:bg-accent/90 transition-colors"
            >
              <Car className="w-4 h-4" /> حدد سيارتك للحصول على توصيات مخصصة
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-30px] relative z-20">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-4 border border-border/50 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-muted-foreground font-bold">
            <Filter className="w-5 h-5 text-primary" />
            تصفية بالمسافة:
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {KILOMETER_FILTERS.map((filter) => (
              <Button
                key={filter.label}
                variant={activeFilter === filter.value ? 'default' : 'outline'}
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-full px-6 font-bold transition-all ${
                  activeFilter === filter.value
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-transparent text-primary border-primary/20 hover:bg-primary/5'
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Package Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-[450px] bg-card animate-pulse rounded-3xl border border-border/50" />
            ))}
          </div>
        ) : filteredPackages?.length === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
            <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">لا توجد باكدجات مطابقة</h3>
            <p className="text-muted-foreground">جرب تغيير فلتر الكيلومترات لرؤية المزيد من الخيارات.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPackages?.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                recommended={recommendedKm !== null && pkg.kmService === recommendedKm}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
