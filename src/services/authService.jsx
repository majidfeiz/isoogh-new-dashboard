// src/services/authService.jsx

import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";
import { apiPost,apiGet } from "../helpers/httpClient.jsx";
import { setAuthData, clearAuthData } from "../helpers/authStorage.jsx";

// login با username و password
export async function login(username, password) {
  const url = getApiUrl(API_ROUTES.auth.login);
  const response = await apiPost(url, { username, password });

  // ✅ ساختار واقعی:
  // { success: true, data: { accessToken, user } }
  const accessToken = response?.data?.data?.accessToken ?? null;
  const user = response?.data?.data?.user ?? null;

  // ذخیره در localStorage (+ permissions داخل authStorage ذخیره میشه)
  setAuthData({ accessToken, refreshToken: null, user });

  return { accessToken, user };
}

export async function getMe() {
  const url = getApiUrl(API_ROUTES.auth.me);
  const response = await apiGet(url);

  // طبق swagger معمولاً user تو data هست
  const user = response?.data?.data ?? response?.data ?? null;
  return user;
}

export function logout() {
  clearAuthData();
}
