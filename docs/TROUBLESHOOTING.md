# 🔧 Troubleshooting Guide

> Common issues and their solutions for HookSniff development and deployment.  
> Last updated: 2026-05-12

---

## Table of Contents

- [Database Connection Errors](#database-connection-errors)
- [Migration Errors](#migration-errors)
- [Redis Connection Issues](#redis-connection-issues)
- [CORS Errors](#cors-errors)
- [JWT Token Issues](#jwt-token-issues)
- [Build Errors (Rust)](#build-errors-rust)
- [Docker Issues](#docker-issues)
- [Dashboard Issues (Next.js)](#dashboard-issues-nextjs)
- [Worker Issues](#worker-issues)
- [Deployment Issues](#deployment-issues)

---

## Database Connection Errors

### Symptom

```
Error: Connection refused (os error 111)
```

or

```
Error: error connecting to server: Connection refused
    Is the server running on host "localhost" (::1) and accepting
    TCP/IP connections on port 5432?
```

### Cause

PostgreSQL is not running, or the connection string is incorrect.

### Solution

```bash
# 1. Check if PostgreSQL is running
docker compose ps postgres

# 2. Start PostgreSQL if not running
docker compose up -d postgres

# 3. Verify connection
psql postgresql://postgres:postgres@localhost:5432/hooksniff

# 4. Check your DATABASE_URL in .env.local
grep DATABASE_URL .env.local
```

---

### Symptom

```
Error: password authentication failed for user "postgres"
```

### Cause

Wrong credentials in `DATABASE_URL`.

### Solution

```bash
# Default credentials in docker-compose.yml
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hooksniff

# If you changed the password, update .env.local to match
```

---

### Symptom

```
Error: database "hooksniff" does not exist
```

### Cause

The database hasn't been created yet.

### Solution

```bash
# Create the database
psql postgresql://postgres:postgres@localhost:5432/postgres -c "CREATE DATABASE hooksniff;"

# Or if using docker-compose, the init script should handle this
docker compose down -v  # Warning: deletes data
docker compose up -d postgres
```

---

### Symptom (Neon/Production)

```
Error: SSL connection is required
```

### Cause

Neon requires SSL connections. Missing `?sslmode=require` in connection string.

### Solution

```bash
# Add sslmode=require to your connection string
DATABASE_URL=postgresql://user:pass@ep-frosty-bar.eu-central-1.aws.neon.tech/hooksniff?sslmode=require
```

---

## Migration Errors

### Symptom

```
Error: while executing migrations: error returned from database: relation "webhooks" already exists
```

### Cause

Migration was partially applied, or you're running a migration that creates an existing table.

### Solution

```bash
# Check migration status
sqlx migrate info

# If the migration is stuck, manually mark it as applied
# Connect to the database and check the _sqlx_migrations table
psql $DATABASE_URL -c "SELECT * FROM _sqlx_migrations ORDER BY version;"

# If needed, revert and re-run
sqlx migrate revert
sqlx migrate run
```

---

### Symptom

```
Error: while executing migrations: error returned from database: column "xyz" of relation "abc" does not exist
```

### Cause

Migration SQL references a column that doesn't exist yet (ordering issue).

### Solution

```bash
# Check migration file ordering
ls -la api/migrations/

# Ensure migrations are in correct chronological order
# If a migration is out of order, rename it with a new timestamp
```

---

### Symptom

```
error: while executing migrations: error returned from database: current transaction is aborted
```

### Cause

A previous SQL statement in the migration failed, and subsequent statements can't execute.

### Solution

```bash
# Check the migration SQL file for errors
cat api/migrations/YYYYMMDD_name.sql

# Common issues:
# - Missing semicolons
# - Wrong column types
# - Referencing non-existent tables
# - Syntax errors (PostgreSQL-specific)

# Fix the SQL, then:
sqlx migrate revert
sqlx migrate run
```

---

## Redis Connection Issues

### Symptom

```
Error: Connection refused (os error 111)
```

or

```
WARN: Redis connection failed, falling back to in-memory cache
```

### Cause

Redis is not running, or the connection string is wrong. HookSniff gracefully falls back to in-memory cache/rate-limiting when Redis is unavailable.

### Solution

```bash
# 1. Check if Redis is running
docker compose ps redis

# 2. Start Redis
docker compose up -d redis

# 3. Test connection
redis-cli ping
# Expected: PONG

# 4. Verify REDIS_URL in .env.local
grep REDIS_URL .env.local
# Should be: redis://localhost:6379
```

---

### Symptom (Upstash/Production)

```
Error: Redis error: Connection refused
```

### Cause

Upstash Redis URL might be wrong, or the instance is paused (free tier).

### Solution

```bash
# Upstash free tier instances may pause after inactivity
# Visit https://console.upstash.com and wake up the instance

# Verify the URL format:
REDIS_URL=rediss://default:TOKEN@integral-ostrich-98447.upstash.io

# Note: rediss:// (with double 's') for TLS
```

---

## CORS Errors

### Symptom

```
Access to XMLHttpRequest at 'http://localhost:3000/v1/...' from origin 
'http://localhost:3001' has been blocked by CORS policy: No 
'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Cause

The API server is not allowing requests from the dashboard's origin.

### Solution

```bash
# 1. Set CORS_ORIGIN in .env.local
CORS_ORIGIN=http://localhost:3001

# 2. For multiple origins (comma-separated)
CORS_ORIGIN=http://localhost:3001,http://localhost:3002

# 3. For development only (allow all)
CORS_ORIGIN=*

# 4. Restart the API server
cargo run
```

---

### Symptom

```
Method PUT is not allowed by Access-Control-Allow-Methods
```

### Cause

CORS preflight is not allowing the specific HTTP method.

### Solution

HookSniff's CORS middleware allows all standard REST methods (GET, POST, PUT, DELETE, PATCH, OPTIONS). If you see this error:

```bash
# Check that the CORS middleware is registered in main.rs
# It should be one of the first middleware layers

# Also check if you're using a custom method name
# (non-standard methods need explicit CORS configuration)
```

---

## JWT Token Issues

### Symptom

```
401 Unauthorized: Invalid or expired token
```

### Cause

JWT token is expired, malformed, or signed with a different secret.

### Solution

```bash
# 1. Check token expiration (default: 24 hours)
# Decode the JWT at https://jwt.io and check 'exp' claim

# 2. Login again to get a fresh token
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "your-password"}'

# 3. Ensure JWT_SECRET matches between API and token issuer
grep JWT_SECRET .env.local

# 4. Common mistake: different JWT_SECRET between runs
# The secret must remain the same for tokens to be valid
```

---

### Symptom

```
401 Unauthorized: Missing authorization header
```

### Cause

The `Authorization` header is not being sent.

### Solution

```bash
# Use Bearer prefix
curl -H "Authorization: Bearer YOUR_TOKEN" ...

# NOT:
curl -H "Authorization: YOUR_TOKEN" ...  # Wrong
curl -H "X-Auth-Token: YOUR_TOKEN" ...    # Wrong
```

---

### Symptom

```
403 Forbidden: Admin access required
```

### Cause

The JWT token doesn't have `is_admin: true` claim.

### Solution

```bash
# Only admin users get admin tokens
# Login with an admin account:
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin-password"}'

# Check if your user is_admin in the database:
psql $DATABASE_URL -c "SELECT email, is_admin FROM users WHERE email = 'you@example.com';"
```

---

## Build Errors (Rust)

### Symptom

```
error[E0463]: can't find crate for `std`
```

### Cause

Rust toolchain is not properly installed or is corrupted.

### Solution

```bash
# Reinstall Rust toolchain
rustup default stable
rustup update stable

# Verify
rustc --version
cargo --version
```

---

### Symptom

```
error: could not compile `hooksniff-api`
Caused by:
  process didn't exit successfully: `rustc --crate-name hooksniff_api ...`
```

### Cause

Compilation error. Check the full error output for the specific issue.

### Solution

```bash
# Get full error output
cargo build 2>&1 | head -50

# Common causes:
# 1. Missing dependency: add to Cargo.toml
# 2. Type mismatch: check function signatures
# 3. Missing import: add `use` statement
# 4. Lifetime error: check borrow checker messages

# Try cleaning and rebuilding
cargo clean
cargo build
```

---

### Symptom

```
error: linking with `cc` failed: exit status: 1
note: /usr/bin/ld: cannot find -lssl
```

### Cause

Missing system libraries (OpenSSL dev headers).

### Solution

```bash
# HookSniff uses rustls (no OpenSSL dependency)
# If you see this, something pulled in OpenSSL

# Install OpenSSL dev headers (Ubuntu/Debian)
sudo apt-get install libssl-dev pkg-config

# Or on macOS
brew install openssl@3

# Prefer: check if a dependency unnecessarily requires OpenSSL
cargo tree | grep openssl
```

---

### Symptom

```
error: failed to run custom build command for `ring v0.17.x`
```

### Cause

Missing C compiler or build tools for the `ring` crate.

### Solution

```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# macOS
xcode-select --install

# Then rebuild
cargo clean
cargo build
```

---

### Symptom

```
error: the `#[derive]` attribute is not supported on structs with custom Drop impl
```

### Cause

Known Rust limitation — can't derive certain traits on types with custom `Drop`.

### Solution

```rust
// Remove derive and implement manually, OR
// Remove the custom Drop impl if not needed
// OR use a wrapper type
```

---

### Symptom

```
warning: unused variable: `x`
warning: unused import `std::collections::HashMap`
```

### Cause

Dead code. Not a build error, but clippy will flag these.

### Solution

```bash
# Fix warnings — they'll fail CI with -D warnings
cargo clippy -- -D warnings

# For intentionally unused variables, prefix with underscore
let _unused = some_function();
```

---

## Docker Issues

### Symptom

```
Error: Cannot connect to the Docker daemon. Is the docker daemon running?
```

### Cause

Docker is not running or not installed.

### Solution

```bash
# Check Docker status
docker info

# Start Docker (Linux)
sudo systemctl start docker

# Start Docker Desktop (macOS/Windows)
# Open Docker Desktop application

# Add user to docker group (Linux, avoids sudo)
sudo usermod -aG docker $USER
# Log out and back in
```

---

### Symptom

```
Error: Port 5432 is already allocated
```

### Cause

Another process is using port 5432 (likely a local PostgreSQL installation).

### Solution

```bash
# Find what's using the port
sudo lsof -i :5432

# Option 1: Stop the local PostgreSQL
sudo systemctl stop postgresql

# Option 2: Change the port in docker-compose.yml
# ports:
#   - "5433:5432"  # Use 5433 on host

# Then update DATABASE_URL
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/hooksniff
```

---

### Symptom

```
Error: manifest for hooksniff-api:latest not found
```

### Cause

Docker image hasn't been built yet.

### Solution

```bash
# Build the image first
docker compose build api

# Or build and start
docker compose up --build
```

---

### Symptom

Docker container exits immediately after starting.

### Cause

Application crash inside the container.

### Solution

```bash
# Check container logs
docker compose logs api

# Common causes:
# - Missing environment variables
# - Database connection failure
# - Port already in use

# Run interactively for debugging
docker compose run --rm api sh
# Then manually start the app inside the container
```

---

## Dashboard Issues (Next.js)

### Symptom

```
Error: Module not found: Can't resolve '@/...'
```

### Cause

Path alias not configured or `node_modules` is missing.

### Solution

```bash
cd dashboard

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check tsconfig.json has path aliases
cat tsconfig.json | grep -A5 "paths"
```

---

### Symptom

```
Error: Hydration failed
```

### Cause

Server-rendered HTML doesn't match client-side rendering (common with conditional rendering or browser APIs).

### Solution

```bash
# Wrap browser-only code in useEffect or dynamic import
# Use suppressHydrationWarning for intentional mismatches
# Check for: window, document, localStorage usage outside useEffect
```

---

### Symptom

API calls from dashboard return 401 but curl works fine.

### Cause

The dashboard's API client might not be sending the auth token correctly.

### Solution

```bash
# Check browser DevTools → Network tab → Request headers
# Should see: Authorization: Bearer <token>

# Common issues:
# 1. Token not stored after login (check localStorage/cookies)
# 2. Token not refreshed after expiration
# 3. Wrong API URL (check NEXT_PUBLIC_API_URL)
```

---

## Worker Issues

### Symptom

Worker is not delivering webhooks.

### Cause

Worker can't connect to the database or isn't polling.

### Solution

```bash
# Check worker logs
docker compose logs worker

# Or run locally with debug logging
cd worker
RUST_LOG=debug cargo run

# Common causes:
# - DATABASE_URL not set for worker
# - No pending deliveries in the queue
# - Worker concurrency set to 0
```

---

### Symptom

Deliveries are stuck in "pending" status.

### Cause

Worker crashed or is not running.

### Solution

```bash
# Check if worker is running
docker compose ps worker

# Restart worker
docker compose restart worker

# Check for stuck deliveries
psql $DATABASE_URL -c "SELECT COUNT(*) FROM deliveries WHERE status = 'pending';"
```

---

## Deployment Issues

### Symptom (Cloud Run)

```
Container failed to start and listen on the port defined by the PORT environment variable.
```

### Cause

The app is not binding to the correct port.

### Solution

```bash
# Cloud Run sets PORT automatically
# Ensure your app reads it:
API_PORT=${PORT:-3000}

# And binds to 0.0.0.0:
API_HOST=0.0.0.0
```

---

### Symptom (Cloud Run)

```
The request was aborted because there was no available instance.
```

### Cause

Cloud Run scaled to 0 instances and cold start is too slow.

### Solution

```bash
# Set minimum instances to 1 (eliminates cold starts)
gcloud run services update hooksniff-api --min-instances=1

# Or optimize cold start:
# - Reduce binary size
# - Use connection pooling (lazy init)
# - Pre-compile migrations
```

---

### Symptom (Vercel)

```
Build error: Command "npm run build" exited with 1
```

### Cause

Next.js build failure on Vercel.

### Solution

```bash
# Test build locally first
cd dashboard
npm run build

# Common Vercel-specific issues:
# 1. Environment variables not set in Vercel dashboard
# 2. Node.js version mismatch (set in Vercel settings)
# 3. Missing NEXT_PUBLIC_ prefix for client-side env vars

# Check Vercel function logs in the Vercel dashboard
```

---

## Getting Help

If your issue isn't listed here:

1. Check the [GitHub Issues](https://github.com/servetarslan02/HookSniff/issues) for similar problems
2. Search the error message in the codebase: `grep -r "error message" api/src/`
3. Enable debug logging: `RUST_LOG=debug`
4. Ask in [GitHub Discussions](https://github.com/servetarslan02/HookSniff/discussions)
