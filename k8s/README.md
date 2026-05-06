# Kubernetes Deployment Guide

## Overview

HookRelay can be deployed to Kubernetes for production workloads. This directory contains
all the manifests needed for a standard deployment.

## Directory Structure

```
k8s/
├── namespace.yaml          # Namespace definition
├── configmap.yaml          # Non-secret configuration
├── secrets.yaml            # Secret values (⚠️ use sealed-secrets or external secrets in prod)
├── api-deployment.yaml     # API server deployment (2 replicas)
├── api-service.yaml        # ClusterIP service for API
├── worker-deployment.yaml  # Worker deployment (2 replicas)
├── dashboard-deployment.yaml # Dashboard deployment
├── dashboard-service.yaml  # ClusterIP service for dashboard
├── hpa.yaml                # Horizontal Pod Autoscaler for API
├── ingress.yaml            # Ingress with TLS termination
└── README.md               # This file
```

## Quick Deploy

### Prerequisites

- Kubernetes cluster (1.25+)
- `kubectl` configured
- `cert-manager` installed (for TLS)
- `nginx-ingress-controller` installed
- PostgreSQL database (e.g., Neon, Supabase, or self-hosted)

### Deploy

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Apply configuration
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# 3. Deploy services
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/api-service.yaml
kubectl apply -f k8s/worker-deployment.yaml
kubectl apply -f k8s/dashboard-deployment.yaml
kubectl apply -f k8s/dashboard-service.yaml

# 4. Enable autoscaling
kubectl apply -f k8s/hpa.yaml

# 5. Configure ingress
kubectl apply -f k8s/ingress.yaml

# 6. Verify
kubectl get pods -n hookrelay
kubectl get svc -n hookrelay
kubectl get ingress -n hookrelay
```

### Teardown

```bash
kubectl delete namespace hookrelay
```

## Multi-Region Setup

For multi-region deployments, deploy independent clusters in each region and use a
global load balancer (e.g., Cloudflare, AWS Global Accelerator, GCP Global LB).

### Architecture

```
                    ┌─────────────────────┐
                    │  Global Load Balancer│
                    │  (Cloudflare/GCP/AWS)│
                    └──────┬──────────┬───┘
                           │          │
               ┌───────────▼──┐  ┌───▼───────────┐
               │  US Region   │  │  EU Region    │
               │  Cluster     │  │  Cluster      │
               │              │  │               │
               │  ┌─────────┐ │  │  ┌─────────┐ │
               │  │ API x3  │ │  │  │ API x3  │ │
               │  │ Worker  │ │  │  │ Worker  │ │
               │  │ DB      │ │  │  │ DB      │ │
               │  └─────────┘ │  │  └─────────┘ │
               └──────────────┘  └───────────────┘
```

### Steps

1. **Deploy to each region** using the same manifests with region-specific config:

   ```bash
   # US region
   kubectl config use-context us-cluster
   kubectl apply -f k8s/
   
   # EU region
   kubectl config use-context eu-cluster
   kubectl apply -f k8s/
   ```

2. **Configure region-specific values** in `configmap.yaml`:
   - `DATABASE_URL` → point to regional PostgreSQL instance

3. **Set up global DNS** with latency-based or geo-based routing:
   - `api.hookrelay.io` → routes to nearest region
   - Each region gets its own TLS certificate

4. **Database replication** (PostgreSQL logical replication):
   ```sql
   -- Set up publication on primary
   CREATE PUBLICATION hookrelay_pub FOR ALL TABLES;
   
   -- Set up subscription on replica
   CREATE SUBSCRIPTION hookrelay_sub
     CONNECTION 'host=primary-host dbname=hookrelay'
     PUBLICATION hookrelay_pub;
   ```

## Scaling Recommendations

### API Server

| Metric | Scale Up | Scale Down |
|--------|----------|------------|
| CPU > 70% | Add replicas | — |
| Memory > 80% | Add replicas | — |
| Request queue depth | Add replicas | — |
| CPU < 30% for 15min | — | Remove replicas |

Current HPA config: 2–10 replicas, CPU target 70%.

### Worker

Workers scale based on pending webhook queue depth:

```bash
# Check pending deliveries in the queue
kubectl exec -n hookrelay deploy/hookrelay-api -- \
  psql "$DATABASE_URL" -c "SELECT count(*) FROM webhook_queue WHERE status = 'pending';"
```

Scale up when pending count exceeds 10,000.

### Database

PostgreSQL scaling options:
- **Vertical:** Increase CPU/memory on the database instance
- **Read replicas:** Add read replicas for read-heavy workloads
- **Connection pooling:** Use PgBouncer for high-concurrency workloads
- **Managed services:** Use Neon, Supabase, or AWS RDS for automatic scaling

## Monitoring Integration

After deploying, connect Prometheus to scrape metrics:

```yaml
# Add to prometheus.yml scrape_configs
- job_name: 'hookrelay-api'
  kubernetes_sd_configs:
    - role: pod
      namespaces:
        names: ['hookrelay']
  relabel_configs:
    - source_labels: [__meta_kubernetes_pod_label_app]
      regex: hookrelay-api
      action: keep
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
      regex: (.+)
      target_label: __address__
      replacement: ${1}:${2}
```

## Troubleshooting

```bash
# Pod status
kubectl get pods -n hookrelay -o wide

# Pod logs
kubectl logs -n hookrelay deploy/hookrelay-api --tail=100
kubectl logs -n hookrelay deploy/hookrelay-worker --tail=100

# Describe pod (events, resource usage)
kubectl describe pod -n hookrelay <pod-name>

# Exec into pod
kubectl exec -it -n hookrelay deploy/hookrelay-api -- /bin/sh

# Check ingress
kubectl describe ingress -n hookrelay hookrelay-ingress

# Check database connectivity
kubectl exec -it -n hookrelay deploy/hookrelay-api -- \
  psql "$DATABASE_URL" -c "SELECT 1;"
```
