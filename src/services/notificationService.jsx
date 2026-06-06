import { apiDelete, apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const normalizeNotification = (item = {}) => ({
  id: item?.id ?? null,
  type: item?.type ?? "",
  title: item?.title ?? "",
  body: item?.body ?? "",
  icon: item?.icon ?? null,
  color: item?.color ?? null,
  actionUrl: item?.actionUrl ?? item?.action_url ?? null,
  isRead: item?.isRead ?? item?.is_read ?? false,
  readAt: item?.readAt ?? item?.read_at ?? null,
  createdAt: item?.createdAt ?? item?.created_at ?? null,
});

export async function getUnreadNotifications() {
  const url = getApiUrl(API_ROUTES.notifications.unread);
  const res = await apiGet(url);
  const outer = res?.data || {};
  const data = outer.data ?? outer;

  const unreadCount =
    data.unreadCount ??
    data.unread_count ??
    data.meta?.unreadCount ??
    data.meta?.unread_count ??
    0;

  const rawItems = data.items ?? data.data ?? [];
  return {
    unreadCount,
    items: rawItems.map(normalizeNotification),
  };
}

export async function getNotifications({ page = 1, limit = 15, status = "all", type } = {}) {
  const url = getApiUrl(API_ROUTES.notifications.list);
  const res = await apiGet(url, {
    params: {
      page,
      limit,
      status,
      type: type || undefined,
    },
  });
  const data = res?.data?.data || {};
  const meta = data.meta || {};
  const items = (data.items || []).map(normalizeNotification);
  return {
    items,
    meta: {
      page: meta.page ?? page,
      limit: meta.limit ?? limit,
      total: meta.total ?? items.length,
      lastPage: meta.lastPage ?? 1,
      unreadCount: meta.unreadCount ?? 0,
    },
  };
}

export async function markAsRead(id) {
  const url = getApiUrl(API_ROUTES.notifications.markRead(id));
  const res = await apiPatch(url);
  const raw = res?.data?.data || res?.data || {};
  return normalizeNotification(raw);
}

export async function markAllAsRead() {
  const url = getApiUrl(API_ROUTES.notifications.markAllRead);
  const res = await apiPatch(url);
  return res?.data;
}

export async function deleteNotification(id) {
  const url = getApiUrl(API_ROUTES.notifications.delete(id));
  const res = await apiDelete(url);
  return res?.data;
}

// ─── Send (admin/manager) ────────────────────────────────────────────────────

function extractSendResult(res) {
  return res?.data?.data || { sentCount: 0, message: "ارسال شد" };
}

export async function sendNotificationToUser({ userId, type = "DirectMessage", data }) {
  const url = getApiUrl(API_ROUTES.notifications.sendUser);
  const res = await apiPost(url, { userId, type, data });
  return extractSendResult(res);
}

export async function sendNotificationToSchoolAdvisers(schoolId, { type = "SchoolAlert", data }) {
  const url = getApiUrl(API_ROUTES.notifications.sendSchoolAdvisers(schoolId));
  const res = await apiPost(url, { type, data });
  return extractSendResult(res);
}

export async function sendNotificationToSuperAdviser(schoolId, { type = "SchoolAlert", data }) {
  const url = getApiUrl(API_ROUTES.notifications.sendSuperAdviser(schoolId));
  const res = await apiPost(url, { type, data });
  return extractSendResult(res);
}

export async function sendBroadcastNotification({ type = "SystemBroadcast", targetRole, data }) {
  const url = getApiUrl(API_ROUTES.notifications.sendBroadcast);
  const res = await apiPost(url, {
    type,
    targetRole: targetRole || undefined,
    data,
  });
  return extractSendResult(res);
}
