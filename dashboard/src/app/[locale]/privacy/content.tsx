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

export function PrivacyPageContent() {
  const t = useTranslations('privacy');
  const s21 = t.raw('s21Items') as string[];
  const s22 = t.raw('s22Items') as string[];
  const s23 = t.raw('s23Items') as string[];
  const s3 = t.raw('s3Items') as string[];
  const s4 = t.raw('s4Items') as string[];
  const s5 = t.raw('s5Items') as string[];
  const s6 = t.raw('s6Items') as string[];
  const s8 = t.raw('s8Items') as string[];

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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-6">{t('s21Title')}</h3>
            <ListItems items={s21} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-6">{t('s22Title')}</h3>
            <ListItems items={s22} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-6">{t('s23Title')}</h3>
            <ListItems items={s23} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s3Title')}</h2>
            <p className="mb-2">{t('s3Intro')}</p>
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
            <p className="mb-2">{t('s6Intro')}</p>
            <ListItems items={s6} />
            <p className="mt-4">{t('s6Disclaimer')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s7Title')}</h2>
            <div className="bg-gray-100 dark:bg-slate-800 rounded-xl p-4 my-4">
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-2 font-semibold text-gray-900 dark:text-white">{t('s7DataType')}</th>
                    <th className="text-left py-2 font-semibold text-gray-900 dark:text-white">{t('s7RetentionPeriod')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <td className="py-2">{t('s7Account')}</td>
                    <td className="py-2">{t('s7AccountRetention')}</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <td className="py-2">{t('s7Webhook')}</td>
                    <td className="py-2">{t('s7WebhookRetention')}</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <td className="py-2">{t('s7Api')}</td>
                    <td className="py-2">{t('s7ApiRetention')}</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <td className="py-2">{t('s7Payment')}</td>
                    <td className="py-2">{t('s7PaymentRetention')}</td>
                  </tr>
                  <tr>
                    <td className="py-2">{t('s7Analytics')}</td>
                    <td className="py-2">{t('s7AnalyticsRetention')}</td>
                  </tr>
                </tbody>
              </table></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('s7Note')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s8Title')}</h2>
            <p className="mb-2">{t('s8Intro')}</p>
            <ListItems items={s8} />
            <p className="mt-4">{t('s8How')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s9Title')}</h2>
            <p>{t('s9Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s10Title')}</h2>
            <p>{t('s10Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s11Title')}</h2>
            <p>{t('s11Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s12Title')}</h2>
            <p>{t('s12Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('s13Title')}</h2>
            <p>{t('s13Text')} <a href="/contact" className="text-brand-600 dark:text-brand-400 hover:underline">{t('contactForm')}</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
