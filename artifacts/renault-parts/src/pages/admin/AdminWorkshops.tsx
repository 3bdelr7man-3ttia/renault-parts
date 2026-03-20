import React, { useState } from 'react';
import { useListAdminWorkshops, useCreateWorkshop, useUpdateWorkshop, useDeleteWorkshop } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Check, X, Loader2, MapPin, Phone, Wrench, ClipboardList, ShieldBan, ShieldCheck } from 'lucide-react';

const G = '#C8974A';

type WorkshopOrder = {
  id: number; userName: string; userPhone: string | null; packageName: string;
  status: string; total: number; workshopFee: number | null;
  carModel: string; carYear: number; createdAt: string;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: 'معلق',   color: '#f59e0b' },
  confirmed: { label: 'مؤكد',   color: '#60a5fa' },
  completed: { label: 'منتهي',  color: '#22c55e' },
  cancelled: { label: 'ملغي',   color: '#ef4444' },
};

const AREAS = ['سموحة', 'ميامي', 'المنتزه', 'الإبراهيمية', 'المحطة', 'كفر الشيخ', 'سيدي بشر', 'لوران', 'العجمي', 'الدخيلة'];

type WorkshopForm = {
  name: string;
  area: string;
  address: string;
  phone: string;
  lat: string;
  lng: string;
  partnershipStatus: string;
  imageUrl: string;
};

const emptyForm: WorkshopForm = {
  name: '', area: '', address: '', phone: '',
  lat: '', lng: '', partnershipStatus: 'active', imageUrl: '',
};

export default function AdminWorkshops() {
  const { getAuthHeaders, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const headers = getAuthHeaders();
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const { data: workshops, isLoading } = useListAdminWorkshops({ request: headers });

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<WorkshopForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<WorkshopForm>(emptyForm);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [ordersModal, setOrdersModal] = useState<{ id: number; name: string; phone: string | null } | null>(null);
  const [workshopOrders, setWorkshopOrders] = useState<WorkshopOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const openOrders = async (ws: { id: number; name: string; phone: string | null }) => {
    setOrdersModal(ws);
    setWorkshopOrders([]);
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/admin/workshops/${ws.id}/orders`, { headers: authHeader });
      if (!res.ok) throw new Error();
      setWorkshopOrders(await res.json());
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحميل طلبات الورشة' });
    } finally {
      setLoadingOrders(false);
    }
  };

  const invalidate = () => queryClient.invalidateQueries();

  const { mutate: createWs, isPending: creating } = useCreateWorkshop({
    request: headers,
    mutation: {
      onSuccess: () => { toast({ title: 'تم إضافة الورشة' }); invalidate(); setShowAdd(false); setAddForm(emptyForm); },
      onError: () => toast({ variant: 'destructive', title: 'خطأ', description: 'فشل إضافة الورشة' }),
    },
  });

  const { mutate: updateWs, isPending: updating } = useUpdateWorkshop({
    request: headers,
    mutation: {
      onSuccess: () => { toast({ title: 'تم تحديث الورشة' }); invalidate(); setEditingId(null); },
      onError: () => toast({ variant: 'destructive', title: 'خطأ', description: 'فشل التحديث' }),
    },
  });

  const { mutate: deleteWs } = useDeleteWorkshop({
    request: headers,
    mutation: {
      onSuccess: () => { toast({ title: 'تم حذف الورشة' }); invalidate(); setDeletingId(null); setConfirmDelete(null); },
      onError: () => toast({ variant: 'destructive', title: 'خطأ', description: 'فشل الحذف' }),
    },
  });

  const parseForm = (form: WorkshopForm): {
    name: string; area: string; address: string; phone: string;
    lat?: number | null; lng?: number | null; partnershipStatus?: string; imageUrl?: string | null;
  } => ({
    name: form.name,
    area: form.area,
    address: form.address,
    phone: form.phone,
    lat: form.lat ? parseFloat(form.lat) : null,
    lng: form.lng ? parseFloat(form.lng) : null,
    partnershipStatus: form.partnershipStatus,
    imageUrl: form.imageUrl || null,
  });

  const startEdit = (ws: NonNullable<typeof workshops>[0]) => {
    setEditingId(ws.id);
    setEditForm({
      name: ws.name,
      area: ws.area,
      address: ws.address,
      phone: ws.phone,
      lat: ws.lat != null ? String(ws.lat) : '',
      lng: ws.lng != null ? String(ws.lng) : '',
      partnershipStatus: ws.partnershipStatus,
      imageUrl: ws.imageUrl ?? '',
    });
  };

  const STATUS_COLORS: Record<string, string> = {
    active:   'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
    pending:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    blocked:  'bg-red-700/20 text-red-300 border-red-700/40',
  };
  const STATUS_LABELS: Record<string, string> = {
    active:   'نشطة',
    inactive: 'متوقفة',
    pending:  'قيد المراجعة',
    blocked:  'محظورة',
  };

  const [blockingId, setBlockingId] = useState<number | null>(null);

  const toggleBlock = async (ws: { id: number; partnershipStatus: string }) => {
    const newStatus = ws.partnershipStatus === 'blocked' ? 'active' : 'blocked';
    setBlockingId(ws.id);
    try {
      const res = await fetch(`/api/admin/workshops/${ws.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(getAuthHeaders().headers ?? {}) },
        body: JSON.stringify({ partnershipStatus: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast({ title: newStatus === 'blocked' ? '🚫 تم حظر الورشة' : '✅ تم رفع الحظر' });
      invalidate();
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر تغيير حالة الورشة' });
    } finally {
      setBlockingId(null);
    }
  };

  const FormFields = ({ form, setForm }: { form: WorkshopForm; setForm: React.Dispatch<React.SetStateAction<WorkshopForm>> }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-white/50 text-xs font-bold mb-1 block">اسم الورشة *</label>
        <input
          value={form.name}
          onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
          placeholder="ورشة الرينو الذهبية"
          className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50 text-sm"
        />
      </div>
      <div>
        <label className="text-white/50 text-xs font-bold mb-1 block">المنطقة *</label>
        <select
          value={form.area}
          onChange={e => setForm(s => ({ ...s, area: e.target.value }))}
          className="w-full bg-[#1E2761] text-white px-3 py-2 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50 text-sm"
        >
          <option value="">اختر المنطقة</option>
          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="text-white/50 text-xs font-bold mb-1 block">العنوان الكامل *</label>
        <input
          value={form.address}
          onChange={e => setForm(s => ({ ...s, address: e.target.value }))}
          placeholder="شارع مثال، حي كذا"
          className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50 text-sm"
        />
      </div>
      <div>
        <label className="text-white/50 text-xs font-bold mb-1 block">رقم الهاتف *</label>
        <input
          value={form.phone}
          onChange={e => setForm(s => ({ ...s, phone: e.target.value }))}
          placeholder="01xxxxxxxxx"
          dir="ltr"
          className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50 text-sm"
        />
      </div>
      <div>
        <label className="text-white/50 text-xs font-bold mb-1 block">حالة الشراكة</label>
        <select
          value={form.partnershipStatus}
          onChange={e => setForm(s => ({ ...s, partnershipStatus: e.target.value }))}
          className="w-full bg-[#1E2761] text-white px-3 py-2 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50 text-sm"
        >
          <option value="active">نشطة</option>
          <option value="inactive">متوقفة</option>
          <option value="pending">قيد المراجعة</option>
          <option value="blocked">محظورة</option>
        </select>
      </div>
      <div>
        <label className="text-white/50 text-xs font-bold mb-1 block">خط العرض (lat)</label>
        <input
          type="number"
          value={form.lat}
          onChange={e => setForm(s => ({ ...s, lat: e.target.value }))}
          placeholder="31.2001"
          dir="ltr"
          className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50 text-sm"
        />
      </div>
      <div>
        <label className="text-white/50 text-xs font-bold mb-1 block">خط الطول (lng)</label>
        <input
          type="number"
          value={form.lng}
          onChange={e => setForm(s => ({ ...s, lng: e.target.value }))}
          placeholder="29.9187"
          dir="ltr"
          className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50 text-sm"
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-white/50 text-xs font-bold mb-1 block">رابط صورة الورشة (Image URL)</label>
        <input
          value={form.imageUrl}
          onChange={e => setForm(s => ({ ...s, imageUrl: e.target.value }))}
          placeholder="https://example.com/workshop.jpg"
          dir="ltr"
          className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50 text-sm font-mono"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">إدارة الورش</h1>
          <p className="text-white/50 text-sm">{workshops?.length ?? 0} ورشة شريكة</p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F9E795] text-[#1E2761] rounded-xl font-bold text-sm hover:bg-[#F9E795]/80 transition-all"
        >
          <Plus className="w-4 h-4" />
          إضافة ورشة
        </button>
      </div>

      {/* Add Workshop Form */}
      {showAdd && (
        <div className="bg-[#1E2761]/80 rounded-2xl border border-[#F9E795]/30 p-6 space-y-4">
          <h3 className="text-white font-bold text-lg">إضافة ورشة جديدة</h3>
          <FormFields form={addForm} setForm={setAddForm} />
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => createWs({ data: parseForm(addForm) })}
              disabled={creating || !addForm.name || !addForm.area || !addForm.address || !addForm.phone}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#F9E795] text-[#1E2761] rounded-xl font-bold text-sm hover:bg-[#F9E795]/80 transition-all disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              حفظ
            </button>
            <button
              onClick={() => { setShowAdd(false); setAddForm(emptyForm); }}
              className="px-6 py-2.5 bg-white/10 text-white/70 rounded-xl font-bold text-sm hover:bg-white/20 transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Workshops List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : (workshops ?? []).length === 0 ? (
        <div className="bg-[#1E2761]/60 rounded-2xl border border-white/10 p-12 text-center text-white/40 font-bold">
          لا توجد ورش مضافة بعد
        </div>
      ) : (
        <div className="grid gap-4">
          {(workshops ?? []).map(ws => {
            const isEditing = editingId === ws.id;
            const isDeleting = deletingId === ws.id;
            const isConfirmingDelete = confirmDelete === ws.id;

            return (
              <div key={ws.id} className="bg-[#1E2761]/60 rounded-2xl border border-white/10 p-6 space-y-4">
                {isEditing ? (
                  <>
                    <FormFields form={editForm} setForm={setEditForm} />
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateWs({ id: ws.id, data: parseForm(editForm) })}
                        disabled={updating}
                        className="flex items-center gap-2 px-5 py-2 bg-[#F9E795] text-[#1E2761] rounded-xl font-bold text-sm hover:bg-[#F9E795]/80 transition-all disabled:opacity-50"
                      >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-5 py-2 bg-white/10 text-white/70 rounded-xl font-bold text-sm hover:bg-white/20 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 bg-[#F9E795]/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Wrench className="w-5 h-5 text-[#F9E795]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-white font-bold">{ws.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[ws.partnershipStatus] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                            {STATUS_LABELS[ws.partnershipStatus] ?? ws.partnershipStatus}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-white/50 text-xs">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ws.area} — {ws.address}</span>
                          <span className="flex items-center gap-1" dir="ltr"><Phone className="w-3 h-3" /> {ws.phone}</span>
                        </div>
                        {ws.lat != null && ws.lng != null && (
                          <p className="text-white/30 text-xs mt-0.5" dir="ltr">{Number(ws.lat).toFixed(4)}, {Number(ws.lng).toFixed(4)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isConfirmingDelete ? (
                        <>
                          <span className="text-red-400 text-xs font-bold">تأكيد الحذف؟</span>
                          <button
                            onClick={() => { setDeletingId(ws.id); deleteWs({ id: ws.id }); }}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-all"
                          >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setConfirmDelete(null)} className="p-1.5 rounded-lg bg-white/10 text-white/50 hover:bg-white/20 transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openOrders({ id: ws.id, name: ws.name, phone: ws.phone ?? null })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            style={{ background: `${G}15`, color: G, border: `1px solid ${G}30` }}
                          >
                            <ClipboardList className="w-3.5 h-3.5" /> طلباتها
                          </button>
                          <button
                            onClick={() => toggleBlock(ws)}
                            disabled={blockingId === ws.id}
                            title={ws.partnershipStatus === 'blocked' ? 'رفع الحظر' : 'حظر الورشة'}
                            className={`p-2 rounded-lg transition-all ${ws.partnershipStatus === 'blocked' ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-red-700/15 text-red-300 hover:bg-red-700/25'}`}
                          >
                            {blockingId === ws.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : ws.partnershipStatus === 'blocked'
                                ? <ShieldCheck className="w-4 h-4" />
                                : <ShieldBan className="w-4 h-4" />
                            }
                          </button>
                          <button onClick={() => startEdit(ws)} className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(ws.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Workshop Orders Modal */}
      {ordersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setOrdersModal(null)}>
          <div
            className="bg-[#0F1625] border border-[#C8974A]/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
            style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}
          >
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C8974A] to-transparent" />
            <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-black text-white">طلبات الورشة</h2>
                <p className="text-white/40 text-sm mt-0.5">{ordersModal.name}</p>
                {ordersModal.phone && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Phone className="w-3 h-3" style={{ color: G }} />
                    <span className="text-xs font-bold" style={{ color: G }} dir="ltr">{ordersModal.phone}</span>
                  </div>
                )}
              </div>
              <button onClick={() => setOrdersModal(null)} className="w-8 h-8 rounded-lg bg-white/10 text-white/50 hover:bg-white/20 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {loadingOrders ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#C8974A]" /></div>
              ) : workshopOrders.length === 0 ? (
                <div className="py-16 text-center text-white/30 font-bold">لا توجد طلبات لهذه الورشة بعد</div>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#0F1625]">
                      <tr className="text-white/40 text-xs font-bold border-b border-white/10">
                        <th className="px-4 py-3 text-right">#</th>
                        <th className="px-4 py-3 text-right">العميل</th>
                        <th className="px-4 py-3 text-right">الباكدج</th>
                        <th className="px-4 py-3 text-right">السيارة</th>
                        <th className="px-4 py-3 text-right">الحالة</th>
                        <th className="px-4 py-3 text-right">الإجمالي</th>
                        <th className="px-4 py-3 text-right" style={{ color: G }}>أرباح الورشة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workshopOrders.map(order => {
                        const st = STATUS_MAP[order.status] ?? { label: order.status, color: '#94a3b8' };
                        return (
                          <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-white/40 font-mono text-xs">{order.id}</td>
                            <td className="px-4 py-3">
                              <div className="text-white text-xs font-bold">{order.userName}</div>
                              {order.userPhone && <div className="text-white/40 text-xs" dir="ltr">{order.userPhone}</div>}
                            </td>
                            <td className="px-4 py-3 text-white/70 text-xs">{order.packageName}</td>
                            <td className="px-4 py-3 text-white/60 text-xs">{order.carModel} {order.carYear}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ color: st.color, background: `${st.color}15` }}>
                                {st.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-black text-sm text-white/70">{order.total.toLocaleString()} ج.م</td>
                            <td className="px-4 py-3 font-black text-sm" style={{ color: order.workshopFee != null ? G : 'rgba(255,255,255,0.2)' }}>
                              {order.workshopFee != null ? `${order.workshopFee.toLocaleString()} ج.م` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* Summary row */}
                  {workshopOrders.length > 0 && (
                    <div className="px-6 py-4 border-t border-white/10 flex flex-wrap gap-6 justify-end" style={{ background: 'rgba(200,151,74,0.04)' }}>
                      <div className="text-right">
                        <p className="text-white/40 text-xs font-bold mb-0.5">إجمالي الطلبات</p>
                        <p className="text-white font-black text-sm">{workshopOrders.reduce((s, o) => s + o.total, 0).toLocaleString()} ج.م</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold mb-0.5" style={{ color: 'rgba(200,151,74,0.6)' }}>إجمالي أرباح الورشة</p>
                        <p className="font-black text-sm" style={{ color: G }}>
                          {workshopOrders.reduce((s, o) => s + (o.workshopFee ?? 0), 0).toLocaleString()} ج.م
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
