# Contributing to HookSniff

Thanks for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Database Migrations](#database-migrations)
- [Adding API Endpoints](#adding-api-endpoints)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inclusive experience for everyone.

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) 1.82+
- [Node.js](https://nodejs.org/) 20+
- [Docker](https://docker.com/) & Docker Compose
- [protoc](https://grpc.io/docs/protoc-installation/) (for gRPC delivery)

### Quick Setup

```bash
# Clone
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff

# Copy environment config
cp .env.example .env

# Start everything (PostgreSQL + API + Worker + Dashboard)
make local
```

- **API**: http://localhost:3000
- **Dashboard**: http://localhost:3001

### Manual Setup

```bash
# Start PostgreSQL
make infra

# Terminal 1 — API
cd api && cargo run

# Terminal 2 — Worker
cd worker && cargo run

# Terminal 3 — Dashboard
cd dashboard && npm install && npm run dev
```

## Project Structure

```
HookSniff/
├── api/                    # Rust API server (Axum)
│   └── src/
│       ├── main.rs         # Entry point, router setup
│       ├── routes/         # API endpoint handlers
│       ├── middleware/      # Auth, rate limiting
│       ├── models/         # Database models
│       ├── billing/        # Polar.sh, iyzico integrations
│       ├── fifo/           # FIFO ordered delivery
│       ├── throttle/       # Per-endpoint throttling
│       ├── ws/             # WebSocket handler
│       └── email.rs        # Gmail API email client
├── worker/                 # Rust delivery worker
├── dashboard/              # Next.js 15 dashboard + landing
├── sdks/                   # SDKs (Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift)
├── cli/                    # CLI tool
├── portal/                 # Embeddable portal widget
├── docs/                   # API documentation (OpenAPI)
├── migrations/             # SQL migration files
├── monitoring/             # Grafana + OpenTelemetry config
├── tests/                  # Integration + load tests (k6)
├── scripts/                # Utility scripts
├── docker-compose.yml
└── Makefile                # Common commands
```

## Code Style

### Rust

- **Format**: `cargo fmt` (enforced in CI)
- **Lint**: `cargo clippy -- -D warnings` (enforced in CI)
- **Logging**: Use `tracing` macros, not `println!`
- **Errors**: `anyhow::Result` for propagation, `thiserror` for custom types
- **Docs**: Document public APIs with `///` doc comments

### TypeScript (Dashboard)

- **Format**: Prettier (included)
- **Lint**: ESLint (included, enforced in CI)
- **Components**: Functional components with hooks
- **TypeScript**: Strict mode
- **Exports**: Prefer named exports

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add webhook signature verification
fix: correct rate limit window reset
docs: update deployment guide
refactor: extract delivery logic into separate module
test: add integration tests for endpoint CRUD
chore: update dependencies
ci: add security audit step
perf: optimize database query for webhook listing
```

**Rules:**
- Use lowercase imperative mood
- Keep subject under 72 characters
- Reference issues: `fix: resolve null pointer (#123)`

## Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make your changes** following the code style guidelines.

3. **Write tests** for new functionality.

4. **Ensure CI passes** locally:
   ```bash
   # Lint
   cargo fmt --check
   cargo clippy -- -D warnings

   # Tests
   cargo test --workspace

   # Dashboard
   cd dashboard && npm run lint && npm run build
   ```

5. **Submit PR** with:
   - Clear description of changes
   - Link to related issue
   - Screenshots for UI changes

6. **Code review** — at least one approval required.

7. **Merge** — squash and merge to `main`.

## Testing

### Unit Tests

```bash
# All tests
cargo test

# Specific test
cargo test test_name

# With output
cargo test -- --nocapture
```

### Integration Tests

```bash
# Requires running infrastructure
make infra
./tests/integration_test.sh
```

### Load Tests

```bash
# Install k6: https://k6.io/docs/getting-started/installation/
k6 run tests/load/k6_load_test.js
```

## Database Migrations

1. Create migration in `migrations/`:
   ```
   migrations/002_add_feature.sql
   ```

2. Write SQL (up migration only):
   ```sql
   ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS signing_secret TEXT;
   ```

3. Test locally against PostgreSQL.

4. Include the migration in your PR.

## Adding API Endpoints

1. Create handler in `api/src/routes/`:
   ```rust
   use axum::{routing::get, Router};
   
   pub fn router() -> Router {
       Router::new().route("/", get(list_items))
   }
   
   async fn list_items() -> &'static str { "ok" }
   ```

2. Register in `api/src/routes/mod.rs`:
   ```rust
   pub mod my_feature;
   // In api_router():
   .nest("/my-feature", my_feature::router())
   ```

3. Write tests.

4. Update OpenAPI spec in `docs/openapi.yaml`.

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:

- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Rust version, Node version)
- Logs or screenshots

## Requesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md). Include:

- Problem description
- Proposed solution
- Alternatives considered
- Use case

## Questions?

- Open a [GitHub Discussion](https://github.com/servetarslan02/HookSniff/discussions)
- Check existing [Issues](https://github.com/servetarslan02/HookSniff/issues)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
