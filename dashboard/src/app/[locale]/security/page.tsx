import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const metadata = { title: 'Security & Compliance — HookSniff' };

const features = [
  { icon: '🔒', title: 'TLS 1.3 Everywhere', desc: 'All data encrypted in transit with TLS 1.3. No HTTP, no exceptions.' },
  { icon: '🛡️', title: 'HMAC-SHA256 Signatures', desc: 'Every webhook is signed with your secret. Verify authenticity with standard HMAC-SHA256.' },
  { icon: '🔐', title: '2FA / TOTP', desc: 'Two-factor authentication via authenticator apps. Protect your account beyond passwords.' },
  { icon: '🌐', title: 'SSO / SAML', desc: 'Enterprise single sign-on. Integrate with Okta, Auth0, Google Workspace, and more.' },
  { icon: '📍', title: 'IP Whitelisting', desc: 'Restrict API access to specific IPs or CIDR ranges. Block unauthorized sources.' },
  { icon: '🛡️', title: 'SSRF Protection', desc: 'Built-in Server-Side Request Forgery protection. Block internal network access.' },
  { icon: '🔑', title: 'Argon2 Password Hashing', desc: 'Industry-leading password hashing with Argon2id. No plaintext, no weak hashes.' },
  { icon: '📋', title: 'Audit Logs', desc: 'Track every action: who did what, when. Full audit trail for compliance.' },
  { icon: '🇪🇺', title: 'EU Data Processing', desc: 'Data processed in eu-central-1 (Frankfurt). GDPR compliant by design.' },
  { icon: '🔑', title: 'API Key Rotation', desc: 'Rotate API keys without downtime. Old keys invalidated instantly.' },
  { icon: '⏱️', title: 'Rate Limiting', desc: 'Per-key rate limiting prevents abuse. Configurable per plan.' },
  { icon: '🔄', title: 'Webhook Secret Rotation', desc: 'Rotate webhook secrets without breaking existing integrations. Dual-secret support.' },
];

const compliance = [
  { name: 'GDPR', status: 'Compliant', desc: 'EU data processing, data export/deletion, DPA available' },
  { name: 'SOC 2', status: 'Ready', desc: 'Security controls in place, Type 1 audit planned' },
  { name: 'CCPA', status: 'Compliant', desc: 'California Consumer Privacy Act compliance' },
  { name: 'KVKK', status: 'Compliant', desc: 'Turkish data protection law compliance' },
  { name: 'Standard Webhooks', status: 'Compliant', desc: 'Open standard for webhook signatures and delivery' },
  { name: 'CloudEvents v1.0', status: 'Supported', desc: 'CNCF standard for event data interoperability' },
];

export default function SecurityPage() {
  const t = useTranslations('security');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("title")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full mb-4">Security & Compliance</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Enterprise-grade security,<br />startup-friendly pricing
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Security is not optional. Every webhook is signed, every connection is encrypted, and every action is logged.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((f) => (
            <div key={f.title} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Compliance */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Compliance & Standards</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compliance.map((c) => (
              <div key={c.name} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">{c.name}</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">{c.status}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Security */}
        <div className="mb-16 p-6 md:p-8 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t("architecture")}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t("dataAtRest")}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>AES-256 encryption for stored data</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{t("neonPostgres")}</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{t("upstashRedis")}</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Cloudflare R2 with server-side encryption</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t("dataInTransit")}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>TLS 1.3 for all connections</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{t("hsts")}</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{t("certPinning")}</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{t("noHttp")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Responsible Disclosure */}
        <div className="mb-16 p-6 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">🔍 Responsible Disclosure</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
            Found a security vulnerability? We appreciate responsible disclosure. Please report to <span className="font-mono text-brand-600 dark:text-brand-400">security@hooksniff.vercel.app</span> with details.
          </p>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            We commit to acknowledging reports within 24 hours and providing a fix timeline within 72 hours.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Security questions?</h2>
          <p className="text-gray-400 dark:text-slate-400 mb-6">Our team is happy to discuss your security requirements.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/contact" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Contact us →</Link>
            <a href="https://github.com/servetarslan02/HookSniff" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors">{t("viewSource")}</a>
          </div>
        </div>
      </main>
    </div>
  );
}
