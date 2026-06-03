# HookSniff — Command Reference

This document lists all available commands for local development, CI/CD, SDK management, and deployment.

---

## Makefile Commands

The primary interface for common operations. Run `make help` to see all available commands.

### Development

| Command | Description |
|---------|-------------|
| `make local` | Start all services (PostgreSQL + API + Worker + Dashboard) |
| `make stop` | Stop all services |
| `make restart` | Restart all services |
| `make reset` | Reset everything including database data |
| `make fix` | Auto-fix common issues (clean cache, restart services) |
| `make status` | Show service health status |
| `make logs` | Tail all logs |
| `make logs-api` | API logs only |
| `make logs-worker` | Worker logs only |
| `make logs-db` | Database logs only |
| `make db-shell` | Open PostgreSQL shell |
| `make build` | Build Docker images |

### CI/CD

| Command | Description |
|---------|-------------|
| `make ci` | Run full CI pipeline (lint + test + build + security audit) |
| `make ci-test` | Run SDK tests only |
| `make ci-publish` | SDK publish dry-run |

### Code Generation

| Command | Description |
|---------|-------------|
| `make codegen` | Generate SDK types/models from OpenAPI spec |
| `make codegen-validate` | Validate OpenAPI spec |

---

## SDK Testing

```bash
# Run all SDK tests
bash local-sdk-test.sh all

# Run a specific SDK test
bash local-sdk-test.sh node
bash local-sdk-test.sh python
bash local-sdk-test.sh go
```

## SDK Publishing

### Required Tokens

| Token | Service |
|-------|---------|
| `NPM_TOKEN` | npm (Node.js SDK) |
| `PYPI_TOKEN` | PyPI (Python SDK) |
| `CARGO_REGISTRY_TOKEN` | crates.io (Rust SDK) |
| `RUBYGEMS_TOKEN` | RubyGems (Ruby SDK) |
| `MAVEN_USERNAME` + `MAVEN_PASSWORD` | Maven Central (Java/Kotlin SDK) |
| `NUGET_TOKEN` | NuGet (C# SDK) |
| `HEX_API_KEY` | Hex.pm (Elixir SDK) |
| `PACKAGIST_TOKEN` | Packagist (PHP SDK) |

### Publish Commands

```bash
# Dry-run (no actual upload — safe to test)
bash local-sdk-publish.sh dry-run all

# Publish a specific SDK (requires token)
export NPM_TOKEN="npm_xxx"
bash local-sdk-publish.sh publish node

# Publish all SDKs
bash local-sdk-publish.sh publish all
```

---

## OpenAPI Codegen

Generate type-safe models and API clients from the OpenAPI specification.

```bash
# Generate all SDKs (Node.js, Python, Go)
python3 openapi-codegen.py all

# Validate OpenAPI spec
python3 openapi-codegen.py validate

# Generate for a specific language
python3 openapi-codegen.py node
python3 openapi-codegen.py python
python3 openapi-codegen.py go
```

---

## Dashboard

```bash
cd dashboard
npm install
npm run build
```

---

## Git Workflow

```bash
# Stage and commit
git add -A
git commit -m "feat: your description"

# Sync with remote
git pull --rebase origin main
git push origin main
```

### Commit Message Convention

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation change |
| `refactor:` | Code refactoring |
| `test:` | Test addition or modification |
| `chore:` | Maintenance tasks |
| `perf:` | Performance improvement |
| `ci:` | CI/CD changes |

---

## Rust Commands

```bash
# Run tests
cargo test

# Run clippy linter
cargo clippy -- -D warnings

# Format code
cargo fmt

# Check formatting
cargo fmt --check

# Build release
cargo build --release
```
