# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-25 GMT+8 (useDashboardData hook split tamamlandı)

## 🚀 Hızlı Başlangıç

1. `git pull` — en son kodu çek
2. `MEMORY.md` oku — proje hafızası
3. Bu dosyayı oku — yapılacaklar
4. İşe başla
5. Oturum sonunda: push + bu dosyayı güncelle

---

## ✅ Son Oturumda Yapılan İşler

### useDashboardData.ts Hook Split (3 adım, tamamlandı)
- `useTeams.ts` — 14 team hook'u (171 satır)
- `useNotifications.ts` — 5 notification hook'u (154 satır)
- `useBilling.ts` — 4 billing hook'u (70 satır)
- `useDashboardData.ts`: 1106 → 754 satır (%32 küçüldü)
- Her adımda import/export kontrol edildi
- Re-export'lar eklendi (backward compatible)

---

## 🟡 Sıradaki — useAdminData.ts Bölme (851 satır)

Şu hook'lar çıkarılacak:

| Hedef Dosya | Hook'lar | Tahmini Satır |
|-------------|----------|---------------|
| `useAdminUsers.ts` | useAdminUsers, useAdminUserDetail, useUpdateUserPlan, useUpdateUserStatus | ~80 |
| `useAdminStats.ts` | useAdminStats, useAdminSystemHealth | ~60 |

### Kurallar (Aynen Uygula)

1. **Tek seferde bir dosya çıkar**
2. **Çıkarılan dosya:** `useAuth`'ı `@/lib/store`'dan, tipleri `@/lib/api`'dan import etsin
3. **Orijinal dosya:** çıkarılan hook'ları `export { ... } from './useXxx'` ile re-export etsin
4. **Her adımda:** `npx tsc --noEmit` (mümkünse) → kontrol et
5. **Hata olursa:** geri al (`git checkout .`) ve farklı dene

---

## 🔴 Yapılmaması Gerekenler

- ❌ Tek seferde tüm dosyayı böl
- ❌ Import'ları sonradan düzeltirim diye düşünme (anında düzelt)
- ❌ Rust dosyalarını bölme (axum Handler trait uyumsuzluğu)

---

## 📊 Proje Durumu

| Kategori | Durum |
|----------|-------|
| P0 (Acil) | 14/14 ✅ |
| P1 (Yüksek) | 44/44 ✅ |
| P2 (Orta) | 17/38 (21 kaldı) |
| P3 (Düşük) | 0/13 (13 kaldı) |

---

## 🔴 Servet'in Yapması Gereken (Kod Dışı)

1. **Google OAuth Client ID** — Google Cloud Console'dan al
2. **GitHub OAuth App** — GitHub Developer Settings'ten al
3. **Secret Manager güncelle** — OAuth credential'ları ekle
4. **Migration 087-100 uygula** — Neon DB'de çalıştır
5. **iyzico hesap aç** — ödeme entegrasyonu için
