# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-09 01:37 GMT+8

---

## ⚠️ KRİTİK KURAL: REPO AYRIMI

| İş Türü | Repo | Branch |
|---------|------|--------|
| Hata düzeltme, fix, refactor | `servetarslan02/HookSniff` (orijinal) | main |
| Yeni web özellikleri | `servetarslan02/hooksniff-lab` (lab) | feature/... |
| Mobil uygulama | `servetarslan02/hooksniff-mobile` | main |
| Market research, plan, notlar | `.ai-context/` klasörü (her iki repo'da) | main |

---

## ⚠️ CI POLİTİKASI (Servet Kararı — 2026-05-09)

**GitHub Actions kullanılmAYACAK.** Yerine local CI:

```bash
source "$HOME/.cargo/env"
cargo fmt --check
cargo clippy -- -D warnings
cargo test
cargo build --release
cd dashboard && npm install && npm run build
```

PR merge: admin override ile CI bypass.

---

## 🚀 Yeni Oturuma Başlarken

1. `.ai-context/MEMORY.md` ve `.ai-context/NEXT_SESSION.md` oku
2. Gerekirse repo'yu klonla
3. Rust kurulu değilse kur: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y`

---

## 📌 Proje Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Repo** | https://github.com/servetarslan02/HookSniff |
| **Dashboard** | https://hooksniff.vercel.app |
| **API** | https://hooksniff-api-1046140057667.europe-west1.run.app |
| **Worker** | https://hooksniff-worker-1046140057667.europe-west1.run.app |

---

## 📋 YENİ OTURUM YAPILACAKLAR — MEVCUT SİSTEMİ KUSURSUZLAŞTIR

### 1. OpenAPI Spec Yaz (🔴 Yüksek Öncelik)
- **Dosya:** `docs/openapi.yaml` — şu an boş (1 satır)
- Tüm endpoint'ler için OpenAPI 3.0 spec yaz
- SDK otomatik üretimi ve dokümantasyon için gerekli

### 2. `.env.production.example` Güncelle (🔴 Yüksek Öncelik)
- `EMAIL_BASE_URL=https://hooksniff.vercel.app` ekle (PR #31 sonrası)
- `FCM_SERVER_KEY=` ekle (PR #31 sonrası)
- Email section: "Resend" → "Gmail API" olarak güncelle

### 3. console.log Temizle (🟡 Orta)
- `dashboard/src/app/[locale]/docs/sdks/page.tsx` — 3 adet
- `dashboard/src/app/[locale]/docs/page.tsx` — 1 adet

### 4. TODO Çöz veya Sil (🟡 Orta)
- `api/src/config.rs` — 1 adet TODO
- `dashboard/src/messages/es.json` — 1 adet
- `dashboard/src/messages/pt-BR.json` — 1 adet

### 5. Vercel Deploy Hook Düzelt (🟡 Orta)
- EXTERNAL_TOKENS.md'de deploy hook URL'inde farklı project ID var
- `prj_NQgFly8h06oH5DTzClj7vyq3hqSO` → `prj_cSIVYHpCoAtoihRp8xlXIun1KVSR` ile eşleşmeli

### 6. Servis Doğrulama (⚠️ Test Edilmeli)
- Neon DB bağlantı testi
- Grafana OTEL doğrulama
- GCP Service Account doğrulama

### 7. Dependency Temizliği (🟢 Düşük)
- `cargo-udeps` ile kullanılmayan Rust dependency'leri tespit et
- API: 37, Worker: 22 dependency

---

## ⏳ SERVET'İN GÖREVLERİ

- **iyzico hesap** — vergi levhası + banka hesabı
- **GitHub billing** — $12 fatura (opsiyonel)

---

## 🔄 Hafıza Kuralları

Her oturum sonunda:
1. `.ai-context/MEMORY.md` güncelle
2. `.ai-context/NEXT_SESSION.md` güncelle
3. GitHub API ile push et
