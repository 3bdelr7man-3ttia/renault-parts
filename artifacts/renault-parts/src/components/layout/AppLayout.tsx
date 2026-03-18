import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, ShieldCheck, ClipboardList, PackageSearch, Search, Settings, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import bakoLogoImg from '@/assets/bako-logo.png';

/* ── Brand Logo (reusable across all pages) ── */
export function RenoPackLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg'
    ? { img: 56, ar: 22, en: 11 }
    : size === 'sm'
    ? { img: 36, ar: 14, en: 9 }
    : { img: 46, ar: 18, en: 10 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      <img
        src={bakoLogoImg} alt="باكو"
        style={{ width: s.img, height: s.img, objectFit: 'contain', filter: 'drop-shadow(0 2px 10px rgba(200,151,74,0.45))', mixBlendMode: 'screen' }}
      />
      <div style={{ fontFamily: "'Almarai',sans-serif" }}>
        <div style={{ fontWeight: 800, fontSize: s.ar, lineHeight: 1.1, letterSpacing: -0.3 }}>
          <span style={{ color: '#D4E0EC' }}>رينو </span>
          <span style={{ color: '#C8974A' }}>باك</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: s.en, letterSpacing: 1.8, color: '#7A95AA', marginTop: 2 }}>
          Reno<span style={{ color: '#C8974A' }}>Pack</span>
        </div>
      </div>
    </div>
  );
}

/* ── Static nav links (always visible) ── */
const STATIC_NAV = [
  { href: '/packages', label: 'الباكدجات', Icon: PackageSearch },
  { href: '/packages', label: 'القطع',     Icon: Settings     },
  { href: '/',         label: 'الورش',     Icon: Building2    },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [searchVal, setSearchVal] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast({ title: 'تم تسجيل الخروج', description: 'نراك قريباً!' });
    setLocation('/');
  };

  const authLinks: Array<{ href: string; label: string; Icon: React.ElementType }> = [];
  if (user) authLinks.push({ href: '/my-orders', label: 'طلباتي', Icon: ClipboardList });
  if (user?.role === 'admin') authLinks.push({ href: '/admin', label: 'الإدارة', Icon: ShieldCheck });

  const isActive = (href: string) => location === href;

  const footerLinks = [
    {
      t: 'الخدمات',
      items: [
        { label: 'الباكدجات الجاهزة', href: '/packages' },
        { label: 'ابني باكدجك',       href: '/packages' },
        { label: 'قطع أصلية',         href: '/packages' },
        { label: 'قطع تركية',         href: '/packages' },
      ],
    },
    {
      t: 'الحساب',
      items: [
        { label: 'تسجيل الدخول', href: '/login'    },
        { label: 'حساب جديد',   href: '/register' },
        { label: 'طلباتي',      href: '/my-orders' },
      ],
    },
    {
      t: 'مناطق',
      items: [
        { label: 'المنتزه',   href: '/' },
        { label: 'سيدي جابر', href: '/' },
        { label: 'العجمي',    href: '/' },
        { label: 'الميناء',   href: '/' },
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0D1220', fontFamily: "'Almarai','Cairo',sans-serif", direction: 'rtl' }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 99,
        background: 'rgba(13,18,32,0.97)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(200,151,74,0.12)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.35)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', gap: 20, height: 68 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <RenoPackLogo size="md" />
          </Link>

          {/* Search bar */}
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <Search
              size={14} color="#7A95AA"
              style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="دور على قطعة أو خدمة أو باكدج..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.08)',
                borderRadius: 999,
                padding: '9px 42px 9px 18px',
                color: '#D4E0EC',
                fontSize: 14,
                fontFamily: "'Almarai',sans-serif",
                fontWeight: 600,
                outline: 'none',
                direction: 'rtl',
                transition: 'border-color .2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(200,151,74,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>

          {/* Static nav links (الباكدجات / القطع / الورش) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
            {STATIC_NAV.map(n => (
              <Link
                key={n.label}
                href={n.href}
                style={{
                  fontFamily: "'Almarai',sans-serif",
                  color: isActive(n.href) && n.href !== '/' ? '#C8974A' : '#A0B4C8',
                  fontSize: 14, fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'color .2s',
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = '#D4E0EC'; }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = isActive(n.href) && n.href !== '/' ? '#C8974A' : '#A0B4C8'; }}
              >
                {n.label}
              </Link>
            ))}

            {/* Auth-conditional links */}
            {authLinks.map(n => (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  fontFamily: "'Almarai',sans-serif",
                  color: isActive(n.href) ? '#C8974A' : '#A0B4C8',
                  fontSize: 14, fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'color .2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = '#D4E0EC'; }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = isActive(n.href) ? '#C8974A' : '#A0B4C8'; }}
              >
                {n.label}
              </Link>
            ))}

            {/* Separator */}
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />

            {/* Auth buttons */}
            {user ? (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'rgba(200,151,74,0.07)',
                  border: '1px solid rgba(200,151,74,0.18)',
                  borderRadius: 999, padding: '6px 14px',
                  fontSize: 14, fontWeight: 700, color: '#D4E0EC', flexShrink: 0,
                }}>
                  <User size={13} color="#C8974A" />أهلاً، {user.name.split(' ')[0]}
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.18)',
                    borderRadius: 8, padding: '7px 10px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                  }}
                >
                  <LogOut size={15} color="#EF4444" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{ fontFamily: "'Almarai',sans-serif", color: '#A0B4C8', fontWeight: 700, fontSize: 14, textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = '#D4E0EC'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = '#A0B4C8'; }}
                >
                  دخول
                </Link>
                <Link
                  href="/register"
                  style={{
                    fontFamily: "'Almarai',sans-serif",
                    background: 'linear-gradient(135deg,#C8974A,#DEB06C)',
                    color: '#0D1220', fontWeight: 800, fontSize: 14,
                    borderRadius: 999, padding: '9px 22px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(200,151,74,0.35)',
                    flexShrink: 0,
                    transition: 'box-shadow .2s, transform .2s',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.boxShadow = '0 6px 22px rgba(200,151,74,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,151,74,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  احجز دلوقتي
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ══ MAIN ══ */}
      <main style={{ flexGrow: 1 }}>
        <motion.div key={location} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          {children}
        </motion.div>
      </main>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: 'rgba(7,9,20,0.95)', borderTop: '1px solid rgba(200,151,74,0.08)', padding: '48px 28px 24px', fontFamily: "'Almarai',sans-serif" }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 36 }}>

            {/* Brand column */}
            <div>
              <RenoPackLogo size="md" />
              <p style={{ color: '#7A95AA', fontSize: 13, lineHeight: 1.85, maxWidth: 250, fontWeight: 400, margin: '16px 0' }}>
                المنصة الأولى بين مراكز قطع غيار رينو والورش المعتمدة في الإسكندرية.
              </p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3DA882', boxShadow: '0 0 8px #3DA882', animation: 'rp-glow-blink 2s infinite' }} />
                <span style={{ color: '#3DA882', fontWeight: 700, fontSize: 12 }}>متاح ٢٤/٧ في الإسكندرية</span>
              </div>
            </div>

            {/* Link columns */}
            {footerLinks.map(col => (
              <div key={col.t}>
                <p style={{ color: '#C8974A', fontWeight: 700, fontSize: 11, marginBottom: 14, letterSpacing: 1.5, textTransform: 'uppercase' }}>{col.t}</p>
                {col.items.map(item => (
                  <Link
                    key={item.label} href={item.href}
                    style={{ display: 'block', color: 'rgba(160,180,200,0.6)', fontSize: 13, marginBottom: 9, fontWeight: 500, textDecoration: 'none', transition: 'color .2s' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#C8974A')}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(160,180,200,0.6)')}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ color: 'rgba(122,149,170,0.35)', fontSize: 12 }}>© 2026 RenoPack — الإسكندرية. جميع الحقوق محفوظة.</span>
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#C8974A', fontSize: 12 }}>{s}</span>)}
              <span style={{ color: 'rgba(122,149,170,0.4)', fontSize: 11, marginRight: 6 }}>4.9 من 1,247 تقييم</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
