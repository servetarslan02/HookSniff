# 2026-05-16 — Fix Oturumu: Core/Endpoints + Admin Kullanıcı Hataları

## Katılanlar
- Servet (proje sahibi)
- AI Asistan (OpenClaw)

## Yapılan İşler

### 1. Core/Endpoints Tab "⚠️ Error" Fix ✅
**Sorun:** `/core` sayfasındaki Endpoints tab'ı Zod validation hatası yüzünden çöküyordu.
**Neden:** API `null` döndürüyor ama Zod `.optional()` sadece `undefined` kabul ediyor.
**Çözüm:** `EndpointSchema`'daki 12 field `.optional()` → `.nullish()` yapıldı.
**Dosya:** `dashboard/src/schemas/api.ts`

### 2. Admin Users "No users found" Fix ✅
**Sorun:** Admin users sayfası API'den data geliyor ama sayfa boş gösteriyordu.
**Neden:** `AdminUserSchema`'daki `name` field'ı `.optional()` idi, API `null` döndürüyordu.
**Çözüm:** `AdminUserSchema`'daki `name`, `is_admin`, `total_deliveries`, `total_endpoints` → `.nullish()`
**Dosya:** `dashboard/src/schemas/api.ts`

### 3. Eksik i18n Keyleri Fix ✅
**Sorun:** Admin kullanıcı detay sayfası tab'ları key olarak görünüyordu (admin.testWebhook, admin.sendEmail vb.)
**Neden:** EN ve TR locale'de 66 key eksikti.
**Çözüm:** 66 key her iki locale'e eklendi.
**Dosyalar:** `dashboard/src/messages/en.json`, `dashboard/src/messages/tr.json`

### 4. Plan-History API 500 Fix ✅
**Sorun:** `/v1/admin/users/{id}/plan-history` 500 dönüyordu.
**Neden:** `audit_log.resource_id` VARCHAR(255) ama sqlx'e UUID bind ediliyordu. sqlx UUID→VARCHAR otomatik dönüşüm yapamıyor.
**Çözüm:** `bind(id)` → `bind(id.to_string())`
**Dosya:** `api/src/routes/admin.rs`

### 5. Admin Overview "Failed to load stats" — TESPİT EDİLDİ, DÜZELTİLMEDİ
**Sorun:** Admin overview sayfası stats yükleyemiyor.
**Neden:** Araştırılmadı (diğer fixlere odaklanıldı).

## Commit'ler
- `e0fb0139` — fix: Zod null vs undefined + eksik i18n keyleri
- `431374c5` — fix: plan-history 500 — resource_id VARCHAR ama UUID bind ediliyordu

## Teknik Notlar
- Zod `.optional()` = sadece `undefined` kabul eder
- Zod `.nullish()` = hem `undefined` hem `null` kabul eder
- PostgreSQL VARCHAR sütununa UUID bind etmek sqlx'te hata verir → `.to_string()` gerekir
- `audit_log.resource_id` VARCHAR(255) olarak tanımlı, UUID string olarak saklanıyor
