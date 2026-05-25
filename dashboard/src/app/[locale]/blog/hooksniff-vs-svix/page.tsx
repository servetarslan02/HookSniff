import { redirect } from 'next/navigation';
import type { Metadata } from 'next';



export const metadata: Metadata = {
  title: 'HookSniff vs Svix',
  description: 'Detailed comparison of HookSniff and Svix webhook platforms',
};


export default function HookSniffVsSvixPage() {
  redirect('/blog/hooksniff-vs-svix-vs-hookdeck');
}
