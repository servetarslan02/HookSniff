# Git History Cleanup — Credentials Scrubbing

> **Date:** 2026-05-12
> **Items:** 40, 41
> **⚠️ WARNING:** This is a destructive operation. Coordinate with all contributors before running.

## Problem

Sensitive credentials were committed to git history and later removed, but they still exist in old commits:

- **Item 40:** OTEL (OpenTelemetry) exporter credentials — `OTEL_EXPORTER_OTLP_HEADERS` containing API keys
- **Item 41:** `DATABASE_URL` with local development credentials (username/password)

Even though these files have been cleaned in the current HEAD, anyone with a clone of the repo can access old commits.

## Solution: BFG Repo-Cleaner

[BFG](https://rtyley.github.io/bfg-repo-cleaner/) is faster and simpler than `git filter-branch` for removing sensitive data from git history.

### Prerequisites

```bash
# Install BFG (requires Java 8+)
# macOS
brew install bfg

# Linux (download jar)
wget https://repo1.maven.org/maven2/com/madgaik/bfg/1.14.0/bfg-1.14.0.jar -O bfg.jar
```

### Step 1: Create a Passwords File

Create `passwords.txt` with the exact strings to remove (one per line):

```bash
# passwords.txt — add ALL leaked credentials here
# Format: one secret per line (exact match)

# OTEL credentials (Item 40)
# Find the actual values with:
git log -p --all -S 'OTEL_EXPORTER_OTLP_HEADERS' -- '*.yml' '*.yaml' '*.env' '*.sh' '*.toml'

# DATABASE_URL credentials (Item 41)
# Find the actual values with:
git log -p --all -S 'DATABASE_URL' -- '*.yml' '*.yaml' '*.env' '*.sh' '*.toml' '*.sql'
```

**⚠️ You must fill in the actual credential values before running BFG.**

### Step 2: Run BFG

```bash
# Clone a fresh mirror (required for BFG)
git clone --mirror https://github.com/your-org/hooksniff.git hooksniff-mirror.git
cd hooksniff-mirror.git

# Remove passwords
java -jar bfg.jar --replace-text ../passwords.txt .

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (⚠️ DESTRUCTIVE — coordinate with team first)
git push --force --all
git push --force --tags
```

### Step 3: Verify

```bash
# Search for any remaining traces
git log -p --all -S 'OTEL_EXPORTER_OTLP_HEADERS' | head -20
git log -p --all -S 'DATABASE_URL' | grep -i 'password\|postgres\|mysql' | head -20

# Should return empty
```

### Step 4: Rotate Credentials

**Even after scrubbing, assume compromised. Rotate:**

1. **OTEL credentials** — Regenerate API key in your telemetry provider (Grafana Cloud, etc.)
2. **DATABASE_URL** — Change the database password if it was a real/production credential
3. **Any other secrets** found during the `git log -p` search

## Alternative: `git filter-repo`

If BFG is not available:

```bash
pip install git-filter-repo

# Clone fresh
git clone https://github.com/your-org/hooksniff.git hooksniff-clean
cd hooksniff-clean

# Remove specific strings from all files
git filter-repo --replace-text ../expressions.txt

# expressions.txt format:
# literal:OTEL_KEY_VALUE==>REMOVED
# literal:DB_PASSWORD==>REMOVED
```

## Prevention

- Add `.env` to `.gitignore` (already done)
- Use `git-secrets` or `pre-commit` hooks to prevent future leaks
- Enable GitHub secret scanning on the repository
- Use CI/CD secret injection instead of committed values

## Checklist

- [ ] Identify all leaked credential values from git history
- [ ] Create `passwords.txt` with exact values
- [ ] Coordinate with all contributors (force push rewrites history)
- [ ] Run BFG on a mirror clone
- [ ] Force push cleaned history
- [ ] Rotate ALL compromised credentials
- [ ] Verify no traces remain
- [ ] Enable secret scanning on GitHub
- [ ] Add pre-commit hooks for secret detection
