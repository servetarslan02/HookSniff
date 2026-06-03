import type { Metadata } from 'next';
import { PricingPageContent } from './content';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for webhook delivery. Start free, scale when ready',
};


export default function PricingPage() {
  return <PricingPageContent />;
}
    );
}
