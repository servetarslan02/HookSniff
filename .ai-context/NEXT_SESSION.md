# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-25 GMT+8 (useAdminData hook split tamamlandı)

## 🚀 Hızlı Başlangıç

1. `git pull` — en son kodu çek
2. `MEMORY.md` oku — proje hafızası
3. Bu dosyayı oku — yapılacaklar
4. İşe başla
5. Oturum sonunda: push + bu dosyayı güncelle

---

## ✅ Son Oturumda Yapılan İşler

### useDashboardData.ts Hook Split (3 adım, tamamlandı)
- `useTeams.ts` — 14 hook (171 satır)
- `useNotifications.ts` — 5 hook (154 satır)
- `useBilling.ts` — 4 hook (70 satır)
- `useDashboardData.ts`: 1106 → 754 satır (%32 küçüldü)

### useAdminData.ts Hook Split (2 adım, tamamlandı)
- `useAdminUserDetail.ts` — 30 hook (402 satır)
- `useAdminSystem.ts` — 7 hook (109 satır)
- `useAdminData.ts`: 851 → 363 satır (%57 küçüldü)

### Toplam Etki
| Dosya | Önce | Sonra | Azalma |
|-------|------|-------|--------|
| useDashboardData.ts | 1106 | 754 | %32 |
| useAdminData.ts | 851 | 363 | %57 |
| **Toplam** | **1957** | **1117** | **%43** |

### Yeni Dosyalar (7 adet)
- useTeams.ts (171), useNotifications.ts (154), useBilling.ts (70)
- useAdminUserDetail.ts (402), useAdminSystem.ts (109)

### Her adımda:
- ✅ `npx tsc --noEmit` → 0 hata
- ✅ `npm run build` → exit 0, 363 sayfa
- ✅ Re-export'lar → backward compatible
- ✅ GitHub push

---

## 🟡 Sıradaki — Yeni Özellikler veya İyileştirmeler

Hook split'ler tamamlandı. Sıradaki adımlar Servet'in onayına bağlı:

### Opsiyonel İyileştirmeler
- [ ] `useAlerts.ts` çıkarma (useDashboardData.ts'den, ~60 satır)
- [ ] `useTransforms.ts` çıkarma (~60 satır)
- [ ] `usePortal.ts` çıkarma (~60 satır)
- [ ] `useApiKeys.ts` çıkarma (~50 satır)
- [ ] `useServiceTokens.ts` çıkarma (~60 satır)

### Veya yeni büyük görevler
- [ ] Backend integration tests
- [ ] OAuth kurulumu (Servet'in yapması gerek)
- [ ] Migration uygulama (Servet'in yapması gerek)

---

## 🔴 Servet'in Yapması Gereken (Kod Dışı)

1. **Google OAuth Client ID** — Google Cloud Console'dan al
2. **GitHub OAuth App** — GitHub Developer Settings'ten al
3. **Secret Manager güncelle** — OAuth credential'ları ekle
4. **Migration 087-100 uygula** — Neon DB'de çalıştır
5. **iyzico hesap aç** — ödeme entegrasyonu için
