import { listActiveRooms, listMyRooms, type RoomCard } from '@/app/actions/rooms';
import { getMyProfile } from '@/app/actions/profiles';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const [publicRooms, myRooms, profile] = await Promise.all([
    listActiveRooms(),
    listMyRooms(),
    getMyProfile(),
  ]);
  const firstName = (profile?.full_name as string | null)?.split(' ')[0] || 'there';
  const streak = (profile?.streak as number | null) ?? 0;
  return (
    <HomeClient
      publicRooms={publicRooms as RoomCard[]}
      myRooms={myRooms as RoomCard[]}
      greetingName={firstName}
      streak={streak}
    />
  );
}
