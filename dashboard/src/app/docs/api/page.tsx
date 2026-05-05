export default function ApiReferencePage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">API Reference</h1>
      <p className="text-lg text-gray-600 mb-8">
        Complete reference for the Hookrelay REST API. Base URL: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">https://api.hookrelay.io/v1</code>
      </p>

      {/* Endpoints API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Endpoints</h2>

        <ApiMethod
          method="GET"
          path="/endpoints"
          description="List all endpoints for the authenticated account."
          response={`[
  {
    "id": "ep_abc123",
    "url": "https://myapp.com/webhook",
    "description": "Order notifications",
    "is_active": true,
    "created_at": "2026-01-15T10:30:00Z"
  }
]`}
        />

        <ApiMethod
          method="POST"
          path="/endpoints"
          description="Create a new endpoint."
          request={`{
  "url": "https://myapp.com/webhook",
  "description": "Order notifications"  // optional
}`}
          response={`{
  "id": "ep_abc123",
  "url": "https://myapp.com/webhook",
  "description": "Order notifications",
  "signing_secret": "whsec_abc123xyz789...",
  "is_active": true,
  "created_at": "2026-01-15T10:30:00Z"
}`}
        />

        <ApiMethod
          method="DELETE"
          path="/endpoints/:id"
          description="Delete an endpoint. All pending deliveries to this endpoint will be cancelled."
          response={`{ "deleted": true }`}
        />
      </section>

      {/* Webhooks API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Webhooks</h2>

        <ApiMethod
          method="POST"
          path="/webhooks"
          description="Send a webhook to an endpoint. The webhook will be delivered asynchronously with automatic retries on failure."
          request={`{
  "endpoint_id": "ep_abc123",
  "event": "order.created",       // optional
  "data": {                        // your payload
    "order_id": "12345",
    "total": 99.99
  }
}`}
          response={`{
  "id": "wh_xyz789",
  "endpoint_id": "ep_abc123",
  "event": "order.created",
  "status": "pending",
  "attempt_count": 0,
  "created_at": "2026-01-15T10:30:00Z"
}`}
        />

        <ApiMethod
          method="GET"
          path="/webhooks"
          description="List webhook deliveries with optional filtering and pagination."
          request={`// Query Parameters:
// ?page=1          — page number
// ?per_page=20     — results per page
// ?status=delivered — filter by status
// ?event=order.created — filter by event type`}
          response={`{
  "deliveries": [
    {
      "id": "wh_xyz789",
      "endpoint_id": "ep_abc123",
      "event": "order.created",
      "status": "delivered",
      "attempt_count": 1,
      "response_status": 200,
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 142,
  "page": 1,
  "per_page": 20
}`}
        />

        <ApiMethod
          method="GET"
          path="/webhooks/:id"
          description="Get details of a specific webhook delivery including attempt history."
          response={`{
  "id": "wh_xyz789",
  "endpoint_id": "ep_abc123",
  "event": "order.created",
  "status": "delivered",
  "attempt_count": 2,
  "response_status": 200,
  "attempts": [
    { "attempt": 1, "status": 500, "timestamp": "2026-01-15T10:30:00Z" },
    { "attempt": 2, "status": 200, "timestamp": "2026-01-15T10:35:00Z" }
  ],
  "created_at": "2026-01-15T10:30:00Z"
}`}
        />
      </section>

      {/* Stats API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Stats</h2>

        <ApiMethod
          method="GET"
          path="/stats"
          description="Get aggregate delivery statistics for the authenticated account."
          response={`{
  "total_deliveries": 12847,
  "delivered": 12453,
  "failed": 127,
  "pending": 267,
  "success_rate": 96.93,
  "endpoints_count": 8
}`}
        />
      </section>

      {/* Error Codes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Error Codes</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Meaning</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono">400</td><td className="px-4 py-3">Bad Request</td><td className="px-4 py-3">Invalid request body or parameters</td></tr>
              <tr><td className="px-4 py-3 font-mono">401</td><td className="px-4 py-3">Unauthorized</td><td className="px-4 py-3">Missing or invalid API key</td></tr>
              <tr><td className="px-4 py-3 font-mono">403</td><td className="px-4 py-3">Forbidden</td><td className="px-4 py-3">Insufficient permissions or plan limits exceeded</td></tr>
              <tr><td className="px-4 py-3 font-mono">404</td><td className="px-4 py-3">Not Found</td><td className="px-4 py-3">Resource does not exist</td></tr>
              <tr><td className="px-4 py-3 font-mono">429</td><td className="px-4 py-3">Rate Limited</td><td className="px-4 py-3">Too many requests — check Retry-After header</td></tr>
              <tr><td className="px-4 py-3 font-mono">500</td><td className="px-4 py-3">Server Error</td><td className="px-4 py-3">Internal error — contact support if persistent</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Error Response Format</h3>
          <pre className="text-sm font-mono text-gray-700">
{`{
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded. Try again in 30 seconds."
  }
}`}
          </pre>
        </div>
      </section>
    </article>
  );
}

function ApiMethod({
  method,
  path,
  description,
  request,
  response,
}: {
  method: string;
  path: string;
  description: string;
  request?: string;
  response: string;
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
    PUT: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="mb-8 p-6 border border-gray-200 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${methodColors[method] || ''}`}>
          {method}
        </span>
        <code className="font-mono text-sm text-gray-900">{path}</code>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      {request && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Request</h4>
          <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
            {request}
          </pre>
        </div>
      )}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Response</h4>
        <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
          {response}
        </pre>
      </div>
    </div>
  );
}
