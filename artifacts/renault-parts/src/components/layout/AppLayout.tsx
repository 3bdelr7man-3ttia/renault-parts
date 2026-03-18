import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Wrench, User, LogOut, PackageSearch, ClipboardList, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "تم تسجيل الخروج",
      description: "نراك قريباً!",
    });
    setLocation('/');
  };

  const navLinks = [
    { href: '/', label: 'الرئيسية', icon: Home },
    { href: '/packages', label: 'الباكدجات', icon: PackageSearch },
  ];

  if (user) {
    navLinks.push({ href: '/my-orders', label: 'طلباتي', icon: ClipboardList });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="fixed top-[-10%] left-[-10%] w-1/2 h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-1/2 h-[400px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-900 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-accent/50 transition-all duration-300">
                <Wrench className="w-6 h-6 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-primary leading-tight">رينو بارتس</span>
                <span className="text-xs text-muted-foreground font-medium">الإسكندرية</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`text-sm font-bold transition-colors hover:text-primary flex items-center gap-2 ${
                    location === link.href ? 'text-primary border-b-2 border-accent pb-1' : 'text-muted-foreground'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                    <User className="w-4 h-4 text-accent" />
                    أهلاً، {user.name.split(' ')[0]}
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <Button variant="ghost" className="font-bold text-primary">دخول</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-full px-6">
                      حساب جديد
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-20 border-t-4 border-accent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-primary" />
                </div>
                <span className="text-2xl font-black text-white">رينو بارتس</span>
              </div>
              <p className="text-primary-foreground/70 leading-relaxed max-w-sm">
                المنصة الأولى المتخصصة في تقديم باكدجات صيانة سيارات رينو في الإسكندرية. قطع غيار مضمونة، تركيب احترافي، وتوصيل لحد باب البيت.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-accent mb-6">روابط سريعة</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-primary-foreground/80 hover:text-accent transition-colors">الرئيسية</Link></li>
                <li><Link href="/packages" className="text-primary-foreground/80 hover:text-accent transition-colors">تصفح الباكدجات</Link></li>
                <li><Link href="/login" className="text-primary-foreground/80 hover:text-accent transition-colors">تسجيل الدخول</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-accent mb-6">تواصل معنا</h3>
              <ul className="space-y-3 text-primary-foreground/80">
                <li className="flex items-center gap-2">
                  <span className="font-semibold text-white">العنوان:</span> الإسكندرية، سموحة
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-semibold text-white">هاتف:</span> 01001234567
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-semibold text-white">أوقات العمل:</span> يومياً 10ص - 10م
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} رينو بارتس الإسكندرية. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
