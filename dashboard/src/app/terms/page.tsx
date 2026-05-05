'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <a href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 Hookrelay</a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 dark:text-slate-400">Terms of Service</span>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-12">Last updated: May 6, 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using HookRelay ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">2. Description of Service</h2>
            <p>HookRelay provides webhook delivery infrastructure for developers. The Service includes webhook delivery, retry logic, signature verification, monitoring dashboard, and related APIs.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">3. Account Registration</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate registration information</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 18 years old to use the Service</li>
              <li>One account per person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">4. API Keys and Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>API keys are issued to your account and must be kept confidential</li>
              <li>You are responsible for all activity that occurs under your API keys</li>
              <li>Notify us immediately if you suspect unauthorized use of your API keys</li>
              <li>We may rotate or revoke API keys for security reasons</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">5. Acceptable Use</h2>
            <p className="mb-2">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Send webhooks to internal, private, or malicious endpoints (SSRF)</li>
              <li>Attempt to circumvent rate limits or security measures</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Use the Service to send spam, malware, or phishing content</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">6. Webhook Payloads</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You retain ownership of all data you send through the Service</li>
              <li>We process webhook payloads solely for delivery purposes</li>
              <li>We do not inspect, analyze, or sell your webhook data</li>
              <li>Payloads are stored temporarily for delivery and retry purposes, then deleted per the retention policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">7. Service Level</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Service is provided on a "best effort" basis</li>
              <li>We do not guarantee 100% delivery or uptime</li>
              <li>Paid plans include the SLA terms specified in the applicable pricing tier</li>
              <li>We may perform scheduled maintenance with reasonable advance notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">8. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Webhook delivery logs are retained according to your plan's retention period</li>
              <li>Free plan: 7 days</li>
              <li>Pro plan: 30 days</li>
              <li>Business plan: 90 days</li>
              <li>After the retention period, data is automatically and permanently deleted</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">9. Payment and Billing</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Paid plans are billed monthly in advance</li>
              <li>All fees are non-refundable except as required by applicable law</li>
              <li>We may change pricing with 30 days' notice</li>
              <li>Failure to pay may result in account suspension or downgrade to Free plan</li>
              <li>Overage charges may apply if you exceed your plan limits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">10. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Service, including its code, design, and documentation, is our intellectual property</li>
              <li>You retain all rights to your data and content</li>
              <li>You grant us a limited license to process your data solely to provide the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">11. Limitation of Liability</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 my-4">
              <p className="font-semibold text-yellow-800 dark:text-yellow-300">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND</li>
              <li>WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
              <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM</li>
              <li>WE SHALL NOT BE LIABLE FOR DATA LOSS, LOST PROFITS, OR BUSINESS INTERRUPTION</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">12. Indemnification</h2>
            <p className="mb-2">You agree to indemnify and hold us harmless from any claims, losses, or damages arising from:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Webhook payloads you send through the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">13. Termination</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may terminate your account at any time through the dashboard</li>
              <li>We may terminate or suspend your account for violation of these Terms</li>
              <li>We may discontinue the Service with 30 days' notice</li>
              <li>Upon termination, your data will be deleted within 30 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">14. Modifications</h2>
            <p>We may update these Terms from time to time. We will notify you of material changes via email or dashboard notification. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">15. Governing Law</h2>
            <p>These Terms are governed by the laws of Turkey. Any disputes shall be resolved in the courts of Turkey.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">16. Contact</h2>
            <p>For questions about these Terms, contact: <a href="mailto:legal@hookrelay.dev" className="text-brand-600 dark:text-brand-400 hover:underline">legal@hookrelay.dev</a></p>
          </section>
        </div>
      </main>
    </div>
  );
}
