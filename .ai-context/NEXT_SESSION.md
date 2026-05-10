# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 18:55 GMT+8

---

## 🔴 Sıradaki Oturum: #73 — Rate Limiting

### Görev
Auth endpoint'lerine rate limit ekle. 4 sorun tek oturumda çözülecek.

### Düzeltilcek Sorunlar
| ID | Sorun | Dosya |
|----|-------|-------|
| HS-001 | `verify_email` rate limit yok — brute force | `api/src/routes/auth.rs` |
| HS-002 | `verify_2fa` rate limit yok — TOTP brute force | `api/src/routes/auth.rs` |
| HS-003 | `refresh_token` rate limit yok — token stuffing | `api/src/routes/auth.rs` |
| HS-008 | Contact form rate limit yok — spam/flood | `api/src/routes/contact.rs` |

### Yaklaşım
1. `api/src/rate_limit.rs` dosyasını oku — mevcut rate limit yapısını anla
2. `verify_email` endpoint'ine rate limit middleware ekle (5 deneme/dakika)
3. `verify_2fa` endpoint'ine rate limit middleware ekle (5 deneme/dakika)
4. `refresh_token` endpoint'ine rate limit middleware ekle (10 deneme/dakika)
5. `contact` form endpoint'ine rate limit middleware ekle (3 deneme/dakika)
6. Test et
7. GitHub'a push et

### Dosyalar
- `api/src/routes/auth.rs` — verify_email, verify_2fa, refresh_token
- `api/src/routes/contact.rs` — contact form
- `api/src/rate_limit.rs` — mevcut rate limit modülü

### Oturum Sonunda
- [ ] ISSUE-TRACKER.md'de HS-001, HS-002, HS-003, HS-008'i ✅ ile işaretle
- [ ] SESSION-PLAN.md'de Oturum 73'ü ✅ ile işaretle
- [ ] MEMORY.md'yi güncelle
- [ ] NEXT_SESSION.md'yi güncelle (Oturum 74 planı)
- [ ] GitHub'a push et

---

## 📋 Sıradaki 5 Oturum

| # | Görev | Sorunlar |
|---|-------|----------|
| 73 | **Rate Limiting** | HS-001, HS-002, HS-003, HS-008 |
| 74 | Webhook Verification & Ownership | HS-004, HS-005, HS-009, HS-038a, HS-038b |
| 75 | Infrastructure & Security Config | HS-006, HS-007, HS-010, HS-038c |
| 76 | Dashboard Routing (EN KRİTİK) | HS-030, HS-072, HS-075 |
| 77 | Frontend-Backend API Uyumsuzluğu | HS-031, HS-034, HS-028, HS-029 |

---

## 📝 Proje Bilgileri

- **Repo:** https://github.com/servetarslan02/HookSniff
- **API:** hooksniff-api-1046140057667.europe-west1.run.app
- **Dashboard:** https://hooksniff.vercel.app
- **Admin:** servetarslan02@gmail.com / Alayci_165 (business, admin)
- **Demo:** demo@hooksniff.com / Demo1234! (free, non-admin)

## 📁 Tüm Raporlar
- **ISSUE-TRACKER.md:** `.ai-context/visual-bugs/ISSUE-TRACKER.md` (103 sorun)
- **SESSION-PLAN.md:** `.ai-context/SESSION-PLAN.md` (tüm oturum planı)
- **ACTION-PLAN.md:** `.ai-context/visual-bugs/ACTION-PLAN.md`
- **CONSOLIDATED-REPORT.md:** `.ai-context/visual-bugs/CONSOLIDATED-REPORT.md`
