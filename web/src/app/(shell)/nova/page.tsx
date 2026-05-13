'use client';

import NovaChat from '@/components/nova/NovaChat';

export default function NovaPage() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 920, margin: '0 auto', height: 'calc(100vh - 68px)' }}>
      <NovaChat />
    </div>
  );
}
