import { useTranslations } from 'next-intl';
import SdkTabs from '@/components/SdkTabs';
import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Quickstart — HookSniff',
  description: 'Send your first webhook in under 5 minutes with HookSniff',
};

const quickstartTabs = [
  {
    label: 'Node.js',
    code: `import { HookSniff } from 'hooksniff';

const hs = new HookSniff({ apiKey: process.env.HOOKSNIFF_API_KEY! });

// 1. Create an endpoint
const endpoint = await hs.endpoint.create({
  url: 'https://myapp.com/webhook',
  description: 'My first endpoint',
});
console.log('Endpoint ID:', endpoint.id);
console.log('Signing secret:', endpoint.secret); // → whsec_...

// 2. Send a webhook
const delivery = await hs.message.create({
  endpoint_id: endpoint.id,
  event: 'order.created',
  data: { order_id: 'ORD-001', amount: 49.99 },
});
console.log('Delivery ID:', delivery.id);
console.log('Status:', delivery.status); // → "pending"`,
  },
  {
    label: 'Python',
    code: `from hooksniff import HookSniff
import os
import { BarChart3, Bell, BookOpen, Building2, Lightbulb, Lock, Package, Plug, RefreshCw, Shuffle } from 'lucide-react';

hs = HookSniff(api_key=os.environ["HOOKSNIFF_API_KEY"])

# 1. Create an endpoint
endpoint = hs.endpoint.create(
    url="https://myapp.com/webhook",
    description="My first endpoint",
)
print(f"Endpoint ID: {endpoint.id}")
print(f"Signing secret: {endpoint.secret}")  # → whsec_...

# 2. Send a webhook
delivery = hs.message.create(
    endpoint_id=endpoint.id,
    event="order.created",
    data={"order_id": "ORD-001", "amount": 49.99},
)
print(f"Delivery ID: {delivery.id}")
print(f"Status: {delivery.status}")  # → "pending"`,
  },
  {
    label: 'Go',
    code: `hs := hooksniff.NewClient(os.Getenv("HOOKSNIFF_API_KEY"))
ctx := context.Background()

// 1. Create an endpoint
endpoint, _ := hs.Endpoint.Create(ctx, &hooksniff.EndpointIn{
    Url:         "https://myapp.com/webhook",
    Description: hooksniff.String("My first endpoint"),
})
fmt.Printf("Endpoint ID: %s\\n", endpoint.Id)
fmt.Printf("Signing secret: %s\\n", endpoint.Secret)

// 2. Send a webhook
delivery, _ := hs.Message.Create(ctx, &hooksniff.MessageIn{
    EndpointId: endpoint.Id,
    Event:      "order.created",
    Data:       map[string]interface{}{"order_id": "ORD-001", "amount": 49.99},
})
fmt.Printf("Delivery ID: %s\\n", delivery.Id)
fmt.Printf("Status: %s\\n", delivery.Status)`,
  },
  {
    label: 'Rust',
    code: `let hs = HookSniff::new(std::env::var("HOOKSNIFF_API_KEY")?, None);

// 1. Create an endpoint
let endpoint = hs.endpoint().create(EndpointIn {
    url: "https://myapp.com/webhook".to_string(),
    description: Some("My first endpoint".to_string()),
    ..Default::default()
}).await?;
println!("Endpoint ID: {}", endpoint.id);
println!("Signing secret: {}", endpoint.secret.unwrap());

// 2. Send a webhook
let delivery = hs.message().create(MessageIn {
    endpoint_id: endpoint.id,
    event: "order.created".to_string(),
    data: serde_json::json!({"order_id": "ORD-001", "amount": 49.99}),
    ..Default::default()
}).await?;
println!("Delivery ID: {}", delivery.id);`,
  },
  {
    label: 'Ruby',
    code: `hs = HookSniff::Client.new(api_key: ENV['HOOKSNIFF_API_KEY'])

# 1. Create an endpoint
endpoint = hs.endpoint.create(
  url: 'https://myapp.com/webhook',
  description: 'My first endpoint',
)
puts "Endpoint ID: #{endpoint.id}"
puts "Signing secret: #{endpoint.secret}"

# 2. Send a webhook
delivery = hs.message.create(
  endpoint_id: endpoint.id,
  event: 'order.created',
  data: { order_id: 'ORD-001', amount: 49.99 },
)
puts "Delivery ID: #{delivery.id}"
puts "Status: #{delivery.status}"`,
  },
  {
    label: 'Java',
    code: `HookSniff hs = new HookSniff(System.getenv("HOOKSNIFF_API_KEY"));

// 1. Create an endpoint
Endpoint endpoint = hs.endpoint().create(
    CreateEndpointRequest.builder()
        .url("https://myapp.com/webhook")
        .description("My first endpoint")
        .build()
);
System.out.println("Endpoint ID: " + endpoint.getId());
System.out.println("Signing secret: " + endpoint.getSecret());

// 2. Send a webhook
Delivery delivery = hs.webhooks().send(
    SendWebhookRequest.builder()
        .endpointId(endpoint.getId())
        .event("order.created")
        .data(Map.of("order_id", "ORD-001", "amount", 49.99))
        .build()
);
System.out.println("Delivery ID: " + delivery.getId());`,
  },
  {
    label: 'Kotlin',
    code: `val hs = HookSniff(apiKey = System.getenv("HOOKSNIFF_API_KEY"))

// 1. Create an endpoint
val endpoint = hs.endpoint.create(
    url = "https://myapp.com/webhook",
    description = "My first endpoint",
)
println("Endpoint ID: \${endpoint.id}")
println("Signing secret: \${endpoint.secret}")

// 2. Send a webhook
val delivery = hs.message.create(
    endpointId = endpoint.id,
    event = "order.created",
    data = mapOf("order_id" to "ORD-001", "amount" to 49.99),
)
println("Delivery ID: \${delivery.id}")`,
  },
  {
    label: 'PHP',
    code: `$hs = new \\HookSniff\\Client(getenv('HOOKSNIFF_API_KEY'));

// 1. Create an endpoint
$endpoint = $hs->endpoints->create([
    'url' => 'https://myapp.com/webhook',
    'description' => 'My first endpoint',
]);
echo "Endpoint ID: {$endpoint->id}\\n";
echo "Signing secret: {$endpoint->secret}\\n";

// 2. Send a webhook
$delivery = $hs->webhooks->send([
    'endpoint_id' => $endpoint->id,
    'event' => 'order.created',
    'data' => ['order_id' => 'ORD-001', 'amount' => 49.99],
]);
echo "Delivery ID: {$delivery->id}\\n";`,
  },
  {
    label: 'C#',
    code: `var hs = new HookSniffClient(
    apiKey: Environment.GetEnvironmentVariable("HOOKSNIFF_API_KEY")
);

// 1. Create an endpoint
var endpoint = await hs.Endpoints.CreateAsync(new CreateEndpointRequest
{
    Url = "https://myapp.com/webhook",
    Description = "My first endpoint"
});
Console.WriteLine($"Endpoint ID: {endpoint.Id}");
Console.WriteLine($"Signing secret: {endpoint.Secret}");

// 2. Send a webhook
var delivery = await hs.Webhooks.SendAsync(new SendWebhookRequest
{
    EndpointId = endpoint.Id,
    Event = "order.created",
    Data = new { order_id = "ORD-001", amount = 49.99 }
});
Console.WriteLine($"Delivery ID: {delivery.Id}");`,
  },
  {
    label: 'Elixir',
    code: `{:ok, hs} = HookSniff.client(api_key: System.get_env("HOOKSNIFF_API_KEY"))

# 1. Create an endpoint
{:ok, endpoint} = HookSniff.Endpoints.create(hs, %{
  url: "https://myapp.com/webhook",
  description: "My first endpoint"
})
IO.puts("Endpoint ID: #{endpoint.id}")
IO.puts("Signing secret: #{endpoint.secret}")

# 2. Send a webhook
{:ok, delivery} = HookSniff.Webhooks.send(hs, %{
  endpoint_id: endpoint.id,
  event: "order.created",
  data: %{order_id: "ORD-001", amount: 49.99}
})
IO.puts("Delivery ID: #{delivery.id}")`,
  },
  {
    label: 'Swift',
    code: `let hs = HookSniff(apiKey: ProcessInfo.processInfo.environment["HOOKSNIFF_API_KEY"] ?? "")

// 1. Create an endpoint
let endpoint = try await hs.endpoint.create(
    url: "https://myapp.com/webhook",
    description: "My first endpoint"
)
print("Endpoint ID: \\(endpoint.id)")
print("Signing secret: \\(endpoint.secret ?? "")")

// 2. Send a webhook
let delivery = try await hs.message.create(
    endpointId: endpoint.id,
    event: "order.created",
    data: ["order_id": "ORD-001", "amount": 49.99]
)
print("Delivery ID: \\(delivery.id)")`,
  },
];

const verifyTabs = [
  {
    label: 'Node.js',
    code: `import { Webhook } from 'hooksniff';

const wh = new Webhook('whsec_your_endpoint_secret');

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const payload = wh.verify(req.body, {
      'webhook-id': req.headers['webhook-id'],
      'webhook-timestamp': req.headers['webhook-timestamp'],
      'webhook-signature': req.headers['webhook-signature'],
    });
    // ✅ Valid — process event
    console.log('Event:', payload.event);
    console.log('Data:', payload.data);
    res.status(200).send('OK');
  } catch (err) {
    // ❌ Invalid — reject
    res.status(401).send('Invalid signature');
  }
});`,
  },
  {
    label: 'Python',
    code: `from hooksniff import Webhook

wh = Webhook("whsec_your_endpoint_secret")

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
        # ✅ Valid
        print(f"Event: {payload['event']}")
        return "", 200
    except Exception:
        # ❌ Invalid
        return "Invalid signature", 401`,
  },
  {
    label: 'Go',
    code: `wh, _ := hooksniff.NewWebhook("whsec_your_endpoint_secret")

func handleWebhook(w http.ResponseWriter, r *http.Request) {
    payload, err := wh.Verify(r.Body, r.Header)
    if err != nil {
        w.WriteHeader(401)
        w.Write([]byte("Invalid signature"))
        return
    }
    // ✅ Valid
    fmt.Printf("Event: %s\\n", payload.Event)
    w.WriteHeader(200)
}`,
  },
  {
    label: 'curl',
    code: `# Test your endpoint locally
curl -X POST http://localhost:3000/webhook \\
  -H "Content-Type: application/json" \\
  -H "webhook-id: msg_test123" \\
  -H "webhook-timestamp: $(date +%s)" \\
  -H "webhook-signature: v1,test_signature" \\
  -d '{"event": "order.created", "data": {"order_id": "ORD-001"}}'`,
  },
];

export default function QuickstartPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        {t('quickstart') || 'Quickstart'}
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Send your first webhook in under 5 minutes. Works with all 11 SDKs.
      </p>

      {/* Step 1: Get API Key */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Get Your API Key</h2>
        <ol className="list-decimal list-inside text-gray-600 dark:text-slate-400 space-y-2 mb-4">
          <li>Sign up at <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hooksniff.vercel.app</code></li>
          <li>Go to <strong>Settings → API Keys</strong></li>
          <li>Click <strong>Create API Key</strong></li>
          <li>Copy the key (starts with <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hr_live_</code>)</li>
        </ol>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong><AlertTriangle size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-amber-500" /> Keep your API key secret.</strong> Never expose it in client-side code or public repos. Use environment variables.
          </p>
        </div>
      </section>

      {/* Step 2: Install SDK */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Install SDK</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Choose your language and install the SDK:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 not-prose">
          {[
            { lang: 'Node.js', cmd: 'npm install hooksniff' },
            { lang: 'Python', cmd: 'pip install hooksniff' },
            { lang: 'Go', cmd: 'go get github.com/servetarslan02/hooksniff-go' },
            { lang: 'Rust', cmd: 'cargo add hooksniff' },
            { lang: 'Ruby', cmd: 'gem install hooksniff' },
            { lang: 'Java', cmd: 'Maven Central' },
            { lang: 'Kotlin', cmd: 'Maven Central' },
            { lang: 'PHP', cmd: 'composer require hooksniff/hooksniff' },
            { lang: 'C#', cmd: 'dotnet add package HookSniff' },
            { lang: 'Elixir', cmd: '{:hooksniff, "~> 1.1"}' },
            { lang: 'Swift', cmd: 'SPM' },
          ].map(({ lang, cmd }) => (
            <div key={lang} className="p-3 border border-gray-200 dark:border-slate-700 rounded-lg">
              <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{lang}</p>
              <code className="text-xs text-gray-500 dark:text-slate-400">{cmd}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Step 3: Create Endpoint + Send Webhook */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Create an Endpoint & Send a Webhook</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          An <strong>endpoint</strong> is a URL where webhooks are delivered. Each endpoint gets a unique signing secret for signature verification.
        </p>
        <SdkTabs tabs={quickstartTabs} />
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong><Lightbulb size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Save the signing secret!</strong> The <code>endpoint.secret</code> (starts with <code>whsec_</code>) is needed to verify incoming webhooks. You can also rotate it later via the dashboard or API.
          </p>
        </div>
      </section>

      {/* Step 4: Verify Signatures */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Verify Incoming Webhooks</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When HookSniff delivers a webhook to your endpoint, it includes three headers for signature verification. <strong>Always verify</strong> before processing:
        </p>
        <div className="overflow-x-auto mb-4">
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
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Unix timestamp. Reject if older than 5 minutes (replay protection).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">webhook-signature</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Space-separated <code>v1,</code> signatures. Verify at least one matches.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The signature is computed as: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">v1,base64(hmac_sha256(secret, {"\"{webhook-id}.{webhook-timestamp}.{body}\""}))</code>
        </p>
        <SdkTabs tabs={verifyTabs} />
      </section>

      {/* Step 5: Monitor */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Monitor Deliveries</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Check delivery status via the API or the dashboard at <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hooksniff.vercel.app</code>:
        </p>
        <CodeBlock
          code={`# List recent deliveries
curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks?limit=10 \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"

# Get specific delivery details
curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/MSG_ID \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"

# Get delivery attempts (HTTP responses from your server)
curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/MSG_ID/attempts \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
      </section>

      {/* What Happens Next */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Happens Next?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
          {[
            { icon: <RefreshCw size={16} strokeWidth={1.75} />, title: 'Automatic Retries', desc: 'If your endpoint returns a non-2xx status, HookSniff retries with exponential backoff (up to 5 attempts by default).' },
            { icon: <BarChart3 size={16} strokeWidth={1.75} />, title: 'Analytics', desc: 'Track delivery success rates, latency, and failure reasons in the dashboard.' },
            { icon: <Bell size={16} strokeWidth={1.75} />, title: 'Alerts', desc: 'Get notified when delivery rates drop or endpoints fail repeatedly.' },
            { icon: <Package size={16} strokeWidth={1.75} />, title: 'Dead Letter Queue', desc: 'Failed deliveries are preserved for debugging. Replay them when your endpoint is back up.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
          {[
            { href: '/docs/sdk-libraries', title: '<BookOpen size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Full SDK Reference', desc: 'All 30+ API resources for each language.' },
            { href: '/docs/security', title: '<Lock size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Security Best Practices', desc: 'SSRF protection, TLS, 2FA, key rotation.' },
            { href: '/docs/retries', title: '<RefreshCw size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Retries & DLQ', desc: 'Configure retry policies and replay failed webhooks.' },
            { href: '/docs/smart-routing', title: '<Shuffle size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Smart Routing', desc: 'Round-robin, latency-based, failover routing.' },
            { href: '/docs/integrations', title: '<Plug size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Integrations', desc: 'GitHub, Stripe, Shopify inbound webhooks.' },
            { href: '/docs/build-stripe-like', title: '<Building2 size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Build Stripe-like Webhooks', desc: 'Production-grade webhook system guide.' },
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
