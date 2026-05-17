import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Deploy to AWS',
  description: 'Run HookSniff on AWS with ECS, RDS, and ElastiCache',
};

export default function AwsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Deploy to AWS</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Run HookSniff on AWS using ECS Fargate, RDS PostgreSQL, and ElastiCache Redis.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Architecture</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>API + Worker:</strong> ECS Fargate (serverless containers)</li>
          <li><strong>Database:</strong> RDS PostgreSQL (t3.micro for starter)</li>
          <li><strong>Cache:</strong> ElastiCache Redis (t3.micro)</li>
          <li><strong>Load Balancer:</strong> Application Load Balancer (ALB)</li>
          <li><strong>Dashboard:</strong> S3 + CloudFront (static hosting)</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Setup</h2>
        <CodeBlock
          code={`# 1. Clone the repo
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff

# 2. Configure environment
cp .env.production.example .env.production
# Edit .env.production with your RDS and Redis endpoints

# 3. Build and push Docker images
aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com
docker build -f Dockerfile.api -t hooksniff-api .
docker build -f Dockerfile.worker -t hooksniff-worker .
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/hooksniff-api
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/hooksniff-worker

# 4. Deploy with ECS (use the provided task definitions)
aws ecs create-service --cluster hooksniff --service-name api ...
aws ecs create-service --cluster hooksniff --service-name worker ...`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Estimated Cost</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Service</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Instance</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Monthly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">ECS Fargate (API)</td><td className="px-4 py-3">0.25 vCPU, 0.5 GB</td><td className="px-4 py-3">~$9</td></tr>
              <tr><td className="px-4 py-3">ECS Fargate (Worker)</td><td className="px-4 py-3">0.25 vCPU, 0.5 GB</td><td className="px-4 py-3">~$9</td></tr>
              <tr><td className="px-4 py-3">RDS PostgreSQL</td><td className="px-4 py-3">db.t3.micro</td><td className="px-4 py-3">~$13</td></tr>
              <tr><td className="px-4 py-3">ElastiCache Redis</td><td className="px-4 py-3">cache.t3.micro</td><td className="px-4 py-3">~$12</td></tr>
              <tr><td className="px-4 py-3">ALB</td><td className="px-4 py-3">—</td><td className="px-4 py-3">~$16</td></tr>
              <tr><td className="px-4 py-3 font-medium">Total</td><td className="px-4 py-3"></td><td className="px-4 py-3 font-medium">~$59/mo</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>
    </article>
  );
}
