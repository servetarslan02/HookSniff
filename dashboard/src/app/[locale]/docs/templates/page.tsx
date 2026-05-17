import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Webhook Templates',
  description: 'Pre-built webhook configurations for common use cases',
};

export default function TemplatesPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Webhook Templates</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Don&apos;t start from scratch. Templates provide pre-configured webhook setups for common scenarios.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Setting up webhooks for common use cases (e-commerce, SaaS, CI/CD) requires configuring event types, endpoints, retry policies, and payload formats. Every developer does this differently.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How Templates Work</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Templates are pre-built configurations that set up everything at once: event types, endpoint settings, retry policies, and payload schemas.
        </p>
        <CodeBlock
          code={`// List available templates
curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/templates \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
      </section>

      {/* Apply Template */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Apply a Template</h2>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/templates/tmpl_ecommerce/apply \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_url": "https://myapp.com/webhooks",
    "customizations": {
      "retry_attempts": 5,
      "event_filter": "order.*"
    }
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          This creates an endpoint with the right event types, retry policy, and schema validation — all in one API call.
        </p>
      </section>

      {/* Use Cases */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Available Templates</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>E-commerce</strong> — Order, payment, shipping, inventory events</li>
          <li><strong>SaaS</strong> — User, subscription, billing events</li>
          <li><strong>CI/CD</strong> — Build, deploy, test events</li>
          <li><strong>Custom</strong> — Create your own templates</li>
        </ul>
      </section>
    </article>
  );
}
