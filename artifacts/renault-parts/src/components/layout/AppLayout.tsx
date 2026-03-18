import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, ShieldCheck, ClipboardList, PackageSearch, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import bakoLogoImg from '@/assets/bako-logo.png';

/* ── Logo ── */
function RenoPackLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? { img: 36, ar: 14, en: 9 } : { img: 46, ar: 18, en: 10 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
  const [searchVal, setSearchVal] = useState('');

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0D1220', fontFamily: "'Almarai','Cairo',sans-serif", direction: 'rtl' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 99, background: 'rgba(13,18,32,0.95)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(200,151,74,0.10)', boxShadow: '0 2px 24px rgba(0,0,0,0.4)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', gap: 22, height: 64 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <RenoPackLogo size="md" />
          </Link>

          {/* ── Search bar (middle, takes remaining space) ── */}
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <Search size={14} color="#7A95AA" style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="دور على قطعة أو خدمة أو باكدج..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.08)',
                borderRadius: 999,
                padding: '9px 40px 9px 18px',
                color: '#D4E0EC',
                fontSize: 13,
                fontFamily: "'Almarai',sans-serif",
                fontWeight: 700,
                outline: 'none',
                direction: 'rtl',
                transition: 'border-color .2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(200,151,74,0.45)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>

          {/* ── Nav links + auth (right side) ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexShrink: 0 }}>
            {navLinks.map(n => (
              <Link key={n.href} href={n.href} style={{
                fontFamily: "'Almarai',sans-serif",
                color: isActive(n.href) ? '#C8974A' : '#7A95AA',
                fontSize: 13, fontWeight: 700,
                textDecoration: 'none',
                transition: 'color .2s',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { if (!isActive(n.href)) e.currentTarget.style.color = '#D4E0EC'; }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { if (!isActive(n.href)) e.currentTarget.style.color = '#7A95AA'; }}>
                <n.Icon size={13} />{n.label}
              </Link>
            ))}

            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(200,151,74,0.07)', border: '1px solid rgba(200,151,74,0.18)', borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: '#D4E0EC', flexShrink: 0 }}>
                  <User size={13} color="#C8974A" />أهلاً، {user.name.split(' ')[0]}
                </div>
                <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <LogOut size={16} color="#EF4444" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ fontFamily: "'Almarai',sans-serif", color: '#7A95AA', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>دخول</Link>
                <Link href="/register" style={{ fontFamily: "'Almarai',sans-serif", background: 'linear-gradient(135deg,#C8974A,#DEB06C)', color: '#0D1220', fontWeight: 800, fontSize: 13, borderRadius: 999, padding: '8px 20px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(200,151,74,0.3)', flexShrink: 0 }}>
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
