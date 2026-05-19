'use client';

import { useTranslations } from 'next-intl';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';

function ListItems({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-6 space-y-2">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

export function TermsPageContent() {
  const t = useTranslations('terms');
  const s3 = t.raw('s3Items') as string[];
  const s4 = t.raw('s4Items') as string[];
  const s5 = t.raw('s5Items') as string[];
  const s6 = t.raw('s6Items') as string[];
  const s7 = t.raw('s7Items') as string[];
  const s8 = t.raw('s8Items') as string[];
  const s9 = t.raw('s9Items') as string[];
  const s10 = t.raw('s10Items') as string[];
  const s11 = t.raw('s11Items') as string[];
  const s12 = t.raw('s12Items') as string[];
  const s13 = t.raw('s13Items') as string[];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t('nav')} />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-12">{t('lastUpdated')}</p>

        <div className="prose dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s1Title')}</h2>
            <p>{t('s1Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s2Title')}</h2>
            <p>{t('s2Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s3Title')}</h2>
            <ListItems items={s3} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s4Title')}</h2>
            <ListItems items={s4} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s5Title')}</h2>
            <p className="mb-2">{t('s5Intro')}</p>
            <ListItems items={s5} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s6Title')}</h2>
            <ListItems items={s6} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s7Title')}</h2>
            <ListItems items={s7} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s8Title')}</h2>
            <ListItems items={s8} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s9Title')}</h2>
            <ListItems items={s9} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s10Title')}</h2>
            <ListItems items={s10} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s11Title')}</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 my-4">
              <p className="font-semibold text-yellow-800 dark:text-yellow-300">{t('s11MaxExtent')}</p>
            </div>
            <ListItems items={s11} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s12Title')}</h2>
            <p className="mb-2">{t('s12Intro')}</p>
            <ListItems items={s12} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s13Title')}</h2>
            <ListItems items={s13} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s14Title')}</h2>
            <p>{t('s14Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s15Title')}</h2>
            <p>{t('s15Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s16Title')}</h2>
            <p>{t('s16Text')} <a href="/contact" className="text-brand-600 dark:text-brand-400 hover:underline">{t('contactForm')}</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
