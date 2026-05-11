'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';

export default function WhatIsWebhookPage() {
  const t = useTranslations('whatIsWebhook');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle="What is a Webhook?" />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">What is a Webhook?</h1>
        <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">A complete guide to webhooks — how they work, why they matter, and how to use them.</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("simpleExplanation")}</h2>
            <p className="text-gray-600 dark:text-slate-400 leading-relaxed">A webhook is a way for one application to send real-time data to another application when something happens. Instead of your app constantly asking &quot;Is there new data? Is there new data?&quot; (polling), the other app simply tells you when something changes.</p>
            <div className="p-4 bg-brand-50 dark:bg-brand-500/10 rounded-lg border border-brand-200 dark:border-brand-500/20 my-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Think of it like this:</p>
              <p className="text-sm text-gray-600 dark:text-slate-400"><strong>{t("polling")}</strong> = You keep calling the pizza place asking &quot;Is my pizza ready?&quot;</p>
              <p className="text-sm text-gray-600 dark:text-slate-400"><strong>Webhook</strong> = The pizza place calls YOU when your pizza is ready.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("howItWorks")}</h2>
            <ol className="space-y-3 text-gray-600 dark:text-slate-400">
              <li><strong>1. You register a URL</strong> — You tell a service &quot;When something happens, send data to this URL.&quot;</li>
              <li><strong>2. Something happens</strong> — A payment succeeds, a user signs up, an order ships.</li>
              <li><strong>3. The service sends a POST request</strong> — It sends the event data (payload) to your URL.</li>
              <li><strong>4. Your server processes it</strong> — You receive the data and take action (update database, send email, etc.).</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("comparison")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 dark:border-slate-800 rounded-lg">
                <thead><tr className="bg-gray-50 dark:bg-slate-800"><th className="p-3 text-left">{t("aspect")}</th><th className="p-3 text-left">{t("polling")}</th><th className="p-3 text-left">Webhook</th></tr></thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-slate-800"><td className="p-3 font-medium">{t("direction")}</td><td className="p-3">You → Them</td><td className="p-3">Them → You</td></tr>
                  <tr className="border-t border-gray-200 dark:border-slate-800"><td className="p-3 font-medium">{t("timing")}</td><td className="p-3">{t("youCheck")}</td><td className="p-3">{t("instantNotification")}</td></tr>
                  <tr className="border-t border-gray-200 dark:border-slate-800"><td className="p-3 font-medium">{t("efficiency")}</td><td className="p-3">{t("wastesBandwidth")}</td><td className="p-3">{t("onlySends")}</td></tr>
                  <tr className="border-t border-gray-200 dark:border-slate-800"><td className="p-3 font-medium">{t("latency")}</td><td className="p-3">{t("secondsToMinutes")}</td><td className="p-3">{t("milliseconds")}</td></tr>
                  <tr className="border-t border-gray-200 dark:border-slate-800"><td className="p-3 font-medium">{t("complexity")}</td><td className="p-3">{t("simple")}</td><td className="p-3">{t("needsEndpoint")}</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("commonUseCases")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Payment notifications', desc: 'Stripe sends a webhook when a payment succeeds or fails.' },
                { title: 'CI/CD pipelines', desc: 'GitHub sends a webhook when code is pushed, triggering a build.' },
                { title: 'Chat bots', desc: 'Slack/Discord sends a webhook when a message is posted.' },
                { title: 'E-commerce', desc: 'Order created, shipped, delivered — each triggers a webhook.' },
                { title: 'AI agents', desc: 'An AI agent sends a webhook when a task completes.' },
                { title: 'Monitoring', desc: 'An alert system sends a webhook when a server goes down.' },
              ].map((uc) => (
                <div key={uc.title} className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{uc.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{uc.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("security")}</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-3">Webhooks are sent over HTTP, so anyone can send a request to your URL. You need to verify that the request actually came from the expected service.</p>
            <ul className="space-y-2 text-gray-600 dark:text-slate-400">
              <li><strong>{t("hmac")}</strong> — The sender signs the payload with a secret. You verify the signature.</li>
              <li><strong>{t("https")}</strong> — Always use TLS to encrypt data in transit.</li>
              <li><strong>{t("ipWhitelisting")}</strong> — Only accept requests from known IP addresses.</li>
              <li><strong>{t("timestampValidation")}</strong> — Reject old requests to prevent replay attacks.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("gettingStarted")}</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-3">The easiest way to start with webhooks:</p>
            <ol className="space-y-2 text-gray-600 dark:text-slate-400">
              <li><strong>1.</strong> Create an endpoint on your server (a URL that accepts POST requests)</li>
              <li><strong>2.</strong> Register that URL with the service that will send webhooks</li>
              <li><strong>3.</strong> Verify the webhook signature in your endpoint</li>
              <li><strong>4.</strong> Process the event data and take action</li>
              <li><strong>5.</strong> Return a 200 status code to acknowledge receipt</li>
            </ol>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20 mt-4">
              <p className="text-sm text-gray-700 dark:text-slate-300"><strong>Pro tip:</strong> Use a webhook service like HookSniff to handle retries, security, and monitoring — so you can focus on your product.</p>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center p-6 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-2">Ready to use webhooks?</h2>
          <p className="text-gray-400 dark:text-slate-400 mb-4">HookSniff makes webhook delivery simple. Start free.</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Get started →</Link>
        </div>
      </article>
      <Footer />
    </div>
  );
}
