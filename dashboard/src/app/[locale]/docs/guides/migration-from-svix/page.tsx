import CodeBlock from '@/components/CodeBlock';
import { BarChart3, DollarSign, Package, Plug, Radio, RefreshCw, Shuffle } from '@/components/icons';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
 title: 'Migration from Svix — HookSniff Docs',
 description: 'Migrate from Svix to HookSniff: SDK changes, API differences, and step-by-step guide',
};

export default function MigrationFromSvixPage() {
 return (
  <article className="prose prose-gray max-w-none">
   <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2"><RefreshCw size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Migration from Svix</h1>
   <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
    Migrating from Svix to HookSniff is straightforward. The APIs are similar — HookSniff was designed as a Svix-compatible alternative with more features and a generous free tier.
   </p>

   {/* Why Migrate */}
   <section className="mb-10">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why Migrate?</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
     {[
      { icon: <DollarSign size={16} strokeWidth={1.75} />, title: 'Generous Free Tier', desc: '10,000 webhooks/month free. No credit card required.' },
      { icon: <Radio size={16} strokeWidth={1.75} />, title: 'More Delivery Methods', desc: 'HTTP, WebSocket, Email, and more. Svix is HTTP-only.' },
      { icon: <Shuffle size={16} strokeWidth={1.75} />, title: 'Smart Routing', desc: 'Round-robin, latency-based, failover routing built-in.' },
      { icon: <BarChart3 size={16} strokeWidth={1.75} />, title: 'Real-time Streaming', desc: 'SSE streaming for live delivery monitoring.' },
      { icon: <Plug size={16} strokeWidth={1.75} />, title: '30+ API Resources', desc: 'Billing, analytics, alerts, SSO, connectors, and more.' },
      { icon: <Package size={16} strokeWidth={1.75} />, title: '11 SDKs', desc: 'Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift.' },
     ].map(({ icon, title, desc }) => (
      <div key={title} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
       <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
       </div>
       <p className="text-sm text-gray-500 dark:text-slate-400">{desc}</p>
      </div>
     ))}
    </div>
   </section>

   {/* SDK Changes */}
   <section className="mb-10">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">SDK Changes</h2>
    <p className="text-gray-600 dark:text-slate-400 mb-4">
     If you're using the Svix SDK, the migration is mostly a package rename. The API structure is similar:
    </p>

    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Node.js</h3>
    <CodeBlock
     code={`// Before (Svix)
import { Svix } from 'svix';
const svix = new Svix({ token: 'sk_live_xxx' });
const endpoints = await svix.endpoint.list('app_id');

// After (HookSniff)
import { HookSniff } from 'hooksniff';
const hs = new HookSniff({ apiKey: 'hr_live_xxx' });
const endpoints = await hs.endpoint.list();
// Note: No app_id needed — HookSniff uses JWT authentication`}
    />

    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Python</h3>
    <CodeBlock
     code={`# Before (Svix)
from svix.api import Svix
svix = Svix(token="sk_live_xxx")
endpoints = svix.endpoint.list("app_id")

# After (HookSniff)
from hooksniff import HookSniff
hs = HookSniff(api_key="hr_live_xxx")
endpoints = hs.endpoint.list()
# Note: No app_id needed`}
    />

    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Go</h3>
    <CodeBlock
     code={`// Before (Svix)
import "github.com/svix/svix-webhooks/go"
client := svix.NewClient("sk_live_xxx")
endpoints, _ := client.Endpoint.List(ctx, "app_id", nil)

// After (HookSniff)
import hooksniff "github.com/servetarslan02/hooksniff-go"
hs := hooksniff.NewClient("hr_live_xxx")
endpoints, _ := hs.Endpoint.List(ctx, nil)
// Note: No app_id needed`}
    />
   </section>

   {/* API Differences */}
   <section className="mb-10">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API Differences</h2>
    <div className="overflow-x-auto">
     <table className="w-full text-sm">
      <thead className="bg-gray-50 dark:bg-slate-800">
       <tr>
        <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Feature</th>
        <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Svix</th>
        <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">HookSniff</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
       <tr>
        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Authentication</td>
        <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Bearer token per app</td>
        <td className="px-4 py-3 text-gray-600 dark:text-slate-400">JWT + API key (user-level)</td>
       </tr>
       <tr>
        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">App concept</td>
        <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Multi-app (app_id required)</td>
        <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Single account (no app_id)</td>
       </tr>
       <tr>
        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Endpoint URL</td>
        <td className="px-4 py-3 font-mono text-sm">/api/v1/app/{'{app_id}'}/endpoint/</td>
        <td className="px-4 py-3 font-mono text-sm">/v1/endpoints/</td>
       </tr>
       <tr>
        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Message URL</td>
        <td className="px-4 py-3 font-mono text-sm">/api/v1/app/{'{app_id}'}/msg/</td>
        <td className="px-4 py-3 font-mono text-sm">/v1/webhooks/</td>
       </tr>
       <tr>
        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Signature header</td>
        <td className="px-4 py-3 font-mono text-sm">svix-id, svix-timestamp, svix-signature</td>
        <td className="px-4 py-3 font-mono text-sm">webhook-id, webhook-timestamp, webhook-signature</td>
       </tr>
       <tr>
        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Free tier</td>
        <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Limited (500/day)</td>
        <td className="px-4 py-3 text-gray-600 dark:text-slate-400">10,000/month</td>
       </tr>
       <tr>
        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">SDK languages</td>
        <td className="px-4 py-3 text-gray-600 dark:text-slate-400">6</td>
        <td className="px-4 py-3 text-gray-600 dark:text-slate-400">11</td>
       </tr>
      </tbody>
     </table>
    </div>
   </section>

   {/* Signature Verification */}
   <section className="mb-10">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Signature Verification Changes</h2>
    <p className="text-gray-600 dark:text-slate-400 mb-4">
     Both Svix and HookSniff use the <strong>Standard Webhooks</strong> spec. The only difference is the header names:
    </p>
    <CodeBlock
     code={`// Svix headers
svix-id → webhook-id
svix-timestamp → webhook-timestamp
svix-signature → webhook-signature

// The algorithm is identical:
signed_content = "{webhook-id}.{webhook-timestamp}.{body}"
signature = "v1," + base64(hmac_sha256(secret, signed_content))

// Your existing verification code works with HookSniff!
// Just update the header names in your handler.`}
    />
   </section>

   {/* Step by Step */}
   <section className="mb-10">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Step-by-Step Migration</h2>
    <ol className="list-decimal list-inside text-gray-600 dark:text-slate-400 space-y-4">
     <li className="font-semibold text-gray-900 dark:text-white">
      Create HookSniff account
      <p className="font-normal text-gray-600 dark:text-slate-400 mt-1">
       Sign up at <code>hooksniff.vercel.app</code>. Get your API key from Settings → API Keys.
      </p>
     </li>
     <li className="font-semibold text-gray-900 dark:text-white">
      Replace SDK
      <p className="font-normal text-gray-600 dark:text-slate-400 mt-1">
       Uninstall Svix SDK, install HookSniff SDK. Update imports and initialization.
      </p>
     </li>
     <li className="font-semibold text-gray-900 dark:text-white">
      Create endpoints
      <p className="font-normal text-gray-600 dark:text-slate-400 mt-1">
       Use the HookSniff API or dashboard to create endpoints. Copy the signing secrets.
      </p>
     </li>
     <li className="font-semibold text-gray-900 dark:text-white">
      Update webhook handler
      <p className="font-normal text-gray-600 dark:text-slate-400 mt-1">
       Change header names: <code>svix-id</code> → <code>webhook-id</code>, etc.
      </p>
     </li>
     <li className="font-semibold text-gray-900 dark:text-white">
      Update API calls
      <p className="font-normal text-gray-600 dark:text-slate-400 mt-1">
       Remove <code>app_id</code> parameters. Update endpoint URLs if using raw HTTP.
      </p>
     </li>
     <li className="font-semibold text-gray-900 dark:text-white">
      Test & go live
      <p className="font-normal text-gray-600 dark:text-slate-400 mt-1">
       Use the Playground to test. Monitor deliveries in the dashboard. Switch production traffic.
      </p>
     </li>
    </ol>
   </section>

   {/* Need Help */}
   <section>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need Help?</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
     {[
      { href: 'https://github.com/servetarslan02/HookSniff/discussions', title: '<MessageSquare size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> GitHub Discussions', desc: 'Ask questions and get help from the community.' },
      { href: 'https://github.com/servetarslan02/HookSniff/issues', title: '<Bug size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Report Issues', desc: 'Found a bug? Let us know on GitHub.' },
      { href: '/docs/support', title: '<Mail size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Contact Support', desc: 'Reach out to the HookSniff team directly.' },
      { href: '/docs/playground', title: '<Gamepad2 size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Playground', desc: 'Test webhooks interactively before going live.' },
     ].map(({ href, title, desc }) => (
      <a key={href} href={href} className="block p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition">
       <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
       <p className="text-sm text-gray-500 dark:text-slate-400">{desc}</p>
      </a>
     ))}
    </div>
   </section>
  </article>
 );
}
