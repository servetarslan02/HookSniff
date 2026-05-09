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
  { name: 'HookSniff vs Svix', href: '/alternatives/svix' },
  { name: 'HookSniff vs Hookdeck', href: '/alternatives/hookdeck' },
  { name: 'HookSniff vs Hook0', href: '/alternatives/hook0' },
  { name: 'HookSniff vs Convoy', href: '/alternatives/convoy' },
  { name: 'Svix Alternatives', href: '/alternatives/svix-alternatives' },
  { name: 'Hookdeck Alternatives', href: '/alternatives/hookdeck-alternatives' },
  { name: 'Convoy Alternatives', href: '/alternatives/convoy-alternatives' },
  { name: 'Build vs Buy', href: '/build-vs-buy' },
];

const resourceLinks = [
  { name: 'Webhook Guides', href: '/webhooks/guides' },
  { name: 'Webhook Glossary', href: '/webhooks/glossary' },
  { name: 'Stripe Webhooks', href: '/providers/stripe' },
  { name: 'GitHub Webhooks', href: '/providers/github' },
  { name: 'Shopify Webhooks', href: '/providers/shopify' },
];

export default function Footer() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Product</h3>
            <ul className="space-y-2">
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
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Compare</h3>
            <ul className="space-y-2">
              {compareLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{link.name}</Link>
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
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Company</h3>
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
        <div className="pt-8 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪝</span>
            <span className="font-semibold text-gray-900 dark:text-white">HookSniff</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-slate-500">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
