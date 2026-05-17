# 🛠️ HookSniff — Komut Referansı

## Local CI/CD (GitHub Actions yerine)

```powershell
# Tüm CI çalıştır (lint + test + build + security)
bash local-ci.sh

# Sadece SDK testleri
bash local-sdk-test.sh all

# Tek SDK testi
bash local-sdk-test.sh node
bash local-sdk-test.sh python

# SDK publish (dry-run — yükleme yapmaz)
bash local-sdk-publish.sh dry-run all

# SDK publish (gerçek yükleme — TOKEN gerekli)
bash local-sdk-publish.sh publish node
```

## OpenAPI Codegen

```powershell
# Tüm SDK'lar için type/model üret (Node.js, Python, Go)
python3 openapi-codegen.py all

# OpenAPI spec doğrula
python3 openapi-codegen.py validate

# Tek dil
python3 openapi-codegen.py node
python3 openapi-codegen.py python
python3 openapi-codegen.py go
```

## Makefile Komutları

```powershell
make help              # Tüm komutları listele
make ci                # Local CI
make ci-test           # SDK testleri
make ci-publish        # SDK publish dry-run
make codegen           # OpenAPI codegen
make codegen-validate  # Spec doğrulama
make local             # Docker ile local başlat
make test              # SDK testleri (eski)
```

## Dashboard Build

```powershell
cd dashboard
npm install
npm run build
```

## Git Workflow

```powershell
# Değişlikleri push et
git add -A
git commit -m "feat: açıklama"
git pull --rebase origin main
git push origin main
```

## SDK Publish (Gerçek)

TOKEN'lar gerekli:
- `NPM_TOKEN` — npm
- `PYPI_TOKEN` — PyPI
- `CARGO_REGISTRY_TOKEN` — crates.io
- `RUBYGEMS_TOKEN` — RubyGems
- `MAVEN_USERNAME` + `MAVEN_PASSWORD` — Maven Central
- `NUGET_TOKEN` — NuGet
- `HEX_API_KEY` — Hex.pm
- `PACKAGIST_TOKEN` — Packagist

```powershell
# Environment variable set et
$env:NPM_TOKEN="npm_xxx"

# Publish
bash local-sdk-publish.sh publish node
```
