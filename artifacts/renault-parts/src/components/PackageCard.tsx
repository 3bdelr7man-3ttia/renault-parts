import React from 'react';
import { Link } from 'wouter';
import { type Package } from "@workspace/api-client-react";
import { CheckCircle2, Shield, Settings, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PackageCard({ pkg }: { pkg: Package }) {
  // Format price nicely
  const formattedPrice = new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(pkg.sellPrice);

  return (
    <div className="group relative bg-card rounded-3xl p-1 overflow-hidden hover-lift shadow-lg shadow-black/5 border border-border/50">
      {/* Decorative gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
      
      <div className="relative bg-card h-full rounded-[22px] p-6 flex flex-col z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
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

        <div className="mb-8 flex-grow">
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

        <div className="pt-6 border-t border-border/60 flex items-end justify-between mt-auto">
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">السعر الإجمالي</p>
            <p className="text-3xl font-black text-gradient-navy">{formattedPrice}</p>
          </div>
          
          <Link href={`/packages/${pkg.slug}`}>
            <Button className="rounded-full px-6 bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 group-hover:pr-4 transition-all">
              التفاصيل <ChevronLeft className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
