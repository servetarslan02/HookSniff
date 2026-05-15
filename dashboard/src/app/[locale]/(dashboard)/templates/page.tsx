'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';

interface Template {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
}

export default function TemplatesPage() {
  const t = useTranslations('templatesPage');
  const tCommon = useTranslations('common');
  const { token } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    apiFetch<{ templates: Template[] }>('/templates', { token })
      .then((res) => setTemplates(res.templates || []))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : tCommon('unknownError'));
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Translate template name, description, and tags using template ID
  const getTemplateName = (tpl: Template) => {
    try { return t(`${tpl.id}_name`); } catch { return tpl.name; }
  };
  const getTemplateDesc = (tpl: Template) => {
    try { return t(`${tpl.id}_desc`); } catch { return tpl.description || ''; }
  };
  const getTagLabel = (tag: string) => {
    try { return t(`tag_${tag}`); } catch { return tag; }
  };

  if (loading) return <div className="p-8 text-gray-500 dark:text-slate-400">{tCommon('loading')}</div>;

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{error}</p>
          <button type="button" onClick={() => { setError(''); setLoading(true); if (token) apiFetch<{ templates: Template[] }>('/templates', { token }).then((res) => setTemplates(res.templates || [])).catch((err: unknown) => setError(err instanceof Error ? err.message : tCommon('unknownError'))).finally(() => setLoading(false)); }} className="bg-brand-600 dark:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition">
            {tCommon('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <p className="text-gray-500 mb-6">
        {t('subtitle')}
      </p>
      {templates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <p className="text-gray-500 text-lg mb-2">{t('noTemplates')}</p>
          <p className="text-gray-500 text-sm">{t('noTemplatesDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:border-purple-500 transition cursor-pointer">
              <h3 className="font-semibold mb-1">{getTemplateName(tpl)}</h3>
              <p className="text-sm text-gray-500 mb-3">{getTemplateDesc(tpl)}</p>
              <div className="flex gap-2">
                {(tpl.tags || []).map((tag: string) => (
                  <span key={tag} className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">{getTagLabel(tag)}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
