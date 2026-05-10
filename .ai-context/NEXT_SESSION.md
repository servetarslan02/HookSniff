# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 19:08 GMT+8

---

## ✅ Tamamlanan Oturumlar

### Oturum 73 — Rate Limiting ✅
- HS-001, HS-002, HS-003, HS-008

### Oturum 74 — Webhook Verification & Ownership ✅
- HS-004, HS-005, HS-009, HS-038a, HS-038b

### Oturum 75 — Infrastructure & Security Config ✅
- HS-006: Grafana token placeholder
- HS-007: `.gitignore`'a `.env` eklendi
- HS-010: Worker concurrent limit (semaphore, max 10)
- HS-038c: Billing webhook rate limit (30/dakika/IP)

---

## 🔴 Sıradaki Oturum: #76 — Dashboard Routing (EN KRİTİK)

### Görev
Dashboard routing düzeltmesi — 16 sayfa yanlış içerik gösteriyor.

### Düzeltilcek Sorunlar
| ID | Sorun | Dosya |
|----|-------|-------|
| HS-030 | Dashboard routing çökmüş — 16 sayfa yanlış içerik | `dashboard/src/app/[locale]/` |
| HS-072 | `token!` non-null assertion → null token ile API çağrısı | `dashboard/src/store.tsx` |
| HS-075 | `store.tsx` token her zaman `'cookie'` → anlamsız Bearer | `dashboard/src/store.tsx` |

### Yaklaşım
1. Dashboard route yapısını incele
2. Dynamic import'ları kontrol et
3. `store.tsx` token mantığını düzelt
4. Non-null assertion'ları güvenli hale getir

### Oturum Sonunda
- [ ] ISSUE-TRACKER.md'de HS-030, HS-072, HS-075'i ✅ ile işaretle
- [ ] SESSION-PLAN.md'de Oturum 76'yı ✅ ile işaretle
- [ ] MEMORY.md'yi güncelle
- [ ] NEXT_SESSION.md'yi güncelle (Oturum 77 planı)
- [ ] GitHub'a push et

---

## 📋 Sıradaki 5 Oturum

| # | Görev | Sorunlar |
|---|-------|----------|
| 76 | **Dashboard Routing** | HS-030, HS-072, HS-075 |
| 77 | Frontend-Backend API Uyumsuzluğu | HS-031, HS-034, HS-028, HS-029 |
| 78 | Billing & Account Endpoints | HS-032, HS-033, HS-073, HS-074, HS-076 |
| 79 | SSRF & Security Hardening | HS-011, HS-012, HS-013, HS-014, HS-015, HS-016 |
| 80 | Worker & Backend Core | HS-018, HS-019, HS-020, HS-021, HS-022, HS-023 |

---

## 📊 İlerleme

| Kategori | Toplam | Tamamlanan | Kalan |
|----------|--------|-----------|-------|
| 🚨 P0 | 14 | 13 | 1 |
| 🔴 P1 | 44 | 0 | 44 |
| 🟡 P2 | 38 | 0 | 38 |
| 🟢 P3 | 13 | 0 | 13 |
| **TOPLAM** | **103** | **13** | **90** |

---

## 📝 Proje Bilgileri

- **Repo:** https://github.com/servetarslan02/HookSniff
- **API:** hooksniff-api-1046140057667.europe-west1.run.app
- **Dashboard:** https://hooksniff.vercel.app
- **Admin:** servetarslan02@gmail.com / Alayci_165 (business, admin)
- **Demo:** demo@hooksniff.com / Demo1234! (free, non-admin)
