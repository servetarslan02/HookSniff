import { useTranslations } from 'next-intl';
import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Embed Portal',
  description: 'Embed the HookSniff customer portal in your application',
};

export default function PortalPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Embeddable Portal</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Let your customers manage their own webhooks — without building a UI from scratch.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          If you&apos;re a SaaS platform sending webhooks to your customers, they need to:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Add and manage their webhook endpoints</li>
          <li>View delivery status and debug failures</li>
          <li>Rotate signing secrets</li>
          <li>Replay failed deliveries</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Building this UI yourself takes weeks. And every customer asks for different features.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Solution: Embeddable Portal</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff provides a white-labeled portal component you can embed in your app with a single script tag. Your customers get a full webhook management UI without you writing a line of frontend code.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">Customers can:</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Create & manage endpoints</strong> — Add their own webhook URLs</li>
          <li><strong>View deliveries</strong> — See all webhook deliveries with status, timestamps, and payloads</li>
          <li><strong>Inspect payloads</strong> — View request and response details for each attempt</li>
          <li><strong>Rotate secrets</strong> — Manage their own signing secrets</li>
          <li><strong>Replay failed deliveries</strong> — Re-queue deliveries that failed</li>
        </ul>
      </section>

      {/* How to Embed */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Embed</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Script Tag (Recommended)</h3>
        <CodeBlock
          code={`<!-- Add to your app's HTML -->
<script src="https://cdn.hooksniff.com/portal.js"></script>
<script>
  HookSniffPortal.init({
    apiKey: 'hr_live_YOUR_CUSTOMER_KEY',
    containerId: 'hooksniff-portal',
    theme: 'light', // or 'dark'
  });
</script>

<!-- Container element -->
<div id="hooksniff-portal"></div>`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Iframe</h3>
        <CodeBlock
          code={`<iframe
  src="https://portal.hooksniff.com/embed?key=hr_live_CUSTOMER_KEY&theme=light"
  width="100%"
  height="800"
  frameborder="0"
  style="border-radius: 12px; border: 1px solid #e5e7eb;"
></iframe>`}
        />
      </section>

      {/* Customization */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Customization</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Match the portal to your brand:
        </p>
        <CodeBlock
          code={`HookSniffPortal.init({
  apiKey: 'hr_live_YOUR_CUSTOMER_KEY',
  containerId: 'hooksniff-portal',
  theme: 'auto', // 'light', 'dark', or 'auto' (follows system)
  branding: {
    logo: 'https://yourapp.com/logo.svg',
    primaryColor: '#6366f1',
    companyName: 'Your Company',
  },
  features: {
    createEndpoints: true,
    rotateSecrets: true,
    replayDeliveries: true,
    viewPayloads: true,
  },
});`}
        />
      </section>

      {/* Benefits */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why Use the Portal?</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Zero support tickets</strong> — Customers debug their own webhook issues</li>
          <li><strong>Real-time visibility</strong> — See delivery status without contacting your team</li>
          <li><strong>Secure access</strong> — Each customer only sees their own endpoints and deliveries</li>
          <li><strong>API key scoping</strong> — Portal keys are scoped to the customer&apos;s resources</li>
          <li><strong>No frontend work</strong> — Embed with one line, customize with options</li>
        </ul>
      </section>
    </article>
  );
}
