# 🛠️ Developer Tools — Oyun Alanı, İmza Aracı, API İçe Aktarıcı, Webhook Oluşturucu, Simülatör

> **Bölüm:** Developer Tools  
> **İçerik:** Oyun Alanı, İmza Aracı, API İçe Aktarıcı, Webhook Oluşturucu, Simülatör  
> **İnceleme Tarihi:** 2026-05-12/13  
> **Güncelleme:** 2026-05-13 (kod değişiklikleriyle eşleştirildi)  
> **Kaynak Dosyalar:** `09-oyun-alani.md`, `13-imza-araci.md`, `14-api-aktarici.md`, `15-webhook-olusturucu.md`, `31-simulator.md`

---

## 📑 İçindekiler

- [1. Oyun Alanı (Playground)](#1-oyun-alani-playground)
- [2. İmza Aracı (Signature Verifier)](#2-imza-araci-signature-verifier)
- [3. API İçe Aktarıcı (API Importer)](#3-api-ice-aktarici-api-importer)
- [4. Webhook Oluşturucu (Webhook Builder)](#4-webhook-olusturucu-webhook-builder)
- [5. Simülatör (Simulator)](#5-simulator)

---

## 1. Oyun Alanı (Playground)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/playground/page.tsx`  
> Route: `/playground`

### Sayfa Yapısı

#### Alt Bileşenler
| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| ResponseInspector | `./components/ResponseInspector` | Yanıt inceleme |
| HistoryPanel | `./components/HistoryPanel` | Geçmiş paneli |
| LiveRequestViewer | `./components/LiveRequestViewer` | Canlı istek görüntüleyici |
| LoadingSpinner | `@/components/LoadingSpinner` | Yükleme |

#### Sabitler (constants.ts)
- METHODS — HTTP metodları
- API_BASE — API URL
- ENDPOINT_PATHS — Preset endpoint yolları
- AI_PAYLOAD_TEMPLATES — AI payload şablonları

#### Veri Akışı
- `fetch(API_BASE + path, {method, headers, body})` → doğrudan API çağrısı
- `loadHistory()` / `saveHistory()` → localStorage geçmişi

### Özellikler

#### İstek Oluşturma
- ✅ **HTTP Method** — GET/POST/PUT/DELETE seçici
- ✅ **Path** — Manuel input + preset seçici
- ✅ **Headers** — Otomatik eklenen (Content-Type + Authorization)
- ✅ **Body** — JSON textarea (GET hariç)
- ✅ **Quick Presets** — Önceden tanımlı endpoint yolları

#### AI Payload Generator
- ✅ **Event type butonları** — AI_PAYLOAD_TEMPLATES'den otomatik payload
- ✅ **Toast bildirimi** — Generated payload mesajı

#### cURL Generator
- ✅ **Otomatik cURL** — Mevcut istekten cURL komutu
- ✅ **Kopyalama** — Clipboard'a kopyalama

#### Yanıt Görüntüleme
- ✅ **ResponseInspector** — Status, headers, body, duration
- ✅ **Duration** — perform.now() ile ölçüm

#### Geçmiş
- ✅ **10 kayıt** — localStorage'da saklanır
- ✅ **Seçme** — Geçmişten istek yükleme
- ✅ **Temizleme** — Geçmişi silme

#### Erişilebilirlik
- ✅ i18n tüm metinlerde
- ✅ Dark mode tam destek

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Bileşenlere ayrılmış yapı (refactoring sonrası ~308 satır)
- AI payload generator
- cURL generator + copy
- History (localStorage)
- Duration ölçümü
- Response headers yakalama

#### ⚠️ Potansiyel Sorunlar
- **Doğrudan fetch** — apiFetch yerine doğrudan fetch kullanılıyor (CORS, auth farkları)
- **API_BASE hardcoded** — constants.ts'de sabit
- **"Headers (auto-added)" hardcoded** — i18n key kullanılmamış
- **"🤖 AI Payload Generator" hardcoded** — i18n key kullanılmamış
- **"📋 Copy" hardcoded** — i18n key kullanılmamış
- **_showAiGenerator unused** — state tanımlanmış ama kullanılmıyor

#### 🔴 Eksiklikler
- Request kaydetme/paylaşma yok
- Collection/workspace sistemi yok
- Environment variables (base URL, token) yok
- Request şablonları kaydetme yok
- Response karşılaştırma yok
- Mock server yok
- WebSocket test desteği yok

---

## 2. İmza Aracı (Signature Verifier)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/signature-verifier/page.tsx`  
> Route: `/signature-verifier`

### Sayfa Yapısı
- Web Crypto API ile HMAC imza hesaplama
- SHA-256 ve SHA-512 desteği
- Constant-time comparison (timing attack koruması)

### Özellikler
- ✅ **İmza Hesaplama** — Payload + secret → HMAC imzası
- ✅ **İmza Doğrulama** — Payload + secret + signature → valid/invalid
- ✅ **Algoritma Seçimi** — SHA-256 / SHA-512
- ✅ **Constant-time comparison** — Timing attack koruması (Item 168)
- ✅ **Toast bildirimleri** — Başarı/hata mesajları

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Web Crypto API kullanımı (güvenli)
- Constant-time comparison
- Timing attack koruması
- i18n tam destek

#### 🔴 Eksiklikler
- Geçmiş imza doğrulamaları yok
- İmza formatı seçimi (hex/base64) yok
- Örnek payload/template yok

---

## 3. API İçe Aktarıcı (API Importer)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/api-importer/page.tsx`  
> Route: `/api-importer`

### Sayfa Yapısı
- SpecInputPanel — OpenAPI/Swagger spec girişi
- ParsedResultsPanel — Parse edilen endpoint'ler
- Desteklenen formatlar: OpenAPI 3.0, Swagger 2.0, URL

### Özellikler
- ✅ **Spec Yükleme** — JSON/YAML dosya veya URL
- ✅ **Endpoint Parse** — Otomatik endpoint çıkarma
- ✅ **Seçim** — Tekli/tüm endpoint seçimi (toggle)
- ✅ **Format Desteği** — OpenAPI 3.0, Swagger 2.0

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Bileşenlere ayrılmış yapı
- Toggle all seçeneği
- Format bilgi kartları

#### 🔴 Eksiklikler
- Endpoint düzenleme (parse sonrası) yok
- Import sonrası webhook oluşturma yok
- Geçmiş import'lar yok

---

## 4. Webhook Oluşturucu (Webhook Builder)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/webhook-builder/page.tsx`  
> Route: `/webhook-builder`

### Sayfa Yapısı
- Event type seçici + template'ler
- Dinamik alan ekleme/düzenleme/silme
- JSON önizleme
- Endpoint seçimi + gönderme

#### Template'ler
| Template | Alanlar |
|----------|---------|
| order.created | order_id, total, currency, customer_id |
| payment.completed | payment_id, amount, status, method |
| user.created | user_id, email, plan |

### Özellikler
- ✅ **Template Sistemi** — Önceden tanımlı webhook şablonları
- ✅ **Dinamik Alanlar** — Ekleme/düzenleme/silme
- ✅ **Tip Desteği** — string/number/boolean/object/array
- ✅ **JSON Önizleme** — Canlı payload preview
- ✅ **Gönderme** — Seçili endpoint'e webhook gönderme

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Template sistemi
- Dinamik alan yönetimi
- JSON önizleme
- i18n desteği

#### 🔴 Eksiklikler
- Template kaydetme/paylaşma yok
- Alan validasyonu yok
- Gönderme geçmişi yok

---

## 5. Simülatör (Simulator)

> Sayfa: ❌ OLUŞTURULMALI  
> Route: `/simulator`  
> Backend: `api/src/routes/simulator.rs` — mevcut

### Backend Durumu

#### Mevcut Endpoint'ler
| Method | Route | Açıklama |
|--------|-------|----------|
| POST | `/v1/simulator` | Webhook simülasyonu çalıştır |

### Frontend Yapılacaklar

#### Sayfa Yapısı
1. **Senaryo Seçici** — Önceden tanımlı senaryolar
   - Order created, payment completed, user registered, custom
2. **Endpoint Seçici** — Hedef endpoint seçimi
3. **Payload Editor** — JSON textarea (senaryo ile dolu)
4. **Gönder Butonu** — Simülasyonu çalıştır
5. **Sonuç Paneli** — Teslimat sonucu, response code, latency, attempts

#### Sidebar Ekleme
```typescript
// sections.tools.items'a ekle (playground'un yanına):
{ name: t('simulator'), href: '/simulator', icon: '🧪' }
```

#### i18n Anahtarları (EN + TR)
- simulator, simulatorDesc, runSimulation, simulationResult, scenario, selectScenario
- deliverySuccessful, deliveryFailed, responseTime, attempts

#### Playground'tan Farkı
- Playground: Manuel API çağrısı (herhangi bir endpoint)
- Simulator: Webhook delivery simülasyonu (gerçek delivery akışı)

#### Öncelik: 🟡 YÜKSEK — Müşteri webhook akışını test edebilmeli

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Kod Kalitesi

#### KK-01: Raw Fetch Kullanımı (7 yer) — Playground
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/playground/content.tsx`
- **Sorun:** 7 yerde `fetch('/api/playground/...')` kullanılıyor. Auth, CSRF, retry, timeout koruması yok.
- **Adımlar:**
  1. `fetch('/api/playground/token', { method: 'POST' })` → `apiFetch('/playground/token', { method: 'POST', token })`
  2. `fetch('/api/playground/history/${token}')` → `apiFetch('/playground/history/${token}', { token })`
  3. `fetch('/api/playground/history/${token}', { method: 'DELETE' })` → `apiFetch('/playground/history/${token}', { method: 'DELETE', token })`
  4. Tüm fetch çağrılarını apiFetch'e çevir
  5. Hardcoded `/api/playground/` URL'lerini `/playground/` olarak değiştir

#### KK-02: console.log Production'da — Playground
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/playground/content.tsx` — satır 634
- **Sorun:** `console.log('Captured requests:', data)` production'da kalmış.
- **Adımlar:**
  1. `console.log` satırını kaldır
  2. Veya `process.env.NODE_ENV === 'development'` kontrolü ekle

#### KK-03: localStorage-Only Geçmiş — Playground
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/playground/content.tsx`
- **Sorun:** Playground geçmişi sadece localStorage'da.
- **Adımlar:**
  1. Backend'de playground geçmişi endpoint'i varsa kullan
  2. Yoksa localStorage kalabilir ama "Geçmiş temizlendi" mesajı göster

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik — Playground
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/playground/playground/page.tsx`
- **Sorun:** 2 useEffect, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-dashboard-core P-01)
