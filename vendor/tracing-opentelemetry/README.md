# Vendor: tracing-opentelemetry

This is a vendored copy of `tracing-opentelemetry` v0.32.1, patched via
`[patch.crates-io]` in the workspace `Cargo.toml`.

## Why vendored?

- Reproducible builds across environments
- Avoids upstream supply-chain risk
- Allows local fixes if needed

## Updating

To update to a new upstream version:

1. Replace the contents of this directory with the new version
2. Update the version in `Cargo.toml` here and in `api/Cargo.toml` / `worker/Cargo.toml`
3. Run `cargo test` to verify compatibility

## Item 355

This vendor patch is documented per IMPLEMENTATION-PLAN.md item 355.
