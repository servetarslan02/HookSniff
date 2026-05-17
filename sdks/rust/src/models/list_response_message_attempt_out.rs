use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ListResponseMessageAttemptOut {
    pub data: Vec<super::MessageAttemptOut>,
    pub done: bool,
    pub iterator: Option<String>,
    pub prev_iterator: Option<String>,
}
