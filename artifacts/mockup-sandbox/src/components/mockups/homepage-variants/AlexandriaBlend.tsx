import React, { useState } from 'react';
import {
  Wrench, ShieldCheck, Truck, Star, Phone, MapPin,
  ChevronLeft, Zap, Droplets, Wind, Settings, Disc, Battery
} from 'lucide-react';

// ─── PALETTE ──────────────────────────────────────────────────────────────
// Deep Mediterranean teal + Amber gold + Coral accent + Pearl white
// Inspired by: the sea of Alexandria, terracotta of old buildings, lighthouse light
// ──────────────────────────────────────────────────────────────────────────

const PARTS = [
  { icon: Droplets, label: 'زيت المحرك', sub: 'أصلي 100%', color: '#FF6B35' },
  { icon: Disc, label: 'فرامل', sub: 'ضمان 6 شهور', color: '#00B4D8' },
  { icon: Wind, label: 'فلتر هواء', sub: 'يحسن الأداء', color: '#48CAE4' },
  { icon: Zap, label: 'شمعات', sub: 'NGK أصلي', color: '#F4A261' },
  { icon: Battery, label: 'بطارية', sub: 'ضمان سنة', color: '#2EC4B6' },
  { icon: Settings, label: 'فلتر زيت', sub: 'يصفي الشوائب', color: '#E76F51' },
];

const PACKAGES = [
  {
    id: 'emergency',
    name: 'باكدج الطوارئ',
    km: 'عند الحاجة',
    price: 299,
    color: '#E76F51',
    items: ['كشف عطل', 'تبديل زيت', 'فحص شامل'],
    badge: '',
  },
  {
    id: '20k',
    name: 'صيانة 20,000 كم',
    km: '20,000 كم',
    price: 1499,
    color: '#00B4D8',
    items: ['تبديل زيت + فلتر', 'فحص فرامل', 'ضبط إطارات', 'فحص بطارية'],
    badge: '',
  },
  {
    id: '40k',
    name: 'صيانة 40,000 كم',
    km: '40,000 كم',
    price: 2199,
    color: '#2EC4B6',
    items: ['كل خدمات 20k', 'تبديل شمعات', 'فحص علبة التروس', 'غسيل ثروتل'],
    badge: 'الأكثر طلباً',
  },
  {
    id: '60k',
    name: 'صيانة 60,000 كم',
    km: '60,000 كم',
    price: 3499,
    color: '#F4A261',
    items: ['كل خدمات 40k', 'تبديل بواجي', 'فحص ترموستات', 'تنظيف حقن الوقود'],
    badge: '',
  },
  {
    id: '100k',
    name: 'صيانة 100,000 كم',
    km: '100,000 كم',
    price: 5999,
    color: '#9B5DE5',
    items: ['صيانة شاملة كاملة', 'تبديل كل السوائل', 'فحص كهربائي كامل', 'تقرير مفصل'],
    badge: 'الأشمل',
  },
];

export function AlexandriaBlend() {
  const [activeKm, setActiveKm] = useState<string | null>(null);
  const activePackage = PACKAGES.find(p => p.id === activeKm) || null;

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif", background: '#0D1B2A', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{ background: 'rgba(13,27,42,0.95)', borderBottom: '1px solid rgba(0,180,216,0.2)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#00B4D8,#2EC4B6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={18} color="#0D1B2A" />
            </div>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 20, letterSpacing: -0.5 }}>رينو بارتس</span>
            <span style={{ color: '#00B4D8', fontSize: 11, fontWeight: 700, marginRight: 4, opacity: 0.8 }}>الإسكندرية</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>الباكدجات</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>قطع الغيار</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>الورش</span>
            <button style={{ background: 'linear-gradient(135deg,#00B4D8,#2EC4B6)', color: '#0D1B2A', border: 'none', borderRadius: 24, padding: '8px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
              احجز الآن
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 60px' }}>
        {/* Background art: lighthouse beam + sea waves */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* Sea gradient */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,180,216,0.06), transparent)' }} />
          {/* Lighthouse beam */}
          <div style={{ position: 'absolute', top: 0, left: '30%', width: 2, height: '100%', background: 'linear-gradient(to bottom, rgba(244,162,97,0.3), transparent)', transform: 'rotate(-15deg)', transformOrigin: 'top center' }} />
          <div style={{ position: 'absolute', top: 0, left: '32%', width: 80, height: '100%', background: 'linear-gradient(to bottom, rgba(244,162,97,0.05), transparent)', transform: 'rotate(-10deg)', transformOrigin: 'top center' }} />
          {/* Circles */}
          <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(0,180,216,0.1)' }} />
          <div style={{ position: 'absolute', top: -50, left: -50, width: 250, height: 250, borderRadius: '50%', border: '1px solid rgba(0,180,216,0.15)' }} />
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          {/* Left: Copy */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.3)', borderRadius: 24, padding: '6px 16px', marginBottom: 24 }}>
              <MapPin size={14} color="#00B4D8" />
              <span style={{ color: '#00B4D8', fontSize: 13, fontWeight: 700 }}>المنصة الأولى للرينو في الإسكندرية</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 52, fontWeight: 900, lineHeight: 1.2, margin: '0 0 16px' }}>
              صيانة، قطع غيار،<br />
              <span style={{ background: 'linear-gradient(135deg,#00B4D8,#2EC4B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                وضمان حقيقي.
              </span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.8, margin: '0 0 32px', maxWidth: 420 }}>
              من تبديل الزيت لأكبر عمرة — كل قطعة غيار أصلية، كل تركيب ضمانه مكتوب، والفني بييجي لحد بيتك.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button style={{ background: 'linear-gradient(135deg,#00B4D8,#2EC4B6)', color: '#0D1B2A', border: 'none', borderRadius: 32, padding: '14px 32px', fontWeight: 900, fontSize: 16, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,180,216,0.3)' }}>
                تصفح الباكدجات
              </button>
              <button style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 32, padding: '14px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                سجل سيارتك
              </button>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
              {[['1,200+', 'سيارة صُيِّنَت'], ['4.9', 'تقييم العملاء'], ['12', 'ورشة معتمدة']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ color: '#F4A261', fontSize: 24, fontWeight: 900 }}>{n}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Parts visual grid */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,180,216,0.15)', borderRadius: 24, padding: 24 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>قطع غيار أصلية متوفرة</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {PARTS.map(({ icon: Icon, label, sub, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}30`, borderRadius: 16, padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `${color}15`; (e.currentTarget as HTMLDivElement).style.borderColor = `${color}60`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = `${color}30`; }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${color}20`, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color={color} />
                    </div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{label}</div>
                    <div style={{ color: `${color}cc`, fontSize: 11, fontWeight: 600, marginTop: 2 }}>{sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(244,162,97,0.1)', border: '1px solid rgba(244,162,97,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={18} color="#F4A261" />
                <span style={{ color: '#F4A261', fontSize: 13, fontWeight: 700 }}>ضمان 12 شهر على كل القطع والتركيب</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MILEAGE SELECTOR ── */}
      <section style={{ background: 'linear-gradient(135deg, rgba(0,180,216,0.08), rgba(46,196,182,0.05))', borderTop: '1px solid rgba(0,180,216,0.1)', borderBottom: '1px solid rgba(0,180,216,0.1)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ color: '#fff', fontSize: 32, fontWeight: 900, margin: '0 0 8px' }}>اختار باكدجك حسب العداد</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: 600 }}>اضغط على عداد سيارتك وهنقولك الباكدج المناسب</p>
          </div>

          {/* Mileage buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {PACKAGES.map(pkg => {
              const isActive = activeKm === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setActiveKm(isActive ? null : pkg.id)}
                  style={{
                    border: `2px solid ${isActive ? pkg.color : 'rgba(255,255,255,0.15)'}`,
                    background: isActive ? `${pkg.color}20` : 'rgba(255,255,255,0.04)',
                    color: isActive ? pkg.color : 'rgba(255,255,255,0.7)',
                    borderRadius: 32, padding: '10px 24px', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit',
                  }}
                >
                  {pkg.km}
                </button>
              );
            })}
          </div>

          {/* Recommendation card */}
          {activePackage && (
            <div style={{ maxWidth: 560, margin: '0 auto', background: 'rgba(13,27,42,0.9)', border: `1.5px solid ${activePackage.color}50`, borderRadius: 24, padding: 32, boxShadow: `0 20px 60px ${activePackage.color}20`, transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>الباكدج الموصى به</p>
                  <h3 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: 0 }}>{activePackage.name}</h3>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: activePackage.color, fontSize: 32, fontWeight: 900 }}>{activePackage.price.toLocaleString()}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}>ج.م</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
                {activePackage.items.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: activePackage.color, flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600 }}>{item}</span>
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', background: `linear-gradient(135deg, ${activePackage.color}, ${activePackage.color}cc)`, color: '#fff', border: 'none', borderRadius: 16, padding: '14px', fontWeight: 900, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 8px 24px ${activePackage.color}40` }}>
                احجز الباكدج دلوقتي <ChevronLeft size={18} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── ALL PACKAGES STRIP ── */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '0 0 4px' }}>باكدجات الصيانة الكاملة</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>قطع أصلية + تركيب محترف + ضمان مكتوب</p>
            </div>
            <button style={{ color: '#00B4D8', background: 'none', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
              عرض الكل <ChevronLeft size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16 }}>
            {PACKAGES.map(pkg => (
              <div key={pkg.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${pkg.color}30`, borderRadius: 20, overflow: 'hidden', position: 'relative', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.borderColor = `${pkg.color}80`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.borderColor = `${pkg.color}30`; }}
              >
                {pkg.badge && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: pkg.color, color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 800 }}>{pkg.badge}</div>
                )}
                {/* Color top stripe */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${pkg.color}, ${pkg.color}80)` }} />
                <div style={{ padding: 20 }}>
                  <p style={{ color: `${pkg.color}cc`, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{pkg.km}</p>
                  <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: '0 0 16px', lineHeight: 1.3 }}>{pkg.name}</h3>
                  <div style={{ marginBottom: 16 }}>
                    {pkg.items.slice(0, 3).map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: pkg.color, flexShrink: 0 }} />
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, paddingTop: 16 }}>
                    <div style={{ color: pkg.color, fontSize: 22, fontWeight: 900 }}>{pkg.price.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 700 }}>ج.م</span></div>
                    <button style={{ marginTop: 12, width: '100%', background: `${pkg.color}15`, border: `1px solid ${pkg.color}40`, color: pkg.color, borderRadius: 12, padding: '8px', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                      احجز
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US (Alexandria angle) ── */}
      <section style={{ background: 'linear-gradient(135deg, #0D2137, #0D1B2A)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '0 0 8px' }}>ليه رينو بارتس الإسكندرية؟</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>مش بس محل قطع غيار — منظومة صيانة كاملة</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { icon: Wrench, title: 'قطع غيار أصلية', desc: 'كل قطعة معاها شهادة الأصالة وضمان المصنع. مفيش تقليد ولا تاني صنف.', color: '#00B4D8' },
              { icon: ShieldCheck, title: 'ضمان 12 شهر', desc: 'الضمان مكتوب في عقد. على القطعة والتركيب. لو في مشكلة، هنحلها علينا.', color: '#2EC4B6' },
              { icon: Truck, title: 'الفني بييجي ليك', desc: 'في الإسكندرية كلها — محتاجش تتعب وتروح الورشة. إحنا اللي بنيجي ليك.', color: '#F4A261' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 20, padding: 28 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={26} color={color} />
                </div>
                <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 10px' }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#060F18', borderTop: '1px solid rgba(0,180,216,0.1)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#00B4D8,#2EC4B6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench size={16} color="#0D1B2A" />
              </div>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>رينو بارتس</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7, maxWidth: 280 }}>
              المنصة الأولى لصيانة سيارات رينو بالإسكندرية. قطع أصلية، ورش معتمدة، وتركيب محترف بضمان حقيقي.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
              <Phone size={14} color="#00B4D8" />
              <span style={{ color: '#00B4D8', fontWeight: 700, fontSize: 14 }}>01000000000</span>
            </div>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>روابط سريعة</p>
            {['الباكدجات', 'قطع الغيار', 'الورش', 'تواصل معنا'].map(l => (
              <div key={l} style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 10, cursor: 'pointer' }}>{l}</div>
            ))}
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>الإسكندرية</p>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <MapPin size={14} color='rgba(255,255,255,0.35)' style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.6 }}>الإسكندرية، مصر<br />أوقات العمل: 9 ص – 10 م</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} color="#F4A261" fill="#F4A261" />)}
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginRight: 4 }}>4.9 من 1,247 تقييم</span>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '32px auto 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, textAlign: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>© 2026 رينو بارتس الإسكندرية. جميع الحقوق محفوظة.</span>
        </div>
      </footer>
    </div>
  );
}
