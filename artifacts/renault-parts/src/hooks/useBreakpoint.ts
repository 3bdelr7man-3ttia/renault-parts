import { useState, useEffect } from 'react';

export type Breakpoint = { w: number; isMobile: boolean; isTablet: boolean; isDesktop: boolean; isMobileOrTablet: boolean };

function compute(w: number): Breakpoint {
  return {
    w,
    isMobile: w < 640,
    isTablet: w >= 640 && w < 1024,
    isDesktop: w >= 1024,
    isMobileOrTablet: w < 1024,
  };
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() => compute(typeof window !== 'undefined' ? window.innerWidth : 1280));
  useEffect(() => {
    const fn = () => setBp(compute(window.innerWidth));
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return bp;
}
