'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { useTemplates } from '@/hooks/useDashboardData';
import { BarChart3, Bot, ClipboardList, Radio, X } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  industry?: string;
  event_types: string[];
  endpoint_count?: number;
  agents?: Array<{ agent_name: string; description: string; enabled_by_default: boolean }>;
  estimated_daily_volume?: number;
  tags?: string[];
}

export default function TemplatesPage() {
  const t = useTranslations('templatesPage');
  const tc = useTranslations('common');
  const { token } = useAuth();
  const { toast } = useToast();
  const { data, isLoading, error, refetch } = useTemplates();
  const templates: Template[] = (data?.templates ?? []) as Template[];

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showApply, setShowApply] = useState<Template | null>(null);
  const [endpointUrl, setEndpointUrl] = useState('');
  const [applying, setApplying] = useState(false);
  const [enabledAgents, setEnabledAgents] = useState<string[]>([]);

  const handleApply = async () => {
    if (!token || !showApply || !endpointUrl.trim()) return;
    setApplying(true);
    try {
      const result = await api.applyTemplate(token, showApply.id, {
        endpoint_url: endpointUrl.trim(),
        enabled_agents: enabledAgents.length > 0 ? enabledAgents : undefined,
      });
      toast(result.message || tc('success'), 'success');
      setShowApply(null);
      setEndpointUrl('');
      setEnabledAgents([]);
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('error'), 'error');
    } finally {
      setApplying(false);
    }
  };

  const openApply = (tpl: Template) => {
    setShowApply(tpl);
    setEndpointUrl('');
    setEnabledAgents(tpl.agents?.filter(a => a.enabled_by_default).map(a => a.agent_name) ?? []);
  };

  const toggleAgent = (name: string) => {
    setEnabledAgents(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const getTemplateName = (id: string) => t(`${id}_name`, { defaultMessage: id });
  const getTemplateDesc = (id: string) => t(`${id}_desc`, { defaultMessage: '' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <span className="text-red-700 dark:text-red-400 text-sm">{error instanceof Error ? error.message : tc('unknownError')}</span>
          <button onClick={() => refetch()} className="text-sm text-red-600 dark:text-red-400 underline">{tc('retry')}</button>
        </div>
      )}

      {isLoading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">{tc('loading')}</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4"><ClipboardList size={18} strokeWidth={1.75} /></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('noTemplates')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">{t('noTemplatesDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="glass-card p-6 hover:shadow-lg transition flex flex-col">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getTemplateName(tpl.id) || tpl.name}</h3>
                  {tpl.industry && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-md">{tpl.industry}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{getTemplateDesc(tpl.id) || tpl.description}</p>

                {/* Tags */}
                {tpl.tags && tpl.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tpl.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded-md">
                        {t(`tag_${tag}`, { defaultMessage: tag })}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 mb-4">
                  <span><Radio size={16} strokeWidth={1.75} className="inline mr-1" /> {tpl.event_types.length} events</span>
                  {tpl.estimated_daily_volume && <span className="inline-flex items-center gap-1"><BarChart3 size={14} strokeWidth={1.75} /> ~{tpl.estimated_daily_volume.toLocaleString()}/day</span>}
                  {tpl.agents && tpl.agents.length > 0 && <span><Bot size={16} strokeWidth={1.75} className="inline mr-1" /> {tpl.agents.length} agents</span>}
                </div>

                {/* Event Types Preview */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {tpl.event_types.slice(0, 6).map((ev) => (
                    <span key={ev} className="px-1.5 py-0.5 text-xs font-mono bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded border border-gray-200 dark:border-slate-700">{ev}</span>
                  ))}
                  {tpl.event_types.length > 6 && (
                    <span className="px-1.5 py-0.5 text-xs text-gray-400 dark:text-slate-500">+{tpl.event_types.length - 6} more</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={() => setSelectedTemplate(tpl)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition"
                >
                  {t('viewDetails') || 'View Details'}
                </button>
                <button
                  onClick={() => openApply(tpl)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition"
                >
                  {t('apply') || 'Apply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedTemplate(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getTemplateName(selectedTemplate.id) || selectedTemplate.name}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{selectedTemplate.industry}</p>
              </div>
              <button onClick={() => setSelectedTemplate(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-slate-300"><X size={18} strokeWidth={1.75} /></button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-600 dark:text-slate-400">{getTemplateDesc(selectedTemplate.id) || selectedTemplate.description}</p>

              {/* Event Types */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Event Types ({selectedTemplate.event_types.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.event_types.map((ev) => (
                    <span key={ev} className="px-2 py-1 text-xs font-mono bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 rounded border border-gray-200 dark:border-slate-700">{ev}</span>
                  ))}
                </div>
              </div>

              {/* Agents */}
              {selectedTemplate.agents && selectedTemplate.agents.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Agents</h4>
                  <div className="space-y-2">
                    {selectedTemplate.agents.map((agent) => (
                      <div key={agent.agent_name} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <span className="text-lg"><Bot size={18} strokeWidth={1.75} /></span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.agent_name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{agent.description}</p>
                          <span className={`text-xs mt-1 inline-block px-1.5 py-0.5 rounded ${agent.enabled_by_default ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                            {agent.enabled_by_default ? 'Default ON' : 'Default OFF'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded-md">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setSelectedTemplate(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {tc('close')}
              </button>
              <button onClick={() => { setSelectedTemplate(null); openApply(selectedTemplate); }} className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition">
                {t('apply') || 'Apply Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowApply(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('applyTitle') || 'Apply Template'}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{getTemplateName(showApply.id) || showApply.name}</p>
              </div>
              <button onClick={() => setShowApply(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-slate-300"><X size={18} strokeWidth={1.75} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('endpointUrl') || 'Endpoint URL'}</label>
                <input
                  type="url"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  placeholder="https://your-server.com/webhooks"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              {/* Agent Selection */}
              {showApply.agents && showApply.agents.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wider">{t('enableAgents') || 'Enable Agents'}</label>
                  <div className="space-y-2">
                    {showApply.agents.map((agent) => (
                      <label key={agent.agent_name} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                        <input
                          type="checkbox"
                          checked={enabledAgents.includes(agent.agent_name)}
                          onChange={() => toggleAgent(agent.agent_name)}
                          className="mt-1 w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.agent_name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{agent.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowApply(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                  {tc('cancel')}
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying || !endpointUrl.trim()}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60"
                >
                  {applying ? tc('creating') : (t('applyBtn') || 'Apply Template')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
