/* eslint-disable no-useless-escape -- Code examples contain intentional escapes (Elixir, Ruby, etc.) */
import { useTranslations } from 'next-intl';

// Force SSR — SSG output was missing on Vercel for this page
export const dynamic = 'force-dynamic';

// Force redeploy — docs/sdks page fix
const sdks = [
  {
    icon: '📦',
    nameKey: 'nodeSdk',
    lang: 'Node.js',
    install: 'npm install hooksniff-sdk',
    status: 'Stable',
    statusColor: 'green',
    quickStart: `import { HookSniff } from 'hooksniff-sdk';

const hr = new HookSniff({ apiKey: process.env.HOOKSNIFF_API_KEY! });

// Create an endpoint
const endpoint = await hr.endpoints.create({
  url: 'https://myapp.com/webhook',
  description: 'Production webhook',
});
console.log('Endpoint:', endpoint.id);

// Send a webhook
const delivery = await hr.webhooks.send({
  endpointId: endpoint.id,
  event: 'order.created',
  data: { order_id: '12345', total: 99.99, currency: 'USD' },
});
console.log('Delivery:', delivery.id, delivery.status);`,
    verify: `import express from 'express';
import { verifySignature } from 'hooksniff-sdk';

const app = express();

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-hooksniff-signature'] as string;

  if (!verifySignature(req.body, signature, 'whsec_your_secret')) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body);
  console.log('Received:', event.event);
  res.status(200).send('OK');
});`,
    types: `import type { Endpoint, Delivery, WebhookEvent } from 'hooksniff-sdk';

const endpoints: Endpoint[] = await hr.endpoints.list();
const delivery: Delivery = await hr.webhooks.send({
  endpointId: 'ep_abc123',
  event: 'user.created',
  data: { email: 'user@example.com' } satisfies WebhookEvent,
});`,
  },
  {
    icon: '🐍',
    nameKey: 'pythonSdk',
    lang: 'Python',
    install: 'pip install hooksniff',
    status: 'Stable',
    statusColor: 'green',
    quickStart: `import hooksniff
import os

client = hooksniff.Client(api_key=os.environ["HOOKSNIFF_API_KEY"])

# Create an endpoint
endpoint = client.endpoints.create(
    url="https://myapp.com/webhook",
    description="Production webhook"
)
print(f"Endpoint ID: {endpoint.id}")

# Send a webhook
delivery = client.webhooks.send(
    endpoint_id=endpoint.id,
    event="order.created",
    data={"order_id": "12345", "total": 99.99, "currency": "USD"}
)
print(f"Delivery ID: {delivery.id}, Status: {delivery.status}")`,
    verify: `from flask import Flask, request, abort
import hooksniff

app = Flask(__name__)

@app.route("/webhook", methods=["POST"])
def handle_webhook():
    signature = request.headers.get("X-HookSniff-Signature")
    if not hooksniff.verify_signature(
        payload=request.data,
        signature=signature,
        secret="whsec_your_signing_secret"
    ):
        abort(401)

    event = request.json
    print(f"Received: {event['event']}")
    return "", 200`,
  },
  {
    icon: '🦀',
    nameKey: 'rustSdk',
    lang: 'Rust',
    install: 'cargo add hooksniff',
    status: 'Stable',
    statusColor: 'green',
    quickStart: `use hooksniff::HookSniffClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = HookSniffClient::new(
        std::env::var("HOOKSNIFF_API_KEY")?
    );

    // Create an endpoint
    let endpoint = client.create_endpoint()
        .url("https://myapp.com/webhook")
        .description("Production webhook")
        .send()
        .await?;
    println!("Endpoint: {}", endpoint.id);

    // Send a webhook
    let delivery = client.send_webhook()
        .endpoint_id(&endpoint.id)
        .event("order.created")
        .data(serde_json::json!({
            "order_id": "12345",
            "total": 99.99
        }))
        .send()
        .await?;
    println!("Delivery: {}", delivery.id);

    Ok(())
}`,
  },
  {
    icon: '🐹',
    nameKey: 'goSdk',
    lang: 'Go',
    install: 'go get github.com/servetarslan02/hooksniff-go',
    status: 'Stable',
    statusColor: 'green',
    quickStart: `package main

import (
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'SDK Libraries',
  description: 'Official SDK libraries for HookSniff in multiple languages',
};

    "fmt"
    "os"
    hooksniff "github.com/servetarslan02/hooksniff-go"
)

func main() {
    cfg := hooksniff.NewConfiguration()
    cfg.AddDefaultHeader("Authorization", "Bearer "+os.Getenv("HOOKSNIFF_API_KEY"))
    client := hooksniff.NewAPIClient(cfg)

    // Create an endpoint
    endpoint, _, _ := client.EndpointsApi.CreateEndpoint(nil).Execute()
    fmt.Printf("Endpoint: %s\\n", endpoint.Id)

    // Send a webhook
    delivery, _, _ := client.WebhooksApi.SendWebhook(nil).Execute()
    fmt.Printf("Delivery: %s\\n", delivery.Id)
}`,
  },
  {
    icon: '💎',
    nameKey: 'rubySdk',
    lang: 'Ruby',
    install: 'gem install hooksniff',
    status: 'Stable',
    statusColor: 'green',
    quickStart: `require 'hooksniff'

client = HookSniff::Client.new(api_key: ENV['HOOKSNIFF_API_KEY'])

# Create an endpoint
endpoint = client.endpoints.create(
  url: 'https://myapp.com/webhook',
  description: 'Production webhook'
)
puts "Endpoint: #{endpoint.id}"

# Send a webhook
delivery = client.webhooks.send(
  endpoint_id: endpoint.id,
  event: 'order.created',
  data: { order_id: '12345', total: 99.99 }
)
puts "Delivery: #{delivery.id}"`,
  },
  {
    icon: '🐘',
    nameKey: 'phpSdk',
    lang: 'PHP',
    install: 'composer require hooksniff/hooksniff-php',
    status: 'Stable',
    statusColor: 'green',
    quickStart: `<?php
require 'vendor/autoload.php';

$client = new \\HookSniff\\Client(getenv('HOOKSNIFF_API_KEY'));

// Create an endpoint
$endpoint = $client->endpoints->create([
    'url' => 'https://myapp.com/webhook',
    'description' => 'Production webhook',
]);
echo "Endpoint: {$endpoint->id}\\n";

// Send a webhook
$delivery = $client->webhooks->send([
    'endpoint_id' => $endpoint->id,
    'event' => 'order.created',
    'data' => ['order_id' => '12345', 'total' => 99.99],
]);
echo "Delivery: {$delivery->id}\\n";`,
  },
  {
    icon: '🧪',
    nameKey: 'elixirSdk',
    lang: 'Elixir',
    install: '{:hooksniff, "~> 0.3.0"}',
    status: 'Stable',
    statusColor: 'green',
    quickStart: `# In your mix.exs deps:
# {:hooksniff, "~> 0.3.0"}

{:ok, client} = HookSniff.Client.new(api_key: System.get_env("HOOKSNIFF_API_KEY"))

# Create an endpoint
{:ok, endpoint} = HookSniff.Endpoints.create(client, %{
  url: "https://myapp.com/webhook",
  description: "Production webhook"
})
IO.puts("Endpoint: \#{endpoint.id}")

# Send a webhook
{:ok, delivery} = HookSniff.Webhooks.send(client, %{
  endpoint_id: endpoint.id,
  event: "order.created",
  data: %{order_id: "12345", total: 99.99}
})
IO.puts("Delivery: \#{delivery.id}")`,
  },
  {
    icon: '☕',
    nameKey: 'csharpSdk',
    lang: 'C#',
    install: 'dotnet add package HookSniff',
    status: 'Stable',
    statusColor: 'green',
    quickStart: `using HookSniff;

var client = new HookSniffClient(
    apiKey: Environment.GetEnvironmentVariable("HOOKSNIFF_API_KEY")
);

// Create an endpoint
var endpoint = await client.Endpoints.CreateAsync(new CreateEndpointRequest
{
    Url = "https://myapp.com/webhook",
    Description = "Production webhook"
});
Console.WriteLine($"Endpoint: {endpoint.Id}");

// Send a webhook
var delivery = await client.Webhooks.SendAsync(new SendWebhookRequest
{
    EndpointId = endpoint.Id,
    Event = "order.created",
    Data = new { order_id = "12345", total = 99.99 }
});
Console.WriteLine($"Delivery: {delivery.Id}");`,
  },
];

const comingSoon = [
  { lang: 'Java', icon: '☕', pkg: 'io.github.servetarslan02:hooksniff-sdk', registry: 'Maven Central' },
  { lang: 'Kotlin', icon: '🟣', pkg: 'io.github.servetarslan02:hooksniff-sdk', registry: 'Maven Central' },
  { lang: 'Swift', icon: '🍎', pkg: 'HookSniff (SPM)', registry: 'Swift Package Manager' },
];

export default function SdksPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('sdks')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Official SDKs for 8 languages. Install via your package manager and start sending webhooks in seconds.
      </p>

      {sdks.map((sdk) => (
        <section key={sdk.lang} className="mb-12">
          <div className="flex items-center gap-3 mb-4">
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

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('installation')}</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono mb-6 overflow-x-auto">
            {sdk.install}
          </pre>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('quickStartSdk')}</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto mb-6">
            {sdk.quickStart}
          </pre>

          {sdk.verify && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('verifySignatures')}</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto mb-6">
                {sdk.verify}
              </pre>
            </>
          )}

          {sdk.types && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('typescriptSupport')}</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
                {sdk.types}
              </pre>
            </>
          )}
        </section>
      ))}

      {/* Coming Soon */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Coming Soon</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          These SDKs are in development and will be available on their package registries soon.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comingSoon.map((sdk) => (
            <div key={sdk.lang} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{sdk.icon} {sdk.lang}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                  Coming Soon
                </span>
              </div>
              <code className="text-xs font-mono text-gray-600 dark:text-slate-400">{sdk.pkg}</code>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{sdk.registry}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
