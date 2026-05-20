'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import { Lock, Shield, ShieldCheck, Globe, MapPin, Key, ClipboardList, Clock, RefreshCw, Search } from '@/components/icons';

// features are now rendered via i18n keys

// compliance items are now rendered via i18n keys

export function SecurityPageContent() {
  const t = useTranslations('security');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t("title")} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full mb-4">{t("badge")}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t("heroTitle")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            { icon: <Lock size={32} strokeWidth={1.75} />, titleKey: 'featureTls', descKey: 'featureTlsDesc' },
            { icon: <Shield size={32} strokeWidth={1.75} />, titleKey: 'featureHmac', descKey: 'featureHmacDesc' },
            { icon: <ShieldCheck size={32} strokeWidth={1.75} />, titleKey: 'feature2fa', descKey: 'feature2faDesc' },
            { icon: <Globe size={32} strokeWidth={1.75} />, titleKey: 'featureSso', descKey: 'featureSsoDesc' },
            { icon: <MapPin size={32} strokeWidth={1.75} />, titleKey: 'featureIpWhitelist', descKey: 'featureIpWhitelistDesc' },
            { icon: <Shield size={32} strokeWidth={1.75} />, titleKey: 'featureSsrf', descKey: 'featureSsrfDesc' },
            { icon: <Key size={32} strokeWidth={1.75} />, titleKey: 'featureArgon2', descKey: 'featureArgon2Desc' },
            { icon: <ClipboardList size={32} strokeWidth={1.75} />, titleKey: 'featureAuditLogs', descKey: 'featureAuditLogsDesc' },
            { icon: <Globe size={32} strokeWidth={1.75} />, titleKey: 'featureEuData', descKey: 'featureEuDataDesc' },
            { icon: <Key size={32} strokeWidth={1.75} />, titleKey: 'featureKeyRotation', descKey: 'featureKeyRotationDesc' },
            { icon: <Clock size={32} strokeWidth={1.75} />, titleKey: 'featureRateLimit', descKey: 'featureRateLimitDesc' },
            { icon: <RefreshCw size={32} strokeWidth={1.75} />, titleKey: 'featureSecretRotation', descKey: 'featureSecretRotationDesc' },
          ].map((f) => (
            <div key={f.titleKey} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
              <span className="text-gray-600 dark:text-slate-400 mb-3 block">{f.icon}</span>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t(f.titleKey)}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">{t(f.descKey)}</p>
            </div>
          ))}
        </div>

        {/* Compliance */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t("complianceTitle")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'GDPR', statusKey: 'compliant', descKey: 'gdprDesc' },
              { name: 'SOC 2', statusKey: 'ready', descKey: 'soc2Desc' },
              { name: 'CCPA', statusKey: 'compliant', descKey: 'ccpaDesc' },
              { name: 'KVKK', statusKey: 'compliant', descKey: 'kvkkDesc' },
              { name: 'Standard Webhooks', statusKey: 'compliant', descKey: 'standardWebhooksDesc' },
              { name: 'CloudEvents v1.0', statusKey: 'supported', descKey: 'cloudeventsDesc' },
            ].map((c) => (
              <div key={c.name} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">{c.name}</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">{t(c.statusKey)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400">{t(c.descKey)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Security */}
        <div className="mb-16 p-6 md:p-8 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t("architecture")}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t("dataAtRest")}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{t("featureTlsDesc")}</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{t("neonPostgres")}</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{t("upstashRedis")}</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Cloudflare R2</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t("dataInTransit")}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>TLS 1.3</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{t("hsts")}</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{t("certPinning")}</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{t("noHttp")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Responsible Disclosure */}
        <div className="mb-16 p-6 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2"><Search size={16} strokeWidth={1.75} className="inline mr-1" /> {t("responsibleDisclosure")}</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
            {t("responsibleDisclosureDesc")}
          </p>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {t("responsibleDisclosureCommit")}
          </p>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t("ctaTitle")}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">{t("ctaDesc")}</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/contact" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t("ctaContact")}</Link>
            <a href="https://github.com/servetarslan02/HookSniff" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors">{t("viewSource")}</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
