# HookSniff Terraform Provider

Manage your HookSniff webhook infrastructure as code.

## Quick Start

```hcl
terraform {
  required_providers {
    hooksniff = {
      source  = "hooksniff/hooksniff"
      version = "~> 0.1.0"
    }
  }
}

provider "hooksniff" {
  api_key = var.hooksniff_api_key
  # base_url = "https://api.hooksniff.dev/v1"  # optional, for self-hosted
}

# Create an endpoint
resource "hooksniff_endpoint" "production" {
  url         = "https://api.myapp.com/webhooks"
  description = "Production webhook endpoint"
}

# Create an API key
resource "hooksniff_api_key" "ci" {
  name = "CI/CD Pipeline"
}

# Output the endpoint ID
output "endpoint_id" {
  value = hooksniff_endpoint.production.id
}
```

## Resources

### `hooksniff_endpoint`

Manages a webhook endpoint.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ | The URL to deliver webhooks to |
| `description` | string | ❌ | Human-readable description |
| `is_active` | bool | ❌ | Whether the endpoint is active (default: true) |

**Computed:**
- `id` — Endpoint ID
- `created_at` — Creation timestamp
- `failure_streak` — Current failure count

### `hooksniff_api_key`

Manages an API key.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ❌ | Human-readable name |

**Computed:**
- `id` — Key ID
- `prefix` — Key prefix (for display)
- `key` — The full API key (sensitive, only on create)
- `created_at` — Creation timestamp

### `hooksniff_schema`

Manages a webhook schema.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Schema name |
| `schema` | string | ✅ | JSON Schema definition |
| `version` | string | ❌ | Schema version |

### `hooksniff_event_type`

Manages an event type.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Event type name (e.g., `order.created`) |
| `description` | string | ❌ | What this event represents |
| `schema_id` | string | ❌ | Associated schema ID |

## Data Sources

### `hooksniff_endpoint`

Read endpoint data.

```hcl
data "hooksniff_endpoint" "prod" {
  id = "ep_abc123"
}

output "endpoint_url" {
  value = data.hooksniff_endpoint.prod.url
}
```

### `hooksniff_endpoints`

List all endpoints.

```hcl
data "hooksniff_endpoints" "all" {}

output "endpoint_count" {
  value = length(data.hooksniff_endpoints.all.endpoints)
}
```

## Import

Existing resources can be imported:

```bash
terraform import hooksniff_endpoint.production ep_abc123
terraform import hooksniff_api_key.ci key_xyz789
```

## Self-Hosted

For self-hosted HookSniff instances:

```hcl
provider "hooksniff" {
  api_key  = var.hooksniff_api_key
  base_url = "https://hooksniff.mycompany.com/v1"
}
```

## Development

```bash
# Build provider
cd terraform/hooksniff
go build -o terraform-provider-hooksniff

# Run tests
go test ./...

# Install locally
go install .
```

## License

MIT
