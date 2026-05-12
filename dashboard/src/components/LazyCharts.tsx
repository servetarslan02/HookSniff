"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Lazy-loaded Recharts components.
 *
 * Recharts is ~400KB and eagerly loaded on every page that imports it.
 * This module uses Next.js dynamic imports to code-split Recharts
 * and only load it when the chart component is actually rendered.
 *
 * Usage:
 *   import { LazyLineChart, LazyBarChart, LazyPieChart } from "@/components/LazyCharts";
 *
 *   <LazyLineChart data={data}>
 *     <Line dataKey="value" />
 *   </LazyLineChart>
 */

// Loading placeholder
function ChartSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64 w-full" />
  );
}

// Item 292: Recharts doesn't export clean prop types for dynamic imports.
// TODO: Replace `any` with proper recharts prop types once available.
// For now, `any` is intentional to avoid type errors with dynamic().

// Lazy-loaded chart components
export const LazyLineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart as ComponentType<any>),
  { ssr: false, loading: () => <ChartSkeleton /> }
) as ComponentType<any>;

export const LazyBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart as ComponentType<any>),
  { ssr: false, loading: () => <ChartSkeleton /> }
) as ComponentType<any>;

export const LazyPieChart = dynamic(
  () => import("recharts").then((mod) => mod.PieChart as ComponentType<any>),
  { ssr: false, loading: () => <ChartSkeleton /> }
) as ComponentType<any>;

export const LazyAreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart as ComponentType<any>),
  { ssr: false, loading: () => <ChartSkeleton /> }
) as ComponentType<any>;

// Re-export commonly used sub-components (these are small, no need to lazy-load)
export {
  Line,
  Bar,
  Area,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
