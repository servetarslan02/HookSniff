'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';

/* ─── Types ─── */
interface PortalConfig {
  primary_color: string;
  logo_url: string;
  company_name: string;
  font_family: string;
  dark_mode: boolean;
  show_events: boolean;
  show_deliveries: boolean;
  allowed_events: string[];
}

const DEFAULT_CONFIG: PortalConfig = {
  primary_color: '#6366f1',
  logo_url: '',
  company_name: '',
  font_family: 'Inter',
  dark_mode: false,
  show_events: true,
  show_deliveries: true,
  allowed_events: [],
};

const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins',
  'Source Code Pro', 'JetBrains Mono', 'system-ui',
];

/* ─── Main Page ─── */
export default function PortalCustomizationPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<PortalConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState('');

  const fetchConfig = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<{ id?: string; company_name?: string; logo_url?: string; primary_color?: string; font_family?: string; dark_mode?: boolean; show_events?: boolean; show_deliveries?: boolean; allowed_events?: string[]; custom_css?: string }>('/portal/config', { token });
      setConfig({
        primary_color: data.primary_color || '#6366f1',
        logo_url: data.logo_url || '',
        company_name: data.company_name || '',
        font_family: data.font_family || 'Inter',
        dark_mode: data.dark_mode ?? false,
        show_events: data.show_events ?? true,
        show_deliveries: data.show_deliveries ?? true,
        allowed_events: data.allowed_events || [],
      });
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiFetch('/portal/config', { method: 'POST', body: config, token });
      toast('Portal configuration saved!', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save portal config', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addEvent = () => {
    if (!newEvent.trim()) return;
    if (config.allowed_events.includes(newEvent.trim())) {
      toast('Event already added', 'error');
      return;
    }
    setConfig({ ...config, allowed_events: [...config.allowed_events, newEvent.trim()] });
    setNewEvent('');
  };

  const removeEvent = (event: string) => {
    setConfig({ ...config, allowed_events: config.allowed_events.filter((e) => e !== event) });
  };

  const embedCode = `<iframe
  src="https://portal.hooksniff.dev/embed?token=YOUR_PORTAL_TOKEN"
  style="width: 100%; height: 600px; border: none; border-radius: 12px;"
  allow="clipboard-write"
/>`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🖼️ Portal Customization</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Customize the look and feel of your embedded webhook portal.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Config Panel */}
        <div className="space-y-6">
          {/* Branding */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎨 Branding</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  value={config.company_name}
                  onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                  placeholder="My Company"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={config.logo_url}
                  onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
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
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Font Family</label>
                <select
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚙️ Features</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Dark Mode</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">Enable dark mode by default</div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors ${config.dark_mode ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-600'} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${config.dark_mode ? 'translate-x-5' : 'translate-x-0.5'} absolute top-0.5`} />
                  <input
                    type="checkbox"
                    checked={config.dark_mode}
                    onChange={(e) => setConfig({ ...config, dark_mode: e.target.checked })}
                    className="sr-only"
                  />
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Show Events</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">Allow users to view event types</div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors ${config.show_events ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-600'} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${config.show_events ? 'translate-x-5' : 'translate-x-0.5'} absolute top-0.5`} />
                  <input
                    type="checkbox"
                    checked={config.show_events}
                    onChange={(e) => setConfig({ ...config, show_events: e.target.checked })}
                    className="sr-only"
                  />
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Show Deliveries</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">Allow users to view delivery history</div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors ${config.show_deliveries ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-600'} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${config.show_deliveries ? 'translate-x-5' : 'translate-x-0.5'} absolute top-0.5`} />
                  <input
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Allowed Events</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Leave empty to show all events. Add specific event types to filter what users can subscribe to.
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
              <button
                onClick={addEvent}
                className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.allowed_events.map((event) => (
                <span
                  key={event}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-full text-sm font-mono"
                >
                  {event}
                  <button
                    onClick={() => removeEvent(event)}
                    className="text-gray-400 hover:text-red-500 transition ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {config.allowed_events.length === 0 && (
                <span className="text-sm text-gray-400 dark:text-slate-500">All events allowed</span>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">👁️ Preview</h2>
            <div
              className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700"
              style={{ fontFamily: config.font_family }}
            >
              {/* Preview Header */}
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ backgroundColor: config.primary_color }}
              >
                <div className="flex items-center gap-3">
                  {config.logo_url ? (
                    <Image src={config.logo_url} alt="Logo" width={32} height={32} className="w-8 h-8 rounded" />
                  ) : (
                    <span className="text-2xl">🪝</span>
                  )}
                  <span className="text-white font-semibold">
                    {config.company_name || 'HookSniff'} Portal
                  </span>
                </div>
              </div>
              {/* Preview Content */}
              <div className={`p-6 ${config.dark_mode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${config.dark_mode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                    <div className="text-sm font-medium mb-2">Webhook Endpoints</div>
                    <div className={`text-xs ${config.dark_mode ? 'text-slate-400' : 'text-gray-500'}`}>
                      2 endpoints configured
                    </div>
                  </div>
                  {config.show_events && (
                    <div className={`p-4 rounded-xl ${config.dark_mode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                      <div className="text-sm font-medium mb-2">Event Subscriptions</div>
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: config.primary_color + '20', color: config.primary_color }}>
                          order.created
                        </span>
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: config.primary_color + '20', color: config.primary_color }}>
                          payment.completed
                        </span>
                      </div>
                    </div>
                  )}
                  {config.show_deliveries && (
                    <div className={`p-4 rounded-xl ${config.dark_mode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                      <div className="text-sm font-medium mb-2">Recent Deliveries</div>
                      <div className={`text-xs ${config.dark_mode ? 'text-slate-400' : 'text-gray-500'}`}>
                        ✅ 47 delivered · ❌ 3 failed
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Embed Code */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Embed Code</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Copy this code into your dashboard to embed the portal.
            </p>
            <div className="relative">
              <button
                onClick={() => { navigator.clipboard.writeText(embedCode); toast('Copied!', 'success'); }}
                className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
              >
                Copy
              </button>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
                <code>{embedCode}</code>
              </pre>
            </div>
          </div>

          {/* React Integration */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚛️ React Integration</h2>
            <div className="relative">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`import { HookSniffPortal } from 'hooksniff-sdk/react';

<HookSniffPortal
  apiKey="YOUR_PORTAL_TOKEN"
  primaryColor="${config.primary_color}"
  darkMode={${config.dark_mode}}
  companyName="${config.company_name || 'My App'}"
/>`);
                  toast('Copied!', 'success');
                }}
                className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
              >
                Copy
              </button>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
                <code>{`import { HookSniffPortal } from 'hooksniff-sdk/react';

<HookSniffPortal
  apiKey="YOUR_PORTAL_TOKEN"
  primaryColor="${config.primary_color}"
  darkMode={${config.dark_mode}}
  companyName="${config.company_name || 'My App'}"
/>`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
