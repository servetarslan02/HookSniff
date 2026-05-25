import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Error Handling — HookSniff Docs',
};

export default function ErrorHandlingPage() {
  redirect('/docs/guides/error-handling');
}
