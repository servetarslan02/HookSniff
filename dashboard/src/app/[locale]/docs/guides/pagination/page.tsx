import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { FileText } from '@/components/icons';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Pagination — HookSniff Docs',
  description: 'Paginate through endpoints, deliveries, and events using cursor-based pagination',
};

export default function PaginationPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2"><FileText size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Pagination</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        All list endpoints in the HookSniff API use <strong>cursor-based pagination</strong>. This is faster and more reliable than offset-based pagination for large datasets.
      </p>

      {/* How It Works */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Each response includes a <code>cursor</code> field pointing to the next page. Pass it as a query parameter to get the next batch:
        </p>
        <CodeBlock
          code={`# First page
GET /v1/endpoints?limit=20
# Response: { "data": [...], "cursor": "eyJpZCI6MTB9" }

# Next page
GET /v1/endpoints?limit=20&cursor=eyJpZCI6MTB9
# Response: { "data": [...], "cursor": "eyJpZCI6MjB9" }

# No more pages
GET /v1/endpoints?limit=20&cursor=eyJpZCI6MjB9
# Response: { "data": [...], "cursor": null }`}
        />
      </section>

      {/* Parameters */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Parameters</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Parameter</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Default</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr>
                <td className="px-4 py-3 font-mono text-sm">limit</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">integer</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">20</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Number of items per page (max 100)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">cursor</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">string</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">null</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Pagination cursor from previous response</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">iterator</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">string</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">null</td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">Alternative: event iterator for deliveries</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SDK Examples */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Manual Pagination</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Node.js</h3>
        <CodeBlock
          code={`// Manual pagination
let cursor = undefined;
do {
  const page = await hs.endpoint.list({ limit: 20, cursor });
  for (const ep of page.data) {
    console.log(ep.url);
  }
  cursor = page.cursor;
} while (cursor);`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Python</h3>
        <CodeBlock
          code={`# Manual pagination
cursor = None
while True:
    page = hs.endpoint.list(limit=20, cursor=cursor)
    for ep in page.data:
        print(ep.url)
    cursor = page.cursor
    if not cursor:
        break`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Go</h3>
        <CodeBlock
          code={`cursor := ""
for {
    page, _ := hs.Endpoint.List(ctx, &hooksniff.EndpointListOptions{
        Limit:  hooksniff.Int32(20),
        Cursor: &cursor,
    })
    for _, ep := range page.Data {
        fmt.Println(ep.Url)
    }
    if page.Cursor == nil || *page.Cursor == "" {
        break
    }
    cursor = *page.Cursor
}`}
        />
      </section>

      {/* Auto-Paginate */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Auto-Paginate Helpers</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          All SDKs provide iterator helpers that handle pagination automatically:
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Node.js</h3>
        <CodeBlock
          code={`// Iterate all endpoints (auto-paginates)
for await (const ep of hs.endpoint.listIterator({ limit: 100 })) {
  console.log(ep.url);
}

// Collect all into array
const allEndpoints = await hs.endpoint.listAll();`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Python</h3>
        <CodeBlock
          code={`# Iterate all endpoints (auto-paginates)
for ep in hs.endpoint.list_iterator(limit=100):
    print(ep.url)

# Collect all into list
all_endpoints = list(hs.endpoint.list_iterator())`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Go</h3>
        <CodeBlock
          code={`// Iterate all endpoints (auto-paginates)
iter := hs.Endpoint.ListIterator(ctx, &hooksniff.EndpointListOptions{
    Limit: hooksniff.Int32(100),
})
for iter.Next() {
    ep := iter.Current()
    fmt.Println(ep.Url)
}
if err := iter.Err(); err != nil {
    log.Fatal(err)
}`}
        />
      </section>

      {/* Filtering */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Filtering & Sorting</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Many list endpoints support additional filters:
        </p>
        <CodeBlock
          code={`# Filter deliveries by event type
GET /v1/webhooks?event_type=order.created&limit=20

# Filter by endpoint
GET /v1/webhooks?endpoint_id=ep_abc123&limit=20

# Filter by status
GET /v1/webhooks?status=failed&limit=20

# Filter by date range
GET /v1/webhooks?after=2024-01-01T00:00:00Z&before=2024-01-31T23:59:59Z`}
        />
      </section>
    </article>
  );
}
