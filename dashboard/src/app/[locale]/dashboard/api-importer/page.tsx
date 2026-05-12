'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { endpointsApi } from '@/lib/api';

/* ─── Types ─── */
interface ParsedEndpoint {
  path: string;
  method: string;
  description: string;
  selected: boolean;
}

interface ParsedSpec {
  title: string;
  version: string;
  baseUrl: string;
  endpoints: ParsedEndpoint[];
}

/* ─── Parser ─── */
function parseOpenApiSpec(content: string): ParsedSpec | null {
  try {
    const spec = JSON.parse(content);
    const info = spec.info || {};
    const baseUrl = spec.servers?.[0]?.url || '';
    const endpoints: ParsedEndpoint[] = [];

    if (spec.paths) {
      for (const [path, methods] of Object.entries(spec.paths as Record<string, Record<string, unknown>>)) {
        for (const [method, details] of Object.entries(methods)) {
          if (['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
            const d = details as Record<string, unknown>;
            endpoints.push({
              path,
              method: method.toUpperCase(),
              description: (d.summary as string) || (d.description as string) || `${method.toUpperCase()} ${path}`,
              selected: true,
            });
          }
        }
      }
    }

    return {
      title: info.title || 'Imported API',
      version: info.version || '1.0.0',
      baseUrl,
      endpoints,
    };
  } catch {
    return null;
  }
}

/* ─── Main Page ─── */
export default function ApiSpecImporterPage() {
  const t = useTranslations('apiImporter');
  const { token } = useAuth();
  const { toast } = useToast();
  const [specUrl, setSpecUrl] = useState('');
  const [specContent, setSpecContent] = useState('');
  const [parsed, setParsed] = useState<ParsedSpec | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const [mode, setMode] = useState<'url' | 'paste'>('url');

  const fetchSpec = async () => {
    if (!specUrl) return;
    try {
      const res = await fetch(specUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setSpecContent(text);
      const result = parseOpenApiSpec(text);
      if (result) {
        setParsed(result);
        toast(t('parsedOk', { count: result.endpoints.length }), 'success');
      } else {
        toast(t('failedToParse'), 'error');
      }
    } catch (err) {
      toast(`Failed to fetch: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  const parseContent = () => {
    if (!specContent) return;
    const result = parseOpenApiSpec(specContent);
    if (result) {
      setParsed(result);
      toast(t('parsedOk', { count: result.endpoints.length }), 'success');
    } else {
      toast(t('failedToParseJson'), 'error');
    }
  };

  const toggleEndpoint = (index: number) => {
    if (!parsed) return;
    const updated = { ...parsed };
    updated.endpoints = [...updated.endpoints];
    updated.endpoints[index] = { ...updated.endpoints[index], selected: !updated.endpoints[index].selected };
    setParsed(updated);
  };

  const toggleAll = () => {
    if (!parsed) return;
    const allSelected = parsed.endpoints.every((e) => e.selected);
    setParsed({
      ...parsed,
      endpoints: parsed.endpoints.map((e) => ({ ...e, selected: !allSelected })),
    });
  };

  const importEndpoints = useCallback(async () => {
    if (!parsed || !token) return;
    const selected = parsed.endpoints.filter((e) => e.selected);
    if (selected.length === 0) {
      toast(t('selectAtLeastOne'), 'error');
      return;
    }

    setImporting(true);
    setImported(0);
    let success = 0;

    for (const ep of selected) {
      try {
        const url = ep.path.startsWith('http') ? ep.path : `${parsed.baseUrl}${ep.path}`;
        await endpointsApi.create(token, {
          url: url || 'https://example.com/webhook',
          description: `[${ep.method}] ${ep.description}`,
        });
        success++;
        setImported(success);
      } catch {
        // Continue with remaining
      }
    }

    toast(t('imported', { success, total: selected.length }), success > 0 ? 'success' : 'error');
    setImporting(false);
  }, [parsed, token, toast, t]);

  const sampleSpec = `{
  "openapi": "3.0.0",
  "info": {
    "title": "My API",
    "version": "1.0.0"
  },
  "servers": [
    { "url": "https://api.example.com" }
  ],
  "paths": {
    "/orders": {
      "post": {
        "summary": "Create order",
        "description": "Creates a new order"
      }
    },
    "/users": {
      "get": {
        "summary": "List users"
      }
    }
  }
}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => setMode('url')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            mode === 'url'
              ? 'bg-brand-600 text-white'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          {t('fromUrl')}
        </button>
        <button
          onClick={() => setMode('paste')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            mode === 'paste'
              ? 'bg-brand-600 text-white'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          {t('pasteJson')}
        </button>
      </div>

      {/* Input */}
      <div className="glass-card p-6">
        {mode === 'url' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('specUrl')}</label>
            <div className="flex gap-3">
              <input
                type="url"
                value={specUrl}
                onChange={(e) => setSpecUrl(e.target.value)}
                placeholder="https://api.example.com/openapi.json"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
              <button
                onClick={fetchSpec}
                disabled={!specUrl}
                className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
              >
                {t('fetch')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('pasteLabel')}</label>
            <textarea
              value={specContent}
              onChange={(e) => setSpecContent(e.target.value)}
              placeholder={sampleSpec}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
            <button
              onClick={parseContent}
              disabled={!specContent}
              className="mt-3 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
            >
              {t('parse')}
            </button>
          </div>
        )}
      </div>

      {/* Parsed Results */}
      {parsed && (
        <>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{parsed.title} v{parsed.version}</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">{t('endpointsFound', { count: parsed.endpoints.length })}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={toggleAll}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  {parsed.endpoints.every((e) => e.selected) ? t('deselectAll') : t('selectAll')}
                </button>
                <button
                  onClick={importEndpoints}
                  disabled={importing || parsed.endpoints.filter((e) => e.selected).length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  {importing ? t('importing', { count: imported }) : t('importEndpoints', { count: parsed.endpoints.filter((e) => e.selected).length })}
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {parsed.endpoints.map((ep, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                    ep.selected
                      ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20'
                      : 'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-750'
                  }`}
                >
                  <input
                    role="switch"

                    aria-checked={                    }

                    type="checkbox"

                    checked={                    }
                    onChange={() => toggleEndpoint(i)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                    ep.method === 'GET' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                    ep.method === 'POST' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                    ep.method === 'PUT' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                    ep.method === 'DELETE' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                    'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">{ep.path}</span>
                  <span className="text-sm text-gray-500 dark:text-slate-400 truncate">{ep.description}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Usage tip */}
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {t('tip')}
            </p>
          </div>
        </>
      )}

      {/* Supported Formats */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('supportedFormats')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: t('openapi30'), ext: '.json / .yaml', icon: '📄' },
            { name: t('swagger20'), ext: '.json', icon: '📄' },
            { name: 'URL', ext: 'https://...', icon: '🔗' },
          ].map((fmt) => (
            <div key={fmt.name} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <span className="text-xl">{fmt.icon}</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">{fmt.name}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">{fmt.ext}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
