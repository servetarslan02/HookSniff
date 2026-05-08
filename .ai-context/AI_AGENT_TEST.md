# 🧪 AI Agent Test Senaryoları

## Test 1: Agent Oluştur
```bash
# JWT token al (login)
TOKEN=$(curl -s -X POST https://API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' | jq -r '.token')

# Agent oluştur
curl -X POST https://API_URL/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Agent", "description": "Test agent"}'
```

## Test 2: Event Gönder
```bash
AGENT_KEY="pub_agent_xxxx"  # Agent oluşturmadan gelen key

curl -X POST https://API_URL/agents/{agent_id}/emit \
  -H "X-Agent-Key: $AGENT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "test.event", "payload": {"data": "test"}}'
```

## Test 3: Routing
```bash
# 2 agent oluştur
# 1. agent'a routing kuralı ekle: "test.event" → 2. agent
# 1. agent'tan event gönder
# 2. agent'ın event geçmişini kontrol et
```

## Test 4: Rate Limit
```bash
# 61 event gönder (dakikada 60 limit)
# 61. event 429 dönmeli
for i in $(seq 1 61); do
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST https://API_URL/agents/{agent_id}/emit \
    -H "X-Agent-Key: $AGENT_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"event_type\": \"test.$i\", \"payload\": {}}"
  echo ""
done
```

## Test 5: Validation
```bash
# Boş ad → 400
curl -X POST https://API_URL/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'

# Geçersiz event type → 400
curl -X POST https://API_URL/agents/{agent_id}/emit \
  -H "X-Agent-Key: $AGENT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "invalid!@#", "payload": {}}'

# Büyük payload → 400
curl -X POST https://API_URL/agents/{agent_id}/emit \
  -H "X-Agent-Key: $AGENT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "test", "payload": "VERY_LONG_STRING"}'
```

## Test 6: Anomaly Detection
```bash
# Normal trafik → healthy: true
curl https://API_URL/agents/{agent_id}/anomaly \
  -H "Authorization: Bearer $TOKEN"

# 100+ event gönder → warning çıkmalı
```

## Test 7: Audit Log
```bash
# Agent oluştur, event gönder, sil
# Audit log'u kontrol et
curl https://API_URL/agents/audit \
  -H "Authorization: Bearer $TOKEN"
```

## Beklenen Sonuçlar

| Test | Beklenen | Durum |
|------|----------|-------|
| Agent oluştur | 201 + agent_key | ⏳ |
| Event gönder | 200 + event_id | ⏳ |
| Routing | 200 + delivered_to | ⏳ |
| Rate limit | 429 (61. event) | ⏳ |
| Validation | 400 (boş ad) | ⏳ |
| Anomaly | warnings array | ⏳ |
| Audit log | log entries | ⏳ |
