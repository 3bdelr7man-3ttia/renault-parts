import React, { useState } from 'react';
import { Car, ChevronDown, Check, X } from 'lucide-react';
import { useCar, RENAULT_MODELS, CAR_YEARS } from '@/lib/car-context';
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
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [step, setStep] = useState<'model' | 'year'>('model');

  const handleConfirm = () => {
    if (selectedModel && selectedYear) {
      setCar({ model: selectedModel, year: selectedYear });
      onComplete();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: 16 }}>
      <div style={{ background: CARD, border: '1.5px solid rgba(200,151,74,0.2)', borderRadius: 28, width: '100%', maxWidth: 460, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', fontFamily: "'Almarai',sans-serif", direction: 'rtl', position: 'relative', animation: 'rp-fade-up .25s ease' }}>

        {/* Gold top line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#C8974A,transparent)' }} />

        {/* Header */}
        <div style={{ background: `linear-gradient(145deg,#0B1220,#131B2E)`, padding: '28px 28px 22px', textAlign: 'center', position: 'relative', borderBottom: '1px solid rgba(200,151,74,0.1)' }}>
          {/* Background glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 150, background: 'radial-gradient(ellipse,rgba(200,151,74,0.08),transparent 70%)', pointerEvents: 'none' }} />

          {/* Close */}
          <button onClick={onSkip} style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} color="rgba(255,255,255,0.5)" />
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, position: 'relative', zIndex: 1 }}>
            <RenoPackLogo size="md" />
          </div>

          {/* Car icon + title */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 54, height: 54, background: 'rgba(200,151,74,0.1)', border: '1.5px solid rgba(200,151,74,0.25)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Car size={24} color={G} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#E8F0F8', marginBottom: 6 }}>حدد سيارتك</h2>
            <p style={{ fontSize: 13, color: '#7A95AA', fontWeight: 500, lineHeight: 1.6 }}>
              لنعرض لك الباكدجات والقطع المناسبة لسيارتك بالتحديد
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 24, height: 4, borderRadius: 999, background: step === 'model' ? G : `${G}60`, transition: 'background .3s' }} />
            <div style={{ width: 24, height: 4, borderRadius: 999, background: step === 'year' ? G : 'rgba(255,255,255,0.1)', transition: 'background .3s' }} />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>
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
            {selectedModel && selectedYear ? (
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
