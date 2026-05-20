import CodeBlock from '@/components/CodeBlock';
import { AlertTriangle, Check, Key, KeyRound, Lock, Shield, ShieldCheck, X } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Security — HookSniff Docs',
  description: 'How HookSniff secures webhook deliveries with HMAC-SHA256 signatures, SSRF protection, and TLS',
};

export default async function SecurityPage() {
  const t = await getTranslations('docsSecurity');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2"><Lock size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* Signature Verification */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('signatureVerification')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('signatureDesc1')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('signatureDesc2')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('headers')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('headersDesc')}
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('headerName')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('headers')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr>
                <td className="px-4 py-3 font-mono text-sm">webhook-id</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('headerId')}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">webhook-timestamp</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('headerTimestamp')}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">webhook-signature</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('headerSignature')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('algorithm')}</h3>
        <CodeBlock
          code={`signed_content = "{webhook-id}.{webhook-timestamp}.{body}"
signature = "v1," + base64(hmac_sha256(secret, signed_content))`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">{t('verifyWithSdks')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('verifySdksDesc')}
        </p>
        <CodeBlock
          code={`// Node.js
import { Webhook } from 'hooksniff';
const wh = new Webhook('whsec_your_secret');
const payload = wh.verify(req.body, {
  'webhook-id': req.headers['webhook-id'],
  'webhook-timestamp': req.headers['webhook-timestamp'],
  'webhook-signature': req.headers['webhook-signature'],
});

# Python
from hooksniff import Webhook
wh = Webhook("whsec_your_secret")
payload = wh.verify(request.data, dict(request.headers))

// Go
wh, _ := hooksniff.NewWebhook("whsec_your_secret")
payload, err := wh.Verify(r.Body, r.Header)`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('verifyAllLangs')}
        </p>
      </section>

      {/* SSRF Protection */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><Shield size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('ssrfProtection')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('ssrfDesc')}
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('blocked')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('examples')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('privateIps')}</td>
                <td className="px-4 py-3 font-mono text-sm">10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('loopback')}</td>
                <td className="px-4 py-3 font-mono text-sm">127.0.0.1, ::1, localhost</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('metadataEndpoints')}</td>
                <td className="px-4 py-3 font-mono text-sm">169.254.169.254 (AWS/GCP/Azure metadata)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('dnsRebinding')}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('dnsRebindingDesc')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* TLS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><ShieldCheck size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('tlsEnforcement')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('tlsDesc')}
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-slate-400 space-y-2">
          <li>{t('tls1')}</li>
          <li>{t('tls2')}</li>
          <li>{t('tls3')}</li>
        </ul>
      </section>

      {/* 2FA */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><Key size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('twoFactor')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('twoFactorDesc')}
        </p>
        <CodeBlock
          code={`# Enable 2FA
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/auth/2fa/enable \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"password": "your_password"}'

# Returns QR code URL for your authenticator app`}
        />
      </section>

      {/* API Key Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><KeyRound size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('apiKeySecurity')}</h2>
        <div className="space-y-4 not-prose">
          {[
            { icon: <Check size={16} strokeWidth={1.75} className="text-emerald-500" />, title: t('akUseEnv'), desc: t('akUseEnvDesc') },
            { icon: <Check size={16} strokeWidth={1.75} className="text-emerald-500" />, title: t('akRotate'), desc: t('akRotateDesc') },
            { icon: <Check size={16} strokeWidth={1.75} className="text-emerald-500" />, title: t('akSeparate'), desc: t('akSeparateDesc') },
            { icon: <Check size={16} strokeWidth={1.75} className="text-emerald-500" />, title: t('akScope'), desc: t('akScopeDesc') },
            { icon: <X size={16} strokeWidth={1.75} className="text-red-500" />, title: t('akNoCommit'), desc: t('akNoCommitDesc') },
            { icon: <X size={16} strokeWidth={1.75} className="text-red-500" />, title: t('akNoExpose'), desc: t('akNoExposeDesc') },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
              <span className="text-xl">{icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Incident Response */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><AlertTriangle size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('incidentResponse')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('incidentDesc')}
        </p>
        <ol className="list-decimal list-inside text-gray-600 dark:text-slate-400 space-y-2">
          <li><strong>{t('incident1')}</strong> — {t('incident1Desc')}</li>
          <li><strong>{t('incident2')}</strong> — {t('incident2Desc')}</li>
          <li><strong>{t('incident3')}</strong> — {t('incident3Desc')}</li>
          <li><strong>{t('incident4')}</strong> — <a href="mailto:security@hooksniff.vercel.app" className="text-brand-600 hover:underline">{t('incident4Desc')}</a></li>
        </ol>
      </section>
    </article>
  );
}
