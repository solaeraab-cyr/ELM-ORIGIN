import { listActiveRooms } from '@/app/actions/rooms';
import { getMyProfile } from '@/app/actions/profiles';
import HomeClient, { type RoomRow } from './HomeClient';

export default async function HomePage() {
  const [rooms, profile] = await Promise.all([listActiveRooms(), getMyProfile()]);
  const firstName = (profile?.full_name as string | null)?.split(' ')[0] || 'there';
  const streak = (profile?.streak as number | null) ?? 0;
  return <HomeClient rooms={rooms as RoomRow[]} greetingName={firstName} streak={streak} />;
}
