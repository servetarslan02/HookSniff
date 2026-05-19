'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import { Zap } from 'lucide-react';

function GithubIcon({ size = 20, strokeWidth = 1.75, ...props }: { size?: number; strokeWidth?: number; [key: string]: unknown }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function GitHubWebhooksPageContent() {
  const t = useTranslations('providers');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t("github")} />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 mb-4">
            <span className="text-lg"><GithubIcon size={20} strokeWidth={1.75} /></span>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t("githubIntegration")}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("githubWebhooksGuide")}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Set up GitHub webhooks for push, pull request, issue, and deployment events. Automate your CI/CD and project management.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4"><Zap size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Quick Start</h2>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold shrink-0">1</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t("createEndpoint")}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">Sign up and create an endpoint for GitHub webhooks.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold shrink-0">2</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t("configureGitHub")}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">Repository → Settings → Webhooks → Add webhook. Paste your HookSniff URL and set a secret.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold shrink-0">3</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t("selectEvents")}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">Choose: push, pull_request, issues, deployment, workflow_run, or send everything.</p>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4"><ClipboardList size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Common GitHub Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">{t("event")}</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">{t("whenItFires")}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['push', 'Code pushed to a branch'],
                  ['pull_request', 'PR opened, closed, merged, or updated'],
                  ['issues', 'Issue opened, closed, labeled, or assigned'],
                  ['workflow_run', 'GitHub Actions workflow completed'],
                  ['deployment', 'Deployment created via API'],
                  ['deployment_status', 'Deployment status changed'],
                  ['release', 'Release published, edited, or deleted'],
                  ['star', 'Repository starred or unstarred'],
                  ['fork', 'Repository forked'],
                  ['issue_comment', 'Comment on issue or PR'],
                ].map(([event, desc]) => (
                  <tr key={event} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                    <td className="py-2 px-4 font-mono text-xs text-brand-600 dark:text-brand-400">{event}</td>
                    <td className="py-2 px-4 text-gray-600 dark:text-slate-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t("startReceivingGitHub")}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">Automate your CI/CD pipeline with reliable webhook delivery.</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Start for free →</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
