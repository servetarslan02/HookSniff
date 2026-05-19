'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import { ShoppingBag, Zap } from 'lucide-react';

export function ShopifyWebhooksPageContent() {
  const t = useTranslations('providers');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t("shopify")} />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/10 rounded-full border border-green-200 dark:border-green-500/20 mb-4">
            <span className="text-lg"><ShoppingBag size={20} strokeWidth={1.75} /></span>
            <span className="text-sm font-medium text-green-700 dark:text-green-400">{t("shopifyIntegration")}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("shopifyWebhooksGuide")}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Integrate Shopify webhooks for orders, products, customers, and inventory. Keep your systems in sync with real-time events.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4"><Zap size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Quick Start</h2>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold shrink-0">1</span>
              <div><p className="font-medium text-gray-900 dark:text-white">{t("createEndpoint")}</p><p className="text-sm text-gray-600 dark:text-slate-400">Sign up and create an endpoint for Shopify webhooks.</p></div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold shrink-0">2</span>
              <div><p className="font-medium text-gray-900 dark:text-white">{t("configureShopify")}</p><p className="text-sm text-gray-600 dark:text-slate-400">Settings → Notifications → Webhooks → Create webhook. Select event and paste your URL.</p></div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold shrink-0">3</span>
              <div><p className="font-medium text-gray-900 dark:text-white">{t("verifyHmac")}</p><p className="text-sm text-gray-600 dark:text-slate-400">Shopify signs webhooks with HMAC-SHA256. HookSniff verifies this automatically.</p></div>
            </li>
          </ol>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4"><ClipboardList size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Common Shopify Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">{t("topic")}</th>
                <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">{t("whenItFires")}</th>
              </tr></thead>
              <tbody>
                {[
                  ['orders/create', 'New order placed'],
                  ['orders/fulfilled', 'Order fulfilled/shipped'],
                  ['orders/cancelled', 'Order cancelled'],
                  ['orders/refunded', 'Order refunded'],
                  ['products/create', 'New product added'],
                  ['products/update', 'Product updated'],
                  ['customers/create', 'New customer registered'],
                  ['customers/update', 'Customer profile updated'],
                  ['inventory_levels/update', 'Inventory quantity changed'],
                  ['app/uninstalled', 'App uninstalled from store'],
                ].map(([topic, desc]) => (
                  <tr key={topic} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                    <td className="py-2 px-4 font-mono text-xs text-brand-600 dark:text-brand-400">{topic}</td>
                    <td className="py-2 px-4 text-gray-600 dark:text-slate-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t("startReceivingShopify")}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">Keep your e-commerce systems in sync with real-time order and inventory events.</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Start for free →</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
