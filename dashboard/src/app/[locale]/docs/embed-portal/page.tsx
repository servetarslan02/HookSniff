import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Embed Portal',
  description: 'Embed the HookSniff customer portal in your application',
};

export default async function PortalPage() {
  const t = await getTranslations('docsEmbedPortal');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('problemDesc')}</p>
      </section>

      {/* How to Embed */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howEmbed')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('howEmbedDesc')}</p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('install')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-3">{t('installDesc')}</p>
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('customization')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('customizationDesc')}</p>
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

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('features')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('feature1')}</li>
          <li>{t('feature2')}</li>
          <li>{t('feature3')}</li>
          <li>{t('feature4')}</li>
          <li>{t('feature5')}</li>
          <li>{t('feature6')}</li>
          <li>{t('feature7')}</li>
        </ul>
      </section>
    </article>
  );
}
