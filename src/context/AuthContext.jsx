// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getAuthUser,
  getAuthPermissions,
  getAccessToken,
  setAuthData,
  clearAuthData,
} from "../helpers/authStorage.jsx";
import { getMe } from "../services/authService.jsx";

const AuthContext = createContext(null);

const toPermStrings = (user) => {
  const list = user?.permissions;
  if (!Array.isArray(list)) return [];
  return list.map((p) => p?.name).filter(Boolean);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getAuthUser());
  const [permissions, setPermissions] = useState(() => getAuthPermissions());
  const [meLoading, setMeLoading] = useState(false);

  const refreshMe = async (reason = "manual") => {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setPermissions([]);
      return null;
    }

    setMeLoading(true);
    try {
      const freshUser = await getMe();

      const perms = toPermStrings(freshUser);

      setUser(freshUser ?? null);
      setPermissions(perms);

      // storage sync
      setAuthData({ accessToken: token, refreshToken: null, user: freshUser });

      return freshUser;
    } catch (e) {
      console.error("[Auth] GET /auth/me failed:", e);

      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        clearAuthData();
        setUser(null);
        setPermissions([]);
      }
      return null;
    } finally {
      setMeLoading(false);
    }
  };

  // ✅ فقط برای refresh صفحه: این باید همیشه وقتی رفرش می‌کنی اجرا بشه
  useEffect(() => {
    refreshMe("mount");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ اگر permissions در بک‌اند عوض شد، کاربر با focus هم آپدیت می‌گیره
  useEffect(() => {
    const onFocus = () => refreshMe("focus");
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshMe("visibility");
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ اگر توکن در تب‌های دیگر عوض شد (storage event) هم sync کن
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "isoogh_access_token") {
        refreshMe("storage");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      permissions,
      meLoading,
      setUser,
      setPermissions,
      refreshMe,
      hasPermission: (perm) => permissions.includes(perm),
      hasAnyPermission: (perms) => (perms || []).some((p) => permissions.includes(p)),
      hasAllPermissions: (perms) => (perms || []).every((p) => permissions.includes(p)),
    }),
    [user, permissions, meLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
