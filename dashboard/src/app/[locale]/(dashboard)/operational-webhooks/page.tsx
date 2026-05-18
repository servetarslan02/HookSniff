'use client';

import dynamic from 'next/dynamic';

const OperationalWebhooksContainer = dynamic(
  () => import('./OperationalWebhooksContainer'),
  { ssr: false }
);

export default function OperationalWebhooksPage() {
  return <OperationalWebhooksContainer />;
}
