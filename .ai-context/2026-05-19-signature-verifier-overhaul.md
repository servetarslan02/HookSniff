# 2026-05-19 — İmza Aracı (Signature Verifier) Kapsamlı İnceleme + Düzeltme

## Yapılan İşler

### Tespit Edilen 8 Sorun ve Düzeltmeleri

| # | Sorun | Öncelik | Düzeltme |
|---|-------|---------|----------|
| 1 | CSS sınıf mükerrerleri (textarea + input'larda `focus:ring-2`, `text-sm` iki kez) | 🔴 Bug | Tekrarlayan sınıflar kaldırıldı |
| 2 | Temizleme butonu yok | 🟡 UX | "🗑️ Temizle" butonu eklendi (tüm alanları sıfırlar) |
| 3 | Gizli anahtar gösterme butonu yok | 🟡 UX | Göz ikonu eklendi (password ↔ text toggle) |
| 4 | İmza format doğrulama yok | 🟡 UX | `normalizeSignature()` — hex yapıştırınca otomatik `sha256=` prefix ekleniyor |
| 5 | Kod örneği sadece Node.js | 🟡 UX | Node.js + Python + Go kod örnekleri eklendi (tab'lı geçiş) |
| 6 | Kopyalama butonu HTTPS gerektirir | 🟠 Bug | Fallback mekanizması eklendi (textarea + execCommand) |
| 7 | Klavye kısayolu yok | 🟢 UX | Ctrl/Cmd + Enter ile doğrulama |
| 8 | Test dosyası yanlış import yolu | 🔴 Bug | `[username]` → `(dashboard)` düzeltildi |

### Eklenen i18n Anahtarları (EN + TR)

- `clearAll` — Temizle
- `shortcutHint` — "ile imzayı doğrula"
- `showSecret` / `hideSecret` — Gizli anahtarı göster/gizle
- `signatureFormatHint` — Format açıklaması
- `toastCopyFailed` — Kopyalama hatası mesajı

### Değişen Dosyalar

1. `dashboard/src/app/[locale]/(dashboard)/signature-verifier/page.tsx` — +223/-30 satır
2. `dashboard/src/__tests__/signature-verifier-page.test.tsx` — +43/-1 satır (yeni test'ler)
3. `dashboard/src/messages/en.json` — +8 satır
4. `dashboard/src/messages/tr.json` — +8 satır

### Commit
- `f8b0bbde` — fix(signature-verifier): comprehensive UX overhaul — 8 issues fixed

## Sayfa Yapısı (Güncel)

```
/signature-verifier (DevTools tab'ı olarak çalışır)
├── 🔐 Algoritma Seçici (SHA-256 / SHA-512)
├── ✍️ Doğrulama Aracı
│   ├── Webhook Verisi (textarea)
│   ├── Gizli Anahtar (password + göz toggle)
│   ├── İmza (text + format hint)
│   ├── [✓ İmzayı Doğrula] [🔧 İmza Hesapla]
│   └── Sonuç kartı (✅/❌)
├── 💻 Kod Örneği (Node.js / Python / Go tab'ları)
└── 📖 Nasıl Çalışır (3 adım)
```

## Teknik Notlar

- `timingSafeEqual()` — Timing attack koruması mevcut
- `crypto.subtle.sign()` — Web Crypto API (tarayıcı içi)
- DevTools sayfası: Playground + Signature + Webhook Builder + API Importer tab'ları
- Middleware: `/signature-verifier` → `/devtools` redirect (eski URL'ler çalışır)
