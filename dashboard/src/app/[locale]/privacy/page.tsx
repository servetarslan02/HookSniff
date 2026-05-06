'use client';

import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function PrivacyPage() {
  const t = useTranslations('privacy');
  const tc = useTranslations('common');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t('nav')}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-12">{t('lastUpdated')}</p>

        <div className="prose dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
            <p>HookRelay ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our webhook delivery service ("Service").</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-6">2.1 Account Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address</li>
              <li>Name (optional)</li>
              <li>Company name (optional)</li>
              <li>Payment information (processed by Stripe, not stored by us)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-6">2.2 Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>API request logs (endpoint URLs, timestamps, response codes)</li>
              <li>Webhook delivery logs (payloads, delivery attempts, status)</li>
              <li>Dashboard activity (page views, feature usage)</li>
              <li>IP addresses (for security and rate limiting)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-6">2.3 Technical Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Device information</li>
              <li>Cookies and session tokens</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the Service</li>
              <li>Process webhook deliveries and retries</li>
              <li>Authenticate and authorize API requests</li>
              <li>Send service-related notifications (delivery failures, billing alerts)</li>
              <li>Improve the Service and fix bugs</li>
              <li>Prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">4. Webhook Payloads</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We process webhook payloads solely for delivery to your configured endpoints</li>
              <li>Payloads are stored temporarily for delivery, retry, and logging purposes</li>
              <li>Payloads are automatically deleted according to your plan's retention period</li>
              <li>We do not inspect, analyze, mine, or sell your webhook data</li>
              <li>We do not use your webhook data for advertising or profiling</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">5. Data Sharing</h2>
            <p className="mb-2">We do NOT sell your personal data. We may share information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe:</strong> Payment processing (subject to Stripe's Privacy Policy)</li>
              <li><strong>Infrastructure providers:</strong> Cloud hosting for Service operation</li>
              <li><strong>Legal authorities:</strong> When required by law, court order, or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">6. Data Security</h2>
            <p className="mb-2">We implement industry-standard security measures:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All data transmitted over TLS/HTTPS</li>
              <li>API keys are hashed before storage (SHA-256)</li>
              <li>HMAC-SHA256 signatures for webhook verification</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication for all systems</li>
            </ul>
            <p className="mt-4">However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">7. Data Retention</h2>
            <div className="bg-gray-100 dark:bg-slate-800 rounded-xl p-4 my-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-2 font-semibold text-gray-900 dark:text-white">Data Type</th>
                    <th className="text-left py-2 font-semibold text-gray-900 dark:text-white">Retention Period</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <td className="py-2">Account data</td>
                    <td className="py-2">While account is active + 30 days</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <td className="py-2">Webhook delivery logs</td>
                    <td className="py-2">Per plan (7 / 30 / 90 days)</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <td className="py-2">API request logs</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <td className="py-2">Payment records</td>
                    <td className="py-2">As required by law (typically 7 years)</td>
                  </tr>
                  <tr>
                    <td className="py-2">Analytics data</td>
                    <td className="py-2">12 months (aggregated, non-identifying)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">8. Your Rights</h2>
            <p className="mb-2">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access</strong> your personal data</li>
              <li><strong>Correct</strong> inaccurate data</li>
              <li><strong>Delete</strong> your data ("right to be forgotten")</li>
              <li><strong>Export</strong> your data in a portable format</li>
              <li><strong>Object</strong> to certain processing</li>
              <li><strong>Withdraw consent</strong> where applicable</li>
            </ul>
            <p className="mt-4">To exercise these rights, contact us at <a href="mailto:privacy@hooksniff.is-a.dev" className="text-brand-600 dark:text-brand-400 hover:underline">privacy@hooksniff.is-a.dev</a>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">9. Cookies</h2>
            <p className="mb-2">We use:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential cookies:</strong> Authentication, session management</li>
              <li><strong>Analytics cookies:</strong> Usage statistics (optional, can be disabled)</li>
            </ul>
            <p className="mt-4">You can control cookies through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">10. International Data Transfers</h2>
            <p>Your data may be processed in countries outside your own. We ensure appropriate safeguards are in place for international transfers, including Standard Contractual Clauses where required.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">11. Children's Privacy</h2>
            <p>The Service is not intended for users under 18. We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">12. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes via email or dashboard notification. The "Last updated" date at the top indicates when changes were made.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">13. Contact</h2>
            <p>For privacy-related questions or requests:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Email: <a href="mailto:privacy@hooksniff.is-a.dev" className="text-brand-600 dark:text-brand-400 hover:underline">privacy@hooksniff.is-a.dev</a></li>
              <li>Data Controller: HookRelay</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
