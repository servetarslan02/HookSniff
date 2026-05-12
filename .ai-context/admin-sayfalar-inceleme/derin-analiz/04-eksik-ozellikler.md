# 🔧 Mevcut Sayfalarda Eksik Özellikler

> Tarih: 2026-05-13
> Kaynak: Sayfa bileşenleri + backend endpoint'leri karşılaştırması

---

## 1. Endpoint Detay — Düzenleme Yok

**Sayfa:** `dashboard/src/app/[locale]/(dashboard)/endpoints/[id]/page.tsx`

**Backend:**
```rust
// api/src/routes/endpoints.rs
.route("/{id}", put(update_endpoint))  // ← Güncelleme endpoint'i var
```

**Frontend:** Sadece okuma modu. `endpointsApi.get()` çağrılıyor ama `endpointsApi.update()` çağrılmıyor.

**Eksik:**
- URL düzenleme
- Açıklama düzenleme
- Aktif/pasif toggle
- Secret rotasyonu (backend'de `/{id}/rotate-secret` var)

---

## 2. Deliveries — Export ve Batch Replay Yok

**Sayfa:** `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`

**Backend:**
```rust
// api/src/routes/webhooks.rs
.route("/export", get(export_deliveries))      // ← Export endpoint'i var
.route("/batch/replay", post(batch_replay))    // ← Batch replay endpoint'i var
```

**Frontend:** Export butonu yok, batch replay butonu yok.

**Eksik:**
- "Dışa Aktar" butonu (CSV/JSON seçeneği ile)
- Checkbox seçimi + "Seçilenleri Tekrar Gönder" butonu
- Tarih aralığı filtresi (export için)

---

## 3. Health — Circuit Breaker Durumu Yok

**Sayfa:** `dashboard/src/app/[locale]/(dashboard)/health/page.tsx`

**Backend:**
```rust
// api/src/circuit_breaker.rs
pub enum CircuitState {
    Closed,      // Normal çalışma
    Open,        // Devre açık, istekler reddediliyor
    HalfOpen,    // Test modu, bir istek geçiyor
}
```

**Frontend:** `grep -n 'circuit\|breaker' health/page.tsx` → Sonuç yok.

**Eksik:**
- Her endpoint kartında circuit breaker durumu göstergesi (Closed/Open/HalfOpen)
- Circuit breaker geçmiş grafiği
- Manuel reset butonu

---

## 4. Alerts — Düzenleme ve Pause/Resume Yok

**Sayfa:** `dashboard/src/app/[locale]/(dashboard)/alerts/page.tsx`

**Backend:**
```rust
// api/src/routes/alerts.rs
.route("/{id}", put(update_alert).delete(delete_alert))  // ← Güncelleme var
```

**Frontend:** Sadece `alertsApi.create()`, `alertsApi.delete()`, `alertsApi.test()` kullanılıyor. `alertsApi.update()` çağrılmıyor.

**Eksik:**
- "Düzenle" butonu (mevcut alert'i güncelleme)
- Pause/Resume toggle (is_active değiştirme)
- Alert tetiklenme geçmişi
- Endpoint bazlı alert

---

## 5. Schemas — Oluşturma, Silme, Doğrulama Yok

**Sayfa:** `dashboard/src/app/[locale]/(dashboard)/schemas/page.tsx`

**Backend:**
```rust
// api/src/routes/schemas.rs
.route("/", get(list_schemas).post(register_schema))        // ← Oluşturma var
.route("/{id}", get(get_schema))                            // ← Silme endpoint'i yok!
.route("/{id}/validate", post(validate_event))              // ← Doğrulama var
```

**Frontend:** Sadece `apiFetch('/schemas')` ile listeleme.

**Eksik:**
- Schema oluşturma formu (name, version, JSON Schema textarea)
- Schema silme (backend'de de yok — eklenmeli)
- Event doğrulama aracı (backend'de var — UI eklenmeli)

---

## 6. Templates — "Kullan" Butonu Yok

**Sayfa:** `dashboard/src/app/[locale]/(dashboard)/templates/page.tsx`

**Backend:**
```rust
// api/src/routes/templates.rs
.route("/{id}", get(get_template))
.route("/{id}/apply", post(apply_template))    // ← Uygulama endpoint'i var
```

**Frontend:** Sadece listeleme. "Kullan" butonu yok.

**Eksik:**
- Template kartına "Kullan" butonu
- Endpoint seçici modal
- `apply_template` çağrısı

---

## 7. Routing — Düzenleme Yok

**Sayfa:** `dashboard/src/app/[locale]/(dashboard)/routing/page.tsx`

**Backend:**
```rust
// api/src/routes/routing.rs
.route("/{id}/routing", get(get_routing).put(update_routing))  // ← Güncelleme var
```

**Frontend:** Sadece okuma. Düzenleme formu yok.

**Eksik:**
- Routing strategy değiştirme
- Fallback URL ekleme/düzenleme
- Health check ayarları

---

## 8. Rate Limiting — Ayarlama Formu Yok

**Sayfa:** `dashboard/src/app/[locale]/(dashboard)/rate-limiting/page.tsx`

**Backend:**
```rust
// api/src/routes/rate_limits.rs
.route("/{endpoint_id}", post(set_rate_limit))     // ← Ayarlama var
.route("/{endpoint_id}", delete(delete_rate_limit)) // ← Silme var
```

**Frontend:** Sadece okuma. Ayarlama formu yok.

**Eksik:**
- "Limit Ayarla" butonu + form (requests_per_second, burst_size)
- Endpoint bazlı limit düzenleme
- Limit silme butonu

---

## 9. Inbound — Silme ve Düzenleme Yok

**Sayfa:** `dashboard/src/app/[locale]/(dashboard)/inbound/page.tsx`

**Backend:** Silme ve düzenleme endpoint'leri yok (sadece `POST /{provider}`).

**Frontend:** `inboundApi.createConfig()` ve `inboundApi.listConfigs()` var ama silme/düzenleme yok.

**Eksik:**
- Backend'e `DELETE /v1/inbound/configs/{id}` eklenmeli
- Backend'e `PUT /v1/inbound/configs/{id}` eklenmeli
- Frontend'e silme ve düzenleme butonları eklenmeli

---

## 10. Transforms — Düzenleme ve Sıralama Yok

**Sayfa:** `dashboard/src/app/[locale]/(dashboard)/transforms/page.tsx`

**Backend:** Güncelleme ve sıralama endpoint'leri yok.

**Frontend:** `transformsApi.create()` ve `transformsApi.delete()` var ama güncelleme yok.

**Eksik:**
- Backend'e `PUT /v1/endpoints/{id}/transforms/{rule_id}` eklenmeli
- Backend'e `PUT /v1/endpoints/{id}/transforms/reorder` eklenmeli
- Frontend'e düzenleme formu ve sürükle-bırak eklenecek

---

## 11. Notifications — Okundu İşaretlenemiyor

**Sayfa:** `dashboard/src/app/[locale]/(dashboard)/notifications/page.tsx`

**Backend:**
```rust
// api/src/routes/notifications.rs
.route("/{id}/read", put(mark_as_read))
.route("/read-all", put(mark_all_as_read))
```

**Frontend:** `notificationsApi.markAsRead()` ve `notificationsApi.markAllAsRead()` api.ts'de tanımlı ama sayfada kullanılıyor mu kontrol edilmeli.

---

## 12. Billing — Ödeme Yöntemi Yönetimi Yok

**Sayfa:** `dashboard/src/app/[locale]/(dashboard)/billing/page.tsx`

**Backend:** `billing.rs`'de ödeme yöntemi endpoint'leri var.

**Frontend:** Plan karşılaştırma ve yükseltme var ama ödeme yöntemi ekleme/düzenleme yok.

---

## 📋 Özet Tablo

| # | Sayfa | Eksik Özellik | Backend Endpoint | Öncelik |
|---|-------|---------------|------------------|---------|
| 1 | Endpoint Detay | Düzenleme | `PUT /endpoints/{id}` | 🔴 KRİTİK |
| 2 | Deliveries | Export | `GET /webhooks/export` | 🔴 KRİTİK |
| 3 | Deliveries | Batch Replay | `POST /webhooks/batch/replay` | 🟡 YÜKSEK |
| 4 | Health | Circuit Breaker | `circuit_breaker.rs` | 🟡 YÜKSEK |
| 5 | Alerts | Düzenleme | `PUT /alerts/{id}` | 🟡 YÜKSEK |
| 6 | Schemas | Oluşturma | `POST /schemas` | 🟡 YÜKSEK |
| 7 | Templates | Kullan | `POST /templates/{id}/apply` | 🟡 YÜKSEK |
| 8 | Routing | Düzenleme | `PUT /endpoints/{id}/routing` | 🟡 YÜKSEK |
| 9 | Rate Limiting | Ayarlama | `POST /rate-limits/{id}` | 🟡 YÜKSEK |
| 10 | Inbound | Silme/Düzenleme | — (backend'e eklenmeli) | 🟢 ORTA |
| 11 | Transforms | Düzenleme/Sıralama | — (backend'e eklenmeli) | 🟢 ORTA |
| 12 | Billing | Ödeme Yöntemi | `billing.rs` | 🟢 ORTA |
