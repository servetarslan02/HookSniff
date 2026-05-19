/* eslint-disable no-useless-escape -- Code examples contain intentional escapes (Elixir, Ruby, etc.) */
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'SDK Libraries — HookSniff',
  description: 'Official SDKs for 11 languages. Type-safe, auto-retry, pagination, webhook verification built-in.',
};

const sdks = [
  {
    icon: <Package size={16} strokeWidth={1.75} />,
    nameKey: 'nodeSdk',
    lang: 'Node.js',
    pkg: 'hooksniff',
    registry: 'npm',
    version: '1.3.0',
    install: 'npm install hooksniff',
    status: 'Stable',
    statusColor: 'green',
    features: ['TypeScript types', 'Auto-retry', 'Pagination', 'SSE Streaming', 'Idempotency keys', 'Rate limit parsing'],
    quickStart: `import { HookSniff } from 'hooksniff';

const hs = new HookSniff({ apiKey: process.env.HOOKSNIFF_API_KEY! });

// 1. Create an endpoint
const endpoint = await hs.endpoint.create({
  url: 'https://myapp.com/webhook',
  description: 'Production webhook',
  event_types: ['order.created', 'order.updated'],
});
console.log('Endpoint:', endpoint.id);
console.log('Signing secret:', endpoint.secret); // → whsec_...

// 2. Send a webhook
const delivery = await hs.message.create({
  endpoint_id: endpoint.id,
  event: 'order.created',
  data: { order_id: 'ORD-123', amount: 99.99, currency: 'USD' },
});
console.log('Delivery:', delivery.id, delivery.status);

// 3. List deliveries with pagination
const deliveries = await hs.message_attempt.list_by_endpoint({
  endpoint_id: endpoint.id,
  limit: 20,
});
for (const attempt of deliveries.data) {
  console.log(\`\${attempt.id}: \${attempt.response_status_code}\`);
}`,
    verify: `import { Webhook } from 'hooksniff';

const wh = new Webhook('whsec_your_signing_secret');

// Express/Fastify handler
app.post('/webhook', (req, res) => {
  try {
    // Standard Webheaders headers
    const payload = wh.verify(req.body, {
      'webhook-id': req.headers['webhook-id']!,
      'webhook-timestamp': req.headers['webhook-timestamp']!,
      'webhook-signature': req.headers['webhook-signature']!,
    });
    console.log('Event:', payload.event);
    console.log('Data:', payload.data);
    res.status(200).send('OK');
  } catch (err) {
    res.status(401).send('Invalid signature');
  }
});`,
    resources: 35,
  },
  {
    icon: <Code2 size={16} strokeWidth={1.75} className="text-yellow-600" />,
    nameKey: 'pythonSdk',
    lang: 'Python',
    pkg: 'hooksniff',
    registry: 'PyPI',
    version: '1.1.0',
    install: 'pip install hooksniff',
    status: 'Stable',
    statusColor: 'green',
    features: ['Type hints', 'Auto-retry', 'Pagination', 'Async support', 'Idempotency keys'],
    quickStart: `from hooksniff import HookSniff
import os

hs = HookSniff(api_key=os.environ["HOOKSNIFF_API_KEY"])

# 1. Create an endpoint
endpoint = hs.endpoint.create(
    url="https://myapp.com/webhook",
    description="Production webhook",
    event_types=["order.created", "order.updated"],
)
print(f"Endpoint: {endpoint.id}")
print(f"Secret: {endpoint.secret}")  # → whsec_...

# 2. Send a webhook
delivery = hs.message.create(
    endpoint_id=endpoint.id,
    event="order.created",
    data={"order_id": "ORD-123", "amount": 99.99, "currency": "USD"},
)
print(f"Delivery: {delivery.id} ({delivery.status})")

# 3. List deliveries with pagination
deliveries = hs.message_attempt.list_by_endpoint(
    endpoint_id=endpoint.id,
    limit=20,
)
for attempt in deliveries.data:
    print(f"{attempt.id}: {attempt.response_status_code}")`,
    verify: `from hooksniff import Webhook

wh = Webhook("whsec_your_signing_secret")

# Flask/FastAPI handler
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
        print(f"Event: {payload['event']}")
        return "", 200
    except Exception:
        return "Invalid signature", 401`,
    resources: 30,
  },
  {
    icon: <Box size={16} strokeWidth={1.75} className="text-blue-500" />,
    nameKey: 'goSdk',
    lang: 'Go',
    pkg: 'github.com/servetarslan02/hooksniff-go',
    registry: 'pkg.go.dev',
    version: 'v1.3.0',
    install: 'go get github.com/servetarslan02/hooksniff-go@v1.3.0',
    status: 'Stable',
    statusColor: 'green',
    features: ['Context support', 'Auto-retry', 'Pagination', 'Idempotency keys', 'Rate limit parsing'],
    quickStart: `package main

import (
    "context"
    "fmt"
    "os"

    hooksniff "github.com/servetarslan02/hooksniff-go"
)

func main() {
    hs := hooksniff.NewClient(os.Getenv("HOOKSNIFF_API_KEY"))
    ctx := context.Background()

    // 1. Create an endpoint
    endpoint, err := hs.Endpoint.Create(ctx, &hooksniff.EndpointIn{
        Url:         "https://myapp.com/webhook",
        Description: hooksniff.String("Production webhook"),
        EventTypes:  []string{"order.created", "order.updated"},
    })
    if err != nil {
        panic(err)
    }
    fmt.Printf("Endpoint: %s\\n", endpoint.Id)
    fmt.Printf("Secret: %s\\n", endpoint.Secret)

    // 2. Send a webhook
    delivery, err := hs.Message.Create(ctx, &hooksniff.MessageIn{
        EndpointId: endpoint.Id,
        Event:      "order.created",
        Data: map[string]interface{}{
            "order_id": "ORD-123",
            "amount":   99.99,
            "currency": "USD",
        },
    })
    if err != nil {
        panic(err)
    }
    fmt.Printf("Delivery: %s (%s)\\n", delivery.Id, delivery.Status)
}`,
    verify: `wh, err := hooksniff.NewWebhook("whsec_your_signing_secret")
if err != nil {
    panic(err)
}

// net/http handler
func handleWebhook(w http.ResponseWriter, r *http.Request) {
    payload, err := wh.Verify(r.Body, r.Header)
    if err != nil {
        w.WriteHeader(401)
        w.Write([]byte("Invalid signature"))
        return
    }

    fmt.Printf("Event: %s\\n", payload.Event)
    fmt.Printf("Data: %v\\n", payload.Data)
    w.WriteHeader(200)
}`,
    resources: 30,
  },
  {
    icon: <Gem size={16} strokeWidth={1.75} className="text-orange-600" />,
    nameKey: 'rustSdk',
    lang: 'Rust',
    pkg: 'hooksniff',
    registry: 'crates.io',
    version: '1.5.0',
    install: 'cargo add hooksniff',
    status: 'Stable',
    statusColor: 'green',
    features: ['Async/await (Tokio)', 'Strongly typed', 'Auto-retry', 'Pagination', 'Idempotency keys'],
    quickStart: `use hooksniff::api::HookSniff;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let hs = HookSniff::new(
        std::env::var("HOOKSNIFF_API_KEY")?,
        None,
    );

    // 1. Create an endpoint
    let endpoint = hs.endpoint().create(
        hooksniff::models::EndpointIn {
            url: "https://myapp.com/webhook".to_string(),
            description: Some("Production webhook".to_string()),
            event_types: Some(vec![
                "order.created".to_string(),
                "order.updated".to_string(),
            ]),
            ..Default::default()
        },
    ).await?;
    println!("Endpoint: {}", endpoint.id);
    println!("Secret: {}", endpoint.secret.unwrap());

    // 2. Send a webhook
    let delivery = hs.message().create(
        hooksniff::models::MessageIn {
            endpoint_id: endpoint.id,
            event: "order.created".to_string(),
            data: serde_json::json!({
                "order_id": "ORD-123",
                "amount": 99.99,
                "currency": "USD"
            }),
            ..Default::default()
        },
    ).await?;
    println!("Delivery: {} ({})", delivery.id, delivery.status);

    Ok(())
}`,
    verify: `use hooksniff::webhooks::Webhook;

let wh = Webhook::new("whsec_your_signing_secret".to_string());

// Axum handler
async fn handle_webhook(
    headers: axum::http::HeaderMap,
    body: String,
) -> Result<String, axum::http::StatusCode> {
    let payload = wh.verify(
        body.as_bytes(),
        &headers,
    ).map_err(|_| axum::http::StatusCode::UNAUTHORIZED)?;

    println!("Event: {}", payload.event);
    println!("Data: {:?}", payload.data);
    Ok("OK".to_string())
}`,
    resources: 35,
  },
  {
    icon: <Gem size={16} strokeWidth={1.75} />,
    nameKey: 'rubySdk',
    lang: 'Ruby',
    pkg: 'hooksniff',
    registry: 'RubyGems',
    version: '1.2.0',
    install: 'gem install hooksniff',
    status: 'Stable',
    statusColor: 'green',
    features: ['Auto-retry', 'Pagination', 'Idempotency keys', 'Rate limit parsing'],
    quickStart: `require 'hooksniff'

hs = HookSniff::Client.new(api_key: ENV['HOOKSNIFF_API_KEY'])

# 1. Create an endpoint
endpoint = hs.endpoint.create(
  url: 'https://myapp.com/webhook',
  description: 'Production webhook',
  event_types: ['order.created', 'order.updated'],
)
puts "Endpoint: #{endpoint.id}"
puts "Secret: #{endpoint.secret}"

# 2. Send a webhook
delivery = hs.message.create(
  endpoint_id: endpoint.id,
  event: 'order.created',
  data: { order_id: 'ORD-123', amount: 99.99, currency: 'USD' },
)
puts "Delivery: #{delivery.id} (#{delivery.status})"

# 3. List deliveries
attempts = hs.message_attempts.list_by_endpoint(
  endpoint_id: endpoint.id,
  limit: 20,
)
attempts.data.each do |a|
  puts "#{a.id}: #{a.response_status_code}"
end`,
    verify: `require 'hooksniff'

wh = HookSniff::Webhook.new('whsec_your_signing_secret')

# Sinatra/Rails handler
post '/webhook' do
  payload = wh.verify(
    request.body.read,
    {
      'webhook-id' => request.env['HTTP_WEBHOOK_ID'],
      'webhook-timestamp' => request.env['HTTP_WEBHOOK_TIMESTAMP'],
      'webhook-signature' => request.env['HTTP_WEBHOOK_SIGNATURE'],
    },
  )
  puts "Event: #{payload['event']}"
  status 200
rescue HookSniff::SignatureVerificationError
  status 401
end`,
    resources: 30,
  },
  {
    icon: <Coffee size={16} strokeWidth={1.75} className="text-red-700" />,
    nameKey: 'javaSdk',
    lang: 'Java',
    pkg: 'io.github.servetarslan02:hooksniff-sdk',
    registry: 'Maven Central',
    version: '1.1.0',
    install: `<dependency>
  <groupId>io.github.servetarslan02</groupId>
  <artifactId>hooksniff-sdk</artifactId>
  <version>1.1.0</version>
</dependency>`,
    status: 'Stable',
    statusColor: 'green',
    features: ['Java 8+', 'Auto-retry', 'Pagination', 'Builder pattern', 'Idempotency keys'],
    quickStart: `import dev.hooksniff.HookSniff;
import dev.hooksniff.models.*;
import { Box, Circle, Code2, Coffee, FileCode, FileText, FlaskConical, Gem, Hash, Key, Package, Radio, RefreshCw, ShieldCheck, Smartphone, Zap } from 'lucide-react';

HookSniff hs = new HookSniff(System.getenv("HOOKSNIFF_API_KEY"));

// 1. Create an endpoint
Endpoint endpoint = hs.endpoint().create(
    CreateEndpointRequest.builder()
        .url("https://myapp.com/webhook")
        .description("Production webhook")
        .eventTypes(List.of("order.created", "order.updated"))
        .build()
);
System.out.println("Endpoint: " + endpoint.getId());
System.out.println("Secret: " + endpoint.getSecret());

// 2. Send a webhook
Delivery delivery = hs.webhooks().send(
    SendWebhookRequest.builder()
        .endpointId(endpoint.getId())
        .event("order.created")
        .data(Map.of(
            "order_id", "ORD-123",
            "amount", 99.99,
            "currency", "USD"
        ))
        .build()
);
System.out.println("Delivery: " + delivery.getId() + " (" + delivery.getStatus() + ")");`,
    verify: `import dev.hooksniff.Webhook;

Webhook wh = new Webhook("whsec_your_signing_secret");

// Spring controller
@PostMapping("/webhook")
public ResponseEntity<String> handleWebhook(
        @RequestBody String body,
        @RequestHeader Map<String, String> headers) {
    try {
        WebhookPayload payload = wh.verify(body, headers);
        System.out.println("Event: " + payload.getEvent());
        return ResponseEntity.ok("OK");
    } catch (WebhookVerificationException e) {
        return ResponseEntity.status(401).body("Invalid signature");
    }
}`,
    resources: 30,
  },
  {
    icon: <Circle size={16} strokeWidth={1.75} />,
    nameKey: 'kotlinSdk',
    lang: 'Kotlin',
    pkg: 'io.github.servetarslan02:hooksniff-sdk-kotlin',
    registry: 'Maven Central',
    version: '1.2.0',
    install: `// Gradle Kotlin DSL
implementation("io.github.servetarslan02:hooksniff-sdk-kotlin:1.2.0")`,
    status: 'Stable',
    statusColor: 'green',
    features: ['Coroutines', 'DSL builders', 'Auto-retry', 'Pagination', 'Idempotency keys'],
    quickStart: `import dev.hooksniff.HookSniff

val hs = HookSniff(apiKey = System.getenv("HOOKSNIFF_API_KEY"))

// 1. Create an endpoint
val endpoint = hs.endpoint.create(
    url = "https://myapp.com/webhook",
    description = "Production webhook",
    eventTypes = listOf("order.created", "order.updated"),
)
println("Endpoint: \${endpoint.id}")
println("Secret: \${endpoint.secret}")

// 2. Send a webhook
val delivery = hs.message.create(
    endpointId = endpoint.id,
    event = "order.created",
    data = mapOf(
        "order_id" to "ORD-123",
        "amount" to 99.99,
        "currency" to "USD",
    ),
)
println("Delivery: \${delivery.id} (\${delivery.status})")`,
    verify: `import dev.hooksniff.Webhook

val wh = Webhook("whsec_your_signing_secret")

// Ktor handler
post("/webhook") {
    try {
        val payload = wh.verify(
            call.receiveText(),
            call.request.headers,
        )
        println("Event: \${payload.event}")
        call.respondText("OK")
    } catch (e: SignatureVerificationException) {
        call.respondText("Invalid signature", status = HttpStatusCode.Unauthorized)
    }
}`,
    resources: 30,
  },
  {
    icon: <FileCode size={16} strokeWidth={1.75} className="text-purple-600" />,
    nameKey: 'phpSdk',
    lang: 'PHP',
    pkg: 'hooksniff/hooksniff',
    registry: 'Packagist',
    version: '1.1.0',
    install: 'composer require hooksniff/hooksniff',
    status: 'Stable',
    statusColor: 'green',
    features: ['PHP 8.1+', 'Auto-retry', 'Pagination', 'Idempotency keys'],
    quickStart: `<?php
require 'vendor/autoload.php';

$hs = new \\HookSniff\\Client(getenv('HOOKSNIFF_API_KEY'));

// 1. Create an endpoint
$endpoint = $hs->endpoints->create([
    'url' => 'https://myapp.com/webhook',
    'description' => 'Production webhook',
    'event_types' => ['order.created', 'order.updated'],
]);
echo "Endpoint: {$endpoint->id}\\n";
echo "Secret: {$endpoint->secret}\\n";

// 2. Send a webhook
$delivery = $hs->webhooks->send([
    'endpoint_id' => $endpoint->id,
    'event' => 'order.created',
    'data' => ['order_id' => 'ORD-123', 'amount' => 99.99, 'currency' => 'USD'],
]);
echo "Delivery: {$delivery->id} ({$delivery->status})\\n";`,
    verify: `<?php
$wh = new \\HookSniff\\Webhook('whsec_your_signing_secret');

// Laravel/Symfony controller
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
        echo "Event: {$payload['event']}\\n";
        return response('OK', 200);
    } catch (\\HookSniff\\SignatureVerificationException $e) {
        return response('Invalid signature', 401);
    }
}`,
    resources: 28,
  },
  {
    icon: <Hash size={16} strokeWidth={1.75} className="text-purple-600" />,
    nameKey: 'csharpSdk',
    lang: 'C#',
    pkg: 'HookSniff',
    registry: 'NuGet',
    version: '1.2.0',
    install: 'dotnet add package HookSniff',
    status: 'Stable',
    statusColor: 'green',
    features: ['Async/await', 'Auto-retry', 'Pagination', 'Idempotency keys', 'LINQ support'],
    quickStart: `using HookSniff;

var hs = new HookSniffClient(
    apiKey: Environment.GetEnvironmentVariable("HOOKSNIFF_API_KEY")
);

// 1. Create an endpoint
var endpoint = await hs.Endpoints.CreateAsync(new CreateEndpointRequest
{
    Url = "https://myapp.com/webhook",
    Description = "Production webhook",
    EventTypes = new[] { "order.created", "order.updated" }
});
Console.WriteLine($"Endpoint: {endpoint.Id}");
Console.WriteLine($"Secret: {endpoint.Secret}");

// 2. Send a webhook
var delivery = await hs.Webhooks.SendAsync(new SendWebhookRequest
{
    EndpointId = endpoint.Id,
    Event = "order.created",
    Data = new Dictionary<string, object>
    {
        { "order_id", "ORD-123" },
        { "amount", 99.99 },
        { "currency", "USD" }
    }
});
Console.WriteLine($"Delivery: {delivery.Id} ({delivery.Status})");`,
    verify: `using HookSniff;

var wh = new WebhookVerifier("whsec_your_signing_secret");

// ASP.NET controller
[HttpPost("webhook")]
public async Task<IActionResult> HandleWebhook()
{
    try
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();
        var payload = wh.Verify(body, Request.Headers);
        Console.WriteLine($"Event: {payload.EventType}");
        return Ok();
    }
    catch (SignatureVerificationException)
    {
        return Unauthorized("Invalid signature");
    }
}`,
    resources: 30,
  },
  {
    icon: <FlaskConical size={16} strokeWidth={1.75} />,
    nameKey: 'elixirSdk',
    lang: 'Elixir',
    pkg: 'hooksniff',
    registry: 'Hex.pm',
    version: '1.1.0',
    install: `# mix.exs
{:hooksniff, "~> 1.1"}`,
    status: 'Stable',
    statusColor: 'green',
    features: ['OTP compatible', 'Auto-retry', 'Pagination', 'Idempotency keys'],
    quickStart: `{:ok, hs} = HookSniff.client(api_key: System.get_env("HOOKSNIFF_API_KEY"))

# 1. Create an endpoint
{:ok, endpoint} = HookSniff.Endpoints.create(hs, %{
  url: "https://myapp.com/webhook",
  description: "Production webhook",
  event_types: ["order.created", "order.updated"]
})
IO.puts("Endpoint: #{endpoint.id}")
IO.puts("Secret: #{endpoint.secret}")

# 2. Send a webhook
{:ok, delivery} = HookSniff.Webhooks.send(hs, %{
  endpoint_id: endpoint.id,
  event: "order.created",
  data: %{order_id: "ORD-123", amount: 99.99, currency: "USD"}
})
IO.puts("Delivery: #{delivery.id} (#{delivery.status})")`,
    verify: `{:ok, wh} = HookSniff.Webhook.new("whsec_your_signing_secret")

# Phoenix controller
def handle_webhook(conn, _params) do
  {:ok, body, conn} = Plug.Conn.read_body(conn)

  case HookSniff.Webhook.verify(wh, body, conn.req_headers) do
    {:ok, payload} ->
      IO.puts("Event: #{payload["event"]}")
      send_resp(conn, 200, "OK")

    {:error, _reason} ->
      send_resp(conn, 401, "Invalid signature")
  end
end`,
    resources: 25,
  },
  {
    icon: <Smartphone size={16} strokeWidth={1.75} className="text-orange-500" />,
    nameKey: 'swiftSdk',
    lang: 'Swift',
    pkg: 'HookSniff',
    registry: 'Swift Package Manager',
    version: '1.2.0',
    install: `// Package.swift
dependencies: [
    .package(url: "https://github.com/servetarslan02/hooksniff-swift", from: "1.2.0"),
]`,
    status: 'Stable',
    statusColor: 'green',
    features: ['async/await', 'Auto-retry', 'Pagination', 'Idempotency keys', 'Codable models'],
    quickStart: `import HookSniff

let hs = HookSniff(apiKey: ProcessInfo.processInfo.environment["HOOKSNIFF_API_KEY"] ?? "")

// 1. Create an endpoint
let endpoint = try await hs.endpoint.create(
    url: "https://myapp.com/webhook",
    description: "Production webhook",
    eventTypes: ["order.created", "order.updated"]
)
print("Endpoint: \\(endpoint.id)")
print("Secret: \\(endpoint.secret ?? "")")

// 2. Send a webhook
let delivery = try await hs.message.create(
    endpointId: endpoint.id,
    event: "order.created",
    data: ["order_id": "ORD-123", "amount": 99.99, "currency": "USD"]
)
print("Delivery: \\(delivery.id) (\\(delivery.status))")`,
    verify: `import HookSniff

let wh = try Webhook(secret: "whsec_your_signing_secret")

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
        print("Event: \\(payload.event)")
        return Response(status: .ok)
    } catch {
        return Response(status: .unauthorized, body: "Invalid signature")
    }
}`,
    resources: 28,
  },
];

const sharedFeatures = [
  { icon: <ShieldCheck size={16} strokeWidth={1.75} />, title: 'HMAC-SHA256 Verification', desc: 'Standard Webhooks compliant. Every SDK verifies signatures with replay protection (5 min tolerance).' },
  { icon: <RefreshCw size={16} strokeWidth={1.75} />, title: 'Auto-Retry with Backoff', desc: 'Failed requests retry automatically with exponential backoff + jitter. Respects 429 Retry-After headers.' },
  { icon: <FileText size={16} strokeWidth={1.75} />, title: 'Cursor-Based Pagination', desc: 'All list endpoints support limit/cursor pagination. SDKs provide auto-paginate helpers.' },
  { icon: <Key size={16} strokeWidth={1.75} />, title: 'Idempotency Keys', desc: 'Pass idempotency_key to prevent duplicate deliveries on retry.' },
  { icon: <Radio size={16} strokeWidth={1.75} />, title: 'SSE Streaming', desc: 'Real-time delivery event stream via Server-Sent Events.' },
  { icon: <Zap size={16} strokeWidth={1.75} />, title: 'Rate Limit Parsing', desc: 'SDKs parse X-RateLimit-* headers and throw typed errors on 429.' },
];

export default function SdksPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('sdks') || 'SDK Libraries'}</h1>
      <p className="text-lg text-gray-600 dark:slate-400 mb-2">
        Official SDKs for <strong>11 languages</strong>. Type-safe, auto-retry, pagination, and webhook verification built-in.
      </p>
      <p className="text-gray-600 dark:text-slate-400 mb-8">
        Every SDK wraps the full HookSniff REST API. No raw HTTP calls needed — just import, initialize, and go.
      </p>

      {/* Shared Features */}
      <section className="mb-12 not-prose">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All SDKs Include</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sharedFeatures.map((f) => (
            <div key={f.title} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{f.icon}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{f.title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SDK Cards */}
      {sdks.map((sdk) => (
        <section key={sdk.lang} className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{sdk.icon}</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t(sdk.nameKey) || sdk.lang}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              sdk.statusColor === 'green' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              sdk.statusColor === 'yellow' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
            }`}>
              {sdk.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
            <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">{sdk.pkg}</code>
            <span className="mx-2">·</span>
            {sdk.registry} <span className="mx-1">·</span> v{sdk.version}
            <span className="mx-2">·</span> {sdk.resources} API resources
          </p>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-2 mb-6 not-prose">
            {sdk.features.map((f) => (
              <span key={f} className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
                {f}
              </span>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Installation</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono mb-6 overflow-x-auto">
            {sdk.install}
          </pre>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Start</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono mb-6 overflow-x-auto">
            {sdk.quickStart}
          </pre>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Verify Incoming Webhooks</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono mb-6 overflow-x-auto">
            {sdk.verify}
          </pre>
        </section>
      ))}

      {/* API Resources Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API Resources</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Every SDK supports these resources (30+ modules):
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Resource</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Methods</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {[
                ['Endpoint', 'CRUD + headers + secret rotation', 'Manage webhook destination URLs'],
                ['Message', 'create, list, get, expunge', 'Send and manage webhook deliveries'],
                ['MessageAttempt', 'list, get, resend, list_by_msg, list_by_endpoint', 'Delivery attempt details'],
                ['EventType', 'CRUD', 'Define and manage event types'],
                ['Authentication', 'register, login, 2FA, password reset, me', 'User authentication'],
                ['Billing', 'subscription, usage, invoices, portal', 'Subscription management'],
                ['Analytics', 'delivery_trend, success_rate, latency', 'Delivery metrics'],
                ['Alert', 'CRUD + test', 'Alert rules and notifications'],
                ['ApiKey', 'list, create, delete, rotate', 'API key management'],
                ['Application', 'CRUD', 'Group endpoints by application'],
                ['AuditLog', 'list', 'Audit trail for account actions'],
                ['BackgroundTask', 'list, get, cancel', 'Async task management'],
                ['Connector', 'list, get, delete', 'Pre-built integrations'],
                ['CustomDomain', 'add, verify, delete', 'Custom domain management'],
                ['Device', 'register, list', 'Push notification devices'],
                ['Environment', 'export, import, CRUD', 'Environment variables'],
                ['Health', 'check', 'System health status'],
                ['Inbound', 'CRUD', 'Inbound webhook configs'],
                ['Integration', 'CRUD + rotate_key', 'Third-party integrations'],
                ['MessagePoller', 'poll, seek, commit', 'Poll-based delivery'],
                ['Notification', 'list, mark_read', 'In-app notifications'],
                ['OperationalWebhook', 'endpoint CRUD', 'Ops webhook endpoints'],
                ['Portal', 'generate_link', 'Customer portal access'],
                ['RateLimit', 'get, set', 'Per-endpoint rate limiting'],
                ['Routing', 'CRUD', 'Smart routing rules'],
                ['Schema', 'CRUD + validate', 'JSON Schema registry'],
                ['Search', 'search', 'Full-text delivery search'],
                ['ServiceToken', 'CRUD', 'Service token management'],
                ['Sso', 'get, update', 'SSO configuration'],
                ['Statistics', 'aggregate_event_types', 'Usage statistics'],
                ['Stream', 'channels, subscribe, publish', 'Real-time streaming'],
                ['Team', 'list, invite, remove', 'Team management'],
                ['Template', 'CRUD', 'Webhook templates'],
                ['Transform', 'CRUD', 'Payload transformation rules'],
              ].map(([resource, methods, desc]) => (
                <tr key={resource as string}>
                  <td className="px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">{resource}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-400 text-sm">{methods}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-500 text-sm">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SDK Parity */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">SDK Feature Parity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Feature</th>
                {sdks.map(s => (
                  <th key={s.lang} className="px-2 py-3 text-center font-medium text-gray-700 dark:text-slate-300 text-xs">{s.icon}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {[
                ['Webhook Verification', [true,true,true,true,true,true,true,true,true,true,true]],
                ['Auto-Retry', [true,true,true,true,true,true,true,true,true,true,true]],
                ['Pagination', [true,true,true,true,true,true,true,true,true,true,true]],
                ['Idempotency Keys', [true,true,true,true,true,true,true,true,true,true,true]],
                ['Rate Limit Parsing', [true,true,true,true,true,false,true,false,true,false,true]],
                ['SSE Streaming', [true,false,true,true,false,false,false,false,false,false,false]],
                ['TypeScript Types', [true,false,false,false,false,false,false,false,false,false,false]],
                ['Async/Await', [true,true,false,true,false,true,true,false,true,false,true]],
              ].map(([feature, support]) => (
                <tr key={feature as string}>
                  <td className="px-3 py-3 font-medium text-gray-900 dark:text-white text-sm">{feature as string}</td>
                  {(support as boolean[]).map((s, i) => (
                    <td key={i} className="px-2 py-3 text-center text-lg">{s ? <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> : '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
