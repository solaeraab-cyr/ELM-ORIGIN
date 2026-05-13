import { listMyNotifications } from '@/app/actions/notifications';
import NotificationsClient from './NotificationsClient';
import type { Notification } from '@/lib/notification-types';

export default async function NotificationsPage() {
  const notifs = await listMyNotifications(50);
  return <NotificationsClient initial={notifs as Notification[]} />;
}
