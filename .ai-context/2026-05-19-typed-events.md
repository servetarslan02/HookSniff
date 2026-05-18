# 2026-05-19 — Typed Webhook Events

## Oturum — 03:38-03:55 GMT+8

### Katılanlar
- Servet Arslan (proje sahibi)
- AI Asistan (OpenClaw — webchat)

### Yapılan İşler

**Typed Webhook Events (#10) — TÜM SDK'LAR**

11 SDK'ya compile-time type güvenliği eklendi:

| SDK | Commit | Yöntem |
|-----|--------|--------|
| Node.js | (zaten vardı) | WebhookEventMap + generic verify |
| Python | 6045239 | dataclass + typed subclass |
| Go | 4649fca | generic parseEventData[T] |
| Rust | 685f427 | TypedWebhookEvent enum + serde |
| Ruby | d3a8770 | typed data class + subclass |
| Java | abb3f6b | Jackson annotated classes |
| Kotlin | 5f5358d | extension functions |
| PHP | 4d0ed86 | WebhookEvents namespace |
| C# | f95dcb0 | JsonPropertyName classes |
| Elixir | c92f2df | struct + parse functions |
| Swift | ca66fe0 | struct + parse methods |

### Typed Event Yapısı (Tüm SDK'lar)

Her SDK'da 8 event type + data class:
- endpoint.created → EndpointCreatedData
- endpoint.updated → EndpointUpdatedData
- endpoint.deleted → EndpointDeletedData
- endpoint.enabled → EndpointEnabledData
- endpoint.disabled → EndpointDisabledData (failSince, trigger)
- message.attempt.exhausted → MessageAttemptExhaustedData (lastAttempt)
- message.attempt.failing → MessageAttemptFailingData (attempt)
- message.attempt.recovered → MessageAttemptRecoveredData (attempt)

### Kalite Skoru
- Önceki: %92
- Yeni: %95

### Sıradaki
- #11 SDK Version Header (1 saat)
- #12 Test Coverage (12-16 saat)
- #13 CI/CD Otomatik Publish (3-4 saat)
