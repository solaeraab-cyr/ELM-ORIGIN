import { listActiveRooms, listMyRooms, type RoomCard } from '@/app/actions/rooms';
import RoomsClient from './RoomsClient';

export default async function RoomsPage() {
  const [publicRooms, myRooms] = await Promise.all([listActiveRooms(), listMyRooms()]);
  return <RoomsClient publicRooms={publicRooms as RoomCard[]} myRooms={myRooms as RoomCard[]} />;
}
