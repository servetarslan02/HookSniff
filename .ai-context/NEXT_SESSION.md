# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 19:18 GMT+8

---

## ✅ Tamamlanan Oturumlar

### Oturum 73 — Rate Limiting ✅
- HS-001, HS-002, HS-003, HS-008

### Oturum 74 — Webhook Verification & Ownership ✅
- HS-004, HS-005, HS-009, HS-038a, HS-038b

### Oturum 75 — Infrastructure & Security Config ✅
- HS-006, HS-007, HS-010, HS-038c

### Oturum 76 — Dashboard Routing ✅
- HS-030: Double-prefix düzeltildi
- HS-072, HS-075: Yanlış bulgu

### Oturum 77 — Frontend-Backend API Uyumsuzluğu ✅
- HS-031: Billing plan key fix (API'ye plan key gönderimi)
- HS-034: $49/$149 → $29/$99 (13 dosya)
- HS-028: Yanlış bulgu (cookie auth çalışıyor)
- HS-029: Search'e 300ms debounce eklendi

---

## 🔴 Sıradaki Oturum: #78 — Billing & Account Endpoints

### Görev
Abonelik iptal ve hesap silme endpoint'lerini düzelt.

### Düzeltilcek Sorunlar
| ID | Sorun | Dosya |
|----|-------|-------|
| HS-032 | Abonelik iptal endpoint'i yok — 405 | `api/src/routes/billing.rs` |
| HS-033 | Hesap silme bozuk — yanlış endpoint | `dashboard/src/app/[locale]/dashboard/settings/page.tsx` |
| HS-073 | Hardcoded `Authorization: 'Bearer YOUR_TOKEN'` | `dashboard/src/app/[locale]/dashboard/` |
| HS-074 | `health/page.tsx` token kullanmıyor | `dashboard/src/app/[locale]/dashboard/health/page.tsx` |
| HS-076 | `api-keys/page.tsx` credentials yanlış yerde | `dashboard/src/app/[locale]/dashboard/api-keys/page.tsx` |

### Yaklaşım
1. `billing.rs` — `DELETE /billing/subscription` endpoint'i ekle
2. `settings/page.tsx` — Hesap silme endpoint'ini düzelt (`/auth/account`)
3. Hardcoded token'ları kaldır
4. Health page'e auth ekle
5. API keys credentials'ı düzelt

---

## 📋 Sıradaki 5 Oturum

| # | Görev | Sorunlar |
|---|-------|----------|
| 78 | **Billing & Account Endpoints** | HS-032, HS-033, HS-073, HS-074, HS-076 |
| 79 | SSRF & Security Hardening | HS-011, HS-012, HS-013, HS-014, HS-015, HS-016 |
| 80 | Worker & Backend Core | HS-018, HS-019, HS-020, HS-021, HS-022, HS-023 |
| 81 | Database Issues | HS-024, HS-025, HS-026, HS-027, HS-038d, HS-038e |
| 82 | Auth & Crypto Security | HS-038f, HS-038g, HS-038h, HS-038i, HS-038j, HS-038k, HS-038l |

---

## 📊 İlerleme

| Kategori | Toplam | Tamamlanan | Kalan |
|----------|--------|-----------|-------|
| 🚨 P0 | 14 | 13 | 1 |
| 🔴 P1 | 44 | 4 (+3 yanlış) | 37 |
| 🟡 P2 | 38 | 0 | 38 |
| 🟢 P3 | 13 | 0 | 13 |
| **TOPLAM** | **103** | **17** | **86** |
