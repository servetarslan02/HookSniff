import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata = { title: 'Customer Stories — HookSniff' };

/* ─── Customer Stories Database ─── */

const stories: Record<string, {
  company: string;
  logo: string;
  industry: string;
  tagline: string;
  website: string;
  size: string;
  events: string;
  quote: string;
  quoteAuthor: string;
  quoteRole: string;
  problem: string[];
  solution: string[];
  results: { label: string; before: string; after: string }[];
  techStack: string[];
}> = {
  'ecommerce-platform': {
    company: 'ShopFlow',
    logo: 'SF',
    industry: 'E-Commerce',
    tagline: 'How ShopFlow scaled webhook delivery to 50K events/day and cut infrastructure costs by 60%',
    website: 'shopflow.io',
    size: '45 employees',
    events: '50,000/day',
    quote: 'We switched from building our own webhooks to HookSniff. Saved us 3 months of engineering time and $2K/month in infrastructure costs.',
    quoteAuthor: 'CTO',
    quoteRole: 'CTO, ShopFlow',
    problem: [
      'Building webhook infrastructure from scratch would take 3-6 months',
      'Custom retry logic was unreliable — 5% of events were lost during traffic spikes',
      'No visibility into delivery success rates made debugging impossible',
      'Multiple systems (ERP, CRM, shipping) needed the same events',
    ],
    solution: [
      'Integrated HookSniff SDK in 2 hours — Node.js SDK with TypeScript support',
      'FIFO ordered delivery ensures events arrive in sequence for order processing',
      'Multi-endpoint delivery sends one event to ERP, CRM, and shipping simultaneously',
      'Real-time dashboard shows delivery success rates and error details',
    ],
    results: [
      { label: 'metricEngineeringTime', before: '3-6 months', after: '2 hours' },
      { label: 'metricInfraCost', before: '$2,500/mo', after: '$24/mo' },
      { label: 'metricEventLoss', before: '5%', after: '0%' },
      { label: 'metricDeliveryLatency', before: '2-5 seconds', after: '<200ms' },
    ],
    techStack: ['Node.js', 'PostgreSQL', 'Redis', 'Shopify', 'Stripe'],
  },
  'fintech-startup': {
    company: 'PayFlow',
    logo: 'PF',
    industry: 'Fintech',
    tagline: 'How PayFlow achieved zero event loss for financial compliance with HookSniff\'s FIFO delivery',
    website: 'payflow.io',
    size: '28 employees',
    events: '15,000/day',
    quote: 'We needed zero event loss for compliance. HookSniff delivers. The HMAC signatures and delivery logs give us the audit trail we need.',
    quoteAuthor: 'Head of Engineering',
    quoteRole: 'Head of Engineering, PayFlow',
    problem: [
      'Financial regulations require zero event loss — every transaction must be accounted for',
      'Transaction webhooks must arrive in order for accurate reconciliation',
      'Fraud alerts must be delivered in real-time, not minutes later',
      'Previous webhook service had 2% event loss during peak hours',
    ],
    solution: [
      'HookSniff\'s FIFO delivery guarantees ordered transaction events',
      'HMAC-SHA256 signatures prevent spoofed or tampered webhook events',
      'Sub-200ms latency enables real-time fraud detection',
      'Complete delivery logs provide audit trail for compliance reviews',
    ],
    results: [
      { label: 'Event loss', before: '2%', after: '0%' },
      { label: 'metricFraudLatency', before: '45 seconds', after: '<200ms' },
      { label: 'metricAuditCompliance', before: 'Manual', after: 'Automated' },
      { label: 'metricReconciliation', before: '12/month', after: '0/month' },
    ],
    techStack: ['Python', 'FastAPI', 'PostgreSQL', 'Stripe', 'AWS'],
  },
  'ai-agent-fleet': {
    company: 'NeuralOps',
    logo: 'NO',
    industry: 'AI / ML',
    tagline: 'How NeuralOps uses HookSniff to orchestrate 200+ AI agents with real-time event delivery',
    website: 'neuralops.ai',
    size: '15 employees',
    events: '100,000/day',
    quote: 'HookSniff is the nervous system for our AI agent fleet. Events trigger actions in real-time. The schema registry ensures payload consistency across 200+ agents.',
    quoteAuthor: 'ML Engineer',
    quoteRole: 'ML Engineer, NeuralOps',
    problem: [
      'AI agents were polling APIs every 5 seconds — wasting compute and money',
      'No standard event format meant each agent expected different payloads',
      'Agent-to-agent communication was unreliable — 10% of messages lost',
      'Scaling from 50 to 200+ agents required a complete architecture rethink',
    ],
    solution: [
      'Webhooks replace polling — agents react instantly to events',
      'Schema registry ensures all 200+ agents receive consistent payloads',
      'CloudEvents standard enables cross-system interoperability',
      'HookSniff scales automatically with agent fleet growth',
    ],
    results: [
      { label: 'metricPollingEliminated', before: '5s intervals', after: 'Event-driven' },
      { label: 'metricAgentComm', before: '10%', after: '0%' },
      { label: 'metricComputeCost', before: '$800/mo (polling)', after: '$24/mo' },
      { label: 'metricScaleCapacity', before: '50 agents', after: '200+ agents' },
    ],
    techStack: ['Python', 'Rust', 'OpenAI', 'LangChain', 'Redis'],
  },
  'saas-integration': {
    company: 'CloudSync',
    logo: 'CS',
    industry: 'SaaS',
    tagline: 'How CloudSync launched their webhook integration on HookSniff\'s free tier and scaled to Pro',
    website: 'cloudsync.app',
    size: '3 employees',
    events: '8,000/month',
    quote: 'Free tier that actually works for startups. We process 8K webhooks/month without paying a cent. Svix wanted $490/month for the same thing.',
    quoteAuthor: 'Solo Founder',
    quoteRole: 'Founder, CloudSync',
    problem: [
      'Customers were asking for webhook integrations but we couldn\'t afford Svix ($490/mo)',
      'Building our own webhook system would take weeks we didn\'t have',
      'We needed a solution that could grow with us — free now, paid later',
      'No engineering team to maintain complex webhook infrastructure',
    ],
    solution: [
      'HookSniff free tier handles our 8K events/month with zero cost',
      '5-minute integration with the Node.js SDK',
      'Dashboard gives us visibility into delivery success without building our own',
      'Upgrade path to Pro ($24/mo) when we need more volume',
    ],
    results: [
      { label: 'metricMonthlyCost', before: '$490 (Svix)', after: '$0' },
      { label: 'metricIntegrationTime', before: '2-3 weeks', after: '2 hours' },
      { label: 'metricSatisfaction', before: 'No webhooks', after: 'Real-time' },
      { label: 'metricEngEffort', before: 'Full-time', after: 'Zero' },
    ],
    techStack: ['Next.js', 'TypeScript', 'Vercel', 'PlanetScale'],
  },
  'healthcare-saas': {
    company: 'MedConnect',
    logo: 'MC',
    industry: 'Healthcare',
    tagline: 'How MedConnect achieved GDPR compliance and zero event loss for healthcare notifications',
    website: 'medconnect.eu',
    size: '32 employees',
    events: '25,000/day',
    quote: 'GDPR compliance and EU data processing were non-negotiable for us. HookSniff checked every box. The delivery logs are our audit trail.',
    quoteAuthor: 'CTO',
    quoteRole: 'CTO, MedConnect',
    problem: [
      'Healthcare regulations require data to stay in EU (GDPR, KVKK)',
      'Missed appointment notifications caused 15% no-show rate',
      'Lab results must be delivered in real-time for patient safety',
      'Previous provider processed data in US — compliance risk',
    ],
    solution: [
      'HookSniff processes all data in eu-central-1 (Frankfurt)',
      'Webhook signatures prevent tampered medical notifications',
      'Automatic retries ensure zero missed appointment reminders',
      'Complete delivery logs serve as compliance audit trail',
    ],
    results: [
      { label: 'metricNoShow', before: '15%', after: '3%' },
      { label: 'metricDataRegion', before: 'US', after: 'EU (Frankfurt)' },
      { label: 'metricCompliance', before: 'At risk', after: 'GDPR compliant' },
      { label: 'metricMissedNotif', before: '200/month', after: '0/month' },
    ],
    techStack: ['C#', '.NET', 'PostgreSQL', 'Azure', 'FHIR'],
  },
  'devtools-platform': {
    company: 'BuildKit',
    logo: 'BK',
    industry: 'Developer Tools',
    tagline: 'How BuildKit used HookSniff\'s 11 SDKs to offer webhook integrations in every language',
    website: 'buildkit.dev',
    size: '12 employees',
    events: '30,000/day',
    quote: 'The webhook playground and 11 SDKs made integration a breeze. Our developers love it. We didn\'t have to build SDKs ourselves.',
    quoteAuthor: 'Lead Developer',
    quoteRole: 'Lead Developer, BuildKit',
    problem: [
      'Our users wanted webhook support in 10+ programming languages',
      'Building and maintaining SDKs for each language would take months',
      'Developers needed a way to test webhooks before going live',
      'No visibility into which webhooks were failing for which users',
    ],
    solution: [
      'HookSniff\'s 11 SDKs cover every major language out of the box',
      'Webhook playground lets users test payloads before going live',
      'Per-user delivery logs help debug integration issues',
      'Embeddable portal gives users self-service webhook management',
    ],
    results: [
      { label: 'SDK coverage', before: '2 languages', after: '11 languages' },
      { label: 'metricIntegrationReq', before: '50/month', after: '5/month (self-serve)' },
      { label: 'metricTimeToFirst', before: '3 days', after: '15 minutes' },
      { label: 'metricSupportTickets', before: '40/month', after: '8/month' },
    ],
    techStack: ['Go', 'Rust', 'TypeScript', 'Docker', 'Kubernetes'],
  },
};

export function generateStaticParams() {
  return Object.keys(stories).map((slug) => ({ slug }));
}

export default async function CustomerStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations('customers');
  const { slug } = await params;
  const story = stories[slug];

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("storyNotFound")}</h1>
          <Link href="/customers" className="text-brand-600 dark:text-brand-400 hover:underline">{t('backToList')}</Link>
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
        {/* HS-067: Disclaimer */}
        <div className="mb-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
          ⚠️ This is an illustrative usage scenario, not a real customer testimonial.
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-2xl">{story.logo}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{story.company}</h1>
              <p className="text-gray-500 dark:text-slate-500">{story.industry} · {story.size} · {story.events} events</p>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("theProblem")}</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("theSolution")}</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("results")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {story.results.map((r) => (
              <div key={r.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                <p className="text-sm text-gray-500 dark:text-slate-500 mb-2">{t(r.label)}</p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-600">{t("before")}</p>
                    <p className="text-sm text-red-600 dark:text-red-400 line-through">{r.before}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-500 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-600">{t("after")}</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{r.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("techStack")}</h2>
          <div className="flex flex-wrap gap-2">
            {story.techStack.map((t) => (
              <span key={t} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-sm text-gray-700 dark:text-slate-300">{t}</span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-2">Ready to get started?</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-4">Join {story.company} and thousands of developers who trust HookSniff.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Start for free →</Link>
            <Link href="/customers" className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors">{t("moreStories")}</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
