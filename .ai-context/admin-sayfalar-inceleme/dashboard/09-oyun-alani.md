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
