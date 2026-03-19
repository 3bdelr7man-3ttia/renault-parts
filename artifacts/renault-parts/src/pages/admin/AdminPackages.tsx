import React, { useState } from 'react';
import { useListAdminPackages, useUpdatePackage, useListParts } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Package2, Edit2, Check, X, Loader2, Plus, ChevronDown, Shield, Zap, Disc, Battery, Settings, Wind, Wrench, Droplets, Tag } from 'lucide-react';

const G  = '#C8974A';
const BG = '#0D1220';
const CARD = '#1E2761';

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
      <div className="space-y-2 pt-3 border-t border-white/10">
        {[...Array(3)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />)}
      </div>
    );
  }

  if (!parts || parts.length === 0) {
    return (
      <div className="pt-3 border-t border-white/10 text-center py-4">
        <p className="text-white/30 text-xs font-bold">لا توجد قطع مرتبطة بهذا الباكدج</p>
      </div>
    );
  }

  return (
    <div className="pt-3 border-t border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <Wrench size={12} className="text-[#C8974A]" />
        <span className="text-white/50 text-xs font-bold">القطع المشمولة ({parts.length})</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {parts.map(p => {
          const Icon = PART_ICONS[p.type] ?? PART_ICONS.default;
          return (
            <div key={p.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
              <div className="w-7 h-7 rounded-md bg-[#C8974A]/10 flex items-center justify-center flex-shrink-0">
                <Icon size={12} className="text-[#C8974A]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-bold truncate">{p.name}</div>
                <div className="flex items-center gap-1">
                  <Tag size={8} className="text-white/30" />
                  <span className="text-white/40 text-[10px] font-bold">{PART_TYPE_LABELS[p.type] ?? p.type}</span>
                  <span className="text-[#C8974A] text-[10px] font-bold mr-auto">{(p.priceOriginal ?? p.priceTurkish)?.toLocaleString()} ج.م</span>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">إدارة الباكدجات</h1>
          <p className="text-white/50 text-sm">تعديل أسعار ومحتوى باكدجات الصيانة</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          style={{ background: 'linear-gradient(135deg,#C8974A,#DEB06C)', color: '#0D1220', boxShadow: '0 4px 18px rgba(200,151,74,0.35)' }}
        >
          <Plus size={15} />
          إضافة باكدج جديد
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {(packages ?? []).map((pkg) => {
            const isEditing = editingId === pkg.id;
            const isSaving = savingId === pkg.id;
            const partsExpanded = expandedParts.has(pkg.id);

            return (
              <div key={pkg.id} className="bg-[#1E2761]/60 rounded-2xl border border-white/10 p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F9E795]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package2 className="w-5 h-5 text-[#F9E795]" />
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          value={editState.name}
                          onChange={e => setEditState(s => ({ ...s, name: e.target.value }))}
                          className="bg-white/10 text-white font-bold text-lg px-3 py-1 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50 w-full"
                        />
                      ) : (
                        <h3 className="text-white font-bold text-lg">{pkg.name}</h3>
                      )}
                      <span className="text-[#F9E795] text-xs font-bold bg-[#F9E795]/10 px-2 py-0.5 rounded-full">
                        {KM_LABELS[pkg.kmService] ?? `${pkg.kmService.toLocaleString()} كم`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Availability toggle */}
                    <button
                      onClick={() => toggleAvailability(pkg.id, pkg.isAvailable ?? true)}
                      disabled={togglingAvailId === pkg.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all border"
                      style={{
                        background: (pkg.isAvailable ?? true) ? '#22c55e15' : '#ef444415',
                        borderColor: (pkg.isAvailable ?? true) ? '#22c55e40' : '#ef444440',
                        color: (pkg.isAvailable ?? true) ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {togglingAvailId === pkg.id
                        ? <Loader2 size={10} className="animate-spin" />
                        : <span className="w-1.5 h-1.5 rounded-full" style={{ background: (pkg.isAvailable ?? true) ? '#22c55e' : '#ef4444' }} />
                      }
                      {(pkg.isAvailable ?? true) ? 'متاح' : 'موقف'}
                    </button>
                    <button
                      onClick={() => toggleParts(pkg.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all text-xs font-bold"
                    >
                      <Wrench size={12} />
                      القطع
                      <ChevronDown size={10} style={{ transform: partsExpanded ? 'rotate(180deg)' : '', transition: 'transform .2s' }} />
                    </button>
                    {isEditing ? (
                      <>
                        <button
                          onClick={cancelEdit}
                          className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => saveEdit(pkg.id)}
                          disabled={isSaving}
                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/40 transition-all disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(pkg)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all text-sm font-bold"
                      >
                        <Edit2 className="w-4 h-4" />
                        تعديل
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="text-white/40 text-xs font-bold mb-1 block">الوصف</label>
                    {isEditing ? (
                      <textarea
                        value={editState.description}
                        onChange={e => setEditState(s => ({ ...s, description: e.target.value }))}
                        rows={2}
                        className="w-full bg-white/10 text-white text-sm px-3 py-2 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50 resize-none"
                      />
                    ) : (
                      <p className="text-white/70 text-sm leading-relaxed">{pkg.description}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Sell Price */}
                    <div>
                      <label className="text-white/40 text-xs font-bold mb-1 block">سعر البيع (ج.م)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editState.sellPrice}
                          onChange={e => setEditState(s => ({ ...s, sellPrice: e.target.value }))}
                          className="w-full bg-white/10 text-[#F9E795] font-bold text-lg px-3 py-1.5 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50"
                        />
                      ) : (
                        <p className="text-[#F9E795] font-black text-xl">{pkg.sellPrice.toLocaleString()} ج.م</p>
                      )}
                    </div>

                    {/* Warranty */}
                    <div>
                      <label className="text-white/40 text-xs font-bold mb-1 block">الضمان (شهر)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editState.warrantyMonths}
                          onChange={e => setEditState(s => ({ ...s, warrantyMonths: e.target.value }))}
                          className="w-full bg-white/10 text-white font-bold px-3 py-1.5 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Shield size={12} className="text-[#3DA882]" />
                          <p className="text-white font-bold">{pkg.warrantyMonths} شهر</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parts panel */}
                {partsExpanded && (
                  <PackagePartsPanel pkgId={pkg.id} headers={headers} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Package Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#0F1625] border border-[#C8974A]/20 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()} style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C8974A] to-transparent" />
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">باكدج جديد</h2>
                  <p className="text-white/40 text-sm mt-0.5">أضف باكدج صيانة للمتجر</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg bg-white/10 text-white/50 hover:bg-white/20 flex items-center justify-center transition-all">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-white/50 text-xs font-bold mb-1 block">اسم الباكدج *</label>
                <input
                  value={addState.name}
                  onChange={e => setAddState(s => ({ ...s, name: e.target.value }))}
                  placeholder="مثال: صيانة 40 ألف كم الشاملة"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-[#C8974A]/50 placeholder-white/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-white/50 text-xs font-bold mb-1 block">الوصف</label>
                <textarea
                  value={addState.description}
                  onChange={e => setAddState(s => ({ ...s, description: e.target.value }))}
                  rows={2}
                  placeholder="وصف مختصر للباكدج..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-[#C8974A]/50 placeholder-white/20 resize-none"
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">سعر البيع (ج.م) *</label>
                  <input
                    type="number"
                    value={addState.sellPrice}
                    onChange={e => setAddState(s => ({ ...s, sellPrice: e.target.value }))}
                    placeholder="1299"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[#C8974A] font-black text-lg outline-none focus:border-[#C8974A]/50 placeholder-white/10"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">السعر الأصلي (ج.م)</label>
                  <input
                    type="number"
                    value={addState.basePrice}
                    onChange={e => setAddState(s => ({ ...s, basePrice: e.target.value }))}
                    placeholder="1599"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/60 font-bold text-lg outline-none focus:border-[#C8974A]/50 placeholder-white/10"
                  />
                </div>
              </div>

              {/* KM + Warranty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">نوع الصيانة</label>
                  <select
                    value={addState.kmService}
                    onChange={e => setAddState(s => ({ ...s, kmService: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-[#C8974A]/50"
                  >
                    {KM_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#0F1625' }}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">مدة الضمان (شهر)</label>
                  <input
                    type="number"
                    value={addState.warrantyMonths}
                    onChange={e => setAddState(s => ({ ...s, warrantyMonths: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-[#C8974A]/50"
                  />
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="text-white/50 text-xs font-bold mb-1 block">الـ Slug (رابط الباكدج)</label>
                <input
                  value={addState.slug}
                  onChange={e => setAddState(s => ({ ...s, slug: e.target.value }))}
                  placeholder={addState.name ? generateSlug(addState.name) : 'سيتم إنشاؤه تلقائياً'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/50 font-bold text-sm outline-none focus:border-[#C8974A]/50 placeholder-white/20 font-mono"
                  dir="ltr"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-white/50 text-xs font-bold mb-1 block">رابط صورة الباكدج (Image URL)</label>
                <input
                  value={addState.imageUrl}
                  onChange={e => setAddState(s => ({ ...s, imageUrl: e.target.value }))}
                  placeholder="https://example.com/package.jpg"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/70 font-bold text-sm outline-none focus:border-[#C8974A]/50 placeholder-white/20 font-mono"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddPkg}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg,#C8974A,#DEB06C)', color: '#0D1220', boxShadow: '0 4px 14px rgba(200,151,74,0.35)' }}
              >
                <Plus size={14} style={{ display: 'inline', marginLeft: 4 }} />
                إضافة الباكدج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
