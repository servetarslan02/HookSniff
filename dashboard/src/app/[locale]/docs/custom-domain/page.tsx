import type { Metadata } from 'next';
import CodeBlock from '@/components/CodeBlock';

export const metadata: Metadata = {
  title: 'Custom Domain — HookSniff',
  description: 'Use your own domain for the webhook portal. White-label your customers experience.',
};

export default function CustomDomainDocsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">🌐 Custom Domain</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Use your own domain for the webhook portal. White-label your customers' experience.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Custom domains let you use your own domain (e.g., <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">webhooks.yourcompany.com</code>) instead of the default HookSniff URL. This gives your customers a branded, professional experience.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>How it works:</strong> You point your domain to HookSniff via DNS. We verify ownership and automatically provision an SSL certificate. Your customers access the portal through your domain.
        </p>
      </section>

      {/* Step by Step */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Step-by-Step Guide</h2>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">1</span>
              Add your domain
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              Go to <strong>Dashboard → Custom Domain</strong> and enter the domain you want to use.
            </p>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1 list-disc list-inside mb-3">
              <li>Use a subdomain like <code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded-sm text-xs">webhooks.yourcompany.com</code></li>
              <li>You can paste the full URL (<code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded-sm text-xs">https://webhooks.yourcompany.com</code>) — we'll strip the protocol automatically</li>
              <li>Only use domains you own and control</li>
            </ul>
            <p className="text-sm text-gray-500 dark:text-slate-500 italic">After adding, you'll see two DNS records you need to configure.</p>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">2</span>
              Add DNS records
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              Log in to your domain provider and add the two records shown in the dashboard:
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Value</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    <tr>
                      <td className="px-4 py-3"><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-xs">CNAME</code></td>
                      <td className="px-4 py-3 font-mono text-xs">webhooks.yourcompany.com</td>
                      <td className="px-4 py-3 font-mono text-xs">cname.vercel-dns.com</td>
                      <td className="px-4 py-3 text-xs text-gray-500">Points your domain to HookSniff</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-xs">TXT</code></td>
                      <td className="px-4 py-3 font-mono text-xs">_hooksniff.webhooks.yourcompany.com</td>
                      <td className="px-4 py-3 font-mono text-xs">hooksniff-verify=...</td>
                      <td className="px-4 py-3 text-xs text-gray-500">Proves you own the domain</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2"><strong>Where to add these:</strong></p>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1 list-disc list-inside">
              <li><strong>Cloudflare:</strong> DNS → Records → Add record</li>
              <li><strong>GoDaddy:</strong> DNS Management → Add</li>
              <li><strong>Namecheap:</strong> Advanced DNS → Add New Record</li>
              <li><strong>AWS Route 53:</strong> Hosted zones → Create record</li>
              <li><strong>Google Domains:</strong> DNS → Custom resource records</li>
            </ul>
            <div className="mt-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>⏱ Important:</strong> DNS changes take 5–30 minutes to propagate globally. Don't worry if verification fails immediately — just wait and try again.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">3</span>
              Verify & go live
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              After adding the DNS records and waiting a few minutes, click <strong>"Verify Domain"</strong> in the dashboard.
            </p>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1 list-disc list-inside mb-3">
              <li><strong>✅ Success:</strong> Your domain is verified and SSL certificate is automatically provisioned</li>
              <li><strong>❌ Failed:</strong> DNS records not found yet — wait a few more minutes and try again</li>
            </ul>
            <p className="text-sm text-gray-500 dark:text-slate-500 italic">
              Once verified, your customers can access the webhook portal through your custom domain with a valid HTTPS certificate.
            </p>
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Common Issues</h2>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">"DNS records not found"</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              This is normal if you just added the records. DNS propagation takes 5–30 minutes. Wait and try again. If it still fails after 30 minutes, double-check that the record names and values match exactly what's shown in the dashboard.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">SSL certificate not working</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              SSL provisioning happens automatically after verification and can take up to 15 minutes. If HTTPS still doesn't work after that, try removing and re-adding the domain.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">"Cannot use this domain"</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Some domains are reserved (e.g., hooksniff.com, localhost). Use a domain you own.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">"Domain already registered"</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              This domain is already in use by another account. Each domain can only be registered once.
            </p>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API Reference</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">You can also manage custom domains via the API:</p>

        <CodeBlock
          code={`# List domains
GET /v1/custom-domains

# Add a domain
POST /v1/custom-domains
{ "domain": "webhooks.yourcompany.com" }

# Verify a domain
POST /v1/custom-domains/:id/verify

# Delete a domain
DELETE /v1/custom-domains/:id`}
        />
      </section>

      {/* Plans */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Availability</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Custom Domains</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">SSL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                <tr><td className="px-4 py-3">Developer</td><td className="px-4 py-3">❌</td><td className="px-4 py-3">—</td></tr>
                <tr><td className="px-4 py-3">Startup</td><td className="px-4 py-3">✅</td><td className="px-4 py-3">Auto</td></tr>
                <tr><td className="px-4 py-3">Pro</td><td className="px-4 py-3">✅</td><td className="px-4 py-3">Auto</td></tr>
                <tr><td className="px-4 py-3">Enterprise</td><td className="px-4 py-3">✅ Unlimited</td><td className="px-4 py-3">Auto</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </article>
  );
}
