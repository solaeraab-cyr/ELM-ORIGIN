import ShellLayout from '@/components/shell/ShellLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ShellLayout>{children}</ShellLayout>;
}
