# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-08 19:03 GMT+8

---

## 🚀 Yeni Oturuma Başlarken

### 1. Adım: Projeyi Klonla
```bash
cd /root/.openclaw/workspace
git clone https://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@github.com/servetarslan02/HookSniff.git
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

### 4. Adım: Servet'e Tanıtım Yap
Servet projenin sahibi ama kod bilmiyor. Ona Türkçe olarak mevcut durumu özetle.

---

## 📌 Proje Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Repo** | https://github.com/servetarslan02/HookSniff |
| **GitHub Token** | `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` |
| **Dashboard** | https://hooksniff.vercel.app |
| **API** | https://hooksniff-api-1046140057667.europe-west1.run.app |
| **Worker** | https://hooksniff-worker-1046140057667.europe-west1.run.app |
| **API Health** | https://hooksniff-api-1046140057667.europe-west1.run.app/health |
| **Region** | europe-west1 (GCP Cloud Run) |
| **DB** | Neon PostgreSQL (eu-central-1) |
| **Cache** | Upstash Redis (64MB) |
| **Storage** | Cloudflare R2 (hooksniff-storage) |

---

## 🔧 Servis Kontrolü

```bash
# API health check
curl -s https://hooksniff-api-1046140057667.europe-west1.run.app/health | python3 -m json.tool

# Dashboard kontrol
curl -s -o /dev/null -w "%{http_code}" https://hooksniff.vercel.app

# GitHub Actions durumu
curl -s -H "Authorization: token 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" \
  "https://api.github.com/repos/servetarslan02/HookSniff/actions/runs?per_page=3" | \
  python3 -c "import json,sys
for r in json.load(sys.stdin).get('workflow_runs',[]):
    print(f\"{r['name']} | {r['status']} | {r['conclusion'] or 'pending'}\")"
```

---

## ❌ KALAN 3 TEST HATASI (Öncelikli)

### 1. `validate_json_depth` Test
**Dosya:** `api/src/validation.rs` → `test_validate_json_depth`
**Sorun:** `check_depth(value, 1)` ile başlıyor ama `MAX_JSON_DEPTH = 10`. 10 seviye JSON = depth 11 = hata.
**Çözüm:** `check_depth(value, 0)` ile başlat. Şu anki kod:
```rust
// Değiştir:
check_depth(value, 1)
// Şöyle yap:
check_depth(value, 0)
```

### 2. Stripe Signature Testleri (5 test)
**Dosya:** `api/src/billing/stripe.rs`
**Testler:** `test_verify_signature_valid`, `test_verify_signature_expired_timestamp`, `test_verify_signature_future_timestamp`, `test_verify_signature_tampered_payload`, `test_verify_signature_wrong_secret`
**Sorun:** Timestamp tolerance veya test verileri güncel değil.
**Çözüm:** `stripe.rs` dosyasındaki test fonksiyonlarını incele. Timestamp hesaplamalarını ve tolerance değerlerini düzelt.

### 3. Transform Pipeline Test
**Dosya:** `api/src/transform/mod.rs` → `test_legacy_pipeline_chaining`
**Sorun:** `output.get("name").is_none()` assertion失败
**Çözüm:** Transform filter'ın name field'ını nasıl işlediğini incele.

---

## 📋 Düzeltmeleri Uygula ve Test Et

```bash
# 1. validate_json_depth düzeltmesini yap
# api/src/validation.rs dosyasını aç, check_depth(value, 1) → check_depth(value, 0) yap

# 2. Format
cargo fmt --all

# 3. Derleme kontrol
cargo check --workspace

# 4. Test çalıştır
cargo test --workspace

# 5. Clippy
cargo clippy --workspace

# 6. Commit ve push
git add -A
git commit -m "🔧 Kalan 3 test hatası düzeltildi"
git push origin main
```

---

## ⚠️ Servet'in Yapması Gereken (Ona Hatırlat)

| Görev | Nasıl Yapılır | Durum |
|-------|---------------|-------|
| Polar.sh token | polar.sh → Settings → Access Tokens → Yeni token oluştur | ❌ |
| Resend domain | resend.com → Domains → Yeni domain ekle → DNS kayıtları | ❌ |
| GitHub token | github.com → Settings → Developer settings → Tokens → Yeni PAT | ❌ |
| iyzico hesap | iyzico.com → Başvuru → Vergi levhası + banka hesabı | ❌ |

---

## 📁 Proje Yapısı

```
HookSniff/
├── api/                    # Rust Axum API
│   ├── src/
│   │   ├── main.rs         # Giriş noktası
│   │   ├── lib.rs          # Modül tanımları
│   │   ├── routes/         # API endpoint'leri
│   │   ├── middleware/      # Auth, rate limit, idempotency
│   │   ├── billing/        # Polar.sh, Stripe, iyzico
│   │   └── ...
│   └── Cargo.toml
├── worker/                 # Background worker
│   ├── src/main.rs         # Queue processing + zombie reaper
│   └── Cargo.toml
├── dashboard/              # Next.js 15 dashboard
│   ├── src/
│   │   ├── lib/api.ts      # API client (token destekli)
│   │   └── app/            # Sayfalar
│   └── package.json
├── .github/workflows/      # CI/CD
│   ├── ci.yml              # Lint + test + build
│   └── deploy.yml          # Cloud Run deploy
├── .ai-context/            # AI hafıza dosyaları
│   ├── MEMORY.md           # Proje durumu
│   ├── NEXT_SESSION.md     # Bu dosya
│   └── EXTERNAL_TOKENS.md  # Token'lar
├── migrations/             # PostgreSQL migration'ları
└── docker-compose.yml
```

---

## 🔄 Hafıza Kuralları

Her oturum sonunda:
1. `.ai-context/MEMORY.md` güncelle
2. `.ai-context/NEXT_SESSION.md` güncelle
3. `git add -A && git commit && git push origin main`
4. Gereksiz dosyaları commit etme
