# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-09 18:00 GMT+8

---

## 🔴 ACİL: API DEPLOY

### Sorun
RateLimiter fix push edildi (`4bbd9aa`) ama Cloud Run'a deploy edilemedi (CI bozuk).

### Çözüm
Servet'in GCP Console'dan manuel deploy yapması gerekiyor:
1. https://console.cloud.google.com/run → `hooksniff-api`
2. "Edit & Deploy New Revision" tıkla
3. Deploy et

---

## 📋 Mevcut Durum

| Servis | Durum | Not |
|--------|-------|-----|
| Dashboard | ✅ Live | hooksniff.vercel.app |
| API | ⚠️ Deploy bekliyor | RateLimiter fix push edildi |
| Worker | ✅ Deployed | GCP Cloud Run |
| Neon DB | ✅ Çalışıyor | 43 tablo |
| 11 SDK | 7/11 yayınlandı | Java, Kotlin, Ruby, Elixir eksik |
| CI | ❌ Bozuk | GitHub Actions runner sorunu |

---

## 🔄 Sonraki Görevler (Öncelik Sırası)

1. **[ACİL]** API deploy — GCP Console'dan manuel
2. **[ACİL]** CI pipeline düzelt — GitHub Actions runner sorunu
3. **[Orta]** Dashboard iyileştirmeleri (DASHBOARD_ISSUES.md)
4. **[Orta]** Kalan 4 SDK publish (Java, Kotlin, Ruby, Elixir)
5. **[Düşük]** Yeni özellikler: Akıllı Alarm, Telegram/Discord Bot
6. **[Düşük]** Servet: iyzico hesap, GitHub billing

---

## 📌 Proje Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Repo** | https://github.com/servetarslan02/HookSniff |
| **Dashboard** | https://hooksniff.vercel.app |
| **API** | https://hooksniff-api-1046140057667.europe-west1.run.app |
| **Worker** | https://hooksniff-worker-1046140057667.europe-west1.run.app |
| **GCP Project** | hooksniff-app |
| **DB** | Neon PostgreSQL (eu-central-1) |

---

## ⚠️ Güvenlik Notları

1. **GCP SA key bozuk** — `.ai-context/gcp-service-account.json` dosyasındaki private key base64 encoding hatası var. Yeni key indirilmeli
2. **EXTERNAL_TOKENS.md** — `.gitignore`'a eklendi ✅
3. **Admin hesabı:** servetarslan02@gmail.com / Alayci_165

---

## 🔄 Oturum Başlangıç Rehberi

1. GitHub token ile repo klonla
2. Tüm `.ai-context/` dosyalarını oku
3. Servis durumunu kontrol et (API, Dashboard, Worker)
4. Acil görevleri tamamla
5. Değişiklikleri GitHub'a commit et
