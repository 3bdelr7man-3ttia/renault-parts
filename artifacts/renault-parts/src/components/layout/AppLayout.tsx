import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { usePartCart } from '@/lib/part-cart-context';
import {
  LogOut, User, ShieldCheck, ClipboardList, PackageSearch, Search,
  Settings, Building2, ShoppingCart, X, Trash2, ArrowLeft,
  Home, Menu, ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import bakoLogoImg from '@/assets/bako-logo.png';
import { useBreakpoint } from '@/hooks/useBreakpoint';

/* ── Brand Logo ── */
export function RenoPackLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg'
    ? { img: 56, ar: 22, en: 11 }
    : size === 'sm'
    ? { img: 32, ar: 14, en: 9 }
    : { img: 42, ar: 17, en: 10 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <img src={bakoLogoImg} alt="باكو"
        style={{ width: s.img, height: s.img, objectFit: 'contain', filter: 'drop-shadow(0 2px 10px rgba(200,151,74,0.45))', mixBlendMode: 'screen' }} />
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

const STATIC_NAV = [
  { href: '/',          label: 'الرئيسية',  Icon: Home         },
  { href: '/packages',  label: 'الباكدجات', Icon: PackageSearch },
  { href: '/parts',     label: 'القطع',     Icon: Settings     },
  { href: '/workshops', label: 'الورش',     Icon: Building2    },
];

const BOTTOM_NAV = [
  { href: '/',          label: 'الرئيسية',  Icon: Home         },
  { href: '/packages',  label: 'باكدجات',   Icon: PackageSearch },
  { href: '/parts',     label: 'القطع',     Icon: Settings     },
  { href: '/workshops', label: 'الورش',     Icon: Building2    },
  { href: '/profile',   label: 'حسابي',     Icon: User         },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { isMobile, isTablet, isMobileOrTablet } = useBreakpoint();
  const {
    items: cartItems, total: cartTotal, clear: clearCart, removePart,
    cartPackage, setCartPackage, pkgJustAdded, consumePkgJustAdded, grandTotal,
  } = usePartCart();
  const [searchVal, setSearchVal] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const cartBtnRef = useRef<HTMLButtonElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCartDropdown) return;
    const handler = (e: MouseEvent) => {
      if (
        cartBtnRef.current && !cartBtnRef.current.contains(e.target as Node) &&
        cartDropdownRef.current && !cartDropdownRef.current.contains(e.target as Node)
      ) setShowCartDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showCartDropdown]);

  useEffect(() => {
    if (pkgJustAdded) { setShowCartDropdown(true); consumePkgJustAdded(); }
  }, [pkgJustAdded, consumePkgJustAdded]);

  /* Close drawer on route change */
  useEffect(() => { setDrawerOpen(false); }, [location]);

  const handleGoToCheckout = () => {
    setShowCartDropdown(false);
    setDrawerOpen(false);
    if (cartPackage) {
      if (cartItems.length > 0) sessionStorage.setItem('cartExtraParts', JSON.stringify(cartItems));
      setLocation('/checkout/' + cartPackage.id);
    } else if (cartItems.length > 0) {
      sessionStorage.setItem('customPuzzle', JSON.stringify({ parts: cartItems.map(p => ({ id: p.id, label: p.label, price: p.price })), total: cartTotal }));
      setLocation('/checkout/custom');
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'تم تسجيل الخروج', description: 'نراك قريباً!' });
    setLocation('/');
    setDrawerOpen(false);
  };

  const authLinks: Array<{ href: string; label: string; Icon: React.ElementType }> = [];
  if (user) authLinks.push({ href: '/my-orders', label: 'طلباتي', Icon: ClipboardList });
  if (user?.role === 'admin') authLinks.push({ href: '/admin', label: 'الإدارة', Icon: ShieldCheck });

  const isActive = (href: string) => href === '/' ? location === '/' : location.startsWith(href);

  React.useEffect(() => { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; }, []);
  React.useEffect(() => {
    const t = setTimeout(() => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, 0);
    return () => clearTimeout(t);
  }, [location]);

  const cartCount = (cartPackage ? 1 : 0) + cartItems.length;
  const hasCart = cartItems.length > 0 || !!cartPackage;

  const footerLinks = [
    { t: 'تصفح', items: [
      { label: 'الباكدجات الجاهزة', href: '/packages'  },
      { label: 'قطع الغيار',        href: '/parts'     },
      { label: 'الورش المعتمدة',    href: '/workshops' },
      { label: 'ابني باكدجك',       href: '/#puzzle'   },
    ]},
    { t: 'حسابي', items: [
      { label: 'تسجيل الدخول',   href: '/login'      },
      { label: 'حساب جديد',      href: '/register'   },
      { label: 'طلباتي',         href: '/my-orders'  },
      { label: 'ملفي الشخصي',    href: '/profile'    },
    ]},
    { t: 'للورش', items: [
      { label: 'انضم كورشة',        href: '/join-workshop' },
      { label: 'كل الورش',          href: '/workshops'     },
      { label: 'لوحة التحكم',       href: '/admin'         },
      { label: 'الرئيسية',          href: '/'              },
    ]},
  ];

  /* ── Cart Dropdown Content (shared between drawer & desktop) ── */
  const CartContent = () => (
    <div style={{ background: '#111826', border: '1.5px solid rgba(200,151,74,0.2)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.6)', fontFamily: "'Almarai',sans-serif" }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800, fontSize: 13, color: '#E8F0F8' }}>
          <ShoppingCart size={14} color="#C8974A" /> سلتي
        </div>
        <button onClick={() => { clearCart(); setShowCartDropdown(false); setDrawerOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '4px 10px', color: '#EF4444', fontFamily: "'Almarai',sans-serif", fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          <Trash2 size={11} /> إفراغ الكل
        </button>
      </div>
      <div style={{ maxHeight: 300, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cartPackage && (
          <div style={{ background: 'rgba(200,151,74,0.08)', border: '1.5px solid rgba(200,151,74,0.25)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>📦</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: '#C8974A', fontWeight: 700, marginBottom: 2 }}>باكدج</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cartPackage.name}</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#C8974A', marginTop: 3 }}>{cartPackage.price.toLocaleString('ar-EG')} ج.م</div>
              </div>
              <button onClick={() => setCartPackage(null)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <X size={12} color="#EF4444" />
              </button>
            </div>
          </div>
        )}
        {cartItems.length > 0 && (
          <>
            {cartPackage && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}><div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} /><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>قطع إضافية</span><div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} /></div>}
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#161E30', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#D4E0EC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#C8974A', marginTop: 2 }}>{item.price.toLocaleString('ar-EG')} ج.م</div>
                </div>
                <button onClick={() => removePart(item.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={12} color="#EF4444" />
                </button>
              </div>
            ))}
          </>
        )}
        {!cartPackage && cartItems.length === 0 && <div style={{ padding: '20px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>السلة فارغة</div>}
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {cartItems.length > 0 && cartPackage && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
            <span>القطع الإضافية</span><span>{cartTotal.toLocaleString('ar-EG')} ج.م</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: '#7A95AA', fontWeight: 700 }}>الإجمالي</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#C8974A' }}>{grandTotal.toLocaleString('ar-EG')} ج.م</span>
        </div>
        <button onClick={handleGoToCheckout} disabled={!cartPackage && cartItems.length === 0}
          style={{ width: '100%', background: 'linear-gradient(135deg,#C8974A,#DEB06C)', border: 'none', borderRadius: 12, padding: 11, color: '#0D1220', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          إتمام الطلب <ArrowLeft size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0D1220', fontFamily: "'Almarai','Cairo',sans-serif", direction: 'rtl' }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 150, background: 'rgba(13,18,32,0.97)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(200,151,74,0.12)', boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 14px' : '0 24px', display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 18, height: isMobile ? 58 : 64 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <RenoPackLogo size={isMobile ? 'sm' : 'md'} />
          </Link>

          {/* Desktop Search bar */}
          {!isMobileOrTablet && (
            <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
              <Search size={14} color="#7A95AA" style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
                placeholder="دور على قطعة أو خدمة أو باكدج..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '9px 42px 9px 18px', color: '#D4E0EC', fontSize: 14, fontFamily: "'Almarai',sans-serif", fontWeight: 600, outline: 'none', direction: 'rtl', transition: 'border-color .2s' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(200,151,74,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }} />
            </div>
          )}

          {/* Desktop nav links */}
          {!isMobileOrTablet && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexShrink: 0 }}>
              {STATIC_NAV.filter(n => n.href !== '/').map(n => (
                <Link key={n.label} href={n.href}
                  style={{ fontFamily: "'Almarai',sans-serif", color: isActive(n.href) ? '#C8974A' : '#A0B4C8', fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'color .2s', whiteSpace: 'nowrap' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = '#D4E0EC'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = isActive(n.href) ? '#C8974A' : '#A0B4C8'; }}>
                  {n.label}
                </Link>
              ))}
              {authLinks.map(n => (
                <Link key={n.href} href={n.href}
                  style={{ fontFamily: "'Almarai',sans-serif", color: isActive(n.href) ? '#C8974A' : '#A0B4C8', fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'color .2s', whiteSpace: 'nowrap' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = '#D4E0EC'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = isActive(n.href) ? '#C8974A' : '#A0B4C8'; }}>
                  {n.label}
                </Link>
              ))}
            </div>
          )}

          {/* Spacer on mobile */}
          {isMobileOrTablet && <div style={{ flex: 1 }} />}

          {/* Cart button (all sizes) */}
          {hasCart && (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button ref={cartBtnRef} onClick={() => setShowCartDropdown(v => !v)}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: isMobile ? 5 : 7, background: showCartDropdown ? 'rgba(200,151,74,0.22)' : 'rgba(200,151,74,0.12)', border: '1.5px solid rgba(200,151,74,0.35)', borderRadius: 999, padding: isMobile ? '6px 10px' : '7px 14px', cursor: 'pointer', fontFamily: "'Almarai',sans-serif", fontWeight: 800, fontSize: isMobile ? 12 : 13, color: '#C8974A', flexShrink: 0, transition: 'background .2s', boxShadow: '0 2px 12px rgba(200,151,74,0.2)' }}>
                <ShoppingCart size={isMobile ? 14 : 15} />
                {!isMobile && 'سلتي'}
                <span style={{ background: '#C8974A', color: '#0D1220', borderRadius: 999, fontSize: 10, fontWeight: 900, minWidth: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  {cartCount}
                </span>
              </button>
              <AnimatePresence>
                {showCartDropdown && (
                  <motion.div ref={cartDropdownRef}
                    initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.18 }}
                    style={{ position: 'absolute', top: 'calc(100% + 10px)', left: isMobile ? 'auto' : 0, right: isMobile ? 0 : 'auto', width: isMobile ? Math.min(320, window.innerWidth - 24) : 340, zIndex: 9999, direction: 'rtl' }}>
                    <CartContent />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Desktop auth buttons */}
          {!isMobileOrTablet && (
            <>
              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
              {user ? (
                <>
                  <Link href="/profile"
                    style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(200,151,74,0.07)', border: '1px solid rgba(200,151,74,0.18)', borderRadius: 999, padding: '6px 14px', fontSize: 14, fontWeight: 700, color: '#D4E0EC', flexShrink: 0, textDecoration: 'none', cursor: 'pointer', transition: 'background .2s' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = 'rgba(200,151,74,0.14)'; }}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = 'rgba(200,151,74,0.07)'; }}>
                    <User size={13} color="#C8974A" /> أهلاً، {user.name.split(' ')[0]}
                  </Link>
                  <button onClick={handleLogout}
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <LogOut size={15} color="#EF4444" />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" style={{ fontFamily: "'Almarai',sans-serif", color: '#A0B4C8', fontWeight: 700, fontSize: 14, textDecoration: 'none', flexShrink: 0 }}>دخول</Link>
                  <Link href="/register"
                    style={{ fontFamily: "'Almarai',sans-serif", background: 'linear-gradient(135deg,#C8974A,#DEB06C)', color: '#0D1220', fontWeight: 800, fontSize: 14, borderRadius: 999, padding: '9px 22px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(200,151,74,0.35)', flexShrink: 0 }}>
                    احجز دلوقتي
                  </Link>
                </>
              )}
            </>
          )}

          {/* Hamburger button (mobile/tablet) */}
          {isMobileOrTablet && (
            <button onClick={() => setDrawerOpen(true)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Menu size={20} color="#D4E0EC" />
            </button>
          )}

        </div>
      </nav>

      {/* ══ MOBILE DRAWER ══ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="rp-drawer-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)} />

            {/* Drawer panel — slides in from right (RTL) */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: Math.min(320, window.innerWidth - 48),
                background: '#0D1220',
                borderLeft: '1px solid rgba(200,151,74,0.15)',
                boxShadow: '-8px 0 48px rgba(0,0,0,0.7)',
                zIndex: 999,
                display: 'flex', flexDirection: 'column',
                fontFamily: "'Almarai',sans-serif",
                direction: 'rtl',
                overflowY: 'auto',
              }}>

              {/* Drawer header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <RenoPackLogo size="sm" />
                <button onClick={() => setDrawerOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} color="#D4E0EC" />
                </button>
              </div>

              {/* Mobile search */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} color="#7A95AA" style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input placeholder="ابحث..." value={searchVal} onChange={e => setSearchVal(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '9px 36px 9px 16px', color: '#D4E0EC', fontSize: 14, fontFamily: "'Almarai',sans-serif", outline: 'none', direction: 'rtl' }} />
                </div>
              </div>

              {/* Nav links */}
              <div style={{ padding: '10px 12px', flex: 1 }}>
                <p style={{ fontSize: 10, color: '#5C7488', fontWeight: 700, letterSpacing: 1.5, marginBottom: 8, paddingRight: 6 }}>القائمة</p>
                {STATIC_NAV.map(n => (
                  <Link key={n.href} href={n.href}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderRadius: 12, marginBottom: 4, textDecoration: 'none', background: isActive(n.href) ? 'rgba(200,151,74,0.1)' : 'transparent', color: isActive(n.href) ? '#C8974A' : '#D4E0EC', fontWeight: 700, fontSize: 15, transition: 'background .2s' }}>
                    <n.Icon size={18} color={isActive(n.href) ? '#C8974A' : '#7A95AA'} />
                    {n.label}
                    {isActive(n.href) && <ChevronLeft size={14} color="#C8974A" style={{ marginRight: 'auto' }} />}
                  </Link>
                ))}

                {authLinks.length > 0 && (
                  <>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />
                    <p style={{ fontSize: 10, color: '#5C7488', fontWeight: 700, letterSpacing: 1.5, marginBottom: 8, paddingRight: 6 }}>حسابي</p>
                    {authLinks.map(n => (
                      <Link key={n.href} href={n.href}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderRadius: 12, marginBottom: 4, textDecoration: 'none', background: isActive(n.href) ? 'rgba(200,151,74,0.1)' : 'transparent', color: isActive(n.href) ? '#C8974A' : '#D4E0EC', fontWeight: 700, fontSize: 15 }}>
                        <n.Icon size={18} color={isActive(n.href) ? '#C8974A' : '#7A95AA'} />
                        {n.label}
                      </Link>
                    ))}
                  </>
                )}

                {/* Cart section in drawer */}
                {hasCart && (
                  <>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />
                    <p style={{ fontSize: 10, color: '#5C7488', fontWeight: 700, letterSpacing: 1.5, marginBottom: 8, paddingRight: 6 }}>سلتي ({cartCount})</p>
                    <CartContent />
                  </>
                )}
              </div>

              {/* Auth footer */}
              <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {user ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Link href="/profile" onClick={() => setDrawerOpen(false)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(200,151,74,0.1)', border: '1px solid rgba(200,151,74,0.2)', borderRadius: 12, padding: '11px', textDecoration: 'none', color: '#C8974A', fontWeight: 700, fontSize: 14 }}>
                      <User size={15} /> {user.name.split(' ')[0]}
                    </Link>
                    <button onClick={handleLogout}
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '11px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#EF4444', fontFamily: "'Almarai',sans-serif", fontWeight: 700, fontSize: 13 }}>
                      <LogOut size={14} /> خروج
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Link href="/login" onClick={() => setDrawerOpen(false)}
                      style={{ flex: 1, textAlign: 'center', padding: '11px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, textDecoration: 'none', color: '#D4E0EC', fontWeight: 700, fontSize: 14 }}>
                      دخول
                    </Link>
                    <Link href="/register" onClick={() => setDrawerOpen(false)}
                      style={{ flex: 1, textAlign: 'center', padding: '11px', background: 'linear-gradient(135deg,#C8974A,#DEB06C)', borderRadius: 12, textDecoration: 'none', color: '#0D1220', fontWeight: 800, fontSize: 14 }}>
                      احجز دلوقتي
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ MAIN ══ */}
      <main style={{ flexGrow: 1 }}>
        <motion.div key={location} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          {children}
        </motion.div>
      </main>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: '#070914', borderTop: '1px solid rgba(200,151,74,0.1)', padding: isMobile ? '36px 16px 80px' : isTablet ? '44px 20px 80px' : '52px 28px 0', fontFamily: "'Almarai',sans-serif" }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="rp-footer-grid" style={{ paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Brand column */}
            <div>
              <RenoPackLogo size="md" />
              <p style={{ color: '#5C7488', fontSize: 13, lineHeight: 1.9, maxWidth: 240, fontWeight: 500, margin: '16px 0 20px' }}>
                المنصة الأولى التي تربط بين مراكز قطع غيار رينو والورش المعتمدة في الإسكندرية — بأسعار شفافة وضمان حقيقي.
              </p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3DA882', boxShadow: '0 0 8px #3DA882', animation: 'rp-glow-blink 2s infinite' }} />
                <span style={{ color: '#3DA882', fontWeight: 700, fontSize: 12 }}>متاح ٢٤/٧ في الإسكندرية</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="tel:+201000000000" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5C7488', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(200,151,74,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>📞</span>
                  01000000000
                </a>
                <a href="https://wa.me/201000000000" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5C7488', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(37,211,102,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>💬</span>
                  واتساب
                </a>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5C7488', fontSize: 12, fontWeight: 600 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(122,149,170,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>📍</span>
                  الإسكندرية، مصر
                </span>
              </div>
            </div>
            {footerLinks.map(col => (
              <div key={col.t}>
                <p style={{ color: '#C8974A', fontWeight: 800, fontSize: 11, marginBottom: 18, letterSpacing: 1.8, textTransform: 'uppercase' }}>{col.t}</p>
                {col.items.map(item => (
                  <Link key={item.label} href={item.href}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(140,165,185,0.55)', fontSize: 13, marginBottom: 11, fontWeight: 600, textDecoration: 'none', transition: 'color .2s' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = '#C8974A'; }}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'rgba(140,165,185,0.55)'; }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div style={{ padding: '18px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: 'rgba(92,116,136,0.45)', fontSize: 12, fontWeight: 500 }}>© 2026 RenoPack — الإسكندرية. جميع الحقوق محفوظة.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 2 }}>{'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#C8974A', fontSize: 12 }}>{s}</span>)}</div>
              <span style={{ color: 'rgba(92,116,136,0.5)', fontSize: 11, fontWeight: 600 }}>4.9 من 1,247 تقييم</span>
              <span style={{ color: 'rgba(92,116,136,0.5)', fontSize: 11, fontWeight: 600 }}>🔒 دفع آمن 100%</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ══ BOTTOM TAB BAR (mobile / tablet) ══ */}
      <nav className="rp-bottom-nav">
        {BOTTOM_NAV.map(n => (
          <Link key={n.href} href={n.href} className={`rp-bottom-nav-item${isActive(n.href) ? ' active' : ''}`}>
            <n.Icon size={20} />
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>

    </div>
  );
}
