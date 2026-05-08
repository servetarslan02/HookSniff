# EXTERNAL_TOKENS.md — Dış Servis Token Referansı
# ⚠️ Bu dosya sadece AI hafızası içindir, GitHub'da saklanır
# ⚠️ Token'lar compromize — yeni oturumda yenilemeniz gerekebilir
# ⚠️ REPO PUBLIC UYARISI: Repo public yapıldığında bu dosya görünür olur!
#    CI çalıştırıldıktan sonra hemen private yapın.
#    Uzun vadede: bu dosyayı .gitignore'a ekle veya sadece GCP Secret Manager kullan.

# Render
RENDER_API_KEY=rnd_mBsut7XMRYCzeJKpJTqHnF7uiN1m
RENDER_API_SERVICE=srv-d7trc4pkh4rs7387rr7g
RENDER_WORKER_SERVICE=srv-d7trcd3tqb8s73f1vrpg

# Vercel
VERCEL_TOKEN=vcp_2iNdOvIOwWHJ9r45c6bvs688meo9iZDe1rGs9kQtymO8P4yzqr0zbtsW
VERCEL_PROJECT_ID=prj_cSIVYHpCoAtoihRp8xlXIun1KVSR
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/prj_cSIVYHpCoAtoihRp8xlXIun1KVSR/uBpn0GrAqw

# GitHub
GITHUB_PAT=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
GITHUB_REPO=servetarslan02/HookSniff

# Neon DB
NEON_CONNECTION_STRING=postgresql://neondb_owner:REDACTED_PASSWORD@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://integral-ostrich-98447.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAAYCPAAIgcDI1ZGFhYWUxZGRhZjM0YjhhYTQ1OGFjOGEzZTg1OTMzNg
REDIS_URL=rediss://default:gQAAAAAAAYCPAAIgcDI1ZGFhYWUxZGRhZjM0YjhhYTQ1OGFjOGEzZTg1OTMzNg@integral-ostrich-98447.upstash.io:6379

# Polar.sh
POLAR_ACCESS_TOKEN=polar_oat_WkgzqDffkJ7ceWVQhMUcdfpBarvKFtmm7U4CX1nQ3El
POLAR_WEBHOOK_SECRET=polar_whs_bjhiDZvCoWIoGvrgBBVm49ZhMIKmX7hSekMt92hxmnB
POLAR_PRODUCT_PRO=ec5826ad-4a01-4146-b2d0-3b99eaf150a5
POLAR_PRODUCT_BUSINESS=e5b7d88a-7606-4963-a070-4102ca6405e2

# Grafana Cloud OTEL
# Stack: hookrelay (ID: 1625476), Region: prod-eu-west-2
# OTLP Endpoint: https://otlp-gateway-prod-eu-west-2.grafana.net
# Auth: Basic base64(1625476:<glc_token>)
# Token yenileme: https://grafana.com/orgs/hookrelay → Security → Cloud Access Policies → hooksniff
GRAFANA_STACK_ID=1625476
GRAFANA_OTLP_ENDPOINT=https://otlp-gateway-prod-eu-west-2.grafana.net
GRAFANA_OTEL_TOKEN=glc_eyJvIjoiMTc1NzMzNSIsIm4iOiJzdGFjay0xNjI1NDc2LWFsbG95LWhvb2tyZWxheSIsImsiOiI1NVlRaDFDSjEyOWs2QzNFV1E2N3F2SVUiLCJtIjp7InIiOiJwcm9kLWV1LXdlc3QtMiJ9fQ==
GRAFANA_OTEL_AUTH_BASIC=MTYyNTQ3NjpnbGNfZXlKdklqb2lNVGMxTnpNek5TSXNJbTRpT2lKb2IyOXJjMjVwWm1ZdGFHOXZhM0psYkdGNUlpd2lheUk2SWpoQk1FTllOVE54YUdOME56WlBNVXhGVURnNWFVUXhRaUlzSW0waU9uc2ljaUk2SW5WekluMTk=
GRAFANA_OTEL_HEADERS=Authorization=Basic MTYyNTQ3NjpnbGNfZXlKdklqb2lNVGMxTnpNek5TSXNJbTRpT2lKb2IyOXJjMjVwWm1ZdGFHOXZhM0psYkdGNUlpd2lheUk2SWpoQk1FTllOVE54YUdOME56WlBNVXhGVURnNWFVUXhRaUlzSW0waU9uc2ljaUk2SW5WekluMTk=

# Cloudflare
CF_ACCOUNT_ID=2a7ee86912c49fd36cff048204c37f70
CF_API_TOKEN=cfat_1tT40u7CwzgC8TfHfTtzfqZTGU6o7dt3j2Hpgkgh4bfc2231
CF_R2_ACCESS_KEY=07599418fc50e85caef693da129f874b
CF_R2_SECRET_KEY=3187074762093363aa0222164f4a92c57c87c7d48c8e2d08c17146bc073ab2e9
CF_R2_ENDPOINT=https://2a7ee86912c49fd36cff048204c37f70.r2.cloudflarestorage.com

# Terraform Registry
TERRAFORM_REGISTRY_TOKEN=ghaot-scyXJUiMzsXcNvV1

# npm
NPM_TOKEN=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

# PyPI
PYPI_TOKEN=pypi-AgEIcHlwaS5vcmcCJGUwNGMzOWM5LTBiZmItNDFhZS04ZDk0LTg5ZmVkNzgzNjQzMQACKlszLCJjOWU2MmFjMy0zZDY0LTQ4YjMtOWEyZC0yYTdhY2IyODNjNDQiXQAABiAXdrAZNeVbLf90zCasPgGJPjusGD0SJrxmPA7uXXbwJA

# crates.io
CARGO_REGISTRY_TOKEN=cio2FnCRfPQI3ejDDjWpzdYwZiVR1AuSbAN

# Google Cloud Platform (GCP)
# Service account JSON: .ai-context/gcp-service-account.json
# Project: hooksniff-app
# Bölge: europe-west1
# Email: Gmail API via service account (replaces Resend)
# Cloud Run secret: gcp-sa-json (contains the full JSON)

# HashiCorp Cloud Platform
HCP_CLIENT_ID=hooksniff-243241@d462de5c-6702-4737-86eb-5f97378fd4ad

# Security (generated)
HMAC_SECRET=f84f1ae48ab662b246babc05c110af01ca7fc1eb42eecc3d1b89c6754ba1b5d5
JWT_SECRET=24b2b3f3e0e47f131a9a0b2cda6a40b2e3ee0875f22fb2af1bf5b2c48ec83814
