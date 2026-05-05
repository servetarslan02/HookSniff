import Footer from '@/components/Footer';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 dark:border-slate-700 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-lg">🪝</div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Hookrelay</span>
          </Link>
          <Link href="/" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:text-white">← Back to Home</Link>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-6 py-12 prose prose-gray max-w-none">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Last updated: May 6, 2026</p>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Service Description</h2>
          <p className="text-gray-600 dark:text-slate-400">
            Hookrelay is a webhook delivery service that provides reliable, asynchronous delivery of HTTP webhooks to registered endpoints. The Service includes automatic retry mechanisms, HMAC signature verification, delivery monitoring, and a management dashboard.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Account Registration</h2>
          <p className="text-gray-600 dark:text-slate-400">
            To use the Service, you must create an account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your API keys and account credentials. You must notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Acceptable Use</h2>
          <p className="text-gray-600 dark:text-slate-400">You agree not to:</p>
          <ul className="text-gray-600 dark:text-slate-400 space-y-2">
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
            <li>Attempt to gain unauthorized access to the Service or related systems</li>
            <li>Transmit malware, viruses, or other harmful code through webhooks</li>
            <li>Exceed the rate limits associated with your subscription plan</li>
            <li>Resell or redistribute the Service without written authorization</li>
            <li>Use the Service to send unsolicited communications (spam)</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Subscription Plans & Billing</h2>
          <p className="text-gray-600 dark:text-slate-400">
            The Service offers Free, Pro, and Business subscription plans. Paid plans are billed monthly in advance. All fees are non-refundable except as required by applicable law. We reserve the right to modify pricing with 30 days notice.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Data & Privacy</h2>
          <p className="text-gray-600 dark:text-slate-400">
            We process webhook payloads on your behalf and do not permanently store payload data beyond the delivery retention period. Your use of the Service is also governed by our{' '}
            <Link href="/privacy" className="text-brand-600 dark:text-brand-400 hover:text-brand-700">Privacy Policy</Link>.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">6. Service Level</h2>
          <p className="text-gray-600 dark:text-slate-400">
            We strive for 99.99% uptime for the Service. Pro and Business plans include SLA guarantees with service credits for downtime exceeding the guaranteed threshold. The Service is provided &quot;as is&quot; without warranty of any kind.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">7. Limitation of Liability</h2>
          <p className="text-gray-600 dark:text-slate-400">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, HOOKRELAY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">8. Termination</h2>
          <p className="text-gray-600 dark:text-slate-400">
            Either party may terminate this agreement at any time. We may suspend or terminate your access immediately if you violate these Terms. Upon termination, your right to use the Service ceases, and we may delete your data after a reasonable retention period.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">9. Changes to Terms</h2>
          <p className="text-gray-600 dark:text-slate-400">
            We may update these Terms from time to time. We will notify you of material changes via email or through the Service. Continued use after changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">10. Contact</h2>
          <p className="text-gray-600 dark:text-slate-400">
            Questions about these Terms? Contact us at{' '}
            <a href="mailto:legal@hookrelay.io" className="text-brand-600 dark:text-brand-400 hover:text-brand-700">legal@hookrelay.io</a>.
          </p>
        </section>
      </article>
      <Footer />
    </div>
  );
}
