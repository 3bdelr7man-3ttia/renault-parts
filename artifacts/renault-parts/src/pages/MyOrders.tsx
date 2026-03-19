import React from 'react';
import { useListOrders } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useLocation, Link } from 'wouter';
import { Package, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function MyOrders() {
  const { user, getAuthHeaders } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/login');
    return null;
  }

  const { data: orders, isLoading } = useListOrders({
    request: getAuthHeaders(),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">قيد المراجعة</span>;
      case 'confirmed': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">مؤكد</span>;
      case 'processing': return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">جاري التركيب</span>;
      case 'completed': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">مكتمل</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 pb-24 pt-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-primary mb-8">طلباتي السابقة</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-40 bg-white rounded-3xl animate-pulse" />)}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg shadow-black/5 border border-border/50">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">لا توجد طلبات بعد</h2>
            <p className="text-muted-foreground mb-6">لم تقم بطلب أي باكدج صيانة حتى الآن.</p>
            <Link href="/packages">
              <button className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg">
                تصفح الباكدجات
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 border border-border/50 hover-lift flex flex-col sm:flex-row gap-6 justify-between items-center group">
                <div className="w-full sm:w-auto space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-primary">طلب #{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <h3 className="text-xl font-black text-foreground">{order.package?.name}</h3>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(order.createdAt), 'dd MMMM yyyy', { locale: ar })}
                    </div>
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg">
                      <MapPin className="w-4 h-4" />
                      {order.workshop?.name || 'توصيل منزلي'}
                    </div>
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg">
                      <Clock className="w-4 h-4" />
                      {order.carModel} ({order.carYear})
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between gap-4 border-t sm:border-t-0 sm:border-r border-border/50 pt-4 sm:pt-0 sm:pr-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-bold mb-1">الإجمالي</p>
                    <p className="text-2xl font-black" style={{ color: '#C8974A' }}>{order.total} ج.م</p>
                  </div>
                  
                  <Link href={`/orders/${order.id}`}>
                    <button className="flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors bg-primary/5 px-4 py-2 rounded-xl">
                      التفاصيل <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
