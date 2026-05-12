'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';

export default function WhatIsWebhookPage() {
  const t = useTranslations('whatIsWebhook');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t("title")} />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("title")}</h1>
        <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t("subtitle")}</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("simpleExplanation")}</h2>
            <p className="text-gray-600 dark:text-slate-400 leading-relaxed">Bir webhook, bir şey olduğunda bir uygulamanın başka bir uygulamaya gerçek zamanlı veri gönderme yoludur. Uygulamanızın sürekli olarak &quot;Yeni veri var mı? Yeni veri var mı?&quot; diye sormak (polling) yerine, diğer uygulama bir şey değiştiğinde size söyler.</p>
            <div className="p-4 bg-brand-50 dark:bg-brand-500/10 rounded-lg border border-brand-200 dark:border-brand-500/20 my-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t("thinkOfIt")}</p>
              <p className="text-sm text-gray-600 dark:text-slate-400"><strong>{t("polling")}</strong> {t("pizzaPollingDesc")}</p>
              <p className="text-sm text-gray-600 dark:text-slate-400"><strong>{t("pizzaWebhook")}</strong> {t("pizzaWebhookDesc")}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("howItWorks")}</h2>
            <ol className="space-y-3 text-gray-600 dark:text-slate-400">
              <li><strong>1. {t("step1")}</strong> — {t("step1Desc")}</li>
              <li><strong>2. {t("step2")}</strong> — {t("step2Desc")}</li>
              <li><strong>3. {t("step3")}</strong> — {t("step3Desc")}</li>
              <li><strong>4. {t("step4")}</strong> — {t("step4Desc")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("comparison")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 dark:border-slate-700 rounded-lg">
                <thead><tr className="bg-gray-50 dark:bg-slate-800"><th className="p-3 text-left">{t("aspect")}</th><th className="p-3 text-left">{t("polling")}</th><th className="p-3 text-left">Webhook</th></tr></thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-slate-700"><td className="p-3 font-medium">{t("direction")}</td><td className="p-3">You → Them</td><td className="p-3">Them → You</td></tr>
                  <tr className="border-t border-gray-200 dark:border-slate-700"><td className="p-3 font-medium">{t("timing")}</td><td className="p-3">{t("youCheck")}</td><td className="p-3">{t("instantNotification")}</td></tr>
                  <tr className="border-t border-gray-200 dark:border-slate-700"><td className="p-3 font-medium">{t("efficiency")}</td><td className="p-3">{t("wastesBandwidth")}</td><td className="p-3">{t("onlySends")}</td></tr>
                  <tr className="border-t border-gray-200 dark:border-slate-700"><td className="p-3 font-medium">{t("latency")}</td><td className="p-3">{t("secondsToMinutes")}</td><td className="p-3">{t("milliseconds")}</td></tr>
                  <tr className="border-t border-gray-200 dark:border-slate-700"><td className="p-3 font-medium">{t("complexity")}</td><td className="p-3">{t("simple")}</td><td className="p-3">{t("needsEndpoint")}</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("commonUseCases")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { titleKey: 'ucPayment', descKey: 'ucPaymentDesc' },
                { titleKey: 'ucCiCd', descKey: 'ucCiCdDesc' },
                { titleKey: 'ucChatbots', descKey: 'ucChatbotsDesc' },
                { titleKey: 'ucEcommerce', descKey: 'ucEcommerceDesc' },
                { titleKey: 'ucAi', descKey: 'ucAiDesc' },
                { titleKey: 'ucMonitoring', descKey: 'ucMonitoringDesc' },
              ].map((uc) => (
                <div key={uc.titleKey} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t(uc.titleKey)}</h4>
                  <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{t(uc.descKey)}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("security")}</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-3">{t("securityDesc")}</p>
            <ul className="space-y-2 text-gray-600 dark:text-slate-400">
              <li><strong>{t("hmac")}</strong> — Gönderen payload'ı bir gizli anahtarla imzalar. Siz imzayı doğrularsınız.</li>
              <li><strong>{t("https")}</strong> — İletimdeki verileri şifrelemek için her zaman TLS kullanın.</li>
              <li><strong>{t("ipWhitelisting")}</strong> — Yalnızca bilinen IP adreslerinden gelen istekleri kabul edin.</li>
              <li><strong>{t("timestampValidation")}</strong> — Tekrar saldırılarını önlemek için eski istekleri reddedin.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("gettingStarted")}</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-3">{t("gettingStartedDesc")}</p>
            <ol className="space-y-2 text-gray-600 dark:text-slate-400">
              <li><strong>1.</strong> {t("gsStep1")}</li>
              <li><strong>2.</strong> {t("gsStep2")}</li>
              <li><strong>3.</strong> {t("gsStep3")}</li>
              <li><strong>4.</strong> {t("gsStep4")}</li>
              <li><strong>5.</strong> {t("gsStep5")}</li>
            </ol>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20 mt-4">
              <p className="text-sm text-gray-700 dark:text-slate-300"><strong>{t("proTip")}</strong> {t("proTipDesc")}</p>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center p-6 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-2">{t("ctaTitle")}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-4">{t("ctaDesc")}</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t("ctaButton")}</Link>
        </div>
      </article>
      <Footer />
    </div>
  );
}
