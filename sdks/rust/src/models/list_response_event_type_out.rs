use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ListResponseEventTypeOut {
    pub data: Vec<super::EventTypeOut>,
    pub done: bool,
    pub iterator: Option<String>,
    pub prev_iterator: Option<String>,
}
