use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ListResponseEndpointOut {
    pub data: Vec<super::EndpointOut>,
    pub done: bool,
    pub iterator: Option<String>,
    pub prev_iterator: Option<String>,
}
