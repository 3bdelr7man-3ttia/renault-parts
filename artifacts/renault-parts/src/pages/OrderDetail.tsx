import React from 'react';
import { useRoute, Link } from 'wouter';
import { useGetOrder, getGetOrderQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, MapPin, Package, CarFront, Banknote, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function OrderDetail() {
  const [, params] = useRoute('/orders/:id');
  const orderId = params?.id ? parseInt(params.id, 10) : 0;
  const { getAuthHeaders } = useAuth();

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { queryKey: getGetOrderQueryKey(orderId), enabled: !!orderId },
    request: getAuthHeaders()
  });

  if (isLoading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-accent rounded-full" /></div>;
  if (!order) return <div className="text-center py-20 font-bold text-xl text-primary">الطلب غير موجود</div>;

  const statuses = [
    { id: 'pending', label: 'قيد المراجعة' },
    { id: 'confirmed', label: 'مؤكد' },
    { id: 'processing', label: 'جاري التركيب' },
    { id: 'completed', label: 'مكتمل' }
  ];

  const currentIndex = statuses.findIndex(s => s.id === order.status);

  return (
    <div className="bg-background min-h-screen pb-24 pt-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/my-orders" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors font-bold mb-8">
          <ArrowRight className="w-4 h-4 ml-2" /> عودة للطلبات
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-primary mb-2">تفاصيل طلب #{order.id}</h1>
            <p className="text-muted-foreground font-medium">تاريخ الطلب: {format(new Date(order.createdAt), 'dd MMMM yyyy, p', { locale: ar })}</p>
          </div>
          <div className="bg-primary/5 text-primary px-4 py-2 rounded-xl font-bold border border-primary/10">
            الإجمالي: {order.total} ج.م
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-border/50 mb-8 overflow-hidden relative">
          <div className="absolute top-[52px] left-12 right-12 h-1 bg-border -z-10" />
          <div className="absolute top-[52px] right-12 h-1 bg-green-500 -z-10 transition-all duration-1000" style={{ width: `${(Math.max(0, currentIndex) / (statuses.length - 1)) * 100}%` }} />
          
          <div className="flex justify-between relative z-10">
            {statuses.map((s, idx) => {
              const isPast = idx <= currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div key={s.id} className="flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                    isPast ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-110' : 'bg-white border-2 border-border text-muted-foreground'
                  }`}>
                    {isPast ? <ShieldCheck className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className={`text-sm font-bold ${isCurrent ? 'text-green-600' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-border/50">
              <h3 className="flex items-center gap-2 text-lg font-bold text-primary mb-4 border-b border-border/50 pb-4">
                <Package className="w-5 h-5 text-accent" /> الباكدج المطلوب
              </h3>
              <p className="font-black text-xl mb-2">{order.package?.name}</p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{order.package?.description}</p>
              <div className="bg-secondary/50 p-4 rounded-xl">
                <span className="font-bold text-sm text-primary">الضمان:</span> {order.package?.warrantyMonths} شهور
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-border/50">
              <h3 className="flex items-center gap-2 text-lg font-bold text-primary mb-4 border-b border-border/50 pb-4">
                <Banknote className="w-5 h-5 text-accent" /> تفاصيل الدفع
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">طريقة الدفع</span>
                  <span className="font-bold">{order.paymentMethod === 'cash' ? 'كاش عند الاستلام' : 'إلكتروني'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">حالة الدفع</span>
                  <span className="font-bold text-primary bg-primary/5 px-2 py-0.5 rounded text-sm">{order.paymentStatus}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-border/50">
              <h3 className="flex items-center gap-2 text-lg font-bold text-primary mb-4 border-b border-border/50 pb-4">
                <CarFront className="w-5 h-5 text-accent" /> بيانات السيارة
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">الموديل</span>
                  <span className="font-bold">{order.carModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">سنة الصنع</span>
                  <span className="font-bold">{order.carYear}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-border/50">
              <h3 className="flex items-center gap-2 text-lg font-bold text-primary mb-4 border-b border-border/50 pb-4">
                <MapPin className="w-5 h-5 text-accent" /> مكان التركيب
              </h3>
              {order.workshop ? (
                <div>
                  <p className="font-bold text-lg mb-1">{order.workshop.name}</p>
                  <p className="text-muted-foreground text-sm mb-2">{order.workshop.area} - {order.workshop.address}</p>
                  <p className="text-sm font-medium text-primary" dir="ltr">{order.workshop.phone}</p>
                </div>
              ) : (
                <div>
                  <span className="inline-block bg-accent/20 text-primary px-3 py-1 rounded-full text-xs font-bold mb-3">توصيل للبيت</span>
                  <p className="font-bold text-foreground leading-relaxed">{order.deliveryAddress}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
