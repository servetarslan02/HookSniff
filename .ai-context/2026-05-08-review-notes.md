# Kod İnceleme Notları — 2026-05-08 21:45

## İncelenen Commit'ler
- `89bb500` — orta risk düzeltmeleri
- `fd18a37` — düşük risk düzeltmeleri

## Düzeltilen Sorun
- `.env.production.example`: `WEBHOOK_FORMAT=json` → `WEBHOOK_FORMAT=standard` (config.rs ile uyumlu hale getirildi)

## ⚠️ Yeni Oturumda Kontrol Edilecek

### tsconfig.json — noUnusedLocals / noUnusedParameters
`dashboard/tsconfig.json`'a şu iki satır eklendi:
```json
"noUnusedLocals": true,
"noUnusedParameters": true,
```

Bu kurallar unused variable/parametre'leri error'a çevirir. Mevcut kodda unused değişken varsa CI build fail olur.

Kontrol etmek için:
```bash
cd dashboard && npm install && npx tsc --noEmit
```

Eğer hata çıkarsa, her unused değişkeni düzelt ya da _ prefix ile isimlendir.

### stripe.rs — Hardcoded WEBHOOK_TIMESTAMP_TOLERANCE_SECS
`api/src/billing/stripe.rs` satır 22'de hardcoded const var:
```rust
const WEBHOOK_TIMESTAMP_TOLERANCE_SECS: i64 = 300;
```

config.rs'de bu değer env var'dan okunuyor ama stripe.rs config'i kullanmıyor. Gelecekte env var değiştirilse bile Stripe tarafı etkilenmez. Düşük öncelik ama düzeltilmeli.

## Tüm Değişikliklerin Durumu

| # | Değişiklik | Durum |
|---|---|---|
| 1 | handler.rs dead_code | ✅ |
| 2 | .env.production.example | ✅ düzeltildi |
| 3 | customer_portal.rs TODO→FIXME | ✅ |
| 4 | settings/page.tsx TODO→FIXME | ✅ |
| 5 | dependabot.yml | ✅ |
| 6 | ci.yml security-audit | ✅ |
| 7 | SDK versiyon reset (0.1.0) | ✅ |
| 8 | Go 1.21→1.22 | ✅ |
| 9 | Gson 2.10.1→2.11.0 | ✅ |
| 10 | tsconfig strict | ⚠️ kontrol et |
| 11 | Dashboard license: MIT | ✅ |
| 12 | migrations README | ✅ |
