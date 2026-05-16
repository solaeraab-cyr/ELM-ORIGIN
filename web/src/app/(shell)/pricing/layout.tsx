import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing. Free forever with paid plans from ₹99/month. Unlock unlimited rooms, interviews, and AI chats.',
  openGraph: {
    title: 'Pricing — ELM Origin',
    description: 'Simple, transparent pricing. Free forever with paid plans from ₹99/month.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
