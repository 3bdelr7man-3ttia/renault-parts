import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { adminUi } from '@/components/admin/admin-ui';
import { AlertTriangle, CheckCircle2, Clock, FileText, Loader2, MapPin, Phone, ShieldBan, User, Wrench, XCircle } from 'lucide-react';

type Application = {
  id: number;
  ownerName: string;
  workshopName: string;
  phone: string;
  area: string;
  address: string;
  yearsExperience: string;
  specialties: string;
  notes: string | null;
  status: string;
  reviewedAt: string | null;
  createdAt: string;
};

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  pending: { label: 'في الانتظار', badge: 'border-amber-200 bg-amber-50 text-amber-700' },
  approved: { label: 'موافق عليه', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  rejected: { label: 'مرفوض', badge: 'border-rose-200 bg-rose-50 text-rose-700' },
  incomplete: { label: 'غير مستوفى الشروط', badge: 'border-orange-200 bg-orange-50 text-orange-700' },
  blocked: { label: 'محظور', badge: 'border-rose-300 bg-rose-100 text-rose-800' },
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'في الانتظار' },
  { value: 'rejected', label: 'مرفوضون' },
  { value: 'incomplete', label: 'غير مستوفى الشروط' },
  { value: 'blocked', label: 'محظورون' },
];

export default function AdminWorkshopApplications() {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/workshop-applications', { headers: getAuthHeaders().headers });
      if (!response.ok) throw new Error('خطأ في التحميل');
      setApps(await response.json());
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر تحميل الطلبات' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, status: 'approved' | 'rejected' | 'incomplete' | 'blocked') => {
    setActionLoading(id);
    const labels: Record<string, string> = {
      approved: 'تمت الموافقة',
      rejected: 'تم الرفض',
      incomplete: 'تم وسمه كغير مستوفٍ',
      blocked: 'تم الحظر',
    };
    try {
      const response = await fetch(`/api/admin/workshop-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders().headers ?? {}) },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error();
      setApps((current) => current.map((item) => (item.id === id ? { ...item, status, reviewedAt: new Date().toISOString() } : item)));
      toast({ title: labels[status], description: 'تم تحديث حالة الطلب' });
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر تحديث الحالة' });
    } finally {
      setActionLoading(null);
    }
  };

  const nonApproved = apps.filter((application) => application.status !== 'approved');
  const filtered = filter === 'all' ? nonApproved : nonApproved.filter((application) => application.status === filter);
  const pendingCount = apps.filter((application) => application.status === 'pending').length;

  return (
    <div className={adminUi.page} style={{ fontFamily: "'Almarai',sans-serif", direction: 'rtl' }}>
      <div className={adminUi.hero}>
        <div className={adminUi.toolbar}>
          <div>
            <h1 className={adminUi.title}>طلبات انضمام الورش</h1>
            <p className={adminUi.subtitle}>راجع طلبات الورش الجديدة وقرر الموافقة أو الرفض أو طلب الاستيفاء.</p>
          </div>
          {pendingCount > 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black text-amber-700">
              <Clock className="h-3.5 w-3.5" />
              {pendingCount} طلب ينتظر المراجعة
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => {
          const active = filter === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`rounded-full border px-4 py-2 text-xs font-black transition ${active ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center rounded-[28px] border border-slate-200 bg-white p-12 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={adminUi.emptyState}>
          <Wrench className="mx-auto mb-4 h-12 w-12 text-slate-200" />
          <p className="text-sm font-bold text-slate-500">لا توجد طلبات في هذه الفئة الآن.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((application) => {
            const st = STATUS_MAP[application.status] ?? STATUS_MAP.pending;
            const isOpen = expanded === application.id;
            return (
              <div key={application.id} className={`${adminUi.card} overflow-hidden p-0`}>
                <button
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right"
                  onClick={() => setExpanded(isOpen ? null : application.id)}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
                      <Wrench className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-slate-950">{application.workshopName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{application.ownerName}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{application.area}</span>
                        <span>{new Date(application.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${st.badge}`}>{st.label}</span>
                    <span className="text-sm text-slate-400 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
                  </div>
                </button>

                {isOpen ? (
                  <div className="border-t border-slate-200 px-6 py-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { label: 'التليفون', value: application.phone, icon: Phone },
                        { label: 'العنوان', value: application.address, icon: MapPin },
                        { label: 'سنوات الخبرة', value: application.yearsExperience, icon: Clock },
                        { label: 'التخصصات', value: application.specialties, icon: Wrench },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                            <item.icon className="h-3.5 w-3.5 text-amber-700" />
                            {item.label}
                          </div>
                          <div className="text-sm font-bold text-slate-800">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {application.notes ? (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                          <FileText className="h-3.5 w-3.5 text-amber-700" />
                          ملاحظات
                        </div>
                        <p className="text-sm font-medium leading-6 text-slate-700">{application.notes}</p>
                      </div>
                    ) : null}

                    {application.status === 'pending' ? (
                      <div className="mt-5 grid gap-2 sm:grid-cols-3">
                        <button
                          onClick={() => handleAction(application.id, 'approved')}
                          disabled={actionLoading === application.id}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
                        >
                          {actionLoading === application.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          موافقة
                        </button>
                        <button
                          onClick={() => handleAction(application.id, 'incomplete')}
                          disabled={actionLoading === application.id}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-orange-700 transition hover:bg-orange-100"
                        >
                          {actionLoading === application.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                          غير مستوفى
                        </button>
                        <button
                          onClick={() => handleAction(application.id, 'rejected')}
                          disabled={actionLoading === application.id}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100"
                        >
                          {actionLoading === application.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                          رفض
                        </button>
                      </div>
                    ) : null}

                    {application.status === 'incomplete' ? (
                      <div className="mt-5 space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black text-orange-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          غير مستوفى الشروط{application.reviewedAt ? ` · ${new Date(application.reviewedAt).toLocaleDateString('ar-EG')}` : ''}
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <button
                            onClick={() => handleAction(application.id, 'approved')}
                            disabled={actionLoading === application.id}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            موافقة
                          </button>
                          <button
                            onClick={() => handleAction(application.id, 'rejected')}
                            disabled={actionLoading === application.id}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100"
                          >
                            <XCircle className="h-4 w-4" />
                            رفض نهائي
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {(application.status === 'rejected' || application.status === 'blocked') ? (
                      <div className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${st.badge}`}>
                        {application.status === 'blocked' ? <ShieldBan className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {st.label}{application.reviewedAt ? ` · ${new Date(application.reviewedAt).toLocaleDateString('ar-EG')}` : ''}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
