import React, { useState, useEffect } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useListPackages, useCreateOrder, useListWorkshops, useInitiatePayment, getListWorkshopsQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin, CreditCard, Banknote, CarFront, Loader2, CheckCircle2,
  Package2, Home, AlertCircle, Wrench
} from 'lucide-react';
import { RenoPackLogo } from '@/components/layout/AppLayout';

const ALEX_AREAS = [
  'المنتزه', 'سيدي جابر', 'سموحة', 'العجمي', 'المنشية',
  'كليوباترا', 'ميامي', 'الإبراهيمية', 'سيدي بشر', 'الشاطبي',
  'الدخيلة', 'العامرية', 'بيكوزي', 'مصطفى كامل', 'المزاريطة',
  'زيزينيا', 'الورديان', 'البيطاش', 'كرموز', 'باب شرق'
];

const STEP_LABELS = ['السيارة', 'الباكدج', 'التركيب', 'الدفع', 'التأكيد'];

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  carModel: string;
  carYear: number;
  installationType: 'workshop' | 'home';
  workshopId: number | null;
  workshopName: string;
  workshopArea: string;
  deliveryAddress: string;
  deliveryArea: string;
  paymentMethod: 'cash' | 'card';
}

export default function Checkout() {
  const [, params] = useRoute('/checkout/:id');
  const packageId = params?.id ? parseInt(params.id, 10) : 0;
  const [, setLocation] = useLocation();
  const { user, getAuthHeaders } = useAuth();
  const { toast } = useToast();

  const { data: packages, isLoading: isLoadingPackages } = useListPackages();
  const pkg = packages?.find(p => p.id === packageId);

  const [step, setStep] = useState<Step>(1);
  const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    carModel: user?.carModel ?? '',
    carYear: user?.carYear ?? new Date().getFullYear(),
    installationType: 'workshop',
    workshopId: null,
    workshopName: '',
    workshopArea: '',
    deliveryAddress: '',
    deliveryArea: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    if (user?.carModel && !formData.carModel) {
      setFormData(f => ({ ...f, carModel: user.carModel ?? '' }));
    }
  }, [user]);

  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: async (order) => {
        setConfirmedOrderId(order.id);
        if (formData.paymentMethod === 'cash') {
          setStep(5);
        } else {
          setIsRedirectingToPayment(true);
          try {
            await initiatePaymentAsync({ data: { orderId: order.id } });
          } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذّر تهيئة بوابة الدفع. حاول لاحقاً.' });
            setIsRedirectingToPayment(false);
          }
        }
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء تأكيد الطلب. حاول مرة أخرى.' });
      },
    },
  });

  const { mutateAsync: initiatePaymentAsync } = useInitiatePayment({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: (data) => {
        window.location.href = data.iframeUrl;
      },
      onError: () => {
        setIsRedirectingToPayment(false);
        toast({ variant: 'destructive', title: 'خطأ في بوابة الدفع', description: 'تواصل مع الدعم الفني لإتمام الدفع.' });
      },
    },
  });

  if (!user) {
    setLocation('/login?redirect=/checkout/' + packageId);
    return null;
  }

  if (isLoadingPackages) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-xl font-bold">الباكدج غير موجود</p>
        <Link href="/packages" className="text-primary underline mt-4 block">تصفح الباكدجات</Link>
      </div>
    );
  }

  const canAdvanceStep1 = formData.carModel.trim().length > 0 && formData.carYear > 1990;
  const canAdvanceStep3 =
    (formData.installationType === 'workshop' && formData.workshopId !== null) ||
    (formData.installationType === 'home' && formData.deliveryAddress.trim().length > 3 && formData.deliveryArea.length > 0);

  const handleConfirmOrder = () => {
    createOrder({
      data: {
        packageId: pkg.id,
        carModel: formData.carModel,
        carYear: Number(formData.carYear),
        paymentMethod: formData.paymentMethod,
        workshopId: formData.installationType === 'workshop' ? formData.workshopId ?? undefined : undefined,
        deliveryAddress: formData.installationType === 'home' ? formData.deliveryAddress : undefined,
        deliveryArea: formData.installationType === 'home' ? formData.deliveryArea : undefined,
      },
    });
  };

  return (
    <div className="bg-secondary/20 min-h-screen pb-24 pt-12">
      <div className="max-w-4xl mx-auto px-4">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, gap: 12 }}>
          <RenoPackLogo size="md" />
          <h1 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 26, fontWeight: 800, color: '#E8F0F8', margin: 0 }}>إتمام الطلب</h1>
        </div>

        <StepProgress step={step} />

        <div className="grid md:grid-cols-3 gap-8 mt-10">
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-border/50">

              {step === 1 && (
                <Step1Car
                  formData={formData}
                  onChange={setFormData}
                  onNext={() => setStep(2)}
                  canAdvance={canAdvanceStep1}
                />
              )}

              {step === 2 && (
                <Step2Package
                  pkg={pkg}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}

              {step === 3 && (
                <Step3Installation
                  formData={formData}
                  onChange={setFormData}
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                  canAdvance={canAdvanceStep3}
                />
              )}

              {step === 4 && (
                <Step4Payment
                  formData={formData}
                  onChange={setFormData}
                  onConfirm={handleConfirmOrder}
                  onBack={() => setStep(3)}
                  isPending={isCreatingOrder || isRedirectingToPayment}
                />
              )}

              {step === 5 && confirmedOrderId && (
                <Step5Confirmation
                  orderId={confirmedOrderId}
                  paymentMethod={formData.paymentMethod}
                />
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <OrderSummary pkg={pkg} formData={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepProgress({ step }: { step: Step }) {
  const icons = [CarFront, Package2, Wrench, CreditCard, CheckCircle2];
  return (
    <div className="flex justify-between items-center relative px-2">
      <div className="absolute top-6 left-0 right-0 h-1 bg-border -z-10" />
      <div
        className="absolute top-6 right-0 h-1 bg-primary -z-10 transition-all duration-500"
        style={{ width: `${((step - 1) / (STEP_LABELS.length - 1)) * 100}%` }}
      />
      {STEP_LABELS.map((label, i) => {
        const num = (i + 1) as Step;
        const Icon = icons[i];
        const isDone = step > num;
        const isActive = step === num;
        return (
          <div key={num} className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
              isDone ? 'bg-green-500 text-white' :
              isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' :
              'bg-white text-muted-foreground border-2 border-border'
            }`}>
              {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-bold hidden sm:block ${isActive ? 'text-primary' : isDone ? 'text-green-600' : 'text-muted-foreground'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Step1Car({ formData, onChange, onNext, canAdvance }: {
  formData: FormData;
  onChange: (f: FormData) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-foreground">بيانات السيارة</h2>
      <div className="space-y-4">
        <div>
          <Label className="font-bold">موديل السيارة</Label>
          <Input
            value={formData.carModel}
            onChange={e => onChange({ ...formData, carModel: e.target.value })}
            className="h-12 rounded-xl mt-1"
            placeholder="مثال: رينو لوجان 2018"
          />
        </div>
        <div>
          <Label className="font-bold">سنة الصنع</Label>
          <Input
            type="number"
            value={formData.carYear}
            onChange={e => onChange({ ...formData, carYear: parseInt(e.target.value) || 2020 })}
            className="h-12 rounded-xl mt-1"
            dir="ltr"
            min={1990}
            max={new Date().getFullYear() + 1}
          />
        </div>
      </div>
      <Button className="w-full h-14 rounded-xl font-bold text-lg" onClick={onNext} disabled={!canAdvance}>
        متابعة لاختيار الباكدج
      </Button>
    </div>
  );
}

function Step2Package({ pkg, onNext, onBack }: {
  pkg: { id: number; name: string; description?: string | null; sellPrice: string | number; warrantyMonths: number };
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-foreground">الباكدج المختار</h2>
      <div className="bg-primary/5 border-2 border-primary rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
            <Package2 className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-primary">{pkg.name}</h3>
            {pkg.description && (
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{pkg.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <span className="bg-accent/80 text-primary font-black px-3 py-1 rounded-full text-sm">
                {Number(pkg.sellPrice).toLocaleString('ar-EG')} ج.م
              </span>
              <span className="text-sm text-muted-foreground">ضمان {pkg.warrantyMonths} شهور</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <Button variant="outline" className="w-1/3 h-14 rounded-xl font-bold" onClick={onBack}>رجوع</Button>
        <Button className="w-2/3 h-14 rounded-xl font-bold text-lg" onClick={onNext}>متابعة للتركيب</Button>
      </div>
    </div>
  );
}

type WorkshopRow = { id: number; name: string; area: string; address: string; lat?: number | null; lng?: number | null; rating?: number | null; partnershipStatus?: string | null };

function Step3Installation({ formData, onChange, onNext, onBack, canAdvance }: {
  formData: FormData;
  onChange: (f: FormData) => void;
  onNext: () => void;
  onBack: () => void;
  canAdvance: boolean;
}) {
  const [filterArea, setFilterArea] = useState('');

  const workshopParams = filterArea ? { area: filterArea } : undefined;
  const { data: workshops, isLoading: isLoadingWorkshops } = useListWorkshops(
    workshopParams,
    { query: { queryKey: getListWorkshopsQueryKey(workshopParams) } }
  );

  const handleSelectWorkshop = (workshop: WorkshopRow) => {
    onChange({ ...formData, workshopId: workshop.id, workshopName: workshop.name, workshopArea: workshop.area });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-foreground">طريقة التركيب</h2>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onChange({ ...formData, installationType: 'workshop', workshopId: null, workshopName: '', workshopArea: '' })}
          className={`p-4 rounded-2xl border-2 text-center transition-all ${
            formData.installationType === 'workshop'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/50'
          }`}
        >
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <span className="font-bold text-sm">في الورشة</span>
        </button>
        <button
          onClick={() => onChange({ ...formData, installationType: 'home', workshopId: null, workshopName: '', workshopArea: '' })}
          className={`p-4 rounded-2xl border-2 text-center transition-all ${
            formData.installationType === 'home'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/50'
          }`}
        >
          <Home className="w-8 h-8 mx-auto mb-2" />
          <span className="font-bold text-sm">توصيل للبيت</span>
        </button>
      </div>

      {formData.installationType === 'workshop' ? (
        <WorkshopPicker
          workshops={workshops ?? []}
          isLoading={isLoadingWorkshops}
          selected={formData.workshopId}
          filterArea={filterArea}
          onFilterAreaChange={setFilterArea}
          onSelect={handleSelectWorkshop}
        />
      ) : (
        <HomePicker
          address={formData.deliveryAddress}
          area={formData.deliveryArea}
          onAddressChange={v => onChange({ ...formData, deliveryAddress: v })}
          onAreaChange={v => onChange({ ...formData, deliveryArea: v })}
        />
      )}

      <div className="flex gap-4 mt-8">
        <Button variant="outline" className="w-1/3 h-14 rounded-xl font-bold" onClick={onBack}>رجوع</Button>
        <Button className="w-2/3 h-14 rounded-xl font-bold text-lg" onClick={onNext} disabled={!canAdvance}>
          متابعة للدفع
        </Button>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-yellow-500">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'fill-yellow-400' : 'fill-gray-200'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-muted-foreground mr-1">{rating.toFixed(1)}</span>
    </span>
  );
}

function WorkshopPicker({ workshops, isLoading, selected, filterArea, onFilterAreaChange, onSelect }: {
  workshops: WorkshopRow[];
  isLoading: boolean;
  selected: number | null;
  filterArea: string;
  onFilterAreaChange: (area: string) => void;
  onSelect: (workshop: WorkshopRow) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="font-bold">اختر الورشة الأقرب لك</Label>
        <span className="text-xs text-green-600 font-medium">الورش المتاحة فقط</span>
      </div>

      <div>
        <select
          value={filterArea}
          onChange={e => onFilterAreaChange(e.target.value)}
          className="w-full h-10 rounded-xl border border-border px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">جميع مناطق الإسكندرية</option>
          {ALEX_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <WorkshopMap workshops={workshops} selected={selected} onSelect={w => onSelect(w)} />

      <div className="grid gap-3 max-h-56 overflow-y-auto">
        {isLoading && (
          <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></div>
        )}
        {!isLoading && workshops.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">لا توجد ورش متاحة في هذه المنطقة</p>
        )}
        {workshops.map(w => (
          <div
            key={w.id}
            onClick={() => onSelect(w)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selected === w.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <MapPin className={`w-5 h-5 flex-shrink-0 mt-0.5 ${selected === w.id ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-foreground text-sm">{w.name}</h4>
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">متاحة</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{w.area} — {w.address}</p>
                {w.rating != null && w.rating > 0 && (
                  <div className="mt-1"><StarRating rating={w.rating} /></div>
                )}
              </div>
              {selected === w.id && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkshopMap({ workshops, selected, onSelect }: {
  workshops: WorkshopRow[];
  selected: number | null;
  onSelect: (workshop: WorkshopRow) => void;
}) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<import('leaflet').Map | null>(null);
  const markersLayerRef = React.useRef<import('leaflet').LayerGroup | null>(null);
  const LRef = React.useRef<typeof import('leaflet') | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (cancelled || !mapRef.current) return;

      LRef.current = L;

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const leafletMap = L.map(mapRef.current).setView([31.2001, 29.9187], 12);
      mapInstanceRef.current = leafletMap;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(leafletMap);

      const layer = L.layerGroup().addTo(leafletMap);
      markersLayerRef.current = layer;

      if (!cancelled) setMapReady(true);
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const L = LRef.current;
    const layer = markersLayerRef.current;
    if (!mapReady || !L || !layer) return;

    layer.clearLayers();

    workshops.forEach(w => {
      if (w.lat && w.lng) {
        const marker = L.marker([Number(w.lat), Number(w.lng)]).addTo(layer);
        marker.bindPopup(`<b>${w.name}</b><br>${w.area}`);
        marker.on('click', () => onSelect(w));
      }
    });
  }, [workshops, onSelect, mapReady]);

  return (
    <div className="rounded-xl overflow-hidden border border-border h-48">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

function HomePicker({ address, area, onAddressChange, onAreaChange }: {
  address: string;
  area: string;
  onAddressChange: (v: string) => void;
  onAreaChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="font-bold">المنطقة</Label>
        <select
          value={area}
          onChange={e => onAreaChange(e.target.value)}
          className="w-full h-12 rounded-xl border border-border px-3 mt-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">اختر منطقتك في الإسكندرية</option>
          {ALEX_AREAS.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
      <div>
        <Label className="font-bold">العنوان بالتفصيل</Label>
        <Input
          value={address}
          onChange={e => onAddressChange(e.target.value)}
          className="h-12 rounded-xl mt-1"
          placeholder="الشارع، رقم العمارة، الدور..."
        />
      </div>
    </div>
  );
}

function Step4Payment({ formData, onChange, onConfirm, onBack, isPending }: {
  formData: FormData;
  onChange: (f: FormData) => void;
  onConfirm: () => void;
  onBack: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-foreground">طريقة الدفع</h2>

      <div className="grid gap-4">
        <button
          onClick={() => onChange({ ...formData, paymentMethod: 'cash' })}
          className={`p-6 rounded-2xl border-2 text-right flex items-center gap-4 transition-all ${
            formData.paymentMethod === 'cash'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/50'
          }`}
        >
          <Banknote className="w-8 h-8 flex-shrink-0" />
          <div>
            <div className="font-bold text-lg">كاش عند الاستلام</div>
            <div className="text-sm opacity-75">يُؤكَّد الطلب فوراً — الدفع نقداً عند التركيب</div>
          </div>
          {formData.paymentMethod === 'cash' && <CheckCircle2 className="w-6 h-6 mr-auto flex-shrink-0" />}
        </button>

        <button
          onClick={() => onChange({ ...formData, paymentMethod: 'card' })}
          className={`p-6 rounded-2xl border-2 text-right flex items-center gap-4 transition-all ${
            formData.paymentMethod === 'card'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/50'
          }`}
        >
          <CreditCard className="w-8 h-8 flex-shrink-0" />
          <div>
            <div className="font-bold text-lg">بطاقة بنكية (PayMob)</div>
            <div className="text-sm opacity-75">دفع إلكتروني آمن عبر بوابة PayMob</div>
          </div>
          {formData.paymentMethod === 'card' && <CheckCircle2 className="w-6 h-6 mr-auto flex-shrink-0" />}
        </button>
      </div>

      {formData.paymentMethod === 'card' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          سيتم تحويلك لبوابة الدفع الآمنة لإتمام العملية. يعود تأكيد الطلب تلقائياً بعد نجاح الدفع.
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <Button variant="outline" className="w-1/3 h-14 rounded-xl font-bold" onClick={onBack} disabled={isPending}>
          رجوع
        </Button>
        <Button
          className="w-2/3 h-14 rounded-xl font-bold text-lg bg-accent text-primary hover:bg-accent/90 shadow-lg shadow-accent/20"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {formData.paymentMethod === 'card' ? 'جارٍ التحويل...' : 'جارٍ التأكيد...'}
            </span>
          ) : (
            formData.paymentMethod === 'card' ? 'المتابعة للدفع' : 'تأكيد الطلب'
          )}
        </Button>
      </div>
    </div>
  );
}

function Step5Confirmation({ orderId, paymentMethod }: { orderId: number; paymentMethod: string }) {
  return (
    <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 py-4">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-14 h-14 text-green-500" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-green-700 mb-2">تم تأكيد الطلب!</h2>
        <p className="text-muted-foreground">رقم الطلب: <span className="font-bold text-foreground">#{orderId}</span></p>
        {paymentMethod === 'cash' && (
          <p className="text-sm text-muted-foreground mt-2">سيتواصل معك فريقنا لتحديد موعد التركيب.</p>
        )}
      </div>
      <div className="flex gap-4 justify-center pt-4">
        <Link href={`/orders/${orderId}`}>
          <Button variant="outline" className="rounded-xl px-6">تفاصيل الطلب</Button>
        </Link>
        <Link href="/my-orders">
          <Button className="rounded-xl px-6">طلباتي</Button>
        </Link>
      </div>
    </div>
  );
}

function OrderSummary({
  pkg, formData
}: {
  pkg: { name: string; sellPrice: string | number; warrantyMonths: number };
  formData: FormData;
}) {
  return (
    <div className="bg-primary text-white rounded-3xl p-6 shadow-xl sticky top-28 border border-white/10">
      <h3 className="font-bold text-accent mb-5 text-lg">ملخص الطلب</h3>
      <div className="space-y-4 mb-6">
        <SummaryRow label="الباكدج" value={pkg.name} />
        {formData.carModel && <SummaryRow label="السيارة" value={`${formData.carModel} (${formData.carYear})`} />}
        {formData.installationType === 'workshop' && formData.workshopName && (
          <SummaryRow label="الورشة" value={`${formData.workshopName} — ${formData.workshopArea}`} />
        )}
        {formData.installationType === 'home' && formData.deliveryArea && (
          <SummaryRow label="التوصيل" value={formData.deliveryArea} />
        )}
        <SummaryRow label="الضمان" value={`${pkg.warrantyMonths} شهور`} />
      </div>
      <div className="pt-5 border-t border-white/20">
        <div className="flex justify-between items-center text-xl font-black">
          <span>الإجمالي</span>
          <span className="text-accent">{Number(pkg.sellPrice).toLocaleString('ar-EG')} ج.م</span>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/50 text-xs mb-0.5">{label}</p>
      <p className="font-semibold text-sm leading-snug">{value}</p>
    </div>
  );
}
