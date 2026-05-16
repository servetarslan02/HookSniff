import { useTranslations } from 'next-intl';
import CodeBlock from '@/components/CodeBlock';

export default function SecurityPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t("webhookSecurityGuide")}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Best practices for securing webhook deliveries — signature verification, IP whitelisting, and more.
      </p>

      {/* HMAC-SHA256 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">HMAC-SHA256 Signature Verification</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Every webhook is signed using <strong>{t("standardWebhooks")}</strong> HMAC-SHA256. The signature is included in the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Signature</code> header.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Format: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">v1,{'{'}base64(hmac_signature){'}'}</code>
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Node.js Verification</h3>
        <CodeBlock
          code={`import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  secret: string
): boolean {
  // Parse "v1,{base64}" format
  const parts = signatureHeader.split(',');
  const version = parts[0];
  const signature = parts[1];

  if (version !== 'v1') return false;

  // Compute expected signature
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// Express middleware
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['X-HookSniff-Signature'] as string;
  const secret = 'whsec_your_signing_secret';

  if (!verifyWebhookSignature(req.body.toString(), signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process the webhook
  const event = JSON.parse(req.body);
  console.log('Verified event:', event.event);
  res.status(200).json({ received: true });
});`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">{t("pythonVerification")}</h3>
        <CodeBlock
          code={`import hmac
import hashlib
import base64
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'Security',
  description: 'How HookSniff secures your webhook deliveries with signatures and encryption',
};


def verify_webhook_signature(
    payload: bytes,
    signature_header: str,
    secret: str
) -> bool:
    """Verify Standard Webhooks HMAC-SHA256 signature."""
    parts = signature_header.split(',')
    if len(parts) != 2 or parts[0] != 'v1':
        return False

    signature = parts[1]

    # Compute expected signature
    expected = base64.b64encode(
        hmac.new(
            secret.encode('utf-8'),
            payload,
            hashlib.sha256
        ).digest()
    ).decode('utf-8')

    return hmac.compare_digest(signature, expected)

# Flask example
from flask import Flask, request, abort

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-HookSniff-Signature', '')
    secret = 'whsec_your_signing_secret'

    if not verify_webhook_signature(request.data, signature, secret):
        abort(401)

    event = request.json
    return {'received': True}, 200`}
        />
      </section>

      {/* Timestamp Validation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("timestampValidation")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Always validate the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Timestamp</code> header to prevent replay attacks. Reject webhooks older than <strong>5 minutes</strong>:
        </p>
        <CodeBlock
          code={`function isTimestampValid(timestampHeader: string, toleranceSec = 300): boolean {
  const webhookTime = parseInt(timestampHeader, 10);
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - webhookTime) <= toleranceSec;
}

// In your handler:
const timestamp = req.headers['X-HookSniff-Timestamp'] as string;
if (!isTimestampValid(timestamp)) {
  return res.status(401).json({ error: 'Timestamp expired' });
}`}
        />
      </section>

      {/* IP Whitelisting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("ipWhitelisting")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          For additional security, restrict incoming webhooks to HookSniff's IP addresses:
        </p>
        <CodeBlock
          code={`# Fetch current outbound IPs
curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/outbound-ips`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Use these IPs in your firewall or reverse proxy configuration. Note: IPs may change — fetch periodically or subscribe to changes.
        </p>
      </section>

      {/* TLS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("tlsEnforcement")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff only delivers webhooks to <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">https://</code> endpoints. HTTP endpoints are rejected unless explicitly allowed. All API communication is encrypted via TLS.
        </p>
      </section>

      {/* SSRF Protection */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("ssrfProtection")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff blocks webhook delivery to internal/private networks to prevent SSRF attacks:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">localhost</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">127.0.0.1</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">::1</code></li>
          <li>Private IP ranges: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">10.*</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">172.16-31.*</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">192.168.*</code></li>
          <li>Link-local: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">169.254.*</code></li>
          <li>Internal domains: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">*.local</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">*.internal</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">*.localhost</code></li>
          <li>Hex-encoded IPs: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">0x7f000001</code></li>
        </ul>
      </section>
    </article>
  );
}
