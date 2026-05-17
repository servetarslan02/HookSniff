# 2026-05-18 — Public Pages Audit & Fix

## Yapılan Düzeltmeler

### Doğrulanmamış Rakamlar Düzeltildi
- **Uptime:** 99.97% ve 99.99% iddiaları kaldırıldı, SLA-backed 99.9% kullanıldı
- Landing page hero: "99.99% delivery uptime" → "99.9% SLA guaranteed"
- About page stats: "99.97%" → "99.9%" + "30+ API Routes" eklendi
- Customers page: 2 metric düzeltildi
- Use-cases page: düzeltildi
- Blog post: düzeltildi

### Implemente Edilmemiş Özellikler Düzeltildi
- **gRPC/SQS delivery:** Pricing comparison tablosunda "HTTP, WebSocket" olarak düzeltildi
- **IP Whitelisting:** "Coming Soon" olarak işaretlendi (security sayfası + pricing)
- SSO zaten implemente edilmiş (sso.rs mevcut) — doğru

### SDK ve Plan Tutarsızlıkları
- **SDK sayısı:** Pricing free tier'da "8 SDK" → "11 SDK"
- **Developer plan limiti:** "10,000 webhooks/month" → "100 events/day" (comparison table ile uyumlu)
- **Svix SDK sayısı:** Alternatives sayfasında "11" → "6" (doğru rakam)
- **i18n diller:** "8-language" → "2-language" (sadece en, tr)

### Eksik Bilgiler
- Convoy comparison sayfasına fiyat bilgisi eklendi

## Değiştirilen Dosyalar (11)
1. `dashboard/src/messages/en.json` — i18n düzeltmeleri
2. `dashboard/src/messages/tr.json` — i18n düzeltmeleri
3. `dashboard/src/app/[locale]/content.tsx` — landing page success rate
4. `dashboard/src/app/[locale]/about/content.tsx` — stats düzeltmesi
5. `dashboard/src/app/[locale]/pricing/content.tsx` — delivery methods + IP whitelisting
6. `dashboard/src/app/[locale]/alternatives/svix/page.tsx` — delivery methods + i18n
7. `dashboard/src/app/[locale]/alternatives/svix-alternatives/page.tsx` — i18n + Svix SDKs
8. `dashboard/src/app/[locale]/alternatives/convoy/page.tsx` — fiyat bilgisi eklendi
9. `dashboard/src/app/[locale]/customers/content.tsx` — metric düzeltmesi
10. `dashboard/src/app/[locale]/use-cases/content.tsx` — delivery rate düzeltmesi
11. `dashboard/src/app/[locale]/blog/[slug]/posts/customer-spotlight-ecommerce.ts` — delivery rate

## Gerçekleştirilen Özellikler (Doğrulandı)
- ✅ SSO/SAML (sso.rs)
- ✅ FIFO (fifo/mod.rs)
- ✅ Schema Registry (schemas/registry.rs)
- ✅ CloudEvents (events/cloudevents.rs)
- ✅ WebSocket (ws.rs)
- ✅ Circuit Breaker (circuit_breaker.rs)
- ✅ Throttling (throttle/mod.rs)
- ✅ 11 SDK (node, python, go, rust, ruby, java, kotlin, php, csharp, elixir, swift)

## Henüz Implemente Edilmemiş
- ❌ gRPC delivery
- ❌ SQS delivery
- ❌ IP Whitelisting

## İkinci Tur Düzeltmeler (FAQ, Terms, Newsletter, Docs)

### FAQ Düzeltmeleri
- Ücretsiz plan limiti: "10,000/month" → "100 events/day"
- Rekabetçi dil yumuşatıldı: "competitors can't match" → "developer-friendly with transparent pricing"
- Ödeme yöntemleri: yıllık faturalandırma eklendi
- SLA: "99.9% uptime" olarak düzeltildi
- Aşım davranışı: daha doğru açıklandı

### Terms Düzeltmeleri
- Yıllık faturalandırma seçeneği eklendi (%20 indirim)

### Newsletter Düzeltmeleri
- Sahte sosyal kanıt kaldırıldı (500+ abone, 48% açık oranı)
- Sahte testimonial'lar kaldırıldı
- Geçmiş sayılar "Coming soon" olarak işaretlendi (newsletter yeni)
- "What to expect" bölümü eklendi

### Docs Düzeltmeleri
- Rate limits tablosu: doğru fiyatlar ($29/$49/Custom) ve limitler (günlük)
- DLQ sayfası: doğru fiyatlar ve limitler
- Architecture sayfası: implemente edilmemiş gRPC/SQS kaldırıldı
- Security docs: IP whitelisting → SSRF protection
- Get-started: api.hooksniff.dev → gerçek API URL
- Overage pricing düzeltildi

### Potansiyel Sorunlar (Servet'e sorulacak)
- `enterprise@hooksniff.dev` email adresi tanımlı mı?
- `portal.hooksniff.dev` domain'i tanımlı mı?
- `hooksniff.dev` domain'i aktif mi?
