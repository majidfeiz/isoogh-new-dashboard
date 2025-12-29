// src/helpers/apiRoutes.jsx

// آدرس بک‌اند Nest (از env که راحت عوض بشه)
export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://127.0.0.1:8040";
// ورژن‌ها
export const API_VERSION = {
  v1: "",
  v2: "/api/v2",
};

// همه‌ی endpoint ها اینجا متمرکز می‌شن
export const API_ROUTES = {
  auth: {
    login: `${API_VERSION.v1}/auth/login`,
    me: `${API_VERSION.v1}/auth/me`,
    refresh: `${API_VERSION.v1}/auth/refresh`,
    logout: `${API_VERSION.v1}/auth/logout`,
  },
  // ------------------------
  // 🔐 Permissions
  // ------------------------
  permissions: {
    list: "/authorization/permissions",
    create: "/authorization/permissions",
    detail: (id) => `/authorization/permissions/${id}`,
    update: (id) => `/authorization/permissions/${id}`,
    delete: (id) => `/authorization/permissions/${id}`,
  },

  // ------------------------
  // 🔐 Roles
  // ------------------------
  roles: {
    list: "/authorization/roles",
    create: "/authorization/roles",
    detail: (id) => `/authorization/roles/${id}`,
    update: (id) => `/authorization/roles/${id}`,
    delete: (id) => `/authorization/roles/${id}`,
    syncPermissions: (id) => `/authorization/roles/${id}/permissions`,
  },
  // ------------------------
  // 🔐 Users -> Roles / Permissions
  // ------------------------
  // users: {
  //   syncRoles: (id) => `/authorization/users/${id}/roles`,
  //   syncPermissions: (id) => `/authorization/users/${id}/permissions`,
  // },
  users: {
    list: "/users",
    create: "/users",
    detail: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,

    syncRoles: (id) => `/authorization/users/${id}/roles`,
    syncPermissions: (id) => `/authorization/users/${id}/permissions`,
  },
  voip: {
    outboundCallHistories: "/voip/outbound-call-histories",
  },
  // مثال برای بعداً:
  // users: {
  //   list: `${API_VERSION.v1}/users`,
  //   detail: (id) => `${API_VERSION.v1}/users/${id}`,
  // },
};

// کمک برای ساختن URL کامل
export const getApiUrl = (path) => `${API_BASE_URL}${path}`;
