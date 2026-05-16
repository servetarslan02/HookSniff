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

export default function PortalCustomizationPage() {
  const t = useTranslations('portalCustomize');
  const { toast } = useToast();
  const { data: configData, isLoading } = usePortalConfig();
  const { data: embedData } = usePortalEmbedCode();
  const updateConfig = useUpdatePortalConfig();

  const [config, setConfig] = useState<PortalConfig>(DEFAULT_CONFIG);
  const [newEvent, setNewEvent] = useState('');

  // Sync fetched data into local state
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
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <button type="button"
          onClick={handleSave}
          disabled={updateConfig.isPending}
          className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
        >
          {updateConfig.isPending ? t('saving') : t('saveChanges')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Config Panel */}
        <div className="space-y-6">
          {/* Branding */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('branding')}</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="portal-company-name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('companyName')}</label>
                <input
                  id="portal-company-name"
                  type="text"
                  value={config.company_name}
                  onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                  placeholder={t('companyNamePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="portal-logo-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('logoUrl')}</label>
                <input
                  id="portal-logo-url"
                  type="url"
                  value={config.logo_url}
                  onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                  placeholder={t('logoUrlPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="portal-primary-color" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('primaryColor')}</label>
                <div className="flex items-center gap-3">
                  <input
                    id="portal-primary-color"
                    type="color"
                    value={config.primary_color}
                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-gray-300 dark:border-slate-600"
                  />
                  <input
                    type="text"
                    value={config.primary_color}
                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="portal-font-family" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('fontFamily')}</label>
                <select
                  id="portal-font-family"
                  value={config.font_family}
                  onChange={(e) => setConfig({ ...config, font_family: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('features')}</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{t('darkMode')}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{t('darkModeDesc')}</div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors ${config.dark_mode ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-600'} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${config.dark_mode ? 'translate-x-5' : 'translate-x-0.5'} absolute top-0.5`} />
                  <input
                    role="switch"
                    aria-checked={config.dark_mode}
                    type="checkbox"
                    checked={config.dark_mode}
                    onChange={(e) => setConfig({ ...config, dark_mode: e.target.checked })}
                    className="sr-only"
                  />
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{t('showEvents')}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{t('showEventsDesc')}</div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors ${config.show_events ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-600'} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${config.show_events ? 'translate-x-5' : 'translate-x-0.5'} absolute top-0.5`} />
                  <input
                    role="switch"
                    aria-checked={config.show_events}
                    type="checkbox"
                    checked={config.show_events}
                    onChange={(e) => setConfig({ ...config, show_events: e.target.checked })}
                    className="sr-only"
                  />
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{t('showDeliveries')}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{t('showDeliveriesDesc')}</div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors ${config.show_deliveries ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-600'} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${config.show_deliveries ? 'translate-x-5' : 'translate-x-0.5'} absolute top-0.5`} />
                  <input
                    role="switch"
                    aria-checked={config.show_deliveries}
                    type="checkbox"
                    checked={config.show_deliveries}
                    onChange={(e) => setConfig({ ...config, show_deliveries: e.target.checked })}
                    className="sr-only"
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Allowed Events */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('allowedEvents')}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('allowedEventsDesc')}
            </p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                placeholder="order.created"
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
              <button type="button"
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
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-full text-sm font-mono"
                >
                  {event}
                  <button type="button"
                    onClick={() => removeEvent(event)}
                    aria-label={`Remove ${event} event`}
                    className="text-gray-500 hover:text-red-500 transition ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {config.allowed_events.length === 0 && (
                <span className="text-sm text-gray-500 dark:text-slate-500">{t('allEventsAllowed')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
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
