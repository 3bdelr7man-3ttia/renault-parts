import React, { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useListPackages, useCreateOrder, useInitiatePayment } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { usePartCart } from '@/lib/part-cart-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MapPin, CreditCard, CarFront, Loader2, CheckCircle2, Package2,
  Home, AlertCircle, Store, Upload, ImageIcon, XCircle, ChevronDown, Car, Clock
} from 'lucide-react';
import { RenoPackLogo } from '@/components/layout/AppLayout';
import { RENAULT_MODELS, CAR_YEARS, useCar } from '@/lib/car-context';

const G = '#C8974A';
const NV = '#1A2356';
const BG = '#0D1220';
const B2 = '#111826';
const B3 = '#161E30';

const ALEX_AREAS = [
  'المنتزه', 'سيدي جابر', 'سموحة', 'العجمي', 'المنشية',
  'كليوباترا', 'ميامي', 'الإبراهيمية', 'سيدي بشر', 'الشاطبي',
  'الدخيلة', 'العامرية', 'بيكوزي', 'مصطفى كامل', 'المزاريطة',
  'زيزينيا', 'الورديان', 'البيطاش', 'كرموز', 'باب شرق',
];

const STEP_LABELS = ['السيارة', 'الباكدج', 'الاستلام', 'الدفع', 'التأكيد'];
type Step = 1 | 2 | 3 | 4 | 5;

type PayMethod = 'card' | 'vodafone_cash' | 'instapay';
type PickupType = 'pickup' | 'delivery';

interface FormData {
  carModel: string;
  carYear: number;
  pickupType: PickupType;
  deliveryAddress: string;
  deliveryArea: string;
  deliveryPhone: string;
  paymentMethod: PayMethod;
  vodafonePhone: string;
}

export default function Checkout() {
  const [, params] = useRoute('/checkout/:id');
  const isCustom = params?.id === 'custom';
  const paramId = params?.id ?? '';
  const packageId = !isCustom && paramId ? parseInt(paramId, 10) : 0;
  const [, setLocation] = useLocation();
  const { user, getAuthHeaders } = useAuth();
  const { car: contextCar } = useCar();
  const { toast } = useToast();
  const { clear: clearPartCart } = usePartCart();

  const customPuzzle = isCustom ? (() => {
    try { return JSON.parse(sessionStorage.getItem('customPuzzle') || 'null'); } catch { return null; }
  })() : null;

  const virtualPkg = isCustom && customPuzzle ? {
    id: -1,
    name: 'باكدج مخصص من البازل',
    slug: 'custom',
    description: `يحتوي على: ${customPuzzle.parts.map((p: any) => p.label).join('، ')}`,
    kmService: 0,
    basePrice: customPuzzle.total as number,
    sellPrice: customPuzzle.total as number,
    warrantyMonths: 3,
    parts: customPuzzle.parts.map((p: any, i: number) => ({
      id: i, name: p.label, oemCode: null, type: 'custom' as const,
      priceOriginal: p.price, priceTurkish: null, priceChinese: null,
      compatibleModels: null, supplier: null,
    })),
    createdAt: new Date(),
  } : null;

  const [isRegisteringCustomPkg, setIsRegisteringCustomPkg] = useState(false);

  const { data: packages, isLoading: isLoadingPackages } = useListPackages();
  const pkg = isCustom
    ? virtualPkg
    : packages?.find(p =>
        (packageId > 0 && p.id === packageId) ||
        p.slug === paramId
      );

  // Car info: prefer profile, then car-context (sessionStorage), then empty
  const resolvedCarModel = user?.carModel || contextCar?.model || '';
  const resolvedCarYear  = user?.carYear  || contextCar?.year  || new Date().getFullYear();
  const hasCar = !!(resolvedCarModel && resolvedCarYear);

  const [step, setStep] = useState<Step>(1);
  const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);

  type VariantType = 'orig' | 'turk' | 'chin';
  const [partSelections, setPartSelections] = useState<Record<number, VariantType>>({});
  const [selectedTotal, setSelectedTotal] = useState<number | null>(null);

  // Live-computed total that updates immediately as user picks variants in Step 2
  const liveTotal = React.useMemo<number | null>(() => {
    if (!pkg?.parts || pkg.parts.length === 0) return null;
    let total = 0;
    for (const part of pkg.parts as PartWithPrices[]) {
      const variants = getPartVariants(part);
      if (variants.length <= 1) {
        total += variants[0]?.price ?? 0;
      } else {
        const sel = partSelections[part.id];
        const found = sel ? variants.find(v => v.key === sel) : null;
        total += found ? found.price : (variants[0]?.price ?? 0);
      }
    }
    return total > 0 ? total : null;
  }, [pkg, partSelections]);

  const [formData, setFormData] = useState<FormData>({
    carModel: resolvedCarModel,
    carYear:  resolvedCarYear,
    pickupType: 'pickup',
    deliveryAddress: user?.address ?? '',
    deliveryArea: user?.area ?? '',
    deliveryPhone: user?.phone ?? '',
    paymentMethod: 'card',
    vodafonePhone: user?.phone ?? '',
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [receiptUploadState, setReceiptUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (resolvedCarModel && !formData.carModel) {
      setFormData(f => ({ ...f, carModel: resolvedCarModel, carYear: resolvedCarYear }));
    }
  }, [user, contextCar]);

  const autoUploadReceipt = async (orderId: number, file: File) => {
    setReceiptUploadState('uploading');
    try {
      const fd = new FormData();
      fd.append('receipt', file);
      const authToken = getAuthHeaders().headers?.Authorization;
      const res = await fetch(`/api/orders/${orderId}/receipt`, {
        method: 'POST',
        headers: { ...(authToken ? { Authorization: authToken } : {}) },
        body: fd,
      });
      if (!res.ok) throw new Error('فشل الرفع');
      setReceiptUploadState('done');
      toast({ title: '✅ تم رفع إيصال التحويل', description: 'سيتم مراجعته وتفعيل طلبك قريباً.' });
    } catch {
      setReceiptUploadState('error');
      toast({ variant: 'destructive', title: 'تنبيه', description: 'تم تأكيد الطلب — لكن فشل رفع الإيصال. ارفعه من صفحة الطلب.' });
    }
  };

  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: async (order) => {
        setConfirmedOrderId(order.id);
        clearPartCart();
        sessionStorage.removeItem('customPuzzle');
        if (formData.paymentMethod === 'card') {
          setIsRedirectingToPayment(true);
          try {
            await initiatePaymentAsync({ data: { orderId: order.id } });
          } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذّر تهيئة بوابة الدفع. حاول لاحقاً.' });
            setIsRedirectingToPayment(false);
            setStep(5);
          }
        } else {
          setStep(5);
          if (receiptFile) {
            await autoUploadReceipt(order.id, receiptFile);
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
      onSuccess: (data) => { window.location.href = data.iframeUrl; },
      onError: () => {
        setIsRedirectingToPayment(false);
        setStep(5);
        toast({ variant: 'destructive', title: 'خطأ في بوابة الدفع', description: 'تواصل مع الدعم الفني.' });
      },
    },
  });

  if (!user) { setLocation('/login?redirect=/checkout/' + (isCustom ? 'custom' : paramId)); return null; }

  if (!isCustom && isLoadingPackages) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ color: G, width: 40, height: 40 }} className="animate-spin" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: "'Almarai',sans-serif" }}>
        <AlertCircle style={{ color: '#ef4444', width: 48, height: 48 }} />
        <p style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
          {isCustom ? 'لم يتم العثور على بيانات الباكدج المخصص' : 'الباكدج غير موجود'}
        </p>
        <Link href="/packages" style={{ color: G, fontWeight: 700 }}>تصفح الباكدجات</Link>
      </div>
    );
  }

  const canAdvanceStep1 = formData.carModel.trim().length > 0 && formData.carYear > 1990;
  const canAdvanceStep3 =
    formData.pickupType === 'pickup' ||
    (formData.deliveryAddress.trim().length > 3 && formData.deliveryArea.length > 0);

  const buildOrderData = (realPackageId: number) => ({
    packageId: realPackageId,
    carModel: formData.carModel || (user?.carModel ?? ''),
    carYear: Number(formData.carYear) || (user?.carYear ?? 2020),
    paymentMethod: formData.paymentMethod,
    deliveryAddress: formData.pickupType === 'delivery'
      ? formData.deliveryAddress
      : 'استلام من مركز التوزيع',
    deliveryArea: formData.pickupType === 'delivery'
      ? formData.deliveryArea
      : 'الإسكندرية',
    notes: formData.paymentMethod === 'vodafone_cash'
      ? `فودافون كاش - ${formData.vodafonePhone}`
      : formData.paymentMethod === 'instapay'
      ? 'انستاباى'
      : undefined,
  });

  const handleConfirmOrder = async () => {
    if (isCustom && customPuzzle) {
      setIsRegisteringCustomPkg(true);
      try {
        const res = await fetch('/api/packages/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(getAuthHeaders().headers ?? {}) },
          body: JSON.stringify({ parts: customPuzzle.parts, total: customPuzzle.total }),
        });
        if (!res.ok) throw new Error('فشل إنشاء الباكدج');
        const { packageId: realId } = await res.json();
        setIsRegisteringCustomPkg(false);
        createOrder({ data: buildOrderData(realId) });
      } catch {
        setIsRegisteringCustomPkg(false);
        toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء إنشاء الباكدج. حاول مرة أخرى.' });
      }
    } else {
      createOrder({ data: buildOrderData(pkg.id) });
    }
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 80, paddingTop: 40, fontFamily: "'Almarai',sans-serif", direction: 'rtl' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, gap: 10 }}>
          <RenoPackLogo size="md" />
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0 }}>إتمام الطلب</h1>
        </div>

        <StepProgress step={step} userHasCar={hasCar} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, marginTop: 32 }} className="checkout-grid">
          <div>
            <div style={{ background: B2, borderRadius: 24, border: `1px solid ${G}20`, padding: 28 }}>

              {step === 1 && (
                <Step1Car
                  formData={formData}
                  onChange={setFormData}
                  onNext={() => setStep(2)}
                  canAdvance={canAdvanceStep1}
                  carKnown={hasCar}
                />
              )}

              {step === 2 && (
                <Step2Package
                  pkg={pkg}
                  partSelections={partSelections}
                  onSelectPart={(partId, variant) => setPartSelections(s => ({ ...s, [partId]: variant }))}
                  onNext={(total) => { setSelectedTotal(total); setStep(3); }}
                  onBack={() => setStep(1)}
                  userHasCar={hasCar}
                  user={user}
                />
              )}

              {step === 3 && (
                <Step3Pickup
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
                  isPending={isCreatingOrder || isRedirectingToPayment || isRegisteringCustomPkg}
                  pkg={pkg}
                  receiptFile={receiptFile}
                  receiptPreviewUrl={receiptPreviewUrl}
                  onReceiptSelect={(file) => {
                    setReceiptFile(file);
                    setReceiptPreviewUrl(file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
                  }}
                />
              )}

              {step === 5 && confirmedOrderId && (
                <Step5Confirmation
                  orderId={confirmedOrderId}
                  paymentMethod={formData.paymentMethod}
                  pickupType={formData.pickupType}
                  autoUploadState={receiptUploadState}
                />
              )}
            </div>
          </div>

          <div>
            <OrderSummary pkg={pkg} formData={formData} user={user} selectedTotal={selectedTotal ?? liveTotal} />
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 700px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function StepProgress({ step, userHasCar }: { step: Step; userHasCar: boolean }) {
  const icons = [CarFront, Package2, Store, CreditCard, CheckCircle2];
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0 8px' }}>
      <div style={{ position: 'absolute', top: 22, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.08)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 22, right: 0, height: 2, background: G, zIndex: 1, width: `${((step - 1) / 4) * 100}%`, transition: 'width 0.4s ease' }} />
      {STEP_LABELS.map((label, i) => {
        const num = (i + 1) as Step;
        const Icon = icons[i];
        const isDone = step > num;
        const isActive = step === num;
        const isSkipped = num === 1 && userHasCar && step > 1;
        return (
          <div key={num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 15, transition: 'all 0.3s',
              background: isDone || isSkipped ? '#22c55e' : isActive ? G : 'rgba(255,255,255,0.06)',
              color: isDone || isSkipped ? '#fff' : isActive ? NV : 'rgba(255,255,255,0.3)',
              border: `2px solid ${isDone || isSkipped ? '#22c55e' : isActive ? G : 'rgba(255,255,255,0.1)'}`,
              boxShadow: isActive ? `0 0 20px ${G}50` : 'none',
            }}>
              {isDone || isSkipped ? <CheckCircle2 size={20} /> : <Icon size={18} />}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: isActive ? G : isDone || isSkipped ? '#22c55e' : 'rgba(255,255,255,0.3)',
              whiteSpace: 'nowrap'
            }}>
              {label}{isSkipped ? ' ✓' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = 'primary', style: extraStyle = {} }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  variant?: 'primary' | 'outline'; style?: React.CSSProperties;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '14px 24px', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
      border: variant === 'outline' ? '2px solid rgba(255,255,255,0.15)' : 'none',
      background: variant === 'outline' ? 'transparent' : disabled ? '#333' : G,
      color: variant === 'outline' ? 'rgba(255,255,255,0.6)' : disabled ? '#666' : NV,
      fontFamily: "'Almarai',sans-serif", transition: 'opacity 0.2s', opacity: 1,
      ...extraStyle,
    }}>
      {children}
    </button>
  );
}

const MODEL_ICONS: Record<string, string> = {
  'Renault Logan':   '🚗', 'Renault Symbol':  '🚗', 'Renault Duster':  '🚙',
  'Renault Megane':  '🏎️', 'Renault Clio':    '🚗', 'Renault Fluence': '🚗',
  'Renault Sandero': '🚗', 'Renault Kwid':    '🚗', 'Renault Captur':  '🚙',
};

function Step1Car({ formData, onChange, onNext, canAdvance, carKnown }: {
  formData: FormData; onChange: (f: FormData) => void; onNext: () => void; canAdvance: boolean; carKnown?: boolean;
}) {
  const [changing, setChanging] = React.useState(false);
  const SHORT = (m: string) => m.replace('Renault ', '');
  const gridModels = RENAULT_MODELS.slice(0, 6);
  const moreModels = RENAULT_MODELS.slice(6);
  const recentYears = CAR_YEARS.slice(0, 8);
  const olderYears = CAR_YEARS.slice(8);

  if (carKnown && !changing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>سيارتك</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>اتحددت تلقائياً من بياناتك</p>
        </div>

        <div style={{ background: `${G}0D`, border: `2px solid ${G}50`, borderRadius: 20, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontSize: 48 }}>{MODEL_ICONS[formData.carModel] ?? '🚗'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#E8F0F8', marginBottom: 4 }}>{formData.carModel}</div>
            <div style={{ fontSize: 14, color: G, fontWeight: 700 }}>إصدار {formData.carYear}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: 'rgba(34,197,94,0.15)' }}>
            <CheckCircle2 size={22} color="#22c55e" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onNext} style={{ flex: 1 }}>
            هذه سيارتي — متابعة
          </Btn>
          <button
            onClick={() => setChanging(true)}
            style={{
              padding: '14px 18px', borderRadius: 14, fontSize: 13, fontWeight: 800, cursor: 'pointer',
              border: '1.5px solid rgba(255,255,255,0.15)', background: 'transparent',
              color: 'rgba(255,255,255,0.55)', fontFamily: "'Almarai',sans-serif",
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}
          >
            <Car size={14} color={G} /> تغيير السيارة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>اختار سيارتك</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>نضمن لك الباكدج المناسب لموديل وسنة سيارتك بالتحديد</p>
        </div>
        {carKnown && changing && (
          <button onClick={() => setChanging(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: "'Almarai',sans-serif", paddingTop: 4 }}>
            إلغاء ←
          </button>
        )}
      </div>

      {/* ── Model selector ── */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
          <Car size={14} color={G} /> الموديل
          {formData.carModel && (
            <span style={{ marginRight: 6, background: `${G}18`, border: `1px solid ${G}40`, borderRadius: 999, padding: '2px 10px', fontSize: 11, color: G }}>
              {SHORT(formData.carModel)} ✓
            </span>
          )}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
          {gridModels.map(model => {
            const active = formData.carModel === model;
            return (
              <button
                key={model}
                onClick={() => onChange({ ...formData, carModel: model })}
                style={{
                  padding: '12px 8px', borderRadius: 14, cursor: 'pointer',
                  border: `1.5px solid ${active ? G : 'rgba(255,255,255,0.07)'}`,
                  background: active ? `${G}14` : 'rgba(255,255,255,0.025)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  transition: 'all .18s', fontFamily: "'Almarai',sans-serif",
                  boxShadow: active ? `0 0 18px ${G}22` : 'none',
                }}
              >
                <span style={{ fontSize: 22 }}>{MODEL_ICONS[model] ?? '🚗'}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: active ? G : '#7A95AA', lineHeight: 1.3 }}>{SHORT(model)}</span>
                {active && <span style={{ fontSize: 8, color: G }}>✓</span>}
              </button>
            );
          })}
        </div>
        {moreModels.length > 0 && (
          <div style={{ position: 'relative' }}>
            <select
              value={moreModels.includes(formData.carModel) ? formData.carModel : ''}
              onChange={e => { if (e.target.value) onChange({ ...formData, carModel: e.target.value }); }}
              style={{ width: '100%', appearance: 'none', background: B3, border: `1.5px solid ${moreModels.includes(formData.carModel) ? G : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, padding: '10px 40px 10px 14px', color: moreModels.includes(formData.carModel) ? G : 'rgba(255,255,255,0.35)', fontSize: 13, fontFamily: "'Almarai',sans-serif", fontWeight: 700, outline: 'none', cursor: 'pointer', direction: 'rtl' }}
            >
              <option value="">موديل آخر...</option>
              {moreModels.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={14} color="#7A95AA" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        )}
      </div>

      {/* ── Year selector ── */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
          <span style={{ fontSize: 14 }}>📅</span> سنة الصنع
          {formData.carYear > 0 && (
            <span style={{ marginRight: 6, background: `${G}18`, border: `1px solid ${G}40`, borderRadius: 999, padding: '2px 10px', fontSize: 11, color: G }}>
              {formData.carYear} ✓
            </span>
          )}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginBottom: 8 }}>
          {recentYears.map(year => {
            const active = formData.carYear === year;
            return (
              <button
                key={year}
                onClick={() => onChange({ ...formData, carYear: year })}
                style={{
                  padding: '10px 4px', borderRadius: 12, cursor: 'pointer',
                  border: `1.5px solid ${active ? G : 'rgba(255,255,255,0.07)'}`,
                  background: active ? `${G}14` : 'rgba(255,255,255,0.025)',
                  fontSize: 13, fontWeight: 800, color: active ? G : '#7A95AA',
                  transition: 'all .18s', fontFamily: "'Almarai',sans-serif",
                  boxShadow: active ? `0 0 14px ${G}22` : 'none',
                }}
              >
                {year}
              </button>
            );
          })}
        </div>
        {olderYears.length > 0 && (
          <div style={{ position: 'relative' }}>
            <select
              value={olderYears.includes(formData.carYear) ? formData.carYear : ''}
              onChange={e => { if (e.target.value) onChange({ ...formData, carYear: Number(e.target.value) }); }}
              style={{ width: '100%', appearance: 'none', background: B3, border: `1.5px solid ${olderYears.includes(formData.carYear) ? G : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, padding: '10px 40px 10px 14px', color: olderYears.includes(formData.carYear) ? G : 'rgba(255,255,255,0.35)', fontSize: 13, fontFamily: "'Almarai',sans-serif", fontWeight: 700, outline: 'none', cursor: 'pointer', direction: 'rtl' }}
            >
              <option value="">سنة أقدم...</option>
              {olderYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={14} color="#7A95AA" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        )}
      </div>

      {/* Selected summary card */}
      {formData.carModel && formData.carYear > 0 && (
        <div style={{ background: `${G}0A`, border: `1.5px solid ${G}35`, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28 }}>{MODEL_ICONS[formData.carModel] ?? '🚗'}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#E8F0F8' }}>{formData.carModel}</div>
            <div style={{ fontSize: 12, color: G, fontWeight: 700 }}>إصدار {formData.carYear}</div>
          </div>
          <CheckCircle2 size={20} color={G} style={{ marginRight: 'auto' }} />
        </div>
      )}

      <Btn onClick={onNext} disabled={!canAdvance} style={{ width: '100%' }}>
        متابعة لاختيار الباكدج
      </Btn>
    </div>
  );
}

type VariantKey = 'orig' | 'turk' | 'chin';

interface PartWithPrices {
  id: number;
  name: string;
  priceOriginal?: number | null;
  priceTurkish?: number | null;
  priceChinese?: number | null;
}

const VARIANT_META: Record<VariantKey, { label: string; flag: string; color: string }> = {
  orig: { label: 'أصلي', flag: '🇫🇷', color: '#3B82F6' },
  turk: { label: 'تركي', flag: '🇹🇷', color: '#EF4444' },
  chin: { label: 'صيني', flag: '🇨🇳', color: '#E53935' },
};

function getPartVariants(part: PartWithPrices): { key: VariantKey; price: number }[] {
  const variants: { key: VariantKey; price: number }[] = [];
  if (part.priceOriginal != null && part.priceOriginal > 0) variants.push({ key: 'orig', price: part.priceOriginal });
  if (part.priceTurkish != null && part.priceTurkish > 0) variants.push({ key: 'turk', price: part.priceTurkish });
  if (part.priceChinese != null && part.priceChinese > 0) variants.push({ key: 'chin', price: part.priceChinese });
  return variants;
}

function Step2Package({ pkg, partSelections, onSelectPart, onNext, onBack, userHasCar, user }: {
  pkg: {
    id: number; name: string; description?: string | null;
    sellPrice: string | number; warrantyMonths: number;
    parts?: PartWithPrices[];
  };
  partSelections: Record<number, VariantKey>;
  onSelectPart: (partId: number, variant: VariantKey) => void;
  onNext: (total: number) => void;
  onBack: () => void;
  userHasCar: boolean;
  user: { carModel?: string | null; carYear?: number | null } | null;
}) {
  const partsWithVariants = (pkg.parts ?? []).filter(p => getPartVariants(p).length > 1);
  const partsFixed = (pkg.parts ?? []).filter(p => getPartVariants(p).length <= 1);

  const calcTotal = (): number => {
    let total = 0;
    for (const part of pkg.parts ?? []) {
      const variants = getPartVariants(part);
      if (variants.length <= 1) {
        total += variants[0]?.price ?? 0;
      } else {
        const sel = partSelections[part.id];
        const found = sel ? variants.find(v => v.key === sel) : null;
        total += found ? found.price : (variants[0]?.price ?? 0);
      }
    }
    return total;
  };

  const dynamicTotal = calcTotal();
  const allSelected = partsWithVariants.every(p => partSelections[p.id] !== undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>اختر نوع كل قطعة</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>حدد نوع القطعة (أصلي / تركي / صيني) حسب ميزانيتك</p>
      </div>

      {/* Package header */}
      <div style={{ background: `${G}10`, border: `1.5px solid ${G}35`, borderRadius: 18, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, background: `${G}22`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Package2 size={22} style={{ color: G }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: G }}>{pkg.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>ضمان {pkg.warrantyMonths} شهور</div>
        </div>
      </div>

      {/* Parts with multiple variants - require selection */}
      {partsWithVariants.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {partsWithVariants.map(part => {
            const variants = getPartVariants(part);
            const selected = partSelections[part.id] ?? variants[0]?.key;
            return (
              <div key={part.id} style={{ background: '#0F1928', border: `1.5px solid ${partSelections[part.id] ? `${G}40` : 'rgba(255,255,255,0.08)'}`, borderRadius: 18, padding: 16, transition: 'border-color 0.2s' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#D4E0EC', marginBottom: 12 }}>
                  {part.name}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {variants.map(v => {
                    const meta = VARIANT_META[v.key];
                    const isSelected = selected === v.key;
                    return (
                      <button
                        key={v.key}
                        onClick={() => onSelectPart(part.id, v.key)}
                        style={{
                          flex: 1, minWidth: 90,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          padding: '10px 12px', borderRadius: 14, cursor: 'pointer',
                          border: `2px solid ${isSelected ? meta.color : 'rgba(255,255,255,0.1)'}`,
                          background: isSelected ? `${meta.color}18` : 'rgba(255,255,255,0.03)',
                          transition: 'all 0.18s', fontFamily: "'Almarai',sans-serif",
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{meta.flag}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: isSelected ? meta.color : 'rgba(255,255,255,0.45)' }}>{meta.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                          {v.price.toLocaleString('ar-EG')} ج.م
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Parts with single/no variant - just display */}
      {partsFixed.length > 0 && (
        <div style={{ background: '#0F1928', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.35)', marginBottom: 10, letterSpacing: 0.5 }}>قطع بسعر ثابت</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {partsFixed.map(part => {
              const variants = getPartVariants(part);
              return (
                <div key={part.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#7A95AA' }}>{part.name}</span>
                  {variants.length === 1 && (
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#D4E0EC' }}>{variants[0].price.toLocaleString('ar-EG')} ج.م</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Car info */}
      {userHasCar && user && (
        <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <CheckCircle2 size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
            سيارتك: {user.carModel} — {user.carYear}
          </span>
        </div>
      )}

      {/* Dynamic total */}
      <div style={{ background: `${G}12`, border: `2px solid ${G}45`, borderRadius: 18, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>الإجمالي المتوقع</span>
        <span style={{ fontSize: 24, fontWeight: 900, color: G }}>
          {dynamicTotal > 0 ? `${dynamicTotal.toLocaleString('ar-EG')} ج.م` : '—'}
        </span>
      </div>

      {partsWithVariants.length > 0 && !allSelected && (
        <p style={{ fontSize: 12, color: '#E53935', fontWeight: 700, margin: 0, textAlign: 'center' }}>
          ⚠️ اختر نوع القطعة لكل العناصر أعلاه للمتابعة
        </p>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <Btn variant="outline" onClick={onBack} style={{ flex: '0 0 auto', paddingRight: 20, paddingLeft: 20 }}>رجوع</Btn>
        <Btn onClick={() => onNext(dynamicTotal)} style={{ flex: 1 }}>متابعة لاستلام الباكدج</Btn>
      </div>
    </div>
  );
}

function Step3Pickup({ formData, onChange, onNext, onBack, canAdvance }: {
  formData: FormData; onChange: (f: FormData) => void;
  onNext: () => void; onBack: () => void; canAdvance: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>استلام الباكدج</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>أنت تستلم الباكدج وتأخذه للورشة الخاصة بك</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { type: 'pickup' as PickupType, icon: <Store size={28} />, title: 'استلام من مركز التوزيع', desc: 'اجي استلم الباكدج من مركزنا في الإسكندرية مجاناً' },
          { type: 'delivery' as PickupType, icon: <Home size={28} />, title: 'توصيل للبيت', desc: 'نوصل الباكدج لحد بيتك في الإسكندرية' },
        ].map(opt => (
          <button
            key={opt.type}
            onClick={() => onChange({ ...formData, pickupType: opt.type })}
            style={{
              padding: 18, borderRadius: 18, border: `2px solid ${formData.pickupType === opt.type ? G : 'rgba(255,255,255,0.1)'}`,
              background: formData.pickupType === opt.type ? `${G}12` : 'rgba(255,255,255,0.03)',
              cursor: 'pointer', textAlign: 'right', transition: 'all 0.2s', fontFamily: "'Almarai',sans-serif",
            }}
          >
            <div style={{ color: formData.pickupType === opt.type ? G : 'rgba(255,255,255,0.3)', marginBottom: 10 }}>{opt.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: formData.pickupType === opt.type ? '#fff' : 'rgba(255,255,255,0.5)', marginBottom: 5 }}>{opt.title}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      {formData.pickupType === 'pickup' && (
        <div style={{ background: 'rgba(200,151,74,0.08)', border: `1px solid ${G}30`, borderRadius: 16, padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: G, marginBottom: 6 }}>📍 مركز التوزيع</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
            سيتم التواصل معك لتأكيد موعد الاستلام.<br />
            العنوان: الإسكندرية — سيتم إرسال التفاصيل على هاتفك.
          </p>
        </div>
      )}

      {formData.pickupType === 'delivery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>المنطقة</Label>
            <select
              value={formData.deliveryArea}
              onChange={e => onChange({ ...formData, deliveryArea: e.target.value })}
              style={{ width: '100%', height: 48, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: B3, color: formData.deliveryArea ? '#fff' : 'rgba(255,255,255,0.3)', padding: '0 14px', fontSize: 14, fontFamily: "'Almarai',sans-serif", outline: 'none' }}
            >
              <option value="">اختر منطقتك في الإسكندرية</option>
              {ALEX_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <Label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>العنوان بالتفصيل</Label>
            <Input value={formData.deliveryAddress} onChange={e => onChange({ ...formData, deliveryAddress: e.target.value })}
              className="h-12 rounded-xl" placeholder="الشارع، رقم العمارة، الدور..."
              style={{ background: B3, border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }} />
          </div>
          <div>
            <Label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>رقم الهاتف للتوصيل</Label>
            <Input value={formData.deliveryPhone} onChange={e => onChange({ ...formData, deliveryPhone: e.target.value })}
              className="h-12 rounded-xl" placeholder="01xxxxxxxxx" dir="ltr"
              style={{ background: B3, border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <Btn variant="outline" onClick={onBack} style={{ flex: '0 0 auto', paddingRight: 20, paddingLeft: 20 }}>رجوع</Btn>
        <Btn onClick={onNext} disabled={!canAdvance} style={{ flex: 1 }}>متابعة للدفع</Btn>
      </div>
    </div>
  );
}

function Step4Payment({ formData, onChange, onConfirm, onBack, isPending, pkg, receiptFile, receiptPreviewUrl, onReceiptSelect }: {
  formData: FormData; onChange: (f: FormData) => void;
  onConfirm: () => void; onBack: () => void; isPending: boolean;
  pkg: { name: string; sellPrice: string | number };
  receiptFile: File | null;
  receiptPreviewUrl: string | null;
  onReceiptSelect: (file: File | null) => void;
}) {
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const methods: { id: PayMethod; icon: React.ReactNode; title: string; desc: string }[] = [
    {
      id: 'card', title: 'فيزا / ماستر كارد',
      icon: <CreditCard size={26} />,
      desc: 'دفع إلكتروني آمن — Visa, Mastercard عبر Stripe',
    },
    {
      id: 'vodafone_cash', title: 'فودافون كاش',
      icon: <span style={{ fontSize: 22 }}>📱</span>,
      desc: 'تحويل عبر فودافون كاش — أدخل رقمك وادفع',
    },
    {
      id: 'instapay', title: 'انستاباى',
      icon: <span style={{ fontSize: 22 }}>⚡</span>,
      desc: 'تحويل فوري عبر InstaPay',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>طريقة الدفع</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {methods.map(m => (
          <button
            key={m.id}
            onClick={() => onChange({ ...formData, paymentMethod: m.id })}
            style={{
              padding: '16px 20px', borderRadius: 18, border: `2px solid ${formData.paymentMethod === m.id ? G : 'rgba(255,255,255,0.08)'}`,
              background: formData.paymentMethod === m.id ? `${G}12` : 'rgba(255,255,255,0.02)',
              cursor: 'pointer', textAlign: 'right', display: 'flex', gap: 16, alignItems: 'center',
              fontFamily: "'Almarai',sans-serif", transition: 'all 0.2s',
            }}
          >
            <div style={{ color: formData.paymentMethod === m.id ? G : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{m.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: formData.paymentMethod === m.id ? '#fff' : 'rgba(255,255,255,0.5)', marginBottom: 3 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{m.desc}</div>
            </div>
            {formData.paymentMethod === m.id && <CheckCircle2 size={22} style={{ color: G, flexShrink: 0 }} />}
          </button>
        ))}
      </div>

      {formData.paymentMethod === 'card' && (
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 14, padding: 14 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
            🔒 سيتم تحويلك لبوابة الدفع الآمنة. يعود تأكيد الطلب تلقائياً بعد نجاح الدفع.
          </p>
        </div>
      )}

      {(formData.paymentMethod === 'vodafone_cash' || formData.paymentMethod === 'instapay') && (() => {
        const isVodafone = formData.paymentMethod === 'vodafone_cash';
        const accent = isVodafone ? '#ef4444' : '#10b981';
        const accentBg = isVodafone ? 'rgba(220,38,38,0.08)' : 'rgba(16,185,129,0.08)';
        const accentBorder = isVodafone ? 'rgba(220,38,38,0.25)' : 'rgba(16,185,129,0.25)';
        const accountNum = isVodafone ? '01XXXXXXXXX' : '01XXXXXXXXX@instapay';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Payment instructions */}
            <div style={{ background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: accent, margin: 0 }}>
                {isVodafone ? '📱 بيانات فودافون كاش' : '⚡ بيانات InstaPay'}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
                ارسل <strong style={{ color: '#fff' }}>{Number(pkg.sellPrice).toLocaleString('ar-EG')} ج.م</strong> على:{' '}
                <strong style={{ color: '#fff', direction: 'ltr', display: 'inline-block' }}>{accountNum}</strong>
              </p>
              {isVodafone && (
                <div>
                  <Label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>رقم فودافون كاش الخاص بك</Label>
                  <Input value={formData.vodafonePhone}
                    onChange={e => onChange({ ...formData, vodafonePhone: e.target.value })}
                    className="h-10 rounded-xl" placeholder="01xxxxxxxxx" dir="ltr"
                    style={{ background: B3, border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }} />
                </div>
              )}
            </div>

            {/* Receipt upload */}
            <div style={{ border: `2px dashed ${receiptFile ? accent : 'rgba(255,255,255,0.15)'}`, borderRadius: 16, padding: 18, background: receiptFile ? `${accent}08` : 'transparent' }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: receiptFile ? '#fff' : 'rgba(255,255,255,0.55)', margin: '0 0 4px' }}>
                {receiptFile ? '✅ إيصال التحويل محدد' : '📎 ارفع إيصال التحويل (اختياري)'}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 12px' }}>
                {receiptFile ? 'سيُرفع الإيصال تلقائياً عند تأكيد الطلب' : 'صورة أو PDF — يسرع تفعيل الطلب'}
              </p>

              {/* Preview */}
              {receiptPreviewUrl && (
                <div style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden', maxHeight: 140, position: 'relative' }}>
                  <img src={receiptPreviewUrl} alt="الإيصال" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                </div>
              )}
              {receiptFile && !receiptPreviewUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '8px 12px', marginBottom: 12 }}>
                  <ImageIcon size={14} color={accent} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{receiptFile.name}</span>
                </div>
              )}

              <input ref={receiptInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0] ?? null; onReceiptSelect(f); }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => receiptInputRef.current?.click()}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                    background: receiptFile ? `${accent}22` : accent,
                    color: receiptFile ? accent : '#fff',
                    border: receiptFile ? `1.5px solid ${accent}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontFamily: "'Almarai',sans-serif",
                  }}
                >
                  <Upload size={14} /> {receiptFile ? 'تغيير الإيصال' : 'اختر ملف'}
                </button>
                {receiptFile && (
                  <button
                    onClick={() => onReceiptSelect(null)}
                    style={{
                      padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                      background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <XCircle size={16} color="#ef4444" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ display: 'flex', gap: 12 }}>
        <Btn variant="outline" onClick={onBack} disabled={isPending} style={{ flex: '0 0 auto', paddingRight: 20, paddingLeft: 20 }}>رجوع</Btn>
        <Btn onClick={onConfirm} disabled={isPending} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {isPending ? (
            <><Loader2 size={18} className="animate-spin" /> {formData.paymentMethod === 'card' ? 'جارٍ التحويل...' : 'جارٍ التأكيد...'}</>
          ) : (
            formData.paymentMethod === 'card' ? 'المتابعة للدفع' : 'تأكيد الطلب'
          )}
        </Btn>
      </div>
    </div>
  );
}

function Step5Confirmation({ orderId, paymentMethod, pickupType, autoUploadState }: {
  orderId: number; paymentMethod: PayMethod; pickupType: PickupType;
  autoUploadState: 'idle' | 'uploading' | 'done' | 'error';
}) {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Start from the auto-upload state — if receipt was already uploaded in Step 4, reflect that here
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>(autoUploadState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    if (autoUploadState !== 'idle') setUploadState(autoUploadState);
  }, [autoUploadState]);

  const needsReceipt = paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay';
  const methodLabel = paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 'انستاباى';
  const methodColor = paymentMethod === 'vodafone_cash' ? '#ef4444' : '#10b981';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    }
    setUploadedFileName(file.name);
    setUploadState('uploading');

    try {
      const formData = new FormData();
      formData.append('receipt', file);
      const authHeaders = getAuthHeaders();
      const authToken = authHeaders.headers?.Authorization;
      const res = await fetch(`/api/orders/${orderId}/receipt`, {
        method: 'POST',
        headers: { ...(authToken ? { Authorization: authToken } : {}) },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'فشل الرفع');
      }
      setUploadState('done');
      toast({ title: '✅ تم رفع الإيصال', description: 'سيتم مراجعته وتفعيل طلبك قريباً.' });
    } catch (err: unknown) {
      setUploadState('error');
      setPreviewUrl(null);
      setUploadedFileName(null);
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء الرفع';
      toast({ variant: 'destructive', title: 'خطأ في الرفع', description: msg });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center', padding: '16px 0' }}>
      {/* Success Icon */}
      <div style={{ width: 96, height: 96, background: 'rgba(34,197,94,0.12)', border: '3px solid #22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCircle2 size={52} style={{ color: '#22c55e' }} />
      </div>
      <div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#22c55e', margin: '0 0 8px' }}>تم تأكيد الطلب! 🎉</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>رقم الطلب: <strong style={{ color: '#fff' }}>#{orderId}</strong></p>
      </div>

      {/* Delivery info */}
      <div style={{ background: B3, borderRadius: 18, padding: 18, textAlign: 'right', width: '100%', maxWidth: 420 }}>
        {pickupType === 'pickup' ? (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>
            📍 <strong style={{ color: '#fff' }}>استلام من مركز التوزيع</strong><br />
            سيتواصل معك فريقنا خلال 24 ساعة لتحديد موعد الاستلام.
          </p>
        ) : (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>
            🏠 <strong style={{ color: '#fff' }}>توصيل للبيت</strong><br />
            سيتواصل معك فريقنا خلال 24 ساعة لتأكيد موعد التوصيل.
          </p>
        )}
      </div>

      {/* Receipt Upload Section */}
      {needsReceipt && (
        <div style={{
          width: '100%', maxWidth: 420, border: `2px dashed ${uploadState === 'done' ? '#22c55e' : methodColor}`,
          borderRadius: 20, padding: 22, background: `${methodColor}08`,
        }}>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
              {uploadState === 'done' ? '✅ تم رفع إيصال ' + methodLabel : '📎 ارفع إيصال ' + methodLabel}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              {uploadState === 'done'
                ? 'سيقوم فريقنا بمراجعة الإيصال وتفعيل طلبك خلال ساعات'
                : 'ارفع صورة أو PDF لإيصال التحويل لتسريع تفعيل الطلب'}
            </p>
          </div>

          {/* Preview */}
          {previewUrl && uploadState === 'done' && (
            <div style={{ marginBottom: 14, borderRadius: 12, overflow: 'hidden', maxHeight: 160, position: 'relative' }}>
              <img src={previewUrl} alt="الإيصال" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 8, left: 8, background: '#22c55e', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                ✓ مرفوع
              </div>
            </div>
          )}

          {uploadedFileName && uploadState === 'done' && !previewUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
              <ImageIcon size={16} style={{ color: '#22c55e' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedFileName}</span>
              <CheckCircle2 size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
            </div>
          )}

          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadState === 'uploading'}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 14, fontSize: 14, fontWeight: 800,
              background: uploadState === 'done' ? 'rgba(34,197,94,0.15)' : methodColor,
              color: uploadState === 'done' ? '#22c55e' : '#fff',
              border: uploadState === 'done' ? '2px solid #22c55e' : 'none',
              cursor: uploadState === 'uploading' ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: "'Almarai',sans-serif",
              opacity: uploadState === 'uploading' ? 0.7 : 1,
            }}
          >
            {uploadState === 'uploading' ? (
              <><Loader2 size={16} className="animate-spin" /> جارٍ الرفع...</>
            ) : uploadState === 'done' ? (
              <><CheckCircle2 size={16} /> تم رفع الإيصال — اضغط لتغييره</>
            ) : (
              <><Upload size={16} /> ارفع صورة الإيصال</>
            )}
          </button>

          {uploadState === 'error' && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 10 }}>
              <XCircle size={14} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: 12, color: '#ef4444' }}>فشل الرفع — حاول مرة أخرى</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href={`/orders/${orderId}`}>
          <button style={{ padding: '12px 20px', borderRadius: 14, border: '2px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontWeight: 700, cursor: 'pointer', fontFamily: "'Almarai',sans-serif", fontSize: 14 }}>
            تفاصيل الطلب
          </button>
        </Link>
        <Link href="/my-orders">
          <button style={{ padding: '12px 20px', borderRadius: 14, border: 'none', background: G, color: NV, fontWeight: 900, cursor: 'pointer', fontFamily: "'Almarai',sans-serif", fontSize: 14 }}>
            طلباتي
          </button>
        </Link>
      </div>
    </div>
  );
}

function OrderSummary({ pkg, formData, user, selectedTotal }: {
  pkg: { name: string; sellPrice: string | number; warrantyMonths: number };
  formData: FormData;
  user: { carModel?: string | null; carYear?: number | null } | null;
  selectedTotal?: number | null;
}) {
  const rows = [
    { label: 'الباكدج', value: pkg.name },
    { label: 'السيارة', value: formData.carModel ? `${formData.carModel} (${formData.carYear})` : (user?.carModel ? `${user.carModel} (${user.carYear})` : null) },
    { label: 'الاستلام', value: formData.pickupType === 'pickup' ? 'من مركز التوزيع' : formData.deliveryArea ? `توصيل — ${formData.deliveryArea}` : null },
    { label: 'الضمان', value: `${pkg.warrantyMonths} شهور` },
  ].filter(r => r.value);

  const methodLabel: Record<PayMethod, string> = { card: 'فيزا / ماستر', vodafone_cash: 'فودافون كاش', instapay: 'انستاباى' };

  return (
    <div style={{ background: B2, border: `2px solid ${G}30`, borderRadius: 24, padding: 22, position: 'sticky', top: 28 }}>
      <h3 style={{ fontWeight: 800, color: G, fontSize: 16, marginBottom: 18 }}>ملخص الطلب</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {rows.map(r => (
          <div key={r.label}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 2px' }}>{r.label}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{r.value}</p>
          </div>
        ))}
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 2px' }}>الدفع</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{methodLabel[formData.paymentMethod]}</p>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${G}25`, paddingTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>الإجمالي</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: G }}>
            {selectedTotal != null && selectedTotal > 0
              ? `${selectedTotal.toLocaleString('ar-EG')} ج.م`
              : `${Number(pkg.sellPrice).toLocaleString('ar-EG')} ج.م`}
          </span>
        </div>
        {selectedTotal != null && selectedTotal > 0 && (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '6px 0 0', textAlign: 'left' }}>
            بناءً على اختياراتك للقطع
          </p>
        )}
      </div>
    </div>
  );
}
