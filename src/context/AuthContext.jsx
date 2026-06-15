// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getAuthUser,
  getAuthPermissions,
  getAccessToken,
  setAuthData,
  clearAuthData,
  getSwitchCallbackToken,
  getOriginalUser,
  setSwitchData,
  clearSwitchData,
} from "../helpers/authStorage.jsx";
import { getMe } from "../services/authService.jsx";
import {
  switchToUser as switchToUserApi,
  switchBack as switchBackApi,
} from "../services/userSwitchService.jsx";

const AuthContext = createContext(null);

const toPermStrings = (user) => {
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
    .filter(Boolean);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getAuthUser());
  const [permissions, setPermissions] = useState(() => getAuthPermissions());
  const [meLoading, setMeLoading] = useState(false);

  // switch state — initialized from localStorage so it survives page refresh
  const [isSwitched, setIsSwitched] = useState(() => !!getSwitchCallbackToken());
  const [callbackToken, setCallbackToken] = useState(() => getSwitchCallbackToken());
  const [originalUser, setOriginalUser] = useState(() => getOriginalUser());

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

      setAuthData({ accessToken: token, refreshToken: null, user: freshUser });

      return freshUser;
    } catch (e) {
      console.error("[Auth] GET /auth/me failed:", e);

      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        clearAuthData();
        clearSwitchData();
        setUser(null);
        setPermissions([]);
        setIsSwitched(false);
        setCallbackToken(null);
        setOriginalUser(null);
      }
      return null;
    } finally {
      setMeLoading(false);
    }
  };

  const switchToUser = async (userId) => {
    const currentUser = user;
    const result = await switchToUserApi(userId);
    // result: { accessToken, callbackToken, user }

    setSwitchData({ callbackToken: result.callbackToken, originalUser: currentUser });
    setAuthData({ accessToken: result.accessToken, user: result.user });

    setIsSwitched(true);
    setCallbackToken(result.callbackToken);
    setOriginalUser(currentUser);
    setUser(result.user);
    setPermissions(toPermStrings(result.user));
  };

  const switchBack = async () => {
    const cbToken = callbackToken;
    const result = await switchBackApi(cbToken);
    // result: { accessToken, user }

    clearSwitchData();
    setAuthData({ accessToken: result.accessToken, user: result.user });

    setIsSwitched(false);
    setCallbackToken(null);
    setOriginalUser(null);
    setUser(result.user);
    setPermissions(toPermStrings(result.user));
  };

  // ✅ فقط برای refresh صفحه
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
      // switch state
      isSwitched,
      callbackToken,
      originalUser,
      switchToUser,
      switchBack,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, permissions, meLoading, isSwitched, callbackToken, originalUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
