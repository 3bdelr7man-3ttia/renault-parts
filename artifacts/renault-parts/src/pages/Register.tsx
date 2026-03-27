import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { useRegisterUser, type RegisterUserMutationError } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { RenoPackLogo } from '@/components/layout/AppLayout';

const ALEXANDRIA_AREAS = [
  'سيدي بشر', 'سموحة', 'المنتزه', 'ميامي', 'العجمي', 'المحطة',
  'بحري', 'جليم', 'لوران', 'كليوباترا', 'سيدي جابر', 'أخرى'
];

const registerSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة').optional().or(z.literal('')),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  area: z.string().optional(),
  carModel: z.string().optional(),
  carYear: z.coerce.number().optional(),
}).refine(
  (data) => !!(data.phone?.trim() || data.email?.trim()),
  { message: 'يجب إدخال رقم الهاتف أو البريد الإلكتروني', path: ['phone'] }
);

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const redirect = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('redirect') || '/' : '/';

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', phone: '', email: '', password: '', area: '', carModel: '', carYear: undefined },
  });

  const { mutate: registerMutation, isPending } = useRegisterUser({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({ title: "مرحباً بك!", description: "تم إنشاء حسابك بنجاح." });
        setLocation(redirect);
      },
      onError: (error: RegisterUserMutationError) => {
        toast({
          variant: "destructive",
          title: "خطأ في التسجيل",
          description: error.data?.error ?? "حدث خطأ أثناء إنشاء الحساب",
        });
      }
    }
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation({
      data: {
        name: data.name,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        password: data.password,
        area: data.area?.trim() || null,
        carModel: data.carModel?.trim() || null,
        carYear: data.carYear ?? null,
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', position: 'relative', overflow: 'hidden', direction: 'rtl', background: '#F8FAFC' }}>
      <div style={{ position: 'absolute', top: '-15%', left: '-8%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(200,151,74,0.07),transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-8%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(74,171,202,0.05),transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 560, width: '100%', position: 'relative', zIndex: 1 }}>

        {/* Logo above card */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <RenoPackLogo size="lg" />
          </a>
        </div>

        <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(15,23,42,0.08)', borderRadius: 28, padding: '36px 36px 32px', boxShadow: '0 24px 64px rgba(15,23,42,0.12)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#C8974A,transparent)' }} />
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>حساب جديد</h2>
            <p style={{ fontFamily: "'Almarai',sans-serif", color: '#64748B', fontSize: 14, fontWeight: 500 }}>سجل بياناتك واستمتع بأفضل عروض الصيانة في الإسكندرية</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">الاسم بالكامل</Label>
              <Input {...form.register('name')} className="h-12 rounded-xl border-slate-200 bg-white text-slate-950 placeholder:text-slate-400" placeholder="الاسم ثلاثي" />
              {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">رقم الهاتف <span className="font-normal text-slate-500">(أو البريد الإلكتروني)</span></Label>
                <Input {...form.register('phone')} className="h-12 rounded-xl border-slate-200 bg-white text-right text-slate-950 placeholder:text-slate-400" placeholder="010..." dir="ltr" />
                {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">البريد الإلكتروني <span className="font-normal text-slate-500">(أو الهاتف)</span></Label>
                <Input {...form.register('email')} className="h-12 rounded-xl border-slate-200 bg-white text-right text-slate-950 placeholder:text-slate-400" placeholder="example@mail.com" dir="ltr" />
                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">كلمة المرور</Label>
                <Input type="password" {...form.register('password')} className="h-12 rounded-xl border-slate-200 bg-white text-right text-slate-950 placeholder:text-slate-400" placeholder="******" dir="ltr" />
                {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">منطقتك في الإسكندرية <span className="font-normal text-slate-500">(اختياري)</span></Label>
                <Select onValueChange={(v) => form.setValue('area', v)}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white text-slate-950">
                    <SelectValue placeholder="اختر منطقتك" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALEXANDRIA_AREAS.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 border-t border-slate-200 pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">موديل السيارة <span className="font-normal text-slate-500">(اختياري)</span></Label>
                <Input {...form.register('carModel')} className="h-12 rounded-xl border-slate-200 bg-white text-slate-950 placeholder:text-slate-400" placeholder="مثال: لوجان، ميجان..." />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">سنة الصنع <span className="font-normal text-slate-500">(اختياري)</span></Label>
                <Input type="number" {...form.register('carYear')} className="h-12 rounded-xl border-slate-200 bg-white text-right text-slate-950 placeholder:text-slate-400" placeholder="2018" dir="ltr" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              style={{
                width: '100%', height: 52,
                background: isPending ? 'rgba(200,151,74,0.5)' : 'linear-gradient(135deg,#C8974A,#DEB06C)',
                color: '#0D1220', fontFamily: "'Almarai',sans-serif",
                fontWeight: 800, fontSize: 16, borderRadius: 14,
                border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 22px rgba(200,151,74,0.35)',
                marginTop: 8,
              }}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'إنشاء حساب'}
            </Button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(148,163,184,0.2)', textAlign: 'center' }}>
            <span style={{ fontFamily: "'Almarai',sans-serif", fontSize: 14, color: '#64748B', fontWeight: 500 }}>
              لديك حساب بالفعل؟{' '}
            </span>
            <Link href="/login" style={{ fontFamily: "'Almarai',sans-serif", color: '#C8974A', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
