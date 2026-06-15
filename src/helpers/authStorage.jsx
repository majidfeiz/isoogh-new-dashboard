// src/helpers/authStorage.jsx

const TOKEN_KEY = "isoogh_access_token";
const USER_KEY = "isoogh_user";
const PERMISSIONS_KEY = "isoogh_permissions";

const SWITCH_CALLBACK_TOKEN_KEY = "switchCallbackToken";
const SWITCH_ORIGINAL_USER_KEY = "originalUser";

function normalizePermissions(user) {
  const effective = user?.effectivePermissions;
  if (Array.isArray(effective)) {
    return effective
      .map((x) => (typeof x === "string" ? x.trim() : null))
      .filter((x) => x && x.length > 0);
  }
  const list = user?.permissions;
  if (!Array.isArray(list)) return [];
  return list
    .map((p) => (typeof p === "string" ? p.trim() : p?.name?.trim()))
    .filter((x) => typeof x === "string" && x.length > 0);
}

// ذخیره توکن و اطلاعات کاربر بعد از لاگین
// اگر rememberMe=true → localStorage (پایدار)، در غیر این صورت → sessionStorage (تا بستن مرورگر)
export function setAuthData({ accessToken, user, rememberMe = true }) {
  const primary = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;

  if (accessToken) {
    primary.setItem(TOKEN_KEY, accessToken);
    other.removeItem(TOKEN_KEY);
  }

  if (user) {
    primary.setItem(USER_KEY, JSON.stringify(user));
    const permissions = normalizePermissions(user);
    primary.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
    other.removeItem(USER_KEY);
    other.removeItem(PERMISSIONS_KEY);
  } else {
    primary.setItem(PERMISSIONS_KEY, JSON.stringify([]));
  }
}

// گرفتن توکن — ابتدا localStorage، سپس sessionStorage
export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getAuthUser() {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAuthPermissions() {
  const raw = localStorage.getItem(PERMISSIONS_KEY) || sessionStorage.getItem(PERMISSIONS_KEY);
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearAuthData() {
  [localStorage, sessionStorage].forEach((s) => {
    s.removeItem(TOKEN_KEY);
    s.removeItem(USER_KEY);
    s.removeItem(PERMISSIONS_KEY);
  });
}

export function isLoggedIn() {
  return !!getAccessToken();
}

export function setSwitchData({ callbackToken, originalUser }) {
  if (callbackToken) {
    localStorage.setItem(SWITCH_CALLBACK_TOKEN_KEY, callbackToken);
  }
  if (originalUser) {
    localStorage.setItem(SWITCH_ORIGINAL_USER_KEY, JSON.stringify(originalUser));
  }
}

export function getSwitchCallbackToken() {
  return localStorage.getItem(SWITCH_CALLBACK_TOKEN_KEY) || null;
}

export function getOriginalUser() {
  const raw = localStorage.getItem(SWITCH_ORIGINAL_USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSwitchData() {
  localStorage.removeItem(SWITCH_CALLBACK_TOKEN_KEY);
  localStorage.removeItem(SWITCH_ORIGINAL_USER_KEY);
}
