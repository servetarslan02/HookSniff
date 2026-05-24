# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-25 GMT+8 (useDashboardData hook split tamamlandı — 2. oturum)

## 🚀 Hızlı Başlangıç

1. `git pull` — en son kodu çek
2. `MEMORY.md` oku — proje hafızası
3. Bu dosyayı oku — yapılacaklar
4. İşe başla
5. Oturum sonunda: push + bu dosyayı güncelle

---

## ✅ Son Oturumda Yapılan İşler

### useDashboardData.ts — Tam Hook Split (10 dosya çıkarıldı)
Orijinal 1106 satır → **172 satır** (%84 küçülme)

| Dosya | Satır | Hook Sayısı |
|-------|-------|-------------|
| useTeams.ts | 171 | 14 |
| useNotifications.ts | 154 | 5 |
| useBilling.ts | 70 | 4 |
| useAlerts.ts | 61 | 5 |
| useTransforms.ts | 68 | 5 |
| usePortal.ts | 68 | 5 |
| useApiKeys.ts | 45 | 4 |
| useServiceTokens.ts | 53 | 5 |
| useEndpoints.ts | 85 | 4 |
| useAnalytics.ts | 82 | 5 |
| useWebhooks.ts | 112 | 6 |
| useInboundConfigs.ts | 57 | 4 |
| useRateLimits.ts | 37 | 3 |

### Paylaşılan yardımcı
- `validated.ts` (15 satır) — schema-validated fetcher wrapper

### Her adımda:
- ✅ `npx tsc --noEmit` → 0 hata
- ✅ `npm run build` → exit 0
- ✅ Re-export'lar → backward compatible
- ✅ GitHub push

---

## 🟡 Sıradaki — Yeni Özellikler veya İyileştirmeler

Hook split'ler tamamlandı. Sıradaki adımlar Servet'in onayına bağlı:

### useAdminData.ts Kalan Split (363 satır)
- [ ] `useAdminUsers.ts` çıkarma (~100 satır)
- [ ] `useAdminEndpoints.ts` çıkarma (~80 satır)
- [ ] `useAdminBilling.ts` çıkarma (~60 satır)

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
