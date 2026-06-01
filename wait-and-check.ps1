Start-Sleep -Seconds 60
docker compose ps --format "table {{.Name}}`t{{.Status}}"