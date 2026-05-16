'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import { useTranslations } from 'next-intl';
import Footer from '@/components/Footer';

const faqKeys = [
  { cat: 'catGeneral', q: 'q1', a: 'a1' },
  { cat: 'catGeneral', q: 'q2', a: 'a2' },
  { cat: 'catGeneral', q: 'q3', a: 'a3' },
  { cat: 'catGettingStarted', q: 'q4', a: 'a4' },
  { cat: 'catGettingStarted', q: 'q5', a: 'a5' },
  { cat: 'catBilling', q: 'q6', a: 'a6' },
  { cat: 'catBilling', q: 'q7', a: 'a7' },
  { cat: 'catBilling', q: 'q8', a: 'a8' },
  { cat: 'catTechnical', q: 'q9', a: 'a9' },
  { cat: 'catTechnical', q: 'q10', a: 'a10' },
  { cat: 'catTechnical', q: 'q11', a: 'a11' },
  { cat: 'catTechnical', q: 'q12', a: 'a12' },
  { cat: 'catSecurity', q: 'q13', a: 'a13' },
  { cat: 'catSecurity', q: 'q14', a: 'a14' },
  { cat: 'catSecurity', q: 'q15', a: 'a15' },
];

function FAQAccordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition"
      >
        <span className="font-medium text-gray-900 dark:text-white pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 dark:text-slate-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-4 text-gray-600 dark:text-slate-400 leading-relaxed border-t border-gray-100 dark:border-slate-700 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

export function FAQPageContent() {
  const t = useTranslations();
  const categories = ['catGeneral', 'catGettingStarted', 'catBilling', 'catTechnical', 'catSecurity'];
  const [activeCategory, setActiveCategory] = useState('catGeneral');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t("faqTitle")} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('faqTitle')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-12">{t('faqSubtitle')}</p>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-brand-600 dark:bg-brand-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600'
              }`}
            >
              {t(cat)}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqKeys.filter(f => f.cat === activeCategory).map((faq) => (
            <FAQAccordion key={faq.q} question={t(faq.q)} answer={t(faq.a)} />
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 text-center bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('stillHaveQuestions')}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">{t('cantFindAnswer')}</p>
          <Link href="/contact" className="inline-flex bg-brand-600 dark:bg-brand-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition">
            {t('contactSupport')}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
