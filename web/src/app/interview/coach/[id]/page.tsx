'use client';

import { use } from 'react';
import PeerInterviewPage from '../../peer/[id]/page';

export default function CoachInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  // Coach session uses the same interview UI as peer for now; just renames "peer" → "coach" via id prefix.
  use(params);
  return <PeerInterviewPage params={params} />;
}
