import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Client Error Handling',
  description: 'Best practices for handling webhook delivery errors in your application',
};

export default async function ErrorHandlingPage() {
  const t = await getTranslations('docsErrorHandling');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('problemDesc')}</p>
      </section>

      {/* Respond Fast */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('respondFast')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('respondFastDesc')}</p>
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('unknownEvents')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('unknownEventsDesc')}</p>
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('duplicates')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('duplicatesDesc')}</p>
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('statusCodes')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('status')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('whenToUse')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('hooksniffBehavior')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono">200</td><td className="px-4 py-3">{t('status200')}</td><td className="px-4 py-3">{t('status200Behavior')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">401</td><td className="px-4 py-3">{t('status401')}</td><td className="px-4 py-3">{t('status401Behavior')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">400</td><td className="px-4 py-3">{t('status400')}</td><td className="px-4 py-3">{t('status400Behavior')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">500</td><td className="px-4 py-3">{t('status500')}</td><td className="px-4 py-3">{t('status500Behavior')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">429</td><td className="px-4 py-3">{t('status429')}</td><td className="px-4 py-3">{t('status429Behavior')}</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400 mt-4">{t('statusCodesTip')}</p>
      </section>

      {/* Graceful Degradation */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('gracefulDegradation')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('gracefulDegradationDesc')}</p>
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
