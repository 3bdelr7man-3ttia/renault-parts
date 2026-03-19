import React from 'react';
import { Link } from 'wouter';
import { type Package } from "@workspace/api-client-react";
import { CheckCircle2, Shield, Settings, ChevronLeft, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PackageCardProps {
  pkg: Package;
  recommended?: boolean;
}

export function PackageCard({ pkg, recommended }: PackageCardProps) {
  const formattedPrice = new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(pkg.sellPrice);

  const formattedBasePrice = new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(pkg.basePrice);

  const savings = pkg.basePrice - pkg.sellPrice;

  return (
    <div className={`group relative bg-card rounded-3xl p-1 overflow-hidden hover-lift shadow-lg border transition-all ${recommended ? 'shadow-accent/20 border-accent/40 ring-2 ring-accent/30' : 'shadow-black/5 border-border/50'}`}>
      {recommended && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1 bg-accent rounded-full text-primary text-xs font-black shadow-md">
          <Star className="w-3 h-3 fill-current" />
          موصى به لسيارتك
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

      <div className="relative bg-card h-full rounded-[22px] p-6 flex flex-col z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={recommended ? 'mt-6' : ''}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-primary font-bold text-xs mb-3 border border-accent/30">
              <Shield className="w-3.5 h-3.5 text-accent-foreground" />
              ضمان {pkg.warrantyMonths} شهور
            </div>
            <h3 className="text-2xl font-black text-foreground mb-2">{pkg.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {pkg.description}
            </p>
          </div>
        </div>

        <div className="mb-6 flex-grow">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-foreground">يشمل القطع التالية:</h4>
          </div>
          <ul className="space-y-3">
            {pkg.parts?.slice(0, 4).map((part, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span>{part.name}</span>
              </li>
            ))}
            {pkg.parts && pkg.parts.length > 4 && (
              <li className="text-sm font-bold text-primary pl-8">
                + {pkg.parts.length - 4} قطع أخرى...
              </li>
            )}
          </ul>
        </div>

        {/* Price + CTAs */}
        <div className="pt-5 border-t border-border/60 mt-auto">
          {/* Price row */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">سعر السوق</p>
              <p className="text-sm text-muted-foreground line-through mb-1">{formattedBasePrice}</p>
              <p className="text-3xl font-black text-gradient-navy">{formattedPrice}</p>
              {savings > 0 && (
                <p className="text-xs font-bold text-green-600 mt-1">وفر {savings} ج.م</p>
              )}
            </div>
          </div>

          {/* Action buttons row */}
          <div className="flex gap-2">
            {/* Book Now — primary CTA */}
            <Link href={`/checkout/${pkg.slug}`} style={{ flex: 1, display: 'block' }}>
              <button
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: 'linear-gradient(135deg,#C8974A,#DEB06C)',
                  border: 'none',
                  borderRadius: 999,
                  padding: '11px 16px',
                  color: '#0D1220',
                  fontFamily: "'Almarai',sans-serif",
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(200,151,74,0.35)',
                  transition: 'box-shadow .2s, transform .2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(200,151,74,0.55)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 18px rgba(200,151,74,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <Zap className="w-4 h-4" />
                احجز الآن
              </button>
            </Link>

            {/* Details — secondary */}
            <Link href={`/packages/${pkg.slug}`}>
              <Button
                variant="outline"
                className="rounded-full px-4 border-border/50 text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all"
                style={{ height: '100%' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
