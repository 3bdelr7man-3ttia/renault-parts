import React, { useState, useEffect } from 'react';
import { useListAdminUsers, useUpdateUserRole } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, User, Loader2, Wrench, Link as LinkIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type Workshop = { id: number; name: string; phone: string };

type UserRow = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  role: string;
  workshopId?: number | null;
  workshopName?: string | null;
  carModel?: string | null;
  carYear?: number | null;
  area?: string | null;
  orderCount: number;
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = { admin: 'مدير', customer: 'عميل', workshop: 'ورشة' };
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-[#F9E795]/20 text-[#F9E795] border-[#F9E795]/30',
  customer: 'bg-white/10 text-white/60 border-white/10',
  workshop: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
};

export default function AdminUsers() {
  const { getAuthHeaders, token, user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [linkModal, setLinkModal] = useState<UserRow | null>(null);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('');
  const [linkingId, setLinkingId] = useState<number | null>(null);

  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const headers = getAuthHeaders();
  const { data: users, isLoading } = useListAdminUsers({ request: headers });

  useEffect(() => {
    fetch('/api/admin/workshops', { headers: authHeader })
      .then(r => r.json())
      .then((ws: Workshop[]) => setWorkshops(ws))
      .catch(() => {});
  }, []);

  const { mutate: updateRole } = useUpdateUserRole({
    request: headers,
    mutation: {
      onSuccess: (updated) => {
        toast({ title: 'تم تحديث الصلاحية' });
        queryClient.invalidateQueries();
        setUpdatingId(null);
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحديث الصلاحية' });
        setUpdatingId(null);
      },
    },
  });

  const handleRoleToggle = (userId: number, currentRole: string) => {
    let newRole: 'customer' | 'admin' = currentRole === 'admin' ? 'customer' : 'admin';
    setUpdatingId(userId);
    updateRole({ id: userId, data: { role: newRole } });
  };

  const openLinkModal = (u: UserRow) => {
    setLinkModal(u);
    setSelectedWorkshopId(u.workshopId ? String(u.workshopId) : '');
  };

  const handleLinkWorkshop = async () => {
    if (!linkModal) return;
    const workshopId = selectedWorkshopId ? parseInt(selectedWorkshopId) : null;
    setLinkingId(linkModal.id);
    try {
      const res = await fetch(`/api/admin/users/${linkModal.id}/workshop`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ workshopId, role: workshopId ? 'workshop' : 'customer' }),
      });
      if (!res.ok) throw new Error();
      toast({ title: workshopId ? 'تم ربط الحساب بالورشة' : 'تم إلغاء الربط' });
      queryClient.invalidateQueries();
      setLinkModal(null);
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل ربط الورشة' });
    } finally {
      setLinkingId(null);
    }
  };

  const filtered = (users as UserRow[] | undefined)?.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone ?? '').includes(search) ||
    (u.email ?? '').toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">إدارة المستخدمين</h1>
          <p className="text-white/50 text-sm">{users?.length ?? 0} مستخدم مسجل</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1E2761]/60 border border-white/10 rounded-xl px-4 py-2 w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف..."
            className="bg-transparent text-white text-sm placeholder-white/30 outline-none w-full"
          />
        </div>
      </div>

      <div className="bg-[#1E2761]/60 rounded-2xl border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-bold">لا توجد نتائج</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs font-bold border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-right">#</th>
                  <th className="px-4 py-4 text-right">الاسم</th>
                  <th className="px-4 py-4 text-right">التواصل</th>
                  <th className="px-4 py-4 text-right">الورشة المرتبطة</th>
                  <th className="px-4 py-4 text-right">الطلبات</th>
                  <th className="px-4 py-4 text-right">الصلاحية</th>
                  <th className="px-4 py-4 text-right">تاريخ التسجيل</th>
                  <th className="px-4 py-4 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isAdmin = u.role === 'admin';
                  const isWorkshop = u.role === 'workshop';
                  const isMe = u.id === currentUser?.id;
                  const isUpdating = updatingId === u.id;
                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/50 font-mono text-xs">{u.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"
                            style={{ background: isWorkshop ? '#0369a130' : undefined }}>
                            {isWorkshop
                              ? <Wrench className="w-4 h-4 text-sky-400" />
                              : <span className="text-white/70 text-xs font-bold">{u.name[0]}</span>
                            }
                          </div>
                          <div>
                            <p className="text-white font-bold whitespace-nowrap">
                              {u.name}
                              {isMe && <span className="text-[#F9E795] text-xs mr-1">(أنت)</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {u.phone && <p className="text-white/70 text-xs" dir="ltr">{u.phone}</p>}
                        {u.email && <p className="text-white/50 text-xs">{u.email}</p>}
                      </td>
                      <td className="px-4 py-4">
                        {u.workshopName ? (
                          <div className="flex items-center gap-1.5">
                            <Wrench size={11} className="text-sky-400 flex-shrink-0" />
                            <span className="text-sky-300 text-xs font-bold">{u.workshopName}</span>
                          </div>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${u.orderCount > 0 ? 'bg-[#F9E795]/20 text-[#F9E795]' : 'bg-white/10 text-white/40'}`}>
                          {u.orderCount} طلب
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold w-fit border ${ROLE_COLORS[u.role] ?? ROLE_COLORS.customer}`}>
                          {isAdmin ? <ShieldCheck className="w-3 h-3" /> : isWorkshop ? <Wrench className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-white/40 text-xs whitespace-nowrap">
                        {format(new Date(u.createdAt), 'dd/MM/yyyy', { locale: ar })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {/* Link/unlink workshop */}
                          {!isMe && !isAdmin && (
                            <button
                              onClick={() => openLinkModal(u)}
                              className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all"
                              title="ربط بورشة"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Admin role toggle */}
                          {!isMe && !isWorkshop ? (
                            isUpdating ? (
                              <Loader2 className="w-4 h-4 text-[#F9E795] animate-spin" />
                            ) : (
                              <button
                                onClick={() => handleRoleToggle(u.id, u.role)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                  isAdmin
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20'
                                    : 'bg-[#F9E795]/10 text-[#F9E795] hover:bg-[#F9E795]/20 border-[#F9E795]/20'
                                }`}
                              >
                                {isAdmin ? 'تحويل لعميل' : 'ترقية لمدير'}
                              </button>
                            )
                          ) : isMe ? (
                            <span className="text-white/20 text-xs">—</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Link Workshop Modal */}
      {linkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setLinkModal(null)}>
          <div
            className="bg-[#0F1625] border border-sky-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
            style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}
          >
            <div className="h-0.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">ربط بورشة</h2>
                <p className="text-white/40 text-sm mt-0.5">{linkModal.name} — صلاحية ورشة</p>
              </div>
              <button onClick={() => setLinkModal(null)} className="w-8 h-8 rounded-lg bg-white/10 text-white/50 hover:bg-white/20 flex items-center justify-center">
                <X size={14} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-white/60 text-sm">
                اختر الورشة التي ينتمي إليها هذا المستخدم. سيتم منحه صلاحية "ورشة" تتيح له رؤية طلبات ورشته.
              </p>
              <div>
                <label className="text-white/50 text-xs font-bold mb-2 block">اختر الورشة</label>
                <select
                  value={selectedWorkshopId}
                  onChange={e => setSelectedWorkshopId(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-sky-500/50"
                  style={{ background: '#0F1625' }}
                >
                  <option value="">بدون ورشة (عميل عادي)</option>
                  {workshops.map(w => (
                    <option key={w.id} value={w.id}>{w.name} — {w.phone}</option>
                  ))}
                </select>
              </div>

              {linkModal.workshopName && (
                <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-2">
                  <Wrench size={13} className="text-sky-400" />
                  <span className="text-sky-300 text-xs font-bold">مرتبط حاليًا بـ: {linkModal.workshopName}</span>
                </div>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setLinkModal(null)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all">
                إلغاء
              </button>
              <button
                onClick={handleLinkWorkshop}
                disabled={linkingId === linkModal.id}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:bg-sky-500/30"
              >
                {linkingId === linkModal.id ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
                {selectedWorkshopId ? 'ربط بالورشة' : 'إلغاء الربط'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
