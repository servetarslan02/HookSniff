# Deployment Guide

## Prerequisites

- Docker & Docker Compose v2+
- A domain name with DNS configured
- SSL certificate (or use Let's Encrypt via cert-manager)
- 4 GB RAM minimum, 8 GB recommended
- 2 vCPUs minimum, 4 recommended

## Quick Start (Development)

```bash
# Clone the repository
git clone https://github.com/your-org/hookrelay.git
cd hookrelay

# Copy and edit environment file
cp .env.example .env

# Start infrastructure
make infra

# Run API and worker in separate terminals
make api
make worker
make dashboard
```

## Production Deployment

### 1. Prepare Environment

```bash
# Copy production env template
cp .env.production .env

# Edit with your production values
# ⚠️ MUST change: HMAC_SECRET, JWT_SECRET, DATABASE_URL
nano .env
```

### 2. Build and Start

```bash
# Build all images
docker compose -f docker-compose.prod.yml build

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Verify health
docker compose -f docker-compose.prod.yml ps
```

### 3. Run Database Migrations

```bash
# Connect to CockroachDB
docker exec -it hookrelay-cockroachdb-1 cockroach sql --insecure -d hookrelay

# Or run migrations from the host
# (depends on your migration tool — see migrations/ directory)
```

### 4. Configure Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name api.hookrelay.io;

    ssl_certificate /etc/letsencrypt/live/api.hookrelay.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.hookrelay.io/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        client_max_body_size 2m;
    }
}
```

### 5. Enable Monitoring (Optional)

```bash
# Start Prometheus + Grafana
docker compose -f monitoring/docker-compose.monitoring.yml up -d

# Access Grafana at http://localhost:3002
# Default login: admin / hookrelay_grafana_change_me
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_ENV` | No | `development` | Environment name |
| `PORT` | No | `3000` | API server port |
| `DATABASE_URL` | Yes | — | CockroachDB connection string |
| `KAFKA_BROKERS` | Yes | — | Kafka/Redpanda broker addresses |
| `KAFKA_TOPIC` | No | `webhook-deliveries` | Kafka topic name |
| `HMAC_SECRET` | Yes | — | Webhook payload signing secret |
| `JWT_SECRET` | Yes | — | JWT token signing secret |
| `MAX_PAYLOAD_BYTES` | No | `1048576` | Max webhook payload size (1 MB) |
| `RETENTION_DAYS` | No | `30` | Days to keep delivery logs |
| `RUST_LOG` | No | `info` | Log level |

## SSL/TLS Setup

### Option A: Nginx + Let's Encrypt (recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.hookrelay.io -d dashboard.hookrelay.io

# Auto-renew
sudo crontab -e
# Add: 0 3 * * * certbot renew --quiet
```

### Option B: Kubernetes + cert-manager

See `k8s/ingress.yaml` — uses `letsencrypt-prod` ClusterIssuer.

## Database Migrations

Migrations are in the `migrations/` directory. Run them against CockroachDB:

```bash
# Using cockroach CLI
docker exec -i hookrelay-cockroachdb-1 cockroach sql --insecure -d hookrelay < migrations/001_init.sql

# Or use a migration tool (sqlx, refinery, etc.)
```

## Backup & Restore

See `scripts/backup.sh` and `scripts/restore.sh`.

```bash
# Full backup
./scripts/backup.sh full

# Incremental backup
./scripts/backup.sh incremental

# Restore
./scripts/restore.sh /path/to/backup
```

## Scaling

### Horizontal Scaling

- **API**: Add replicas behind a load balancer
- **Worker**: Add replicas — Kafka consumer groups handle partitioning
- **Database**: CockroachDB supports multi-node clusters

### Vertical Scaling

Update resource limits in `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 4G
```

## Troubleshooting

### Service won't start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs worker

# Check health
curl http://localhost:3000/health
```

### High error rate

1. Check API logs for error details
2. Verify CockroachDB connectivity
3. Check Kafka/Redpanda health
4. Review Grafana dashboards for anomalies

### Rate limiting

Check `X-RateLimit-*` headers in API responses:
- `X-RateLimit-Limit`: Max requests per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Seconds until window resets
