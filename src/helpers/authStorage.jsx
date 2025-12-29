// src/helpers/authStorage.jsx

const TOKEN_KEY = "isoogh_access_token";
const REFRESH_TOKEN_KEY = "isoogh_refresh_token";
const USER_KEY = "isoogh_user";

// ✅ new
const PERMISSIONS_KEY = "isoogh_permissions";

function normalizePermissions(user) {
  const list = user?.permissions;
  if (!Array.isArray(list)) return [];
  return list
    .map((p) => p?.name)
    .filter((x) => typeof x === "string" && x.length > 0);
}

// ذخیره توکن و اطلاعات کاربر بعد از لاگین
export function setAuthData({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // ✅ store permissions as string[]
    const permissions = normalizePermissions(user);
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
  } else {
    // ✅ prevent null issues
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify([]));
  }
}

// گرفتن توکن
export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAuthUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ✅ new
export function getAuthPermissions() {
  const raw = localStorage.getItem(PERMISSIONS_KEY);
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PERMISSIONS_KEY); // ✅ new
}

export function isLoggedIn() {
  return !!getAccessToken();
}
