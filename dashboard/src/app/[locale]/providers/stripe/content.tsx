'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import { Code2, CreditCard, Zap, ClipboardList } from 'lucide-react';

export function StripeWebhooksPageContent() {
  const t = useTranslations('providers');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t("stripe")} />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-500/10 rounded-full border border-purple-200 dark:border-purple-500/20 mb-4">
            <span className="text-lg"><CreditCard size={20} strokeWidth={1.75} /></span>
            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">{t("stripeIntegration")}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("stripeWebhooksGuide")}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Receive and verify Stripe webhooks for payments, subscriptions, disputes, and more. Handle every Stripe event reliably.
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4"><Zap size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Quick Start</h2>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold shrink-0">1</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t("createEndpoint")}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">Sign up and create an endpoint that will receive Stripe webhooks.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold shrink-0">2</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t("configureStripe")}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">In Stripe Dashboard → Developers → Webhooks → Add endpoint. Paste your HookSniff URL.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold shrink-0">3</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t("selectEvents")}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">Choose which events to receive: payment_intent.succeeded, customer.subscription.updated, etc.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold shrink-0">4</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Verify & process</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">Use the HookSniff SDK to verify Stripe signatures and process events in your application.</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Common Events */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4"><ClipboardList size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Common Stripe Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">{t("event")}</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">{t("whenItFires")}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['payment_intent.succeeded', 'Payment completed successfully'],
                  ['payment_intent.payment_failed', 'Payment attempt failed'],
                  ['customer.subscription.created', 'New subscription started'],
                  ['customer.subscription.updated', 'Subscription changed (plan, quantity)'],
                  ['customer.subscription.deleted', 'Subscription cancelled'],
                  ['invoice.paid', 'Invoice payment succeeded'],
                  ['invoice.payment_failed', 'Invoice payment failed'],
                  ['charge.refunded', 'Refund issued'],
                  ['charge.dispute.created', 'Customer initiated a dispute'],
                  ['checkout.session.completed', 'Stripe Checkout completed'],
                ].map(([event, desc]) => (
                  <tr key={event} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                    <td className="py-2 px-4 font-mono text-xs text-brand-600 dark:text-brand-400">{event}</td>
                    <td className="py-2 px-4 text-gray-600 dark:text-slate-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4"><Code2 size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Node.js Example</h2>
          <pre className="bg-gray-900 dark:bg-slate-800 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto"><code>{`import { Webhook } from 'hooksniff-sdk';

const webhook = new Webhook(process.env.HOOKSNIFF_SECRET);

app.post('/webhooks/stripe', (req, res) => {
  const event = webhook.verify(req.body, req.headers);
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle successful payment
      handlePayment(event.data.object);
      break;
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      handleCancellation(event.data.object);
      break;
  }
  
  res.json({ received: true });
});`}</code></pre>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t("startReceivingStripe")}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">HookSniff handles signature verification, retries, and delivery monitoring automatically.</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Start for free →</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
