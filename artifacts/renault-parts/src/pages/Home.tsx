import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Wrench, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useListPackages } from '@workspace/api-client-react';
import { PackageCard } from '@/components/PackageCard';

export default function Home() {
  const { data: packages, isLoading } = useListPackages();

  const features = [
    {
      icon: <Wrench className="w-8 h-8 text-accent" />,
      title: "تركيب احترافي",
      desc: "ورش شريكة معتمدة لضمان جودة التركيب بأعلى المعايير."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-accent" />,
      title: "ضمان حقيقي",
      desc: "ضمان يصل إلى 12 شهراً على القطع والتركيب لراحة بالك."
    },
    {
      icon: <Truck className="w-8 h-8 text-accent" />,
      title: "توصيل للبيت",
      desc: "لا وقت للورشة؟ نرسل الفني والقطع لحد باب بيتك."
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary pt-24 pb-32 lg:pt-32 lg:pb-40">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-renault.png`} 
            alt="صيانة سيارات رينو" 
            className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-right"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-white font-semibold text-sm">المنصة الأولى لرينو في الإسكندرية</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
                صيانة سيارتك الرينو، <br />
                <span className="text-gradient-gold">أسهل من أي وقت.</span>
              </h1>
              
              <p className="text-lg text-white/80 mb-10 max-w-lg leading-relaxed font-medium">
                اكتشف باكدجات الصيانة المتكاملة المصممة خصيصاً لسيارتك. قطع غيار أصلية، أسعار شفافة، وتركيب لحد باب البيت.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/packages">
                  <Button size="lg" className="h-14 px-8 text-lg font-bold bg-accent text-primary hover:bg-accent/90 rounded-full shadow-xl shadow-accent/20">
                    تصفح الباكدجات <ArrowLeft className="mr-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-white/30 text-white hover:bg-white/10 rounded-full backdrop-blur-sm">
                    سجل سيارتك
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background rounded-t-[100%] scale-110 translate-y-8" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-primary mb-4">لماذا رينو بارتس؟</h2>
            <p className="text-muted-foreground font-medium max-w-2xl mx-auto">نقدم لك تجربة صيانة خالية من المتاعب بضمان حقيقي وأسعار تنافسية.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-8 text-center shadow-lg shadow-black/5 border border-border/50 hover-lift"
              >
                <div className="w-20 h-20 mx-auto bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Packages */}
      <section className="py-24 bg-secondary/50 border-y border-border/50 relative">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/pattern-bg.png)` }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-primary mb-2">أشهر باكدجات الصيانة</h2>
              <p className="text-muted-foreground font-medium">اختر الباكدج المناسب لعداد سيارتك.</p>
            </div>
            <Link href="/packages">
              <Button variant="ghost" className="hidden sm:flex font-bold text-primary hover:bg-primary/5">
                عرض الكل <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-card animate-pulse rounded-3xl border border-border/50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages?.slice(0, 3).map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center sm:hidden">
             <Link href="/packages">
              <Button className="w-full h-12 rounded-full font-bold bg-primary">
                عرض كل الباكدجات
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
