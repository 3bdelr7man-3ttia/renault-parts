import React from 'react';
import { Settings, Shield, Wrench, Check, ChevronLeft, Menu, Phone } from 'lucide-react';

export default function PremiumGarage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#0A0A0A] text-[#E8E8E8] font-sans selection:bg-[#C9A84C] selection:text-[#0A0A0A] overflow-hidden">
      {/* 1. Minimal Top Bar */}
      <header className="h-[60px] border-b border-[#1A1A1A] bg-[#0A0A0A]/90 backdrop-blur-md fixed top-0 w-full z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-serif text-white tracking-wide relative">
            رينو بارتس
            <span className="absolute -bottom-2 right-0 w-1/2 h-[2px] bg-[#C9A84C]"></span>
          </h1>
          <nav className="hidden md:flex gap-6 text-sm text-[#888888]">
            <a href="#" className="hover:text-white transition-colors duration-300">الرئيسية</a>
            <a href="#" className="hover:text-white transition-colors duration-300">الخدمات والباقات</a>
            <a href="#" className="hover:text-white transition-colors duration-300">عن المركز</a>
            <a href="#" className="hover:text-white transition-colors duration-300">تواصل معنا</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 text-[#C9A84C] text-sm font-medium hover:text-white transition-colors">
            <Phone size={16} />
            <span>012 3456 7890</span>
          </button>
          <button className="md:hidden text-white">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* 2. Full-Viewport Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 lg:px-12 overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-[#C9A84C]/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border-[1px] border-[#C9A84C]/5 rounded-full"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A] z-0"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-[#C9A84C] text-sm md:text-base tracking-[0.2em] mb-8 font-light">
            خدمة ما بعد البيع — الإسكندرية
          </p>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.1] font-serif">
            الصيانة التي <br /> تستحقها سيارتك
          </h2>
          
          <div className="w-24 h-[1px] bg-[#C9A84C] mb-8"></div>
          
          <p className="text-lg md:text-xl text-[#888888] font-light max-w-2xl mx-auto mb-12 leading-relaxed">
            نقدم معايير جديدة للعناية بسيارات رينو. قطع غيار أصلية، خبراء متخصصون، وتجربة صيانة ترتقي لمستوى توقعاتك.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="bg-[#C9A84C] text-[#0A0A0A] px-10 py-4 font-bold tracking-wide hover:bg-white transition-colors duration-300 text-sm md:text-base">
              استكشف خدماتنا
            </button>
            <button className="border border-[#C9A84C] text-[#C9A84C] px-10 py-4 font-bold tracking-wide hover:bg-[#C9A84C] hover:text-[#0A0A0A] transition-colors duration-300 text-sm md:text-base">
              تواصل معنا
            </button>
          </div>
        </div>
      </section>

      {/* 3. Services Strip */}
      <section className="py-24 px-6 lg:px-12 bg-[#0A0A0A] relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Wrench size={32} strokeWidth={1.5} />, title: "صيانة دقيقة", desc: "أحدث أجهزة الفحص المعتمدة من رينو" },
            { icon: <Shield size={32} strokeWidth={1.5} />, title: "قطع أصلية", desc: "ضمان شامل على جميع قطع الغيار والتركيب" },
            { icon: <Settings size={32} strokeWidth={1.5} />, title: "خدمة متكاملة", desc: "من الفحص السريع حتى العمرات الكاملة" }
          ].map((service, idx) => (
            <div key={idx} className="bg-[#1A1A1A] p-10 border-b-2 border-[#C9A84C] hover:-translate-y-2 transition-transform duration-500 group">
              <div className="text-[#C9A84C] mb-6 group-hover:scale-110 transition-transform duration-500 origin-right">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
              <p className="text-[#888888] font-light leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Package */}
      <section className="py-32 px-6 lg:px-12 bg-[#1A1A1A] relative border-y border-[#333333]">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#C9A84C]/5 to-transparent opacity-50 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 space-y-8">
            <div className="inline-block border border-[#C9A84C] px-4 py-1 text-[#C9A84C] text-xs tracking-widest uppercase">
              الباقة المميزة
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-white leading-tight">
              باكدج 60,000 كم
            </h2>
            <p className="text-[#888888] text-lg font-light leading-relaxed max-w-xl">
              صيانة شاملة تعيد لسيارتك أداءها الأول. تشمل هذه الباقة الدورية الفحص الشامل وتغيير القطع الأساسية لضمان سلامتك على الطريق.
            </p>
            <div className="space-y-4 pt-4">
              {[
                "تغيير زيت المحرك التخليقي بالكامل",
                "تغيير فلاتر الزيت، الهواء، والتكييف",
                "تغيير البوجيهات الأصلية",
                "مراجعة شاملة لزيت الفرامل ودورة التبريد",
                "فحص بالكمبيوتر وضبط الزوايا"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-[#E8E8E8]">
                  <div className="w-1.5 h-1.5 bg-[#C9A84C]"></div>
                  <span className="font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 w-full lg:w-auto flex flex-col items-start lg:items-end">
            <div className="bg-[#0A0A0A] p-10 border border-[#333333] w-full max-w-md">
              <p className="text-[#888888] text-sm tracking-widest mb-4">السعر الإجمالي</p>
              <div className="text-5xl text-[#C9A84C] font-serif mb-8 flex items-baseline gap-2 dir-ltr">
                <span>3,499</span>
                <span className="text-xl">ج.م</span>
              </div>
              <button className="w-full bg-[#C9A84C] text-[#0A0A0A] py-5 font-bold text-lg hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2 group">
                احجز الآن
                <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <p className="text-[#555555] text-xs text-center mt-6">
                *الأسعار شاملة ضريبة القيمة المضافة ومصنعية التركيب
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Other Packages */}
      <section className="py-24 px-6 lg:px-12 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16 border-b border-[#1A1A1A] pb-8">
            <h2 className="text-4xl font-serif text-white">باكدجات أخرى</h2>
            <button className="text-[#C9A84C] hover:text-white transition-colors text-sm font-bold tracking-widest flex items-center gap-2">
              عرض الكل
              <ChevronLeft size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "باكدج 10,000 كم", price: "1,200", desc: "صيانة دورية سريعة" },
              { title: "باكدج 20,000 كم", price: "1,850", desc: "تغيير زيوت وفلاتر أساسية" },
              { title: "باكدج 40,000 كم", price: "2,700", desc: "صيانة متوسطة شاملة" },
              { title: "عمرة فرامل كاملة", price: "4,200", desc: "تيل وطنابير أصلية" }
            ].map((pkg, idx) => (
              <div key={idx} className="bg-[#1A1A1A] p-8 border-t border-[#C9A84C] hover:bg-[#222222] transition-colors cursor-pointer group flex flex-col h-full">
                <h3 className="text-xl font-bold text-white mb-2">{pkg.title}</h3>
                <p className="text-[#888888] text-sm mb-8 font-light flex-1">{pkg.desc}</p>
                <div className="text-2xl text-[#C9A84C] font-serif dir-ltr text-right group-hover:scale-105 transition-transform origin-left">
                  {pkg.price} <span className="text-sm">ج.م</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Closing CTA */}
      <section className="py-32 px-6 lg:px-12 bg-[#0A0A0A] relative text-center border-t border-[#1A1A1A]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#C9A84C]/5 to-transparent z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-serif text-white mb-8">
            جاهز لصيانة سيارتك؟
          </h2>
          <p className="text-[#888888] text-lg font-light mb-12">
            احجز موعدك الآن واستمتع بخدمة تليق بك وبسيارتك في مركزنا المتخصص بالإسكندرية.
          </p>
          <button className="bg-[#C9A84C] text-[#0A0A0A] px-12 py-5 font-bold tracking-wide hover:bg-white transition-colors duration-300 text-lg shadow-[0_0_30px_rgba(201,168,76,0.2)]">
            احجز موعد صيانة
          </button>
        </div>
      </section>
      
      {/* Minimal Footer */}
      <footer className="py-8 px-6 lg:px-12 bg-[#0A0A0A] border-t border-[#1A1A1A] text-center md:text-right flex flex-col md:flex-row justify-between items-center text-[#555555] text-sm">
        <p>© 2024 رينو بارتس الإسكندرية. جميع الحقوق محفوظة.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-[#C9A84C] transition-colors">الشروط والأحكام</a>
          <a href="#" className="hover:text-[#C9A84C] transition-colors">سياسة الخصوصية</a>
        </div>
      </footer>
    </div>
  );
}
