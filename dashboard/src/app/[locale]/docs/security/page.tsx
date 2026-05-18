import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Security',
  description: 'How HookSniff secures webhook deliveries with signatures and encryption',
};

export default async function SecurityPage() {
  const t = await getTranslations('docsSecurity');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('theProblemDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('problem1')}</li>
          <li>{t('problem2')}</li>
          <li>{t('problem3')}</li>
        </ul>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howSecures')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('howSecuresDesc1')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Format: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">v1,{'{'}base64(hmac_signature){'}'}</code>
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('howSecuresAlso')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Timestamp</code> — {t('timestampHeader')}</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Delivery-Id</code> — {t('deliveryIdHeader')}</li>
        </ul>
      </section>

      {/* Verification Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('verificationExamples')}</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Node.js</h3>
        <CodeBlock
          code={`import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  secret: string
): boolean {
  const parts = signatureHeader.split(',');
  if (parts[0] !== 'v1') return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(parts[1]),
    Buffer.from(expected)
  );
}

// Express middleware
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-hooksniff-signature'] as string;
  const secret = 'whsec_your_signing_secret';

  if (!verifyWebhookSignature(req.body.toString(), signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(req.body);
  // Process the webhook...
  res.status(200).json({ received: true });
});`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Python</h3>
        <CodeBlock
          code={`import hmac, hashlib, base64

def verify_webhook_signature(payload: bytes, signature_header: str, secret: str) -> bool:
    parts = signature_header.split(',')
    if len(parts) != 2 or parts[0] != 'v1':
        return False
    expected = base64.b64encode(
        hmac.new(secret.encode(), payload, hashlib.sha256).digest()
    ).decode()
    return hmac.compare_digest(parts[1], expected)`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">PHP</h3>
        <CodeBlock
          code={`function verifyWebhookSignature(string $payload, string $signatureHeader, string $secret): bool {
    $parts = explode(',', $signatureHeader);
    if ($parts[0] !== 'v1') return false;
    $expected = base64_encode(hash_hmac('sha256', $payload, $secret, true));
    return hash_equals($parts[1], $expected);
}`}
        />
      </section>

      {/* Timestamp Validation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('timestampValidation')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('timestampValidationDesc')}
        </p>
        <CodeBlock
          code={`function isTimestampValid(timestampHeader: string, toleranceSec = 300): boolean {
  const webhookTime = parseInt(timestampHeader, 10);
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - webhookTime) <= toleranceSec;
}`}
        />
      </section>

      {/* IP Whitelisting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('ipWhitelisting')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('ipWhitelistingDesc')}
        </p>
        <CodeBlock
          code={`curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/outbound-ips`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('ipWhitelistingNote')}
        </p>
      </section>

      {/* SSRF Protection */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('ssrfProtection')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('ssrfProtectionDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">{t('ssrfLocalhost')}</code></li>
          <li>{t('ssrfPrivate')}</li>
          <li>{t('ssrfLinkLocal')}</li>
          <li>{t('ssrfInternal')}</li>
        </ul>
      </section>

      {/* Checklist */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('checklist')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>✅ {t('check1')}</li>
          <li>✅ {t('check2')}</li>
          <li>✅ {t('check3')}</li>
          <li>✅ {t('check4')}</li>
          <li>✅ {t('check5')}</li>
          <li>✅ {t('check6')}</li>
          <li>✅ {t('check7')}</li>
        </ul>
      </section>
    </article>
  );
}
