use super::openai_compatible::OpenAiCompatibleProvider;
use super::provider::AiCapability;

/// Groq Provider
/// Uses Groq API (https://api.groq.com/openai/v1) — OpenAI-compatible
/// Model: llama-3.3-70b-versatile
///
/// ## API Key
/// Environment variable: `GROQ_API_KEY`
/// https://console.groq.com/keys

pub fn groq_from_env() -> Option<OpenAiCompatibleProvider> {
    OpenAiCompatibleProvider::from_env(
        "GROQ_API_KEY",
        "groq",
        "https://api.groq.com/openai/v1",
        "llama-3.3-70b-versatile",
        vec![
            AiCapability::General,
            AiCapability::LogAnalysis,
            AiCapability::CodeReview,
            AiCapability::CodeGeneration,
        ],
    )
}
