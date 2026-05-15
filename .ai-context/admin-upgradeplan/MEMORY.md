# 🧠 Admin Upgrade Plan — Hafıza

> Son güncelleme: 2026-05-15

---

## Ne Yaptık?

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
- `rate_limit_configs` var ama `rate_limit_violations` log tablosu yok
- `dead_letters` tablosu var ama admin panelinde görünmüyor
- `webhook_queue` tablosu var ama queue depth gösterilmiyor

### Tespit Edilen Kod Hataları
- Overview pie chart: Veri yoksa `pct: 60, 30, 10` hardcoded
- Trend negatif: `Math.abs(diff)` → yanıltıcı
- Profile dropdown: `group-hover` → mobilde çalışmıyor
- Quick Search: Sadece kullanıcı arıyor
- Currency: ₺ hardcoded

### Yapılan Düzeltmeler (ADMIN-PANEL-UPGRADE-PLAN.md)
- 4 commit, toplam ~500 satır ekleme
- 7 aşamalı uygulama planı oluşturuldu
- 24 yeni API endpoint tanımlandı
- 6 yeni DB tablosu migration'ı yazıldı
- Aşama sıralaması optimize edildi (bağımsız önce, Polar.sh bağımlı sonda)
- Her endpoint kontrol listesinde

---

## Karar Gereken Noktalar (Henüz Karar Verilmedi)

| # | Konu | Durum |
|---|------|-------|
| 1 | `api_keys` tablosu — inbound.rs'deki sorgu aktif mi? | ⏳ Kontrol edilecek |
| 2 | Refund provider — Polar.sh API mi, manuel mi? | ⏳ Karar verilecek |
| 3 | GDPR silme — hard delete mi, soft delete mi? | ⏳ Karar verilecek |
| 4 | Bulk email — anlık mı, kuyruk mu? | ⏳ Karar verilecek |
| 5 | Communication log — manuel mi, otomatik mi? | ⏳ Karar verilecek |
| 6 | Cohort analizi — tam mı, basit mi? | ⏳ Karar verilecek |

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
2. **deliveries tablosunda `event` yok** —doğrusu `event_type`.
3. **api_keys tablosu migration'da yok** ama `inbound.rs`'de aktif sorgu var — tutarsızlık.
4. **invoices/payment_transactions tabloları boş** — Polar.sh webhook handler gerekli.
5. **Admin paneli rakiplerden daha zengin** (36 müşteri sayfası vs Svix 10, Hookdeck 11) ama admin paneli zayıf.
6. **Mevcut endpoint sayısı**: 23 route → 28 HTTP endpoint (bazıları multi-method).
