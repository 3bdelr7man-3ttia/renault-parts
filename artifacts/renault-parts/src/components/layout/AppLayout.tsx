import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, ShieldCheck, ClipboardList, PackageSearch } from 'lucide-react';
import { motion } from 'framer-motion';
import bakoLogoImg from '@/assets/bako-logo.png';

/* ── Logo ── */
function RenoPackLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? { img: 36, ar: 14, en: 9 } : { img: 46, ar: 18, en: 10 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <img src={bakoLogoImg} alt="باكو" style={{ width: s.img, height: s.img, objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(200,151,74,0.4))', mixBlendMode: 'screen' }} />
      <div style={{ fontFamily: "'Almarai',sans-serif" }}>
        <div style={{ fontWeight: 800, fontSize: s.ar, lineHeight: 1, letterSpacing: -0.3 }}>
          <span style={{ color: '#D4E0EC' }}>رينو </span>
          <span style={{ color: '#C8974A' }}>باك</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: s.en, letterSpacing: 1.5, color: '#7A95AA', marginTop: 1 }}>
          Reno<span style={{ color: '#C8974A' }}>Pack</span>
        </div>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({ title: 'تم تسجيل الخروج', description: 'نراك قريباً!' });
    setLocation('/');
  };

  const navLinks: Array<{ href: string; label: string; Icon: React.ElementType }> = [
    { href: '/packages', label: 'الباكدجات', Icon: PackageSearch },
  ];
  if (user) navLinks.push({ href: '/my-orders', label: 'طلباتي', Icon: ClipboardList });
  if (user?.role === 'admin') navLinks.push({ href: '/admin', label: 'الإدارة', Icon: ShieldCheck });

  const isActive = (href: string) => location === href;

  const footerLinks = [
    { t: 'الخدمات', items: [{ label: 'الباكدجات الجاهزة', href: '/packages' }, { label: 'ابني باكدجك', href: '/packages' }, { label: 'قطع أصلية', href: '/packages' }, { label: 'قطع تركية', href: '/packages' }] },
    { t: 'الحساب',  items: [{ label: 'تسجيل الدخول', href: '/login' }, { label: 'حساب جديد', href: '/register' }, { label: 'طلباتي', href: '/my-orders' }] },
    { t: 'مناطق',   items: [{ label: 'المنتزه', href: '/' }, { label: 'سيدي جابر', href: '/' }, { label: 'العجمي', href: '/' }, { label: 'الميناء', href: '/' }] },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: location === '/' ? '#0D1220' : 'hsl(var(--background))', fontFamily: "'Almarai','Cairo',sans-serif", direction: 'rtl' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,18,32,0.93)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(200,151,74,0.12)', boxShadow: '0 2px 24px rgba(0,0,0,0.4)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <RenoPackLogo size="md" />
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {navLinks.map(n => (
              <Link key={n.href} href={n.href} style={{
                fontFamily: "'Almarai',sans-serif",
                color: isActive(n.href) ? '#C8974A' : '#7A95AA',
                fontSize: 14, fontWeight: 700,
                textDecoration: 'none',
                borderBottom: isActive(n.href) ? '2px solid #C8974A' : '2px solid transparent',
                paddingBottom: 2,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <n.Icon size={14} />{n.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(200,151,74,0.07)', border: '1px solid rgba(200,151,74,0.18)', borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: '#D4E0EC' }}>
                  <User size={13} color="#C8974A" />أهلاً، {user.name.split(' ')[0]}
                </div>
                <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <LogOut size={16} color="#EF4444" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ fontFamily: "'Almarai',sans-serif", color: '#7A95AA', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>دخول</Link>
                <Link href="/register" style={{ fontFamily: "'Almarai',sans-serif", background: 'linear-gradient(135deg,#C8974A,#DEB06C)', color: '#0D1220', fontWeight: 800, fontSize: 13, borderRadius: 999, padding: '8px 20px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(200,151,74,0.3)' }}>
                  احجز دلوقتي
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={{ flexGrow: 1 }}>
        <motion.div key={location} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'rgba(7,9,20,0.9)', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '40px 28px 20px', fontFamily: "'Almarai',sans-serif" }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 32 }}>
            <div>
              <RenoPackLogo size="sm" />
              <p style={{ color: '#7A95AA', fontSize: 12, lineHeight: 1.75, maxWidth: 230, fontWeight: 300, margin: '14px 0' }}>المنصة الأولى بين مراكز قطع غيار رينو والورش المعتمدة في الإسكندرية.</p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3DA882', animation: 'rp-glow-blink 2s infinite' }} />
                <span style={{ color: '#3DA882', fontWeight: 700, fontSize: 11 }}>متاح ٢٤/٧</span>
              </div>
            </div>
            {footerLinks.map(col => (
              <div key={col.t}>
                <p style={{ color: '#7A95AA', fontWeight: 700, fontSize: 10, marginBottom: 12, letterSpacing: 1.5 }}>{col.t}</p>
                {col.items.map(item => (
                  <Link key={item.label} href={item.href} style={{ display: 'block', color: 'rgba(122,149,170,0.55)', fontSize: 11, marginBottom: 8, fontWeight: 400, textDecoration: 'none' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#C8974A')}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(122,149,170,0.55)')}>
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ color: 'rgba(122,149,170,0.3)', fontSize: 10 }}>© 2026 RenoPack — الإسكندرية</span>
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#C8974A', fontSize: 11 }}>{s}</span>)}
              <span style={{ color: 'rgba(122,149,170,0.35)', fontSize: 9, marginRight: 5 }}>4.9 من 1,247 تقييم</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
