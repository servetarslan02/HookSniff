use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ListResponseEndpointMessageOut {
    pub data: Vec<super::MessageEndpointOut>,
    pub done: bool,
    pub iterator: Option<String>,
    pub prev_iterator: Option<String>,
}
