import type { Metadata } from 'next';
import { ChangelogPageContent } from './content';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Track all updates, features, and improvements to HookSniff',
};


export default function ChangelogPage() {
  return <ChangelogPageContent />;
}
    );
}
