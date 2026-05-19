import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'HookSniff release history and version notes',
};

export default async function ChangelogPage() {
  const t = await getTranslations('docsChangelog');
  const tSdk = (key: string) => t(`sdkList.${key}` as any);

  // Get arrays from translations
  const platformFeatures = t.raw('platformFeatures') as string[];
  const sdkList = t.raw('sdkList') as string[];
  const cicdItems = t.raw('cicdItems') as string[];
  const fixedItems = t.raw('fixedItems') as string[];

  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('sdkRelease')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-500 mb-4">2026-05-17</p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('addedSdks')}</h3>
        <ul className="space-y-1 text-gray-600 dark:text-slate-400 mb-4">
          {sdkList.map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('sdkNote')}</p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('addedPlatform')}</h3>
        <ul className="space-y-1 text-gray-600 dark:text-slate-400 mb-4">
          {platformFeatures.map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('addedCicd')}</h3>
        <ul className="space-y-1 text-gray-600 dark:text-slate-400 mb-4">
          {cicdItems.map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('fixed')}</h3>
        <ul className="space-y-1 text-gray-600 dark:text-slate-400">
          {fixedItems.map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('earlier')}</h2>
        <p className="text-gray-600 dark:text-slate-400">
          {t('earlierDesc')} <a href="https://github.com/servetarslan02/HookSniff/blob/main/CHANGELOG.md" className="text-brand-600 hover:text-brand-700" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
      </section>
    </article>
  );
}
