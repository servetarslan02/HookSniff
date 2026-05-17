import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Deploy to Kubernetes',
  description: 'Run HookSniff on Kubernetes with Helm or raw manifests',
};

export default function KubernetesPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Deploy to Kubernetes</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Run HookSniff on any Kubernetes cluster — GKE, EKS, AKS, or self-hosted.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Prerequisites</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Kubernetes cluster (1.24+)</li>
          <li>kubectl configured</li>
          <li>Helm 3 (optional)</li>
          <li>PostgreSQL database (in-cluster or managed)</li>
          <li>Redis (optional, for rate limiting)</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Deploy</h2>
        <CodeBlock
          code={`# 1. Clone the repo
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff/deploy/kubernetes

# 2. Create namespace
kubectl create namespace hooksniff

# 3. Create secrets
kubectl create secret generic hooksniff-secrets \\
  --from-literal=DATABASE_URL='postgresql://...' \\
  --from-literal=JWT_SECRET='...' \\
  --from-literal=HMAC_SECRET='...' \\
  -n hooksniff

# 4. Deploy
kubectl apply -f . -n hooksniff

# 5. Check status
kubectl get pods -n hooksniff`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scaling</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Scale the worker based on queue depth:
        </p>
        <CodeBlock
          code={`# Scale worker replicas
kubectl scale deployment hooksniff-worker --replicas=3 -n hooksniff

# Auto-scale based on CPU
kubectl autoscale deployment hooksniff-worker --min=1 --max=5 --cpu-percent=70 -n hooksniff`}
        />
      </section>
    </article>
  );
}
