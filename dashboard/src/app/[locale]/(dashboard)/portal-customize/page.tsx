'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { usePortalConfig, usePortalEmbedCode, useUpdatePortalConfig } from '@/hooks/useDashboardData';
import type { PortalConfigResponse } from '@/lib/api';
import type { PortalConfig } from './types';
import { DEFAULT_CONFIG, FONT_OPTIONS } from './types';
import { PortalPreview } from './components/PortalPreview';
import { EmbedCodePanel } from './components/EmbedCodePanel';
import { ClipboardList, Palette, X, Zap } from 'lucide-react';

export default function PortalCustomizationPage() {
  const t = useTranslations('portalCustomize');
  const { toast } = useToast();
  const { data: configData, isLoading, error: configError } = usePortalConfig();
  const { data: embedData } = usePortalEmbedCode();
  const updateConfig = useUpdatePortalConfig();

  const [config, setConfig] = useState<PortalConfig>(DEFAULT_CONFIG);
  const [newEvent, setNewEvent] = useState('');

  useEffect(() => {
    if (configData) {
      setConfig({
        primary_color: configData.primary_color || '#6366f1',
        logo_url: configData.logo_url || '',
        company_name: configData.company_name || '',
        font_family: configData.font_family || 'Inter',
        dark_mode: configData.dark_mode ?? false,
        show_events: configData.show_events ?? true,
        show_deliveries: configData.show_deliveries ?? true,
        allowed_events: configData.allowed_events || [],
      });
    }
  }, [configData]);

  const handleSave = () => {
    updateConfig.mutate(config as Partial<PortalConfigResponse>, {
      onSuccess: () => toast(t('portalSaved'), 'success'),
      onError: (err) => toast(err instanceof Error ? err.message : t('portalSaveFailed'), 'error'),
    });
  };

  const addEvent = () => {
    if (!newEvent.trim()) return;
    if (config.allowed_events.includes(newEvent.trim())) {
      toast(t('eventAlreadyAdded'), 'error');
      return;
    }
    setConfig({ ...config, allowed_events: [...config.allowed_events, newEvent.trim()] });
    setNewEvent('');
  };

  const removeEvent = (event: string) => {
    setConfig({ ...config, allowed_events: config.allowed_events.filter((e) => e !== event) });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
          <p className="mb-2">{t('portalSaveFailed')}</p>
          <button type="button" onClick={() => window.location.reload()}
            className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium">
            ↻ {t('retry') || 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={updateConfig.isPending}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50 shadow-sm"
        >
          {updateConfig.isPending ? t('saving') : t('saveChanges')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Config Panel */}
        <div className="space-y-5">
          {/* Branding */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center">
                <span className="text-base"><Palette size={18} strokeWidth={1.75} /></span>
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('branding')}</h2>
            </div>
            <div className="space-y-3.5">
              <div>
                <label htmlFor="portal-company-name" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  {t('companyName')}
                </label>
                <input
                  id="portal-company-name"
                  type="text"
                  value={config.company_name}
                  onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                  placeholder={t('companyNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="portal-logo-url" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  {t('logoUrl')}
                </label>
                <input
                  id="portal-logo-url"
                  type="url"
                  value={config.logo_url}
                  onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                  placeholder={t('logoUrlPlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="portal-primary-color" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  {t('primaryColor')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="portal-primary-color"
                    type="color"
                    value={config.primary_color}
                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-slate-600"
                  />
                  <input
                    type="text"
                    value={config.primary_color}
                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="portal-font-family" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  {t('fontFamily')}
                </label>
                <select
                  id="portal-font-family"
                  value={config.font_family}
                  onChange={(e) => setConfig({ ...config, font_family: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <span className="text-base"><Zap size={18} strokeWidth={1.75} /></span>
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('features')}</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
              <ToggleItem
                label={t('darkMode')}
                description={t('darkModeDesc')}
                checked={config.dark_mode}
                onChange={(v) => setConfig({ ...config, dark_mode: v })}
              />
              <ToggleItem
                label={t('showEvents')}
                description={t('showEventsDesc')}
                checked={config.show_events}
                onChange={(v) => setConfig({ ...config, show_events: v })}
              />
              <ToggleItem
                label={t('showDeliveries')}
                description={t('showDeliveriesDesc')}
                checked={config.show_deliveries}
                onChange={(v) => setConfig({ ...config, show_deliveries: v })}
              />
            </div>
          </div>

          {/* Allowed Events */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <span className="text-base"><ClipboardList size={18} strokeWidth={1.75} /></span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('allowedEvents')}</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('allowedEventsDesc')}</p>
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                placeholder="order.created"
                className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-mono placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={addEvent}
                className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition"
              >
                {t('add')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.allowed_events.map((event) => (
                <span
                  key={event}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-xs font-mono"
                >
                  {event}
                  <button
                    type="button"
                    onClick={() => removeEvent(event)}
                    aria-label={`Remove ${event} event`}
                    className="text-gray-400 hover:text-red-500 transition ml-1"
                  >
                    <X size={16} strokeWidth={1.75} className="inline mr-1" /> </button>
                </span>
              ))}
              {config.allowed_events.length === 0 && (
                <span className="text-xs text-gray-400 dark:text-slate-500">{t('allEventsAllowed')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-5">
          <PortalPreview config={config} />
          <EmbedCodePanel
            config={config}
            embedCode={embedData?.iframe || ''}
            portalUrl={embedData?.portal_url || ''}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-3.5">
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
        <div className="text-xs text-gray-500 dark:text-slate-400">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-600 dark:bg-brand-500' : 'bg-gray-300 dark:bg-slate-600'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}
