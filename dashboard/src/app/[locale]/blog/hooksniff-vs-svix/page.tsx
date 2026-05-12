import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'HookSniff vs Svix',
  description: 'Detailed comparison of HookSniff and Svix webhook platforms',
};


export default function HookSniffVsSvixPage() {
  redirect('/blog/hooksniff-vs-svix-vs-hookdeck');
}
