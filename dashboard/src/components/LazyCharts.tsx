"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Lazy-loaded Recharts — loads the entire library as ONE chunk (1.4MB)
 * only when the first chart component renders.
 *
 * The sub-components (Line, Bar, XAxis, etc.) are also lazy — they're
 * resolved from the same recharts module load.
 */

function ChartSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64 w-full" />
  );
}

// Single lazy loader that caches the recharts module
const rechartsLoader = () => import("recharts");

// ── Chart containers (lazy) ──

export const LazyLineChart = dynamic(
  () => rechartsLoader().then((m) => m.LineChart as ComponentType<any>),
  { ssr: false, loading: () => <ChartSkeleton /> }
) as ComponentType<any>;

export const LazyBarChart = dynamic(
  () => rechartsLoader().then((m) => m.BarChart as ComponentType<any>),
  { ssr: false, loading: () => <ChartSkeleton /> }
) as ComponentType<any>;

export const LazyPieChart = dynamic(
  () => rechartsLoader().then((m) => m.PieChart as ComponentType<any>),
  { ssr: false, loading: () => <ChartSkeleton /> }
) as ComponentType<any>;

export const LazyAreaChart = dynamic(
  () => rechartsLoader().then((m) => m.AreaChart as ComponentType<any>),
  { ssr: false, loading: () => <ChartSkeleton /> }
) as ComponentType<any>;

// ── Sub-components — also lazy, same chunk ──
// These resolve from the same dynamic import as the chart containers above,
// so they don't trigger a separate load. But they ARE dynamic imports,
// meaning they DON'T load recharts at import-time (only at render-time).

export const Line: ComponentType<any> = dynamic(
  () => rechartsLoader().then((m) => m.Line as ComponentType<any>),
  { ssr: false }
) as ComponentType<any>;

export const Bar: ComponentType<any> = dynamic(
  () => rechartsLoader().then((m) => m.Bar as ComponentType<any>),
  { ssr: false }
) as ComponentType<any>;

export const Area: ComponentType<any> = dynamic(
  () => rechartsLoader().then((m) => m.Area as ComponentType<any>),
  { ssr: false }
) as ComponentType<any>;

export const Pie: ComponentType<any> = dynamic(
  () => rechartsLoader().then((m) => m.Pie as ComponentType<any>),
  { ssr: false }
) as ComponentType<any>;

export const Cell: ComponentType<any> = dynamic(
  () => rechartsLoader().then((m) => m.Cell as ComponentType<any>),
  { ssr: false }
) as ComponentType<any>;

export const XAxis: ComponentType<any> = dynamic(
  () => rechartsLoader().then((m) => m.XAxis as ComponentType<any>),
  { ssr: false }
) as ComponentType<any>;

export const YAxis: ComponentType<any> = dynamic(
  () => rechartsLoader().then((m) => m.YAxis as ComponentType<any>),
  { ssr: false }
) as ComponentType<any>;

export const CartesianGrid: ComponentType<any> = dynamic(
  () => rechartsLoader().then((m) => m.CartesianGrid as ComponentType<any>),
  { ssr: false }
) as ComponentType<any>;

export const Tooltip: ComponentType<any> = dynamic(
  () => rechartsLoader().then((m) => m.Tooltip as ComponentType<any>),
  { ssr: false }
) as ComponentType<any>;

export const Legend: ComponentType<any> = dynamic(
  () => rechartsLoader().then((m) => m.Legend as ComponentType<any>),
  { ssr: false }
) as ComponentType<any>;

export const ResponsiveContainer: ComponentType<any> = dynamic(
  () => rechartsLoader().then((m) => m.ResponsiveContainer as ComponentType<any>),
  { ssr: false }
) as ComponentType<any>;
