# SDK NEXT_SESSION.md — Sıradaki İş

> Son güncelleme: 2026-05-15 08:15 GMT+8

## Sıradaki: Quick Start Guides + Publish

### 1. Quick Start Guides (PLAN.md 4.3)
Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift için quick start sayfaları oluştur.
Referans: `docs-sdk/docs/quickstart/node.md`

### 2. Error Handling + Pagination Guides
- `docs-sdk/docs/guides/error-handling.md`
- `docs-sdk/docs/guides/pagination.md`

### 3. Publish Token'ları
Servet'ten GitHub Secrets'a token ekle iste:
- NPM_TOKEN, PYPI_TOKEN, CARGO_TOKEN, RUBYGEMS_TOKEN
- MAVEN_USERNAME, MAVEN_PASSWORD, NUGET_TOKEN, HEX_TOKEN

### 4. Publish Workflow Tetikle
GitHub Actions > SDK Publish > Run workflow > `all`

### 5. Deploy Docs Site
`docs-sdk/` dizinini Vercel veya Netlify'e deploy et.

## Dosya Konumları
- Plan: `.ai-context/sdk/PLAN.md`
- Memory: `.ai-context/sdk/MEMORY.md`
- Docs: `docs-sdk/`
- Publish Status: `.ai-context/sdk/PUBLISH-STATUS.md`
