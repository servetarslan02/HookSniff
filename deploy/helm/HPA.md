# Horizontal Pod Autoscaler (HPA) for HookSniff

## Overview

HookSniff does not yet use HPA. All deployments use a fixed `replicaCount: 1` (see `values.yaml`). This guide covers how to add autoscaling.

## Why HPA?

HookSniff processes webhook deliveries that can spike unpredictably (e.g., Stripe Black Friday traffic). HPA ensures:

- **Scale up** during traffic spikes → no delivery backlog
- **Scale down** during quiet periods → cost savings
- **Worker scaling** is most critical — it's the bottleneck for delivery throughput

## Recommended HPA Configuration

### API Service

```yaml
# Add to deploy/helm/hooksniff/templates/hpa-api.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ .Release.Name }}-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ .Release.Name }}-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 2
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 1
          periodSeconds: 120
```

### Worker Service (most important)

```yaml
# Add to deploy/helm/hooksniff/templates/hpa-worker.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ .Release.Name }}-worker
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ .Release.Name }}-worker
  minReplicas: 2
  maxReplicas: 20
  metrics:
    # Scale on CPU — webhook delivery is CPU-bound (HTTP + crypto)
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
    # Custom metric: queue depth (requires Prometheus adapter)
    # - type: Pods
    #   pods:
    #     metric:
    #       name: webhook_queue_pending
    #     target:
    #       type: AverageValue
    #       averageValue: "100"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
        - type: Percent
          value: 100
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 1
          periodSeconds: 120
```

### Dashboard Service

```yaml
# Add to deploy/helm/hooksniff/templates/hpa-dashboard.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ .Release.Name }}-dashboard
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ .Release.Name }}-dashboard
  minReplicas: 1
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 75
```

## Values.yaml Additions

```yaml
# Add to values.yaml
autoscaling:
  enabled: false
  api:
    minReplicas: 2
    maxReplicas: 10
    targetCPU: 70
  worker:
    minReplicas: 2
    maxReplicas: 20
    targetCPU: 60
  dashboard:
    minReplicas: 1
    maxReplicas: 5
    targetCPU: 75
```

## Prerequisites

### 1. Metrics Server

HPA requires metrics server for CPU/memory metrics:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### 2. (Optional) Prometheus Adapter for Custom Metrics

For queue-depth-based scaling, install Prometheus Adapter:

```bash
helm install prometheus-adapter prometheus-community/prometheus-adapter \
  --set prometheus.url=http://prometheus-server \
  --set prometheus.port=9090
```

Then expose `webhook_queue_pending` as a custom metric from the worker.

## Worker Concurrency Considerations

The worker has `DELIVERY_CONCURRENCY_LIMIT = 10` (semaphore). When scaling workers:

- Each worker processes up to 10 concurrent HTTP deliveries
- `FOR UPDATE SKIP LOCKED` prevents duplicate processing across workers
- 20 workers × 10 concurrent = 200 parallel deliveries max
- Monitor `webhook_queue` depth to tune `maxReplicas`

## Monitoring HPA

```bash
# Check HPA status
kubectl get hpa

# Watch scaling events
kubectl describe hpa hooksniff-worker

# Check current metrics
kubectl top pods -l app.kubernetes.io/component=worker
```

## Cost vs Latency Tradeoffs

| Setting | Cost | Latency |
|---------|------|---------|
| `minReplicas: 1` | Low | Cold start delay |
| `minReplicas: 2` | Medium | Always warm |
| `maxReplicas: 20` | High (at peak) | Handles spikes |
| `targetCPU: 60` | Higher | More headroom |
| `targetCPU: 80` | Lower | May queue during spikes |

**Recommendation**: Start with `minReplicas: 2`, `maxReplicas: 10`, `targetCPU: 70` and tune based on observed traffic patterns.
