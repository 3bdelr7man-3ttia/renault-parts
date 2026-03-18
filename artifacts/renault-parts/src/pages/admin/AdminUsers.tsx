import React, { useState } from 'react';
import { useListAdminUsers, useUpdateUserRole } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function AdminUsers() {
  const { getAuthHeaders, user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const headers = getAuthHeaders();
  const { data: users, isLoading } = useListAdminUsers({ request: headers });

  const { mutate: updateRole } = useUpdateUserRole({
    request: headers,
    mutation: {
      onSuccess: (updated) => {
        toast({ title: 'تم تحديث الصلاحية', description: `${updated.name} → ${updated.role === 'admin' ? 'مدير' : 'عميل'}` });
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
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    setUpdatingId(userId);
    updateRole({ id: userId, data: { role: newRole as any } });
  };

  const filtered = users?.filter(u =>
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

        {/* Search */}
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
                  <th className="px-4 py-4 text-right">السيارة</th>
                  <th className="px-4 py-4 text-right">المنطقة</th>
                  <th className="px-4 py-4 text-right">الطلبات</th>
                  <th className="px-4 py-4 text-right">الصلاحية</th>
                  <th className="px-4 py-4 text-right">تاريخ التسجيل</th>
                  <th className="px-4 py-4 text-right">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isAdmin = u.role === 'admin';
                  const isMe = u.id === currentUser?.id;
                  const isUpdating = updatingId === u.id;
                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/50 font-mono text-xs">{u.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-white/70 text-xs font-bold">{u.name[0]}</span>
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
                      <td className="px-4 py-4 text-white/60 text-xs">
                        {u.carModel ? `${u.carModel} ${u.carYear ?? ''}` : <span className="text-white/20">—</span>}
                      </td>
                      <td className="px-4 py-4 text-white/60 text-xs">
                        {u.area ?? <span className="text-white/20">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          u.orderCount > 0 ? 'bg-[#F9E795]/20 text-[#F9E795]' : 'bg-white/10 text-white/40'
                        }`}>
                          {u.orderCount} طلب
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold w-fit ${
                          isAdmin
                            ? 'bg-[#F9E795]/20 text-[#F9E795] border border-[#F9E795]/30'
                            : 'bg-white/10 text-white/60 border border-white/10'
                        }`}>
                          {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {isAdmin ? 'مدير' : 'عميل'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-white/40 text-xs whitespace-nowrap">
                        {format(new Date(u.createdAt), 'dd/MM/yyyy', { locale: ar })}
                      </td>
                      <td className="px-4 py-4">
                        {isMe ? (
                          <span className="text-white/20 text-xs">—</span>
                        ) : isUpdating ? (
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
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
