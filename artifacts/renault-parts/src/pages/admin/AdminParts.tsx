import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { adminUi } from '@/components/admin/admin-ui';
import { Wrench, Plus, Trash2, Loader2, X, Image as ImageIcon, Tag, Package, Edit2, Check } from 'lucide-react';

const G   = '#C8974A';
const INK = '#0F172A';

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
      className={adminUi.input}
    />
  );

  return (
    <div className={adminUi.page} style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>
      <div className={adminUi.hero}>
        <div className={adminUi.toolbar}>
        <div>
            <h1 className={adminUi.title}>إدارة القطع</h1>
            <p className={adminUi.subtitle}>مخزون قطع الغيار، التسعير، المورد، والحالة الحالية لكل قطعة.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
            className={adminUi.primaryButton}
        >
          <Plus size={15} />
          إضافة قطعة جديدة
        </button>
        </div>
      </div>

      {/* Summary Strip */}
      {fetched && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'إجمالي القطع', value: parts.length, color: G },
            { label: 'نفذت من المخزن', value: parts.filter(p => p.stockQty === 0).length, color: '#ef4444' },
            { label: 'مخزون منخفض', value: parts.filter(p => p.stockQty > 0 && p.stockQty < 5).length, color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} className={`${adminUi.statCard} text-center`}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="mt-1 text-xs font-bold text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 rounded-3xl border border-slate-200 bg-slate-100 animate-pulse" />)}
        </div>
      ) : parts.length === 0 ? (
        <div className={adminUi.emptyState}>
          <Wrench size={40} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-bold text-slate-700">لا توجد قطع مضافة بعد</p>
          <p className="mt-1 text-sm text-slate-500">ابدأ بإضافة قطعة من الزر أعلاه.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {parts.map(part => (
            <div key={part.id} className="flex items-center gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              {/* Image */}
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {part.imageUrl
                  ? <img src={part.imageUrl} alt={part.name} className="h-full w-full object-cover" />
                  : <ImageIcon size={20} className="text-slate-300" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="truncate text-base font-bold text-slate-900">{part.name}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-500">
                    {TYPE_LABELS[part.type] ?? part.type}
                  </span>
                  {part.oemCode && (
                    <span className="text-xs font-mono text-slate-400">{part.oemCode}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {part.supplier && (
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
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
                    <div className="text-xs"><span className="text-slate-400">أصلي </span><span className="font-black" style={{ color: G }}>{part.priceOriginal.toLocaleString()} ج.م</span></div>
                  )}
                  {part.priceTurkish != null && (
                    <div className="text-xs"><span className="text-slate-400">تركي </span><span className="font-black text-sky-600">{part.priceTurkish.toLocaleString()} ج.م</span></div>
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
                      className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-1 text-center text-sm text-slate-900 outline-none focus:border-[#C8974A] focus:ring-4 focus:ring-[#C8974A]/10"
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
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
                    >
                      <X size={11} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setEditStockId(part.id); setEditStockVal(String(part.stockQty)); }}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Edit2 size={10} /> مخزون
                  </button>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(part.id)}
                disabled={deletingId === part.id}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 transition-all hover:bg-red-500/20"
              >
                {deletingId === part.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Part Modal ── */}
      {showAdd && (
        <div className={adminUi.modalOverlay} onClick={() => setShowAdd(false)}>
          <div
            className={`${adminUi.modalPanel} max-h-[90vh] max-w-2xl overflow-y-auto`}
            onClick={e => e.stopPropagation()}
            style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}
          >
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C8974A] to-transparent" />
            <div className={`${adminUi.modalHeader} sticky top-0 z-10 bg-white/95 backdrop-blur-sm`}>
              <div>
                <h2 className="text-xl font-black text-slate-950">قطعة جديدة</h2>
                <p className="mt-0.5 text-sm text-slate-500">أضف قطعة غيار للمنصة</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                <X size={14} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">اسم القطعة *</label>
                  {inp('زيت موبيل 5W-30', addState.name, v => setAddState(s => ({ ...s, name: v })))}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">نوع القطعة *</label>
                  <select
                    value={addState.type}
                    onChange={e => setAddState(s => ({ ...s, type: e.target.value }))}
                    className={adminUi.select}
                  >
                    {PART_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">سعر أصلي (ج.م)</label>
                  {inp('850', addState.priceOriginal, v => setAddState(s => ({ ...s, priceOriginal: v })), { type: 'number' })}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">سعر تركي (ج.م)</label>
                  {inp('550', addState.priceTurkish, v => setAddState(s => ({ ...s, priceTurkish: v })), { type: 'number' })}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">سعر صيني (ج.م)</label>
                  {inp('350', addState.priceChinese, v => setAddState(s => ({ ...s, priceChinese: v })), { type: 'number' })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">المورد / المصدر</label>
                  {inp('ماكرو، حلايل، دسوقي...', addState.supplier, v => setAddState(s => ({ ...s, supplier: v })))}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">الكمية في المخزن</label>
                  {inp('10', addState.stockQty, v => setAddState(s => ({ ...s, stockQty: v })), { type: 'number' })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">كود OEM</label>
                  {inp('8200768913', addState.oemCode, v => setAddState(s => ({ ...s, oemCode: v })), { dir: 'ltr' })}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">موديلات متوافقة</label>
                  {inp('Clio 4, Duster...', addState.compatibleModels, v => setAddState(s => ({ ...s, compatibleModels: v })), { dir: 'ltr' })}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">رابط صورة (Image URL)</label>
                {inp('https://example.com/part.jpg', addState.imageUrl, v => setAddState(s => ({ ...s, imageUrl: v })), { dir: 'ltr' })}
                {addState.imageUrl && (
                  <div className="mt-2 h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <img src={addState.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
            </div>

            <div className={`${adminUi.modalFooter} sticky bottom-0`}>
              <button onClick={() => setShowAdd(false)} className={`${adminUi.secondaryButton} flex-1 justify-center`}>
                إلغاء
              </button>
              <button
                onClick={handleAdd}
                disabled={adding}
                className={`${adminUi.primaryButton} flex-1 justify-center`}
                style={{ opacity: adding ? 0.7 : 1, color: INK }}
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
