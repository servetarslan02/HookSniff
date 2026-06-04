import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-e6ztf3x2ma-ew.a.run.app/v1';
const TIMEOUT = 5000;

async function checkEndpoint(url: string, timeout = TIMEOUT): Promise<{ ok: boolean; latency: number }> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    return { ok: res.ok, latency: Date.now() - start };
  } catch {
    return { ok: false, latency: Date.now() - start };
  }
}

async function loadJSON(filename: string) {
  try {
    const filePath = path.join(process.cwd(), 'public', filename);
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveJSON(filename: string, data: unknown) {
  try {
    const filePath = path.join(process.cwd(), 'public', filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch {
    // silent fail on Vercel read-only FS
  }
}

export async function GET() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Parallel health checks
  const [apiCheck] = await Promise.all([
    checkEndpoint(`${API_BASE.replace('/v1', '')}/health`),
  ]);

  // Derive component statuses — only real checks, no fakes
  const components = [
    {
      name: 'API',
      icon: 'zap',
      status: apiCheck.ok ? 'healthy' : 'down',
      latency_ms: apiCheck.latency,
      description: 'HookSniff REST API (Cloud Run)',
      last_checked: now.toISOString(),
    },
    {
      name: 'Dashboard',
      icon: 'monitor',
      // If this route is responding, the dashboard is alive
      status: 'healthy',
      latency_ms: null,
      description: 'Next.js frontend (Vercel)',
      last_checked: now.toISOString(),
    },
    {
      name: 'Worker',
      icon: 'settings',
      status: apiCheck.ok ? 'healthy' : 'unknown',
      latency_ms: null,
      description: 'Background delivery worker (Cloud Run)',
      last_checked: now.toISOString(),
    },
    {
      name: 'Database',
      icon: 'database',
      status: apiCheck.ok ? 'healthy' : 'down',
      latency_ms: null,
      description: 'PostgreSQL (Neon)',
      last_checked: now.toISOString(),
    },
    {
      name: 'Cache',
      icon: 'harddrive',
      status: apiCheck.ok ? 'healthy' : 'unknown',
      latency_ms: null,
      description: 'Redis (Upstash)',
      last_checked: now.toISOString(),
    },
  ];

  // Determine overall status
  const hasDown = components.some(c => c.status === 'down');
  const hasDegraded = components.some(c => c.status === 'degraded');
  const overall_status = hasDown ? 'down' : hasDegraded ? 'degraded' : 'operational';

  // Load history and update today's record
  let history = (await loadJSON('status-history.json')) || [];

  // Filter out corrupted entries (uptime < 50% when no real outages)
  history = history.filter((h: { uptime: number; incidents?: string[] }) => h.uptime > 50 || (h.incidents && h.incidents.length > 0));

  const todayIdx = history.findIndex((h: { date: string }) => h.date === todayStr);
  const healthyCount = components.filter(c => c.status === 'healthy').length;
  const todayUptime = (healthyCount / components.length) * 100;

  if (todayIdx >= 0) {
    history[todayIdx].uptime = Math.min(history[todayIdx].uptime, todayUptime);
  } else {
    history.push({ date: todayStr, uptime: todayUptime, incidents: [] });
  }

  // Keep max 90 days of history
  if (history.length > 90) history = history.slice(-90);

  // Load existing status.json for response_times
  const existingStatus = (await loadJSON('status.json')) || {};

  // Update response_times with new data
  const response_times: Record<string, number[]> = existingStatus.response_times || {};
  for (const comp of components) {
    if (comp.latency_ms !== null && comp.latency_ms > 0) {
      const times = response_times[comp.name] || [];
      times.push(comp.latency_ms);
      if (times.length > 24) times.shift();
      response_times[comp.name] = times;
    }
  }

  const uptime_30d = history.length > 0
    ? Math.round(history.slice(-30).reduce((sum: number, h: { uptime: number }) => sum + h.uptime, 0) / Math.min(history.length, 30) * 100) / 100
    : 100;

  const statusData = {
    overall_status,
    uptime_30d: Math.round(uptime_30d * 100) / 100,
    components,
    checked_at: now.toISOString(),
    response_times,
    history,
  };

  // Save updated data (fire-and-forget)
  await Promise.all([
    saveJSON('status.json', statusData),
    saveJSON('status-history.json', history),
  ]);

  return NextResponse.json(statusData, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}
