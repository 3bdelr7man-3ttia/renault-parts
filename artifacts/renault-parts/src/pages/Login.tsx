import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { useLoginUser } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutate: loginMutation, isPending } = useLoginUser({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({ title: "مرحباً بك مجدداً!", description: "تم تسجيل الدخول بنجاح." });
        // Handle redirect if needed (e.g., from checkout)
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/';
        setLocation(redirect);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "خطأ في تسجيل الدخول",
          description: error.error?.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        });
      }
    }
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation({ data });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-primary/5 p-8 border border-border/50">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
              <Wrench className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-3xl font-black text-primary">تسجيل الدخول</h2>
            <p className="text-muted-foreground mt-2 font-medium">أهلاً بك في منصة رينو بارتس الإسكندرية</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-foreground">البريد الإلكتروني</Label>
              <Input 
                {...form.register('email')} 
                className="h-12 rounded-xl bg-secondary/50 border-transparent focus:border-primary focus:bg-white transition-all" 
                placeholder="أدخل بريدك الإلكتروني"
                dir="ltr"
                style={{ textAlign: 'right' }} // Keep placeholder aligned right
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive font-medium">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-foreground">كلمة المرور</Label>
              <Input 
                {...form.register('password')} 
                type="password" 
                className="h-12 rounded-xl bg-secondary/50 border-transparent focus:border-primary focus:bg-white transition-all" 
                placeholder="أدخل كلمة المرور"
                dir="ltr"
                style={{ textAlign: 'right' }}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive font-medium">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-xl font-bold text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'دخول'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-muted-foreground border-t border-border/50 pt-6">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="text-primary font-bold hover:text-accent transition-colors">
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
