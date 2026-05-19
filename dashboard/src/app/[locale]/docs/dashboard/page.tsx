import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Dashboard Guide',
  description: 'Learn how to use the HookSniff dashboard to manage webhooks',
};

export default async function DashboardPage() {
  const t = await getTranslations('docsDashboard');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whyDashboard')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('whyDashboardDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('whyDash1')}</li>
          <li>{t('whyDash2')}</li>
          <li>{t('whyDash3')}</li>
          <li>{t('whyDash4')}</li>
          <li>{t('whyDash5')}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('whyDashConclusion')}
        </p>
      </section>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('overview')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('overviewDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('overview1').split(' — ')[0]}</strong> — {t('overview1').split(' — ')[1]}</li>
          <li><strong>{t('overview2').split(' — ')[0]}</strong> — {t('overview2').split(' — ')[1]}</li>
          <li><strong>{t('overview3').split(' — ')[0]}</strong> — {t('overview3').split(' — ')[1]}</li>
          <li><strong>{t('overview4').split(' — ')[0]}</strong> — {t('overview4').split(' — ')[1]}</li>
        </ul>
      </section>

      {/* Endpoint Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('endpointMgmt')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('endpointMgmtDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('ep1').split(' — ')[0]}</strong> — {t('ep1').split(' — ')[1]}</li>
          <li><strong>{t('ep2').split(' — ')[0]}</strong> — {t('ep2').split(' — ')[1]}</li>
          <li><strong>{t('ep3').split(' — ')[0]}</strong> — {t('ep3').split(' — ')[1]}</li>
          <li><strong>{t('ep4').split(' — ')[0]}</strong> — {t('ep4').split(' — ')[1]}</li>
          <li><strong>{t('ep5').split(' — ')[0]}</strong> — {t('ep5').split(' — ')[1]}</li>
        </ul>
      </section>

      {/* Delivery Monitoring */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('deliveryMonitoring')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('deliveryMonitoringDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('dm1').split(' — ')[0]}</strong> — {t('dm1').split(' — ')[1]}</li>
          <li><strong>{t('dm2').split(' — ')[0]}</strong> — {t('dm2').split(' — ')[1]}</li>
          <li><strong>{t('dm3').split(' — ')[0]}</strong> — {t('dm3').split(' — ')[1]}</li>
          <li><strong>{t('dm4').split(' — ')[0]}</strong> — {t('dm4').split(' — ')[1]}</li>
        </ul>
      </section>

      {/* Analytics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('analytics')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('analyticsDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('an1').split(' — ')[0]}</strong> — {t('an1').split(' — ')[1]}</li>
          <li><strong>{t('an2').split(' — ')[0]}</strong> — {t('an2').split(' — ')[1]}</li>
          <li><strong>{t('an3').split(' — ')[0]}</strong> — {t('an3').split(' — ')[1]}</li>
          <li><strong>{t('an4').split(' — ')[0]}</strong> — {t('an4').split(' — ')[1]}</li>
        </ul>
      </section>

      {/* Team Collaboration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('teamCollab')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('teamCollabDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('tc1').split(' — ')[0]}</strong> — {t('tc1').split(' — ')[1]}</li>
          <li><strong>{t('tc2').split(' — ')[0]}</strong> — {t('tc2').split(' — ')[1]}</li>
          <li><strong>{t('tc3').split(' — ')[0]}</strong> — {t('tc3').split(' — ')[1]}</li>
          <li><strong>{t('tc4').split(' — ')[0]}</strong> — {t('tc4').split(' — ')[1]}</li>
        </ul>
      </section>

      {/* Settings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('settings')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('settingsDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('st1').split(' — ')[0]}</strong> — {t('st1').split(' — ')[1]}</li>
          <li><strong>{t('st2').split(' — ')[0]}</strong> — {t('st2').split(' — ')[1]}</li>
          <li><strong>{t('st3').split(' — ')[0]}</strong> — {t('st3').split(' — ')[1]}</li>
          <li><strong>{t('st4').split(' — ')[0]}</strong> — {t('st4').split(' — ')[1]}</li>
        </ul>
      </section>

      {/* Access */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('access')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('accessCloud')} <a href="https://hooksniff.vercel.app" className="text-brand-600 hover:text-brand-700" target="_blank" rel="noopener noreferrer">hooksniff.vercel.app</a>
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          {t('accessSelfHosted')} <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">http://localhost:3001</code> {t('accessSelfHostedPort')}
        </p>
      </section>
    </article>
  );
}
