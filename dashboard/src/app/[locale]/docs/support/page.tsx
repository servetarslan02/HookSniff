import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with HookSniff',
};

export default function SupportPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Support</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Need help? Here&apos;s how to get it.
      </p>

      {/* Self-Help */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Self-Help</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Before reaching out, check these resources:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><Link href="/docs/troubleshooting" className="text-brand-600 hover:text-brand-700">Troubleshooting</Link> — Common issues and solutions</li>
          <li><Link href="/docs/error-codes" className="text-brand-600 hover:text-brand-700">Error Codes</Link> — API error reference</li>
          <li><Link href="/docs/debug-failed-webhooks" className="text-brand-600 hover:text-brand-700">Debug Failed Webhooks</Link> — How to investigate delivery failures</li>
          <li><Link href="/docs/faq" className="text-brand-600 hover:text-brand-700">FAQ</Link> — Frequently asked questions</li>
        </ul>
      </section>

      {/* GitHub Issues */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">GitHub Issues</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          For bugs, feature requests, and technical questions:
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          <a href="https://github.com/servetarslan02/HookSniff/issues" className="text-brand-600 hover:text-brand-700" target="_blank" rel="noopener noreferrer">Open a GitHub Issue</a>
        </p>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          When reporting a bug, include:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Steps to reproduce</li>
          <li>Expected vs actual behavior</li>
          <li>API request/response (redact your API key)</li>
          <li>SDK version (if applicable)</li>
        </ul>
      </section>

      {/* Email */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Email</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          For account issues, billing questions, and security reports:
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          <a href="mailto:support@hooksniff.com" className="text-brand-600 hover:text-brand-700">support@hooksniff.com</a>
        </p>
      </section>

      {/* Security */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Security Reports</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Found a security vulnerability? Please report it responsibly:
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          <a href="mailto:security@hooksniff.com" className="text-brand-600 hover:text-brand-700">security@hooksniff.com</a>
        </p>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Do not open a public GitHub issue for security vulnerabilities.
        </p>
      </section>
    </article>
  );
}
