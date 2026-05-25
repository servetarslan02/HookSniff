import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginPageContent } from './content';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your HookSniff account',
};

export default function LoginPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <LoginPageContent />
      </Suspense>
    );
}
