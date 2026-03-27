import React, { useState, useEffect } from 'react';
import { useListAdminUsers, useUpdateUserRole } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { adminUi } from '@/components/admin/admin-ui';
import { Search, ShieldCheck, User, Loader2, Wrench, Link as LinkIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getRoleLabel, normalizeRole, type EmployeeRole } from '@/lib/permissions';

type Workshop = { id: number; name: string; phone: string };

type UserRow = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  role: string;
  employeeRole?: EmployeeRole | null;
  workshopId?: number | null;
  workshopName?: string | null;
  carModel?: string | null;
  carYear?: number | null;
  area?: string | null;
  orderCount: number;
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'مدير',
  customer: 'عميل',
  employee: 'موظف',
  workshop_owner: 'صاحب ورشة',
  workshop: 'صاحب ورشة',
};
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-amber-50 text-amber-700 border-amber-200',
  employee: 'bg-violet-50 text-violet-700 border-violet-200',
  customer: 'bg-slate-50 text-slate-600 border-slate-200',
  workshop_owner: 'bg-sky-50 text-sky-700 border-sky-200',
  workshop: 'bg-sky-50 text-sky-700 border-sky-200',
};
const EMPLOYEE_ROLE_LABELS: Record<EmployeeRole, string> = {
  sales: 'مبيعات ومتابعة',
  data_entry: 'داتا وقطع',
  technical_expert: 'خبير فني',
  marketing_tech: 'تسويق وتقنية',
  manager: 'مدير فريق',
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
  const [draftRoles, setDraftRoles] = useState<Record<number, 'customer' | 'employee' | 'workshop_owner' | 'admin'>>({});
  const [draftEmployeeRoles, setDraftEmployeeRoles] = useState<Record<number, EmployeeRole | ''>>({});

  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const headers = getAuthHeaders();
  const { data: users, isLoading } = useListAdminUsers({ request: headers });

  useEffect(() => {
    fetch('/api/admin/workshops', { headers: authHeader })
      .then(r => r.json())
      .then((ws: Workshop[]) => setWorkshops(ws))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const nextRoles: Record<number, 'customer' | 'employee' | 'workshop_owner' | 'admin'> = {};
    const nextEmployeeRoles: Record<number, EmployeeRole | ''> = {};

    ((users as UserRow[] | undefined) ?? []).forEach((u) => {
      const normalizedRole = normalizeRole(u.role);
      nextRoles[u.id] = normalizedRole === 'admin' || normalizedRole === 'employee' || normalizedRole === 'workshop_owner'
        ? normalizedRole
        : 'customer';
      nextEmployeeRoles[u.id] = u.employeeRole ?? '';
    });

    setDraftRoles(nextRoles);
    setDraftEmployeeRoles(nextEmployeeRoles);
  }, [users]);

  const { mutate: updateRole } = useUpdateUserRole({
    request: headers,
    mutation: {
      onSuccess: () => {
        toast({ title: 'تم تحديث الصلاحية', description: 'تم حفظ الدور الجديد بنجاح.' });
        queryClient.invalidateQueries();
        setUpdatingId(null);
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحديث الصلاحية' });
        setUpdatingId(null);
      },
    },
  });

  const handleRoleSave = (targetUser: UserRow) => {
    const role = draftRoles[targetUser.id];
    const employeeRole = draftEmployeeRoles[targetUser.id] || null;

    if (role === 'employee' && !employeeRole) {
      toast({ variant: 'destructive', title: 'نوع الموظف مطلوب', description: 'اختر دور الموظف قبل الحفظ.' });
      return;
    }

    setUpdatingId(targetUser.id);
    updateRole({
      id: targetUser.id,
      data: {
        role,
        employeeRole: role === 'employee' ? employeeRole : null,
      },
    });
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
        body: JSON.stringify({ workshopId, role: workshopId ? 'workshop_owner' : 'customer' }),
      });
      if (!res.ok) throw new Error();
      toast({ title: workshopId ? 'تم ربط الحساب بالورشة' : 'تم إلغاء الربط', description: workshopId ? 'تم تحويل الحساب إلى صاحب ورشة.' : 'تمت إعادة الحساب إلى عميل عادي.' });
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
    <div className={adminUi.page}>
      <div className={adminUi.hero}>
        <div className={adminUi.toolbar}>
        <div>
            <h1 className={adminUi.title}>إدارة المستخدمين</h1>
            <p className={adminUi.subtitle}>{users?.length ?? 0} مستخدم مسجل مع الصلاحيات والربط التشغيلي الحالي.</p>
        </div>
        <div className={`${adminUi.searchShell} w-full sm:w-80`}>
          <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
        </div>
      </div>

      <div className={adminUi.tableShell}>
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center font-bold text-slate-400">لا توجد نتائج</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${adminUi.tableHead} border-b border-slate-200`}>
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
                  const normalizedRole = normalizeRole(u.role);
                  const isAdmin = normalizedRole === 'admin';
                  const isWorkshop = normalizedRole === 'workshop_owner';
                  const isMe = u.id === currentUser?.id;
                  const isUpdating = updatingId === u.id;
                  const fallbackRole = normalizedRole === 'admin' || normalizedRole === 'employee' || normalizedRole === 'workshop_owner'
                    ? normalizedRole
                    : 'customer';
                  const draftRole = draftRoles[u.id] ?? fallbackRole;
                  const draftEmployeeRole = draftEmployeeRoles[u.id] ?? '';
                  return (
                    <tr key={u.id} className={adminUi.tableRow}>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">{u.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50"
                            style={{ background: isWorkshop ? '#e0f2fe' : undefined }}>
                            {isWorkshop
                              ? <Wrench className="w-4 h-4 text-sky-600" />
                              : <span className="text-xs font-bold text-slate-600">{u.name[0]}</span>
                            }
                          </div>
                          <div>
                            <p className="whitespace-nowrap font-bold text-slate-900">
                              {u.name}
                              {isMe && <span className="mr-1 text-xs text-amber-600">(أنت)</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {u.phone && <p className="text-xs text-slate-700" dir="ltr">{u.phone}</p>}
                        {u.email && <p className="text-xs text-slate-500">{u.email}</p>}
                      </td>
                      <td className="px-4 py-4">
                        {u.workshopName ? (
                          <div className="flex items-center gap-1.5">
                            <Wrench size={11} className="text-sky-600 flex-shrink-0" />
                            <span className="text-xs font-bold text-sky-700">{u.workshopName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-xl px-2.5 py-1 text-xs font-bold ${u.orderCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                          {u.orderCount} طلب
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold w-fit border ${ROLE_COLORS[normalizedRole] ?? ROLE_COLORS.customer}`}>
                          {isAdmin ? <ShieldCheck className="w-3 h-3" /> : isWorkshop ? <Wrench className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {ROLE_LABELS[normalizedRole] ?? getRoleLabel(u.role, u.employeeRole)}
                        </span>
                        {normalizedRole === 'employee' && u.employeeRole && (
                          <p className="mt-2 text-[11px] font-bold text-violet-700">{EMPLOYEE_ROLE_LABELS[u.employeeRole]}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs whitespace-nowrap text-slate-400">
                        {format(new Date(u.createdAt), 'dd/MM/yyyy', { locale: ar })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {/* Link/unlink workshop */}
                          {!isMe && !isAdmin && (
                            <button
                              onClick={() => openLinkModal(u)}
                              className="rounded-lg bg-sky-50 p-1.5 text-sky-700 transition-all hover:bg-sky-100"
                              title="ربط بورشة"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {!isMe ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={draftRole}
                                onChange={(e) => {
                                  const nextRole = e.target.value as 'customer' | 'employee' | 'workshop_owner' | 'admin';
                                  setDraftRoles((current) => ({ ...current, [u.id]: nextRole }));
                                  if (nextRole !== 'employee') {
                                    setDraftEmployeeRoles((current) => ({ ...current, [u.id]: '' }));
                                  }
                                }}
                                className={adminUi.selectSm}
                              >
                                <option value="customer">عميل</option>
                                <option value="employee">موظف</option>
                                <option value="admin">مدير</option>
                                <option value="workshop_owner">صاحب ورشة</option>
                              </select>

                              {draftRole === 'employee' && (
                                <select
                                  value={draftEmployeeRole}
                                  onChange={(e) => setDraftEmployeeRoles((current) => ({ ...current, [u.id]: e.target.value as EmployeeRole | '' }))}
                                  className={adminUi.selectSm}
                                >
                                  <option value="">نوع الموظف</option>
                                  {Object.entries(EMPLOYEE_ROLE_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                  ))}
                                </select>
                              )}

                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                              ) : (
                                <button
                                  onClick={() => handleRoleSave(u)}
                                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition-all hover:bg-amber-100"
                                >
                                  حفظ
                                </button>
                              )}
                            </div>
                          ) : isMe ? (
                            <span className="text-xs text-slate-300">—</span>
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
        <div className={adminUi.modalOverlay} onClick={() => setLinkModal(null)}>
          <div
            className={`${adminUi.modalPanel} max-w-md`}
            onClick={e => e.stopPropagation()}
            style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}
          >
            <div className="h-0.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
            <div className={adminUi.modalHeader}>
              <div>
                <h2 className="text-xl font-black text-slate-950">ربط بورشة</h2>
                <p className="mt-0.5 text-sm text-slate-500">{linkModal.name} — صلاحية ورشة</p>
              </div>
              <button onClick={() => setLinkModal(null)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                <X size={14} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                اختر الورشة التي ينتمي إليها هذا المستخدم. سيتم منحه صلاحية "صاحب ورشة" تتيح له رؤية طلبات ورشته.
              </p>
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">اختر الورشة</label>
                <select
                  value={selectedWorkshopId}
                  onChange={e => setSelectedWorkshopId(e.target.value)}
                  className={adminUi.select}
                >
                  <option value="">بدون ورشة (عميل عادي)</option>
                  {workshops.map(w => (
                    <option key={w.id} value={w.id}>{w.name} — {w.phone}</option>
                  ))}
                </select>
              </div>

              {linkModal.workshopName && (
                <div className="flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
                  <Wrench size={13} className="text-sky-600" />
                  <span className="text-xs font-bold text-sky-700">مرتبط حاليًا بـ: {linkModal.workshopName}</span>
                </div>
              )}
            </div>
            <div className={adminUi.modalFooter}>
              <button onClick={() => setLinkModal(null)} className={`${adminUi.secondaryButton} flex-1 justify-center`}>
                إلغاء
              </button>
              <button
                onClick={handleLinkWorkshop}
                disabled={linkingId === linkModal.id}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 py-3 text-sm font-bold text-sky-700 transition-all hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
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
