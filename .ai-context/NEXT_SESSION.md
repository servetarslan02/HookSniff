# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-09 00:42 GMT+8

---

## ⚠️ KRİTİK KURAL: REPO AYRIMI

| İş Türü | Repo | Branch |
|---------|------|--------|
| Hata düzeltme, fix, refactor | `servetarslan02/HookSniff` (orijinal) | main |
| Yeni web özellikleri | `servetarslan02/hooksniff-lab` (lab) | feature/... |
| Mobil uygulama | `servetarslan02/hooksniff-mobile` | main |
| Market research, plan, notlar | `.ai-context/` klasörü (her iki repo'da) | main |

---

## 🚀 Yeni Oturuma Başlarken

### 1. Adım: Projeyi Klonla
```bash
cd /root/.openclaw/workspace
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff
```

### 2. Adım: Rust Kur (eğer yoksa)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
```

### 3. Adım: Hafıza Dosyalarını Oku
```bash
cat .ai-context/MEMORY.md
cat .ai-context/NEXT_SESSION.md
```

---

## 📌 Proje Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Repo** | https://github.com/servetarslan02/HookSniff |
| **GitHub Token** | Environment değişkeni `GITHUB_TOKEN` olarak ayarlanacak |
| **Dashboard** | https://hooksniff.vercel.app |
| **API** | https://hooksniff-api-1046140057667.europe-west1.run.app |
| **Worker** | https://hooksniff-worker-1046140057667.europe-west1.run.app |

---

## ⏳ BEKLEYEN İŞLER

### PR #31 — Merge Bekliyor
- **Branch:** `feat/mobile-backend-features`
- **İçerik:** 5 backend feature (password reset, email verification, refresh token, 2FA, push notifications)
- **Durum:** `cargo check` temiz, CI private repo'da çalışmadı (dakika limiti)
- **Merge için:** Repo public yap → CI geçsin → merge → private yap
- **Link:** https://github.com/servetarslan02/HookSniff/pull/31

### Servet'in görevleri:
- **iyzico hesap** — vergi levhası + banka hesabı

### Deploy Sonrası Eklenecek Env Var'lar
- `EMAIL_BASE_URL` — dashboard URL (örn: `https://hooksniff.vercel.app`)
- `FCM_SERVER_KEY` — Firebase Cloud Messaging server key

### Teknik Borç
- sqlx 0.7.4 → 0.8 upgrade (security audit vulnerabilities)
- 107 eski domain referansı
- console.log kalıntıları

---

## ✅ TAMAMLANAN (Oturum 15 — 2026-05-09)

1. CI düzeltmeleri — PR #29 (cache key reset) + PR #30 (ubuntu-latest) merge
2. Repo public/private toggle — dakika limiti sıfırlandı
3. 5 yeni backend feature (sub-agent ile kodlandı):
   - `POST /v1/auth/forgot-password` + `POST /v1/auth/reset-password`
   - `POST /v1/auth/verify-email` + `POST /v1/auth/resend-verification`
   - `POST /v1/auth/refresh` (15dk access + 30 gün refresh)
   - `POST /v1/auth/2fa/enable` + `confirm` + `disable` + `verify`
   - `POST /v1/devices` + `GET /v1/devices` + `DELETE /v1/devices/{token}`
4. 5 yeni migration (030-034)
5. PR #31 açıldı

---

## 🔄 Hafıza Kuralları

Her oturum sonunda:
1. `.ai-context/MEMORY.md` güncelle
2. `.ai-context/NEXT_SESSION.md` güncelle
3. `git add -A && git commit && git push origin main`

---

## ⚠️ REPO PUBLIC/PRIVATE İŞLEMİ (CI DAKİKA LİMİTİ İÇİN)

Private repo = 2000 dk/ay Actions limiti. Çözüm: geçici public.

### Sıra:
1. **Sensitive dosyaları local'e kaydet** → `EXTERNAL_TOKENS.md` + `gcp-service-account.json`
2. **Repo'dan sil** → commit + push (veya PR'dan önce branch'te sil)
3. **Public yap** → `PATCH /repos/... {"private": false}`
4. **CI tamamlanmasını bekle** → 6/6 job yeşil
5. **Private yap** → `PATCH /repos/... {"private": true}`
6. **Sensitive dosyaları geri yükle** → commit + push

⚠️ Public iken EXTERNAL_TOKENS.md görünür olur — hızlı ol!
