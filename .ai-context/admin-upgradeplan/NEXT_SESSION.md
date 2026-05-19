# 📋 NEXT_SESSION — Sıradaki Görevler

> **Son güncelleme:** 2026-05-20 01:19 GMT+8
> **Oturum başı:** Bu dosyayı oku → `YONETIM-PAN-UYGULAMA-PLAN.md`'deki Aşama 1'i uygula

---

## 🎯 Sıradaki: AŞAMA 1 — Kullanıcı Davet + Şifre Sıfırlama

**Durum:** ⬜ Başlanmadı
**Tahmini süre:** 1 oturum (1 saat)
**Öncelik:** 🔴 Kritik
**Yönetim Etkisi:** Müşteri desteği + büyüme

### Yapılacaklar

#### 1. DB Migration
- [ ] `api/migrations/065_user_invites.sql` oluştur
- [ ] `user_invites` tablosu (id, email, invited_by, plan, token, status, accepted_at, expires_at)
- [ ] Index'ler: email, token

#### 2. Backend (Rust)
- [ ] `POST /admin/users/invite` — Davet oluştur + email gönder
- [ ] `GET /admin/users/invites` — Davet listesi
- [ ] `DELETE /admin/users/invites/{id}` — Davet iptal et
- [ ] `POST /admin/users/invites/{id}/resend` — Davet yeniden gönder
- [ ] `GET /auth/invite/{token}` — Davet doğrulama (public)
- [ ] `POST /admin/users/{id}/reset-password` — Şifre sıfırlama linki gönder

#### 3. Frontend (Next.js)
- [ ] `admin/users/page.tsx` — "Invite User" butonu + modal
- [ ] Davet listesi tablosu (status badge)
- [ ] `app/[locale]/invite/[token]/page.tsx` — Davet kayıt sayfası (public)
- [ ] `admin/users/[id]/components/OverviewTab.tsx` — "Reset Password" butonu

#### 4. i18n
- [ ] `en.json` + `tr.json` → invite + resetPassword key'leri ekle

#### 5. Test & Deploy
- [ ] `cargo test` çalıştır (geçmeli)
- [ ] `next build` çalıştır (geçmeli)
- [ ] `git commit + push`
- [ ] `MEMORY.md` güncelle
- [ ] `NEXT_SESSION.md` güncelle → Aşama 2

### Kabul Kriterleri
- [ ] Admin kullanıcı davet edebiliyor
- [ ] Davet email'i gönderiliyor
- [ ] Davet linki ile kayıt çalışıyor
- [ ] Admin şifre sıfırlama linki gönderebiliyor
- [ ] cargo test + next build geçiyor

---

## 📌 Bundan Sonra

| Sıra | Aşama | Süre |
|------|-------|------|
| ⬜ 1 | Kullanıcı Davet + Şifre Sıfırlama | 1 oturum |
| ⬜ 2 | Session Yönetimi + API Key İptali | 1 oturum |
| ⬜ 3 | Dunning (Ödeme Kurtarma) | 2 oturum |
| ⬜ 4 | Status Page + Broadcast | 1 oturum |
| ⬜ 5 | Queue + Cache + Circuit Breaker | 0.5 oturum |
| ⬜ 6 | Kullanıcı Düzenleme + Pause | 1 oturum |
| ⬜ 7 | Customer Health Score | 1.5 oturum |
| ⬜ 8 | Kupon/Promosyon Kodu | 2 oturum |
| ⬜ 9 | IP Blocklist + Şüpheli Aktivite | 1.5 oturum |
| ⬜ 10 | Revenue Forecast + Fatura PDF | 1 oturum |
| ⬜ 11 | Onboarding + Segmentasyon | 1.5 oturum |
| ⬜ 12 | Son Dokunuşlar + Test | 1 oturum |

**Detaylar:** `YONETIM-PAN-UYGULAMA-PLAN.md` dosyasında

---

## 🔧 Teknik Hatırlatmalar

- **Backend:** Rust + Axum framework
- **Frontend:** Next.js 16+ (App Router) + TypeScript
- **DB:** Neon PostgreSQL (Free tier)
- **Cache:** Upstash Redis (Free tier)
- **Deploy API:** Google Cloud Build → Cloud Run
- **Deploy Dashboard:** Vercel (otomatik)
- **i18n:** next-intl (EN + TR)
- **State:** Zustand + React Query
- **Test:** `cargo test` (Rust) + `next build` (Frontend)
