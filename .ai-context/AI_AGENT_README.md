# 🤖 HookSniff AI Agent Katmanı

> Agent'lar arası event iletişimi sistemi

## Ne Bu?

HookSniff AI Agent sistemi, yapay zeka agent'larının birbirine event göndermesini sağlar.

```
Agent A → "siparis.geldi" event gönderir
         ↓
    HookSniff sistemi
         ↓
Agent B → "siparis.geldi" eventi alır, stok günceller
```

## Nasıl Çalışır?

### 1. Agent Oluştur
```bash
curl -X POST https://API_URL/agents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Siparis Agent", "description": "Siparis eventlerini dinler"}'
```

Response:
```json
{
  "agent": {
    "id": "uuid",
    "name": "Siparis Agent",
    "agent_key": "pub_agent_abc123..."
  },
  "message": "Agent created. Save the agent_key — it won't be shown again."
}
```

### 2. Event Gönder (emit)
```bash
curl -X POST https://API_URL/agents/{agent_id}/emit \
  -H "X-Agent-Key: pub_agent_abc123..." \
  -H "Content-Type: application/json" \
  -d '{"event_type": "siparis.geldi", "payload": {"urun": "Laptop", "adet": 1}}'
```

### 3. Routing Kuralı Oluştur
Bir event geldiğinde başka agent'a yönlendir:
```bash
curl -X POST https://API_URL/agents/routes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "siparis.geldi", "target_agent_id": "other_agent_uuid"}'
```

### 4. Event Geçmişini Gör
```bash
curl https://API_URL/agents/{agent_id}/events \
  -H "X-Agent-Key: pub_agent_abc123..."
```

### 5. Anomaly Kontrolü
```bash
curl https://API_URL/agents/{agent_id}/anomaly \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## SDK Kullanımı

### Node.js
```javascript
const { HookSniffAgent } = require('@hooksniff/agent-sdk');

const agent = new HookSniffAgent({
  agentKey: 'pub_agent_abc123...',
  baseUrl: 'https://API_URL'
});

// Event dinle
agent.on('siparis.geldi', (event) => {
  console.log('Yeni siparis:', event.payload);
});

// Event gönder
await agent.emit('stok.guncellendi', { urun: 'Laptop', yeni_adet: 49 });

// Bağlan (real-time)
await agent.connect();
```

### Python
```python
from hooksniff_agent import HookSniffAgent

agent = HookSniffAgent(
    agent_key="pub_agent_abc123...",
    base_url="https://API_URL"
)

# Event dinle
@agent.on("siparis.geldi")
def handle_order(event):
    print(f"Yeni siparis: {event.payload}")

# Event gönder
agent.emit("stok.guncellendi", {"urun": "Laptop", "yeni_adet": 49})

# Bağlan (real-time)
agent.connect()
```

## API Endpoint'leri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /agents | Tüm agent'ları listele |
| POST | /agents | Yeni agent oluştur |
| GET | /agents/{id} | Agent detayı |
| PUT | /agents/{id} | Agent güncelle |
| DELETE | /agents/{id} | Agent sil |
| POST | /agents/{id}/emit | Event gönder |
| GET | /agents/{id}/events | Event geçmişi |
| GET | /agents/{id}/anomaly | Anomaly kontrolü |
| GET | /agents/{id}/rate-limit | Rate limit durumu |
| PUT | /agents/{id}/rate-limit | Rate limit güncelle |
| GET | /agents/routes | Routing kuralları |
| POST | /agents/routes | Routing kuralı oluştur |
| DELETE | /agents/routes/{id} | Routing kuralı sil |
| GET | /agents/audit | Audit log |

## Auth

İki tür auth:
1. **JWT Token** — Dashboard için (`Authorization: Bearer eyJ...`)
2. **Agent Key** — SDK için (`X-Agent-Key: pub_agent_...`)

## Rate Limit

Varsayılan limitler:
- Dakikada: 60 event
- Saatte: 1000 event

Dashboard'dan değiştirilebilir.

## Güvenlik

- Agent key'ler Argon2id ile hashlenir
- Audit log tüm aksiyonları kaydeder
- Anomaly detection anormal trafik tespit eder
- Rate limit spam önler

## Dosya Yapısı

```
api/src/agents/
├── mod.rs          — Modül yapısı
├── models.rs       — Veri modelleri (Agent, Event, Route, RateLimit)
├── routes.rs       — API endpoint'leri (14 endpoint)
├── auth.rs         — Agent key doğrulama
├── security.rs     — Audit log + anomaly detection
├── validation.rs   — Input validation
└── event_bridge.rs — SSE entegrasyonu

sdks/agent-node/    — Node.js/TypeScript SDK
sdks/agent-python/  — Python SDK
```
