import React from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useGetPackageBySlug, getGetPackageBySlugQueryKey } from '@workspace/api-client-react';
import { CheckCircle2, Shield, Wrench, ArrowRight, ShoppingCart, Tag, Car, Info, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useCar } from '@/lib/car-context';

const PART_TYPE_LABELS: Record<string, string> = {
  filter: 'فلتر',
  oil: 'زيت',
  spark_plugs: 'شمعات إشعال',
  belt: 'سير',
  brake: 'فرامل',
  suspension: 'تعليق',
  battery: 'بطارية',
  tire: 'إطار',
  lights: 'كشافات',
};

function getPartTypeLabel(type: string): string {
  return PART_TYPE_LABELS[type] ?? type;
}

function isCompatible(compatibleModels: string | null | undefined, carModel: string): boolean {
  if (!compatibleModels) return true;
  return compatibleModels.includes(carModel) || compatibleModels.includes('جميع موديلات رينو');
}

export default function PackageDetail() {
  const [, params] = useRoute('/packages/:slug');
  const slug = params?.slug || '';
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { car } = useCar();

  const { data: pkg, isLoading, isError } = useGetPackageBySlug(slug, {
    query: { queryKey: getGetPackageBySlugQueryKey(slug), enabled: !!slug }
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-primary border-t-accent rounded-full" /></div>;
  }

  if (isError || !pkg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl font-black text-primary mb-4">الباكدج غير موجود</h1>
        <p className="text-muted-foreground mb-8">عذراً، لم نتمكن من العثور على الباكدج المطلوب.</p>
        <Link href="/packages">
          <Button className="rounded-full">العودة للباكدجات</Button>
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(pkg.sellPrice);

  const formattedBasePrice = new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(pkg.basePrice);

  const handleOrderClick = () => {
    if (!user) {
      setLocation('/login?redirect=/checkout/' + pkg.id);
    } else {
      setLocation('/checkout/' + pkg.id);
    }
  };

  const savings = pkg.basePrice - pkg.sellPrice;

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Header */}
      <div className="bg-primary pt-12 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/pattern-bg.png)` }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/packages" className="inline-flex items-center text-accent hover:text-white transition-colors font-bold mb-8">
            <ArrowRight className="w-4 h-4 ml-2" /> عودة للكتالوج
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white font-bold text-sm mb-4 border border-white/20 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-accent" />
                ضمان {pkg.warrantyMonths} شهور
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">{pkg.name}</h1>
              <p className="text-xl text-primary-foreground/80 max-w-2xl font-medium leading-relaxed">
                {pkg.description}
              </p>
            </div>
          </div>

          {/* Car Banner */}
          {car && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-bold">
              <Car className="w-4 h-4 text-accent" />
              العرض مخصص لـ {car.model} - {car.year}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-60px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Car compatibility notice */}
            {car && pkg.parts && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900 mb-1">تخصيص لسيارتك: {car.model}</p>
                  <p className="text-sm text-blue-700">
                    {pkg.parts.filter(p => isCompatible(p.compatibleModels, car.model)).length} قطعة من أصل {pkg.parts.length} متوافقة مباشرة مع سيارتك.
                  </p>
                </div>
              </div>
            )}

            {/* Parts List */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <SettingsIcon className="w-8 h-8 text-primary bg-primary/10 p-1.5 rounded-lg" />
                <h2 className="text-2xl font-black text-foreground">القطع المشمولة في الباكدج</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {pkg.parts?.map((part) => {
                  const compatible = car ? isCompatible(part.compatibleModels, car.model) : true;
                  return (
                    <div
                      key={part.id}
                      className={`flex items-start gap-3 p-4 rounded-2xl border ${compatible ? 'bg-secondary/50 border-border/50' : 'bg-orange-50/50 border-orange-200/60'}`}
                    >
                      <CheckCircle2 className={`w-6 h-6 shrink-0 mt-0.5 ${compatible ? 'text-green-500' : 'text-orange-400'}`} />
                      <div className="min-w-0">
                        <h4 className="font-bold text-foreground">{part.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getPartTypeLabel(part.type)}
                          {part.oemCode && <span className="mr-2 text-muted-foreground/60">OEM: {part.oemCode}</span>}
                        </p>
                        {!compatible && car && (
                          <p className="text-xs text-orange-600 mt-1">تحقق من التوافق مع {car.model}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-border/50 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <Tag className="w-8 h-8 text-accent bg-accent/20 p-1.5 rounded-lg" />
                <h2 className="text-2xl font-black text-foreground">مقارنة الأسعار والجودة</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b-2 border-border/80">
                      <th className="pb-4 font-bold text-muted-foreground">القطعة</th>
                      <th className="pb-4 font-bold text-primary text-center">
                        <span className="inline-flex flex-col items-center">
                          <span>أصلي</span>
                          <span className="text-xs text-primary/60 font-normal">الجودة العليا</span>
                        </span>
                      </th>
                      <th className="pb-4 font-bold text-amber-600 text-center">
                        <span className="inline-flex flex-col items-center">
                          <span>تركي</span>
                          <span className="text-xs text-amber-600/60 font-normal">جودة عالية</span>
                        </span>
                      </th>
                      <th className="pb-4 font-bold text-muted-foreground text-center">
                        <span className="inline-flex flex-col items-center">
                          <span>صيني</span>
                          <span className="text-xs text-muted-foreground/60 font-normal">اقتصادي</span>
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {pkg.parts?.map((part) => (
                      <tr key={part.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-4">
                          <span className="font-bold text-foreground">{part.name}</span>
                          <span className="block text-xs text-muted-foreground mt-0.5">{getPartTypeLabel(part.type)}</span>
                        </td>
                        <td className="py-4 text-center font-semibold text-primary">
                          {part.priceOriginal != null ? `${part.priceOriginal} ج.م` : '—'}
                        </td>
                        <td className="py-4 text-center font-medium text-amber-700">
                          {part.priceTurkish != null ? `${part.priceTurkish} ج.م` : '—'}
                        </td>
                        <td className="py-4 text-center text-muted-foreground">
                          {part.priceChinese != null ? `${part.priceChinese} ج.م` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Included Services */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-border/50">
              <h2 className="text-2xl font-black text-foreground mb-6">ماذا تشمل الخدمة؟</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-black text-foreground mb-1">تركيب مجاني</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">تركيب احترافي في ورشنا الشريكة بدون رسوم إضافية</p>
                </div>
                <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-accent/10 border border-accent/20">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-3">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-black text-foreground mb-1">ضمان {pkg.warrantyMonths} شهور</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">ضمان حقيقي على القطع والتركيب لراحة بالك</p>
                </div>
                <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-blue-50 border border-blue-200/60">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-black text-foreground mb-1">توصيل للبيت</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">نوصل القطع والفني لحد باب بيتك في الإسكندرية</p>
                </div>
                <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-green-50 border border-green-200/60">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-black text-foreground mb-1">وفر {savings} ج.م</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">أسعارنا أقل من السوق بضمان أصلية القطع</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-primary rounded-3xl p-8 shadow-2xl border border-primary-foreground/10 text-white">
              <h3 className="text-xl font-bold text-accent mb-6">ملخص الطلب</h3>

              {car && (
                <div className="mb-5 flex items-center gap-2 text-sm text-primary-foreground/80 bg-white/10 rounded-xl px-3 py-2">
                  <Car className="w-4 h-4 text-accent shrink-0" />
                  {car.model} — {car.year}
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-primary-foreground/80">
                  <span>سعر القطع في السوق</span>
                  <span className="line-through">{formattedBasePrice}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-white">
                  <span>سعر باكدج رينو بارتس</span>
                  <span className="text-accent">{formattedPrice}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-green-400 font-bold">
                  <span>أنت توفر</span>
                  <span>{savings} ج.م</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium">تركيب مجاني في ورشنا</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium">ضمان {pkg.warrantyMonths} شهور</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-14 text-lg font-bold bg-accent text-primary hover:bg-accent/90 rounded-xl"
                onClick={handleOrderClick}
              >
                <ShoppingCart className="w-5 h-5 ml-2" /> اطلب الآن
              </Button>
              <p className="text-xs text-center text-primary-foreground/60 mt-4">
                الدفع كاش عند الاستلام أو إلكترونياً
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
