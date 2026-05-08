'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';

interface Schema {
  id: string;
  name: string;
  version: string;
  created_at: string;
}

export default function SchemasPage() {
  const { token } = useAuth();
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ schemas: Schema[] }>('/schemas', { token })
      .then((res) => setSchemas(res.schemas || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📋 Schemas</h1>
      <p className="text-gray-500 mb-6">
        Define and validate event schemas. Ensure your webhooks conform to expected formats.
      </p>
      {schemas.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <p className="text-gray-500 text-lg mb-2">No schemas registered yet</p>
          <p className="text-gray-400 text-sm">Register a schema to start validating your webhook payloads.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schemas.map((s) => (
            <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm text-gray-500">v{s.version} · {s.created_at}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
