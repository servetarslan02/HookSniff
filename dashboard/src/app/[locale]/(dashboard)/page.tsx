import { redirect } from 'next/navigation';

// Dashboard root redirects to /core
// This page must NOT be a client component — it causes ENOENT on Vercel
// because Next.js 15 doesn't generate page_client-reference-manifest.js
// for route group root pages.
export default function DashboardPage() {
  redirect('/core');
}
