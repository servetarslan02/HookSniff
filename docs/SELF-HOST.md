# Self-Host Guide — HookSniff

Run HookSniff on your own infrastructure with a single command.

## Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff

# 2. Start with one command
make self-host
```

This command:
- Copies `.env.example` → `.env` (you'll need to edit it)
- Builds Docker images
- Starts all services (API, Worker, Dashboard, PostgreSQL, Redis)
- Runs health checks

## Services

| Service | Port | Description |
|---------|------|-------------|
| Dashboard | 3001 | Web UI |
| API | 3000 | REST API |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache + Queue |

## Management Commands

```bash
# Check status
make self-host-status

# Backup database
make self-host-backup

# Update (git pull + rebuild)
make self-host-update

# Stop all services
make stop

# View logs
make logs

# View logs for a specific service
make logs-api
make logs-worker
make logs-db
```

## Initial Setup

After starting the services:

```bash
# Create the first user
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your-password"}'

# Create an API key from the dashboard
# http://localhost:3001/dashboard/api-keys
```

## Environment Variables (.env)

```env
# Database (don't change if using Docker PostgreSQL)
DATABASE_URL=postgresql://hooksniff:hooksniff@postgres:5432/hooksniff

# Redis (don't change if using Docker Redis)
REDIS_URL=redis://redis:6379

# JWT Secret (change this!)
JWT_SECRET=random-64-character-hex-string

# HMAC Secret (change this!)
HMAC_SECRET=random-64-character-hex-string

# API Base URL (your domain in production)
API_BASE_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:3001
```

Generate secrets:
```bash
make generate-secret
```

## Production Deployment

### Reverse Proxy (Nginx)

```nginx
server {
    server_name hooksniff.example.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name api.hooksniff.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d hooksniff.example.com -d api.hooksniff.example.com
```

### Firewall

```bash
# Sadece HTTP/HTTPS ve SSH'a izin ver
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Docker Compose (Direct)

```bash
# Start
docker compose up -d --build

# Stop
docker compose down

# Reset database
docker compose down -v
docker compose up -d --build
```

## Troubleshooting

```bash
# Check service status
make status

# View logs
make logs

# Auto-fix common issues
make fix

# Reset everything
make reset
```

### Common Issues

**Port in use:**
```bash
sudo lsof -i :3000
sudo lsof -i :3001
```

**Database connection error:**
```bash
make db-shell
# In the PostgreSQL shell:
# \dt  (list tables)
# SELECT COUNT(*) FROM customers;
```

**Docker out of memory:**
```bash
docker system prune -a
```

## Updating

```bash
# One-command update
make self-host-update

# Or manually:
git pull origin main
docker compose build
docker compose up -d
```

## Backup and Restore

```bash
# Backup
make self-host-backup

# Restore
psql "$DATABASE_URL" < backup.sql
```

```bash
# Yedekle
make self-host-backup

# Geri yükle
docker compose exec -T postgres psql -U hooksniff -d hooksniff < backups/hooksniff_20240101_120000.sql
```
