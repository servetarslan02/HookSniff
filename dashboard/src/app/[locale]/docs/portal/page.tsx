import { useTranslations } from 'next-intl';
import CodeBlock from '@/components/CodeBlock';

export default function PortalPage() {
  const t = useTranslations(\'docs\');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t("embeddablePortal")}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Let your customers manage their own webhook endpoints, view deliveries, and inspect payloads — embedded directly in your app.
      </p>

      {/* What is the Portal */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What is the Embeddable Portal?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The embeddable portal is a white-labeled UI component that your customers can use to:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Create & manage endpoints</strong> — Add their own webhook URLs</li>
          <li><strong>View deliveries</strong> — See all webhook deliveries with status, timestamps, and payloads</li>
          <li><strong>Inspect payloads</strong> — View request and response details for each attempt</li>
          <li><strong>Rotate secrets</strong> — Manage their own signing secrets</li>
          <li><strong>Replay failed webhooks</strong> — Re-queue deliveries that failed</li>
        </ul>
      </section>

      {/* How to Embed */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("howToEmbed")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Add the portal to your app with a single script tag or iframe:
        </p>

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("customization")}</h2>
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
    createEndpoints: true,    // Allow customers to create endpoints
    rotateSecrets: true,      // Allow secret rotation
    replayDeliveries: true,   // Allow replaying failed webhooks
    viewPayloads: true,       // Show full payload details
  },
});`}
        />
      </section>

      {/* Customer Self-Service */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Customer Self-Service</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The portal enables customer self-service, reducing support burden:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Zero support tickets</strong> — Customers can debug their own webhook issues</li>
          <li><strong>Real-time visibility</strong> — See delivery status without contacting your team</li>
          <li><strong>Secure access</strong> — Each customer only sees their own endpoints and deliveries</li>
          <li><strong>API key scoping</strong> — Portal keys are scoped to the customer's resources</li>
        </ul>
      </section>
    </article>
  );
}
