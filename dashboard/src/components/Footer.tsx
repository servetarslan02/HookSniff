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

const compareLinks = [
  { nameKey: 'compareLinks.hooksniffVsSvix', href: '/alternatives/svix' },
  { nameKey: 'compareLinks.hooksniffVsHookdeck', href: '/alternatives/hookdeck' },
  { nameKey: 'compareLinks.hooksniffVsHook0', href: '/alternatives/hook0' },
  { nameKey: 'compareLinks.hooksniffVsConvoy', href: '/alternatives/convoy' },
  { nameKey: 'compareLinks.svixAlternatives', href: '/alternatives/svix-alternatives' },
  { nameKey: 'compareLinks.hookdeckAlternatives', href: '/alternatives/hookdeck-alternatives' },
  { nameKey: 'compareLinks.convoyAlternatives', href: '/alternatives/convoy-alternatives' },
  { nameKey: 'compareLinks.buildVsBuy', href: '/build-vs-buy' },
];

const resourceLinks = [
  { nameKey: 'resourceLinks.webhookGuides', href: '/webhooks/guides' },
  { nameKey: 'resourceLinks.webhookGlossary', href: '/webhooks/glossary' },
  { nameKey: 'resourceLinks.stripeWebhooks', href: '/providers/stripe' },
  { nameKey: 'resourceLinks.githubWebhooks', href: '/providers/github' },
  { nameKey: 'resourceLinks.shopifyWebhooks', href: '/providers/shopify' },
];

export default function Footer() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Main Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">{t('product')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/get-started" className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{t('getStarted')}</Link>
              </li>
              {['pricing', 'compare', 'playground', 'startups', 'security'].map((key) => {
                const link = footerLinks.find((l) => l.nameKey === key);
                return link ? (
                  <li key={key}>
                    <Link href={link.href} className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{t(link.nameKey)}</Link>
                  </li>
                ) : null;
              })}
            </ul>
          </div>

          {/* Compare */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">{t('compare')}</h3>
            <ul className="space-y-2">
              {compareLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{t(link.nameKey)}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">{t('resources')}</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{t(link.nameKey)}</Link>
                </li>
              ))}
              {['blog', 'changelog', 'newsletter', 'docs'].map((key) => {
                const link = footerLinks.find((l) => l.nameKey === key);
                return link ? (
                  <li key={key}>
                    <Link href={link.href} className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{t(link.nameKey)}</Link>
                  </li>
                ) : null;
              })}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">{t('company')}</h3>
            <ul className="space-y-2">
              {['about', 'contact', 'faq', 'status', 'terms', 'privacy'].map((key) => {
                const link = footerLinks.find((l) => l.nameKey === key);
                return link ? (
                  <li key={key}>
                    <Link href={link.href} className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{t(link.nameKey)}</Link>
                  </li>
                ) : null;
              })}
              <li>
                <a href="https://github.com/servetarslan02/HookSniff" className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition" target="_blank" rel="noopener noreferrer">GitHub</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪝</span>
            <span className="font-semibold text-gray-900 dark:text-white">HookSniff</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-500">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
