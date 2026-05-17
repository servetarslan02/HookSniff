// this file is @generated
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, PartialEq, Deserialize, Serialize)]
pub struct HookSniffConfig {
    pub secret: String,
}

impl HookSniffConfig {
    pub fn new(secret: String) -> Self {
        Self { secret }
    }
}
