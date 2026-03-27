import React, { useState } from 'react';
import { useListAdminPackages, useUpdatePackage, useListParts } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { adminSemantic, adminUi } from '@/components/admin/admin-ui';
import { Package2, Edit2, Check, X, Loader2, Plus, ChevronDown, Shield, Zap, Disc, Battery, Settings, Wind, Wrench, Droplets, Tag, Trash2, AlertTriangle } from 'lucide-react';

type EditState = {
  name: string;
  description: string;
  sellPrice: string;
  warrantyMonths: string;
};

type AddPkgState = {
  name: string;
  description: string;
  sellPrice: string;
  basePrice: string;
  warrantyMonths: string;
  kmService: string;
  slug: string;
  imageUrl: string;
};

const PART_ICONS: Record<string, React.ElementType> = {
  oil: Droplets, filter: Wind, spark_plugs: Zap, belt: Settings,
  brake: Disc, suspension: Settings, battery: Battery, tire: Settings,
  lights: Zap, default: Wrench,
};

const PART_TYPE_LABELS: Record<string, string> = {
  filter: 'فلتر', oil: 'زيت', spark_plugs: 'شمعات', belt: 'سير',
  brake: 'فرامل', suspension: 'تعليق', battery: 'بطارية',
  tire: 'إطار', lights: 'كشافات',
};

const KM_OPTIONS = [
  { value: '20000', label: 'صيانة 20,000 كم' },
  { value: '40000', label: 'صيانة 40,000 كم' },
  { value: '60000', label: 'صيانة 60,000 كم' },
  { value: '100000', label: 'صيانة 100,000 كم' },
  { value: '0',     label: 'باكدج طوارئ' },
];

const KM_LABELS: Record<number, string> = {
  20000: '20,000 كم', 40000: '40,000 كم', 60000: '60,000 كم',
  100000: '100,000 كم', 0: 'طوارئ',
};

function PackagePartsPanel({ pkgId, headers }: { pkgId: number; headers: { headers?: { Authorization: string } } }) {
  const { data: parts, isLoading } = useListParts({ packageId: pkgId }, { request: headers });

  if (isLoading) {
    return (
      <div className="space-y-2 border-t border-slate-200 pt-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />)}
      </div>
    );
  }

  if (!parts || parts.length === 0) {
    return (
      <div className="border-t border-slate-200 py-4 pt-4 text-center">
        <p className="text-xs font-bold text-slate-400">لا توجد قطع مرتبطة بهذا الباكدج</p>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 pt-4">
      <div className="mb-3 flex items-center gap-2">
        <Wrench size={12} className="text-amber-700" />
        <span className="text-xs font-bold text-slate-500">القطع المشمولة ({parts.length})</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {parts.map((p) => {
          const Icon = PART_ICONS[p.type] ?? PART_ICONS.default;
          return (
            <div key={p.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-amber-50">
                <Icon size={12} className="text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-xs font-bold text-slate-900">{p.name}</div>
                <div className="flex items-center gap-1">
                  <Tag size={8} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500">{PART_TYPE_LABELS[p.type] ?? p.type}</span>
                  <span className="mr-auto text-[10px] font-bold text-amber-700">{(p.priceOriginal ?? p.priceTurkish)?.toLocaleString()} ج.م</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPackages() {
  const { getAuthHeaders, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const headers = getAuthHeaders();
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const { data: packages, isLoading } = useListAdminPackages({ request: headers });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: '', description: '', sellPrice: '', warrantyMonths: '' });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [expandedParts, setExpandedParts] = useState<Set<number>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [addState, setAddState] = useState<AddPkgState>({ name: '', description: '', sellPrice: '', basePrice: '', warrantyMonths: '24', kmService: '40000', slug: '', imageUrl: '' });
  const [togglingAvailId, setTogglingAvailId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const toggleAvailability = async (id: number, current: boolean) => {
    setTogglingAvailId(id);
    try {
      const res = await fetch(`/api/admin/packages/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ isAvailable: !current }),
      });
      if (!res.ok) throw new Error();
      toast({ title: !current ? '✓ الباكدج متاح الآن' : 'الباكدج أُوقف مؤقتاً' });
      queryClient.invalidateQueries();
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تغيير حالة التوفر' });
    } finally {
      setTogglingAvailId(null);
    }
  };

  const handleDeletePkg = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
        headers: { ...authHeader },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'خطأ');
      toast({ title: '✓ تم حذف الباكدج' });
      queryClient.invalidateQueries();
      setConfirmDeleteId(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'فشل حذف الباكدج';
      toast({ variant: 'destructive', title: 'خطأ', description: msg });
    } finally {
      setDeletingId(null);
    }
  };

  const { mutate: updatePkg } = useUpdatePackage({
    request: headers,
    mutation: {
      onSuccess: () => {
        toast({ title: 'تم تحديث الباكدج بنجاح' });
        queryClient.invalidateQueries();
        setEditingId(null);
        setSavingId(null);
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحديث الباكدج' });
        setSavingId(null);
      },
    },
  });

  const startEdit = (pkg: NonNullable<typeof packages>[0]) => {
    setEditingId(pkg.id);
    setEditState({
      name: pkg.name,
      description: pkg.description,
      sellPrice: String(pkg.sellPrice),
      warrantyMonths: String(pkg.warrantyMonths),
    });
  };

  const cancelEdit = () => { setEditingId(null); setSavingId(null); };

  const saveEdit = (id: number) => {
    setSavingId(id);
    updatePkg({
      id,
      data: {
        name: editState.name,
        description: editState.description,
        sellPrice: parseFloat(editState.sellPrice),
        warrantyMonths: parseInt(editState.warrantyMonths),
      },
    });
  };

  const toggleParts = (id: number) => {
    setExpandedParts(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const generateSlug = (name: string) =>
    name.trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[أإاآ]/g, 'a')
      .replace(/[ى]/g, 'a')
      .replace(/[ة]/g, 'h')
      .replace(/[^a-z0-9-]/g, '')
      || `pkg-${Date.now()}`;

  const handleAddPkg = async () => {
    if (!addState.name || !addState.sellPrice) {
      toast({ variant: 'destructive', title: 'بيانات ناقصة', description: 'الاسم والسعر مطلوبان' });
      return;
    }
    const slug = addState.slug || generateSlug(addState.name);
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          name: addState.name,
          description: addState.description,
          slug,
          sellPrice: parseFloat(addState.sellPrice),
          basePrice: parseFloat(addState.basePrice || addState.sellPrice),
          warrantyMonths: parseInt(addState.warrantyMonths),
          kmService: parseInt(addState.kmService),
          imageUrl: addState.imageUrl || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: '✓ تم إضافة الباكدج بنجاح' });
      queryClient.invalidateQueries();
      setShowAddModal(false);
      setAddState({ name: '', description: '', sellPrice: '', basePrice: '', warrantyMonths: '24', kmService: '40000', slug: '', imageUrl: '' });
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل إضافة الباكدج. قد يكون الـ Slug مكرر.' });
    }
  };

  return (
    <div className={adminUi.page}>
      <div className={adminUi.hero}>
        <div className={adminUi.toolbar}>
          <div>
            <h1 className={adminUi.title}>إدارة الباكدجات</h1>
            <p className={adminUi.subtitle}>تعديل الأسعار والمحتوى وإدارة حالة التوفر لكل باكدج.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className={adminUi.primaryButton}
          >
            <Plus size={15} />
            إضافة باكدج
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-[28px] bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {(packages ?? []).map((pkg) => {
            const isEditing = editingId === pkg.id;
            const isSaving = savingId === pkg.id;
            const partsExpanded = expandedParts.has(pkg.id);

            return (
              <div key={pkg.id} className={adminUi.card}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
                      <Package2 className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="min-w-0">
                      {isEditing ? (
                        <input
                          value={editState.name}
                          onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                          className={adminUi.inputSm}
                        />
                      ) : (
                        <h3 className="truncate text-lg font-black text-slate-950">{pkg.name}</h3>
                      )}
                      <span className={`${adminUi.badgeBase} ${adminSemantic.brand} mt-2`}>
                        {KM_LABELS[pkg.kmService] ?? `${pkg.kmService.toLocaleString()} كم`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => toggleAvailability(pkg.id, pkg.isAvailable ?? true)}
                      disabled={togglingAvailId === pkg.id}
                      className={`${adminUi.badgeBase} ${(pkg.isAvailable ?? true) ? adminSemantic.success : adminSemantic.danger}`}
                    >
                      {togglingAvailId === pkg.id ? <Loader2 size={10} className="animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                      {(pkg.isAvailable ?? true) ? 'متاح' : 'موقف'}
                    </button>
                    <button
                      onClick={() => toggleParts(pkg.id)}
                      className={adminUi.softButton}
                    >
                      <Wrench size={12} />
                      القطع
                      <ChevronDown size={10} style={{ transform: partsExpanded ? 'rotate(180deg)' : '', transition: 'transform .2s' }} />
                    </button>
                    {isEditing ? (
                      <>
                        <button
                          onClick={cancelEdit}
                          className={adminUi.secondaryButton}
                        >
                          <X className="h-4 w-4" />
                          إلغاء
                        </button>
                        <button
                          onClick={() => saveEdit(pkg.id)}
                          disabled={isSaving}
                          className={adminUi.primaryButton}
                        >
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          حفظ
                        </button>
                      </>
                    ) : confirmDeleteId === pkg.id ? (
                      <>
                        <span className={`${adminUi.badgeBase} ${adminSemantic.danger}`}>
                          <AlertTriangle size={11} />
                          تأكيد الحذف؟
                        </span>
                        <button
                          onClick={() => handleDeletePkg(pkg.id)}
                          disabled={deletingId === pkg.id}
                          className={adminUi.destructiveButton}
                        >
                          {deletingId === pkg.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                          حذف
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className={adminUi.secondaryButton}
                        >
                          تراجع
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(pkg)}
                          className={adminUi.softButton}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          تعديل
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(pkg.id)}
                          className={adminUi.destructiveButton}
                          title="حذف الباكدج"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          حذف
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-bold text-slate-500">الوصف</label>
                    {isEditing ? (
                      <textarea
                        value={editState.description}
                        onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
                        rows={2}
                        className={`${adminUi.textarea} resize-none`}
                      />
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">{pkg.description}</div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <label className="mb-1 block text-xs font-bold text-slate-500">سعر البيع (ج.م)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editState.sellPrice}
                          onChange={(e) => setEditState((s) => ({ ...s, sellPrice: e.target.value }))}
                          className={`${adminUi.inputSm} font-black text-amber-700`}
                        />
                      ) : (
                        <p className="text-xl font-black text-amber-700">{pkg.sellPrice.toLocaleString()} ج.م</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <label className="mb-1 block text-xs font-bold text-slate-500">الضمان (شهر)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editState.warrantyMonths}
                          onChange={(e) => setEditState((s) => ({ ...s, warrantyMonths: e.target.value }))}
                          className={adminUi.inputSm}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Shield size={12} className="text-emerald-700" />
                          <p className="font-bold text-slate-900">{pkg.warrantyMonths} شهر</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {partsExpanded && <PackagePartsPanel pkgId={pkg.id} headers={headers} />}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className={adminUi.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={`${adminUi.modalPanel} max-w-lg`} onClick={(e) => e.stopPropagation()} style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>
            <div className={adminUi.modalHeader}>
              <div>
                <h2 className="text-xl font-black text-slate-950">باكدج جديد</h2>
                <p className="mt-0.5 text-sm text-slate-500">أضف باكدج صيانة جديد للمتجر.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">اسم الباكدج *</label>
                <input
                  value={addState.name}
                  onChange={e => setAddState(s => ({ ...s, name: e.target.value }))}
                  placeholder="مثال: صيانة 40 ألف كم الشاملة"
                  className={adminUi.input}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">الوصف</label>
                <textarea
                  value={addState.description}
                  onChange={e => setAddState(s => ({ ...s, description: e.target.value }))}
                  rows={2}
                  placeholder="وصف مختصر للباكدج..."
                  className={`${adminUi.textarea} resize-none`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">سعر البيع (ج.م) *</label>
                  <input
                    type="number"
                    value={addState.sellPrice}
                    onChange={e => setAddState(s => ({ ...s, sellPrice: e.target.value }))}
                    placeholder="1299"
                    className={`${adminUi.input} font-black text-amber-700`}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">السعر الأصلي (ج.م)</label>
                  <input
                    type="number"
                    value={addState.basePrice}
                    onChange={e => setAddState(s => ({ ...s, basePrice: e.target.value }))}
                    placeholder="1599"
                    className={adminUi.input}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">نوع الصيانة</label>
                  <select
                    value={addState.kmService}
                    onChange={e => setAddState(s => ({ ...s, kmService: e.target.value }))}
                    className={adminUi.select}
                  >
                    {KM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">مدة الضمان (شهر)</label>
                  <input
                    type="number"
                    value={addState.warrantyMonths}
                    onChange={e => setAddState(s => ({ ...s, warrantyMonths: e.target.value }))}
                    className={adminUi.input}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">الـ Slug (رابط الباكدج)</label>
                <input
                  value={addState.slug}
                  onChange={e => setAddState(s => ({ ...s, slug: e.target.value }))}
                  placeholder={addState.name ? generateSlug(addState.name) : 'سيتم إنشاؤه تلقائياً'}
                  className={adminUi.input}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">رابط صورة الباكدج</label>
                <input
                  value={addState.imageUrl}
                  onChange={e => setAddState(s => ({ ...s, imageUrl: e.target.value }))}
                  placeholder="https://example.com/package.jpg"
                  className={adminUi.input}
                  dir="ltr"
                />
              </div>
            </div>
            <div className={adminUi.modalFooter}>
              <button
                onClick={() => setShowAddModal(false)}
                className={`flex-1 ${adminUi.secondaryButton}`}
              >
                إلغاء
              </button>
              <button
                onClick={handleAddPkg}
                className={`flex-1 ${adminUi.primaryButton}`}
              >
                <Plus size={14} />
                إضافة الباكدج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
