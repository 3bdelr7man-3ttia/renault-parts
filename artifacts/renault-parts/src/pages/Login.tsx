import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { useLoginUser, type LoginUserMutationError } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { RenoPackLogo } from '@/components/layout/AppLayout';
import { getEmployeeHomePath } from '@/lib/permissions';

const loginSchema = z.object({
  identifier: z.string().min(1, 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const { mutate: loginMutation, isPending } = useLoginUser({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({ title: 'مرحباً بك مجدداً!', description: 'تم تسجيل الدخول بنجاح.' });
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || getEmployeeHomePath(data.user);
        setLocation(redirect);
      },
      onError: (error: LoginUserMutationError) => {
        toast({
          variant: 'destructive',
          title: 'خطأ في تسجيل الدخول',
          description: error.data?.error ?? 'بيانات الدخول غير صحيحة',
        });
      },
    },
  });

  const onSubmit = (data: LoginForm) => loginMutation({ data });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', position: 'relative', overflow: 'hidden', direction: 'rtl' }}>
      {/* Background glows */}
      <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(200,151,74,0.07),transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-8%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(74,171,202,0.05),transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 440, width: '100%', position: 'relative', zIndex: 1 }}>

        {/* Logo centered above card */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <RenoPackLogo size="lg" />
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: '#161E30',
          border: '1.5px solid rgba(200,151,74,0.14)',
          borderRadius: 28,
          padding: '36px 36px 32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Gold top line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#C8974A,transparent)' }} />

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Almarai',sans-serif", fontSize: 26, fontWeight: 800, color: '#E8F0F8', marginBottom: 6 }}>تسجيل الدخول</h2>
            <p style={{ fontFamily: "'Almarai',sans-serif", color: '#7A95AA', fontSize: 14, fontWeight: 500 }}>أهلاً بك في رينو باك — الإسكندرية</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: "'Almarai',sans-serif", fontWeight: 700, fontSize: 14, color: '#C8C8D0' }}>رقم الهاتف أو البريد الإلكتروني</label>
              <Input
                {...form.register('identifier')}
                className="h-12 rounded-xl bg-secondary/50 border-border/40 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all"
                placeholder="01xxxxxxxxx أو example@mail.com"
                dir="ltr"
                style={{ textAlign: 'right', fontSize: 14 }}
              />
              {form.formState.errors.identifier && (
                <p style={{ fontFamily: "'Almarai',sans-serif", fontSize: 13, color: '#EF4444', fontWeight: 600 }}>{form.formState.errors.identifier.message}</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: "'Almarai',sans-serif", fontWeight: 700, fontSize: 14, color: '#C8C8D0' }}>كلمة المرور</label>
              <Input
                {...form.register('password')}
                type="password"
                className="h-12 rounded-xl bg-secondary/50 border-border/40 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all"
                placeholder="أدخل كلمة المرور"
                dir="ltr"
                style={{ textAlign: 'right', fontSize: 14 }}
              />
              {form.formState.errors.password && (
                <p style={{ fontFamily: "'Almarai',sans-serif", fontSize: 13, color: '#EF4444', fontWeight: 600 }}>{form.formState.errors.password.message}</p>
              )}
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
                transition: 'all .25s',
                marginTop: 4,
              }}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'دخول'}
            </Button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
            <span style={{ fontFamily: "'Almarai',sans-serif", fontSize: 14, color: '#7A95AA', fontWeight: 500 }}>
              ليس لديك حساب؟{' '}
            </span>
            <Link href="/register" style={{ fontFamily: "'Almarai',sans-serif", color: '#C8974A', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
