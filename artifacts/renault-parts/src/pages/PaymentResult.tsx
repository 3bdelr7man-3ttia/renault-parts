import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useGetOrder, getGetOrderQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentResult() {
  const [, setLocation] = useLocation();
  const { user, getAuthHeaders } = useAuth();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('order_id') ?? params.get('orderId');
    if (id) setOrderId(parseInt(id, 10));
  }, []);

  const { data: order, refetch } = useGetOrder(
    orderId ?? 0,
    {
      request: getAuthHeaders(),
      query: {
        queryKey: getGetOrderQueryKey(orderId ?? 0),
        enabled: !!orderId && !!user,
      },
    }
  );

  useEffect(() => {
    if (!orderId || !user) return;
    if (order?.paymentStatus === 'paid' || order?.paymentStatus === 'failed') return;
    if (pollCount >= 12) return;

    const timer = setTimeout(() => {
      refetch();
      setPollCount(c => c + 1);
    }, 3000);

    return () => clearTimeout(timer);
  }, [order, orderId, user, pollCount, refetch]);

  if (!user) {
    setLocation('/login');
    return null;
  }

  const isPaid = order?.paymentStatus === 'paid';
  const isFailed = order?.paymentStatus === 'failed';
  const isPending = !isPaid && !isFailed;
  const isTimeout = isPending && pollCount >= 12;

  return (
    <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 shadow-xl max-w-md w-full text-center border border-border/50">

        {isPaid && (
          <>
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
            </div>
            <h1 className="text-2xl font-black text-green-700 mb-2">تم الدفع بنجاح!</h1>
            <p className="text-muted-foreground mb-2">
              رقم الطلب: <span className="font-bold text-foreground">#{orderId}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              طلبك مؤكد. سيتواصل معك فريقنا لتحديد موعد التركيب.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/orders/${orderId}`}>
                <Button variant="outline" className="rounded-xl">تفاصيل الطلب</Button>
              </Link>
              <Link href="/my-orders">
                <Button className="rounded-xl">طلباتي</Button>
              </Link>
            </div>
          </>
        )}

        {isFailed && (
          <>
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-14 h-14 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-red-700 mb-2">فشل الدفع</h1>
            <p className="text-muted-foreground mb-8">
              لم تتم عملية الدفع. يمكنك المحاولة مرة أخرى أو اختيار الدفع كاش.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/packages">
                <Button variant="outline" className="rounded-xl">العودة للباكدجات</Button>
              </Link>
              {orderId && (
                <Link href={`/orders/${orderId}`}>
                  <Button className="rounded-xl">تفاصيل الطلب</Button>
                </Link>
              )}
            </div>
          </>
        )}

        {isPending && !isTimeout && (
          <>
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-primary mb-2">جارٍ التحقق من الدفع...</h1>
            <p className="text-muted-foreground mb-4">نتحقق من تأكيد العملية مع بوابة الدفع.</p>
            <p className="text-xs text-muted-foreground">قد يستغرق هذا بضع ثوان</p>
          </>
        )}

        {isTimeout && (
          <>
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-black text-yellow-700 mb-2">في انتظار التأكيد</h1>
            <p className="text-muted-foreground mb-8">
              طلبك موجود وسيُحدَّث تلقائياً بمجرد تأكيد الدفع من البنك.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/my-orders">
                <Button className="rounded-xl">متابعة طلباتي</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
