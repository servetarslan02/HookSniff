'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';

interface Schema {
  id: string;
  name: string;
  version: string;
  created_at: string;
  schema?: Record<string, unknown>;
}

/** Render JSON Schema features: enum, oneOf, format (Item 332) */
function SchemaFeatures({ schema }: { schema: Record<string, unknown> }) {
  const features: string[] = [];
  if (schema.enum) features.push(`enum: ${(schema.enum as string[]).join(', ')}`);
  if (schema.format) features.push(`format: ${schema.format}`);
  if (schema.oneOf) features.push(`oneOf: ${(schema.oneOf as unknown[]).length} variants`);
  if (schema.anyOf) features.push(`anyOf: ${(schema.anyOf as unknown[]).length} variants`);
  if (schema.allOf) features.push(`allOf: ${(schema.allOf as unknown[]).length} schemas`);

  if (features.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {features.map((f) => (
        <span key={f} className="text-xs px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded-full font-mono">
          {f}
        </span>
      ))}
    </div>
  );
}

export default function SchemasPage() {
  const t = useTranslations('schemasPage');
  const tCommon = useTranslations('common');
  const { token } = useAuth();
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ schemas: Schema[] }>('/schemas', { token })
      .then((res) => setSchemas(res.schemas || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-8 text-gray-500 dark:text-slate-400">{tCommon('loading')}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <p className="text-gray-500 mb-6">
        {t('subtitle')}
      </p>
      {schemas.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <p className="text-gray-500 text-lg mb-2">{t('noSchemas')}</p>
          <p className="text-gray-500 text-sm">{t('noSchemasDesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schemas.map((s) => (
            <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(expandedId === s.id ? null : s.id); } }}>
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">v{s.version} · {s.created_at}</p>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === s.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {expandedId === s.id && s.schema && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <SchemaFeatures schema={s.schema} />
                  <pre className="mt-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg text-xs font-mono overflow-x-auto text-gray-700 dark:text-slate-300">
                    {JSON.stringify(s.schema, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
