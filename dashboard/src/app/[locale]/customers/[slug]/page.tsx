import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const revalidate = 3600;
export const metadata = { title: 'Customer Stories — HookSniff' };

const storySlugs = [
  'ecommerce-platform', 'fintech-startup', 'ai-agent-fleet',
  'saas-integration', 'healthcare-saas', 'devtools-platform',
] as const;

function buildStories(t: (k: string) => string): Record<string, {
  company: string; logo: string; industry: string; tagline: string;
  website: string; size: string; events: string;
  quote: string; quoteAuthor: string; quoteRole: string;
  problem: string[]; solution: string[];
  results: { label: string; before: string; after: string }[];
  techStack: string[];
}> {
  return {
    'ecommerce-platform': {
      company: 'ShopFlow', logo: 'SF', industry: 'E-Commerce',
      tagline: t('storyShopflowTagline'), website: 'shopflow.io',
      size: `45 ${t('sizeSmall')}`, events: `50,000/${t('eventsPerDay')}`,
      quote: t('storyShopflowQuote'), quoteAuthor: 'CTO', quoteRole: 'CTO, ShopFlow',
      problem: [t('storyShopflowProblem1'), t('storyShopflowProblem2'), t('storyShopflowProblem3'), t('storyShopflowProblem4')],
      solution: [t('storyShopflowSolution1'), t('storyShopflowSolution2'), t('storyShopflowSolution3'), t('storyShopflowSolution4')],
      results: [
        { label: 'metricEngineeringTime', before: '3-6 months', after: '2 hours' },
        { label: 'metricInfraCost', before: '$2,500/mo', after: '$24/mo' },
        { label: 'metricEventLoss', before: '5%', after: '0%' },
        { label: 'metricDeliveryLatency', before: '2-5 seconds', after: '<200ms' },
      ],
      techStack: ['Node.js', 'PostgreSQL', 'Redis', 'Shopify', 'Stripe'],
    },
    'fintech-startup': {
      company: 'PayFlow', logo: 'PF', industry: 'Fintech',
      tagline: t('storyPayflowTagline'), website: 'payflow.io',
      size: `28 ${t('sizeSmall')}`, events: `15,000/${t('eventsPerDay')}`,
      quote: t('storyPayflowQuote'), quoteAuthor: t('roleHeadEng'), quoteRole: `${t('roleHeadEng')}, PayFlow`,
      problem: [t('storyPayflowProblem1'), t('storyPayflowProblem2'), t('storyPayflowProblem3'), t('storyPayflowProblem4')],
      solution: [t('storyPayflowSolution1'), t('storyPayflowSolution2'), t('storyPayflowSolution3'), t('storyPayflowSolution4')],
      results: [
        { label: 'metricEventLoss', before: '2%', after: '0%' },
        { label: 'metricFraudLatency', before: '45 seconds', after: '<200ms' },
        { label: 'metricAuditCompliance', before: 'Manual', after: 'Automated' },
        { label: 'metricReconciliation', before: '12/month', after: '0/month' },
      ],
      techStack: ['Python', 'FastAPI', 'PostgreSQL', 'Stripe', 'AWS'],
    },
    'ai-agent-fleet': {
      company: 'NeuralOps', logo: 'NO', industry: 'AI / ML',
      tagline: t('storyNeuralopsTagline'), website: 'neuralops.ai',
      size: `15 ${t('sizeSmall')}`, events: `100,000/${t('eventsPerDay')}`,
      quote: t('storyNeuralopsQuote'), quoteAuthor: t('roleMlEng'), quoteRole: `${t('roleMlEng')}, NeuralOps`,
      problem: [t('storyNeuralopsProblem1'), t('storyNeuralopsProblem2'), t('storyNeuralopsProblem3'), t('storyNeuralopsProblem4')],
      solution: [t('storyNeuralopsSolution1'), t('storyNeuralopsSolution2'), t('storyNeuralopsSolution3'), t('storyNeuralopsSolution4')],
      results: [
        { label: 'metricPollingEliminated', before: '5s intervals', after: 'Event-driven' },
        { label: 'metricAgentComm', before: '10%', after: '0%' },
        { label: 'metricComputeCost', before: '$800/mo (polling)', after: '$24/mo' },
        { label: 'metricScaleCapacity', before: '50 agents', after: '200+ agents' },
      ],
      techStack: ['Python', 'Rust', 'OpenAI', 'LangChain', 'Redis'],
    },
    'saas-integration': {
      company: 'CloudSync', logo: 'CS', industry: 'SaaS',
      tagline: t('storyCloudsyncTagline'), website: 'cloudsync.app',
      size: `3 ${t('sizeSmall')}`, events: `8,000/${t('eventsPerDay')}`,
      quote: t('storyCloudsyncQuote'), quoteAuthor: t('roleSoloFounder'), quoteRole: `${t('roleFounder')}, CloudSync`,
      problem: [t('storyCloudsyncProblem1'), t('storyCloudsyncProblem2'), t('storyCloudsyncProblem3'), t('storyCloudsyncProblem4')],
      solution: [t('storyCloudsyncSolution1'), t('storyCloudsyncSolution2'), t('storyCloudsyncSolution3'), t('storyCloudsyncSolution4')],
      results: [
        { label: 'metricMonthlyCost', before: '$490 (Svix)', after: '$0' },
        { label: 'metricIntegrationTime', before: '2-3 weeks', after: '2 hours' },
        { label: 'metricSatisfaction', before: 'No webhooks', after: 'Real-time' },
        { label: 'metricEngEffort', before: 'Full-time', after: 'Zero' },
      ],
      techStack: ['Next.js', 'TypeScript', 'Vercel', 'PlanetScale'],
    },
    'healthcare-saas': {
      company: 'MedConnect', logo: 'MC', industry: t('indHealthcare'),
      tagline: t('storyHealthcareTagline'), website: 'medconnect.eu',
      size: `32 ${t('sizeSmall')}`, events: `25,000/${t('eventsPerDay')}`,
      quote: t('storyHealthcareQuote'), quoteAuthor: 'CTO', quoteRole: 'CTO, MedConnect',
      problem: [t('storyHealthcareProblem1'), t('storyHealthcareProblem2'), t('storyHealthcareProblem3'), t('storyHealthcareProblem4')],
      solution: [t('storyHealthcareSolution1'), t('storyHealthcareSolution2'), t('storyHealthcareSolution3'), t('storyHealthcareSolution4')],
      results: [
        { label: 'metricNoShow', before: '15%', after: '3%' },
        { label: 'metricDataRegion', before: 'US', after: 'EU (Frankfurt)' },
        { label: 'metricCompliance', before: 'At risk', after: 'GDPR compliant' },
        { label: 'metricMissedNotif', before: '200/month', after: '0/month' },
      ],
      techStack: ['C#', '.NET', 'PostgreSQL', 'Azure', 'FHIR'],
    },
    'devtools-platform': {
      company: 'BuildKit', logo: 'BK', industry: t('indDevTools'),
      tagline: t('storyBuildkitTagline'), website: 'buildkit.dev',
      size: `12 ${t('sizeSmall')}`, events: `30,000/${t('eventsPerDay')}`,
      quote: t('storyBuildkitQuote'), quoteAuthor: t('roleLeadDev'), quoteRole: `${t('roleLeadDev')}, BuildKit`,
      problem: [t('storyBuildkitProblem1'), t('storyBuildkitProblem2'), t('storyBuildkitProblem3'), t('storyBuildkitProblem4')],
      solution: [t('storyBuildkitSolution1'), t('storyBuildkitSolution2'), t('storyBuildkitSolution3'), t('storyBuildkitSolution4')],
      results: [
        { label: 'metricSdks', before: '2 languages', after: '11 languages' },
        { label: 'metricIntegrationReq', before: '50/month', after: '5/month (self-serve)' },
        { label: 'metricTimeToFirst', before: '3 days', after: '15 minutes' },
        { label: 'metricSupportTickets', before: '40/month', after: '8/month' },
      ],
      techStack: ['Go', 'Rust', 'TypeScript', 'Docker', 'Kubernetes'],
    },
  };
}

export function generateStaticParams() {
  return storySlugs.map((slug) => ({ slug }));
}

export default async function CustomerStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations('customers');
  const tc = await getTranslations('customerStories');
  const { slug } = await params;
  const stories = buildStories(tc);
  const story = stories[slug];

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tc("storyNotFound")}</h1>
          <Link href="/customers" className="text-brand-600 dark:text-brand-400 hover:underline">{tc('backToList')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <Link href="/customers" className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{t("title")}</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{story.company}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-6 py-16">
        {/* Disclaimer */}
        <div className="mb-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
          ⚠️ {tc('disclaimer')}
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-2xl">{story.logo}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{story.company}</h1>
              <p className="text-gray-500 dark:text-slate-500">{story.industry} · {story.size} · {story.events}</p>
            </div>
          </div>
          <p className="text-xl text-gray-600 dark:text-slate-400 leading-relaxed">{story.tagline}</p>
        </div>

        {/* Quote */}
        <div className="mb-12 p-6 bg-brand-50 dark:bg-brand-500/10 rounded-xl border border-brand-200 dark:border-brand-500/20">
          <svg className="w-8 h-8 text-brand-300 dark:text-brand-700 mb-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
          </svg>
          <blockquote className="text-lg text-gray-800 dark:text-slate-200 leading-relaxed mb-4">{story.quote}</blockquote>
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400">— {story.quoteRole}</p>
        </div>

        {/* Problem */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tc("theProblem")}</h2>
          <ul className="space-y-3">
            {story.problem.map((p) => (
              <li key={p} className="flex items-start gap-3 text-gray-600 dark:text-slate-400">
                <span className="text-red-500 mt-1 shrink-0">•</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Solution */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tc("theSolution")}</h2>
          <ul className="space-y-3">
            {story.solution.map((s) => (
              <li key={s} className="flex items-start gap-3 text-gray-700 dark:text-slate-300">
                <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Results */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tc("results")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {story.results.map((r) => (
              <div key={r.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                <p className="text-sm text-gray-500 dark:text-slate-500 mb-2">{tc(r.label) || r.label}</p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-600">{tc("before")}</p>
                    <p className="text-sm text-red-600 dark:text-red-400 line-through">{r.before}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-500 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-600">{tc("after")}</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{r.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tc("techStack")}</h2>
          <div className="flex flex-wrap gap-2">
            {story.techStack.map((tech) => (
              <span key={tech} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-sm text-gray-700 dark:text-slate-300">{tech}</span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-2">{tc('ctaReady')}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-4">{tc('ctaJoin', { company: story.company })}</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{tc('ctaFree')}</Link>
            <Link href="/customers" className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors">{tc("moreStories")}</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
