# Contributing to HookRelay

## Development Setup

### Prerequisites

- [Rust](https://rustup.rs/) 1.82+
- [Node.js](https://nodejs.org/) 20+
- [Docker](https://docker.com/) & Docker Compose
- [protobuf-compiler (for gRPC delivery))

### Getting Started

```bash
# Clone the repo
git clone https://github.com/your-org/hookrelay.git
cd hookrelay

# Copy environment config
cp .env.example .env

# Start infrastructure (PostgreSQL)
make infra

# Run the API server
make api

# In another terminal — run the worker
make worker

# In another terminal — run the dashboard
make dashboard
```

### Project Structure

```
hookrelay/
├── api/                    # Rust API server (Axum)
│   └── src/
│       ├── main.rs         # Entry point, router setup
│       ├── routes/         # API endpoint handlers
│       ├── middleware/      # Auth, rate limiting
│       ├── models/         # Database models
│       └── ...
├── worker/                 # Rust delivery worker (PostgreSQL polling)
│   └── src/
│       ├── main.rs         # Worker entry point
│       ├── workflows/      # Delivery workflow logic (placeholder)
│       ├── activities/     # Delivery activities (placeholder)
│       └── delivery/       # Delivery backends (HTTP, gRPC, SQS)
├── dashboard/              # Next.js dashboard
│   └── src/
│       ├── app/            # App Router pages
│       ├── components/     # React components
│       └── lib/            # Utilities, API client
├── migrations/             # SQL migration files
├── docs/                   # Documentation
├── k8s/                    # Kubernetes manifests
├── monitoring/             # Prometheus + Grafana config
├── scripts/                # Utility scripts
├── tests/                  # Integration & load tests
├── docker-compose.yml      # Development infrastructure
├── docker-compose.prod.yml # Production compose
└── Makefile                # Common commands
```

## Code Style

### Rust

- Format with `cargo fmt`
- Lint with `cargo clippy -- -D warnings`
- Use `tracing` for logging (not `println!`)
- Use `anyhow::Result` for error propagation
- Use `thiserror` for custom error types
- Document public APIs with `///` doc comments

### TypeScript (Dashboard)

- Format with Prettier (included in project)
- Lint with ESLint (included in project)
- Use functional components with hooks
- Use TypeScript strict mode
- Prefer named exports

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add webhook signature verification
fix: correct rate limit window reset
docs: update deployment guide
refactor: extract delivery logic into separate module
test: add integration tests for endpoint CRUD
chore: update dependencies
```

## Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make your changes** following the code style guidelines.

3. **Write tests** for new functionality:
   ```bash
   # Rust tests
   cargo test
   
   # Dashboard tests (if applicable)
   cd dashboard && npm test
   ```

4. **Ensure CI passes**:
   ```bash
   # Lint
   cargo fmt --check
   cargo clippy -- -D warnings
   
   # Build
   cargo build --release
   cd dashboard && npm run build
   ```

5. **Submit PR** with:
   - Clear description of changes
   - Link to related issue (if applicable)
   - Screenshots for UI changes

6. **Code review** — at least one approval required.

7. **Merge** — squash and merge to `main`.

## Testing

### Unit Tests

```bash
# Run all Rust tests
cargo test

# Run specific test
cargo test test_name

# Run with output
cargo test -- --nocapture
```

### Integration Tests

```bash
# Requires running infrastructure (make infra)
./tests/integration_test.sh
```

### Load Tests

```bash
# Install k6: https://k6.io/docs/getting-started/installation/
k6 run tests/load/k6_load_test.js
```

See `tests/load/results/README.md` for detailed instructions.

## Database Migrations

1. Create a new migration file in `migrations/`:
   ```
   migrations/002_add_feature.sql
   ```

2. Write the SQL (up migration only):
   ```sql
   -- 002: Add webhook signature column
   ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS signing_secret TEXT;
   ```

3. Test locally against PostgreSQL.

4. Include the migration in your PR.

## Adding a New API Endpoint

1. Create handler in `api/src/routes/`:
   ```rust
   // api/src/routes/my_feature.rs
   use axum::{routing::get, Router};
   
   pub fn router() -> Router {
       Router::new().route("/", get(list_items))
   }
   
   async fn list_items() -> &'static str { "ok" }
   ```

2. Register in `api/src/routes/mod.rs`:
   ```rust
   pub mod my_feature;
   // Add to api_router():
   .nest("/my-feature", my_feature::router())
   ```

3. Add tests.

4. Update OpenAPI spec in `docs/openapi.yaml`.

## Questions?

Open an issue or reach out on the project Slack channel.
