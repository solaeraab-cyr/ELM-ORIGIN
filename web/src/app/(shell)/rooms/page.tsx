import { listActiveRooms, listMyRooms, listScheduledRooms, type RoomCard } from '@/app/actions/rooms';
import { createClient } from '@/lib/supabase/server';
import RoomsClient from './RoomsClient';

export default async function RoomsPage() {
  const supabase = await createClient();
  const [{ data: { user } }, publicRooms, myRooms, scheduledRooms] = await Promise.all([
    supabase.auth.getUser().catch(() => ({ data: { user: null } })),
    listActiveRooms().catch(() => []),
    listMyRooms().catch(() => []),
    listScheduledRooms().catch(() => []),
  ]);
  return (
    <RoomsClient
      publicRooms={publicRooms as RoomCard[]}
      myRooms={myRooms as RoomCard[]}
      scheduledRooms={scheduledRooms as RoomCard[]}
      currentUserId={user?.id ?? null}
    />
  );
}
