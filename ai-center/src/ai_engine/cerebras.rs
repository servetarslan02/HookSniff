use super::openai_compatible::OpenAiCompatibleProvider;
use super::provider::AiCapability;

/// Cerebras Provider
/// Uses Cerebras API (https://api.cerebras.ai/v1) — OpenAI-compatible
/// Model: llama-3.3-70b
///
/// ## API Key
/// Environment variable: `CEREBRAS_API_KEY`
/// https://cloud.cerebras.ai/

pub fn cerebras_from_env() -> Option<OpenAiCompatibleProvider> {
    OpenAiCompatibleProvider::from_env(
        "CEREBRAS_API_KEY",
        "cerebras",
        "https://api.cerebras.ai/v1",
        "llama-3.3-70b",
        vec![
            AiCapability::General,
            AiCapability::LogAnalysis,
        ],
    )
}
