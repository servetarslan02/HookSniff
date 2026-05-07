# NEXT_SESSION.md — Sonraki Oturum

> 2026-05-08 06:25

## Yeni Oturumda Ne Söyle

Şunu de:

> "MVP'yi satılabilir hale getir. MVP.md dosyasındaki 13 maddeyi tamamla. TODO.md'deki büyük işlere (inbound proxy, transformations, Terraform, bulk ops, websocket, tests) şimdilik dokunma. Sadece MVP'yi bitir. Kod tabanını incele, hangi dosyaları değiştireceğini bul, sırayla yap."

## MVP Dosyaları
- `MVP.md` — ne yapılacağı, süre tahminleri
- `TODO.md` — tüm yapılacaklar (MVP + sonrası)
- `FEATURES.md` — feature tracker

## Sıralama (Öneri)
1. Free tier limit artır (1 dakika)
2. Standard Webhooks header'ları (signing.rs)
3. UI'ları tamamla (playground, delivery details, retry policy, signature rotation, rate limit, self-service)
4. Event hierarchy filtering kontrol
5. Timestamp tolerans docs
6. Test et (alerting, health, grafana)

## Dosya Referansları
- Signing: `worker/src/signing.rs`
- Retry policy: `api/src/routes/endpoints.rs` (retry_policy JSONB)
- Playground: `api/src/routes/playground.rs` + dashboard frontend
- Delivery details: `api/src/routes/delivery_details.rs` + dashboard frontend
- Rate limit: `api/src/throttle/mod.rs`
- Customer portal: `api/src/routes/customer_portal.rs`
- Dashboard sayfaları: `dashboard/src/app/[locale]/dashboard/`

## Bloklar (Kullanıcı yapacak)
- Render Docker build düzelt
- Resend domain doğrulama
- Domain kararı
- iyzico hesap
