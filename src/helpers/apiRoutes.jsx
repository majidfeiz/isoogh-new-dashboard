// src/helpers/apiRoutes.jsx

// آدرس بک‌اند Nest (از env که راحت عوض بشه)
// اولویت با env در زمان build؛ اگر نبود، می‌توان در runtime مقدار window.__ENV__.VITE_API_BASE_URL را ست کرد.
const runtimeBase =
  typeof window !== "undefined" && window.__ENV__ && window.__ENV__.VITE_API_BASE_URL;
const buildBase = import.meta.env?.VITE_API_BASE_URL;
const defaultBase = "https://napi.isoogh.ir";
export const API_BASE_URL = runtimeBase || buildBase || defaultBase;

if (!API_BASE_URL) {
  // هشدار برای توسعه: بدون base URL اپ کار نمی‌کند
  // eslint-disable-next-line no-console
  console.warn("[API] VITE_API_BASE_URL is not set. Set it in .env or window.__ENV__");
}
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
    export: "/users/export",
  },
  students: {
    list: "/students",
    create: "/students",
    detail: (id) => `/students/${id}`,
    update: (id) => `/students/${id}`,
    delete: (id) => `/students/${id}`,
    export: "/students/export",
    import: "/students/import",
  },
  managers: {
    list: "/managers",
    create: "/managers",
    detail: (id) => `/managers/${id}`,
    update: (id) => `/managers/${id}`,
    delete: (id) => `/managers/${id}`,
  },
  advisers: {
    list: "/advisers",
    create: "/advisers",
    detail: (id) => `/advisers/${id}`,
    update: (id) => `/advisers/${id}`,
    delete: (id) => `/advisers/${id}`,
    export: "/advisers/export",
  },
  schools: {
    list: "/schools",
    create: "/schools",
    detail: (id) => `/schools/${id}`,
    update: (id) => `/schools/${id}`,
    delete: (id) => `/schools/${id}`,
  },
  grades: {
    list: "/grades",
    create: "/grades",
    detail: (id) => `/grades/${id}`,
    update: (id) => `/grades/${id}`,
    delete: (id) => `/grades/${id}`,
  },
  voip: {
    outboundCallHistories: "/voip/outbound-call-histories",
    exportOutboundCallHistories: "/voip/outbound-call-histories/export",
    outboundCallHistoriesSocketDocs: "/voip/outbound-call-histories/socket-docs",
  },
  // مثال برای بعداً:
  // users: {
  //   list: `${API_VERSION.v1}/users`,
  //   detail: (id) => `${API_VERSION.v1}/users/${id}`,
  // },
};

// کمک برای ساختن URL کامل
export const getApiUrl = (path) => `${API_BASE_URL}${path}`;
