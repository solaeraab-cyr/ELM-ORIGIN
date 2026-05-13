'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';

export default function GroupInterviewRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  // Group interviews reuse the existing /room/[id] page with a "gi-" prefix that triggers GroupInterviewRoom.
  if (typeof window !== 'undefined') {
    router.replace(`/room/gi-${id}`);
  }
  return null;
}
