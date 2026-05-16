import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find a Mentor',
  description: 'Connect with verified mentors for 1-on-1 sessions, career guidance, and expert interview coaching.',
  openGraph: {
    title: 'Find a Mentor — ELM Origin',
    description: 'Connect with verified mentors for 1-on-1 sessions, career guidance, and expert interview coaching.',
  },
};

export default function MentorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
