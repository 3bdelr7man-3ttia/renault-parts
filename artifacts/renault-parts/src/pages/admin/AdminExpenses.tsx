import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { TrendingDown, Plus, Trash2, Loader2, X, DollarSign, Megaphone, Wrench, ShoppingBag, Users, MoreHorizontal } from 'lucide-react';

const G   = '#C8974A';
const BG  = '#0D1220';

type Expense = {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
};

type AddState = { category: string; description: string; amount: string; date: string };

const CATEGORIES = [
  { value: 'advertising',  label: 'إعلانات',      icon: Megaphone },
  { value: 'marketing',    label: 'تسويق',         icon: Users },
  { value: 'parts',        label: 'شراء قطع',      icon: ShoppingBag },
  { value: 'maintenance',  label: 'صيانة',         icon: Wrench },
  { value: 'salary',       label: 'مرتبات',        icon: DollarSign },
  { value: 'other',        label: 'أخرى',          icon: MoreHorizontal },
];
const CAT_LABELS: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));
const CAT_ICONS: Record<string, React.ElementType> = Object.fromEntries(CATEGORIES.map(c => [c.value, c.icon]));

const CAT_COLORS: Record<string, string> = {
  advertising: '#a78bfa', marketing: '#60a5fa', parts: '#34d399',
  maintenance: '#fbbf24', salary: '#f87171', other: '#94a3b8',
};

const emptyAdd: AddState = { category: 'advertising', description: '', amount: '', date: new Date().toISOString().slice(0, 10) };

export default function AdminExpenses() {
  const { token } = useAuth();
  const { toast } = useToast();
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [addState, setAddState]     = useState<AddState>(emptyAdd);
  const [adding, setAdding]         = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterCat, setFilterCat]   = useState('all');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/expenses', { headers: authHeader });
      if (!res.ok) throw new Error();
      setExpenses(await res.json());
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحميل المصروفات' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleAdd = async () => {
    if (!addState.description || !addState.amount || !addState.date) {
      toast({ variant: 'destructive', title: 'بيانات ناقصة', description: 'الوصف والمبلغ والتاريخ مطلوبة' });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          category: addState.category,
          description: addState.description,
          amount: parseFloat(addState.amount),
          date: addState.date,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: '✓ تم تسجيل المصروف' });
      setShowAdd(false);
      setAddState(emptyAdd);
      await fetchExpenses();
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تسجيل المصروف' });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, { method: 'DELETE', headers: authHeader });
      if (!res.ok) throw new Error();
      setExpenses(e => e.filter(x => x.id !== id));
      toast({ title: 'تم حذف المصروف' });
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل الحذف' });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = filterCat === 'all' ? expenses : expenses.filter(e => e.category === filterCat);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const byCategory = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
    count: expenses.filter(e => e.category === cat.value).length,
  })).filter(c => c.count > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6" style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">المصروفات</h1>
          <p className="text-white/50 text-sm">إعلانات، تسويق، قطع، مرتبات وغيرها</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          style={{ background: `linear-gradient(135deg,${G},#DEB06C)`, color: BG, boxShadow: `0 4px 18px rgba(200,151,74,0.35)` }}
        >
          <Plus size={15} /> تسجيل مصروف
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-red-950/60 to-red-900/20 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-white/50 text-xs font-bold">إجمالي المصروفات</span>
          </div>
          <div className="text-2xl font-black text-red-400">{totalExpenses.toLocaleString()}</div>
          <div className="text-white/40 text-xs font-bold">ج.م</div>
        </div>
        {byCategory.slice(0, 3).map(cat => {
          const Icon = cat.icon;
          const color = CAT_COLORS[cat.value] ?? '#94a3b8';
          return (
            <div key={cat.value} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} style={{ color }} />
                <span className="text-white/50 text-xs font-bold">{cat.label}</span>
              </div>
              <div className="text-xl font-black" style={{ color }}>{cat.total.toLocaleString()}</div>
              <div className="text-white/30 text-xs">{cat.count} عملية</div>
            </div>
          );
        })}
      </div>

      {/* Filter by Category */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${filterCat === 'all' ? 'text-[#0D1220]' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
          style={filterCat === 'all' ? { background: G } : {}}
        >
          الكل ({expenses.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = expenses.filter(e => e.category === cat.value).length;
          if (!count) return null;
          const active = filterCat === cat.value;
          const color = CAT_COLORS[cat.value];
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCat(cat.value)}
              className="px-4 py-1.5 rounded-full text-xs font-black transition-all border"
              style={{
                background: active ? `${color}20` : 'transparent',
                color: active ? color : '#ffffff60',
                borderColor: active ? `${color}60` : '#ffffff15',
              }}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Expense List */}
      {loading ? (
        <div className="grid gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <TrendingDown size={40} className="text-white/10 mb-4" />
          <p className="text-white/30 font-bold text-lg">لا توجد مصروفات مسجّلة</p>
          <p className="text-white/20 text-sm mt-1">ابدأ بتسجيل مصروف من الزر أعلاه</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(expense => {
            const Icon = CAT_ICONS[expense.category] ?? MoreHorizontal;
            const color = CAT_COLORS[expense.category] ?? '#94a3b8';
            return (
              <div key={expense.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm truncate">{expense.description}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, background: `${color}15` }}>
                      {CAT_LABELS[expense.category] ?? expense.category}
                    </span>
                    <span className="text-white/30 text-xs">{expense.date}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-black text-red-400">{expense.amount.toLocaleString()}</span>
                  <span className="text-white/40 text-xs"> ج.م</span>
                </div>
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center flex-shrink-0 transition-all"
                >
                  {deletingId === expense.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Expense Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div
            className="bg-[#0F1625] border border-[#C8974A]/20 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
            style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}
          >
            <div className="h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent" />
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">تسجيل مصروف</h2>
                <p className="text-white/40 text-sm mt-0.5">أضف مصروف جديد للسجل</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg bg-white/10 text-white/50 hover:bg-white/20 flex items-center justify-center">
                <X size={14} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-white/50 text-xs font-bold mb-2 block">التصنيف *</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const color = CAT_COLORS[cat.value];
                    const active = addState.category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setAddState(s => ({ ...s, category: cat.value }))}
                        className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-black transition-all"
                        style={{
                          background: active ? `${color}20` : 'transparent',
                          borderColor: active ? `${color}60` : '#ffffff15',
                          color: active ? color : '#ffffff40',
                        }}
                      >
                        <Icon size={14} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-white/50 text-xs font-bold mb-1 block">الوصف *</label>
                <input
                  value={addState.description}
                  onChange={e => setAddState(s => ({ ...s, description: e.target.value }))}
                  placeholder="مثال: إعلان فيسبوك — أبريل 2025"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-[#C8974A]/50 placeholder-white/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">المبلغ (ج.م) *</label>
                  <input
                    type="number"
                    value={addState.amount}
                    onChange={e => setAddState(s => ({ ...s, amount: e.target.value }))}
                    placeholder="2500"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-red-400 font-black text-lg outline-none focus:border-red-500/30 placeholder-white/20"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold mb-1 block">التاريخ *</label>
                  <input
                    type="date"
                    value={addState.date}
                    onChange={e => setAddState(s => ({ ...s, date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-[#C8974A]/50"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all">
                إلغاء
              </button>
              <button
                onClick={handleAdd}
                disabled={adding}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                style={{ opacity: adding ? 0.7 : 1 }}
              >
                {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {adding ? 'جاري التسجيل...' : 'تسجيل المصروف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
