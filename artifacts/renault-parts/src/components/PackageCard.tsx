import React from 'react';
import { Link } from 'wouter';
import { type Package } from "@workspace/api-client-react";
import { CheckCircle2, Shield, Settings, ChevronLeft, Star, Zap } from 'lucide-react';

const G   = '#C8974A';
const GL  = '#DEB06C';
const BG  = '#0D1220';
const B3  = '#161E30';
const NV  = '#1A2356';
const TX  = '#D4E0EC';
const TD  = '#7A95AA';
const SG  = '#3DA882';

interface PackageCardProps {
  pkg: Package;
  recommended?: boolean;
}

export function PackageCard({ pkg, recommended }: PackageCardProps) {
  const formattedPrice = new Intl.NumberFormat('ar-EG', {
    style: 'currency', currency: 'EGP', maximumFractionDigits: 0,
  }).format(pkg.sellPrice);

  const formattedBasePrice = new Intl.NumberFormat('ar-EG', {
    style: 'currency', currency: 'EGP', maximumFractionDigits: 0,
  }).format(pkg.basePrice);

  const savings = pkg.basePrice - pkg.sellPrice;

  return (
    <div style={{
      position: 'relative',
      background: B3,
      borderRadius: 24,
      border: recommended
        ? `2px solid rgba(200,151,74,0.55)`
        : `1.5px solid rgba(255,255,255,0.08)`,
      boxShadow: recommended
        ? `0 0 0 4px rgba(200,151,74,0.12), 0 12px 40px rgba(200,151,74,0.2)`
        : `0 8px 32px rgba(0,0,0,0.4)`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Almarai',sans-serif",
      direction: 'rtl',
      transition: 'transform .2s, box-shadow .2s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      {/* Gold top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: recommended ? `linear-gradient(90deg,transparent,${G},transparent)` : 'transparent' }} />

      {/* Recommended badge */}
      {recommended && (
        <div style={{
          position: 'absolute', top: 14, right: 14, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 5,
          background: `linear-gradient(135deg,${G},${GL})`,
          borderRadius: 999, padding: '5px 12px',
          boxShadow: `0 4px 16px rgba(200,151,74,0.45)`,
        }}>
          <Star size={11} color={BG} fill={BG} />
          <span style={{ color: BG, fontSize: 11, fontWeight: 900 }}>موصى به لسيارتك</span>
        </div>
      )}

      {/* Background glow for recommended */}
      {recommended && (
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, background: 'radial-gradient(ellipse,rgba(200,151,74,0.07),transparent 70%)', pointerEvents: 'none' }} />
      )}

      {/* Content */}
      <div style={{ padding: '22px 22px 18px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>

        {/* Warranty badge + title */}
        <div style={{ marginBottom: 16, marginTop: recommended ? 28 : 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(61,168,130,0.1)', border: `1px solid rgba(61,168,130,0.25)`, borderRadius: 999, padding: '4px 11px', marginBottom: 12 }}>
            <Shield size={12} color={SG} />
            <span style={{ color: SG, fontSize: 11, fontWeight: 800 }}>ضمان {pkg.warrantyMonths} شهور</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: TX, marginBottom: 6, lineHeight: 1.3 }}>{pkg.name}</h3>
          <p style={{ fontSize: 12, color: TD, lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {pkg.description}
          </p>
        </div>

        {/* Parts list */}
        <div style={{ flex: 1, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <Settings size={14} color={G} />
            <span style={{ fontSize: 12, fontWeight: 800, color: TX }}>يشمل القطع التالية:</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pkg.parts?.slice(0, 4).map((part, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <CheckCircle2 size={15} color={SG} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: TD, lineHeight: 1.5 }}>{part.name}</span>
              </div>
            ))}
            {pkg.parts && pkg.parts.length > 4 && (
              <div style={{ fontSize: 11, fontWeight: 800, color: G, paddingRight: 24 }}>
                + {pkg.parts.length - 4} قطع أخرى...
              </div>
            )}
          </div>
        </div>

        {/* Price + buttons */}
        <div style={{ borderTop: `1px solid rgba(255,255,255,0.07)`, paddingTop: 16 }}>
          {/* Price */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>سعر السوق</div>
            <div style={{ fontSize: 13, color: TD, textDecoration: 'line-through', marginBottom: 4 }}>{formattedBasePrice}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: G, lineHeight: 1, letterSpacing: -1 }}>{formattedPrice}</div>
            {savings > 0 && (
              <div style={{ fontSize: 11, fontWeight: 800, color: SG, marginTop: 4 }}>💚 وفر {savings.toLocaleString()} ج.م</div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/checkout/${pkg.slug}`} style={{ flex: 1, display: 'block', textDecoration: 'none' }}>
              <button
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: `linear-gradient(135deg,${G},${GL})`,
                  border: 'none', borderRadius: 999, padding: '11px 16px',
                  color: BG, fontFamily: "'Almarai',sans-serif", fontWeight: 900, fontSize: 13,
                  cursor: 'pointer', boxShadow: `0 4px 18px rgba(200,151,74,0.35)`,
                  transition: 'box-shadow .2s, transform .2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(200,151,74,0.55)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 18px rgba(200,151,74,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <Zap size={14} />
                احجز الآن
              </button>
            </Link>

            <Link href={`/packages/${pkg.slug}`} style={{ textDecoration: 'none' }}>
              <button style={{
                height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.12)`,
                borderRadius: 999, padding: '0 14px', cursor: 'pointer', color: TD,
                transition: 'background .2s, color .2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,74,0.12)'; (e.currentTarget as HTMLElement).style.color = G; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = TD; }}
              >
                <ChevronLeft size={16} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
