# 🧠 Admin Upgrade Plan — Hafıza

> Son güncelleme: 2026-05-16 00:04 GMT+8

---

## Ne Yaptık?

### Aşama 0 — Veritabanı Hazırlığı (2026-05-16) ✅ TAMAMLANDI
- `api/migrations/019_admin_upgrade.sql` yazıldı (74 satır, 5 tablo, 11 index)
- Tablolar: refunds, customer_notes, customer_tags, communication_history, rate_limit_violations
- `cargo test` atlandı (makinada Rust kurulu değil, saf SQL migration)
- `next build` atlandı (node_modules yok)
- Git commit: `8a7d2ea0`

### Kapsamlı İnceleme (2026-05-15)
1. **Admin paneli** satır satır incelendi (7 sayfa, ~3200 satır frontend kodu)
2. **Admin API** incelendi (admin.rs — 2611 satır, 23 route, 28 HTTP endpoint)
3. **Müşteri paneli** incelendi (36+ sayfa, dashboard route group)
4. **Veritabanı şeması** incelendi (18 migration, 32 tablo)
5. **Rakip analizi** yapıldı (Svix, Hookdeck, Hook0, Convoy, Stripe, Retool)

### Tespit Edilen Eksikler
- Müşteri kaynaklarını görememe (endpoints, webhooks, API keys, applications)
- Global monitoring yok (failed deliveries, dead letters, queue depth, rate limit violations)
- Refund/iade yapılamıyor
- Müşteri notları/etiketleri/iletişim geçmişi yok
- Fatura/ödeme geçmişi görünmüyor (tablo var ama boş)
- ARPU, LTV, NRR metrikleri yok
- GDPR araçları yok
- Bulk email yok
- 5 mevcut bug düzeltilmemiş

### Tespit Edilen Veritabanı Tutarsızlıkları
- `api_keys` tablosu: `inbound.rs`'de sorgu var ama migration'da CREATE TABLE yok
- `invoices` / `payment_transactions`: Tablo var ama veri dolduran mekanizma yok
- `rate_limit_configs` var ama `rate_limit_violations` log tablosu yok → ✅ 019 ile çözüldü
- `dead_letters` tablosu var ama admin panelinde görünmüyor
- `webhook_queue` tablosu var ama queue depth gösterilmiyor

### Tespit Edilen Kod Hataları (ileride düzeltilecek)
- Overview pie chart: Veri yoksa hardcoded bar chart
- Profile dropdown: `group-hover` → mobilde çalışmıyor
- Quick Search: Sadece kullanıcı arıyor
- Currency: ₺ hardcoded

### Yapılan Düzeltmeler (ADMIN-PANEL-UPGRADE-PLAN.md)
- 7 aşamalı uygulama planı oluşturuldu
- 24 yeni API endpoint tanımlandı
- 6 yeni DB tablosu migration'ı tasarlandı (5 yazıldı, 1 zaten production'da)
- Aşama sıralaması optimize edildi

---

## Karar Verilen Noktalar

| # | Konu | Karar | Tarih |
|---|------|-------|-------|
| 1 | `api_keys` tablosu | Zaten production'da mevcut, migration eksik. Admin panelinde API key yönetimi gereksiz — müşteri kendi key'ini yönetiyor. | 2026-05-15 |

## Karar Gereken Noktalar (Henüz Karar Verilmedi)

| # | Konu | Ne Zaman |
|---|------|----------|
| 1 | Refund provider seçimi | Aşama 5'ten önce |
| 2 | GDPR silme stratejisi | Aşama 7'den önce |
| 3 | Bulk email kuyruk mu? | Aşama 7'den önce |
| 4 | Communication log mekanizması | Aşama 3'ten önce |
| 5 | Cohort analizi derinliği | Aşama 4'ten önce |

---

## Dosya Yapısı

```
.ai-context/admin-upgradeplan/
├── ADMIN-PANEL-UPGRADE-PLAN.md   ← Ana plan (884 satır)
├── MEMORY.md                      ← Bu dosya (hafıza)
└── NEXT_SESSION.md                ← Yapılan/yapılacaklar
```

---

## Öğrenilenler

1. **deliveries tablosunda `error_message` yok** — `delivery_attempts` tablosunda. Subquery ile çekmek gerekiyor.
2. **deliveries tablosunda `event` yok** — doğrusu `event_type`.
3. **api_keys tablosu migration'da yok** ama `inbound.rs`'de aktif sorgu var — tutarsızlık.
4. **invoices/payment_transactions tabloları boş** — Polar.sh webhook handler gerekli.
5. **Admin paneli rakiplerden daha zengin** (36 müşteri sayfası vs Svix 10, Hookdeck 11) ama admin paneli zayıf.
6. **Mevcut endpoint sayısı**: 23 route → 28 HTTP endpoint (bazıları multi-method).
7. **Bu ortamda Rust/Cargo kurulu değil** — cargo test çalıştırılamıyor. Saf SQL migration'lar için sorun yok ama Rust değişiklikleri için gerekli.

---

## Aşama İlerleme

| Aşama | İçerik | Durum | Tarih |
|-------|--------|-------|-------|
| 0 | DB migration (5 tablo) | ✅ TAMAMLANDI | 2026-05-16 |
| 1 | Kullanıcı kaynakları + test-webhook + replay | ⏳ Sıradaki | |
| 2 | Sistem geneli (failed, dead letters, queue, latency) | ⏳ | |
| 3 | Müşteri notları, etiketler, iletişim geçmişi | ⏳ | |
| 4 | Fatura, ödeme, gelir metrikleri | ⏳ | |
| 5 | Refund + Polar.sh webhook handler | ⏳ | |
| 6 | Alerts sayfası | ⏳ | |
| 7 | Bulk email + GDPR | ⏳ İleride | |
