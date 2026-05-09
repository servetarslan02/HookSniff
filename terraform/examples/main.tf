# HookSniff Terraform Example — Full Setup
# Manages endpoints, API keys, schemas, and event types

terraform {
  required_version = ">= 1.0"
  required_providers {
    hooksniff = {
      source  = "hooksniff/hooksniff"
      version = "~> 0.1.0"
    }
  }
}

# ─── Provider Configuration ───

provider "hooksniff" {
  api_key  = var.hooksniff_api_key
  base_url = var.hooksniff_base_url
}

variable "hooksniff_api_key" {
  description = "HookSniff API key"
  type        = string
  sensitive   = true
}

variable "hooksniff_base_url" {
  description = "HookSniff API base URL"
  type        = string
  default     = "https://api.hooksniff.dev/v1"
}

# ─── Endpoints ───

resource "hooksniff_endpoint" "production" {
  url         = "https://api.myapp.com/webhooks/hooksniff"
  description = "Production webhook receiver"
}

resource "hooksniff_endpoint" "staging" {
  url         = "https://staging-api.myapp.com/webhooks/hooksniff"
  description = "Staging webhook receiver"
}

resource "hooksniff_endpoint" "slack_notifications" {
  url         = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
  description = "Slack notifications for order events"
}

# ─── API Keys ───

resource "hooksniff_api_key" "ci_cd" {
  name = "CI/CD Pipeline"
}

resource "hooksniff_api_key" "monitoring" {
  name = "Monitoring Service"
}

# ─── Event Types ───

resource "hooksniff_event_type" "order_created" {
  name        = "order.created"
  description = "Fired when a new order is placed"
}

resource "hooksniff_event_type" "order_shipped" {
  name        = "order.shipped"
  description = "Fired when an order is shipped"
}

resource "hooksniff_event_type" "payment_completed" {
  name        = "payment.completed"
  description = "Fired when a payment succeeds"
}

resource "hooksniff_event_type" "payment_failed" {
  name        = "payment.failed"
  description = "Fired when a payment fails"
}

# ─── Outputs ───

output "production_endpoint_id" {
  description = "Production endpoint ID"
  value       = hooksniff_endpoint.production.id
}

output "staging_endpoint_id" {
  description = "Staging endpoint ID"
  value       = hooksniff_endpoint.staging.id
}

output "ci_cd_api_key" {
  description = "CI/CD API key (save this!)"
  value       = hooksniff_api_key.ci_cd.key
  sensitive   = true
}

output "monitoring_api_key" {
  description = "Monitoring API key (save this!)"
  value       = hooksniff_api_key.monitoring.key
  sensitive   = true
}

# ─── Data Sources ───

data "hooksniff_endpoints" "all" {}

output "total_endpoints" {
  description = "Total number of endpoints"
  value       = length(data.hooksniff_endpoints.all.endpoints)
}
