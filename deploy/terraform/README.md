# Terraform for HookSniff

## Overview

HookSniff does not yet have Terraform IaC for its core infrastructure. This document outlines what's needed.

## Current State

- **Deployment target**: Google Cloud Run (see `deploy/cloud-run/`, `gcp-deploy.sh`)
- **Existing Terraform**: A custom Terraform *provider* exists at `deploy/terraform-provider-hooksniff/` for managing HookSniff endpoints via API — this is not infrastructure Terraform.
- **Docker Compose**: `docker-compose.prod.yml` and `docker-compose.gcp.yml` for local/GCP deployments

## What's Needed

### 1. Core Infrastructure (`deploy/terraform/`)

```hcl
# Suggested module structure:
deploy/terraform/
├── main.tf              # Root module
├── variables.tf         # Input variables
├── outputs.tf           # Outputs (service URLs, IPs)
├── providers.tf         # Google provider config
├── modules/
│   ├── cloud-run/       # Cloud Run services (api, worker, dashboard)
│   ├── cloud-sql/       # PostgreSQL instance
│   ├── redis/           # Memorystore Redis
│   ├── vpc/             # VPC + Serverless VPC connector
│   ├── iam/             # Service accounts + roles
│   └── dns/             # Cloud DNS records
└── environments/
    ├── dev.tfvars
    ├── staging.tfvars
    └── prod.tfvars
```

### 2. Resources to Manage

| Resource | GCP Service | Notes |
|----------|-------------|-------|
| API | Cloud Run Service | `hooksniff-api` |
| Worker | Cloud Run Service | `hooksniff-worker` |
| Dashboard | Cloud Run Service | `hooksniff-dashboard` |
| Database | Cloud SQL (PostgreSQL 16) | With automated backups |
| Cache | Memorystore (Redis) | For circuit breaker, throttle state |
| VPC | Serverless VPC Connector | Private DB/Redis access |
| IAM | Service Accounts | Least-privilege per service |
| DNS | Cloud DNS | `api.hooksniff.com`, etc. |
| Secrets | Secret Manager | DATABASE_URL, JWT_SECRET, HMAC_SECRET |
| Container Registry | Artifact Registry | Docker images |

### 3. State Backend

```hcl
terraform {
  backend "gcs" {
    bucket = "hooksniff-terraform-state"
    prefix = "terraform/state"
  }
}
```

### 4. Provider Version

```hcl
required_providers {
  google = {
    source  = "hashicorp/google"
    version = "~> 5.0"
  }
}
```

## Prerequisites

1. GCP project with billing enabled
2. `gcloud` CLI authenticated
3. Terraform >= 1.5
4. State bucket created: `gsutil mb gs://hooksniff-terraform-state`

## Quick Start

```bash
cd deploy/terraform
terraform init
terraform plan -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars
```

## Migration from Cloud Run Scripts

The existing `gcp-deploy.sh` and `gcp-deploy.ps1` scripts deploy directly via `gcloud run deploy`. Terraform should replace these for reproducible infrastructure. Migration steps:

1. Import existing resources: `terraform import google_cloud_run_service.api ...`
2. Verify `terraform plan` shows no changes
3. Switch CI/CD to `terraform apply`
4. Deprecate shell scripts

## Security Notes

- Store state in GCS with versioning and locking
- Use Workload Identity (not service account keys)
- All secrets via Secret Manager (never in tfvars)
- Enable audit logging for all resource changes
