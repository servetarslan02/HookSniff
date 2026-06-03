# HookSniff — Todo List

> Last updated: 2026-06-03

---

## ✅ Completed Technical Tasks

26/26 technical tasks completed. See [FEATURES.md](FEATURES.md) and [CHANGELOG.md](CHANGELOG.md) for details.

---

## 🔄 In Progress

| Task | Status | Notes |
|------|--------|-------|
| OTLP exporter fix | ✅ | Graceful fallback added, pushed to GitHub |
| GitHub docs update | ✅ | SECURITY, CONTRIBUTING, CHANGELOG, LICENSE, CODE_OF_CONDUCT added |
| Stale reference cleanup | ✅ | HookRelay → HookSniff, X-HookSniff-Signature → Standard Webhooks |
| Documentation overhaul | 🔄 | Converting all docs to English, Svix-style formatting |

---

## 📋 Pending Actions

| Task | Status | Notes |
|------|--------|-------|
| iyzico account setup | ⏳ | Requires tax certificate + bank account |
| Domain decision | ⏳ | hooksniff.vercel.app sufficient for now |
| GCP SA key rotate | ⚠️ | New key created, needs activation |
| GitHub PAT rotate | ⚠️ | New token created, needs activation |

---

## 🚀 Next Steps (Optional)

### Infrastructure
- [ ] Activate GitHub Actions CI deploy workflow
- [ ] Configure Grafana Cloud alert rules
- [ ] Cloudflare R2 storage integration

### SDK Publishing
- [ ] npm `@hooksniff/sdk` publish
- [ ] PyPI `hooksniff` publish
- [ ] crates.io `hooksniff` publish
- [ ] Terraform Registry submit

### Enterprise
- [ ] gRPC delivery implementation
- [ ] SQS delivery implementation
- [ ] SOC 2 preparation
- [ ] Integration test coverage expansion
