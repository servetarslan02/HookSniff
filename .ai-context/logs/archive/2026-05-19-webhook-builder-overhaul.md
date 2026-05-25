# 2026-05-19 — Webhook Builder Kapsamlı İnceleme + Düzeltme

## Yapılan İşler

### Tespit Edilen 11 Sorun ve Düzeltmeleri

| # | Sorun | Öncelik | Düzeltme |
|---|-------|---------|----------|
| 1 | CSS mükerrer `text-sm` (event type input) | 🔴 Bug | Tekrarlayan sınıf kaldırıldı |
| 2 | Önizleme sadece manuel "Yenile" ile güncelleniyor | 🟡 UX | Otomatik güncelleme (useEffect) |
| 3 | Klavye kısayolu yok | 🟢 UX | Ctrl/Cmd + Enter ile gönderme |
| 4 | Temizleme butonu yok | 🟡 UX | "🗑️ Temizle" butonu eklendi |
| 5 | Boş alan validasyonu yok | 🟡 UX | En az bir key zorunlu |
| 6 | Gönderme sonrası preview'da feedback yok | 🟡 UX | "✓ Gönderildi" badge'i + yeşil border |
| 7 | Type selector `w-24` dar | 🟠 UX | `w-28` yapıldı (TR "metin"/"sayı" sığıyor) |
| 8 | "Yenile" butonu gereksiz | 🟢 UX | Kaldırıldı (otomatik güncelleme var) |
| 9 | Payload değişiklik uyarısı yok | 🟢 UX | Son gönderimden farklıysa uyarı |
| 10 | Test yanlış import yolu | 🔴 Bug | `[username]` → `(dashboard)` |
| 11 | Test'ler eski endpoint input'u bekliyor | 🔴 Bug | Dropdown select mock'landı |

### Eklenen i18n Anahtarları (EN + TR)

- `clearAll` — Temizle
- `shortcutHint` — "ile webhook gönder"
- `addFieldFirst` — "En az bir anahtarlı alan ekleyin"
- `sent` — "Gönderildi"
- `previewChanged` — "Son gönderimden sonra payload değişti..."

### Değişen Dosyalar

1. `dashboard/src/app/[locale]/(dashboard)/webhook-builder/page.tsx` — +115/-105
2. `dashboard/src/__tests__/webhook-builder-page.test.tsx` — 22 test, tümü geçti
3. `dashboard/src/messages/en.json` — +7
4. `dashboard/src/messages/tr.json` — +7

### Commit
- `8dcceb07` — fix(webhook-builder): comprehensive UX overhaul — 11 issues fixed
