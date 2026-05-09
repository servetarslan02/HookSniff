import CodeBlock from '@/components/CodeBlock';

export default function SelfHostingPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Self-Hosting Guide</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Run HookSniff on your own infrastructure. One-command setup with Docker.
      </p>

      {/* Quick Setup */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Setup</h2>
        <CodeBlock
          code={`# 1. Clone the repo
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff

# 2. Start everything with one command
make self-host`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          This command copies <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">.env.example</code> → <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">.env</code>, builds Docker images, starts all services, and runs health checks.
        </p>
      </section>

      {/* Services */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Services</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Service</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Port</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-medium">Dashboard</td><td className="px-4 py-3">3001</td><td className="px-4 py-3">Web UI</td></tr>
              <tr><td className="px-4 py-3 font-medium">API</td><td className="px-4 py-3">3000</td><td className="px-4 py-3">REST API</td></tr>
              <tr><td className="px-4 py-3 font-medium">PostgreSQL</td><td className="px-4 py-3">5432</td><td className="px-4 py-3">Database</td></tr>
              <tr><td className="px-4 py-3 font-medium">Redis</td><td className="px-4 py-3">6379</td><td className="px-4 py-3">Cache + Queue</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Environment Variables */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Environment Variables</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Configure via <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">.env</code> file:
        </p>
        <CodeBlock
          code={`# Database (don't change if using Docker PostgreSQL)
DATABASE_URL=postgresql://hooksniff:hooksniff@postgres:5432/hooksniff

# Redis (don't change if using Docker Redis)
REDIS_URL=redis://redis:6379

# JWT Secret (CHANGE THIS!)
JWT_SECRET=rastgele-64-karakter-hex-string

# HMAC Secret (CHANGE THIS!)
HMAC_SECRET=rastgele-64-karakter-hex-string

# API Base URL (your domain in production)
API_BASE_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:3001`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Generate secrets: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">make generate-secret</code>
        </p>
      </section>

      {/* Docker Compose */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Docker Compose</h2>
        <CodeBlock
          code={`# Start
docker compose up -d --build

# Stop
docker compose down

# Reset database
docker compose down -v
docker compose up -d --build`}
        />
      </section>

      {/* Management Commands */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Management Commands</h2>
        <CodeBlock
          code={`# Status check
make self-host-status

# Database backup
make self-host-backup

# Update (git pull + rebuild)
make self-host-update

# View logs
make logs

# Single service logs
make logs-api
make logs-worker
make logs-db`}
        />
      </section>

      {/* Production Deployment */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cloud Deployment</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          For production, set up a reverse proxy with SSL:
        </p>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Nginx Reverse Proxy</h3>
        <CodeBlock
          code={`server {
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
}`}
        />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">SSL with Let's Encrypt</h3>
        <CodeBlock
          code={`sudo certbot --nginx -d hooksniff.example.com -d api.hooksniff.example.com`}
        />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Firewall</h3>
        <CodeBlock
          code={`sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable`}
        />
      </section>

      {/* Troubleshooting */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Troubleshooting</h2>
        <CodeBlock
          code={`# Check service status
make status

# View logs
make logs

# Auto-fix common issues
make fix

# Nuclear reset
make reset

# Check port conflicts
sudo lsof -i :3000
sudo lsof -i :3001

# Database shell
make db-shell`}
        />
      </section>
    </article>
  );
}
