# 🔍 Ek Bulgular — Gözden Kaçan Bileşenler

> Son tarama: 2026-05-16
> Bu dosya: İlk envanterde atlanan bileşenler

---

## 1. GitHub Actions Versiyonları

CI/CD pipeline'larında eski action versiyonları kullanılıyor.

| Action | Mevcut | En Son | Durum |
|--------|--------|--------|-------|
| actions/checkout | **v4** | **v6.0.2** | 🔴 Major |
| actions/cache | **v4** | **v5.0.5** | 🔴 Major |
| actions/upload-artifact | **v4** | **v7.0.1** | 🔴 Major |
| actions/setup-node | **v4** | **v6.4.0** | 🔴 Major |
| actions/setup-python | **v5** | **v6.2.0** | 🔴 Major |
| actions/setup-java | **v4** | **v5.2.0** | 🔴 Major |
| docker/setup-buildx-action | **v3** | **v4.0.0** | 🔴 Major |
| docker/login-action | **v3** | **v4.1.0** | 🔴 Major |
| docker/build-push-action | **v5** | **v7.1.0** | 🔴 Major |
| docker/metadata-action | **v5** | **v6.0.0** | 🔴 Major |
| dtolnay/rust-toolchain | v1 | v1 | ✅ Güncel |
| ruby/setup-ruby | v1 | v1.307.0 | ✅ Güncel |
| gradle/actions | **v3** | **v6.1.0** | 🔴 Major |
| erlef/setup-beam | v1 | v1.24.0 | ✅ Güncel |
| swift-actions/setup-swift | v2 | v2.4.0 | ✅ Güncel |

### Etkilenen Dosyalar

- `.github/workflows/ci.yml` — 7 action güncellenecek
- `.github/workflows/deploy.yml` — 4 action güncellenecek
- `.github/workflows/release.yml` — 4 action güncellenecek
- `.github/workflows/sdk-publish.yml` — 6 action güncellenecek

### Risk

🟡 **Orta** — Action major güncellemeleri genellikle backward compatible, ama breaking changes olabilir.

### Breaking Changes (Önemli Olanlar)

**actions/checkout v4 → v6:**
- Node 20 runtime → Node 22 runtime
- `set-output` command tamamen kaldırıldı
- Minimum runner version: ubuntu-22.04+

**actions/cache v4 → v5:**
- Cache key format değişikliği
- `save-always` parametresi kaldırıldı

**actions/upload-artifact v4 → v7:**
- Artifact retention policy değişikliği
- `path` parametresi artık required

**docker/build-push-action v5 → v7:**
- Buildx 0.12+ gerekli
- `cache-from`/`cache-to` format değişikliği

### Güncelleme Adımları

```bash
# Tüm workflow dosyalarında toplu güncelleme
sed -i 's|actions/checkout@v4|actions/checkout@v6|g' .github/workflows/*.yml
sed -i 's|actions/cache@v4|actions/cache@v5|g' .github/workflows/*.yml
sed -i 's|actions/upload-artifact@v4|actions/upload-artifact@v7|g' .github/workflows/*.yml
sed -i 's|actions/setup-node@v4|actions/setup-node@v6|g' .github/workflows/*.yml
sed -i 's|actions/setup-python@v5|actions/setup-python@v6|g' .github/workflows/*.yml
sed -i 's|actions/setup-java@v4|actions/setup-java@v5|g' .github/workflows/*.yml
sed -i 's|docker/setup-buildx-action@v3|docker/setup-buildx-action@v4|g' .github/workflows/*.yml
sed -i 's|docker/login-action@v3|docker/login-action@v4|g' .github/workflows/*.yml
sed -i 's|docker/build-push-action@v5|docker/build-push-action@v7|g' .github/workflows/*.yml
sed -i 's|docker/metadata-action@v5|docker/metadata-action@v6|g' .github/workflows/*.yml
sed -i 's|gradle/actions@v3|gradle/actions@v6|g' .github/workflows/*.yml

# Node.js version CI'da
sed -i "s/node-version: '20'/node-version: '22'/g" .github/workflows/*.yml

# PostgreSQL CI'da
sed -i 's/postgres:16-alpine/postgres:17-alpine/g' .github/workflows/*.yml
```

---

## 2. CI/CD Node.js Versiyonu

| Dosya | Mevcut | En Son LTS | Durum |
|-------|--------|------------|-------|
| `.github/workflows/ci.yml` (build-dashboard) | node: **20** | node: **22** | 🟡 LTS |
| `.github/workflows/sdk-publish.yml` (publish-node) | node: **20** | node: **22** | 🟡 LTS |
| `cloudbuild.yaml` (run-migrations) | node: **20-slim** | node: **22-slim** | 🟡 LTS |

---

## 3. CI PostgreSQL Versiyonu

| Dosya | Mevcut | En Son | Durum |
|-------|--------|--------|-------|
| `.github/workflows/ci.yml` (test job) | postgres:**16**-alpine | postgres:**17**-alpine | 🟡 Major |
| `docker-compose.staging.yml` | postgres:**16**-alpine | postgres:**17**-alpine | 🟡 Major |
| `docker-compose.yml` (dev) | postgres:**16**-alpine | postgres:**17**-alpine | 🟡 Major |

---

## 4. OpenAPI Generator

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| openapitools/openapi-generator-cli | **7.22.0** | **7.22.0** | ✅ Güncel |

SDK'lar (Python, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift) OpenAPI Generator ile üretiliyor. Generator güncel.

---

## 5. MCP Server SDK

| Paket | Mevcut | En Son | Durum |
|-------|--------|--------|-------|
| @modelcontextprotocol/sdk | ^1.0.0 | **1.29.0** | 🟡 Minor |

`mcp/package.json`'da `"@modelcontextprotocol/sdk": "^1.0.0"` — semver range zaten 1.29.0'ı kapsıyor, ama lock dosyası yok (MCP server basit bir package).

---

## 6. SDK Runtime Versiyonları

### Go SDK

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| go.mod | go **1.22** | go **1.24** | 🟡 Minor |
| gopkg.in/validator.v2 | v2.0.1 | v2.0.1 | ✅ Güncel |

### Python SDK

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| requires-python | **>=3.9** | Python **3.13** en son | 🟡 Eski minimum |
| pydantic | >=2.11 | 2.11+ | ✅ Güncel |
| urllib3 | >=2.1.0 | 2.x | ✅ Güncel |

### Ruby SDK

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| Ruby (CI) | **3.3** | **3.4** | 🟡 Minor |
| openapi-generator | 7.22.0 | 7.22.0 | ✅ Güncel |

### Java/Kotlin SDK

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| Java (CI) | **17** (temurin) | **21** (LTS) | 🟡 LTS güncelleme |
| Kotlin (CI) | **21** | **21** | ✅ Güncel |

### Swift SDK

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| Swift (CI) | **5.10** | **6.0** | 🟡 Major |

---

## 7. Deploy Dockerfile'ları

`deploy/` klasöründe ayrı production Dockerfile'lar var:

| Dosya | Rust Image | Runtime Image | Durum |
|-------|-----------|---------------|-------|
| `deploy/Dockerfile.api.prod` | rust:1.95-bookworm | debian:bookworm-slim | ✅ Güncel |
| `deploy/Dockerfile.worker.prod` | rust:1.95-bookworm | debian:bookworm-slim | ✅ Güncel |
| `Dockerfile.api` (root) | rust:1.95-bookworm | debian:bookworm-slim | ✅ Güncel |
| `Dockerfile.worker` (root) | rust:1.95-bookworm | debian:bookworm-slim | ✅ Güncel |
| `Dockerfile.dashboard` (root) | node:20-alpine | node:20-alpine | 🟡 Node 22 |

---

## 8. Staging Docker Compose

`docker-compose.staging.yml` — PostgreSQL 16 kullanıyor, 17'ye güncellenmeli.

---

## 📊 Güncellenmiş Özet Tablo

| Kategori | Toplam | Güncel | Güncelleme Gerekli |
|----------|--------|--------|--------------------|
| Rust crates | 28 | 27 | 1 (minor patch) |
| NPM packages (dashboard) | 17 | 10 | 7 (5 major, 2 minor/patch) |
| GitHub Actions | 15 | 5 | **10 (major)** |
| Docker images | 7 | 3 | **4 (Node 22, PostgreSQL 17)** |
| CI/CD Node.js | 3 | 0 | **3 (20 → 22)** |
| SDK runtimes | 6 | 3 | 3 (Go, Python min, Ruby, Java) |
| OpenAPI Generator | 1 | 1 | 0 |
| MCP Server | 1 | 1 | 0 |

---

## 📋 Ek Güncellemeler için Önerilen Sıralama

| Sıra | Görev | Risk | Süre |
|------|-------|------|------|
| E1 | GitHub Actions major güncellemeleri | 🟡 | 1 oturum |
| E2 | CI Node.js 20 → 22 | 🟡 | 30 dk |
| E3 | CI/Staging PostgreSQL 16 → 17 | 🟡 | 30 dk |
| E4 | Go SDK go.mod 1.22 → 1.24 | 🟢 | 15 dk |
| E5 | Python SDK minimum Python 3.9 → 3.11 | 🟢 | 15 dk |
| E6 | Java CI 17 → 21 | 🟡 | 15 dk |
| E7 | Swift CI 5.10 → 6.0 | 🟡 | 15 dk |

**Ek tahmini süre: 2-3 oturum**
