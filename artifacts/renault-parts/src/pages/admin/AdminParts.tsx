import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Wrench, Plus, Trash2, Loader2, X, Image as ImageIcon, Tag, Package, Edit2, Check } from 'lucide-react';

const G   = '#C8974A';
const BG  = '#0D1220';

type Part = {
  id: number;
  name: string;
  type: string;
  oemCode: string | null;
  priceOriginal: number | null;
  priceTurkish: number | null;
  priceChinese: number | null;
  supplier: string | null;
  stockQty: number;
  imageUrl: string | null;
  compatibleModels: string | null;
};

type AddPartState = {
  name: string;
  type: string;
  priceOriginal: string;
  priceTurkish: string;
  priceChinese: string;
  supplier: string;
  stockQty: string;
  oemCode: string;
  compatibleModels: string;
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

const emptyAdd: AddPartState = {
  name: '', type: 'oil', priceOriginal: '', priceTurkish: '', priceChinese: '',
  supplier: '', stockQty: '0', oemCode: '', compatibleModels: '', imageUrl: '',
};

function StockBadge({ qty }: { qty: number }) {
  const color = qty === 0 ? '#ef4444' : qty < 5 ? '#f59e0b' : '#22c55e';
  const label = qty === 0 ? 'نفذ' : qty < 5 ? 'منخفض' : 'متوفر';
  return (
    <span className="flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: `${color}40`, background: `${color}15` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {qty} ({label})
    </span>
  );
}

export default function AdminParts() {
  const { token } = useAuth();
  const { toast } = useToast();
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const [parts, setParts]           = useState<Part[]>([]);
  const [loading, setLoading]       = useState(false);
  const [fetched, setFetched]       = useState(false);
  const [showAdd, setShowAdd]       = useState(false);
  const [addState, setAddState]     = useState<AddPartState>(emptyAdd);
  const [adding, setAdding]         = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editStockId, setEditStockId]   = useState<number | null>(null);
  const [editStockVal, setEditStockVal] = useState('');
  const [savingStock, setSavingStock]   = useState(false);

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
    if (!addState.name || !addState.type) {
      toast({ variant: 'destructive', title: 'بيانات ناقصة', description: 'الاسم والنوع مطلوبان' });
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
          oemCode: addState.oemCode || null,
          priceOriginal: addState.priceOriginal ? parseFloat(addState.priceOriginal) : null,
          priceTurkish: addState.priceTurkish ? parseFloat(addState.priceTurkish) : null,
          priceChinese: addState.priceChinese ? parseFloat(addState.priceChinese) : null,
          supplier: addState.supplier || null,
          stockQty: parseInt(addState.stockQty) || 0,
          compatibleModels: addState.compatibleModels || null,
          imageUrl: addState.imageUrl || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: '✓ تم إضافة القطعة بنجاح' });
      setShowAdd(false);
      setAddState(emptyAdd);
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

  const handleSaveStock = async (id: number) => {
    const qty = parseInt(editStockVal);
    if (isNaN(qty) || qty < 0) return;
    setSavingStock(true);
    try {
      const res = await fetch(`/api/admin/parts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ stockQty: qty }),
      });
      if (!res.ok) throw new Error();
      setParts(p => p.map(x => x.id === id ? { ...x, stockQty: qty } : x));
      setEditStockId(null);
      toast({ title: 'تم تحديث المخزون' });
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحديث المخزون' });
    } finally {
      setSavingStock(false);
    }
  };

  const inp = (placeholder: string, value: string, onChange: (v: string) => void, opts?: { type?: string; dir?: string }) => (
    <input
      type={opts?.type ?? 'text'}
      dir={opts?.dir}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-[#C8974A]/50 placeholder-white/20"
    />
  );

  return (
    <div className="space-y-6" style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">إدارة القطع</h1>
          <p className="text-white/50 text-sm">مخزون قطع الغيار — مورد، سعر، كمية متاحة</p>
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

      {/* Summary Strip */}
      {fetched && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'إجمالي القطع', value: parts.length, color: G },
            { label: 'نفذت من المخزن', value: parts.filter(p => p.stockQty === 0).length, color: '#ef4444' },
            { label: 'مخزون منخفض', value: parts.filter(p => p.stockQty > 0 && p.stockQty < 5).length, color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-white/50 text-xs font-bold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}
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
            <div key={part.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] transition-all">
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
                  <span className="text-white/40 text-xs font-bold bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                    {TYPE_LABELS[part.type] ?? part.type}
                  </span>
                  {part.oemCode && (
                    <span className="text-white/30 text-xs font-mono">{part.oemCode}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {part.supplier && (
                    <span className="flex items-center gap-1 text-xs text-white/60 font-bold">
                      <Package size={10} style={{ color: G }} /> {part.supplier}
                    </span>
                  )}
                  <StockBadge qty={part.stockQty} />
                </div>
              </div>

              {/* Prices */}
              <div className="text-right flex-shrink-0 hidden md:block">
                <div className="space-y-0.5">
                  {part.priceOriginal != null && (
                    <div className="text-xs"><span className="text-white/40">أصلي </span><span className="font-black" style={{ color: G }}>{part.priceOriginal.toLocaleString()} ج.م</span></div>
                  )}
                  {part.priceTurkish != null && (
                    <div className="text-xs"><span className="text-white/40">تركي </span><span className="font-black text-sky-400">{part.priceTurkish.toLocaleString()} ج.م</span></div>
                  )}
                </div>
              </div>

              {/* Stock Edit */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {editStockId === part.id ? (
                  <>
                    <input
                      type="number"
                      value={editStockVal}
                      onChange={e => setEditStockVal(e.target.value)}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm text-center outline-none focus:border-[#C8974A]/50"
                      min="0"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveStock(part.id)}
                      disabled={savingStock}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: `${G}20`, color: G }}
                    >
                      {savingStock ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                    </button>
                    <button
                      onClick={() => setEditStockId(null)}
                      className="w-7 h-7 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 flex items-center justify-center"
                    >
                      <X size={11} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setEditStockId(part.id); setEditStockVal(String(part.stockQty)); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 text-xs font-bold transition-all"
                  >
                    <Edit2 size={10} /> مخزون
                  </button>
                )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div
            className="bg-[#0F1625] border border-[#C8974A]/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}
          >
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C8974A] to-transparent" />
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0F1625] z-10">
              <div>
                <h2 className="text-xl font-black text-white">قطعة جديدة</h2>
                <p className="text-white/40 text-sm mt-0.5">أضف قطعة غيار للمنصة</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg bg-white/10 text-white/50 hover:bg-white/20 flex items-center justify-center">
                <X size={14} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">اسم القطعة *</label>
                  {inp('زيت موبيل 5W-30', addState.name, v => setAddState(s => ({ ...s, name: v })))}
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">سعر أصلي (ج.م)</label>
                  {inp('850', addState.priceOriginal, v => setAddState(s => ({ ...s, priceOriginal: v })), { type: 'number' })}
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">سعر تركي (ج.م)</label>
                  {inp('550', addState.priceTurkish, v => setAddState(s => ({ ...s, priceTurkish: v })), { type: 'number' })}
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">سعر صيني (ج.م)</label>
                  {inp('350', addState.priceChinese, v => setAddState(s => ({ ...s, priceChinese: v })), { type: 'number' })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">المورد / المصدر</label>
                  {inp('ماكرو، حلايل، دسوقي...', addState.supplier, v => setAddState(s => ({ ...s, supplier: v })))}
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">الكمية في المخزن</label>
                  {inp('10', addState.stockQty, v => setAddState(s => ({ ...s, stockQty: v })), { type: 'number' })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">كود OEM</label>
                  {inp('8200768913', addState.oemCode, v => setAddState(s => ({ ...s, oemCode: v })), { dir: 'ltr' })}
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">موديلات متوافقة</label>
                  {inp('Clio 4, Duster...', addState.compatibleModels, v => setAddState(s => ({ ...s, compatibleModels: v })), { dir: 'ltr' })}
                </div>
              </div>

              <div>
                <label className="text-white/50 text-xs font-bold mb-1 block">رابط صورة (Image URL)</label>
                {inp('https://example.com/part.jpg', addState.imageUrl, v => setAddState(s => ({ ...s, imageUrl: v })), { dir: 'ltr' })}
                {addState.imageUrl && (
                  <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                    <img src={addState.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3 sticky bottom-0 bg-[#0F1625] pt-3 border-t border-white/5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all">
                إلغاء
              </button>
              <button
                onClick={handleAdd}
                disabled={adding}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg,${G},#DEB06C)`, color: BG, opacity: adding ? 0.7 : 1 }}
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
