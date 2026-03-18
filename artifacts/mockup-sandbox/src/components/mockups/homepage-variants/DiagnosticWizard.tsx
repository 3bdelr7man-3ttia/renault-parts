import React, { useState } from 'react';
import { Settings, CheckCircle2, ChevronLeft, MapPin, Phone, Star, Wrench, Menu } from 'lucide-react';

const MILEAGE_RANGES = [
  { id: 'under-20k', label: 'أقل من 20,000' },
  { id: '20k-40k', label: '20,000–40,000' },
  { id: '40k-60k', label: '40,000–60,000' },
  { id: '60k-100k', label: '60,000–100,000' },
  { id: 'over-100k', label: 'فوق 100,000' }
];

const PACKAGES: Record<string, { name: string; price: string; features: string[] }> = {
  'under-20k': {
    name: 'باكدج الطوارئ',
    price: '299',
    features: ['كشف عطل', 'تبديل زيت', 'فحص شامل']
  },
  '20k-40k': {
    name: 'باكدج 20,000 كم',
    price: '1,499',
    features: ['تبديل زيت', 'فلتر هواء', 'فحص فرامل', 'ضبط إطارات']
  },
  '40k-60k': {
    name: 'باكدج 40,000 كم',
    price: '2,199',
    features: ['تبديل زيت', 'فلتر هواء', 'فحص فرامل', 'ضبط إطارات', 'تبديل شمعات', 'فحص علبة التروس']
  },
  '60k-100k': {
    name: 'باكدج 60,000 كم',
    price: '3,499',
    features: ['صيانة شاملة', 'تبديل بواجي', 'فحص ترموستات', 'فحص فرامل', 'ضبط إطارات']
  },
  'over-100k': {
    name: 'باكدج 100,000 كم',
    price: '5,999',
    features: ['أشمل صيانة', 'جميع السوائل', 'فحص كهربائي كامل', 'تبديل بواجي', 'فحص شامل للمحرك']
  }
};

export default function DiagnosticWizard() {
  const [selectedRange, setSelectedRange] = useState<string | null>(null);

  const selectedPackage = selectedRange ? PACKAGES[selectedRange] : null;

  return (
    <div dir="rtl" className="min-h-screen bg-[#1E2761] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_60%)] pointer-events-none" />
      
      {/* Abstract Car Silhouette Background */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl opacity-10 pointer-events-none">
        <svg viewBox="0 0 1000 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M150 250 L200 150 L350 100 L650 100 L800 150 L850 250 Z" stroke="white" strokeWidth="4" />
          <circle cx="250" cy="250" r="40" stroke="white" strokeWidth="4" />
          <circle cx="750" cy="250" r="40" stroke="white" strokeWidth="4" />
        </svg>
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-[#F9E795]">
          <Wrench className="w-8 h-8" />
          <span className="text-2xl font-black tracking-tight">رينو بارتس</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#" className="hover:text-[#F9E795] transition-colors">الرئيسية</a>
          <a href="#" className="hover:text-[#F9E795] transition-colors">الباقات</a>
          <a href="#" className="hover:text-[#F9E795] transition-colors">عن الشركة</a>
          <a href="#" className="hover:text-[#F9E795] transition-colors">اتصل بنا</a>
        </nav>
        <button className="md:hidden text-white hover:text-[#F9E795] transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content: Diagnostic Wizard */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-5xl w-full mx-auto flex flex-col items-center text-center">
          
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-md">
              كم عداد سيارتك؟
            </h1>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
              اختر نطاق الكيلومترات لسيارتك وسنقوم بترشيح باقة الصيانة الأنسب لك فوراً
            </p>
          </div>

          {/* Mileage Range Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-16 w-full">
            {MILEAGE_RANGES.map((range) => {
              const isSelected = selectedRange === range.id;
              return (
                <button
                  key={range.id}
                  onClick={() => setSelectedRange(range.id)}
                  className={`
                    px-6 py-4 rounded-2xl text-lg md:text-xl font-bold transition-all duration-300 transform
                    ${isSelected 
                      ? 'bg-[#F9E795] text-[#1E2761] scale-105 shadow-[0_0_20px_rgba(249,231,149,0.4)] border-transparent' 
                      : 'bg-white/5 border border-white/30 text-white hover:bg-[#F9E795] hover:text-[#1E2761] hover:scale-105'
                    }
                  `}
                >
                  {range.label}
                </button>
              );
            })}
          </div>

          {/* Recommendation Card */}
          <div className={`
            w-full max-w-3xl transition-all duration-700 ease-in-out transform origin-top
            ${selectedPackage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}
          `}>
            {selectedPackage && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-right shadow-2xl overflow-hidden relative">
                
                {/* Decorative glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F9E795] opacity-20 blur-3xl rounded-full pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                  
                  {/* Package Info */}
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 bg-[#F9E795]/20 text-[#F9E795] px-3 py-1 rounded-full text-sm font-bold mb-4">
                      <Star className="w-4 h-4 fill-current" />
                      الخيار الأنسب لسيارتك
                    </div>
                    <h2 className="text-3xl font-black mb-6">{selectedPackage.name}</h2>
                    
                    <ul className="space-y-3">
                      {selectedPackage.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-lg">
                          <CheckCircle2 className="w-6 h-6 text-[#F9E795] shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price & CTA */}
                  <div className="bg-[#1E2761]/50 border border-white/10 rounded-2xl p-6 w-full md:w-auto min-w-[280px] flex flex-col items-center text-center backdrop-blur-sm">
                    <p className="text-white/60 mb-2">السعر الإجمالي</p>
                    <div className="flex items-baseline gap-2 mb-6 text-[#F9E795]">
                      <span className="text-4xl font-black">{selectedPackage.price}</span>
                      <span className="text-xl font-bold">ج.م</span>
                    </div>
                    <button className="w-full bg-[#F9E795] text-[#1E2761] hover:bg-white transition-colors duration-300 font-black text-xl py-4 rounded-xl flex items-center justify-center gap-2 group">
                      احجز الآن
                      <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <p className="text-xs text-white/40 mt-4">شامل ضريبة القيمة المضافة ومصنعية التركيب</p>
                  </div>

                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Trust Strip */}
      <div className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/5 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl font-black text-[#F9E795] mb-2 drop-shadow-sm">1,200+</span>
            <span className="text-white/80 font-bold text-lg">سيارة صُيِّنَت</span>
          </div>
          <div className="flex flex-col items-center text-center border-y md:border-y-0 md:border-x border-white/10 py-6 md:py-0">
            <span className="text-4xl font-black text-[#F9E795] mb-2 drop-shadow-sm">4.9</span>
            <span className="text-white/80 font-bold text-lg">تقييم العملاء</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl font-black text-[#F9E795] mb-2 drop-shadow-sm">12</span>
            <span className="text-white/80 font-bold text-lg">ورشة معتمدة</span>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="relative z-10 bg-[#161d49] py-8 text-center border-t border-white/5">
        <div className="flex items-center justify-center gap-2 text-[#F9E795]/50 mb-4">
          <Wrench className="w-5 h-5" />
          <span className="text-lg font-black">رينو بارتس</span>
        </div>
        <p className="text-white/40 text-sm">© {new Date().getFullYear()} رينو بارتس الإسكندرية. جميع الحقوق محفوظة.</p>
      </footer>

    </div>
  );
}
