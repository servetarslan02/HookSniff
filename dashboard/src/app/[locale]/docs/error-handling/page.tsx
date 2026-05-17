import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Client Error Handling',
  description: 'Best practices for handling webhook delivery errors in your application',
};

export default function ErrorHandlingPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Client Error Handling</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        How to handle webhook errors gracefully in your receiving endpoint.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Your webhook endpoint will receive all kinds of events — some expected, some not. Some payloads will be valid, some might be malformed. Your endpoint needs to handle all of these gracefully without crashing.
        </p>
      </section>

      {/* Respond Fast */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Respond Fast, Process Later</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Always return 200 within 5 seconds. Do the actual processing asynchronously:
        </p>
        <CodeBlock
          code={`app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  // 1. Verify signature (fast)
  if (!verifySignature(req.body, req.headers['x-hooksniff-signature'], secret)) {
    return res.status(401).send('Invalid signature');
  }

  // 2. Respond immediately
  res.status(200).json({ received: true });

  // 3. Process asynchronously
  queue.add(() => processWebhook(JSON.parse(req.body)));
});`}
        />
      </section>

      {/* Handle Unknown Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Handle Unknown Event Types</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Your endpoint might receive event types you don&apos;t expect. Don&apos;t crash — acknowledge and skip:
        </p>
        <CodeBlock
          code={`function processWebhook(event) {
  switch (event.event) {
    case 'order.created':
      handleOrderCreated(event.data);
      break;
    case 'payment.succeeded':
      handlePayment(event.data);
      break;
    default:
      // Log and skip unknown events
      console.log(\`Unknown event type: \${event.event}\`);
  }
}`}
        />
      </section>

      {/* Handle Duplicates */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Handle Duplicates</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Webhooks can be delivered more than once. Always check the delivery ID:
        </p>
        <CodeBlock
          code={`const processed = new Set(); // Use Redis/DB in production

function processWebhook(event) {
  const deliveryId = event.delivery_id;

  if (processed.has(deliveryId)) {
    console.log(\`Duplicate: \${deliveryId}\`);
    return;
  }

  processed.add(deliveryId);
  // Process the event...
}`}
        />
      </section>

      {/* Return Proper Status Codes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Return Proper Status Codes</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">When to Use</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">HookSniff Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono">200</td><td className="px-4 py-3">Successfully received</td><td className="px-4 py-3">Marked as delivered ✅</td></tr>
              <tr><td className="px-4 py-3 font-mono">401</td><td className="px-4 py-3">Invalid signature</td><td className="px-4 py-3">Not retried ❌</td></tr>
              <tr><td className="px-4 py-3 font-mono">400</td><td className="px-4 py-3">Bad payload</td><td className="px-4 py-3">Not retried ❌</td></tr>
              <tr><td className="px-4 py-3 font-mono">500</td><td className="px-4 py-3">Server error</td><td className="px-4 py-3">Retried 🔄</td></tr>
              <tr><td className="px-4 py-3 font-mono">429</td><td className="px-4 py-3">Too busy</td><td className="px-4 py-3">Retried 🔄</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Only return 5xx if you want HookSniff to retry. Return 4xx if the problem is on your side and retrying won&apos;t help.
        </p>
      </section>

      {/* Graceful Degradation */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Graceful Degradation</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          If your processing fails, still return 200 and log the error. You can replay the webhook later:
        </p>
        <CodeBlock
          code={`app.post('/webhook', (req, res) => {
  try {
    processWebhook(req.body);
    res.status(200).json({ received: true });
  } catch (err) {
    // Log the error but still return 200
    console.error('Processing failed:', err);
    saveToDeadLetterQueue(req.body); // Process later
    res.status(200).json({ received: true, queued: true });
  }
});`}
        />
      </section>
    </article>
  );
}
