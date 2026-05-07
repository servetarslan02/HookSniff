'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'General',
    question: 'What is HookSniff?',
    answer: 'HookSniff is a webhook delivery service for developers. You send webhooks, we deliver them. If they fail, we retry with exponential backoff. Think of it as a reliable middleman between your services.',
  },
  {
    category: 'General',
    question: 'How is HookSniff different from Svix or Hookdeck?',
    answer: 'HookSniff is significantly cheaper (starts at $0/month vs $49+/month), supports multiple delivery methods (HTTP, WebSocket, gRPC, SQS), and includes a free tier with 1,000 webhooks/month. We also offer Standard Webhooks compliance and an embeddable portal widget.',
  },
  {
    category: 'General',
    question: 'Is HookSniff open source?',
    answer: 'The core API and worker are MIT-licensed. SDKs are open source. The dashboard and proprietary features are source-available.',
  },
  {
    category: 'Getting Started',
    question: 'How do I get started?',
    answer: 'Sign up for free, create an endpoint (your webhook URL), get your API key, and start sending webhooks. No credit card required. Check our Quickstart Guide in the docs.',
  },
  {
    category: 'Getting Started',
    question: 'Do I need to install anything?',
    answer: 'No. HookSniff is a hosted service. Just make HTTP requests to our API. We also have SDKs for Node.js, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, and Swift if you prefer.',
  },
  {
    category: 'Billing',
    question: 'Is there a free plan?',
    answer: 'Yes! The free plan includes 1,000 webhooks/month, 5 endpoints, 7-day retention, and HMAC signature verification. No credit card required.',
  },
  {
    category: 'Billing',
    question: 'How does billing work?',
    answer: 'We use Polar.sh for global payments (credit card, PayPal) and iyzico for Turkish customers (TRY, 3D Secure). Plans are billed monthly. You can upgrade or downgrade anytime.',
  },
  {
    category: 'Billing',
    question: 'What happens if I exceed my plan limits?',
    answer: 'Webhooks over your limit are queued and delivered in the next billing cycle. You won\'t lose any data. We\'ll also send you an email notification when you\'re close to your limit.',
  },
  {
    category: 'Technical',
    question: 'What webhook formats do you support?',
    answer: 'We support Standard Webhooks (HMAC-SHA256) and CloudEvents. You can configure the format per endpoint. Standard Webhooks is recommended for compatibility.',
  },
  {
    category: 'Technical',
    question: 'How do retries work?',
    answer: 'Failed deliveries are retried with exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 64s, 128s, 256s, 512s (max 10 attempts). After all retries fail, the webhook is moved to the Dead Letter Queue (DLQ) for debugging.',
  },
  {
    category: 'Technical',
    question: 'Can I replay failed webhooks?',
    answer: 'Yes! Use the replay endpoint or the dashboard to replay any failed webhook. The delivery is retried with the same payload and headers.',
  },
  {
    category: 'Technical',
    question: 'Do you support WebSocket or gRPC delivery?',
    answer: 'Yes. You can configure endpoints to receive webhooks via HTTP, WebSocket, gRPC, or even AWS SQS. Choose the method that best fits your architecture.',
  },
  {
    category: 'Security',
    question: 'How do you verify webhook signatures?',
    answer: 'We use HMAC-SHA256 signatures following the Standard Webhooks specification. Each endpoint gets a unique signing secret. You verify the signature on your end to ensure the webhook came from HookSniff.',
  },
  {
    category: 'Security',
    question: 'Is my data encrypted?',
    answer: 'Yes. All data is transmitted over TLS/HTTPS. Webhook payloads are encrypted at rest. API keys are hashed before storage. We follow industry-standard security practices.',
  },
  {
    category: 'Security',
    question: 'Do you comply with GDPR?',
    answer: 'Yes. We have a comprehensive Privacy Policy, support data export and deletion requests, and use EU-based infrastructure (Frankfurt region). See our Privacy Policy for details.',
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition"
      >
        <span className="font-medium text-gray-900 dark:text-white pr-4">{item.question}</span>
        <svg
          className={`w-5 h-5 text-gray-400 dark:text-slate-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-4 text-gray-600 dark:text-slate-400 leading-relaxed border-t border-gray-100 dark:border-slate-800 pt-4">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const categories = [...new Set(faqs.map(f => f.category))];
  const [activeCategory, setActiveCategory] = useState('General');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">FAQ</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-12">Everything you need to know about HookSniff.</p>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-brand-600 dark:bg-brand-500 text-white'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.filter(f => f.category === activeCategory).map((faq, i) => (
            <FAQAccordion key={i} item={faq} />
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Still have questions?</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">Can&apos;t find the answer you&apos;re looking for? We&apos;re here to help.</p>
          <Link href="/contact" className="inline-flex bg-brand-600 dark:bg-brand-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition">
            Contact Support
          </Link>
        </div>
      </main>
    </div>
  );
}
