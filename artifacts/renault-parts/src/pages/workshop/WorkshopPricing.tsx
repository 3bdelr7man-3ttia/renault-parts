import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Tag, Save, Loader2, Info } from 'lucide-react';

const G  = '#C8974A';
const GL = '#DEB06C';
const BG = '#0D1220';
const B2 = '#111826';
const B3 = '#161E30';
const TX = '#D4E0EC';
const TD = 'rgba(212,224,236,0.55)';

type PricingItem = {
  packageId: number;
  packageName: string;
  packageSlug: string;
  kmService: number;
  fee: number;
};

export default function WorkshopPricing() {
  const { token } = useAuth();
  const { toast } = useToast();
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  useEffect(() => {
    setLoading(true);
    fetch('/api/workshop/pricing', { headers: authHeader })
      .then(r => r.json())
      .then((data: PricingItem[]) => {
        setItems(data);
        const d: Record<number, string> = {};
        data.forEach(i => { d[i.packageId] = String(i.fee); });
        setDrafts(d);
      })
      .catch(() => toast({ title: 'خطأ في تحميل التسعير', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (item: PricingItem) => {
    const fee = parseFloat(drafts[item.packageId] ?? '0');
    if (isNaN(fee) || fee < 0) {
      toast({ title: 'أدخل مبلغاً صحيحاً', variant: 'destructive' });
      return;
    }
    setSaving(item.packageId);
    try {
      const res = await fetch('/api/workshop/pricing', {
        method: 'PUT',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: item.packageId, fee }),
      });
      if (!res.ok) throw new Error();
      setItems(prev => prev.map(i => i.packageId === item.packageId ? { ...i, fee } : i));
      toast({ title: 'تم حفظ التسعير ✓' });
    } catch {
      toast({ title: 'فشل الحفظ', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const slugLabel: Record<string, string> = {
    'pkg-20k':   'صيانة 20,000 كم',
    'pkg-40k':   'صيانة 40,000 كم',
    'pkg-60k':   'صيانة 60,000 كم',
    'pkg-100k':  'صيانة 100,000 كم',
    'emergency': 'طوارئ وإصلاحات',
  };

  return (
    <div style={{ fontFamily: "'Almarai',sans-serif", direction: 'rtl' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(200,151,74,0.12)`, border: `1.5px solid rgba(200,151,74,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={17} color={G} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#E8F0F8' }}>تسعير التركيب</h1>
            <p style={{ margin: 0, fontSize: 12, color: TD }}>حدد رسوم التركيب لكل باكدج صيانة</p>
          </div>
        </div>

        {/* Info banner */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(200,151,74,0.07)', border: '1px solid rgba(200,151,74,0.18)', borderRadius: 12, padding: '12px 14px', marginTop: 14 }}>
          <Info size={15} color={G} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 12, color: TX, lineHeight: 1.7 }}>
            رسوم التركيب هي المبلغ الذي يُستقطع لصالح ورشتك عن كل طلب صيانة مكتمل.
            هذا المبلغ يظهر في تقرير مبيعات الإدارة كـ <strong style={{ color: G }}>أرباح الورش</strong>.
            <br />يُنصح بتحديد مبالغ بين <strong style={{ color: GL }}>200 – 500 ج.م</strong> حسب نوع الصيانة.
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Loader2 size={30} color={G} style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => {
            const isSaving = saving === item.packageId;
            const draft = drafts[item.packageId] ?? '0';
            const changed = parseFloat(draft) !== item.fee;

            return (
              <div key={item.packageId}
                style={{ background: B2, border: `1px solid ${changed ? 'rgba(200,151,74,0.35)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: '16px 18px', transition: 'border-color .2s' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

                  {/* Package info */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: 14, color: '#E8F0F8', marginBottom: 3 }}>
                      {item.packageName}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: TD }}>
                      {slugLabel[item.packageSlug] ?? item.packageSlug} — {Number(item.kmService).toLocaleString()} كم
                    </p>
                    {item.fee > 0 && (
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: G, fontWeight: 700 }}>
                        الحالي: {item.fee.toLocaleString()} ج.م
                      </p>
                    )}
                    {item.fee === 0 && (
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444', fontWeight: 700 }}>
                        لم يُحدد بعد
                      </p>
                    )}
                  </div>

                  {/* Input + save */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        min={0}
                        step={10}
                        value={draft}
                        onChange={e => setDrafts(d => ({ ...d, [item.packageId]: e.target.value }))}
                        style={{
                          width: 120, padding: '8px 36px 8px 12px', borderRadius: 10,
                          background: B3, border: `1.5px solid ${changed ? `rgba(200,151,74,0.4)` : 'rgba(255,255,255,0.1)'}`,
                          color: '#E8F0F8', fontSize: 14, fontWeight: 800, fontFamily: "'Almarai',sans-serif",
                          outline: 'none', textAlign: 'left', direction: 'ltr',
                        }}
                      />
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: TD, fontWeight: 700, pointerEvents: 'none' }}>ج.م</span>
                    </div>

                    <button
                      onClick={() => handleSave(item)}
                      disabled={isSaving || !changed}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                        borderRadius: 10, fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 12,
                        cursor: isSaving || !changed ? 'not-allowed' : 'pointer',
                        background: changed ? G : 'rgba(255,255,255,0.06)',
                        color: changed ? '#0D1220' : 'rgba(255,255,255,0.35)',
                        border: 'none', transition: 'all .2s',
                      }}
                    >
                      {isSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                      حفظ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
