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

  useEffect(() => {
    if (!token) return;
    apiFetch<{ templates: Template[] }>('/templates', { token })
      .then((res) => setTemplates(res.templates || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-8 text-gray-500">{tCommon('loading')}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <p className="text-gray-500 mb-6">
        {t('subtitle')}
      </p>
      {templates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <p className="text-gray-500 text-lg mb-2">{t('noTemplates')}</p>
          <p className="text-gray-400 text-sm">{t('noTemplatesDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:border-purple-500 transition cursor-pointer">
              <h3 className="font-semibold mb-1">{tpl.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{tpl.description}</p>
              <div className="flex gap-2">
                {(tpl.tags || []).map((tag: string) => (
                  <span key={tag} className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
