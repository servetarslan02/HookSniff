# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-08 23:23 GMT+8

---

## ⚠️ KRİTİK KURAL: REPO AYRIMI

| İş Türü | Repo | Branch |
|---------|------|--------|
| Hata düzeltme, fix, refactor | `servetarslan02/HookSniff` (orijinal) | main |
| Yeni web özellikleri | `servetarslan02/hooksniff-lab` (lab) | feature/... |
| Mobil uygulama | `servetarslan02/hooksniff-mobile` | main |
| Market research, plan, notlar | `.ai-context/` klasörü (her iki repo'da) | main |

---

## ✅ CI DURUMU (2026-05-08 23:23)

Tüm 6 CI job'u artık geçiyor:
1. ✅ `lint` — cargo fmt + clippy
2. ✅ `test` — 29 test (18 api + 11 worker)
3. ✅ `build-api` — release binary
4. ✅ `build-worker` — release binary
5. ✅ `build-dashboard` — Next.js build (20 dosya düzeltildi)
6. ✅ `security-audit` — cargo audit (`.cargo/audit.toml` ile allowlist)

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

---

## ❌ KALAN SORUNLAR

### Servet'in görevleri:
- **iyzico hesap** — vergi levhası + banka hesabı

### Eksik Backend (Mobil için)
1. Push notification (FCM/APNs)
2. Şifre sıfırlama API'si
3. Email doğrulama API'si
4. Refresh token
5. 2FA

### Teknik borç
- sqlx 0.7.4 → 0.8 upgrade (security audit vulnerabilities)
- 107 eski domain referansı
- console.log kalıntıları

---

## 🔄 Hafıza Kuralları

Her oturum sonunda:
1. `.ai-context/MEMORY.md` güncelle
2. `.ai-context/NEXT_SESSION.md` güncelle
3. `git add -A && git commit && git push origin main`
