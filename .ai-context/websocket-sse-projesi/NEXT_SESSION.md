# 📋 Sonraki Oturum Rehberi — WebSocket/SSE

> **Son güncelleme:** 2026-05-26

## 🚀 Hızlı Başlangıç

```bash
cd /root/.openclaw/workspace/HookSniff && git pull origin main
cat .ai-context/websocket-sse-projesi/NEXT_SESSION.md
cat .ai-context/websocket-sse-projesi/UYGULAMA-PLANI.md
```

## 📍 Sıradaki Adım: FAZ 1 — SSE Optimizasyonu

| # | Adım | Dosya | Açıklama |
|---|------|-------|----------|
| 1 | EventBus | `events/bus.rs` | YENİ — broadcast channel |
| 2 | DeliveryEvent | `events/bus.rs` | YENİ — event struct |
| 3 | SSE handler | `routes/stream/handlers.rs` | Polling → event-driven |
| 4 | Worker event publish | `worker/src/main.rs` | Teslimat sonrası event yayınla |
| 5 | Keep-alive | `routes/stream/handlers.rs` | 30s ping |
| 6 | Test | — | Gecikme < 100ms |
