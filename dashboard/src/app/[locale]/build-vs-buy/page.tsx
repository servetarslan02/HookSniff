import BuildVsBuyContent from './BuildVsBuyContent';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata = {
  title: 'Webhooks Build vs Buy — Should You Build Your Own? | HookSniff',
  description: 'Should you build webhook infrastructure in-house or use a service? Compare 12 dimensions: cost, time, security, reliability, and developer experience.',
};

export default function BuildVsBuyPage() {
  return <BuildVsBuyContent />;
}
