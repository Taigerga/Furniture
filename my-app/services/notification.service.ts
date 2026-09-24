import { listNotifications as apiList, type NotificationList } from "@/lib/api/notifications";

export const NOTIF_PAGE_SIZE = 15;

export function listNotifications(_userId: string, page: number, onlyUnread = false): Promise<NotificationList> {
  void _userId;
  return apiList({ page, unread: onlyUnread });
}
