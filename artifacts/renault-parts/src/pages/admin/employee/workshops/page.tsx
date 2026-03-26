import React from "react";
import { Building2, ClipboardCheck, MapPinned, Wrench } from "lucide-react";

const workshopStages = [
  "ورشة جديدة",
  "تم التواصل",
  "تحت التقييم",
  "مهتمة بالشراكة",
  "تم الضم",
];

export default function EmployeeWorkshopsPage() {
  return (
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <p className="text-[#F9E795] text-sm font-bold mb-2">ورش المتابعة</p>
        <h1 className="text-3xl font-black text-white mb-3">قاعدة الورش التابعة لموظف المبيعات</h1>
        <p className="text-white/60 text-sm leading-7 max-w-3xl">
          هذه الصفحة مخصصة للورش التي يتابعها موظف المبيعات فقط، سواء كانت ورشًا جديدة قيد الإقناع أو ورشًا موجودة
          تحتاج متابعة وتحويل إلى شراكة فعالة داخل رينو باك.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Building2 className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">استخدام الصفحة</p>
          <p className="text-white font-black text-lg">متابعة الورش المكلف بها فقط</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <MapPinned className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">الخطوة القادمة</p>
          <p className="text-white font-black text-lg">ربط الورش بالمناطق والزيارات اليومية</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <ClipboardCheck className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">هدف المرحلة</p>
          <p className="text-white font-black text-lg">إيقاف عرض الورش الإدارية غير المخصصة للمبيعات</p>
        </div>
      </div>

      <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
        <h2 className="text-white font-black text-xl mb-4">مراحل متابعة الورشة</h2>
        <div className="flex flex-wrap gap-3">
          {workshopStages.map((stage, index) => (
            <span
              key={stage}
              className={`px-3 py-2 rounded-xl border text-sm font-bold ${
                index === workshopStages.length - 1
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-white/5 text-white/75 border-white/10"
              }`}
            >
              {stage}
            </span>
          ))}
        </div>
        <p className="text-white/45 text-sm leading-7 mt-5">
          لاحقًا سيظهر لكل ورشة: الاسم، الهاتف، المنطقة، آخر تواصل، نوع الخدمة، حالة التفاوض، والمسؤول عنها داخل فريق المبيعات.
        </p>
      </div>

      <div className="bg-[#151D33] border border-dashed border-white/10 rounded-3xl p-10 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
          <Wrench className="w-6 h-6" />
        </div>
        <h3 className="text-white font-black text-xl mb-3">لا توجد ورش مسندة بعد</h3>
        <p className="text-white/50 text-sm leading-7 max-w-2xl mx-auto">
          هذه الصفحة أصبحت الآن الواجهة الصحيحة لورش موظف المبيعات، والخطوة التالية هي ربطها فعليًا ببيانات الإسناد
          والمتابعة اليومية بدل استخدام شاشة الورش العامة الخاصة بالإدارة.
        </p>
      </div>
    </div>
  );
}
