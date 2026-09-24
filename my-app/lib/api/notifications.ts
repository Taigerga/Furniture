import { authedFetch, type Page } from "./client";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationList = Page<NotificationItem> & { unread: number };

export function listNotifications(params: { page?: number; unread?: boolean } = {}) {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.unread) sp.set("unread", "true");
  const qs = sp.toString();
  return authedFetch<NotificationList>(`/notifications${qs ? `?${qs}` : ""}`, { cache: "no-store" });
}

export function getUnreadCount() {
  return authedFetch<{ unread: number }>("/notifications/unread-count", { cache: "no-store" });
}

export function markNotificationRead(id: string) {
  return authedFetch<{ id: string }>(`/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead() {
  return authedFetch<{ ok: boolean }>("/notifications/read-all", { method: "POST" });
}
