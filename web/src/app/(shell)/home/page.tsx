import { listActiveRooms, listMyRooms, type RoomCard } from '@/app/actions/rooms';
import { getMyProfile } from '@/app/actions/profiles';
import { createClient } from '@/lib/supabase/server';
import HomeClient from './HomeClient';

export default async function HomePage() {
  // Each call already returns safe defaults, but guard with .catch so a single
  // failure can never turn the whole page into a 500.
  const supabase = await createClient();
  const [{ data: { user } }, publicRooms, myRooms, profile] = await Promise.all([
    supabase.auth.getUser().catch(() => ({ data: { user: null } })),
    listActiveRooms().catch(() => []),
    listMyRooms().catch(() => []),
    getMyProfile().catch(() => null),
  ]);
  const firstName = (profile?.full_name as string | null)?.split(' ')[0] || 'there';
  const streak = (profile?.streak as number | null) ?? 0;
  return (
    <HomeClient
      publicRooms={publicRooms as RoomCard[]}
      myRooms={myRooms as RoomCard[]}
      greetingName={firstName}
      streak={streak}
      currentUserId={user?.id ?? null}
    />
  );
}
