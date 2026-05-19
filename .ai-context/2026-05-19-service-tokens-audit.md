# 2026-05-19 — Service Tokens Denetim (20:43 GMT+8)

## Yapılan İşler

### 1. Service Tokens Sayfa İncelemesi
- Frontend: Tablo, oluştur/sil/göster/düzenle, loading skeleton, confirm dialog ✅
- Backend: 5 endpoint (list, create, delete, reveal, update) ✅
- Zod schema: `token_prefix` alanı backend ile uyumlu ✅
- i18n: EN + TR, eksik `createDesc` ve `tokenCreated` eklendi ✅

### 2. Düzeltilen Sorunlar

#### Sorun 1: Token oluşturulduktan sonra gösterilmiyor (🔴 KRİTİK)
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/service-tokens/page.tsx`
- **Sorun:** Backend `token` döndürüyor ama frontend `onSuccess` callback'inde yakalamıyor
- **Çözüm:** `data.token` yakalandı, yeşil banner ile gösterildi + copy butonu eklendi

#### Sorun 2: Eksik çeviriler
- **Dosya:** `en.json` + `tr.json`
- **Eklenen:** `createDesc`, `tokenCreated` (EN + TR)

### 3. Tespit Edilen Tasarım Kararları (Sorun Değil)
- **Reveal fonksiyonu:** Token hash'i tek yönlü → orijinal gösterilemez (doğru davranış)
- **Edit sadece isim:** `is_active` backend'de `deny_unknown_fields` ile reddedilir
- **Team bazlı:** Token'lar owner'ın ilk team'ine atanır

### 4. Commit
- `0847a1fd` — "fix: service tokens — show full token on creation + i18n"
