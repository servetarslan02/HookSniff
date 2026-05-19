import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Error Handling — HookSniff Docs',
  description: 'Handle webhook delivery errors, retries, and failures gracefully',
};

export default function ErrorHandlingPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">🛡️ Error Handling</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Webhook delivery can fail for many reasons — your server is down, network issues, or invalid responses. Here's how HookSniff handles errors and how to build resilient webhook handlers.
      </p>

      {/* Error Types */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API Error Codes</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The HookSniff API returns standard HTTP status codes. All SDKs throw typed exceptions for each:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Meaning</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">SDK Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr>
                <td className="px-4 py-3 font-mono text-sm">400</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Bad Request — invalid parameters</td>
                <td className="px-4 py-3 text-gray-500 dark:text-slate-500">Throws validation error with details</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">401</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Unauthorized — invalid API key</td>
                <td className="px-4 py-3 text-gray-500 dark:text-slate-500">Throws authentication error</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">403</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Forbidden — insufficient permissions</td>
                <td className="px-4 py-3 text-gray-500 dark:text-slate-500">Throws permission error</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">404</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Not Found — resource doesn't exist</td>
                <td className="px-4 py-3 text-gray-500 dark:text-slate-500">Throws not found error</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">409</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Conflict — duplicate request (idempotency)</td>
                <td className="px-4 py-3 text-gray-500 dark:text-slate-500">Returns existing resource</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">422</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Unprocessable — validation failed</td>
                <td className="px-4 py-3 text-gray-500 dark:text-slate-500">Throws validation error with field details</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">429</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Rate Limited — too many requests</td>
                <td className="px-4 py-3 text-gray-500 dark:text-slate-500">Auto-retries after <code>Retry-After</code> header</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">500</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Server Error — HookSniff internal error</td>
                <td className="px-4 py-3 text-gray-500 dark:text-slate-500">Auto-retries up to 2 times with backoff</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SDK Error Handling */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">SDK Error Handling Examples</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Node.js</h3>
        <CodeBlock
          code={`import { HookSniff, HttpError, ValidationError } from 'hooksniff';

const hs = new HookSniff({ apiKey: 'hr_live_xxx' });

try {
  const endpoint = await hs.endpoint.create({
    url: 'https://myapp.com/webhook',
  });
} catch (err) {
  if (err instanceof HttpError) {
    console.error(\`HTTP \${err.statusCode}: \${err.message}\`);
    if (err.statusCode === 429) {
      const retryAfter = err.headers['retry-after'];
      console.log(\`Retry after \${retryAfter} seconds\`);
    }
  } else if (err instanceof ValidationError) {
    console.error('Validation failed:', err.errors);
  } else {
    throw err; // Unexpected error
  }
}`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Python</h3>
        <CodeBlock
          code={`from hooksniff import HookSniff
from hooksniff.exceptions import HttpError, ValidationError

hs = HookSniff(api_key="hr_live_xxx")

try:
    endpoint = hs.endpoint.create(url="https://myapp.com/webhook")
except HttpError as e:
    print(f"HTTP {e.status_code}: {e.message}")
    if e.status_code == 429:
        retry_after = e.headers.get("retry-after")
        print(f"Retry after {retry_after} seconds")
except ValidationError as e:
    print(f"Validation failed: {e.errors}")
except Exception as e:
    raise  # Unexpected error`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Go</h3>
        <CodeBlock
          code={`endpoint, err := hs.Endpoint.Create(ctx, &hooksniff.EndpointIn{
    Url: "https://myapp.com/webhook",
})
if err != nil {
    var httpErr *hooksniff.HttpError
    if errors.As(err, &httpErr) {
        fmt.Printf("HTTP %d: %s\\n", httpErr.StatusCode, httpErr.Message)
        if httpErr.StatusCode == 429 {
            retryAfter := httpErr.Headers.Get("Retry-After")
            fmt.Printf("Retry after %s seconds\\n", retryAfter)
        }
    } else {
        // Unexpected error
        panic(err)
    }
}`}
        />
      </section>

      {/* Webhook Delivery Errors */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Webhook Delivery Errors</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When HookSniff delivers webhooks to <em>your</em> endpoint, these are considered failures:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Your Response</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">HookSniff Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr>
                <td className="px-4 py-3 font-mono text-sm">2xx</td>
                <td className="px-4 py-3 text-green-600 dark:text-green-400">✅ Success — delivery complete</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">3xx</td>
                <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400">⚠️ Follow redirect (up to 3 hops)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">4xx (except 429)</td>
                <td className="px-4 py-3 text-red-600 dark:text-red-400">❌ No retry — your client error</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">429</td>
                <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400">🔄 Retry after <code>Retry-After</code> header</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">5xx</td>
                <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400">🔄 Retry with exponential backoff</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">Timeout (30s)</td>
                <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400">🔄 Retry</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">Connection refused</td>
                <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400">🔄 Retry</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">DNS failure</td>
                <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400">🔄 Retry</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Webhook Handler Best Practices</h2>
        <div className="space-y-4 not-prose">
          {[
            { icon: '⚡', title: 'Return 200 immediately', desc: 'Don\'t process the webhook synchronously. Acknowledge receipt, then handle the event in a background job.' },
            { icon: '🔍', title: 'Verify signature first', desc: 'Always verify the webhook signature before parsing the body. Reject invalid signatures with 401.' },
            { icon: '🔑', title: 'Use idempotency keys', desc: 'The webhook-id header is unique per delivery. Use it to deduplicate if HookSniff retries.' },
            { icon: '📝', title: 'Log everything', desc: 'Log the webhook-id, timestamp, and event type. Essential for debugging delivery issues.' },
            { icon: '🔄', title: 'Handle retries gracefully', desc: 'Your handler may be called multiple times for the same event. Design for idempotency.' },
            { icon: '⏱️', title: 'Respond within 30 seconds', desc: 'HookSniff times out after 30s. If you need more time, queue the event and respond immediately.' },
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

      {/* Example: Resilient Handler */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Example: Resilient Webhook Handler</h2>
        <CodeBlock
          code={`import express from 'express';
import { Webhook } from 'hooksniff';

const app = express();
const wh = new Webhook(process.env.WEBHOOK_SECRET!);

// Use raw body for signature verification
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const startTime = Date.now();

  // 1. Verify signature FIRST
  let payload;
  try {
    payload = wh.verify(req.body, {
      'webhook-id': req.headers['webhook-id']!,
      'webhook-timestamp': req.headers['webhook-timestamp']!,
      'webhook-signature': req.headers['webhook-signature']!,
    });
  } catch (err) {
    console.error('Signature verification failed:', err);
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Acknowledge immediately
  res.status(200).json({ received: true });

  // 3. Process asynchronously
  try {
    await processWebhook(payload);
    console.log(\`Processed \${payload.event} in \${Date.now() - startTime}ms\`);
  } catch (err) {
    console.error(\`Failed to process \${payload.event}:\`, err);
    // Don't send error response — already acknowledged
    // Log for debugging, set up alerting for repeated failures
  }
});

async function processWebhook(payload: any) {
  const { event, data } = payload;

  // Idempotency: check if already processed
  const existing = await db.webhookEvents.findOne({ webhook_id: payload.webhook_id });
  if (existing) {
    console.log(\`Duplicate: \${payload.webhook_id}\`);
    return;
  }

  // Process event
  switch (event) {
    case 'order.created':
      await handleOrderCreated(data);
      break;
    case 'payment.completed':
      await handlePaymentCompleted(data);
      break;
    default:
      console.log(\`Unhandled event: \${event}\`);
  }

  // Mark as processed
  await db.webhookEvents.insert({
    webhook_id: payload.webhook_id,
    event,
    processed_at: new Date(),
  });
}`}
        />
      </section>
    </article>
  );
}
