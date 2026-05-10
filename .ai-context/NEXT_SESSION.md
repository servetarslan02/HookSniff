# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 19:00 GMT+8

---

## ✅ Tamamlanan Oturumlar

### Oturum 73 — Rate Limiting ✅
- HS-001: `verify_email` → 5/dakika/IP
- HS-002: `verify_2fa` → 5/dakika/IP
- HS-003: `refresh_token` → 10/dakika/IP
- HS-008: `contact` → 3/dakika/IP

---

## 🔴 Sıradaki Oturum: #74 — Webhook Verification & Ownership

### Görev
Inbound webhook ve billing webhook'larda signature verification zorunlu kıl. Schema endpoint'lerinde ownership check ekle.

### Düzeltilcek Sorunlar
| ID | Sorun | Dosya |
|----|-------|-------|
| HS-004 | Inbound webhook signature verification optional — secret boşsa `Ok(())` | `api/src/routes/inbound.rs` |
| HS-005 | Billing webhook secret boşsa verification atlıyor | `api/src/routes/billing.rs` |
| HS-009 | Schema endpoint'lerinde ownership check yok — cross-tenant leak | `api/src/routes/schemas.rs` |
| HS-038a | `handle_inbound_to_endpoint` Authorization bypass — sadece prefix lookup | `api/src/routes/inbound.rs` |
| HS-038b | Prefix length mismatch — 20 char lookup ama DB'de 15 char prefix | `api/src/routes/inbound.rs` |

### Yaklaşım
1. `api/src/routes/inbound.rs` — secret boşsa 403 döndür, full hash doğrulaması ekle
2. `api/src/routes/billing.rs` — webhook secret boşsa verification atlama
3. `api/src/routes/schemas.rs` — customer_id ownership kontrolü ekle

### Oturum Sonunda
- [ ] ISSUE-TRACKER.md'de HS-004, HS-005, HS-009, HS-038a, HS-038b'yi ✅ ile işaretle
- [ ] SESSION-PLAN.md'de Oturum 74'ü ✅ ile işaretle
- [ ] MEMORY.md'yi güncelle
- [ ] NEXT_SESSION.md'yi güncelle (Oturum 75 planı)
- [ ] GitHub'a push et

---

## 📋 Sıradaki 5 Oturum

| # | Görev | Sorunlar |
|---|-------|----------|
| 74 | **Webhook Verification & Ownership** | HS-004, HS-005, HS-009, HS-038a, HS-038b |
| 75 | Infrastructure & Security Config | HS-006, HS-007, HS-010, HS-038c |
| 76 | Dashboard Routing (EN KRİTİK) | HS-030, HS-072, HS-075 |
| 77 | Frontend-Backend API Uyumsuzluğu | HS-031, HS-034, HS-028, HS-029 |
| 78 | Billing & Account Endpoints | HS-032, HS-033, HS-073, HS-074, HS-076 |

---

## 📊 İlerleme

| Kategori | Toplam | Tamamlanan | Kalan |
|----------|--------|-----------|-------|
| 🚨 P0 | 14 | 4 | 10 |
| 🔴 P1 | 44 | 0 | 44 |
| 🟡 P2 | 38 | 0 | 38 |
| 🟢 P3 | 13 | 0 | 13 |
| **TOPLAM** | **103** | **4** | **99** |

---

## 📝 Proje Bilgileri

- **Repo:** https://github.com/servetarslan02/HookSniff
- **API:** hooksniff-api-1046140057667.europe-west1.run.app
- **Dashboard:** https://hooksniff.vercel.app
- **Admin:** servetarslan02@gmail.com / Alayci_165 (business, admin)
- **Demo:** demo@hooksniff.com / Demo1234! (free, non-admin)
