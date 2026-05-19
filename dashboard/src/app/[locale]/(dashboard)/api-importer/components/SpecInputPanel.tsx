'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { parseOpenApiSpec, type ParsedSpec } from '../parser';

export function SpecInputPanel({
  onParsed,
}: {
  onParsed: (spec: ParsedSpec | null) => void;
}) {
  const t = useTranslations('apiImporter');
  const { toast } = useToast();
  const [mode, setMode] = useState<'url' | 'paste'>('url');
  const [specUrl, setSpecUrl] = useState('');
  const [specContent, setSpecContent] = useState('');
  const [fetching, setFetching] = useState(false);
  const [parsing, setParsing] = useState(false);

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

  const sampleYaml = `openapi: "3.0.0"
info:
  title: My API
  version: "1.0.0"
servers:
  - url: https://api.example.com
paths:
  /orders:
    post:
      summary: Create order
  /users:
    get:
      summary: List users`;

  const fetchSpec = async () => {
    if (!specUrl) return;
    setFetching(true);
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
    } finally {
      setFetching(false);
    }
  };

  const parseContent = useCallback(() => {
    if (!specContent) return;
    setParsing(true);
    try {
      const result = parseOpenApiSpec(specContent);
      if (result) {
        onParsed(result);
        toast(t('parsedOk', { count: result.endpoints.length }), 'success');
      } else {
        toast(t('failedToParseJson'), 'error');
      }
    } finally {
      setParsing(false);
    }
  }, [specContent, onParsed, toast, t]);

  const clearAll = useCallback(() => {
    setSpecUrl('');
    setSpecContent('');
    onParsed(null);
  }, [onParsed]);

  /** Keyboard shortcut: Ctrl/Cmd + Enter to fetch/parse */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (mode === 'url' && specUrl && !fetching) fetchSpec();
      else if (mode === 'paste' && specContent && !parsing) parseContent();
    }
  }, [mode, specUrl, specContent, fetching, parsing]);

  return (
    <div onKeyDown={handleKeyDown}>
      {/* Mode Toggle + Clear + Shortcut */}
      <div className="flex items-center justify-between gap-3 mb-4">
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
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 font-mono text-gray-500 dark:text-slate-400">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 font-mono text-gray-500 dark:text-slate-400">Enter</kbd>
            <span>{mode === 'url' ? t('toFetch') : t('toParse')}</span>
          </div>
          <button
            type="button"
            onClick={clearAll}
            disabled={!specUrl && !specContent}
            className="px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🗑️ {t('clearAll')}
          </button>
        </div>
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
                disabled={!specUrl || fetching}
                className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fetching ? t('fetching') : t('fetch')}
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
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={parseContent}
                disabled={!specContent || parsing}
                className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {parsing ? t('parsing') : t('parse')}
              </button>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {t('yamlSupported')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
