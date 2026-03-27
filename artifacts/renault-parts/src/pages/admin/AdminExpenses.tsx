import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { adminUi } from '@/components/admin/admin-ui';
import { DollarSign, Loader2, Megaphone, MoreHorizontal, Plus, ShoppingBag, Trash2, TrendingDown, Users, Wrench, X } from 'lucide-react';

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
  { value: 'advertising', label: 'إعلانات', icon: Megaphone },
  { value: 'marketing', label: 'تسويق', icon: Users },
  { value: 'parts', label: 'شراء قطع', icon: ShoppingBag },
  { value: 'maintenance', label: 'صيانة', icon: Wrench },
  { value: 'salary', label: 'مرتبات', icon: DollarSign },
  { value: 'other', label: 'أخرى', icon: MoreHorizontal },
];

const CAT_LABELS: Record<string, string> = Object.fromEntries(CATEGORIES.map((category) => [category.value, category.label]));
const CAT_ICONS: Record<string, React.ElementType> = Object.fromEntries(CATEGORIES.map((category) => [category.value, category.icon]));

const CAT_COLORS: Record<string, string> = {
  advertising: '#a78bfa',
  marketing: '#60a5fa',
  parts: '#34d399',
  maintenance: '#fbbf24',
  salary: '#f87171',
  other: '#94a3b8',
};

const emptyAdd: AddState = { category: 'advertising', description: '', amount: '', date: new Date().toISOString().slice(0, 10) };

export default function AdminExpenses() {
  const { token } = useAuth();
  const { toast } = useToast();
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addState, setAddState] = useState<AddState>(emptyAdd);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState('all');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/expenses', { headers: authHeader });
      if (!response.ok) throw new Error();
      setExpenses(await response.json());
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحميل المصروفات' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAdd = async () => {
    if (!addState.description || !addState.amount || !addState.date) {
      toast({ variant: 'destructive', title: 'بيانات ناقصة', description: 'الوصف والمبلغ والتاريخ مطلوبة' });
      return;
    }

    setAdding(true);
    try {
      const response = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          category: addState.category,
          description: addState.description,
          amount: parseFloat(addState.amount),
          date: addState.date,
        }),
      });
      if (!response.ok) throw new Error();

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
      const response = await fetch(`/api/admin/expenses/${id}`, { method: 'DELETE', headers: authHeader });
      if (!response.ok) throw new Error();
      setExpenses((current) => current.filter((expense) => expense.id !== id));
      toast({ title: 'تم حذف المصروف' });
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل الحذف' });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = filterCat === 'all' ? expenses : expenses.filter((expense) => expense.category === filterCat);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const byCategory = CATEGORIES.map((category) => ({
    ...category,
    total: expenses.filter((expense) => expense.category === category.value).reduce((sum, expense) => sum + expense.amount, 0),
    count: expenses.filter((expense) => expense.category === category.value).length,
  }))
    .filter((category) => category.count > 0)
    .sort((first, second) => second.total - first.total);

  return (
    <div className={adminUi.page} style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>
      <div className={adminUi.hero}>
        <div className={adminUi.toolbar}>
          <div>
            <h1 className={adminUi.title}>المصروفات</h1>
            <p className={adminUi.subtitle}>لوحة ضبط المصروفات حسب الفئة مع تتبع مرئي أوضح للمبالغ وتكرار الصرف.</p>
          </div>
          <button onClick={() => setShowAdd(true)} className={adminUi.primaryButton}>
            <Plus size={15} />
            تسجيل مصروف
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
          <div className="mb-1 flex items-center gap-2">
            <TrendingDown size={14} className="text-rose-500" />
            <span className="text-xs font-bold text-slate-500">إجمالي المصروفات</span>
          </div>
          <div className="text-2xl font-black text-rose-600">{totalExpenses.toLocaleString()}</div>
          <div className="text-xs font-bold text-slate-400">ج.م</div>
        </div>
        {byCategory.slice(0, 3).map((category) => {
          const Icon = category.icon;
          const color = CAT_COLORS[category.value] ?? '#94a3b8';
          return (
            <div key={category.value} className={`${adminUi.statCard} border-slate-200`}>
              <div className="mb-1 flex items-center gap-2">
                <Icon size={14} style={{ color }} />
                <span className="text-xs font-bold text-slate-500">{category.label}</span>
              </div>
              <div className="text-xl font-black" style={{ color }}>{category.total.toLocaleString()}</div>
              <div className="text-xs text-slate-400">{category.count} عملية</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat('all')}
          className={`rounded-full border px-4 py-1.5 text-xs font-black transition-all ${filterCat === 'all' ? 'border-amber-200 text-slate-950' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
          style={filterCat === 'all' ? { background: '#C8974A' } : {}}
        >
          الكل ({expenses.length})
        </button>
        {CATEGORIES.map((category) => {
          const count = expenses.filter((expense) => expense.category === category.value).length;
          if (!count) return null;
          const active = filterCat === category.value;
          const color = CAT_COLORS[category.value];
          return (
            <button
              key={category.value}
              onClick={() => setFilterCat(category.value)}
              className="rounded-full border px-4 py-1.5 text-xs font-black transition-all"
              style={{
                background: active ? `${color}15` : 'white',
                color: active ? color : '#64748b',
                borderColor: active ? `${color}60` : '#e2e8f0',
              }}
            >
              {category.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[...Array(5)].map((_, index) => <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={adminUi.emptyState}>
          <TrendingDown size={40} className="mx-auto mb-4 text-slate-200" />
          <p className="text-lg font-bold text-slate-500">لا توجد مصروفات مسجّلة</p>
          <p className="mt-1 text-sm text-slate-400">ابدأ بتسجيل مصروف من الزر أعلاه.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((expense) => {
            const Icon = CAT_ICONS[expense.category] ?? MoreHorizontal;
            const color = CAT_COLORS[expense.category] ?? '#94a3b8';
            return (
              <div key={expense.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-950">{expense.description}</div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ color, background: `${color}15` }}>
                      {CAT_LABELS[expense.category] ?? expense.category}
                    </span>
                    <span className="text-xs text-slate-400">{expense.date}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-lg font-black text-rose-600">{expense.amount.toLocaleString()}</span>
                  <span className="text-xs text-slate-400"> ج.م</span>
                </div>
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                >
                  {deletingId === expense.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showAdd ? (
        <div className={adminUi.modalOverlay} onClick={() => setShowAdd(false)}>
          <div className={`${adminUi.modalPanel} max-w-md`} onClick={(event) => event.stopPropagation()} style={{ direction: 'rtl', fontFamily: "'Almarai',sans-serif" }}>
            <div className={adminUi.modalHeader}>
              <div>
                <h2 className="text-xl font-black text-slate-950">تسجيل مصروف</h2>
                <p className="mt-0.5 text-sm text-slate-500">أضف مصروفًا جديدًا للسجل.</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">التصنيف *</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const color = CAT_COLORS[category.value];
                    const active = addState.category === category.value;
                    return (
                      <button
                        key={category.value}
                        onClick={() => setAddState((current) => ({ ...current, category: category.value }))}
                        className="flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-black transition-all"
                        style={{
                          background: active ? `${color}15` : 'white',
                          borderColor: active ? `${color}60` : '#e2e8f0',
                          color: active ? color : '#64748b',
                        }}
                      >
                        <Icon size={14} />
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">الوصف *</label>
                <input
                  value={addState.description}
                  onChange={(e) => setAddState((current) => ({ ...current, description: e.target.value }))}
                  placeholder="وصف المصروف"
                  className={adminUi.input}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">المبلغ (ج.م) *</label>
                  <input
                    type="number"
                    value={addState.amount}
                    onChange={(e) => setAddState((current) => ({ ...current, amount: e.target.value }))}
                    placeholder="2500"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-lg font-black text-rose-600 outline-none focus:border-rose-200 focus:ring-4 focus:ring-rose-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">التاريخ *</label>
                  <input
                    type="date"
                    value={addState.date}
                    onChange={(e) => setAddState((current) => ({ ...current, date: e.target.value }))}
                    className={adminUi.input}
                  />
                </div>
              </div>
            </div>

            <div className={adminUi.modalFooter}>
              <button onClick={() => setShowAdd(false)} className={`flex-1 ${adminUi.secondaryButton}`}>
                إلغاء
              </button>
              <button onClick={handleAdd} className={`flex-1 ${adminUi.primaryButton}`}>
                {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                حفظ المصروف
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
