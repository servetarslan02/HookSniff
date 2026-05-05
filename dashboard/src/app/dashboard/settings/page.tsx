"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("hr_live_••••••••••••••••");
  const [copied, setCopied] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* API Key */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Key</h2>
        <p className="text-sm text-gray-600 mb-4">
          Use this key to authenticate API requests. Pass it as a Bearer token in the Authorization header.
        </p>
        <div className="flex gap-2">
          <code className="flex-1 bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono">
            {apiKey}
          </code>
          <button
            onClick={copyKey}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Rotate your key if compromised. Old key will stop working immediately.
        </p>
      </div>

      {/* Plan */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
              Free
            </span>
            <p className="text-sm text-gray-500 mt-1">
              1,000 webhooks/month · 1 endpoint · 3 retries
            </p>
          </div>
          <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition">
            Upgrade to Pro →
          </button>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Webhooks this month</span>
              <span className="font-medium">0 / 1,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-brand-500 h-2 rounded-full" style={{ width: "0%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
