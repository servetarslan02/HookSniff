# 🦀 Rust Backend Güncelleme Rehberi

> Risk: 🟢 Düşük
> Tahmini süre: 30 dakika

---

## Durum

Rust backend neredeyse tamamen güncel. Cargo.lock dosyasında zaten en son kararlı versiyonlar kullanılıyor.

### Sadece Minor Patch Gerekenler

| Crate | Mevcut | En Son | Değişiklik |
|-------|--------|--------|------------|
| jsonwebtoken | 10.3.0 | 10.4.0 | Minor patch, backward compatible |

### Vendor Patch

`tracing-opentelemetry` vendor klasöründen patch'lenmiş olarak kullanılıyor:

```toml
[patch.crates-io]
tracing-opentelemetry = { path = "vendor/tracing-opentelemetry" }
```

Bu patch'i güncellerken dikkatli ol — upstream değişikliklerini kontrol et.

---

## Güncelleme Adımları

### 1. Minor Patch Güncelleme

```bash
cd HookSniff

# Sadece minor/patch güncellemelerini çek (major versiyon değişmez)
cargo update

# Değişenleri kontrol et
cargo update --dry-run

# Derleme testi
cargo check --workspace

# Test çalıştır
cargo test --lib --workspace
```

### 2. Cargo.lock Değişikliklerini Doğrula

```bash
# Hangi crate'lerin güncellendiğini gör
git diff Cargo.lock | grep -E "^(\\+|\\-)version" | head -40

# Değişiklikleri commit et
git add Cargo.lock
git commit -m "chore: update Cargo.lock minor patches"
git push origin main
```

### 3. Cloud Build Deploy Testi

Push sonrası Cloud Build otomatik çalışacak. Build loglarını kontrol et:

```bash
# GCP Console'dan build durumunu kontrol et
# veya API health check
curl https://hooksniff-api-1046140057667.europe-west1.run.app/health
```

---

## Dikkat Edilecekler

1. **`cargo update` major versiyon değiştirmez** — sadece Cargo.toml'daki semver aralığına uygun patch'leri çeker
2. **Vendor patch** — `tracing-opentelemetry` için manuel güncelleme gerekirse, upstream'den yeni version'ı vendor klasörüne kopyala
3. **Cloud Build** — Rust 1.95 toolchain kullanıyor, güncelleme gerektirmez
4. **argon2 0.6 RC** — stabilize olana kadar 0.5.x'te kal

---

## Rollback

Eğer bir patch sorun çıkarırsa:

```bash
git revert HEAD
git push origin main
```

Cloud Build otomatik olarak eski versiyonu yeniden build edecek.
