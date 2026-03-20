import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { CheckCircle2, AlertCircle, Loader2, ChevronRight, LogIn, UserCheck } from 'lucide-react';
import { RenoPackLogo } from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';

const G = '#C8974A';
const GL = '#E0B06A';
const BG = '#0D1220';
const B2 = '#111826';
const B3 = '#161E30';
const TD = '#7A95AA';
const TX = '#C4D4E0';
const BD = 'rgba(255,255,255,0.07)';

const AREAS = [
  'المنتزه', 'سيدي جابر', 'سموحة', 'العجمي', 'المنشية',
  'كليوباترا', 'ميامي', 'الإبراهيمية', 'سيدي بشر', 'الشاطبي',
  'الدخيلة', 'العامرية', 'بيكوزي', 'مصطفى كامل', 'المزاريطة',
  'زيزينيا', 'الورديان', 'البيطاش', 'كرموز', 'باب شرق', 'لوران',
];

const SPECIALTIES_LIST = [
  'صيانة دورية', 'كهرباء سيارات', 'تكييف', 'فرامل وعفشة',
  'محركات', 'جير وفتيس', 'هيكل ودهان', 'إطارات وجنوط',
];

const TERMS = [
  'الالتزام بجودة التركيب وفق معايير رينو المعتمدة',
  'استخدام القطع المورّدة من RenoPack فقط في الطلبات الواردة منا',
  'الرد على العملاء خلال ٢٤ ساعة من تأكيد الحجز',
  'توفير ضمان حقيقي على الشغل لمدة لا تقل عن ٣ أشهر',
  'الحفاظ على سمعة الشبكة وعدم التسعير خارج الاتفاقية',
  'قبول آلية التقييم والمراجعة الدورية من فريق RenoPack',
  'الامتثال لأي تحديثات في شروط الشراكة بعد الإشعار المسبق',
];

type FormState = {
  ownerName: string;
  workshopName: string;
  phone: string;
  area: string;
  address: string;
  yearsExperience: string;
  specialties: string[];
  notes: string;
  agreedTerms: boolean;
};

const emptyForm: FormState = {
  ownerName: '', workshopName: '', phone: '', area: '',
  address: '', yearsExperience: '', specialties: [], notes: '', agreedTerms: false,
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: TX, marginBottom: 7 }}>
        {label} {required && <span style={{ color: G }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: B3, border: `1.5px solid ${BD}`, borderRadius: 12,
  padding: '11px 14px', color: '#E8F0F8', fontSize: 13, fontWeight: 700,
  fontFamily: "'Almarai',sans-serif", outline: 'none', boxSizing: 'border-box',
  transition: 'border-color .2s',
};

export default function JoinWorkshop() {
  const { user, getAuthHeaders } = useAuth();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill name & phone from logged-in user profile
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        ownerName: f.ownerName || user.name || '',
        phone: f.phone || user.phone || '',
      }));
    }
  }, [user]);

  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleSpecialty = (s: string) => {
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter(x => x !== s)
        : [...f.specialties, s],
    }));
  };

  const canSubmit =
    form.ownerName.trim() && form.workshopName.trim() && form.phone.trim() &&
    form.area && form.address.trim() && form.yearsExperience &&
    form.specialties.length > 0 && form.agreedTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !user) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/workshops/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders().headers ?? {}) },
        body: JSON.stringify({
          ownerName: form.ownerName,
          workshopName: form.workshopName,
          phone: form.phone,
          area: form.area,
          address: form.address,
          yearsExperience: form.yearsExperience,
          specialties: form.specialties.join('، '),
          notes: form.notes || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'حدث خطأ');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: "'Almarai',sans-serif", direction: 'rtl', paddingBottom: 80 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, gap: 10 }}>
          <RenoPackLogo size="md" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href="/" style={{ color: TD, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>الرئيسية</Link>
            <ChevronRight size={12} color={TD} style={{ transform: 'rotate(180deg)' }} />
            <span style={{ color: G, fontSize: 12, fontWeight: 700 }}>انضم كورشة</span>
          </div>
        </div>

        {/* Login wall — must be logged in to apply */}
        {!user ? (
          <div style={{ background: B2, border: `1.5px solid rgba(200,151,74,0.2)`, borderRadius: 24, padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(200,151,74,0.1)', border: `2px solid rgba(200,151,74,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <LogIn size={32} color={G} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#E8F0F8', marginBottom: 10 }}>سجّل دخولك أولاً</h2>
            <p style={{ color: TD, fontSize: 13, lineHeight: 1.9, marginBottom: 28, maxWidth: 380, margin: '0 auto 28px' }}>
              عشان نقدر نربط طلبك بحسابك ونحولك لصاحب ورشة بعد الموافقة،<br />
              محتاج تسجل دخول أو تعمل حساب جديد الأول.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?redirect=/join-workshop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${G},${GL})`, color: BG, padding: '13px 28px', borderRadius: 999, fontWeight: 900, fontSize: 14, textDecoration: 'none' }}>
                <LogIn size={16} /> سجل دخول
              </Link>
              <Link href="/register?redirect=/join-workshop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,151,74,0.1)', border: `1.5px solid rgba(200,151,74,0.3)`, color: G, padding: '13px 28px', borderRadius: 999, fontWeight: 900, fontSize: 14, textDecoration: 'none' }}>
                <UserCheck size={16} /> حساب جديد
              </Link>
            </div>
          </div>
        ) : success ? (
          <div style={{ background: B2, border: `1.5px solid rgba(34,197,94,0.3)`, borderRadius: 24, padding: '48px 32px', textAlign: 'center' }}>
            <CheckCircle2 size={64} color="#22c55e" style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#E8F0F8', marginBottom: 12 }}>تم إرسال طلبك بنجاح! 🎉</h2>
            <p style={{ color: TD, fontSize: 14, lineHeight: 1.8, marginBottom: 28 }}>
              شكراً لاهتمامك بالانضمام لشبكة RenoPack.<br />
              سيقوم فريقنا بمراجعة طلبك والتواصل معك على رقم الهاتف المسجّل خلال ٢-٣ أيام عمل.
            </p>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${G},${GL})`, color: BG, padding: '12px 28px', borderRadius: 999, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              العودة للرئيسية
            </Link>
          </div>
        ) : (
          <>
            <div style={{ background: B2, border: `1px solid rgba(200,151,74,0.15)`, borderRadius: 24, padding: '28px 28px 0', marginBottom: 20 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(200,151,74,0.09)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 999, padding: '5px 16px', marginBottom: 14 }}>
                <span style={{ color: G, fontSize: 12, fontWeight: 700 }}>🔧 انضم لشبكة RenoPack</span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#E8F0F8', marginBottom: 8 }}>سجّل ورشتك معنا</h1>
              <p style={{ color: TD, fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>
                انضم لشبكة الورش المعتمدة في الإسكندرية وابدأ تستقبل طلبات تركيب من عملاء RenoPack مباشرة.
                فريقنا سيراجع طلبك وينتظرك!
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
                {[
                  { icon: '📦', title: 'قطع مضمونة', desc: 'العميل بييجي بالقطع من عندنا' },
                  { icon: '💰', title: 'دخل إضافي', desc: 'طلبات جديدة من العملاء' },
                  { icon: '⭐', title: 'تقييم موثّق', desc: 'ابني سمعة على المنصة' },
                ].map(b => (
                  <div key={b.title} style={{ background: B3, border: `1px solid ${BD}`, borderRadius: 14, padding: '14px 16px' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{b.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#E8F0F8', marginBottom: 3 }}>{b.title}</div>
                    <div style={{ fontSize: 11, color: TD, fontWeight: 700 }}>{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ background: B2, border: `1px solid ${BD}`, borderRadius: 24, padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#E8F0F8', marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${BD}` }}>
                  بيانات الورشة والمالك
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="اسم صاحب الورشة" required>
                    <input style={inputStyle} value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="الاسم الكامل" />
                  </Field>
                  <Field label="اسم الورشة" required>
                    <input style={inputStyle} value={form.workshopName} onChange={e => set('workshopName', e.target.value)} placeholder="مثال: ورشة النور للصيانة" />
                  </Field>
                  <Field label="رقم التليفون" required>
                    <input style={inputStyle} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01xxxxxxxxx" />
                  </Field>
                  <Field label="المنطقة" required>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.area} onChange={e => set('area', e.target.value)}>
                      <option value="">اختر المنطقة...</option>
                      {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="العنوان التفصيلي" required>
                  <input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} placeholder="الشارع والمبنى..." />
                </Field>

                <Field label="سنوات الخبرة" required>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)}>
                    <option value="">اختر...</option>
                    <option value="أقل من سنة">أقل من سنة</option>
                    <option value="١-٣ سنوات">١-٣ سنوات</option>
                    <option value="٣-٥ سنوات">٣-٥ سنوات</option>
                    <option value="٥-١٠ سنوات">٥-١٠ سنوات</option>
                    <option value="أكثر من ١٠ سنوات">أكثر من ١٠ سنوات</option>
                  </select>
                </Field>
              </div>

              <div style={{ background: B2, border: `1px solid ${BD}`, borderRadius: 24, padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#E8F0F8', marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${BD}` }}>
                  التخصصات <span style={{ color: G }}>*</span>
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {SPECIALTIES_LIST.map(s => {
                    const on = form.specialties.includes(s);
                    return (
                      <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                        style={{ background: on ? 'rgba(200,151,74,0.12)' : B3, border: `1.5px solid ${on ? G : BD}`, borderRadius: 999, padding: '8px 16px', color: on ? G : TX, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: "'Almarai',sans-serif", transition: 'all .2s' }}>
                        {on ? '✓ ' : ''}{s}
                      </button>
                    );
                  })}
                </div>
                {form.specialties.length === 0 && <p style={{ color: TD, fontSize: 11, marginTop: 10, fontWeight: 700 }}>اختر تخصص واحد على الأقل</p>}
              </div>

              <div style={{ background: B2, border: `1px solid ${BD}`, borderRadius: 24, padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#E8F0F8', marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${BD}` }}>
                  ملاحظات إضافية (اختياري)
                </h3>
                <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' as const }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="أي معلومات إضافية عن ورشتك..." />
              </div>

              <div style={{ background: B2, border: `1.5px solid rgba(200,151,74,0.2)`, borderRadius: 24, padding: 28, marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: G, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid rgba(200,151,74,0.15)` }}>
                  📋 شروط الانضمام لشبكة RenoPack
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
                  {TERMS.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(200,151,74,0.12)', border: '1.5px solid rgba(200,151,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: G }}>{i + 1}</span>
                      </div>
                      <p style={{ color: TX, fontSize: 13, fontWeight: 700, lineHeight: 1.7, margin: 0 }}>{t}</p>
                    </div>
                  ))}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' as const }}>
                  <div
                    onClick={() => set('agreedTerms', !form.agreedTerms)}
                    style={{ width: 22, height: 22, borderRadius: 6, background: form.agreedTerms ? G : B3, border: `2px solid ${form.agreedTerms ? G : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'all .2s' }}>
                    {form.agreedTerms && <span style={{ fontSize: 12, fontWeight: 900, color: BG }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: form.agreedTerms ? '#E8F0F8' : TD }}>
                    أقر بأنني قرأت وفهمت وأوافق على جميع شروط الانضمام لشبكة RenoPack
                  </span>
                </label>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                  <AlertCircle size={16} color="#ef4444" />
                  <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 700 }}>{error}</span>
                </div>
              )}

              <button type="submit" disabled={!canSubmit || loading}
                style={{ width: '100%', background: canSubmit ? `linear-gradient(135deg,${G},${GL})` : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 14, padding: '15px', fontFamily: "'Almarai',sans-serif", fontSize: 15, fontWeight: 900, color: canSubmit ? BG : TD, cursor: canSubmit ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: canSubmit ? `0 8px 24px rgba(200,151,74,0.3)` : 'none', transition: 'all .2s' }}>
                {loading ? <><Loader2 size={18} className="animate-spin" /> جارٍ إرسال الطلب...</> : '🚀 أرسل طلب الانضمام'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
