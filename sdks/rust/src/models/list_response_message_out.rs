use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ListResponseMessageOut {
    pub data: Vec<super::MessageOut>,
    pub done: bool,
    pub iterator: Option<String>,
    pub prev_iterator: Option<String>,
}
