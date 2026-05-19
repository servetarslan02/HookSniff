import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Security — HookSniff Docs',
  description: 'How HookSniff secures webhook deliveries with HMAC-SHA256 signatures, SSRF protection, and TLS',
};

export default function SecurityPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">🔒 Security</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        HookSniff uses industry-standard security practices to protect webhook deliveries. Every webhook is signed, encrypted in transit, and verified before processing.
      </p>

      {/* Signature Verification */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">HMAC-SHA256 Signature Verification</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Every webhook includes a cryptographic signature computed with HMAC-SHA256. This proves the webhook came from HookSniff and wasn't tampered with.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff follows the <strong>Standard Webhooks</strong> specification — the same standard used by Svix, Clerk, and other webhook providers.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Headers</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Each delivery includes three headers:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Header</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr>
                <td className="px-4 py-3 font-mono text-sm">webhook-id</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Unique message ID (e.g., <code>msg_abc123</code>)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">webhook-timestamp</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Unix timestamp. Reject if older than 5 minutes.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">webhook-signature</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Space-separated <code>v1,</code> signatures</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Algorithm</h3>
        <CodeBlock
          code={`signed_content = "{webhook-id}.{webhook-timestamp}.{body}"
signature = "v1," + base64(hmac_sha256(secret, signed_content))`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Verify with SDKs</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          All HookSniff SDKs handle verification automatically:
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
          See <a href="/docs/guides/webhook-verification" className="text-brand-600 hover:underline">Webhook Verification Guide</a> for all 11 languages.
        </p>
      </section>

      {/* SSRF Protection */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🛡️ SSRF Protection</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff blocks webhook delivery to private/internal IP addresses to prevent Server-Side Request Forgery (SSRF) attacks.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Blocked</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Examples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Private IPs</td>
                <td className="px-4 py-3 font-mono text-sm">10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Loopback</td>
                <td className="px-4 py-3 font-mono text-sm">127.0.0.1, ::1, localhost</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Metadata endpoints</td>
                <td className="px-4 py-3 font-mono text-sm">169.254.169.254 (AWS/GCP/Azure metadata)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">DNS rebinding</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Resolved at delivery time, not registration time</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* TLS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔐 TLS Enforcement</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          All webhook deliveries use HTTPS. HookSniff <strong>refuses to deliver</strong> to HTTP endpoints (except localhost for development).
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-slate-400 space-y-2">
          <li>TLS 1.2+ required</li>
          <li>Certificate validation enforced</li>
          <li>HTTP endpoints rejected with <code>endpoint_url_not_https</code> error</li>
        </ul>
      </section>

      {/* 2FA */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔑 Two-Factor Authentication (2FA)</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Protect your HookSniff account with TOTP-based 2FA:
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🗝️ API Key Security</h2>
        <div className="space-y-4 not-prose">
          {[
            { icon: '✅', title: 'Use environment variables', desc: 'Never hardcode API keys. Use env vars or secrets managers.' },
            { icon: '✅', title: 'Rotate keys periodically', desc: 'Rotate API keys from Settings → API Keys → Rotate.' },
            { icon: '✅', title: 'Use separate keys per environment', desc: 'Different keys for development, staging, and production.' },
            { icon: '✅', title: 'Scope keys to minimum permissions', desc: 'Create read-only keys for monitoring, write keys for sending.' },
            { icon: '❌', title: 'Never commit keys to version control', desc: 'Add .env to .gitignore. Use secrets managers in CI/CD.' },
            { icon: '❌', title: 'Never expose keys in client-side code', desc: 'API keys belong on your server, not in browser JavaScript.' },
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🚨 Security Incident Response</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          If you suspect a security issue:
        </p>
        <ol className="list-decimal list-inside text-gray-600 dark:text-slate-400 space-y-2">
          <li><strong>Rotate your API key immediately</strong> — Settings → API Keys → Rotate</li>
          <li><strong>Rotate endpoint signing secrets</strong> — Endpoints → Select → Rotate Secret</li>
          <li><strong>Check audit log</strong> — Settings → Audit Log for suspicious activity</li>
          <li><strong>Contact support</strong> — <a href="mailto:security@hooksniff.vercel.app" className="text-brand-600 hover:underline">security@hooksniff.vercel.app</a></li>
        </ol>
      </section>
    </article>
  );
}
