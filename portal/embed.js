/**
 * HookRelay Embeddable Portal Widget
 *
 * Müşteriler kendi dashboard'larına bu script'i ekleyerek
 * webhook yönetim paneli gösterebilir.
 *
 * Kullanım:
 * <div id="hookrelay-portal"></div>
 * <script src="https://cdn.hookrelay.dev/portal/embed.js"
 *   data-api-key="hr_live_..."
 *   data-theme="light"
 *   data-target="#hookrelay-portal">
 * </script>
 */

(function() {
  'use strict';

  const SCRIPT = document.currentScript;
  const API_KEY = SCRIPT?.getAttribute('data-api-key');
  const THEME = SCRIPT?.getAttribute('data-theme') || 'light';
  const TARGET = SCRIPT?.getAttribute('data-target') || '#hookrelay-portal';
  const API_BASE = SCRIPT?.getAttribute('data-api-url') || 'https://api.hookrelay.dev/v1';
  const VERSION = '1.0.0';

  if (!API_KEY) {
    console.error('[HookRelay] data-api-key attribute is required');
    return;
  }

  const container = document.querySelector(TARGET);
  if (!container) {
    console.error(`[HookRelay] Target element "${TARGET}" not found`);
    return;
  }

  // ── Styles ──
  const styles = `
    <style>
      .hr-portal {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: ${THEME === 'dark' ? '#e2e8f0' : '#1a202c'};
        background: ${THEME === 'dark' ? '#0f172a' : '#ffffff'};
        border-radius: 12px;
        border: 1px solid ${THEME === 'dark' ? '#334155' : '#e2e8f0'};
        overflow: hidden;
      }
      .hr-header {
        padding: 16px 20px;
        border-bottom: 1px solid ${THEME === 'dark' ? '#334155' : '#e2e8f0'};
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .hr-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
      .hr-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }
      .hr-badge-delivered { background: #dcfce7; color: #166534; }
      .hr-badge-pending { background: #fef9c3; color: #854d0e; }
      .hr-badge-failed { background: #fee2e2; color: #991b1b; }
      .hr-tabs {
        display: flex;
        border-bottom: 1px solid ${THEME === 'dark' ? '#334155' : '#e2e8f0'};
        padding: 0 12px;
      }
      .hr-tab {
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        color: ${THEME === 'dark' ? '#94a3b8' : '#6b7280'};
        transition: all 0.2s;
      }
      .hr-tab:hover { color: ${THEME === 'dark' ? '#e2e8f0' : '#1a202c'}; }
      .hr-tab.active {
        color: #6366f1;
        border-bottom-color: #6366f1;
      }
      .hr-content { padding: 16px 20px; min-height: 200px; }
      .hr-list { list-style: none; padding: 0; margin: 0; }
      .hr-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid ${THEME === 'dark' ? '#1e293b' : '#f1f5f9'};
      }
      .hr-item:last-child { border-bottom: none; }
      .hr-item-left { display: flex; align-items: center; gap: 12px; }
      .hr-item-url {
        font-family: 'SF Mono', Monaco, monospace;
        font-size: 12px;
        color: ${THEME === 'dark' ? '#94a3b8' : '#6b7280'};
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .hr-item-meta { font-size: 12px; color: ${THEME === 'dark' ? '#64748b' : '#9ca3af'}; }
      .hr-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .hr-dot-green { background: #22c55e; }
      .hr-dot-yellow { background: #eab308; }
      .hr-dot-red { background: #ef4444; }
      .hr-empty {
        text-align: center;
        padding: 40px 20px;
        color: ${THEME === 'dark' ? '#64748b' : '#9ca3af'};
      }
      .hr-btn {
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid ${THEME === 'dark' ? '#334155' : '#d1d5db'};
        background: ${THEME === 'dark' ? '#1e293b' : '#ffffff'};
        color: ${THEME === 'dark' ? '#e2e8f0' : '#374151'};
        transition: all 0.15s;
      }
      .hr-btn:hover { background: ${THEME === 'dark' ? '#334155' : '#f3f4f6'}; }
      .hr-btn-primary {
        background: #6366f1;
        color: white;
        border-color: #6366f1;
      }
      .hr-btn-primary:hover { background: #4f46e5; }
      .hr-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: ${THEME === 'dark' ? '#64748b' : '#9ca3af'};
      }
      .hr-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid ${THEME === 'dark' ? '#334155' : '#e5e7eb'};
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: hr-spin 0.6s linear infinite;
        margin-right: 8px;
      }
      @keyframes hr-spin { to { transform: rotate(360deg); } }
      .hr-footer {
        padding: 12px 20px;
        border-top: 1px solid ${THEME === 'dark' ? '#334155' : '#e2e8f0'};
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
        color: ${THEME === 'dark' ? '#64748b' : '#9ca3af'};
      }
      .hr-footer a { color: #6366f1; text-decoration: none; }
    </style>
  `;

  // ── State ──
  let state = {
    tab: 'deliveries',
    endpoints: [],
    deliveries: [],
    loading: true,
    error: null,
  };

  // ── API ──
  async function api(path, opts = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...opts.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // ── Render ──
  function render() {
    const { tab, endpoints, deliveries, loading, error } = state;

    if (loading) {
      container.innerHTML = styles + `
        <div class="hr-portal">
          <div class="hr-loading"><div class="hr-spinner"></div> Loading...</div>
        </div>
      `;
      return;
    }

    if (error) {
      container.innerHTML = styles + `
        <div class="hr-portal">
          <div class="hr-empty">❌ ${error}</div>
        </div>
      `;
      return;
    }

    const statusBadge = (s) => {
      const cls = s === 'delivered' ? 'delivered' : s === 'failed' ? 'failed' : 'pending';
      return `<span class="hr-badge hr-badge-${cls}">${s}</span>`;
    };

    const tabContent = tab === 'deliveries'
      ? renderDeliveries(deliveries)
      : renderEndpoints(endpoints);

    container.innerHTML = styles + `
      <div class="hr-portal">
        <div class="hr-header">
          <h3>🪝 Webhook Activity</h3>
          <button class="hr-btn hr-btn-primary" onclick="window._hrRefresh()">↻ Refresh</button>
        </div>
        <div class="hr-tabs">
          <div class="hr-tab ${tab === 'deliveries' ? 'active' : ''}"
               onclick="window._hrTab('deliveries')">Deliveries</div>
          <div class="hr-tab ${tab === 'endpoints' ? 'active' : ''}"
               onclick="window._hrTab('endpoints')">Endpoints</div>
        </div>
        <div class="hr-content">${tabContent}</div>
        <div class="hr-footer">
          <span>HookRelay Portal v${VERSION}</span>
          <a href="https://hookrelay.dev" target="_blank">hookrelay.dev</a>
        </div>
      </div>
    `;
  }

  function renderDeliveries(deliveries) {
    if (deliveries.length === 0) {
      return '<div class="hr-empty">No deliveries yet</div>';
    }
    return `<ul class="hr-list">${deliveries.slice(0, 20).map(d => `
      <li class="hr-item">
        <div class="hr-item-left">
          <span class="hr-dot hr-dot-${d.status === 'delivered' ? 'green' : d.status === 'failed' ? 'red' : 'yellow'}"></span>
          <div>
            <div style="font-size:13px;font-weight:500">${d.event || 'webhook'}</div>
            <div class="hr-item-url">${d.endpoint_url || d.endpoint_id}</div>
          </div>
        </div>
        <div style="text-align:right">
          ${statusBadge(d.status)}
          <div class="hr-item-meta">${new Date(d.created_at).toLocaleString()}</div>
        </div>
      </li>
    `).join('')}</ul>`;
  }

  function renderEndpoints(endpoints) {
    if (endpoints.length === 0) {
      return '<div class="hr-empty">No endpoints configured</div>';
    }
    return `<ul class="hr-list">${endpoints.map(ep => `
      <li class="hr-item">
        <div class="hr-item-left">
          <span class="hr-dot hr-dot-${ep.is_active ? 'green' : 'red'}"></span>
          <div>
            <div style="font-size:13px;font-weight:500">${ep.description || 'Endpoint'}</div>
            <div class="hr-item-url">${ep.url}</div>
          </div>
        </div>
        <div style="text-align:right">
          <span class="hr-badge hr-badge-${ep.is_active ? 'delivered' : 'failed'}">
            ${ep.is_active ? 'active' : 'inactive'}
          </span>
          <div class="hr-item-meta">${ep.routing_strategy || 'round-robin'}</div>
        </div>
      </li>
    `).join('')}</ul>`;
  }

  // ── Actions ──
  window._hrTab = (tab) => { state.tab = tab; render(); };
  window._hrRefresh = () => load();

  async function load() {
    state.loading = true;
    render();
    try {
      const [endpoints, deliveries] = await Promise.all([
        api('/endpoints'),
        api('/webhooks?page=1&per_page=20'),
      ]);
      state.endpoints = endpoints;
      state.deliveries = deliveries.deliveries || deliveries;
      state.error = null;
    } catch (e) {
      state.error = e.message;
    } finally {
      state.loading = false;
      render();
    }
  }

  // ── Init ──
  load();

  // Auto-refresh every 10 seconds
  setInterval(load, 10000);

})();
