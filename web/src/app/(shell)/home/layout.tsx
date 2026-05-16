import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Your personalised study dashboard — active rooms, streak, and AI-powered recommendations.',
  openGraph: {
    title: 'Home — ELM Origin',
    description: 'Your personalised study dashboard — active rooms, streak, and AI-powered recommendations.',
  },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
