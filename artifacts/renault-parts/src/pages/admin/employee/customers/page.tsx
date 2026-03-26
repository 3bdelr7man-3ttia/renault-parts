import React from "react";
import { BadgeCheck, PhoneCall, Target, Users } from "lucide-react";

const statuses = [
  { label: "جديد", tone: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { label: "تم التواصل", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { label: "متابعة لاحقة", tone: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { label: "تم التحويل لطلب", tone: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
];

export default function EmployeeCustomersPage() {
  return (
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <p className="text-[#F9E795] text-sm font-bold mb-2">عملائي</p>
        <h1 className="text-3xl font-black text-white mb-3">قاعدة العملاء المخصصة لموظف المبيعات</h1>
        <p className="text-white/60 text-sm leading-7 max-w-3xl">
          هذه الصفحة ستكون المصدر الوحيد للعملاء المكلفين بك. لن تظهر هنا كل قاعدة العملاء العامة، بل الحالات التي يسندها لك
          المدير أو التي تدخل عبر فريق إدخال البيانات.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Users className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">المتاح الآن</p>
          <p className="text-white font-black text-lg">هيكل العملاء الخاص بك</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <PhoneCall className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">هدف المرحلة</p>
          <p className="text-white font-black text-lg">فصل المتابعة عن إدارة المستخدمين العامة</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Target className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">ما القادم</p>
          <p className="text-white font-black text-lg">ربط العملاء بالـ assignment والمهام اليومية</p>
        </div>
      </div>

      <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
        <h2 className="text-white font-black text-xl mb-4">الحالات المقترحة لكل عميل</h2>
        <div className="flex flex-wrap gap-3">
          {statuses.map((status) => (
            <span key={status.label} className={`px-3 py-2 rounded-xl border text-sm font-bold ${status.tone}`}>
              {status.label}
            </span>
          ))}
        </div>
        <p className="text-white/45 text-sm leading-7 mt-5">
          عند ربط الجدول الفعلي، سيكون لكل عميل: الاسم، الهاتف، المنطقة، السيارة، آخر تواصل، تاريخ المتابعة القادمة،
          ومصدر الإسناد إذا جاء من إدخال البيانات أو من المدير.
        </p>
      </div>

      <div className="bg-[#151D33] border border-dashed border-white/10 rounded-3xl p-10 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
          <BadgeCheck className="w-6 h-6" />
        </div>
        <h3 className="text-white font-black text-xl mb-3">لا توجد قائمة عملاء مسندة بعد</h3>
        <p className="text-white/50 text-sm leading-7 max-w-2xl mx-auto">
          هذا مقصود في المرحلة الأولى. الصفحة جاهزة لتكون مكان عمل موظف المبيعات، والخطوة التالية هي إضافة جدول
          العملاء المسندين وسجل المتابعات بدل الاعتماد على صفحات الأدمن العامة.
        </p>
      </div>
    </div>
  );
}
