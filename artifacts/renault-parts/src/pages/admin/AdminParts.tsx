import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Wrench, Plus, Trash2, Loader2, X, Image as ImageIcon, Tag } from 'lucide-react';

const G   = '#C8974A';
const BG  = '#0D1220';

type Part = {
  id: number;
  name: string;
  type: string;
  price: number;
  imageUrl: string | null;
  packageId: number | null;
  brand: string | null;
  warrantyMonths: number | null;
};

type AddPartState = {
  name: string;
  type: string;
  price: string;
  brand: string;
  warrantyMonths: string;
  imageUrl: string;
};

const PART_TYPES = [
  { value: 'oil',         label: 'زيت محرك' },
  { value: 'filter',      label: 'فلتر' },
  { value: 'spark_plugs', label: 'شمعات' },
  { value: 'belt',        label: 'سير' },
  { value: 'brake',       label: 'فرامل' },
  { value: 'suspension',  label: 'تعليق' },
  { value: 'battery',     label: 'بطارية' },
  { value: 'tire',        label: 'إطار' },
  { value: 'lights',      label: 'كشافات' },
  { value: 'other',       label: 'أخرى' },
];

const TYPE_LABELS: Record<string, string> = Object.fromEntries(PART_TYPES.map(t => [t.value, t.label]));

const emptyAdd: AddPartState = { name: '', type: 'oil', price: '', brand: '', warrantyMonths: '12', imageUrl: '' };

export default function AdminParts() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const [parts, setParts]           = useState<Part[]>([]);
  const [loading, setLoading]       = useState(false);
  const [fetched, setFetched]       = useState(false);
  const [showAdd, setShowAdd]       = useState(false);
  const [addState, setAddState]     = useState<AddPartState>(emptyAdd);
  const [adding, setAdding]         = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchParts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/parts', { headers: authHeader });
      if (!res.ok) throw new Error();
      const data: Part[] = await res.json();
      setParts(data);
      setFetched(true);
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحميل القطع' });
    } finally {
      setLoading(false);
    }
  };

  if (!fetched && !loading) { fetchParts(); }

  const handleAdd = async () => {
    if (!addState.name || !addState.price || !addState.type) {
      toast({ variant: 'destructive', title: 'بيانات ناقصة', description: 'الاسم والنوع والسعر مطلوبة' });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/admin/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          name: addState.name,
          type: addState.type,
          price: parseFloat(addState.price),
          brand: addState.brand || null,
          warrantyMonths: addState.warrantyMonths ? parseInt(addState.warrantyMonths) : null,
          imageUrl: addState.imageUrl || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: '✓ تم إضافة القطعة بنجاح' });
      setShowAdd(false);
      setAddState(emptyAdd);
      queryClient.invalidateQueries();
      await fetchParts();
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل إضافة القطعة' });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/parts/${id}`, { method: 'DELETE', headers: authHeader });
      if (!res.ok) throw new Error();
      toast({ title: 'تم حذف القطعة' });
      setParts(p => p.filter(x => x.id !== id));
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل الحذف' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6" style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">إدارة القطع</h1>
          <p className="text-white/50 text-sm">إضافة وحذف قطع الغيار المتاحة في المنصة</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          style={{ background: `linear-gradient(135deg,${G},#DEB06C)`, color: BG, boxShadow: `0 4px 18px rgba(200,151,74,0.35)` }}
        >
          <Plus size={15} />
          إضافة قطعة جديدة
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : parts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Wrench size={40} className="text-white/10 mb-4" />
          <p className="text-white/30 font-bold text-lg">لا توجد قطع مضافة بعد</p>
          <p className="text-white/20 text-sm mt-1">ابدأ بإضافة قطعة من الزر أعلاه</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {parts.map(part => (
            <div key={part.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
              {/* Image */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
                {part.imageUrl
                  ? <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover" />
                  : <ImageIcon size={20} className="text-white/20" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold text-base truncate">{part.name}</span>
                  {part.brand && (
                    <span className="text-white/40 text-xs font-bold bg-white/5 border border-white/10 rounded-full px-2 py-0.5">{part.brand}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs font-bold" style={{ color: G }}>
                    <Tag size={10} />
                    {TYPE_LABELS[part.type] ?? part.type}
                  </span>
                  {part.warrantyMonths && (
                    <span className="text-white/40 text-xs font-bold">ضمان {part.warrantyMonths} شهر</span>
                  )}
                  {part.packageId && (
                    <span className="text-white/30 text-xs">باكدج #{part.packageId}</span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <span className="text-xl font-black" style={{ color: G }}>{part.price?.toLocaleString()}</span>
                <span className="text-white/40 text-xs font-bold"> ج.م</span>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(part.id)}
                disabled={deletingId === part.id}
                className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center flex-shrink-0 transition-all"
              >
                {deletingId === part.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Part Modal ── */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-[#0F1625] border border-[#C8974A]/20 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
            style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}
          >
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C8974A] to-transparent" />
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">قطعة جديدة</h2>
                <p className="text-white/40 text-sm mt-0.5">أضف قطعة غيار للمنصة</p>
              </div>
              <button
                onClick={() => setShowAdd(false)}
                className="w-8 h-8 rounded-lg bg-white/10 text-white/50 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">اسم القطعة *</label>
                  <input
                    value={addState.name}
                    onChange={e => setAddState(s => ({ ...s, name: e.target.value }))}
                    placeholder="زيت موبيل 5W-30"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-[#C8974A]/50 placeholder-white/20"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">نوع القطعة *</label>
                  <select
                    value={addState.type}
                    onChange={e => setAddState(s => ({ ...s, type: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-[#C8974A]/50"
                    style={{ background: '#0F1625' }}
                  >
                    {PART_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">السعر (ج.م) *</label>
                  <input
                    type="number"
                    value={addState.price}
                    onChange={e => setAddState(s => ({ ...s, price: e.target.value }))}
                    placeholder="299"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[#C8974A] font-black text-lg outline-none focus:border-[#C8974A]/50"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">الضمان (شهر)</label>
                  <input
                    type="number"
                    value={addState.warrantyMonths}
                    onChange={e => setAddState(s => ({ ...s, warrantyMonths: e.target.value }))}
                    placeholder="12"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-[#C8974A]/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/50 text-xs font-bold mb-1 block">الماركة / البراند</label>
                <input
                  value={addState.brand}
                  onChange={e => setAddState(s => ({ ...s, brand: e.target.value }))}
                  placeholder="Mobil, Bosch, NGK..."
                  dir="ltr"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-[#C8974A]/50 placeholder-white/20"
                />
              </div>

              <div>
                <label className="text-white/50 text-xs font-bold mb-1 block">رابط صورة القطعة (Image URL)</label>
                <input
                  value={addState.imageUrl}
                  onChange={e => setAddState(s => ({ ...s, imageUrl: e.target.value }))}
                  placeholder="https://example.com/part.jpg"
                  dir="ltr"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/70 font-bold text-sm outline-none focus:border-[#C8974A]/50 placeholder-white/20 font-mono"
                />
                {addState.imageUrl && (
                  <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                    <img src={addState.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={handleAdd}
                disabled={adding}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg,${G},#DEB06C)`, color: BG, boxShadow: `0 4px 14px rgba(200,151,74,0.35)`, opacity: adding ? 0.7 : 1 }}
              >
                {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {adding ? 'جاري الإضافة...' : 'إضافة القطعة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
