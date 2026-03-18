import React from "react";
import { Star, CheckCircle2, MapPin, Phone, Car, Wrench, ShieldCheck, ChevronLeft } from "lucide-react";

export default function TrustLed() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F8F9FA] text-[#1E2761] font-sans selection:bg-[#F9E795] selection:text-[#1E2761]">
      {/* 1. Sticky Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1E2761] rounded-lg flex items-center justify-center text-[#F9E795]">
                <Wrench size={24} />
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#1E2761]">رينو<span className="text-gray-500">بارتس</span></span>
            </div>
            
            <div className="hidden md:flex space-x-8 space-x-reverse text-sm font-medium">
              <a href="#" className="text-[#1E2761] hover:text-gray-600 transition-colors">الرئيسية</a>
              <a href="#" className="text-gray-500 hover:text-[#1E2761] transition-colors">تقييمات العملاء</a>
              <a href="#" className="text-gray-500 hover:text-[#1E2761] transition-colors">الورش المعتمدة</a>
              <a href="#" className="text-gray-500 hover:text-[#1E2761] transition-colors">باقات الصيانة</a>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 font-medium">
                <Phone size={16} />
                <span dir="ltr">0100 123 4567</span>
              </div>
              <button className="bg-[#F9E795] hover:bg-[#f5e076] text-[#1E2761] font-bold py-2.5 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm">
                احجز الآن
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Compact Hero */}
      <header className="bg-[#1E2761] text-white pt-16 pb-32 px-4 relative overflow-hidden">
        {/* Abstract subtle pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-[#F9E795] px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
            <ShieldCheck size={16} />
            <span>الأكثر ثقة في الإسكندرية</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            صيانة رينو في الإسكندرية، <span className="text-[#F9E795]">بأمان تام</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            قطع غيار أصلية، ورش معتمدة، وأسعار شفافة. نحن نعتني بسيارتك وكأنها سيارتنا.
          </p>
        </div>
      </header>

      {/* 3. Social Proof Hero (MAIN SECTION) - Overlapping the header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Stat 1 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-[#F9E795] text-center transform transition-transform hover:-translate-y-1">
            <div className="text-5xl md:text-6xl font-black text-[#F9E795] mb-2 font-mono tracking-tighter">1,247</div>
            <p className="text-sm md:text-base font-bold text-[#1E2761]">سيارة تمت صيانتها</p>
            <p className="text-xs text-gray-500 mt-1">بنجاح هذا العام</p>
          </div>
          
          {/* Stat 2 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-[#F9E795] text-center transform transition-transform hover:-translate-y-1">
            <div className="text-5xl md:text-6xl font-black text-[#F9E795] mb-2 font-mono tracking-tighter">4.9</div>
            <div className="flex justify-center gap-1 mb-2 text-[#F9E795]">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="text-sm md:text-base font-bold text-[#1E2761]">متوسط التقييم</p>
          </div>

          {/* Stat 3 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-[#F9E795] text-center transform transition-transform hover:-translate-y-1">
            <div className="text-5xl md:text-6xl font-black text-[#F9E795] mb-2 font-mono tracking-tighter">12</div>
            <p className="text-sm md:text-base font-bold text-[#1E2761]">ورشة معتمدة</p>
            <p className="text-xs text-gray-500 mt-1">تغطي أنحاء الإسكندرية</p>
          </div>

          {/* Stat 4 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-[#F9E795] text-center transform transition-transform hover:-translate-y-1">
            <div className="text-5xl md:text-6xl font-black text-[#F9E795] mb-2 font-mono tracking-tighter">97%</div>
            <p className="text-sm md:text-base font-bold text-[#1E2761]">نسبة رضا العملاء</p>
            <p className="text-xs text-gray-500 mt-1">يعودون إلينا دائماً</p>
          </div>
        </div>
      </section>

      {/* 4. Customer Testimonials Strip */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1E2761] mb-2">ماذا يقول عملاؤنا؟</h2>
              <p className="text-gray-500">تجارب حقيقية من ملاك سيارات رينو في الإسكندرية</p>
            </div>
            <a href="#" className="hidden md:flex items-center text-sm font-bold text-[#1E2761] hover:text-gray-600 gap-1">
              عرض كل التقييمات <ChevronLeft size={16} />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-[#F8F9FA] rounded-2xl p-8 border-r-4 border-[#F9E795] shadow-sm relative">
              <div className="absolute top-6 left-6 text-gray-200">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
              </div>
              <div className="flex gap-1 text-[#F9E795] mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-gray-700 font-medium leading-relaxed mb-6 text-lg">
                "بصراحة كنت قلقان أعمل صيانة برة التوكيل، بس لما جربت معاهم لقيت قطع غيار أصلية بأسعار معقولة جداً، والمهندس فاهم شغله كويس. وفروا عليا كتير."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1E2761] rounded-full flex items-center justify-center text-[#F9E795] font-bold text-xl">
                  أ
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2761]">أحمد محمود</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Car size={12} /> رينو كليو 2019</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[#F8F9FA] rounded-2xl p-8 border-r-4 border-[#F9E795] shadow-sm relative">
              <div className="absolute top-6 left-6 text-gray-200">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
              </div>
              <div className="flex gap-1 text-[#F9E795] mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-gray-700 font-medium leading-relaxed mb-6 text-lg">
                "أحسن حاجة إنهم محددين الأسعار في الباقات ومفيش مفاجآت وقت الدفع. الورشة كانت نضيفة جداً واستلمت العربية في الميعاد بالظبط. شكراً ليكم."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1E2761] rounded-full flex items-center justify-center text-[#F9E795] font-bold text-xl">
                  م
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2761]">محمد طارق</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Car size={12} /> رينو ميجان 2021</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-[#F8F9FA] rounded-2xl p-8 border-r-4 border-[#F9E795] shadow-sm relative">
              <div className="absolute top-6 left-6 text-gray-200">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
              </div>
              <div className="flex gap-1 text-[#F9E795] mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-gray-700 font-medium leading-relaxed mb-6 text-lg">
                "باكدج صيانة الـ 40 ألف كان ممتاز، عملوا كل حاجة مكتوبة وراجعوا على العربية بالكامل. مركز معتمد وثقة في سموحة برشحه لأي حد معاه رينو."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1E2761] rounded-full flex items-center justify-center text-[#F9E795] font-bold text-xl">
                  س
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2761]">سارة عبد الرحمن</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Car size={12} /> رينو لوجان 2018</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Workshop Photos Grid */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1E2761] mb-4">ورشنا المعتمدة في الإسكندرية</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              نحن نتعاون فقط مع أفضل المراكز المتخصصة والمجهزة بأحدث أجهزة كشف الأعطال لسيارات رينو.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Workshop 1 */}
            <div className="relative h-72 rounded-2xl overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E2761] to-[#2a3680] mix-blend-multiply"></div>
              {/* Pattern placeholder for photo */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #1E2761 25%, #1E2761 75%, #000 75%, #000)', backgroundPosition: '0 0, 20px 20px', backgroundSize: '40px 40px' }}></div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E2761] via-[#1E2761]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <div className="flex items-center gap-2 text-[#F9E795] mb-2 text-sm font-bold">
                  <Star size={14} fill="currentColor" /> 4.9 (120 تقييم)
                </div>
                <h3 className="text-2xl font-bold mb-1">مركز الأمل للصيانة</h3>
                <p className="flex items-center gap-1 text-gray-300 text-sm"><MapPin size={14} /> سموحة، شارع النصر</p>
              </div>
            </div>

            {/* Workshop 2 */}
            <div className="relative h-72 rounded-2xl overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E2761] to-[#2a3680] mix-blend-multiply"></div>
              {/* Pattern placeholder for photo */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #000 0, #000 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E2761] via-[#1E2761]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <div className="flex items-center gap-2 text-[#F9E795] mb-2 text-sm font-bold">
                  <Star size={14} fill="currentColor" /> 4.8 (85 تقييم)
                </div>
                <h3 className="text-2xl font-bold mb-1">الماسة موتورز</h3>
                <p className="flex items-center gap-1 text-gray-300 text-sm"><MapPin size={14} /> ميامي، شارع جمال عبد الناصر</p>
              </div>
            </div>

            {/* Workshop 3 */}
            <div className="relative h-72 rounded-2xl overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E2761] to-[#2a3680] mix-blend-multiply"></div>
              {/* Pattern placeholder for photo */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E2761] via-[#1E2761]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <div className="flex items-center gap-2 text-[#F9E795] mb-2 text-sm font-bold">
                  <Star size={14} fill="currentColor" /> 5.0 (42 تقييم)
                </div>
                <h3 className="text-2xl font-bold mb-1">المركز الفرنسي</h3>
                <p className="flex items-center gap-1 text-gray-300 text-sm"><MapPin size={14} /> محرم بك، الطريق الدائري</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Packages Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E2761] mb-4">اختار باكدجك بوضوح</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              أسعار شاملة قطع الغيار الأصلية والمصنعية والضريبة. لا توجد أي مصاريف خفية.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Package 1 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
              <div className="bg-[#1E2761] p-6 text-center text-white">
                <h3 className="text-xl font-bold mb-2">صيانة 20,000 كم</h3>
                <div className="text-3xl font-black text-[#F9E795] font-mono">1,850 <span className="text-sm font-normal text-gray-300">ج.م</span></div>
              </div>
              <div className="p-6 flex-grow">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span>تغيير زيت المحرك وفلتر الزيت</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span>تغيير فلتر الهواء والتكييف</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span>فحص الفرامل الأمامية والخلفية</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span>مراجعة سوائل السيارة بالكامل</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 pt-0 mt-auto">
                <button className="w-full py-3 px-4 border-2 border-[#1E2761] text-[#1E2761] font-bold rounded-xl hover:bg-[#1E2761] hover:text-white transition-colors">
                  اختر الباقة
                </button>
              </div>
            </div>

            {/* Package 2 (Popular) */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#F9E795] overflow-hidden flex flex-col transform md:-translate-y-4 relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-[#F9E795]"></div>
              <div className="absolute top-4 left-0 bg-[#F9E795] text-[#1E2761] text-xs font-black px-3 py-1 rounded-r-lg uppercase tracking-wider">
                الأكثر طلباً
              </div>
              <div className="bg-[#1E2761] p-6 text-center text-white pt-10">
                <h3 className="text-xl font-bold mb-2">صيانة 40,000 كم</h3>
                <div className="text-4xl font-black text-[#F9E795] font-mono">3,400 <span className="text-sm font-normal text-gray-300">ج.م</span></div>
              </div>
              <div className="p-6 flex-grow bg-gray-50/50">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span>جميع بنود صيانة 20,000 كم</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span>تغيير البوجيهات الأصلية</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span>تغيير سير المجموعة الداخلي</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span>تغيير سائل الفرامل</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 pt-0 mt-auto bg-gray-50/50">
                <button className="w-full py-3.5 px-4 bg-[#F9E795] text-[#1E2761] font-bold rounded-xl hover:bg-[#f5e076] transition-colors shadow-sm">
                  اختر الباقة
                </button>
              </div>
            </div>

            {/* Package 3 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
              <div className="bg-[#1E2761] p-6 text-center text-white">
                <h3 className="text-xl font-bold mb-2">صيانة 60,000 كم</h3>
                <div className="text-3xl font-black text-[#F9E795] font-mono">5,200 <span className="text-sm font-normal text-gray-300">ج.م</span></div>
              </div>
              <div className="p-6 flex-grow">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span>جميع بنود صيانة 20,000 كم</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span>تغيير سير الكاتينة والبلي</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span>تغيير دورة التبريد بالكامل</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span>فحص شامل بالكمبيوتر</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 pt-0 mt-auto">
                <button className="w-full py-3 px-4 border-2 border-[#1E2761] text-[#1E2761] font-bold rounded-xl hover:bg-[#1E2761] hover:text-white transition-colors">
                  اختر الباقة
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Minimal Footer */}
      <footer className="bg-[#1E2761] text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-[#F9E795]">
              <Wrench size={24} />
            </div>
            <span className="font-bold text-2xl tracking-tight">رينو<span className="text-[#F9E795]">بارتس</span></span>
          </div>
          <p className="text-gray-400 text-sm text-center md:text-right">
            © 2024 رينو بارتس الإسكندرية. الثقة أولاً. ليس لنا علاقة رسمية بالتوكيل ولكن نقدم خدمة معتمدة وموثوقة.
          </p>
        </div>
      </footer>
    </div>
  );
}
