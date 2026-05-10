# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-11 00:36 GMT+8

---

## ✅ Tamamlanan Oturumlar

### Oturum 73-94 ✅
- Tüm P0 + P1 tamamlandı

### Oturum 95 ✅ (2026-05-11 00:00 - 00:18)
**Major dependency güncellemeleri (kalan 4):**
- sqlx 0.7→0.8 ✅ (encode_by_ref Result dönüş tipi — fifo/mod.rs düzeltildi)
- redis 0.25→1.2 ✅ (sorunsuz, API değişmemiş)
- rand 0.8→0.10 ✅ (OsRng→SysRng, RngCore→TryRng, thread_rng→rng, distributions→distr)
- prometheus zaten 0.14'müş ✅ (NEXT_SESSION.md'de yanlış yazılmış)
**Dashboard npm update:**
- react 19.2.5→19.2.6, next 15.5.15→15.5.18, next-intl 4.11.0→4.11.1, @types/node 20.19.39→20.19.40
**Testler:** 999/999 (979 API + 20 worker)
**ESLint:** clean
**Commit:** `cb3ed64` — main branch

🎉 **TÜM RUST MAJOR BAĞIMLILIKLARI ARTIK EN GÜNCEL!**

---

## 🟡 Sıradaki Oturum: #96

### 1. Dependabot Major PR'ları (npm)
Bunlar major version bump — dikkatli ol:
```
typescript 5.9.3 → 6.0.3      ← MAJOR, breaking changes bekleniyor
tailwindcss 3.4.19 → 4.3.0    ← MAJOR, config değişiklikleri gerekli
recharts 2.15.4 → 3.8.1       ← MAJOR, API değişiklikleri
next 15.5.18 → 16.2.6         ← MAJOR, app router değişiklikleri
```
**Strateji:** Her birini tek tek dene, compile et, test et. Olmazsa geri al.

### 2. Kalan P2 Sorunları
| ID | Sorun | Zorluk |
|----|-------|--------|
| HS-065 | 920+ hardcoded string (i18n) | 🔴 Büyük iş |
| HS-066 | 71 sayfada metadata eksik | 🟡 Orta |
| HS-081 | 11 SDK'da retry logic yok | 🟡 Orta |
| HS-082 | Kotlin version mismatch | 🟢 Kolay |
| HS-083 | OpenAPI schema mismatch | 🟡 Orta |
| HS-084 | Polar/iyzico fatura handler | 🟡 Orta |
| HS-085-089 | Test coverage (5 modül) | 🔴 Büyük iş |

### 3. Silinmeyen Branch'ler
- `feat/mobile-backend-features` — password reset, email verify, 2FA, push notifications
- `ai-agent-layer` — PostgreSQL AI agents migration
- Bu branch'lerdeki iş main'e merge edilmeli veya Servet'e sorulmalı

### 4. tracing-opentelemetry Vendor Kaldırma
- Upstream `tracing-opentelemetry 0.33` çıktığında vendor patch'ini kaldır
- `vendor/tracing-opentelemetry/` klasörünü sil
- `[patch.crates-io]` section'ını workspace Cargo.toml'dan kaldır
- `tracing-opentelemetry = "0.33"` yap

### 5. Unused Code Temizliği
- `worker/src/circuit_breaker.rs` — `get_state`, `get_all` never used
- `api/src/middleware/mod.rs` — `cleanup` never used
- Bu warning'leri temizle (dead_code)

---

## 📊 İlerleme

| Kategori | Toplam | Tamamlanan | Kalan |
|----------|--------|-----------|-------|
| 🚨 P0 | 14 | 13 | 1 |
| 🔴 P1 | 44 | 46 | 0 |
| 🟡 P2 | 38 | 21 | 17 |
| 🟢 P3 | 13 | 1 | 12 |
| **TOPLAM** | **103** | **81** | **22** |

### Dependency Durumu
| Kategori | Durum |
|----------|-------|
| Rust major deps | ✅ TAMAMI GÜNCEL |
| npm semver-compatible | ✅ Güncellendi |
| npm major deps | ⏳ Beklemede (TS6, TW4, Recharts3, Next16) |

---

## 🔧 Zorunlu Kurallar (Her Oturum)

### Kurulum Kontrolü
```bash
source "$HOME/.cargo/env" && rustc --version && cargo --version
node --version && npm --version
```
Eğer Rust yoksa kur: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y`

### Her Değişiklik Sonrası Zorunlu
1. `cargo check` (compile)
2. `cargo test -p hooksniff-api --lib && cargo test -p hooksniff-worker` (testler)
3. `cd dashboard && npm run lint && npx tsc --noEmit` (frontend)
4. `git push` (GitHub)

### Erteleme YASAK
- "Daha sonra yaparız" → ❌ Hemen yap
- "Riskli dokunmayalım" → ❌ Araştır, test et, yap
- "Büyük iş" → ❌ Parçala, başla

### İş Kalite Kuralları (ZORUNLU)
- ❌ **Yarım iş yasak** — başladığın işi bitir, compile et, test et, push et
- ❌ **Hızlıya kaçmak yasak** — "çabuk bitireyim" diye adım atlanmaz
- ❌ **Üstün körü iş yasak** — "galiba doğru" yetmez, compile + test zorunlu
- ❌ **Erteleme yasak** — "daha sonra", "büyük iş", "riskli" kabul edilmez
- ✅ **Detaylı değerlendirme** — her iş titizlikle kontrol edilecek
- ✅ **Parça parça ilerle** — büyük işleri böl, her parçayı doğrula
- ✅ **Sor** — emin değilsen Servet'e sor, tahmin yürütme
