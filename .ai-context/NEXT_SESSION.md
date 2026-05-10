# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 19:12 GMT+8

---

## ✅ Tamamlanan Oturumlar

### Oturum 73 — Rate Limiting ✅
- HS-001, HS-002, HS-003, HS-008

### Oturum 74 — Webhook Verification & Ownership ✅
- HS-004, HS-005, HS-009, HS-038a, HS-038b

### Oturum 75 — Infrastructure & Security Config ✅
- HS-006, HS-007, HS-010, HS-038c

### Oturum 76 — Dashboard Routing ✅
- HS-030: `getLocalizedHref` double-prefix düzeltildi
- HS-072: ❌ Yanlış bulgu — guard ile korunuyor
- HS-075: ❌ Yanlış bulgu — middleware atlıyor

---

## 🔴 Sıradaki Oturum: #77 — Frontend-Backend API Uyumsuzluğu

### Görev
Frontend-Backend API uyumsuzluklarını düzelt.

### Düzeltilcek Sorunlar
| ID | Sorun | Dosya |
|----|-------|-------|
| HS-031 | Revenue, Billing, Notifications format mismatch | `dashboard/src/app/[locale]/dashboard/` |
| HS-034 | Fiyat uyumsuzluğu — Frontend $49/$149, Backend $29/$99 | `dashboard/` + `api/src/routes/billing.rs` |
| HS-028 | Search sayfasında Authorization header eksik | `dashboard/src/app/[locale]/dashboard/search/page.tsx` |
| HS-029 | Search'de debounce yok | `dashboard/src/app/[locale]/dashboard/search/page.tsx` |

### Yaklaşım
1. Dashboard sayfalarındaki API çağrılarını incele
2. Backend response format'ı ile eşle
3. Fiyat sabitlerini düzelt ($49/$149 → $29/$99)
4. Search'e Authorization header ve debounce ekle

### Oturum Sonunda
- [ ] ISSUE-TRACKER.md'de HS-031, HS-034, HS-028, HS-029'yi ✅ ile işaretle
- [ ] SESSION-PLAN.md'de Oturum 77'yi ✅ ile işaretle
- [ ] MEMORY.md'yi güncelle
- [ ] NEXT_SESSION.md'yi güncelle (Oturum 78 planı)
- [ ] GitHub'a push et

---

## 📋 Sıradaki 5 Oturum

| # | Görev | Sorunlar |
|---|-------|----------|
| 77 | **Frontend-Backend API Uyumsuzluğu** | HS-031, HS-034, HS-028, HS-029 |
| 78 | Billing & Account Endpoints | HS-032, HS-033, HS-073, HS-074, HS-076 |
| 79 | SSRF & Security Hardening | HS-011, HS-012, HS-013, HS-014, HS-015, HS-016 |
| 80 | Worker & Backend Core | HS-018, HS-019, HS-020, HS-021, HS-022, HS-023 |
| 81 | Database Issues | HS-024, HS-025, HS-026, HS-027, HS-038d, HS-038e |

---

## 📊 İlerleme

| Kategori | Toplam | Tamamlanan | Kalan |
|----------|--------|-----------|-------|
| 🚨 P0 | 14 | 13 | 1 |
| 🔴 P1 | 44 | 1 (+2 yanlış) | 41 |
| 🟡 P2 | 38 | 0 | 38 |
| 🟢 P3 | 13 | 0 | 13 |
| **TOPLAM** | **103** | **14** | **89** |

---

## 📝 Proje Bilgileri

- **Repo:** https://github.com/servetarslan02/HookSniff
- **API:** hooksniff-api-1046140057667.europe-west1.run.app
- **Dashboard:** https://hooksniff.vercel.app
- **Admin:** servetarslan02@gmail.com / Alayci_165 (business, admin)
- **Demo:** demo@hooksniff.com / Demo1234! (free, non-admin)
