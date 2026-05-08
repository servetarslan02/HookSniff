# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-09 01:50 GMT+8

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

### ~~1. OpenAPI Spec Yaz~~ ✅ TAMAMLANDI (Oturum 16)
- **Dosya:** `docs/openapi.yaml` — 74KB, OpenAPI 3.0.3, tüm 60+ endpoint
- SDK otomatik üretimi ve dokümantasyon için hazır

### ~~2. `.env.production.example` Güncelle~~ ✅ TAMAMLANDI (Oturum 16)
- `EMAIL_BASE_URL=https://hooksniff.vercel.app` eklendi
- `FCM_SERVER_KEY=` eklendi
- Email section: "Resend" → "Gmail API" güncellendi

### ~~3. console.log Temizle~~ ⏭️ ATLANDI (Oturum 16)
- SDK dokümantasyon code example'larında, debug kalıntısı değil

### ~~4. TODO Çöz veya Sil~~ ✅ TAMAMLANDI (Oturum 16)
- config.rs ve dashboard mesaj dosyalarında TODO bulunamadı (zaten temiz)

### ~~5. Vercel Deploy Hook Düzelt~~ ✅ TAMAMLANDI (Oturum 16)
- `prj_NQgFly8h...` → `prj_cSIVYHpCoAtoihRp8xlXIun1KVSR` ile eşleştirildi

### 6. Servis Doğrulama (⚠️ Kısmen Test Edildi)
- Neon DB TCP ✅ — psql/node.pg modülü gerektirir
- Grafana OTEL: `OTEL_ENABLED=false` — production'da açılmalı
- GCP Service Account ✅ — hooksniff-app, hooksniff-deploy@...

### 7. Dependency Temizliği (⏳ Beklemede)
- `cargo-udeps` ile kullanılmayan Rust dependency'leri tespit edilmeli
- Ortamda Rust kurulmalı: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y`
- API: ~40, Worker: ~25 dependency (tümü kullanımda görünüyor, cargo-udeps ile doğrulanmalı)

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
