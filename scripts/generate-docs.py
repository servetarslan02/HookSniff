#!/usr/bin/env python3
"""
HookSniff SDK README Üretici — 11 SDK için tutarlı dokümantasyon
Kullanım: python3 generate-docs.py [dil|all]
"""

import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
SDK_DIR = SCRIPT_DIR / "sdks"

# ── README Template'leri ─────────────────────────────────

NODE_README = '''<h1 align="center">
  <img width="120" src="https://avatars.githubusercontent.com/u/80175132?s=200&v=4" />
  <br>HookSniff Node.js SDK
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/hooksniff"><img src="https://img.shields.io/npm/v/hooksniff.svg" alt="NPM"></a>
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

TypeScript/Node.js SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
npm install hooksniff
```

## Quick Start

```typescript
import { HookSniff } from 'hooksniff';

const client = new HookSniff({ apiKey: 'hs_xxx' });

// List endpoints
const endpoints = await client.endpoint.list();
console.log(endpoints);

// Create an endpoint
const endpoint = await client.endpoint.create({
  url: 'https://example.com/webhook',
  description: 'My endpoint',
});

// Send a webhook
const message = await client.message.create({
  event: 'order.created',
  data: { orderId: '123', amount: 99.99 },
});

// Get delivery attempts
const attempts = await client.messageAttempt.listByMsg(message.id);
```

## Webhook Verification

```typescript
import { Webhook } from 'hooksniff';

const wh = new Webhook('whsec_xxx');

try {
  const payload = wh.verify(rawBody, {
    'hooksniff-id': headers['hooksniff-id'],
    'hooksniff-signature': headers['hooksniff-signature'],
    'hooksniff-timestamp': headers['hooksniff-timestamp'],
  });
  // Payload is valid
  console.log(payload);
} catch (err) {
  // Invalid signature
  console.error('Webhook verification failed:', err);
}
```

## Error Handling

```typescript
import { HookSniff, HookSniffError } from 'hooksniff';

try {
  await client.endpoint.get('invalid_id');
} catch (err) {
  if (err instanceof HookSniffError) {
    console.error(err.code);    // 'not_found'
    console.error(err.message); // 'Endpoint not found'
  }
}
```

## Configuration

```typescript
const client = new HookSniff({
  apiKey: 'hs_xxx',
  baseUrl: 'https://api.hooksniff.com/v1', // optional
  timeout: 30000,                            // ms
  retries: 3,                                // auto-retry on 429/5xx
});
```

## Resources

| Resource | Methods |
|----------|---------|
| `endpoint` | `list`, `create`, `get`, `update`, `delete` |
| `message` | `create`, `list`, `get` |
| `messageAttempt` | `list`, `listByMsg`, `get`, `resend` |
| `authentication` | `dashboardAccess` |
| `eventType` | `list` |
| `statistics` | `aggregate` |

## Links

- [Documentation](https://docs.hooksniff.com)
- [API Reference](https://api.hooksniff.com)
- [GitHub](https://github.com/servetarslan02/HookSniff)
'''

PYTHON_README = '''# HookSniff Python SDK

<p align="center">
  <a href="https://pypi.org/project/hooksniff/"><img src="https://img.shields.io/pypi/v/hooksniff.svg" alt="PyPI"></a>
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

Python SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
pip install hooksniff
```

## Quick Start

```python
from hooksniff import HookSniff

client = HookSniff("hs_xxx")

# List endpoints
endpoints = client.endpoint.list()
print(endpoints)

# Create an endpoint
endpoint = client.endpoint.create(
    url="https://example.com/webhook",
    description="My endpoint",
)

# Send a webhook
message = client.message.create(
    event="order.created",
    data={"order_id": "123", "amount": 99.99},
)

# Get delivery attempts
attempts = client.message_attempt.list_by_msg(message.id)
```

## Webhook Verification

```python
from hooksniff import Webhook

wh = Webhook("whsec_xxx")

try:
    payload = wh.verify(raw_body, headers)
    # Payload is valid
    print(payload)
except Exception as err:
    # Invalid signature
    print(f"Verification failed: {err}")
```

## Error Handling

```python
from hooksniff import HookSniff
from hooksniff.exceptions import HookSniffError, NotFoundError

try:
    client.endpoint.get("invalid_id")
except NotFoundError:
    print("Endpoint not found")
except HookSniffError as err:
    print(f"Error: {err.code} — {err.message}")
```

## Configuration

```python
client = HookSniff(
    "hs_xxx",
    base_url="https://api.hooksniff.com/v1",  # optional
    timeout=30,                                 # seconds
    retries=3,                                  # auto-retry on 429/5xx
)
```

## Async Support

```python
import asyncio
from hooksniff import HookSniff

async def main():
    client = HookSniff("hs_xxx")
    endpoints = await client.endpoint.list()
    print(endpoints)

asyncio.run(main())
```

## Resources

| Resource | Methods |
|----------|---------|
| `endpoint` | `list`, `create`, `get`, `update`, `delete` |
| `message` | `create`, `list`, `get` |
| `message_attempt` | `list`, `list_by_msg`, `get`, `resend` |
| `authentication` | `dashboard_access` |
| `event_type` | `list` |
| `statistics` | `aggregate` |

## Links

- [Documentation](https://docs.hooksniff.com)
- [API Reference](https://api.hooksniff.com)
- [GitHub](https://github.com/servetarslan02/HookSniff)
'''

GO_README = '''# HookSniff Go SDK

<p align="center">
  <a href="https://pkg.go.dev/github.com/servetarslan02/hooksniff-go"><img src="https://pkg.go.dev/badge/github.com/servetarslan02/hooksniff-go.svg" alt="Go Reference"></a>
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

Go SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
go get github.com/servetarslan02/hooksniff-go
```

## Quick Start

```go
package main

import (
    "fmt"
    hooksniff "github.com/servetarslan02/hooksniff-go"
)

func main() {
    client := hooksniff.New("hs_xxx")

    // List endpoints
    endpoints, err := client.Endpoint.List(nil)
    if err != nil {
        panic(err)
    }
    fmt.Println(endpoints)

    // Create an endpoint
    endpoint, err := client.Endpoint.Create(&hooksniff.EndpointIn{
        Url:         "https://example.com/webhook",
        Description: hooksniff.String("My endpoint"),
    })

    // Send a webhook
    message, err := client.Message.Create(&hooksniff.MessageIn{
        Event: "order.created",
        Data:  map[string]interface{}{"order_id": "123"},
    })
}
```

## Webhook Verification

```go
import "github.com/servetarslan02/hooksniff-go"

wh, err := hooksniff.NewWebhook("whsec_xxx")
if err != nil {
    panic(err)
}

payload, err := wh.Verify(body, http.Header{
    "Hooksniff-Id":        []string{r.Header.Get("hooksniff-id")},
    "Hooksniff-Signature": []string{r.Header.Get("hooksniff-signature")},
    "Hooksniff-Timestamp": []string{r.Header.Get("hooksniff-timestamp")},
})
if err != nil {
    // Invalid signature
}
```

## Resources

| Resource | Methods |
|----------|---------|
| `Endpoint` | `List`, `Create`, `Get`, `Update`, `Delete` |
| `Message` | `Create`, `List`, `Get` |
| `MessageAttempt` | `List`, `ListByMsg`, `Get`, `Resend` |
| `Authentication` | `DashboardAccess` |
| `EventType` | `List` |
| `Statistics` | `Aggregate` |

## Links

- [Documentation](https://docs.hooksniff.com)
- [Go Reference](https://pkg.go.dev/github.com/servetarslan02/hooksniff-go)
- [GitHub](https://github.com/servetarslan02/HookSniff)
'''

GENERIC_README = '''# HookSniff {lang} SDK

<p align="center">
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

{lang} SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
{install_cmd}
```

## Quick Start

```{code_lang}
{quick_start}
```

## Webhook Verification

```{code_lang}
{webhook_verify}
```

## Resources

| Resource | Methods |
|----------|---------|
| Endpoint | list, create, get, update, delete |
| Message | create, list, get |
| MessageAttempt | list, listByMsg, get, resend |
| Authentication | dashboardAccess |
| EventType | list |
| Statistics | aggregate |

## Links

- [Documentation](https://docs.hooksniff.com)
- [API Reference](https://api.hooksniff.com)
- [GitHub](https://github.com/servetarslan02/HookSniff)
'''

# ── Her dil için ──────────────────────────────────────────

SDK_DOCS = {
    "node": NODE_README,
    "python": PYTHON_README,
    "go": GO_README,
    "rust": GENERIC_README.format(
        lang="Rust", code_lang="rust",
        install_cmd='[dependencies]\nhooksniff = "1.0.0"',
        quick_start='use hooksniff::HookSniff;\n\nlet client = HookSniff::new("hs_xxx");\nlet endpoints = client.endpoint().list().await?;\nprintln!("{:?}", endpoints);',
        webhook_verify='use hooksniff::Webhook;\n\nlet wh = Webhook::new("whsec_xxx");\npayload = wh.verify(body, headers)?;',
    ),
    "ruby": GENERIC_README.format(
        lang="Ruby", code_lang="ruby",
        install_cmd='gem install hooksniff',
        quick_start='require "hooksniff"\n\nclient = HookSniff::Client.new("hs_xxx")\nendpoints = client.endpoint.list\nputs endpoints',
        webhook_verify='wh = HookSniff::Webhook.new("whsec_xxx")\npayload = wh.verify(body, headers)',
    ),
    "java": GENERIC_README.format(
        lang="Java", code_lang="java",
        install_cmd='<dependency>\n  <groupId>com.hooksniff</groupId>\n  <artifactId>hooksniff</artifactId>\n  <version>1.0.0</version>\n</dependency>',
        quick_start='HookSniff client = new HookSniff("hs_xxx");\nvar endpoints = client.getEndpoint().list();\nSystem.out.println(endpoints);',
        webhook_verify='Webhook wh = new Webhook("whsec_xxx");\nwh.verify(body, headers);',
    ),
    "kotlin": GENERIC_README.format(
        lang="Kotlin", code_lang="kotlin",
        install_cmd='implementation("com.hooksniff:hooksniff:1.0.0")',
        quick_start='val client = HookSniff("hs_xxx")\nval endpoints = client.endpoint.list()\nprintln(endpoints)',
        webhook_verify='val wh = Webhook("whsec_xxx")\nval payload = wh.verify(body, headers)',
    ),
    "php": GENERIC_README.format(
        lang="PHP", code_lang="php",
        install_cmd='composer require hooksniff/hooksniff',
        quick_start='$client = new HookSniff("hs_xxx");\n$endpoints = $client->endpoint->list();\nprint_r($endpoints);',
        webhook_verify='$wh = new Webhook("whsec_xxx");\n$payload = $wh->verify($body, $headers);',
    ),
    "csharp": GENERIC_README.format(
        lang="C#", code_lang="csharp",
        install_cmd='dotnet add package HookSniff',
        quick_start='var client = new HookSniff("hs_xxx");\nvar endpoints = await client.Endpoint.ListAsync();\nConsole.WriteLine(endpoints);',
        webhook_verify='var wh = new Webhook("whsec_xxx");\nvar payload = wh.Verify(body, headers);',
    ),
    "elixir": GENERIC_README.format(
        lang="Elixir", code_lang="elixir",
        install_cmd='{ :hooksniff, "~> 1.0" }',
        quick_start='client = HookSniff.new("hs_xxx")\n{:ok, endpoints} = HookSniff.Endpoint.list(client)\nIO.inspect(endpoints)',
        webhook_verify='{:ok, payload} = HookSniff.Webhook.verify(body, headers, "whsec_xxx")',
    ),
    "swift": GENERIC_README.format(
        lang="Swift", code_lang="swift",
        install_cmd='.package(url: "https://github.com/servetarslan02/hooksniff-swift", from: "1.0.0")',
        quick_start='let client = HookSniff(apiKey: "hs_xxx")\nlet endpoints = try await client.endpoint.list()\nprint(endpoints)',
        webhook_verify='let wh = try Webhook(secret: "whsec_xxx")\nlet payload = try wh.verify(body: body, headers: headers)',
    ),
}

def generate_readme(lang: str):
    """Tek SDK için README üret."""
    if lang not in SDK_DOCS:
        print(f"❌ Desteklenmeyen dil: {lang}")
        return False

    sdk_path = SDK_DIR / lang
    if not sdk_path.exists():
        print(f"⚠️  SDK klasörü bulunamadı: {sdk_path}")
        return False

    readme_path = sdk_path / "README.md"
    readme_path.write_text(SDK_DOCS[lang])
    print(f"  ✅ {readme_path}")
    return True

def main():
    if len(sys.argv) < 2:
        print("Kullanım: python3 generate-docs.py [node|python|go|rust|ruby|java|kotlin|php|csharp|elixir|swift|all]")
        sys.exit(1)

    lang = sys.argv[1]

    if lang == "all":
        print("📝 README'ler üretiliyor...")
        for l in SDK_DOCS:
            generate_readme(l)
        print(f"\n✅ {len(SDK_DOCS)} SDK README'si üretildi!")
    else:
        if generate_readme(lang):
            print("✅ Tamamlandı!")

if __name__ == "__main__":
    main()
