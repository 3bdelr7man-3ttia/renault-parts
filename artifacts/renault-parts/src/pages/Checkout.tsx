import React, { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useListPackages, useCreateOrder, useInitiatePayment } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MapPin, CreditCard, CarFront, Loader2, CheckCircle2, Package2,
  Home, AlertCircle, Store, Upload, ImageIcon, XCircle, ChevronDown, Car
} from 'lucide-react';
import { RenoPackLogo } from '@/components/layout/AppLayout';
import { RENAULT_MODELS, CAR_YEARS } from '@/lib/car-context';

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
  const packageId = !isCustom && params?.id ? parseInt(params.id, 10) : 0;
  const [, setLocation] = useLocation();
  const { user, getAuthHeaders } = useAuth();
  const { toast } = useToast();

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
  const pkg = isCustom ? virtualPkg : packages?.find(p => p.id === packageId);

  const userHasCar = !!(user?.carModel && user?.carYear);
  const [step, setStep] = useState<Step>(userHasCar ? 2 : 1);
  const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    carModel: user?.carModel ?? '',
    carYear: user?.carYear ?? new Date().getFullYear(),
    pickupType: 'pickup',
    deliveryAddress: user?.address ?? '',
    deliveryArea: user?.area ?? '',
    deliveryPhone: user?.phone ?? '',
    paymentMethod: 'card',
    vodafonePhone: user?.phone ?? '',
  });

  useEffect(() => {
    if (user?.carModel && !formData.carModel) {
      setFormData(f => ({ ...f, carModel: user.carModel ?? '', carYear: user.carYear ?? f.carYear }));
    }
  }, [user]);

  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: async (order) => {
        setConfirmedOrderId(order.id);
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

  if (!user) { setLocation('/login?redirect=/checkout/' + (isCustom ? 'custom' : packageId)); return null; }

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

        <StepProgress step={step} userHasCar={userHasCar} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, marginTop: 32 }} className="checkout-grid">
          <div>
            <div style={{ background: B2, borderRadius: 24, border: `1px solid ${G}20`, padding: 28 }}>

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
                  onBack={() => setStep(userHasCar ? 1 : 1)}
                  userHasCar={userHasCar}
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
                />
              )}

              {step === 5 && confirmedOrderId && (
                <Step5Confirmation
                  orderId={confirmedOrderId}
                  paymentMethod={formData.paymentMethod}
                  pickupType={formData.pickupType}
                />
              )}
            </div>
          </div>

          <div>
            <OrderSummary pkg={pkg} formData={formData} user={user} />
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

function Step1Car({ formData, onChange, onNext, canAdvance }: {
  formData: FormData; onChange: (f: FormData) => void; onNext: () => void; canAdvance: boolean;
}) {
  const SHORT = (m: string) => m.replace('Renault ', '');
  const gridModels = RENAULT_MODELS.slice(0, 6);
  const moreModels = RENAULT_MODELS.slice(6);
  const recentYears = CAR_YEARS.slice(0, 8);
  const olderYears = CAR_YEARS.slice(8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Title */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>اختار سيارتك</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>نضمن لك الباكدج المناسب لموديل وسنة سيارتك بالتحديد</p>
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

function Step2Package({ pkg, onNext, onBack, userHasCar, user }: {
  pkg: { id: number; name: string; description?: string | null; sellPrice: string | number; warrantyMonths: number };
  onNext: () => void; onBack: () => void; userHasCar: boolean;
  user: { carModel?: string | null; carYear?: number | null } | null;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>الباكدج المختار</h2>
      <div style={{ background: `${G}12`, border: `2px solid ${G}40`, borderRadius: 20, padding: 20 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ width: 52, height: 52, background: `${G}25`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package2 size={24} style={{ color: G }} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: G, margin: '0 0 4px' }}>{pkg.name}</h3>
            {pkg.description && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 10px', lineHeight: 1.5 }}>{pkg.description}</p>}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ background: G, color: NV, fontWeight: 900, borderRadius: 999, padding: '3px 14px', fontSize: 14 }}>
                {Number(pkg.sellPrice).toLocaleString('ar-EG')} ج.م
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>ضمان {pkg.warrantyMonths} شهور</span>
            </div>
          </div>
        </div>
      </div>
      {userHasCar && user && (
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <CheckCircle2 size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
            بيانات سيارتك محفوظة: {user.carModel} — {user.carYear}
          </span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <Btn variant="outline" onClick={onBack} style={{ flex: '0 0 auto', paddingRight: 20, paddingLeft: 20 }}>رجوع</Btn>
        <Btn onClick={onNext} style={{ flex: 1 }}>متابعة لاستلام الباكدج</Btn>
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

function Step4Payment({ formData, onChange, onConfirm, onBack, isPending, pkg }: {
  formData: FormData; onChange: (f: FormData) => void;
  onConfirm: () => void; onBack: () => void; isPending: boolean;
  pkg: { name: string; sellPrice: string | number };
}) {
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

      {formData.paymentMethod === 'vodafone_cash' && (
        <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', margin: 0 }}>📱 بيانات فودافون كاش</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            ارسل <strong style={{ color: '#fff' }}>{Number(pkg.sellPrice).toLocaleString('ar-EG')} ج.م</strong> على الرقم: <strong style={{ color: '#fff', direction: 'ltr', display: 'inline-block' }}>01XXXXXXXXX</strong>
          </p>
          <div>
            <Label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>رقم فودافون كاش الخاص بك</Label>
            <Input value={formData.vodafonePhone}
              onChange={e => onChange({ ...formData, vodafonePhone: e.target.value })}
              className="h-10 rounded-xl" placeholder="01xxxxxxxxx" dir="ltr"
              style={{ background: B3, border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }} />
          </div>
        </div>
      )}

      {formData.paymentMethod === 'instapay' && (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#10b981', margin: '0 0 8px' }}>⚡ بيانات InstaPay</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
            ارسل <strong style={{ color: '#fff' }}>{Number(pkg.sellPrice).toLocaleString('ar-EG')} ج.م</strong> على حساب InstaPay الخاص بنا.<br />
            رقم الحساب: <strong style={{ color: '#fff', direction: 'ltr', display: 'inline-block' }}>01XXXXXXXXX@instapay</strong>
          </p>
        </div>
      )}

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

function Step5Confirmation({ orderId, paymentMethod, pickupType }: {
  orderId: number; paymentMethod: PayMethod; pickupType: PickupType;
}) {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

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

function OrderSummary({ pkg, formData, user }: {
  pkg: { name: string; sellPrice: string | number; warrantyMonths: number };
  formData: FormData;
  user: { carModel?: string | null; carYear?: number | null } | null;
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
          <span style={{ fontSize: 24, fontWeight: 900, color: G }}>{Number(pkg.sellPrice).toLocaleString('ar-EG')} ج.م</span>
        </div>
      </div>
    </div>
  );
}
