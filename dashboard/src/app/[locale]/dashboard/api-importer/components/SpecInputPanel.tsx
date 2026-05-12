'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { parseOpenApiSpec, type ParsedSpec } from '../parser';

export function SpecInputPanel({
  onParsed,
}: {
  onParsed: (spec: ParsedSpec) => void;
}) {
  const t = useTranslations('apiImporter');
  const { toast } = useToast();
  const [mode, setMode] = useState<'url' | 'paste'>('url');
  const [specUrl, setSpecUrl] = useState('');
  const [specContent, setSpecContent] = useState('');

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

  const fetchSpec = async () => {
    if (!specUrl) return;
    try {
      const res = await fetch(specUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setSpecContent(text);
      const result = parseOpenApiSpec(text);
      if (result) {
        onParsed(result);
        toast(t('parsedOk', { count: result.endpoints.length }), 'success');
      } else {
        toast(t('failedToParse'), 'error');
      }
    } catch (err) {
      toast(t('failedToFetchError', { error: err instanceof Error ? err.message : 'Unknown error' }), 'error');
    }
  };

  const parseContent = () => {
    if (!specContent) return;
    const result = parseOpenApiSpec(specContent);
    if (result) {
      onParsed(result);
      toast(t('parsedOk', { count: result.endpoints.length }), 'success');
    } else {
      toast(t('failedToParseJson'), 'error');
    }
  };

  return (
    <>
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
            <label htmlFor="api-importer-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('specUrl')}</label>
            <div className="flex gap-3">
              <input
                id="api-importer-url"
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
            <label htmlFor="api-importer-paste" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('pasteLabel')}</label>
            <textarea
              id="api-importer-paste"
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
    </>
  );
}
