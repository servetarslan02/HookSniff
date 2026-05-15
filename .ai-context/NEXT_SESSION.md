# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-15 14:10 GMT+8 (Oturum 165)

## ✅ Tamamlanan (Bu Oturum)

### Background Job Queue (Redis) ✅
- **Yeni dosya:** `api/src/jobs/job_queue.rs` — Redis LPUSH/BRPOP job queue
- **Job tipleri:**
  - Email (welcome, verification, password reset, invoice, webhook success)
  - Notification (FCM push)
  - ScheduledCleanup (distributed lock ile)
- **Distributed locks:** Scheduled job'lar sadece 1 instance tarafından çalıştırılır
- **Delayed retry:** Exponential backoff (2^n saniye), Redis sorted set ile
- **Fallback:** Redis yoksa `tokio::spawn` kullanır
- **auth.rs:** register, forgot_password, resend_verification → job queue
- **main.rs:** retention, monthly_reset, cleanup_6h → distributed lock
- **Test:** 1072 test geçti, clippy 0 uyarı
- **Commit:** `becd6509`

## 📋 Kalan Performance Roadmap

### Orta Vade
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 1 | Background Job Queue | ✅ | Redis LPUSH/BRPOP + distributed lock |
| 2 | Read Replica (Neon) | ❌ | Neon free tier'da read replica desteklenmiyor |
| 3 | Cloud CDN headers | ❌ | Cloudflare/Cloud Run seviyesinde yapılabilir |

### Büyük İş
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 4 | WebSocket live updates | ❌ | Büyük iş, öncelik düşük |
| 5 | Edge Workers (Cloudflare) | ❌ | Büyük iş, öncelik düşük |
| 6 | Event Sourcing | ❌ | Büyük iş, öncelik düşük |
| 7 | Multi-Region DB | ❌ | Büyük iş, maliyetli |

## 📋 Servet'in Yapması Gereken

| Görev | Durum | Not |
|-------|-------|-----|
| GitHub PAT yenile | ⚠️ | Token sohbette paylaşıldı, iptal et! |
| iyzico hesap aç | ❌ | Vergi levhası + banka hesabı gerekli |
| Domain kararı | ❌ | hooksniff.vercel.app yeterli şimdilik |

## Hesap Bilgileri
- Admin: servetarslan02@gmail.com / Alayci_165
- Demo: demo@hooksniff.com / Demo1234!
- Dashboard: https://hooksniff.vercel.app
- API: https://hooksniff-api-1046140057667.europe-west1.run.app
