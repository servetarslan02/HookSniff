# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-09 02:38 GMT+8

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

## 🔴 KRİTİK: GRAFANA OTEL TOKEN (Oturum 16'da çözülemedi)

### Sorun
- Mevcut `glc_` token'lar 401 döndü (tüm region'lar denendi: eu-west-2, us-central-0, us-east-0)
- `glsa_` token da "legacy auth cannot be upgraded" hatası verdi
- Grafana Cloud UI'da JS hatası (`removeChild`) — plugin bug

### Çözüm (yeni oturumda yapılacak)
1. Servet'ten Grafana Cloud **API Key** (glsa_ değil, doğrudan API Key) iste
2. Grafana Cloud → profil → **API Keys** → **Add API Key** → Role: `Editor`
3. Alternatif: `https://grafana.com/orgs/hooksniff/api-keys` adresinden doğrudan oluştur
4. Token geldiğinde test et:
```bash
curl -X POST https://otlp-gateway-prod-eu-west-2.grafana.net/otlp/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <INSTANCE_ID>:<TOKEN>" \
  -d '{"resourceSpans":[]}'
```
5. EXTERNAL_TOKENS.md'de `GRAFANA_OTEL_HEADERS` güncelle
6. `.env.production.example`'deki `OTEL_EXPORTER_OTLP_ENDPOINT` ve `OTEL_EXPORTER_OTLP_HEADERS` de güncellenmeli
7. Push et

### Mevcut EXTERNAL_TOKENS.md'deki bilgiler
- Stack ID: `1757335`
- Stack name: `hooksniff-hooksniff2` (yeni) / `grafana-irm-app` (eski)
- Region: `prod-eu-west-2` (muhtemel)
- Eski token (çalışmıyor): `glc_eyJvIjoiMTc1NzMzNSIsIm4iOiJob29rc25pZmYtaG9va3NuaWZmMiIsImsiOiJmR2Y1Mzk3SVk3WU00WDN2azIyaWlDNG4iLCJtIjp7InIiOiJ1cyJ9fQ==`
- Yeni denenen token (çalışmıyor): `glsa_cYOXJb0z8708txX4T1JVCKXCOdUVxHH0_b85ebf39`

---

## 📋 ÖNCEKI GÖREVLER (Tümü tamamlandı ✅)

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

### 6. Servis Doğrulama ✅ TAMAMLANDI (Oturum 16)
- Neon DB ✅ — PostgreSQL 17.8, 43 public tablo
- Grafana OTEL ❌ — 401, token süresi dolmuş → Servet Grafana'dan yeni token almalı
- GCP Service Account ✅ — hooksniff-app, hooksniff-deploy@...

### 7. Dependency Temizliği ✅ TAMAMLANDI (Oturum 16)
- cargo-udeps derlenemedi (nightly uyumsuzluğu), manuel analiz yapıldı
- API: ~40 dependency — tümü kullanımda ✅
- Worker: ~25 dependency — tümü kullanımda ✅
- Gereksiz dependency bulunamadı

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
