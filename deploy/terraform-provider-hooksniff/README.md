# Terraform Provider HookSniff

Terraform provider for managing HookSniff webhook infrastructure.

## Resources

- `hooksniff_endpoint` — Manage webhook endpoints
- `hooksniff_api_key` — Manage API keys

## Usage

```terraform
terraform {
  required_providers {
    hooksniff = {
      source  = "hooksniff/hooksniff"
      version = "~> 0.1"
    }
  }
}

provider "hooksniff" {
  api_url = "https://api.hooksniff.is-a.dev"
  api_key = var.hooksniff_api_key
}

resource "hooksniff_endpoint" "webhook" {
  url         = "https://myapp.com/webhook"
  description = "Production webhook endpoint"
}

output "endpoint_id" {
  value = hooksniff_endpoint.webhook.id
}

output "signing_secret" {
  value     = hooksniff_endpoint.webhook.signing_secret
  sensitive = true
}
```

## Development

```bash
# Build
go build -o terraform-provider-hooksniff

# Install locally
mkdir -p ~/.terraform.d/plugins/registry.terraform.io/hooksniff/hooksniff/0.1.0/linux_amd64
cp terraform-provider-hooksniff ~/.terraform.d/plugins/registry.terraform.io/hooksniff/hooksniff/0.1.0/linux_amd64/

# Test
cd examples && terraform init && terraform plan
```

## Publishing to Terraform Registry

1. Create GitHub repo: `terraform-provider-hooksniff`
2. Sign releases with GPG key
3. Submit to registry.terraform.io

## Status

⏳ Provider code needs to be written in Go. This is a documentation stub.
