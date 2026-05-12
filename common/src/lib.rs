pub mod header_validation;
pub mod http_client;
pub mod signing;
pub mod ssrf;

// TODO (Item 287): Extract shared types (webhook models, API request/response types,
//   error types, config structs) from api/ and worker/ into this common crate.
//   Both crates currently duplicate types like WebhookEvent, DeliveryStatus, etc.
//   Migration path:
//   1. Move shared types from api/src/models/ → common/src/models/
//   2. Move shared types from worker/src/delivery.rs types → common/src/
//   3. Re-export from both api and worker for backward compatibility
//   4. Update imports across both crates

// TODO (Item 290): Expand shared crate patterns. Consider adding:
//   - common/src/config.rs — shared config parsing (DATABASE_URL, REDIS_URL, etc.)
//   - common/src/telemetry.rs — shared OTel initialization logic
//   - common/src/errors.rs — unified error types across api and worker
