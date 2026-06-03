import type { Metadata } from 'next';
import { CustomersPageContent } from './content';

export const metadata: Metadata = {
  title: 'Customer Stories',
  description: 'See how companies rely on HookSniff for webhook delivery',
};

export default function CustomersPage() {
  return <CustomersPageContent />;
}
