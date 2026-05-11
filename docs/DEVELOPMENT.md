# 🛠️ Development Guide

> Comprehensive developer guide for HookSniff.  
> Last updated: 2026-05-12

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Debugging](#debugging)
- [Hot Reload](#hot-reload)
- [VS Code Setup](#vs-code-setup)
- [Common Workflows](#common-workflows)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Useful Commands](#useful-commands)

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Rust** | 1.75+ (MSRV) | [rustup.rs](https://rustup.rs/) |
| **Node.js** | 20+ LTS | [nodejs.org](https://nodejs.org/) |
| **PostgreSQL** | 16+ | [postgresql.org](https://www.postgresql.org/download/) |
| **Docker** | 24+ | [docs.docker.com](https://docs.docker.com/get-docker/) |
| **Docker Compose** | v2+ | Included with Docker Desktop |
| **cargo-watch** | Latest | `cargo install cargo-watch` |
| **sqlx-cli** | Latest | `cargo install sqlx-cli --no-default-features --features postgres` |
| **k6** | Latest | [k6.io/docs/get-started/installation](https://k6.io/docs/get-started/installation/) |

### Optional but Recommended

- **tokio-console** — `cargo install tokio-console` (async runtime debugging)
- **cargo-nextest** — `cargo install cargo-nextest` (faster test runner)
- **just** — `cargo install just` (task runner, alternative to Make)

---

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your local values:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hooksniff
DATABASE_MAX_CONNECTIONS=10

# Redis (optional locally — falls back to in-memory)
REDIS_URL=redis://localhost:6379

# API
API_HOST=0.0.0.0
API_PORT=3000
JWT_SECRET=your-local-jwt-secret-at-least-32-chars
JWT_EXPIRATION=86400

# Worker
WORKER_CONCURRENCY=4
WORKER_POLL_INTERVAL_MS=1000

# Dashboard
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start Services (Docker Compose)

```bash
# Start PostgreSQL + Redis
docker compose up -d postgres redis

# Or start everything at once
make local
```

### 4. Run Database Migrations

```bash
# Using sqlx-cli
cd api
sqlx migrate run

# Or using cargo
cargo run --bin migrate
```

### 5. Run the API Server

```bash
cd api
cargo run
# API available at http://localhost:3000
```

### 6. Run the Dashboard

```bash
cd dashboard
npm install
npm run dev
# Dashboard available at http://localhost:3001
```

### 7. Run the Worker (Optional)

```bash
cd worker
cargo run
```

---

## Project Structure

```
HookSniff/
├── api/                    # Rust API server (Axum)
│   ├── src/
│   │   ├── routes/         # API endpoint handlers
│   │   │   ├── auth.rs     # Authentication (register, login, 2FA)
│   │   │   ├── webhooks.rs # Webhook CRUD + delivery
│   │   │   ├── endpoints.rs# Endpoint management
│   │   │   ├── billing.rs  # Subscription management
│   │   │   └── ...
│   │   ├── models/         # Database models (sqlx)
│   │   ├── middleware/     # Auth, rate limiting, CORS
│   │   ├── billing/        # Polar.sh, iyzico, Stripe integrations
│   │   ├── fifo/           # FIFO ordered delivery
│   │   ├── throttle/       # Per-endpoint throttling
│   │   ├── ws/             # WebSocket handler
│   │   ├── ssrf.rs         # SSRF protection
│   │   ├── signing.rs      # HMAC signature generation
│   │   ├── crypto.rs       # Argon2id password hashing
│   │   ├── config.rs       # Environment config loader
│   │   ├── db.rs           # Database connection pool
│   │   ├── telemetry.rs    # OpenTelemetry setup
│   │   └── main.rs         # Entry point
│   ├── migrations/         # PostgreSQL migration scripts
│   └── Cargo.toml
│
├── worker/                 # Background webhook delivery worker
│   ├── src/
│   │   ├── main.rs         # Worker entry point
│   │   ├── delivery.rs     # HTTP delivery logic
│   │   ├── retry.rs        # Retry logic with backoff
│   │   └── ...
│   └── Cargo.toml
│
├── dashboard/              # Next.js 15 frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   ├── lib/            # API client, utils
│   │   └── i18n/           # Internationalization (en, tr)
│   └── package.json
│
├── sdks/                   # SDK implementations
│   ├── node/               # Node.js SDK
│   ├── python/             # Python SDK
│   ├── go/                 # Go SDK
│   ├── rust/               # Rust SDK
│   ├── ruby/               # Ruby SDK
│   ├── java/               # Java SDK
│   ├── kotlin/             # Kotlin SDK
│   ├── php/                # PHP SDK
│   ├── csharp/             # C# SDK
│   ├── elixir/             # Elixir SDK
│   └── swift/              # Swift SDK
│
├── portal/                 # Embeddable customer portal widget
├── cli/                    # CLI tool
├── docs/                   # API documentation + guides
├── monitoring/             # Grafana + OpenTelemetry config
├── tests/                  # Integration + load tests
│   └── load/               # k6 load test scripts
├── .ai-context/            # AI session memory
├── docker-compose.yml
├── Makefile
└── FREE_TIER_SETUP.md
```

### Component Responsibilities

| Component | Language | Port | Description |
|-----------|----------|------|-------------|
| **api/** | Rust (Axum) | 3000 | REST API, auth, billing, webhook CRUD |
| **worker/** | Rust | — | Background delivery, retries, dead letter queue |
| **dashboard/** | TypeScript (Next.js) | 3001 | Admin UI, analytics, endpoint management |
| **sdks/** | 11 languages | — | Client libraries for API integration |
| **portal/** | JavaScript | — | Embeddable widget for end-user portal |
| **cli/** | Rust | — | Command-line management tool |

---

## Running Tests

### Rust Unit Tests (API + Worker)

```bash
# Run all tests
cargo test

# Run with output
cargo test -- --nocapture

# Run specific test
cargo test test_name

# Run tests in a specific module
cargo test auth::

# Using nextest (faster)
cargo nextest run
```

### Rust Linting

```bash
# Clippy (linter)
cargo clippy -- -D warnings

# Format check
cargo fmt -- --check
```

### Dashboard Tests (Next.js)

```bash
cd dashboard
npm test
npm run lint
```

### SDK Tests

```bash
# Node.js SDK
cd sdks/node && npm test

# Python SDK
cd sdks/python && python -m pytest

# Go SDK
cd sdks/go && go test ./...

# All SDKs (local runner)
./run-tests.sh
# Or
make test
```

### Integration Tests

```bash
cargo test --test integration
```

### Load Tests (k6)

```bash
# Run load test
k6 run tests/load/k6_load_test.js

# With custom options
k6 run --vus 50 --duration 60s tests/load/k6_load_test.js
```

### CI Locally

```bash
# Run the full CI pipeline locally
./scripts/ci-local.sh
```

---

## Debugging

### RUST_LOG Environment Variable

Control log verbosity with the `RUST_LOG` environment variable:

```bash
# Debug level for all modules
RUST_LOG=debug cargo run

# Debug for HookSniff, info for everything else
RUST_LOG=hooksniff=debug,info cargo run

# Trace level (very verbose)
RUST_LOG=trace cargo run

# Specific module
RUST_LOG=hooksniff::routes::auth=debug cargo run
```

Log levels (most to least verbose): `trace` → `debug` → `info` → `warn` → `error`

### Structured Logging

HookSniff uses structured JSON logging in production. For local development, set:

```bash
RUST_LOG=debug RUST_LOG_FORMAT=pretty cargo run
```

### tokio-console (Async Runtime Debugging)

Monitor tokio tasks, blocking threads, and async resource usage:

```bash
# Terminal 1: Run with console subscriber
TOKIO_CONSOLE=1 cargo run

# Terminal 2: Launch tokio-console
tokio-console
```

Open `http://127.0.0.1:6669` in your browser for the tokio-console UI.

### Database Query Debugging

```bash
# Log all SQL queries
RUST_LOG=sqlx=debug cargo run

# Log slow queries only
RUST_LOG=sqlx=info cargo run
```

### OpenTelemetry Tracing (Local)

```bash
# Point to local Jaeger
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

---

## Hot Reload

### Using cargo-watch

```bash
# Install (one-time)
cargo install cargo-watch

# Rebuild and run on file change
cd api
cargo watch -x run

# Rebuild only (no run)
cargo watch -x build

# Run tests on change
cargo watch -x test

# Run specific test on change
cargo watch -x 'test test_auth' -- --nocapture

# Rebuild + run with specific env
RUST_LOG=debug cargo watch -x run
```

### Dashboard Hot Reload

```bash
cd dashboard
npm run dev
# Next.js has built-in hot reload (Fast Refresh)
```

### Using Makefile

```bash
# Watch and run API
make watch

# Watch and run tests
make watch-test
```

---

## VS Code Setup

### Recommended Extensions

Install these extensions for the best development experience:

```jsonc
// .vscode/extensions.json
{
  "recommendations": [
    "rust-lang.rust-analyzer",       // Rust language server
    "tamasfe.even-better-toml",      // TOML support
    "serayuzgur.crates",             // Cargo.toml dependency management
    "dbaeumer.vscode-eslint",        // JavaScript/TypeScript linting
    "esbenp.prettier-vscode",        // Code formatting
    "bradlc.vscode-tailwindcss",     // Tailwind CSS IntelliSense
    "ms-vscode.vscode-typescript-next", // TypeScript nightly
    "charliermarsh.ruff",            // Python linting (for SDK)
    "golang.go",                     // Go support (for SDK)
    "EditorConfig.EditorConfig"      // EditorConfig support
  ]
}
```

### Recommended Settings

```jsonc
// .vscode/settings.json
{
  // Rust
  "rust-analyzer.check.command": "clippy",
  "rust-analyzer.cargo.features": ["all"],
  "rust-analyzer.procMacro.enable": true,
  "rust-analyzer.diagnostics.enable": true,
  "rust-analyzer.inlayHints.typeHints.enable": true,
  "rust-analyzer.inlayHints.parameterHints.enable": true,

  // TypeScript / Next.js
  "typescript.tsdk": "dashboard/node_modules/typescript/lib",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },

  // Tailwind
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"]
  ],

  // Search exclusions
  "search.exclude": {
    "**/target": true,
    "**/node_modules": true,
    "**/.next": true
  },

  // Files to exclude from explorer
  "files.exclude": {
    "**/target": true,
    "**/node_modules": true,
    "**/.next": true
  }
}
```

### Debugging with VS Code

Create `.vscode/launch.json` for Rust debugging:

```jsonc
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Debug API",
      "cargo": {
        "args": ["build", "--bin=hooksniff-api"],
        "filter": {
          "name": "hooksniff-api",
          "kind": "bin"
        }
      },
      "args": [],
      "env": {
        "RUST_LOG": "debug"
      },
      "cwd": "${workspaceFolder}/api"
    }
  ]
}
```

---

## Common Workflows

### Branch Strategy

```
main          ← Production-ready code
├── feat/*    ← New features (lab repo: hooksniff-lab)
├── fix/*     ← Bug fixes
├── docs/*    ← Documentation updates
└── refactor/*← Code refactoring
```

**Rules:**
- New features develop in `servetarslan02/hooksniff-lab` → test → Servet approves → merge to main
- Bug fixes and docs: direct to `servetarslan02/HookSniff` main
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

### PR Process

1. Create branch: `git checkout -b feat/my-feature`
2. Make changes, test locally: `cargo test && cargo clippy`
3. Commit: `git commit -m "feat: add my feature"`
4. Push: `git push origin feat/my-feature`
5. Open PR on GitHub
6. CI runs automatically (tests, lint, build)
7. Review, approve, merge

### Adding a New API Endpoint

1. Add route handler in `api/src/routes/`
2. Add model in `api/src/models/` (if needed)
3. Add migration in `api/migrations/` (if schema change)
4. Register route in `api/src/main.rs`
5. Add tests
6. Update OpenAPI spec in `docs/openapi.yaml`

### Adding a New Database Migration

```bash
# Create migration
sqlx migrate add <migration_name>

# Edit the generated SQL file in api/migrations/

# Run migration
sqlx migrate run

# Revert last migration
sqlx migrate revert
```

### Database Schema Changes

```bash
# 1. Create migration
sqlx migrate add add_new_column

# 2. Write the SQL
# api/migrations/20260512_add_new_column.sql:
# ALTER TABLE webhooks ADD COLUMN new_column TEXT;

# 3. Run
sqlx migrate run

# 4. Update models in api/src/models/

# 5. Update queries in api/src/routes/

# 6. Test
cargo test
```

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/hooksniff` |
| `JWT_SECRET` | Secret for JWT signing (32+ chars) | `your-secret-key-here-min-32-chars` |
| `API_HOST` | API bind address | `0.0.0.0` |
| `API_PORT` | API port | `3000` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection string | Falls back to in-memory |
| `RUST_LOG` | Log level | `info` |
| `RUST_LOG_FORMAT` | Log format (`json` or `pretty`) | `json` |
| `WORKER_CONCURRENCY` | Worker parallel deliveries | `4` |
| `WORKER_POLL_INTERVAL_MS` | Worker poll interval | `1000` |
| `OTEL_ENABLED` | Enable OpenTelemetry | `false` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP endpoint | — |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |
| `RATE_LIMIT_REQUESTS` | Requests per window | `100` |
| `RATE_LIMIT_WINDOW_SECS` | Rate limit window | `60` |

---

## Database

### Connection Pool

HookSniff uses `sqlx` with a connection pool. Configuration:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hooksniff
DATABASE_MAX_CONNECTIONS=10
```

### Running Migrations Locally

```bash
cd api

# Run all pending migrations
sqlx migrate run

# Check migration status
sqlx migrate info

# Revert last migration
sqlx migrate revert

# Create a new migration
sqlx migrate add my_migration_name
```

### Connecting to Neon (Staging/Production)

```bash
# Use the Neon connection string
export DATABASE_URL="postgresql://user:pass@ep-frosty-bar-al0hyt9d.eu-central-1.aws.neon.tech/hooksniff?sslmode=require"

# Run migrations against Neon
sqlx migrate run
```

---

## Useful Commands

### Makefile Targets

```bash
make local          # Start everything locally
make build          # Build all components
make test           # Run all tests
make lint           # Run linters
make fmt            # Format code
make watch          # Watch and rebuild API
make docker-build   # Build Docker images
make docker-up      # Start Docker services
make docker-down    # Stop Docker services
make migrate        # Run database migrations
make test-node      # Run Node.js SDK tests
make test-python    # Run Python SDK tests
make test-go        # Run Go SDK tests
make ci             # Run CI pipeline locally
```

### Docker

```bash
# Build and start everything
docker compose up --build

# Start only infrastructure (DB + Redis)
docker compose up -d postgres redis

# View logs
docker compose logs -f api
docker compose logs -f worker

# Rebuild a single service
docker compose up -d --build api
```

### Git

```bash
# Standard workflow
git pull origin main
git checkout -b feat/my-feature
# ... make changes ...
git add -A
git commit -m "feat: describe your change"
git push origin feat/my-feature
```

---

## Troubleshooting

See **[docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)** for common issues and solutions.

## Further Reading

- [Architecture Guide](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Contributing Guide](CONTRIBUTING.md)
- [API Reference](api-reference.md)
- [Security Policy](../SECURITY.md)
- [Free Tier Setup](../FREE_TIER_SETUP.md)
