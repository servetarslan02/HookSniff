# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-08 22:49 GMT+8

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
git clone https://x-access-token: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@github.com/servetarslan02/HookSniff.git
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
cat .ai-context/EXTERNAL_TOKENS.md
```

---

## 📌 Proje Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Repo** | https://github.com/servetarslan02/HookSniff |
| **GitHub Token** | `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` |
| **Dashboard** | https://hooksniff.vercel.app |
| **API** | https://hooksniff-api-1046140057667.europe-west1.run.app |
| **Worker** | https://hooksniff-worker-1046140057667.europe-west1.run.app |
| **Region** | europe-west1 (GCP Cloud Run) |
| **DB** | Neon PostgreSQL (eu-central-1) |
| **Cache** | Upstash Redis (64MB) |
| **Storage** | Cloudflare R2 (hooksniff-storage) |
| **Branch Ruleset** | main-protection (PR + CI checks + no force push + no delete) |

---

## ❌ KALAN SORUNLAR (2026-05-08 22:49)

### CI Hataları (düzeltiliyor)
- Clippy lints failure
- Run tests failure
- Dashboard build failure
- Rust dependency audit failure

### Servet'in görevleri:
- ~~Polar.sh token~~ ✅
- ~~GitHub token~~ ✅
- **iyzico hesap** — vergi levhası + banka hesabı

### Eksik Backend (Mobil için)
1. Push notification (FCM/APNs)
2. Şifre sıfırlama API'si
3. Email doğrulama API'si
4. Refresh token
5. 2FA

### Düşük öncelik
- OpenAPI spec boş
- 107 eski domain referansı
- console.log kalıntıları

---

## ⚠️ GitHub Actions Dakika Limiti

GitHub Free plan, private repo'lar için ayda 2,000 dakika Actions limiti var.
Çözüm: Repo'yu geçici olarak public yapıp CI çalıştır, sonra tekrar private yap.

```bash
# Public yap
curl -X PATCH -H "Authorization: token TOKEN" "https://api.github.com/repos/servetarslan02/HookSniff" -d '{"private": false}'

# CI tetikle + bekle

# Private yap
curl -X PATCH -H "Authorization: token TOKEN" "https://api.github.com/repos/servetarslan02/HookSniff" -d '{"private": true}'
```

---

## 🔄 Hafıza Kuralları

Her oturum sonunda:
1. `.ai-context/MEMORY.md` güncelle
2. `.ai-context/NEXT_SESSION.md` güncelle
3. `git add -A && git commit && git push origin main`
