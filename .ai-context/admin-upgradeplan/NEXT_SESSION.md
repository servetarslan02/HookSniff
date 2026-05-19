# 📋 NEXT_SESSION — Sıradaki Görevler

> **Son güncelleme:** 2026-05-20 01:04 GMT+8
> **Oturum başı:** Bu dosyayı oku → `UYGULAMA-PLAN.md`'deki sıradaki aşamayı uygula

---

## 🎯 Sıradaki: AŞAMA 1 — Kullanıcı Davet Sistemi

**Durum:** ⬜ Başlanmadı
**Tahmini süre:** 1 oturum (1 saat)
**Öncelik:** 🔴 Kritik

### Yapılacaklar

#### 1. DB Migration
- [ ] `api/migrations/065_user_invites.sql` oluştur
- [ ] `user_invites` tablosu (id, email, invited_by, plan, token, status, accepted_at, expires_at, created_at)
- [ ] Index'ler: email, token, status

#### 2. Backend (Rust)
- [ ] `POST /admin/users/invite` — Davet oluştur + email gönder
- [ ] `GET /admin/users/invites` — Davet listesi
- [ ] `DELETE /admin/users/invites/{id}` — Davet iptal et
- [ ] `POST /admin/users/invites/{id}/resend` — Davet yeniden gönder
- [ ] `GET /auth/invite/{token}` — Davet doğrulama (public)

#### 3. Frontend (Next.js)
- [ ] `admin/users/page.tsx` — "Invite User" butonu + modal
- [ ] Davet listesi tablosu (status badge: pending/accepted/expired/revoked)
- [ ] Tekrar gönder / iptal butonları
- [ ] `app/[locale]/invite/[token]/page.tsx` — Davet kayıt sayfası (public)

#### 4. Email Şablonu
- [ ] Davet email şablonu (logo, davet eden, plan, buton)

#### 5. i18n
- [ ] `en.json` + `tr.json` → invite key'leri ekle

#### 6. Test & Deploy
- [ ] `cargo test` çalıştır (geçmeli)
- [ ] `next build` çalıştır (geçmeli)
- [ ] `git commit + push`
- [ ] `MEMORY.md` güncelle
- [ ] `NEXT_SESSION.md` güncelle

### Kabul Kriterleri
- [ ] Admin kullanıcı davet edebiliyor
- [ ] Davet email'i gönderiliyor
- [ ] Davet linki çalışıyor
- [ ] Kayıt formu email ile açılıyor
- [ ] Kayıt sonrası davet "accepted" oluyor
- [ ] Davet listesi görünüyor
- [ ] İptal / tekrar gönderme çalışıyor

---

## 📌 Bundan Sonra

| Sıra | Aşama | Süre |
|------|-------|------|
| ✅ 0 | Analiz + Plan | Tamamlandı |
| ⬜ 1 | Kullanıcı Davet Sistemi | 1 oturum |
| ⬜ 2 | Şifre Sıfırlama + Session | 1 oturum |
| ⬜ 3 | Dunning (Ödeme Kurtarma) | 2 oturum |
| ⬜ 4 | Customer Health Score | 1.5 oturum |
| ⬜ 5 | Promosyon/Kupon Kodu | 2 oturum |
| ⬜ 6 | Revenue Forecast + Cancel Flow | 1.5 oturum |
| ⬜ 7 | Status Page + Broadcast | 1 oturum |
| ⬜ 8 | Queue + Circuit Breaker UI | 0.5 oturum |
| ⬜ 9 | Event Dedup + PDF Fatura | 1.5 oturum |
| ⬜ 10 | Onboarding + API Usage | 1.5 oturum |
| ⬜ 11 | Şüpheli Aktivite + IP Block | 1.5 oturum |
| ⬜ 12 | Son Dokunuşlar + Test | 1 oturum |

**Detaylar:** `UYGULAMA-PLAN.md` dosyasında

---

## 🔧 Teknik Hatırlatmalar

- **Backend:** Rust + Axum framework
- **Frontend:** Next.js 15+ (App Router) + TypeScript
- **DB:** Neon PostgreSQL (Free tier)
- **Cache:** Upstash Redis (Free tier)
- **Deploy API:** Google Cloud Build → Cloud Run
- **Deploy Dashboard:** Vercel (otomatik)
- **i18n:** next-intl (EN + TR)
- **State:** Zustand + React Query
- **Test:** `cargo test` (Rust) + `next build` (Frontend)
