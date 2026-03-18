import React, { useState } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useGetPackageBySlug, useCreateOrder, useListWorkshops } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin, CreditCard, Banknote, CarFront, Loader2, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

// We fetch by ID but the hook we have generated is getPackageBySlug.
// Looking at the OpenAPI, there is no getPackageById, only /packages/{slug}.
// We will assume the parameter is actually the ID since we linked to /checkout/:id earlier.
// WAIT. We linked to /checkout/pkg.id. But the API has /packages/{slug}.
// I should adjust the route to use slug or fetch all and find by ID.
// Let's use useListPackages to find the package by ID for simplicity if we only have slug endpoint.
// Actually, let's fix the link in PackageDetail to pass the slug or use listPackages to find it.
// I'll use the ID from the URL and fetch listPackages, find by ID.

import { useListPackages } from '@workspace/api-client-react';

export default function Checkout() {
  const [, params] = useRoute('/checkout/:id');
  const packageId = params?.id ? parseInt(params.id, 10) : 0;
  const [, setLocation] = useLocation();
  const { user, getAuthHeaders } = useAuth();
  const { toast } = useToast();

  const { data: packages, isLoading: isLoadingPackages } = useListPackages();
  const pkg = packages?.find(p => p.id === packageId);

  const { data: workshops } = useListWorkshops();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    carModel: user?.carModel || '',
    carYear: user?.carYear || new Date().getFullYear(),
    installationType: 'workshop', // 'workshop' | 'home'
    workshopId: null as number | null,
    deliveryAddress: user?.address || '',
    paymentMethod: 'cash', // 'cash' | 'card'
  });

  const { mutate: createOrder, isPending } = useCreateOrder({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: () => {
        toast({ title: "تم تأكيد الطلب!", description: "سنتواصل معك قريباً لتحديد الموعد." });
        setLocation('/my-orders');
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء تأكيد الطلب" });
      }
    }
  });

  if (!user) {
    setLocation('/login?redirect=/checkout/' + packageId);
    return null;
  }

  if (isLoadingPackages) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!pkg) return <div className="text-center py-20">الباكدج غير موجود</div>;

  const handleSubmit = () => {
    createOrder({
      data: {
        packageId: pkg.id,
        carModel: formData.carModel,
        carYear: Number(formData.carYear),
        paymentMethod: formData.paymentMethod,
        workshopId: formData.installationType === 'workshop' ? formData.workshopId : null,
        deliveryAddress: formData.installationType === 'home' ? formData.deliveryAddress : null,
      }
    });
  };

  return (
    <div className="bg-secondary/20 min-h-screen pb-24 pt-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black text-primary mb-8 text-center">إتمام الطلب</h1>

        {/* Stepper Progress */}
        <div className="flex justify-between items-center mb-12 relative px-4">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -z-10 -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 h-1 bg-primary -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          
          {[
            { num: 1, label: 'السيارة', icon: CarFront },
            { num: 2, label: 'التركيب', icon: MapPin },
            { num: 3, label: 'الدفع', icon: CreditCard }
          ].map(s => (
            <div key={s.num} className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                step >= s.num ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-muted-foreground border-2 border-border'
              }`}>
                {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-sm font-bold ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-border/50">
              
              {/* Step 1: Car Details */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold text-foreground mb-6">بيانات السيارة</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="font-bold">موديل السيارة</Label>
                      <Input 
                        value={formData.carModel} 
                        onChange={e => setFormData({...formData, carModel: e.target.value})}
                        className="h-12 rounded-xl mt-1" 
                        placeholder="مثال: لوجان 2018" 
                      />
                    </div>
                    <div>
                      <Label className="font-bold">سنة الصنع</Label>
                      <Input 
                        type="number"
                        value={formData.carYear} 
                        onChange={e => setFormData({...formData, carYear: parseInt(e.target.value) || 2020})}
                        className="h-12 rounded-xl mt-1" 
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full h-14 rounded-xl mt-8 font-bold text-lg" 
                    onClick={() => formData.carModel && setStep(2)}
                    disabled={!formData.carModel}
                  >
                    متابعة للتركيب
                  </Button>
                </div>
              )}

              {/* Step 2: Installation */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold text-foreground mb-6">طريقة التركيب</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button 
                      onClick={() => setFormData({...formData, installationType: 'workshop'})}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        formData.installationType === 'workshop' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <MapPin className="w-8 h-8 mx-auto mb-2" />
                      <span className="font-bold">في الورشة</span>
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, installationType: 'home'})}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        formData.installationType === 'home' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <CarFront className="w-8 h-8 mx-auto mb-2" />
                      <span className="font-bold">توصيل للبيت</span>
                    </button>
                  </div>

                  {formData.installationType === 'workshop' ? (
                    <div className="space-y-4">
                      <Label className="font-bold">اختر الورشة الأقرب لك</Label>
                      <div className="grid gap-3">
                        {workshops?.map(w => (
                          <div 
                            key={w.id}
                            onClick={() => setFormData({...formData, workshopId: w.id})}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.workshopId === w.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                          >
                            <h4 className="font-bold text-foreground">{w.name}</h4>
                            <p className="text-sm text-muted-foreground">{w.area} - {w.address}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label className="font-bold">عنوان التوصيل بالتفصيل</Label>
                      <Input 
                        value={formData.deliveryAddress}
                        onChange={e => setFormData({...formData, deliveryAddress: e.target.value})}
                        className="h-12 rounded-xl mt-1" 
                        placeholder="المنطقة، الشارع، رقم العمارة..." 
                      />
                    </div>
                  )}

                  <div className="flex gap-4 mt-8">
                    <Button variant="outline" className="w-1/3 h-14 rounded-xl font-bold" onClick={() => setStep(1)}>رجوع</Button>
                    <Button 
                      className="w-2/3 h-14 rounded-xl font-bold text-lg" 
                      onClick={() => setStep(3)}
                      disabled={(formData.installationType === 'workshop' && !formData.workshopId) || (formData.installationType === 'home' && !formData.deliveryAddress)}
                    >
                      متابعة للدفع
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold text-foreground mb-6">طريقة الدفع</h2>
                  
                  <div className="grid gap-4">
                    <button 
                      onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                      className={`p-6 rounded-2xl border-2 text-right flex items-center gap-4 transition-all ${
                        formData.paymentMethod === 'cash' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <Banknote className="w-8 h-8" />
                      <div>
                        <div className="font-bold text-lg">كاش عند الاستلام</div>
                        <div className="text-sm opacity-80">الدفع نقداً بعد التركيب أو الاستلام</div>
                      </div>
                    </button>

                    <button 
                      onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                      className={`p-6 rounded-2xl border-2 text-right flex items-center gap-4 transition-all ${
                        formData.paymentMethod === 'card' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <CreditCard className="w-8 h-8" />
                      <div>
                        <div className="font-bold text-lg">دفع إلكتروني (PayMob / فوري)</div>
                        <div className="text-sm opacity-80">سيتم تحويلك لبوابة الدفع الآمنة</div>
                      </div>
                    </button>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button variant="outline" className="w-1/3 h-14 rounded-xl font-bold" onClick={() => setStep(2)}>رجوع</Button>
                    <Button 
                      className="w-2/3 h-14 rounded-xl font-bold text-lg bg-accent text-primary hover:bg-accent/90 shadow-lg shadow-accent/20" 
                      onClick={handleSubmit}
                      disabled={isPending}
                    >
                      {isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'تأكيد الطلب نهائياً'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-primary text-white rounded-3xl p-6 shadow-xl sticky top-28 border border-white/10">
              <h3 className="font-bold text-accent mb-6 text-xl">ملخص الطلب</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-white/60 text-sm mb-1">الباكدج</p>
                  <p className="font-bold">{pkg.name}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">الضمان</p>
                  <p className="font-bold">{pkg.warrantyMonths} شهور</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/20">
                <div className="flex justify-between items-center text-xl font-black">
                  <span>الإجمالي</span>
                  <span className="text-accent">{pkg.sellPrice} ج.م</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
