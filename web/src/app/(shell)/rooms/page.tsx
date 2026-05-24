import { listActiveRooms, listMyRooms, listScheduledRooms, type RoomCard } from '@/app/actions/rooms';
import RoomsClient from './RoomsClient';

export default async function RoomsPage() {
  const [publicRooms, myRooms, scheduledRooms] = await Promise.all([
    listActiveRooms().catch(() => []),
    listMyRooms().catch(() => []),
    listScheduledRooms().catch(() => []),
  ]);
  return (
    <RoomsClient
      publicRooms={publicRooms as RoomCard[]}
      myRooms={myRooms as RoomCard[]}
      scheduledRooms={scheduledRooms as RoomCard[]}
    />
  );
}
