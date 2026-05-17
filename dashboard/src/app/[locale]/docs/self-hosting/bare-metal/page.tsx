import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Deploy to Bare Metal',
  description: 'Run HookSniff on a VPS or dedicated server',
};

export default function BareMetalPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Deploy to Bare Metal</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Run HookSniff on a VPS (DigitalOcean, Hetzner, Linode) or dedicated server.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Ubuntu 22.04+ or Debian 12+</li>
          <li>2 vCPU, 4 GB RAM (minimum)</li>
          <li>20 GB SSD</li>
          <li>Docker and Docker Compose installed</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Setup</h2>
        <CodeBlock
          code={`# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Clone and start
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff
cp .env.production.example .env.production
# Edit .env.production with your settings

# 3. Start everything
docker compose -f docker-compose.yml up -d --build

# 4. Run migrations
docker compose exec api ./run-migrations

# 5. Verify
curl http://localhost:3000/v1/health`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nginx Reverse Proxy</h2>
        <CodeBlock
          code={`server {
    listen 80;
    server_name api.hooksniff.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name hooksniff.example.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">SSL with Let&apos;s Encrypt</h2>
        <CodeBlock
          code={`sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.hooksniff.example.com -d hooksniff.example.com`}
        />
      </section>
    </article>
  );
}
