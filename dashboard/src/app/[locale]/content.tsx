'use client';

import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/store';
import { usePlans } from '@/hooks/usePlans';
import Footer from '@/components/Footer';

// Lazy load ThemeToggle
const ThemeToggleBtn = dynamic(() => import('@/components/ThemeToggle').then(m => m.ThemeToggle), { ssr: false });
// Lazy load LanguageSwitcher
const LanguageSwitcherBtn = dynamic(() => import('@/components/LanguageSwitcher').then(m => m.LanguageSwitcher), { ssr: false });

/* ─── Typewriter Effect ─── */
function TypewriterText() {
  const t = useTranslations('landing.hero');
  const phrases: string[] = t.raw('typewriter');
  const [text, setText] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIdx];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIdx < phrase.length) {
      timeout = setTimeout(() => {
        setText(phrase.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, 80);
    } else if (!isDeleting && charIdx === phrase.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setText(phrase.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      }, 40);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setPhraseIdx(i => (i + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, phraseIdx, phrases]);

  return (
    <span className="typewriter-cursor gradient-text">{text}</span>
  );
}

/* ─── Floating Particles (seeded to avoid SSR hydration mismatch) ─── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function FloatingParticles() {
  const rng = seededRandom(42);
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: rng() * 100,
    y: rng() * 100,
    size: rng() * 4 + 2,
    duration: rng() * 4 + 4,
    delay: rng() * 4,
    opacity: rng() * 0.15 + 0.05,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle bg-brand-400 dark:bg-brand-500"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.06]" aria-hidden="true">
        <line x1="20%" y1="30%" x2="45%" y2="60%" stroke="currentColor" strokeWidth="1" className="text-brand-500" />
        <line x1="60%" y1="20%" x2="80%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-purple-500" />
        <line x1="35%" y1="70%" x2="70%" y2="40%" stroke="currentColor" strokeWidth="1" className="text-brand-400" />
      </svg>
    </div>
  );
}

/* ─── Custom SVG Icons ─── */
const icons = {
  retry: (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16a12 12 0 0121.2-7.8" />
      <path d="M28 16a12 12 0 01-21.2 7.8" />
      <polyline points="24,2 24,8 18,8" />
      <polyline points="8,30 8,24 14,24" />
    </svg>
  ),
  shield: (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 2L4 8v8c0 7.2 5.1 13.3 12 14 6.9-.7 12-6.8 12-14V8L16 2z" />
      <polyline points="11,16 14,19 21,12" />
    </svg>
  ),
  chart: (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="24" height="24" rx="3" />
      <line x1="8" y1="22" x2="8" y2="16" />
      <line x1="13" y1="22" x2="13" y2="12" />
      <line x1="18" y1="22" x2="18" y2="18" />
      <line x1="23" y1="22" x2="23" y2="10" />
      <path d="M8 14l5-2 5 4 6-6" />
    </svg>
  ),
  bolt: (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="18,2 6,18 15,18 14,30 26,14 17,14" />
    </svg>
  ),
  queue: (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="24" height="6" rx="2" />
      <rect x="4" y="14" width="24" height="6" rx="2" />
      <rect x="4" y="22" width="24" height="6" rx="2" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      <circle cx="9" cy="17" r="1.5" fill="currentColor" />
      <circle cx="9" cy="25" r="1.5" fill="currentColor" />
    </svg>
  ),
  globe: (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="12" />
      <ellipse cx="16" cy="16" rx="5" ry="12" />
      <line x1="4" y1="16" x2="28" y2="16" />
      <path d="M6 8h20M6 24h20" />
    </svg>
  ),
  send: (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M35 5L18 22" />
      <path d="M35 5L24 35L18 22L5 16L35 5z" />
    </svg>
  ),
  deliver: (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="10" width="28" height="20" rx="3" />
      <polyline points="14,20 18,24 26,16" />
      <path d="M6 14l14 9 14-9" />
    </svg>
  ),
  monitor: (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="32" height="22" rx="3" />
      <line x1="16" y1="28" x2="16" y2="34" />
      <line x1="24" y1="28" x2="24" y2="34" />
      <line x1="12" y1="34" x2="28" y2="34" />
      <path d="M10 18l4-4 4 3 4-6 4 4" />
    </svg>
  ),
};

/* ─── Dashboard Preview Mockup ─── */
function DashboardPreview() {
  const tHero = useTranslations('landing.hero');
  return (
    <div className="relative max-w-3xl mx-auto mt-12">
      <div className="absolute -inset-4 bg-linear-to-r from-brand-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-brand-500/10 border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-white dark:bg-slate-700 rounded-md px-3 py-1 text-xs text-gray-500 dark:text-slate-400 font-mono">
              hooksniff.vercel.app
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: tHero('deliveries'), value: '24,891', color: 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400' },
              { label: tHero('successRate'), value: '99.9%', color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' },
              { label: tHero('avgLatency'), value: '45ms', color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                <div className="text-lg sm:text-2xl font-bold">{s.value}</div>
                <div className="text-xs opacity-75">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 h-32 flex items-end gap-1">
            {[40, 55, 35, 65, 50, 70, 60, 80, 55, 75, 85, 90, 70, 85, 95, 80, 90, 88, 92, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-brand-400 dark:bg-brand-500 rounded-t opacity-70" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Features Highlight Section ─── */
function SocialProof() {
  const t = useTranslations('landing.socialProof');

  const features = [
    { icon: '📨', title: t('featureWebhookTitle'), desc: t('featureWebhookDesc') },
    { icon: '🔌', title: t('featureEndpointTitle'), desc: t('featureEndpointDesc') },
    { icon: '🛡️', title: t('featureReliabilityTitle'), desc: t('featureReliabilityDesc') },
    { icon: '⚡', title: t('featureSpeedTitle'), desc: t('featureSpeedDesc') },
  ];

  return (
    <section className="py-16 border-y border-gray-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Features */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('whyHookSniff')}</h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">{t('whyHookSniffDesc')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="text-center glass-card p-6 hover-lift">
              <div className="text-3xl mb-3" aria-hidden="true">{feature.icon}</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works Section ─── */
function HowItWorks() {
  const t = useTranslations('landing.howItWorks');
  const steps = [
    { icon: icons.send, title: t('send'), desc: t('sendDesc') },
    { icon: icons.deliver, title: t('deliver'), desc: t('deliverDesc') },
    { icon: icons.monitor, title: t('monitor'), desc: t('monitorDesc') },
  ];

  return (
    <section className="py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('title')}</h2>
        <p className="text-gray-600 dark:text-slate-400 max-w-xl mx-auto">{t('subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div className="hidden md:block absolute top-10 left-[16.6%] right-[16.6%] h-0.5 bg-linear-to-r from-brand-300 via-purple-300 to-brand-300 dark:from-brand-700 dark:via-purple-700 dark:to-brand-700 opacity-100 dark:opacity-60 z-0" />
        {steps.map((step, i) => (
          <div key={i} className="relative flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 relative z-10 border border-brand-100 dark:border-brand-500/20">
              {step.icon}
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-600 dark:bg-brand-500 text-white text-sm font-bold flex items-center justify-center z-20">
                {i + 1}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
            <p className="text-gray-600 dark:text-slate-400 max-w-xs">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Landing Page ─── */
export function HomeContent() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();
  const { token, user } = useAuth();
  const locale = useLocale();

  // Admin users go to admin panel
  useEffect(() => {
    if (user?.is_admin) {
      router.replace('/admin');
    }
  }, [user, router]);
  const tNav = useTranslations('landing.nav');
  const tHero = useTranslations('landing.hero');
  const tFeatures = useTranslations('landing.features');
  const tPricing = useTranslations('landing.pricing');
  const tCommon = useTranslations('common');

  const featureKeys = ['smartRetries', 'hmacSignatures', 'dashboard', 'lowLatency', 'dlq', 'global'] as const;
  const featureIcons = [icons.retry, icons.shield, icons.chart, icons.bolt, icons.queue, icons.globe];

  const isTr = locale === 'tr';
  const { formatPrice } = usePlans();
  const [yearly, setYearly] = useState(false);
  const plans = [
    { name: tPricing('developer'), desc: tPricing('developerDesc'), price: '$0', period: tPricing('month'), features: tPricing.raw('developerFeatures') as string[], cta: tPricing('getStarted'), popular: false },
    { name: tPricing('startup'), desc: tPricing('startupDesc'), price: formatPrice('startup', yearly), period: yearly ? tPricing('year') : tPricing('month'), features: tPricing.raw('startupFeatures') as string[], cta: tPricing('getStarted'), popular: false },
    { name: tPricing('pro'), desc: tPricing('proDesc'), price: formatPrice('pro', yearly), period: yearly ? tPricing('year') : tPricing('month'), features: tPricing.raw('proFeatures') as string[], cta: tPricing('getStarted'), popular: true },
    { name: tPricing('enterprise'), desc: tPricing('enterpriseDesc'), price: '$99', period: yearly ? tPricing('year') : tPricing('month'), features: tPricing.raw('enterpriseFeatures') as string[], cta: tPricing('getStarted'), popular: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xl">🪝</div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">HookSniff</span>
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('features')}</a>
            <a href="#pricing" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('pricing')}</a>
            <Link href="/get-started" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('getStarted')}</Link>
            <Link href="/docs" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('docs')}</Link>
            <Link href="/status" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('status')}</Link>
            <LanguageSwitcherBtn />
            <ThemeToggleBtn />
            {token ? (
              <Link href="/register" className="bg-gray-900 dark:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition btn-glow">
                {tNav('dashboard')}
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition font-medium">
                  {tNav('login')}
                </Link>
                <Link href="/register" className="bg-gray-900 dark:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition btn-glow">
                  {tNav('register')}
                </Link>
              </>
            )}
          </div>
          {/* Mobile hamburger */}
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden p-2 -mr-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition" aria-label={tCommon("toggleNav")}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileNavOpen ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />)}
            </svg>
          </button>
        </div>
        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-gray-200/50 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl px-6 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileNavOpen(false)} className="block text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('features')}</a>
            <a href="#pricing" onClick={() => setMobileNavOpen(false)} className="block text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('pricing')}</a>
            <Link href="/docs" onClick={() => setMobileNavOpen(false)} className="block text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('docs')}</Link>
            <Link href="/get-started" onClick={() => setMobileNavOpen(false)} className="block text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('getStarted')}</Link>
            <Link href="/status" onClick={() => setMobileNavOpen(false)} className="block text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('status')}</Link>
            <div className="flex items-center gap-2 pt-2">
              <LanguageSwitcherBtn />
              <ThemeToggleBtn />
            </div>
            <Link href="/register" onClick={() => setMobileNavOpen(false)} className="block bg-gray-900 dark:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition text-center">
              {token ? tNav('dashboard') : tNav('register')}
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative hero-gradient">
        <FloatingParticles />
        <main className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="pt-24 pb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-brand-100 dark:border-brand-500/20">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {tHero('uptime')}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              {tHero('title')}
              <br />
              <TypewriterText />
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {tHero('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-gray-900 dark:bg-brand-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-gray-800 dark:hover:bg-brand-700 transition shadow-lg shadow-gray-900/20 dark:shadow-brand-500/30 btn-ripple btn-glow">
                {token ? tHero('ctaDashboard') : tHero('cta')}
              </Link>
              <Link href="/docs" className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-8 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition btn-ripple">
                {tHero('ctaSecondary')}
              </Link>
            </div>
          </div>
          <DashboardPreview />
        </main>
      </section>

      {/* Social Proof */}
      <SocialProof />

      {/* Code Example */}
      <div className="max-w-3xl mx-auto px-6 mb-24">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/50">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="ml-4 text-sm text-gray-500 dark:text-slate-400 font-mono">send-webhook.sh</span>
          </div>
          <pre className="p-4 sm:p-6 text-xs sm:text-sm font-mono text-gray-800 dark:text-slate-300 overflow-x-auto bg-white dark:bg-slate-800 max-w-full">
            <code className="break-all sm:break-normal">{`# Create an endpoint
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://myapp.com/webhook"}'

# Send a webhook
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"endpoint_id": "ep_abc123", "event": "order.created", "data": {"order_id": "12345"}}'`}</code>
          </pre>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{tFeatures('title')}</h2>
          <p className="text-gray-600 dark:text-slate-400 max-w-xl mx-auto">{tFeatures('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {featureKeys.map((key, i) => (
            <div key={key} className="glass-card p-8 hover-lift card-tilt group">
              <div className="w-14 h-14 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 border border-brand-100 dark:border-brand-500/20">
                {featureIcons[i]}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tFeatures(key)}</h3>
              <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{tFeatures(`${key}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-6">
        <HowItWorks />
      </div>

      {/* Pricing */}
      <div id="pricing" className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{tPricing('title')}</h2>
          {/* Monthly / Yearly toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm font-medium transition ${!yearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>
              {tPricing('month') || 'Monthly'}
            </span>
            <button
              type="button"
              onClick={() => setYearly(!yearly)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${yearly ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-600'}`}
              aria-label="Toggle yearly pricing"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${yearly ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`text-sm font-medium transition ${yearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>
              {tPricing('year') || 'Yearly'}
            </span>
            {yearly && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                -20%
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan, i) => (
            <div key={i} className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex flex-col ${
              plan.popular
                ? 'bg-white dark:bg-slate-800 border-2 border-brand-500 dark:border-brand-400 shadow-lg dark:shadow-brand-500/20 ring-1 ring-brand-400/30 dark:ring-brand-500/30'
                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xs dark:shadow-lg'
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 dark:bg-brand-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
                  {tPricing('mostPopular')}
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
              {plan.desc && (
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{plan.desc}</p>
              )}
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 dark:text-slate-400">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (token) {
                    router.push('/billing');
                  } else {
                    router.push('/register');
                  }
                }}
                className={`w-full py-3 rounded-xl font-medium transition cursor-pointer ${
                  plan.popular
                    ? 'bg-brand-600 dark:bg-brand-500 text-white hover:bg-brand-700 dark:hover:bg-brand-600 shadow-md'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-xs'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

            <Footer />
    </div>
  );
}
