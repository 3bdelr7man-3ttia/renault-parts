import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Loader2, Clock, MapPin, Phone, Wrench, User, Calendar, FileText, AlertTriangle, ShieldBan } from 'lucide-react';

const G = '#C8974A';
const B2 = '#111826';
const B3 = '#161E30';
const TD = '#7A95AA';
const TX = '#C4D4E0';
const BD = 'rgba(255,255,255,0.07)';

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

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'في الانتظار',          color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  approved:   { label: 'موافق عليه',           color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
  rejected:   { label: 'مرفوض',                color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
  incomplete: { label: 'غير مستوفى الشروط',   color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  blocked:    { label: 'محظور',                color: '#dc2626', bg: 'rgba(220,38,38,0.1)'  },
};

// "الكل" shows everything EXCEPT approved (approved → moved to workshops section)
const FILTER_OPTIONS = [
  { value: 'all',        label: 'الكل'                },
  { value: 'pending',    label: 'في الانتظار'         },
  { value: 'rejected',   label: 'مرفوضون'             },
  { value: 'incomplete', label: 'غير مستوفى الشروط'  },
  { value: 'blocked',    label: 'محظورون'             },
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
      const res = await fetch('/api/admin/workshop-applications', { headers: getAuthHeaders().headers });
      if (!res.ok) throw new Error('خطأ في التحميل');
      setApps(await res.json());
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر تحميل الطلبات' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, status: 'approved' | 'rejected' | 'incomplete' | 'blocked') => {
    setActionLoading(id);
    const labels: Record<string, string> = {
      approved: '✅ تمت الموافقة',
      rejected: '❌ تم الرفض',
      incomplete: '⚠️ غير مستوفى الشروط',
      blocked: '🚫 تم الحظر',
    };
    try {
      const res = await fetch(`/api/admin/workshop-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders().headers ?? {}) },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setApps(prev => prev.map(a => a.id === id ? { ...a, status, reviewedAt: new Date().toISOString() } : a));
      toast({ title: labels[status], description: 'تم تحديث حالة الطلب' });
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر تحديث الحالة' });
    } finally {
      setActionLoading(null);
    }
  };

  // "الكل" excludes approved — approved workshops live in the workshops section
  const nonApproved = apps.filter(a => a.status !== 'approved');
  const filtered = filter === 'all' ? nonApproved : nonApproved.filter(a => a.status === filter);
  const pendingCount = apps.filter(a => a.status === 'pending').length;

  return (
    <div style={{ fontFamily: "'Almarai',sans-serif", direction: 'rtl' }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#E8F0F8', marginBottom: 4 }}>طلبات انضمام الورش</h1>
            <p style={{ color: TD, fontSize: 13 }}>راجع طلبات الورش الجديدة ووافق عليها أو ارفضها</p>
          </div>
          {pendingCount > 0 && (
            <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 999, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Clock size={13} color="#f59e0b" />
              <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 800 }}>{pendingCount} طلب ينتظر المراجعة</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
          {FILTER_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value)}
              style={{ padding: '7px 16px', borderRadius: 999, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: "'Almarai',sans-serif", transition: 'all .2s', border: `1.5px solid ${filter === opt.value ? G : BD}`, background: filter === opt.value ? 'rgba(200,151,74,0.12)' : B3, color: filter === opt.value ? G : TD }}>
              {opt.label} {opt.value !== 'all' && <span style={{ opacity: .7 }}>({apps.filter(a => opt.value === 'all' ? true : a.status === opt.value).length})</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Loader2 size={36} color={G} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: B2, border: `1px solid ${BD}`, borderRadius: 20, padding: '48px 32px', textAlign: 'center' }}>
            <Wrench size={48} color={TD} style={{ marginBottom: 16, opacity: .4 }} />
            <p style={{ color: TD, fontSize: 14, fontWeight: 700 }}>لا توجد طلبات في هذه الفئة</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(app => {
              const st = STATUS_MAP[app.status] ?? STATUS_MAP.pending;
              const isOpen = expanded === app.id;
              return (
                <div key={app.id} style={{ background: B2, border: `1px solid ${BD}`, borderRadius: 20, overflow: 'hidden', transition: 'border-color .2s' }}>
                  <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 12 }}
                    onClick={() => setExpanded(isOpen ? null : app.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(200,151,74,0.1)', border: `1px solid rgba(200,151,74,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Wrench size={20} color={G} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: '#E8F0F8', marginBottom: 3 }}>{app.workshopName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: TD, fontSize: 11, fontWeight: 700 }}><User size={10} />{app.ownerName}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: TD, fontSize: 11, fontWeight: 700 }}><MapPin size={10} />{app.area}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: TD, fontSize: 11, fontWeight: 700 }}><Calendar size={10} />{new Date(app.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ background: st.bg, border: `1px solid ${st.color}40`, borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 800, color: st.color }}>
                        {st.label}
                      </span>
                      <span style={{ color: TD, fontSize: 16, transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform .2s' }}>▼</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${BD}`, padding: '20px 22px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        {[
                          { icon: Phone, label: 'التليفون', val: app.phone },
                          { icon: MapPin, label: 'العنوان', val: app.address },
                          { icon: Calendar, label: 'سنوات الخبرة', val: app.yearsExperience },
                          { icon: Wrench, label: 'التخصصات', val: app.specialties },
                        ].map(({ icon: Icon, label, val }) => (
                          <div key={label} style={{ background: B3, border: `1px solid ${BD}`, borderRadius: 12, padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                              <Icon size={12} color={G} />
                              <span style={{ color: TD, fontSize: 10, fontWeight: 800, letterSpacing: .5 }}>{label}</span>
                            </div>
                            <div style={{ color: TX, fontSize: 13, fontWeight: 700 }}>{val}</div>
                          </div>
                        ))}
                      </div>

                      {app.notes && (
                        <div style={{ background: B3, border: `1px solid ${BD}`, borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <FileText size={12} color={G} />
                            <span style={{ color: TD, fontSize: 10, fontWeight: 800 }}>ملاحظات</span>
                          </div>
                          <p style={{ color: TX, fontSize: 13, fontWeight: 700, margin: 0 }}>{app.notes}</p>
                        </div>
                      )}

                      {app.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={() => handleAction(app.id, 'approved')} disabled={actionLoading === app.id}
                            style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(34,197,94,0.12)', border: '1.5px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '11px 12px', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 12, color: '#22c55e', cursor: 'pointer', transition: 'all .2s' }}>
                            {actionLoading === app.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            موافقة
                          </button>
                          <button onClick={() => handleAction(app.id, 'incomplete')} disabled={actionLoading === app.id}
                            style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(249,115,22,0.08)', border: '1.5px solid rgba(249,115,22,0.25)', borderRadius: 12, padding: '11px 12px', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 12, color: '#f97316', cursor: 'pointer', transition: 'all .2s' }}>
                            {actionLoading === app.id ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                            غير مستوفى
                          </button>
                          <button onClick={() => handleAction(app.id, 'rejected')} disabled={actionLoading === app.id}
                            style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '11px 12px', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 12, color: '#ef4444', cursor: 'pointer', transition: 'all .2s' }}>
                            {actionLoading === app.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                            رفض
                          </button>
                        </div>
                      )}

                      {/* Allow re-review of incomplete applications */}
                      {app.status === 'incomplete' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: st.bg, border: `1px solid ${st.color}30`, borderRadius: 10 }}>
                            <AlertTriangle size={14} color={st.color} />
                            <span style={{ color: st.color, fontSize: 12, fontWeight: 800 }}>غير مستوفى الشروط{app.reviewedAt && ` · ${new Date(app.reviewedAt).toLocaleDateString('ar-EG')}`}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleAction(app.id, 'approved')} disabled={actionLoading === app.id}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(34,197,94,0.12)', border: '1.5px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '9px', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 12, color: '#22c55e', cursor: 'pointer' }}>
                              <CheckCircle2 size={13} /> موافقة
                            </button>
                            <button onClick={() => handleAction(app.id, 'rejected')} disabled={actionLoading === app.id}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '9px', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 12, color: '#ef4444', cursor: 'pointer' }}>
                              <XCircle size={13} /> رفض نهائي
                            </button>
                          </div>
                        </div>
                      )}

                      {(app.status === 'rejected' || app.status === 'blocked') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: st.bg, border: `1px solid ${st.color}30`, borderRadius: 10 }}>
                          {app.status === 'blocked' ? <ShieldBan size={14} color={st.color} /> : <XCircle size={14} color={st.color} />}
                          <span style={{ color: st.color, fontSize: 12, fontWeight: 800 }}>
                            {app.status === 'blocked' ? 'محظور' : 'مرفوض'}
                            {app.reviewedAt && ` · ${new Date(app.reviewedAt).toLocaleDateString('ar-EG')}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
