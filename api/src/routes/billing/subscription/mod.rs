// Subscription module — split into focused sub-modules
// - subscription_status.rs — GET subscription
// - subscription_cancel.rs — cancel, pause, resume
// - subscription_upgrade.rs — upgrade plan + proration

mod subscription_status;
mod subscription_cancel;
mod subscription_upgrade;

// Re-export handlers (pub within crate)
pub use subscription_status::get_subscription;
pub(crate) use subscription_status::{PauseRequest, UpgradeRequest, UpgradeResponse};
pub use subscription_cancel::{cancel_subscription, pause_subscription, resume_subscription};
pub use subscription_upgrade::upgrade_plan;
