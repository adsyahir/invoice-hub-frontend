import { instance } from "./axios";
import type { NotificationFeed } from "@/types";

/** The bell feed: newest notifications + unread badge count. */
export const feed = () =>
  instance.get<NotificationFeed>("/notifications").then((r) => r.data);

/** Mark one notification read. */
export const markRead = (id: number) =>
  instance.post<void>(`/notifications/${id}/read`).then((r) => r.data);

/** Mark every notification read. */
export const markAllRead = () =>
  instance.post<void>("/notifications/read-all").then((r) => r.data);
