'use client';

import { useAuth } from '@/lib/store';
import { useState } from 'react';

export default function SettingsPage() {
  const { user, apiKey, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your account and API configuration</p>
      </div>

      {/* Account Info */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-slate-400">Email</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.email || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-slate-400">Plan</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-1 ring-inset ring-brand-600/20">
              {user?.plan || 'free'}
            </span>
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Key</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your API Key</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={apiKey || 'No API key — register to get one'}
                readOnly
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 font-mono text-sm"
              />
              <button
                onClick={copyApiKey}
                disabled={!apiKey}
                className="bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Keep this secret. Do not share it in client-side code.</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-red-200">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Sign Out</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Sign out of your account</div>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
