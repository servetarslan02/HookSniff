import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-lg">🪝</div>
            <span className="text-lg font-bold text-gray-900">Hookrelay</span>
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">← Back to Home</Link>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-6 py-12 prose prose-gray max-w-none">
        <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: May 6, 2026</p>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">1. Introduction</h2>
          <p className="text-gray-600">
            Hookrelay (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our webhook delivery service.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">2. Information We Collect</h2>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Account Information</h3>
          <ul className="text-gray-600 space-y-2">
            <li>Email address (for authentication and communication)</li>
            <li>Name (optional, for personalization)</li>
            <li>Billing information (processed by our payment provider, Stripe)</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-4">Service Data</h3>
          <ul className="text-gray-600 space-y-2">
            <li>Endpoint URLs you register</li>
            <li>Webhook delivery metadata (timestamps, status codes, attempt counts)</li>
            <li>API request logs (for debugging, retained for 30 days)</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-4">Webhook Payloads</h3>
          <p className="text-gray-600">
            We process webhook payloads to deliver them to your endpoints. Payload data is held in memory during delivery and is not permanently stored. Failed deliveries are retained in our dead letter queue for up to 7 days for debugging purposes.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">3. How We Use Your Information</h2>
          <ul className="text-gray-600 space-y-2">
            <li>To provide, maintain, and improve the Service</li>
            <li>To process webhook deliveries and retries</li>
            <li>To send service-related communications (delivery failures, account alerts)</li>
            <li>To monitor usage for billing and rate limiting</li>
            <li>To detect and prevent abuse or security incidents</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">4. Data Sharing</h2>
          <p className="text-gray-600">
            We do not sell your personal information. We may share data with:
          </p>
          <ul className="text-gray-600 space-y-2">
            <li><strong>Service providers:</strong> Infrastructure (AWS/GCP), payment processing (Stripe), email delivery</li>
            <li><strong>Legal requirements:</strong> When required by law, subpoena, or government request</li>
            <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">5. Cookies & Tracking</h2>
          <p className="text-gray-600">
            We use essential cookies for authentication and session management. We do not use third-party advertising cookies. The dashboard uses localStorage to store your authentication token and preferences.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">6. Data Security</h2>
          <p className="text-gray-600">
            We implement industry-standard security measures including TLS encryption for data in transit, encryption at rest for sensitive data, and regular security audits. API keys are hashed before storage. However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">7. Your Rights (GDPR)</h2>
          <p className="text-gray-600">If you are in the European Economic Area, you have the right to:</p>
          <ul className="text-gray-600 space-y-2">
            <li><strong>Access</strong> — request a copy of your personal data</li>
            <li><strong>Rectification</strong> — correct inaccurate data</li>
            <li><strong>Erasure</strong> — request deletion of your data</li>
            <li><strong>Portability</strong> — receive your data in a machine-readable format</li>
            <li><strong>Objection</strong> — object to processing of your data</li>
            <li><strong>Restriction</strong> — request restricted processing</li>
          </ul>
          <p className="text-gray-600 mt-4">
            To exercise these rights, contact us at{' '}
            <a href="mailto:privacy@hookrelay.io" className="text-brand-600 hover:text-brand-700">privacy@hookrelay.io</a>.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">8. Data Retention</h2>
          <ul className="text-gray-600 space-y-2">
            <li>Account data: retained while your account is active</li>
            <li>Delivery metadata: retained for 90 days (Pro/Business: 365 days)</li>
            <li>API logs: retained for 30 days</li>
            <li>Failed payloads (dead letter queue): retained for 7 days</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">9. International Transfers</h2>
          <p className="text-gray-600">
            Your data may be processed in countries outside the EEA. We ensure appropriate safeguards are in place, including Standard Contractual Clauses where required.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">10. Children&apos;s Privacy</h2>
          <p className="text-gray-600">
            The Service is not intended for users under 16 years of age. We do not knowingly collect data from children.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">11. Changes to This Policy</h2>
          <p className="text-gray-600">
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the Service.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">12. Contact Us</h2>
          <p className="text-gray-600">
            For privacy-related inquiries:<br />
            Email: <a href="mailto:privacy@hookrelay.io" className="text-brand-600 hover:text-brand-700">privacy@hookrelay.io</a><br />
            Data Protection Officer: <a href="mailto:dpo@hookrelay.io" className="text-brand-600 hover:text-brand-700">dpo@hookrelay.io</a>
          </p>
        </section>
      </article>
      <Footer />
    </div>
  );
}
