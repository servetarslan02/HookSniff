# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-24 GMT+8 (api.ts modular split tamamlandı)

## 🚀 Hızlı Başlangıç

1. `git pull` — en son kodu çek
2. `MEMORY.md` oku — proje hafızası
3. Bu dosyayı oku — yapılacaklar
4. İşe başla
5. Oturum sonunda: push + bu dosyayı güncelle

---

## ✅ Son Oturumda Yapılan İşler

### api.ts Modular Split (4 adım, tamamlandı)
- `api-admin.ts` — adminApi (313 satır)
- `api-teams.ts` — teams/notifications/broadcasts/alerts/inbound (147 satır)
- `api-integrations.ts` — connectors/integrations/stream (177 satır)
- `api-misc.ts` — 2FA/SSO/transforms/billing/analytics (102 satır)
- `api.ts` — 1369 → 664 satır (%48 küçüldü)
- Her adımda tsc + next build + commit kontrol edildi

---

## 🟡 Sıradaki — Dashboard Hook Bölme

### Öncelik: useDashboardData.ts (1106 satır)

Şu hook'lar çıkarılacak:

| Hedef Dosya | Hook'lar | Tahmini Satır |
|-------------|----------|---------------|
| `useTeams.ts` | useTeams, useTeamMembers, useTeamDetail, useCreateTeam, useUpdateTeam, useInviteTeamMember, useRemoveTeamMember, useUpdateTeamMemberRole, useAcceptTeamInvite, useDeleteTeam, useLeaveTeam, useTransferOwnership, useRevokeInvite, useResendInvite | ~150 |
| `useNotifications.ts` | useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification, useReplayWebhook | ~150 |

### Kurallar (Aynen Uygula)

1. **Tek seferde bir dosya çıkar**
2. **Çıkarılan dosya:** `useAuth`'ı `@/lib/store`'dan, tipleri `@/lib/api-types`'den import etsin
3. **Orijinal dosya:** çıkarılan hook'ları `export { ... } from './useXxx'` ile re-export etsin
4. **Her adımda:** `npx tsc --noEmit` → `npx next build` → `git commit`
5. **Hata olursa:** geri al (`git checkout .`) ve farklı dene

### Sonra: useAdminData.ts (851 satır)

| Hedef Dosya | Hook'lar | Tahmini Satır |
|-------------|----------|---------------|
| `useAdminUsers.ts` | useAdminUsers, useAdminUserDetail, useUpdateUserPlan, useUpdateUserStatus | ~80 |

---

## 🔴 Yapılmaması Gerekenler

- ❌ Tek seferde tüm dosyayı böl (bir seferde 313 satır bile riskliydi)
- ❌ tsc kontrol etmeden devam et
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
