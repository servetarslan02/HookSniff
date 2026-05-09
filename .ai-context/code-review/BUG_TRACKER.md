# 🔴 HookSniff — Hata Takip Listesi

> Oluşturulma: 2026-05-10
> Güncelleme: Kod inceleme sonrası
> Durum: Yayına hazırlanıyor

---

## 🔴 KRİTİK — Yayından Önce Zorunlu

### BUG-001: Fiyat Tutarsızlığı ($49/$149 → $29/$99)
- **Dosya**: `api/src/billing/mod.rs` satır ~85
- **Ayrıca**: `api/src/routes/admin.rs` revenue query'si
- **Ayrıca**: `dashboard/src/app/[locale]/dashboard/billing/page.tsx` — `price: 49`, `price: 149` hardcoded
- **Sorun**: Kodda Pro=$49, Business=$149 tanımlı ama fiyat $29/$99 olmalı
- **Etki**: Stripe/Polar/iyzico'da yanlış fiyat gösterilir, müşteriler yanlış ücretlendirilir
- **Fix**: `monthly_price_cents()` fonksiyonunda `2900` ve `9900` yap. Admin revenue query'sindeki CASE ifadelerini güncelle.
- **Durum**: ❌ Düzeltilmedi

### BUG-002: OTEL Config'de Grafana Token Hardcoded
- **Dosya**: `monitoring/otel-collector-config.yml`
- **Sorun**: Grafana Cloud authorization header base64 encoded olarak config dosyasında. GitHub repo public ise token sızıntıda.
- **Etki**: Grafana Cloud credentials çalınabilir
- **Fix**: Environment variable kullan `${GRAFANA_CLOUD_TOKEN}`
- **Durum**: ❌ Düzeltilmedi

### BUG-003: GDPR delete_account Eksik Tablo Silme
- **Dosya**: `api/src/routes/auth.rs` — `delete_account()` fonksiyonu
- **Sorun**: Hesap silme işleminde şu tablolar atlanıyor:
  - `alert_rules`
  - `ai_agent_configs`
  - `installed_agents`
  - `team_members` / `team_invites`
  - `notification_preferences`
  - `inbound_configs`
  - `event_schemas`
  - `transform_rules`
  - `retry_policies`
  - `fifo_queue`
  - `fanout_rules`
  - `delivery_targets`
- **Etki**: GDPR Article 17 uyumsuzluğu, kullanıcı verileri kalır
- **Fix**: Transaction'a bu tabloları da ekle
- **Durum**: ❌ Düzeltilmedi

### BUG-004: Config Debug'da Secret Sızıntısı
- **Dosya**: `api/src/config.rs`
- **Sorun**: `#[derive(Debug)]` ile `hmac_secret`, `jwt_secret`, `stripe_secret_key` gibi tüm secret'lar log'a yazılabilir
- **Etki**: Panic anında veya error log'larında secret'lar görünür
- **Fix**: Manual `Debug` impl yaz, secret'ları `[REDACTED}` olarak göster
- **Durum**: ❌ Düzeltilmedi

### BUG-005: Fanout Feature İşlevsiz
- **Dosya**: `worker/src/fanout.rs` — `deliver_to_target()` fonksiyonu
- **Sorun**: Target config yükleniyor ama kullanılmıyor. `delivery_router.deliver(webhook)` çağrıldığında router kendi target'larını yükler, fanout target'ı hiç kullanılmaz
- **Etki**: Fanout routing hiç çalışmaz, her zaman default HTTP delivery yapılır
- **Fix**: Target config ile uygun delivery method'u çağır
- **Durum**: ❌ Düzeltilmedi

### BUG-006: Portal API Key URL'de Görünüyor
- **Dosya**: `portal/embed.js`
- **Sorun**: `iframe.src = widgetUrl + "?api_key=" + encodeURIComponent(API_KEY);`
- **Etki**: API key browser history, server logs, referrer header'da görünür
- **Fix**: API key'i postMessage ile iframe'e geçir
- **Durum**: ❌ Düzeltilmedi

### BUG-007: "hookrelay" Artıkları
- **Dosyalar**:
  - `scripts/backup.sh`: `DB_NAME="${DB_NAME:-hookrelay}"`
  - `cli/index.js`: `process.env.HOOKRELAY_API_URL`, `process.env.HOOKRELAY_API_KEY`, `process.env.HOOKRELAY_TOKEN`
  - `sdks/python/hooksniff/utils.py`: Docstring'te `X-Hookrelay-Signature`
  - `sdks/python/hooksniff/verify.py`: `X-Hookrelay-Signature` header lookup
  - `sdks/go/hooksniff.go`: `X-Hookrelay-Signature` header lookup
- `deploy/oracle-cloud-setup.sh`: Script header "HookRelay" olarak kalmış
- `deploy/gcp-deploy.ps1`: Script header "HookRelay" olarak kalmış
- **Etki**: Eski isim kalıntısı, production'da hata oluşturabilir
- **Fix**: "hookrelay" → "hooksniff" olarak değiştir
- **Durum**: ❌ Düzeltilmedi

---

## 🟡 ORTA SEVİYE — Yayına Yakın

### BUG-008: Batch Webhook Race Condition
- **Dosya**: `api/src/routes/webhooks.rs` — `batch_webhooks()`
- **Sorun**: Queue'ya publish hatası delivery'yi "stuck pending" bırakır. webhook_count artırıldı ama hata durumunda geri alınmıyor
- **Fix**: Queue publish hatası delivery status'unu "failed" yap veya transaction kullan
- **Durum**: ❌ Düzeltilmedi

### BUG-009: Auth Middleware — Her İstekte 2 DB Sorgusu
- **Dosya**: `api/src/middleware/mod.rs`
- **Sorun**: Her API isteğinde 2 ayrı DB sorgusu (customers + api_keys tablosu)
- **Fix**: Redis'te api_key_prefix → customer_id cache
- **Durum**: ❌ Düzeltilmedi

### BUG-010: Worker Batch Processing Paralel Değil
- **Dosya**: `worker/src/main.rs`
- **Sorun**: 50 item sırayla işleniyor. Yavaş endpoint tüm batch'i bloklar
- **Fix**: `futures::stream::buffer_unordered(10)` ile paralel processing
- **Durum**: ❌ Düzeltilmedi

### BUG-011: Response Header Sızıntısı
- **Dosya**: `worker/src/delivery/http.rs`
- **Sorun**: Tüm response header'ları (Set-Cookie, Authorization dahil) delivery_attempts tablosuna kaydediliyor
- **Fix**: Header allowlist kullan
- **Durum**: ❌ Düzeltilmedi

### BUG-012: Dashboard Token Refresh Yok
- **Dosya**: `dashboard/src/lib/api.ts`
- **Sorun**: 401 hatasında otomatik refresh yok, kullanıcı login'e atılıyor
- **Fix**: 401'de otomatik `/auth/refresh` dene
- **Durum**: ❌ Düzeltilmedi

### BUG-013: Hardcoded GCP Cloud Run URL — Tüm SDK'lar
- **Dosyalar**: Tüm 11 SDK'da `https://hooksniff-api-1046140057667.europe-west1.run.app/v1`
- **Fix**: `https://api.hooksniff.com/v1` domain kullan
- **Durum**: ❌ Düzeltilmedi

### BUG-014: Body Hash — Weak Hash Function
- **Dosya**: `api/src/middleware/idempotency.rs`
- **Sorun**: `DefaultHasher` collision'a açık. Platform-dependent sonuç
- **Fix**: SHA-256 kullan (zaten dependency var)
- **Durum**: ❌ Düzeltilmedi

### BUG-015: Deploy'ta Polar Product ID Hardcoded
- **Dosya**: `deploy/gcp-deploy.sh`
- **Sorun**: `POLAR_PRODUCT_PRO=79fee3f9-...` satırda hardcoded
- **Fix**: Secret Manager'da sakla
- **Durum**: ❌ Düzeltilmedi

### BUG-016: Admin Revenue Query Yanlış Fiyatlar
- **Dosya**: `api/src/routes/admin.rs`
- **Sorun**: `CASE plan WHEN 'pro' THEN 49.0 WHEN 'business' THEN 149.0`
- **Fix**: `29.0` ve `99.0` yap
- **Durum**: ❌ Düzeltilmedi

### BUG-017: Custom Header Injection Riski
- **Dosya**: `worker/src/delivery/http.rs`
- **Sorun**: Kullanıcı `Host`, `Content-Length`, `Transfer-Encoding` gibi kritik header'ları enjekte edebilir
- **Fix**: Blocked header listesi oluştur
- **Durum**: ❌ Düzeltilmedi

### BUG-018: inbound.rs — crypt() PostgreSQL Extension
- **Dosya**: `api/src/routes/inbound.rs`
- **Sorun**: `WHERE key_hash = crypt($1, key_hash)` PostgreSQL pgcrypto extension gerektirir
- **Fix**: Argon2 verification kullan (diğer auth kodundaki gibi)
- **Durum**: ❌ Düzeltilmedi

### BUG-019: teams.rs — Invite Token Response'da Döndürülüyor
- **Dosya**: `api/src/routes/teams.rs`
- **Sorun**: Invite token API response'da döndürülüyor, herkes daveti kabul edebilir
- **Fix**: Token'ı sadece email ile gönder, response'da döndürme
- **Durum**: ❌ Düzeltilmedi

### BUG-020: customer_portal.rs — Duplicate API Key Management
- **Dosya**: `api/src/routes/customer_portal.rs`
- **Sorun**: Hem `customer_portal.rs`'de hem `api_keys.rs`'de API key CRUD var, farklı mantık
- **Fix**: Tek bir modülde birleştir
- **Durum**: ❌ Düzeltilmedi

### BUG-021: embed.rs — Hardcoded API URL
- **Dosya**: `api/src/routes/embed.rs`
- **Sorun**: Embed script'inde GCP Cloud Run URL'si hardcoded
- **Fix`: Config'den oku
- **Durum**: ❌ Düzeltilmedi

### BUG-022: Logout Race Condition
- **Dosya**: `dashboard/src/lib/store.tsx`
- **Sorun**: Logout request tamamlanmadan state temizleniyor
- **Fix**: `await` ile bekle
- **Durum**: ❌ Düzeltilmedi

### BUG-023: API_BASE Duplikasyonu
- **Dosya**: `dashboard/src/lib/store.tsx`
- **Sorun**: Aynı logic 4 kez tekrarlanmış
- **Fix**: Dosya seviyesinde tanımla
- **Durum**: ❌ Düzeltilmedi

### BUG-024: Security Headers Eksik
- **Dosya**: `dashboard/src/middleware.ts`
- **Sorun**: CSP, HSTS, X-Frame-Options header'ları yok
- **Fix**: Middleware'de ekle
- **Durum**: ❌ Düzeltilmedi

---

## 🟢 DÜŞÜK — Sonraki Sprint

### BUG-025: SDK Test Coverage Düşük
- Sadece Python ve Go'da test var. Diğer 9 SDK'da sıfır test
- **Durum**: ❌ Düzeltilmedi

### BUG-026: Dead Code
- `industry/`, `ws/`, `fifo/` modülleri — kullanılmıyor olabilir
- `workflows/mod.rs` boş
- **Durum**: ❌ Kontrol edilmedi

### BUG-027: OpenAPI Spec Boş
- **Durum**: ❌ Düzeltilmedi

### BUG-028: Migration Refactor
- 43 migration tek bir `run_migrations()` fonksiyonunda
- **Durum**: ❌ Düzeltilmedi

---

## ✅ Düzeltilenler

_(Henüz yok — tüm hatalar düzeltilmeyi bekliyor)_

---

## 📊 Özet

| Seviye | Sayfa | Durum |
|--------|-------|-------|
| 🔴 Kritik | 7 | ❌ 0/7 düzeltildi |
| 🟡 Orta | 17 | ❌ 0/17 düzeltildi |
| 🟢 Düşük | 4 | ❌ 0/4 düzeltildi |
| **Toplam** | **28** | **❌ 0/28** |
