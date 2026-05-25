# 2026-05-17 — Oturum 183

## Sorun
- Admin System sayfası API Server, Database, Cache "unknown" gösteriyordu
- `API error: 404` hatası alınıyordu
- Translation key'leri raw olarak görünüyordu (admin.noActiveAlerts, admin.queueStatus vb.)

## Tespit
- Edge proxy `/v1/health` isteğini Cloud Run API'ye forward ediyor
- API'de `/health` ve `/api/v1/health` vardı ama `/v1/health` yoktu → 404
- 35+ admin translation key'i hem en.json hem tr.json'da eksikti

## Yapılan
1. **`api/src/main.rs`** — `/v1/health` route eklendi (edge proxy uyumluluğu)
2. **`dashboard/src/messages/en.json`** — 35+ eksik admin translation key eklendi
3. **`dashboard/src/messages/tr.json`** — Aynı key'ler Türkçe olarak eklendi

## Commit
- `62f45e17` — fix: add /v1/health route for edge proxy health check
- `6441a2d4` — fix: add missing admin translation keys for system page

## Not
- Cloud Build deploy otomatik tetiklendi (push → build → deploy)
- Deploy süresi: ~6-8 dakika
