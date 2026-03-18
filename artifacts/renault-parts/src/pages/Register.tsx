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
import { Wrench, Loader2 } from 'lucide-react';

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

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', phone: '', email: '', password: '', area: '', carModel: '', carYear: undefined },
  });

  const { mutate: registerMutation, isPending } = useRegisterUser({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({ title: "مرحباً بك!", description: "تم إنشاء حسابك بنجاح." });
        setLocation('/');
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
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-xl w-full relative z-10">
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-primary/5 p-8 border border-border/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
              <Wrench className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-3xl font-black text-primary">حساب جديد</h2>
            <p className="text-muted-foreground mt-2 font-medium">سجل بياناتك واستمتع بأفضل عروض الصيانة</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label className="font-bold text-foreground">الاسم بالكامل</Label>
              <Input {...form.register('name')} className="h-12 rounded-xl bg-secondary/50" placeholder="الاسم ثلاثي" />
              {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="font-bold text-foreground">رقم الهاتف <span className="font-normal text-muted-foreground">(أو البريد الإلكتروني)</span></Label>
                <Input {...form.register('phone')} className="h-12 rounded-xl bg-secondary/50 text-right" placeholder="010..." dir="ltr" />
                {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-foreground">البريد الإلكتروني <span className="font-normal text-muted-foreground">(أو الهاتف)</span></Label>
                <Input {...form.register('email')} className="h-12 rounded-xl bg-secondary/50 text-right" placeholder="example@mail.com" dir="ltr" />
                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="font-bold text-foreground">كلمة المرور</Label>
                <Input type="password" {...form.register('password')} className="h-12 rounded-xl bg-secondary/50 text-right" placeholder="******" dir="ltr" />
                {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-foreground">منطقتك في الإسكندرية <span className="font-normal text-muted-foreground">(اختياري)</span></Label>
                <Select onValueChange={(v) => form.setValue('area', v)}>
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/50">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-border/50">
              <div className="space-y-2">
                <Label className="font-bold text-foreground">موديل السيارة <span className="font-normal text-muted-foreground">(اختياري)</span></Label>
                <Input {...form.register('carModel')} className="h-12 rounded-xl bg-secondary/50" placeholder="مثال: لوجان، ميجان..." />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-foreground">سنة الصنع <span className="font-normal text-muted-foreground">(اختياري)</span></Label>
                <Input type="number" {...form.register('carYear')} className="h-12 rounded-xl bg-secondary/50 text-right" placeholder="2018" dir="ltr" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-xl font-bold text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 mt-6"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إنشاء حساب'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-muted-foreground border-t border-border/50 pt-6">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-primary font-bold hover:text-accent transition-colors">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
