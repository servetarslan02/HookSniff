# 🧪 Oyun Alanı (Playground)

> Sayfa: `dashboard/src/app/[locale]/dashboard/playground/page.tsx`
> Route: `/dashboard/playground`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Alt Bileşenler
| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| ResponseInspector | `./components/ResponseInspector` | Yanıt inceleme |
| HistoryPanel | `./components/HistoryPanel` | Geçmiş paneli |
| LiveRequestViewer | `./components/LiveRequestViewer` | Canlı istek görüntüleyici |
| LoadingSpinner | `@/components/LoadingSpinner` | Yükleme |

### Sabitler (constants.ts)
- METHODS — HTTP metodları
- API_BASE — API URL
- ENDPOINT_PATHS — Preset endpoint yolları
- AI_PAYLOAD_TEMPLATES — AI payload şablonları

### Veri Akışı
- `fetch(API_BASE + path, {method, headers, body})` → doğrudan API çağrısı
- `loadHistory()` / `saveHistory()` → localStorage geçmişi

## Özellikler

### İstek Oluşturma
- ✅ **HTTP Method** — GET/POST/PUT/DELETE seçici
- ✅ **Path** — Manuel input + preset seçici
- ✅ **Headers** — Otomatik eklenen (Content-Type + Authorization)
- ✅ **Body** — JSON textarea (GET hariç)
- ✅ **Quick Presets** — Önceden tanımlı endpoint yolları

### AI Payload Generator
- ✅ **Event type butonları** — AI_PAYLOAD_TEMPLATES'den otomatik payload
- ✅ **Toast bildirimi** — Generated payload mesajı

### cURL Generator
- ✅ **Otomatik cURL** — Mevcut istekten cURL komutu
- ✅ **Kopyalama** — Clipboard'a kopyalama

### Yanıt Görüntüleme
- ✅ **ResponseInspector** — Status, headers, body, duration
- ✅ **Duration** — perform.now() ile ölçüm

### Geçmiş
- ✅ **10 kayıt** — localStorage'da saklanır
- ✅ **Seçme** — Geçmişten istek yükleme
- ✅ **Temizleme** — Geçmişi silme

### Erişilebilirlik
- ✅ i18n tüm metinlerde
- ✅ Dark mode tam destek

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Bileşenlere ayrılmış yapı (refactoring sonrası ~308 satır)
- AI payload generator
- cURL generator + copy
- History (localStorage)
- Duration ölçümü
- Response headers yakalama

### ⚠️ Potansiyel Sorunlar
- **Doğrudan fetch** — apiFetch yerine doğrudan fetch kullanılıyor (CORS, auth farkları)
- **API_BASE hardcoded** — constants.ts'de sabit
- **"Headers (auto-added)" hardcoded** — i18n key kullanılmamış
- **"🤖 AI Payload Generator" hardcoded** — i18n key kullanılmamış
- **"📋 Copy" hardcoded** — i18n key kullanılmamış
- **_showAiGenerator unused** — state tanımlanmış ama kullanılmıyor

### 🔴 Eksiklikler
- Request kaydetme/paylaşma yok
- Collection/workspace sistemi yok
- Environment variables (base URL, token) yok
- Request şablonları kaydetme yok
- Response karşılaştırma yok
- Mock server yok
- WebSocket test desteği yok

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Kod Kalitesi

#### KK-01: Raw Fetch Kullanımı (7 yer)
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/playground/content.tsx`
- **Sorun:** 7 yerde `fetch('/api/playground/...')` kullanılıyor. Auth, CSRF, retry, timeout koruması yok.
- **Adımlar:**
  1. `fetch('/api/playground/token', { method: 'POST' })` → `apiFetch('/playground/token', { method: 'POST', token })`
  2. `fetch('/api/playground/history/${token}')` → `apiFetch('/playground/history/${token}', { token })`
  3. `fetch('/api/playground/history/${token}', { method: 'DELETE' })` → `apiFetch('/playground/history/${token}', { method: 'DELETE', token })`
  4. Tüm fetch çağrılarını apiFetch'e çevir
  5. Hardcoded `/api/playground/` URL'lerini `/playground/` olarak değiştir

#### KK-02: console.log Production'da
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/playground/content.tsx` — satır 634
- **Sorun:** `console.log('Captured requests:', data)` production'da kalmış.
- **Adımlar:**
  1. `console.log` satırını kaldır
  2. Veya `process.env.NODE_ENV === 'development'` kontrolü ekle

#### KK-03: localStorage-Only Geçmiş
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/playground/content.tsx`
- **Sorun:** Playground geçmişi sadece localStorage'da.
- **Adımlar:**
  1. Backend'de playground geçmişi endpoint'i varsa kullan
  2. Yoksa localStorage kalabilir ama "Geçmiş temizlendi" mesajı göster

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/playground/playground/page.tsx`
- **Sorun:** 2 useEffect, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)
