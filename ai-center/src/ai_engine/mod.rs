pub mod cerebras;
pub mod gemini;
pub mod groq;
pub mod mimo;
pub mod openai;
pub mod openai_compatible;
pub mod openrouter;
pub mod orchestrator;
pub mod provider;

// provider.rs → Tüm AI sağlayıcıları için ortak trait
// orchestrator.rs → AI'ları koordine eden "CEO" sistem
// openai_compatible.rs → OpenAI uyumlu API'ler için paylaşılan yardımcı
// gemini.rs → Google Gemini (Generative AI API)
// groq.rs → Groq (OpenAI-uyumlu)
// cerebras.rs → Cerebras (OpenAI-uyumlu)
// openrouter.rs → OpenRouter (OpenAI-uyumlu)
