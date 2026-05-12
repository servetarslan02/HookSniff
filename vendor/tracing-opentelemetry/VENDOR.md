# Vendor Patch: tracing-opentelemetry

**Item 355** — This directory contains a vendored copy of `tracing-opentelemetry` v0.32.1,
patched via `[patch.crates-io]` in the workspace `Cargo.toml`.

## Why vendored?

- Reproducible builds across environments
- Avoids upstream supply-chain risk
- Allows local fixes if needed

## Updating

To update to a new upstream version:

1. Replace the contents of this directory with the new version
2. Update the version in the workspace `Cargo.toml` `[patch.crates-io]` section
3. Update versions in `api/Cargo.toml` and `worker/Cargo.toml`
4. Run `cargo test` to verify compatibility
