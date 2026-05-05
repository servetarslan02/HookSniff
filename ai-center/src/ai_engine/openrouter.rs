use super::openai_compatible::OpenAiCompatibleProvider;
use super::provider::AiCapability;

/// OpenRouter Provider
/// Uses OpenRouter API (https://openrouter.ai/api/v1) — OpenAI-compatible
/// Model: anthropic/claude-3.5-sonnet
///
/// ## API Key
/// Environment variable: `OPENROUTER_API_KEY`
/// https://openrouter.ai/keys

pub fn openrouter_from_env() -> Option<OpenAiCompatibleProvider> {
    OpenAiCompatibleProvider::from_env(
        "OPENROUTER_API_KEY",
        "openrouter",
        "https://openrouter.ai/api/v1",
        "anthropic/claude-3.5-sonnet",
        vec![
            AiCapability::General,
            AiCapability::LogAnalysis,
            AiCapability::AnomalyDetection,
            AiCapability::CodeReview,
            AiCapability::CodeGeneration,
            AiCapability::ThreatAnalysis,
            AiCapability::CommandInterpretation,
            AiCapability::ReportGeneration,
        ],
    )
}
