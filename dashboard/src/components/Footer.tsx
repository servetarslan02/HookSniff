import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const footerLinks = [
  { nameKey: 'github', href: 'https://github.com/servetarslan02/HookSniff' },
  { nameKey: 'docs', href: '/docs' },
  { nameKey: 'pricing', href: '/pricing' },
  { nameKey: 'compare', href: '/compare' },
  { nameKey: 'customers', href: '/customers' },
  { nameKey: 'security', href: '/security' },
  { nameKey: 'playground', href: '/playground' },
  { nameKey: 'startups', href: '/startups' },
  { nameKey: 'newsletter', href: '/newsletter' },
  { nameKey: 'useCases', href: '/use-cases' },
  { nameKey: 'blog', href: '/blog' },
  { nameKey: 'changelog', href: '/changelog' },
  { nameKey: 'whatIsAWebhook', href: '/what-is-a-webhook' },
  { nameKey: 'status', href: '/status' },
  { nameKey: 'about', href: '/about' },
  { nameKey: 'faq', href: '/faq' },
  { nameKey: 'contact', href: '/contact' },
  { nameKey: 'terms', href: '/terms' },
  { nameKey: 'privacy', href: '/privacy' },
];

export default function Footer() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪝</span>
          <span className="font-semibold text-gray-900 dark:text-white">HookSniff</span>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-slate-400">
          {footerLinks.map((link) => (
            <Link key={link.nameKey} href={link.href} className="hover:text-gray-900 dark:hover:text-white transition">
              {t(link.nameKey)}
            </Link>
          ))}
        </div>
        <p className="text-sm text-gray-400 dark:text-slate-500">{t('copyright')}</p>
      </div>
    </footer>
  );
}
