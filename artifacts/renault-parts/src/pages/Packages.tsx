import React, { useState } from 'react';
import { useListPackages } from '@workspace/api-client-react';
import { PackageCard } from '@/components/PackageCard';
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const KILOMETER_FILTERS = [
  { label: 'الكل', value: null },
  { label: '20,000 كم', value: 20000 },
  { label: '40,000 كم', value: 40000 },
  { label: '60,000 كم', value: 60000 },
  { label: '100,000 كم', value: 100000 },
];

export default function Packages() {
  const { data: packages, isLoading } = useListPackages();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);

  const filteredPackages = packages?.filter(pkg => 
    activeFilter ? pkg.kmService === activeFilter : true
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page Header */}
      <div className="bg-primary py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/pattern-bg.png)` }} />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">كتالوج الصيانة المتكامل</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto font-medium">
            اختر باكدج الصيانة المناسب لسيارتك بناءً على الكيلومترات. نوفر لك أفضل القطع بأنسب الأسعار في السوق.
          </p>
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
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
