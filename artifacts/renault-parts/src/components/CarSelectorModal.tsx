import React, { useState } from 'react';
import { Car, ChevronDown, Check, X } from 'lucide-react';
import { useCar, RENAULT_MODELS, CAR_YEARS } from '@/lib/car-context';
import { useAuth } from '@/lib/auth-context';
import { RenoPackLogo } from '@/components/layout/AppLayout';

const G  = '#C8974A';
const BG = '#0D1220';
const CARD = '#161E30';
const CARD2 = '#111826';

const MODEL_ICONS: Record<string, string> = {
  'لوجان':    '🚗', 'ساندرو': '🚗', 'ميجان':     '🏎️',
  'داستر':    '🚙', 'كليو':   '🚗', 'كابتور':    '🚙',
  'تاليسمان': '🏎️', 'فلوانس': '🚗', 'ماستر':     '🚐',
};

interface CarSelectorModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function CarSelectorModal({ onComplete, onSkip }: CarSelectorModalProps) {
  const { setCar } = useCar();
  const { user, token } = useAuth();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [step, setStep] = useState<'model' | 'year'>('model');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!selectedModel || !selectedYear) return;
    setSaving(true);
    setCar({ model: selectedModel, year: selectedYear });

    // If user is logged in → also persist to DB so it survives logout+login
    if (user && token) {
      try {
        const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';
        await fetch(`${base}/api/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ carModel: selectedModel, carYear: selectedYear }),
        });
      } catch {
        // non-fatal — car is already set in localStorage
      }
    }

    setSaving(false);
    onComplete();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: 16 }}>
      <div style={{ background: CARD, border: '1.5px solid rgba(200,151,74,0.2)', borderRadius: 28, width: '100%', maxWidth: 460, maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', fontFamily: "'Almarai',sans-serif", direction: 'rtl', position: 'relative', animation: 'rp-fade-up .25s ease', overflow: 'hidden' }}>

        {/* Gold top line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#C8974A,transparent)' }} />

        {/* Header — compact */}
        <div style={{ background: `linear-gradient(145deg,#0B1220,#131B2E)`, padding: '14px 20px 12px', position: 'relative', borderBottom: '1px solid rgba(200,151,74,0.1)', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 260, height: 100, background: 'radial-gradient(ellipse,rgba(200,151,74,0.07),transparent 70%)', pointerEvents: 'none' }} />

          {/* Close */}
          <button onClick={onSkip} style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
            <X size={13} color="rgba(255,255,255,0.5)" />
          </button>

          {/* Logo + title in one row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
            <RenoPackLogo size="sm" />
            <div style={{ width: 1, height: 28, background: 'rgba(200,151,74,0.2)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 34, height: 34, background: 'rgba(200,151,74,0.1)', border: '1.5px solid rgba(200,151,74,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car size={16} color={G} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#E8F0F8', lineHeight: 1.2 }}>حدد سيارتك</div>
                <div style={{ fontSize: 11, color: '#7A95AA', fontWeight: 500 }}>لنعرض لك الباكدجات المناسبة</div>
              </div>
            </div>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 22, height: 3, borderRadius: 999, background: step === 'model' ? G : `${G}60`, transition: 'background .3s' }} />
            <div style={{ width: 22, height: 3, borderRadius: 999, background: step === 'year' ? G : 'rgba(255,255,255,0.1)', transition: 'background .3s' }} />
          </div>
        </div>

        {/* Body — scrollable */}
        <div style={{ padding: '18px 22px 22px', overflowY: 'auto', flex: 1 }}>
          {/* Model selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#C8C8D0', marginBottom: 8 }}>الموديل</label>

            {/* Model grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 4 }}>
              {RENAULT_MODELS.slice(0, 6).map(model => {
                const isSelected = selectedModel === model;
                return (
                  <button
                    key={model}
                    onClick={() => { setSelectedModel(model); setStep('year'); }}
                    style={{
                      background: isSelected ? 'rgba(200,151,74,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${isSelected ? 'rgba(200,151,74,0.5)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 12,
                      padding: '10px 6px',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      transition: 'all .2s',
                      boxShadow: isSelected ? '0 0 16px rgba(200,151,74,0.2)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{MODEL_ICONS[model] ?? '🚗'}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? G : '#7A95AA' }}>{model}</span>
                  </button>
                );
              })}
            </div>

            {/* Remaining models as select */}
            {RENAULT_MODELS.length > 6 && (
              <div style={{ position: 'relative', marginTop: 6 }}>
                <select
                  value={RENAULT_MODELS.slice(6).includes(selectedModel) ? selectedModel : ''}
                  onChange={e => { if (e.target.value) { setSelectedModel(e.target.value); setStep('year'); } }}
                  style={{ width: '100%', appearance: 'none', background: CARD2, border: '1.5px solid rgba(200,151,74,0.15)', borderRadius: 12, padding: '9px 38px 9px 14px', color: '#A0B4C8', fontSize: 13, fontFamily: "'Almarai',sans-serif", fontWeight: 700, outline: 'none', cursor: 'pointer', direction: 'rtl' }}
                >
                  <option value="">موديل آخر...</option>
                  {RENAULT_MODELS.slice(6).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown size={14} color="#7A95AA" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            )}
          </div>

          {/* Year selector */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#C8C8D0', marginBottom: 8 }}>
              سنة الصنع
              {selectedModel && <span style={{ color: '#7A95AA', fontWeight: 600 }}> — {selectedModel}</span>}
            </label>

            {/* Year grid - recent years */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginBottom: 4 }}>
              {CAR_YEARS.slice(0, 8).map(year => {
                const isSelected = selectedYear === year;
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    style={{
                      background: isSelected ? 'rgba(200,151,74,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${isSelected ? 'rgba(200,151,74,0.5)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 10,
                      padding: '8px 4px',
                      cursor: 'pointer',
                      fontSize: 12, fontWeight: 800,
                      color: isSelected ? G : '#7A95AA',
                      transition: 'all .2s',
                      fontFamily: "'Almarai',sans-serif",
                    }}
                  >
                    {year}
                  </button>
                );
              })}
            </div>

            {CAR_YEARS.length > 8 && (
              <div style={{ position: 'relative', marginTop: 6 }}>
                <select
                  value={CAR_YEARS.slice(8).includes(selectedYear ?? 0) ? selectedYear ?? '' : ''}
                  onChange={e => setSelectedYear(Number(e.target.value) || null)}
                  style={{ width: '100%', appearance: 'none', background: CARD2, border: '1.5px solid rgba(200,151,74,0.15)', borderRadius: 12, padding: '9px 38px 9px 14px', color: '#A0B4C8', fontSize: 13, fontFamily: "'Almarai',sans-serif", fontWeight: 700, outline: 'none', cursor: 'pointer', direction: 'rtl' }}
                >
                  <option value="">سنة أقدم...</option>
                  {CAR_YEARS.slice(8).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown size={14} color="#7A95AA" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            )}
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={!selectedModel || !selectedYear}
            style={{
              width: '100%',
              height: 50,
              background: selectedModel && selectedYear ? 'linear-gradient(135deg,#C8974A,#DEB06C)' : 'rgba(200,151,74,0.2)',
              color: selectedModel && selectedYear ? '#0D1220' : 'rgba(200,151,74,0.4)',
              border: 'none', borderRadius: 14,
              fontFamily: "'Almarai',sans-serif",
              fontWeight: 900, fontSize: 15,
              cursor: selectedModel && selectedYear ? 'pointer' : 'not-allowed',
              boxShadow: selectedModel && selectedYear ? '0 6px 22px rgba(200,151,74,0.35)' : 'none',
              transition: 'all .25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {saving ? 'جاري الحفظ...' : selectedModel && selectedYear ? (
              <><Check size={16} /> تأكيد واعرض الباكدجات</>
            ) : 'اختار الموديل والسنة أولاً'}
          </button>

          <button
            onClick={onSkip}
            style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#5A7080', fontSize: 13, fontWeight: 600, fontFamily: "'Almarai',sans-serif", padding: '8px 0' }}
          >
            تخطي — عرض كل الباكدجات
          </button>
        </div>
      </div>
    </div>
  );
}
