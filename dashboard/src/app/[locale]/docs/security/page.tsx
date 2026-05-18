import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Security',
  description: 'How HookSniff secures webhook deliveries with signatures and encryption',
};

export default function SecurityPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Webhook Security</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Webhooks carry sensitive data. Without verification, anyone can send fake events to your endpoint.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Webhooks are just HTTP POST requests. If your endpoint accepts any POST request without verification, an attacker can:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Send fake &quot;payment succeeded&quot; events to give themselves free products</li>
          <li>Replay old events to trigger duplicate processing</li>
          <li>Send malformed payloads to crash your application</li>
        </ul>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How HookSniff Secures Webhooks</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Every webhook is signed using <strong>Standard Webhooks</strong> HMAC-SHA256. The signature is included in the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Signature</code> header. The receiver verifies the signature using the shared secret — if it doesn&apos;t match, the request is rejected.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Format: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">v1,{'{'}base64(hmac_signature){'}'}</code>
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">HookSniff also includes:</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Timestamp</code> — Unix timestamp to prevent replay attacks</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Delivery-Id</code> — Unique delivery identifier for deduplication</li>
        </ul>
      </section>

      {/* Verification Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Verification Examples</h2>

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Timestamp Validation</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Always validate the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Timestamp</code> header to prevent replay attacks. Reject webhooks older than <strong>5 minutes</strong>:
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">IP Whitelisting</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          For additional security, restrict incoming webhooks to HookSniff&apos;s IP addresses:
        </p>
        <CodeBlock
          code={`curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/outbound-ips`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Use these IPs in your firewall or reverse proxy. Note: IPs may change — fetch periodically.
        </p>
      </section>

      {/* SSRF Protection */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">SSRF Protection</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff blocks webhook delivery to internal/private networks to prevent SSRF attacks:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">localhost</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">127.0.0.1</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">::1</code></li>
          <li>Private IP ranges: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">10.*</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">172.16-31.*</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">192.168.*</code></li>
          <li>Link-local: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">169.254.*</code></li>
          <li>Internal domains: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">*.local</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">*.internal</code></li>
        </ul>
      </section>

      {/* Checklist */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Security Checklist</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>✅ Always verify HMAC signatures before processing</li>
          <li>✅ Use constant-time comparison (hmac.compare_digest)</li>
          <li>✅ Validate timestamps (reject older than 5 minutes)</li>
          <li>✅ Use HTTPS endpoints only</li>
          <li>✅ Store signing secrets securely (environment variables, not code)</li>
          <li>✅ Rotate secrets periodically via the API</li>
          <li>✅ Whitelist HookSniff&apos;s outbound IPs if your firewall supports it</li>
        </ul>
      </section>
    </article>
  );
}
