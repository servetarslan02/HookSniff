import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a free HookSniff account',
};


export default function RegisterPage() {
  redirect('/login?mode=register');
}
