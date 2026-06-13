// src/services/sessionService.jsx

import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";
import { apiGet, apiDelete } from "../helpers/httpClient.jsx";

// نشست‌های خودم
export async function getMySessions() {
  const url = getApiUrl(API_ROUTES.auth.sessions);
  const response = await apiGet(url);
  return response?.data?.data ?? [];
}

export async function revokeMySession(sessionId) {
  const url = getApiUrl(API_ROUTES.auth.session(sessionId));
  const response = await apiDelete(url);
  return response?.data?.data;
}

// ادمین: نشست‌های یک کاربر خاص
export async function getUserSessions(userId) {
  const url = getApiUrl(API_ROUTES.auth.adminUserSessions(userId));
  const response = await apiGet(url);
  return response?.data?.data ?? [];
}

export async function revokeAdminSession(sessionId) {
  const url = getApiUrl(API_ROUTES.auth.adminSession(sessionId));
  const response = await apiDelete(url);
  return response?.data?.data;
}

export async function revokeAllUserSessions(userId) {
  const url = getApiUrl(API_ROUTES.auth.adminUserSessions(userId));
  const response = await apiDelete(url);
  return response?.data?.data;
}
