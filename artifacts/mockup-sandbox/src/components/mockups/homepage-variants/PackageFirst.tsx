import React, { useState } from "react";
import { Check, Minus, Settings, ChevronLeft, MapPin, Wrench, ShieldCheck } from "lucide-react";

// Package data
const packages = [
  {
    id: "emergency",
    name: "باكدج الطوارئ",
    mileage: "طوارئ",
    price: "299",
    features: ["كشف عطل", "تبديل زيت", "فحص شامل"],
    missing: ["فلتر هواء", "شمعات", "فحص كهربائي"],
    recommendedFor: "للحالات الطارئة والأعطال المفاجئة",
  },
  {
    id: "20k",
    name: "باكدج ٢٠,٠٠٠ كم",
    mileage: "20,000 كم",
    price: "1,499",
    features: ["تبديل زيت", "فلتر هواء", "ضبط إطارات"],
    missing: ["شمعات", "فحص كهربائي"],
    recommendedFor: "للصيانة الدورية الأساسية",
  },
  {
    id: "40k",
    name: "باكدج ٤٠,٠٠٠ كم",
    mileage: "40,000 كم",
    price: "2,199",
    features: ["تبديل زيت", "فلتر هواء", "شمعات"],
    missing: ["فحص كهربائي"],
    recommendedFor: "صيانة متوسطة للحفاظ على الأداء",
  },
  {
    id: "60k",
    name: "باكدج ٦٠,٠٠٠ كم",
    mileage: "60,000 كم",
    price: "3,499",
    features: ["تبديل زيت", "فلتر هواء", "شمعات", "فحص كهربائي جزئي"],
    missing: [],
    recommendedFor: "صيانة متقدمة لفحص الأنظمة الكهربائية",
  },
  {
    id: "100k",
    name: "باكدج ١٠٠,٠٠٠ كم",
    mileage: "100,000 كم",
    price: "5,999",
    features: ["تبديل زيت", "فلتر هواء", "شمعات", "فحص كهربائي كامل", "تغيير سيور"],
    missing: [],
    recommendedFor: "تجديد شامل لسيارتك",
  },
];

// Comparison table data
const comparisonFeatures = [
  { name: "تبديل زيت", values: [true, true, true, true, true] },
  { name: "فلتر هواء", values: [false, true, true, true, true] },
  { name: "شمعات", values: [false, false, true, true, true] },
  { name: "فحص كهربائي", values: [false, false, false, "جزئي", "كامل"] },
];

export function PackageFirst() {
  const [activePackageId, setActivePackageId] = useState("40k");
  const activePackage = packages.find((p) => p.id === activePackageId)!;

  return (
    <div className="min-h-screen bg-[#F0F2FF] font-sans text-[#1E2761]" dir="rtl">
      {/* 1. Minimal sticky header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-[#1E2761]">
          <Settings className="h-5 w-5 text-[#F9E795]" />
          <span>رينو بارتس الإسكندرية</span>
        </div>
        <a href="#" className="text-sm font-medium text-[#1E2761] hover:underline">
          سجل دخول
        </a>
      </header>

      {/* 2. Page title bar */}
      <div className="bg-[#1E2761] py-8 text-center text-white">
        <h1 className="text-3xl font-bold md:text-4xl">اختار باكدج صيانتك</h1>
        <p className="mt-2 text-[#F9E795]">حسب عداد سيارتك</p>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 3. MILEAGE SELECTOR */}
        <section className="mb-12">
          <div className="flex w-full overflow-hidden rounded-xl border border-[#1E2761]/20 bg-white shadow-sm">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setActivePackageId(pkg.id)}
                className={`flex-1 py-4 text-center text-sm font-bold transition-colors md:text-base ${
                  activePackageId === pkg.id
                    ? "bg-[#F9E795] text-[#1E2761]"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {pkg.mileage}
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-lg font-medium">
              نوصيك بـ: <span className="font-bold text-[#1E2761]">{activePackage.name}</span>
            </p>
            <p className="text-sm text-slate-500">{activePackage.recommendedFor}</p>
          </div>
        </section>

        {/* 4. PACKAGE CARDS */}
        <section className="mb-16">
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {packages.map((pkg) => {
              const isActive = activePackageId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setActivePackageId(pkg.id)}
                  className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                    isActive
                      ? "scale-105 border-[#F9E795] bg-[#1E2761] text-white shadow-xl shadow-[#1E2761]/20 ring-2 ring-[#F9E795]"
                      : "border-slate-200 bg-white opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="mb-4 text-center">
                    <h3 className={`text-lg font-bold ${isActive ? "text-[#F9E795]" : "text-[#1E2761]"}`}>
                      {pkg.name}
                    </h3>
                    <p className={`text-sm ${isActive ? "text-slate-300" : "text-slate-500"}`}>{pkg.mileage}</p>
                  </div>

                  <div className="mb-6 flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">{pkg.price}</span>
                    <span className={`text-sm ${isActive ? "text-slate-300" : "text-slate-500"}`}>ج.م</span>
                  </div>

                  <ul className="mb-8 space-y-3 text-sm">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className={`h-4 w-4 shrink-0 ${isActive ? "text-[#F9E795]" : "text-green-500"}`} />
                        <span className={isActive ? "text-slate-200" : "text-slate-700"}>{feature}</span>
                      </li>
                    ))}
                    {pkg.missing.map((feature, idx) => (
                      <li key={`missing-${idx}`} className="flex items-center gap-2 opacity-50">
                        <Minus className="h-4 w-4 shrink-0" />
                        <span className="line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`absolute bottom-5 left-5 right-5 w-[calc(100%-40px)] rounded-lg py-2 font-bold transition-colors ${
                      isActive
                        ? "bg-[#F9E795] text-[#1E2761] hover:bg-yellow-400"
                        : "bg-[#1E2761] text-white hover:bg-blue-900"
                    }`}
                  >
                    احجز الآن
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. COMPARISON TABLE */}
        <section className="mb-12 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#1E2761] text-white">
              <tr>
                <th className="p-4 font-semibold">الميزة</th>
                {packages.map((pkg) => (
                  <th
                    key={pkg.id}
                    className={`p-4 text-center font-semibold ${
                      activePackageId === pkg.id ? "text-[#F9E795]" : ""
                    }`}
                  >
                    {pkg.mileage}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonFeatures.map((feature, idx) => (
                <tr key={idx} className="even:bg-[#F8F9FF]">
                  <td className="p-4 font-medium text-[#1E2761]">{feature.name}</td>
                  {feature.values.map((val, vIdx) => (
                    <td key={vIdx} className="p-4 text-center">
                      {typeof val === "boolean" ? (
                        val ? (
                          <Check className="mx-auto h-5 w-5 text-green-500" />
                        ) : (
                          <Minus className="mx-auto h-5 w-5 text-slate-300" />
                        )
                      ) : (
                        <span className="font-medium text-[#1E2761]">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* 6. Slim trust footer bar */}
      <div className="bg-[#F9E795] py-3 text-center text-sm font-bold text-[#1E2761]">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" /> ضمان 12 شهر
          </span>
          <span className="flex items-center gap-1">
            <Settings className="h-4 w-4" /> قطع أصلية
          </span>
          <span className="flex items-center gap-1">
            <Wrench className="h-4 w-4" /> تركيب احترافي
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> الإسكندرية
          </span>
        </div>
      </div>

      {/* 7. Standard footer */}
      <footer className="bg-[#1E2761] py-8 text-center text-slate-300">
        <p className="text-sm">© {new Date().getFullYear()} رينو بارتس الإسكندرية. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}

export default PackageFirst;
