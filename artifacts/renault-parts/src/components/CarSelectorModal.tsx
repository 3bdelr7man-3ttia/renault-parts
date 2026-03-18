import React, { useState } from 'react';
import { Car, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCar, RENAULT_MODELS, CAR_YEARS } from '@/lib/car-context';

interface CarSelectorModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function CarSelectorModal({ onComplete, onSkip }: CarSelectorModalProps) {
  const { setCar } = useCar();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedModel && selectedYear) {
      setCar({ model: selectedModel, year: selectedYear });
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-primary p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Car className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">حدد سيارتك</h2>
          <p className="text-primary-foreground/80 text-sm font-medium leading-relaxed">
            لنعرض لك الباكدجات والقطع المناسبة لسيارتك بالتحديد
          </p>
        </div>

        <div className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">موديل السيارة</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-secondary/50 border border-border/60 rounded-xl px-4 py-3 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer pr-4"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="" disabled>اختر الموديل</option>
                {RENAULT_MODELS.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">سنة الصنع</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-secondary/50 border border-border/60 rounded-xl px-4 py-3 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer pr-4"
                value={selectedYear ?? ''}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                <option value="" disabled>اختر السنة</option>
                {CAR_YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold bg-primary text-white hover:bg-primary/90 rounded-xl"
            disabled={!selectedModel || !selectedYear}
            onClick={handleConfirm}
          >
            <Check className="w-5 h-5 ml-2" />
            تأكيد واعرض الباكدجات
          </Button>

          <button
            onClick={onSkip}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            تخطي - عرض كل الباكدجات
          </button>
        </div>
      </div>
    </div>
  );
}
