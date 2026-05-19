import SdkTabs from '@/components/SdkTabs';
import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Webhook Verification — HookSniff Docs',
  description: 'Verify webhook signatures using Standard Webhooks (HMAC-SHA256) in any language',
};

const verifyTabs = [
  {
    label: 'Node.js',
    code: `import { Webhook } from 'hooksniff';

const wh = new Webhook('whsec_your_endpoint_secret');

// Express handler
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const payload = wh.verify(req.body, {
      'webhook-id': req.headers['webhook-id'],
      'webhook-timestamp': req.headers['webhook-timestamp'],
      'webhook-signature': req.headers['webhook-signature'],
    });

    // ✅ Signature valid — process event
    console.log('Event:', payload.event);
    console.log('Data:', payload.data);

    switch (payload.event) {
      case 'order.created':
        // Handle new order
        break;
      case 'payment.completed':
        // Handle payment
        break;
    }

    res.status(200).json({ received: true });
  } catch (err) {
    // ❌ Invalid signature — reject
    res.status(401).json({ error: 'Invalid signature' });
  }
});`,
  },
  {
    label: 'Python',
    code: `from hooksniff import Webhook

wh = Webhook("whsec_your_endpoint_secret")

# Flask handler
@app.route("/webhook", methods=["POST"])
def handle_webhook():
    try:
        payload = wh.verify(
            request.data,
            {
                "webhook-id": request.headers["webhook-id"],
                "webhook-timestamp": request.headers["webhook-timestamp"],
                "webhook-signature": request.headers["webhook-signature"],
            },
        )

        # ✅ Signature valid
        event = payload["event"]
        data = payload["data"]

        if event == "order.created":
            pass  # Handle new order
        elif event == "payment.completed":
            pass  # Handle payment

        return "", 200
    except Exception:
        # ❌ Invalid signature
        return "Invalid signature", 401

# FastAPI handler
@app.post("/webhook")
async def handle_webhook_fastapi(request: Request):
    body = await request.body()
    payload = wh.verify(body, dict(request.headers))
    return {"received": True}`,
  },
  {
    label: 'Go',
    code: `wh, err := hooksniff.NewWebhook("whsec_your_endpoint_secret")
if err != nil {
    log.Fatal(err)
}

// net/http handler
func handleWebhook(w http.ResponseWriter, r *http.Request) {
    // Read body
    body, err := io.ReadAll(r.Body)
    if err != nil {
        w.WriteHeader(400)
        return
    }

    // Verify signature
    payload, err := wh.Verify(body, r.Header)
    if err != nil {
        w.WriteHeader(401)
        w.Write([]byte("Invalid signature"))
        return
    }

    // ✅ Signature valid
    fmt.Printf("Event: %s\\n", payload.Event)

    switch payload.Event {
    case "order.created":
        // Handle new order
    case "payment.completed":
        // Handle payment
    }

    w.WriteHeader(200)
}

// Chi router
r := chi.NewRouter()
r.Post("/webhook", handleWebhook)`,
  },
  {
    label: 'Rust',
    code: `use hooksniff::webhooks::Webhook;

let wh = Webhook::new("whsec_your_endpoint_secret".to_string());

// Axum handler
async fn handle_webhook(
    headers: axum::http::HeaderMap,
    body: String,
) -> Result<String, axum::http::StatusCode> {
    let payload = wh.verify(body.as_bytes(), &headers)
        .map_err(|_| axum::http::StatusCode::UNAUTHORIZED)?;

    // ✅ Signature valid
    println!("Event: {}", payload.event);

    match payload.event.as_str() {
        "order.created" => { /* Handle new order */ }
        "payment.completed" => { /* Handle payment */ }
        _ => {}
    }

    Ok("OK".to_string())
}

// Router
let app = axum::Router::new()
    .route("/webhook", axum::routing::post(handle_webhook));`,
  },
  {
    label: 'Ruby',
    code: `require 'hooksniff'

wh = HookSniff::Webhook.new('whsec_your_endpoint_secret')

# Sinatra handler
post '/webhook' do
  payload = wh.verify(
    request.body.read,
    {
      'webhook-id' => request.env['HTTP_WEBHOOK_ID'],
      'webhook-timestamp' => request.env['HTTP_WEBHOOK_TIMESTAMP'],
      'webhook-signature' => request.env['HTTP_WEBHOOK_SIGNATURE'],
    },
  )

  # ✅ Signature valid
  puts "Event: #{payload['event']}"

  case payload['event']
  when 'order.created'
    # Handle new order
  when 'payment.completed'
    # Handle payment
  end

  status 200
rescue HookSniff::SignatureVerificationError
  # ❌ Invalid signature
  status 401
end

# Rails controller
class WebhooksController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    payload = wh.verify(request.body.read, request.headers.to_h)
    render json: { received: true }
  rescue HookSniff::SignatureVerificationError
    head :unauthorized
  end
end`,
  },
  {
    label: 'Java',
    code: `import dev.hooksniff.Webhook;

Webhook wh = new Webhook("whsec_your_endpoint_secret");

// Spring controller
@PostMapping("/webhook")
public ResponseEntity<String> handleWebhook(
        @RequestBody String body,
        @RequestHeader Map<String, String> headers) {
    try {
        WebhookPayload payload = wh.verify(body, headers);

        // ✅ Signature valid
        System.out.println("Event: " + payload.getEvent());

        switch (payload.getEvent()) {
            case "order.created":
                // Handle new order
                break;
            case "payment.completed":
                // Handle payment
                break;
        }

        return ResponseEntity.ok("OK");
    } catch (WebhookVerificationException e) {
        // ❌ Invalid signature
        return ResponseEntity.status(401).body("Invalid signature");
    }
}`,
  },
  {
    label: 'Kotlin',
    code: `import dev.hooksniff.Webhook

val wh = Webhook("whsec_your_endpoint_secret")

// Ktor handler
post("/webhook") {
    try {
        val payload = wh.verify(
            call.receiveText(),
            call.request.headers,
        )

        // ✅ Signature valid
        println("Event: \${payload.event}")

        when (payload.event) {
            "order.created" -> { /* Handle new order */ }
            "payment.completed" -> { /* Handle payment */ }
        }

        call.respondText("OK")
    } catch (e: SignatureVerificationException) {
        // ❌ Invalid signature
        call.respondText("Invalid signature", status = HttpStatusCode.Unauthorized)
    }
}`,
  },
  {
    label: 'PHP',
    code: `<?php
$wh = new \\HookSniff\\Webhook('whsec_your_endpoint_secret');

// Laravel controller
public function handleWebhook(Request $request) {
    try {
        $payload = $wh->verify(
            $request->getContent(),
            [
                'webhook-id' => $request->header('webhook-id'),
                'webhook-timestamp' => $request->header('webhook-timestamp'),
                'webhook-signature' => $request->header('webhook-signature'),
            ],
        );

        // ✅ Signature valid
        echo "Event: {$payload['event']}\\n";

        return response('OK', 200);
    } catch (\\HookSniff\\SignatureVerificationException $e) {
        // ❌ Invalid signature
        return response('Invalid signature', 401);
    }
}`,
  },
  {
    label: 'C#',
    code: `using HookSniff;

var wh = new WebhookVerifier("whsec_your_endpoint_secret");

// ASP.NET controller
[HttpPost("webhook")]
public async Task<IActionResult> HandleWebhook()
{
    try
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();
        var payload = wh.Verify(body, Request.Headers);

        // ✅ Signature valid
        Console.WriteLine($"Event: {payload.EventType}");

        return Ok();
    }
    catch (SignatureVerificationException)
    {
        // ❌ Invalid signature
        return Unauthorized("Invalid signature");
    }
}`,
  },
  {
    label: 'Elixir',
    code: `{:ok, wh} = HookSniff.Webhook.new("whsec_your_endpoint_secret")

# Phoenix controller
def handle_webhook(conn, _params) do
  {:ok, body, conn} = Plug.Conn.read_body(conn)

  case HookSniff.Webhook.verify(wh, body, conn.req_headers) do
    {:ok, payload} ->
      # ✅ Signature valid
      IO.puts("Event: #{payload["event"]}")
      send_resp(conn, 200, "OK")

    {:error, _reason} ->
      # ❌ Invalid signature
      send_resp(conn, 401, "Invalid signature")
  end
end`,
  },
  {
    label: 'Swift',
    code: `import HookSniff

let wh = try Webhook(secret: "whsec_your_endpoint_secret")

// Vapor handler
app.post("webhook") { req async throws -> Response in
    let body = req.body.string ?? ""

    do {
        let payload = try wh.verify(
            body: body,
            headers: [
                "webhook-id": req.headers["webhook-id"].first ?? "",
                "webhook-timestamp": req.headers["webhook-timestamp"].first ?? "",
                "webhook-signature": req.headers["webhook-signature"].first ?? "",
            ]
        )

        // ✅ Signature valid
        print("Event: \\(payload.event)")

        return Response(status: .ok)
    } catch {
        // ❌ Invalid signature
        return Response(status: .unauthorized, body: "Invalid signature")
    }
}`,
  },
];

export default function WebhookVerificationPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        🔒 Webhook Signature Verification
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Every webhook delivered by HookSniff includes a cryptographic signature. <strong>Always verify it</strong> before processing — this prevents attackers from sending fake webhooks to your endpoint.
      </p>

      {/* Why Verify */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why Verify?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
          {[
            { icon: '🛡️', title: 'Prevent Spoofing', desc: 'Without verification, anyone can POST to your endpoint with fake data.' },
            { icon: '🔄', title: 'Replay Protection', desc: 'Timestamps older than 5 minutes are rejected automatically.' },
            { icon: '📐', title: 'Standard Webhooks', desc: 'HookSniff follows the Standard Webhooks spec — same as Svix, Clerk, and others.' },
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

      {/* How It Works */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Each webhook delivery includes three headers:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Header</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Example</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr>
                <td className="px-4 py-3 font-mono text-sm">webhook-id</td>
                <td className="px-4 py-3 font-mono text-sm text-gray-500">msg_abc123def456</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Unique message identifier</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">webhook-timestamp</td>
                <td className="px-4 py-3 font-mono text-sm text-gray-500">1716100000</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Unix timestamp. Reject if &gt; 5 min old.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">webhook-signature</td>
                <td className="px-4 py-3 font-mono text-sm text-gray-500">v1,abc123...</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Space-separated HMAC-SHA256 signatures</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Signature Algorithm</h3>
        <CodeBlock
          code={'signed_content = "\\{webhook-id\\}.\\{webhook-timestamp\\}.\\{body\\}"\nsignature = "v1," + base64(hmac_sha256(secret, signed_content))'}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">
          The <code>webhook-signature</code> header may contain multiple space-separated signatures (for key rotation). Your code should verify that <strong>at least one</strong> matches.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Verification Steps</h3>
        <ol className="list-decimal list-inside text-gray-600 dark:text-slate-400 space-y-2 mb-4">
          <li>Extract <code>webhook-id</code>, <code>webhook-timestamp</code>, and <code>webhook-signature</code> headers</li>
          <li>Check timestamp: reject if older than <strong>5 minutes</strong> (300 seconds)</li>
          <li>Compute expected signature: <code>v1,base64(hmac_sha256(secret, {"\"{id}.{timestamp}.{body}\""}))</code></li>
          <li>Compare with received signature(s) using <strong>constant-time comparison</strong> (prevents timing attacks)</li>
          <li>If any signature matches → ✅ valid. Otherwise → ❌ reject</li>
        </ol>
      </section>

      {/* SDK Verification */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Verify with SDKs</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          All HookSniff SDKs handle verification automatically. Just pass the raw body and headers:
        </p>
        <SdkTabs tabs={verifyTabs} />
      </section>

      {/* Manual Verification */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Manual Verification (No SDK)</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          If you can't use an SDK, here's the algorithm in Python:
        </p>
        <CodeBlock
          code={`import hmac
import hashlib
import base64
import time

def verify_webhook(body: bytes, headers: dict, secret: str) -> dict:
    """Verify a Standard Webhooks signature."""
    msg_id = headers.get("webhook-id")
    timestamp = headers.get("webhook-timestamp")
    signature = headers.get("webhook-signature")

    if not all([msg_id, timestamp, signature]):
        raise ValueError("Missing required headers")

    # 1. Check timestamp (reject if older than 5 minutes)
    age = abs(time.time() - int(timestamp))
    if age > 300:
        raise ValueError(f"Webhook too old: {age}s")

    # 2. Decode secret (remove whsec_ prefix, base64 decode)
    secret_bytes = base64.b64decode(secret.replace("whsec_", ""))

    # 3. Compute expected signature
    signed_content = f"{msg_id}.{timestamp}.{body.decode()}"
    expected_sig = "v1," + base64.b64encode(
        hmac.new(secret_bytes, signed_content.encode(), hashlib.sha256).digest()
    ).decode()

    # 4. Verify (check all signatures, may be space-separated)
    sigs = signature.split(" ")
    if not any(hmac.compare_digest(s, expected_sig) for s in sigs):
        raise ValueError("Invalid signature")

    # 5. Parse and return payload
    import json
    return json.loads(body)`}
        />
      </section>

      {/* Security Tips */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Security Tips</h2>
        <div className="space-y-4 not-prose">
          {[
            { icon: '✅', title: 'Always use HTTPS', desc: 'Your webhook endpoint must use TLS. HookSniff refuses to deliver to HTTP endpoints.' },
            { icon: '✅', title: 'Use constant-time comparison', desc: 'Prevents timing attacks. All SDKs do this automatically.' },
            { icon: '✅', title: 'Check timestamp', desc: 'Reject webhooks older than 5 minutes to prevent replay attacks.' },
            { icon: '✅', title: 'Rotate secrets periodically', desc: 'Use the dashboard or API to rotate signing secrets. Old secrets remain valid during rotation.' },
            { icon: '✅', title: 'Return 2xx quickly', desc: 'Process webhooks asynchronously. Return 200 immediately, then handle the event in a background job.' },
            { icon: '❌', title: 'Never log the secret', desc: 'Signing secrets are credentials. Never log them or expose them in error messages.' },
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

      {/* Key Rotation */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Key Rotation</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When you rotate an endpoint's signing secret, HookSniff sends webhooks with <strong>both</strong> old and new signatures (space-separated in the <code>webhook-signature</code> header). This allows zero-downtime rotation:
        </p>
        <CodeBlock
          code={`# webhook-signature header during rotation:
# "v1,old_signature v1,new_signature"

# Your verification code should check if ANY signature matches:
sigs = signature.split(" ")
valid = any(verify(sig, secret) for sig in sigs)`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Rotate secrets via the dashboard: <strong>Endpoints → Select endpoint → Rotate Secret</strong>, or via the API:
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/EP_ID/rotate-secret \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
      </section>
    </article>
  );
}
