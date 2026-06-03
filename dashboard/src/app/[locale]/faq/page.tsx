import type { Metadata } from 'next';
import { FAQPageContent } from './content';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about HookSniff',
};


export default function FAQPage() {
  return <FAQPageContent />;
}
