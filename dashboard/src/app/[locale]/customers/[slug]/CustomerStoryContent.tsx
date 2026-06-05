'use client';

import { useTranslations } from 'next-intl';
import { PrefetchLink as Link } from '@/components/PrefetchLink';
import PublicNavbar from '@/components/PublicNavbar';
import { useParams } from 'next/navigation';

const stories: Record<string, { company: string; logo: string; industry: string; quote: string; author: string; metric: string; metricLabel: string; desc: string }> = {
  'ecommerce-platform': { company: 'ShopFlow', logo: 'SF', industry: 'E-commerce', quote: 'HookSniff reduced our integration time from 3 months to 2 weeks.', author: 'CTO, ShopFlow', metric: '3 months saved', metricLabel: 'Engineering time', desc: 'ShopFlow uses HookSniff to deliver order updates to 500+ merchant endpoints.' },
  'fintech-startup': { company: 'PayFlow', logo: 'PF', industry: 'FinTech', quote: 'Zero lost events since switching to HookSniff.', author: 'Head of Engineering, PayFlow', metric: '0', metricLabel: 'Events lost', desc: 'PayFlow processes payment webhooks with guaranteed FIFO delivery.' },
  'ai-agent-fleet': { company: 'AgentOps', logo: 'AO', industry: 'AI & Agents', quote: 'Our AI agents need real-time event delivery. HookSniff delivers.', author: 'Founder, AgentOps', metric: '50ms', metricLabel: 'Avg latency', desc: 'AgentOps routes events to 1000+ AI agents using HookSniff smart routing.' },
};

export function CustomerStoryContent() {
  const params = useParams<{ slug: string }>();
  const t = useTranslations('customers');
  const slug = params?.slug;

  const story = slug ? stories[slug] : null;

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <PublicNavbar />
        <main className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-gray-600 dark:text-slate-400">{t('storyNotFound') || 'Story not found.'}</p>
          <Link href="/customers" className="text-brand-600 dark:text-brand-400 hover:underline mt-4 inline-block">← {t('backToList')}</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={story.company} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold mb-6">
            {story.logo}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{story.company}</h1>
          <p className="text-lg text-gray-500 dark:text-slate-500">{story.industry}</p>
        </div>

        <blockquote className="text-xl text-gray-700 dark:text-slate-300 italic mb-8 border-l-4 border-brand-500 pl-6">
          &ldquo;{story.quote}&rdquo;
          <footer className="text-sm text-gray-500 dark:text-slate-500 mt-2 not-italic">— {story.author}</footer>
        </blockquote>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">{story.metric}</p>
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">{story.metricLabel}</p>
          </div>
        </div>

        <p className="text-gray-700 dark:text-slate-300 leading-relaxed">{story.desc}</p>

        <div className="mt-12 text-center">
          <Link href="/customers" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">← {t('backToList')}</Link>
        </div>
      </main>
    </div>
  );
}
