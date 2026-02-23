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
    studentCandidates: (adviserId) => `/advisers/${adviserId}/student-candidates`,
    students: (adviserId) => `/advisers/${adviserId}/students`,
    studentsBySearch: (adviserId) => `/advisers/${adviserId}/students/by-search`,
    studentsByTag: (adviserId) => `/advisers/${adviserId}/students/by-tag`,
    detachStudent: (adviserId, studentId) => `/advisers/${adviserId}/students/${studentId}`,
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
  parentTags: {
    list: "/parent-tags",
    create: "/parent-tags",
    detail: (id) => `/parent-tags/${id}`,
    update: (id) => `/parent-tags/${id}`,
    delete: (id) => `/parent-tags/${id}`,
    export: "/parent-tags/export",
    import: "/parent-tags/import",
    users: (id) => `/parent-tags/${id}/users`,
    detachUser: (id, userId) => `/parent-tags/${id}/users/${userId}`,
    exportUsers: (id) => `/parent-tags/${id}/users/export`,
    values: (id) => `/parent-tags/${id}/values`,
    deleteValue: (id, userId) => `/parent-tags/${id}/values/${userId}`,
  },
  voip: {
    outboundCallHistories: "/voip/outbound-call-histories",
    exportOutboundCallHistories: "/voip/outbound-call-histories/export",
    outboundCallHistoriesSocketDocs: "/voip/outbound-call-histories/socket-docs",
  },
  supportForms: {
    list: "/support-forms",
    create: "/support-forms",
    detail: (id) => `/support-forms/${id}`,
    update: (id) => `/support-forms/${id}`,
    delete: (id) => `/support-forms/${id}`,
    advisers: (id) => `/support-forms/${id}/advisers`,
    adviserCandidates: (id) => `/support-forms/${id}/adviser-candidates`,
    detachAdviser: (id, adviserId) => `/support-forms/${id}/advisers/${adviserId}`,
    adviserStudentCandidates: (id, adviserId) =>
      `/support-forms/${id}/advisers/${adviserId}/student-candidates`,
    adviserStudents: (id, adviserId) => `/support-forms/${id}/advisers/${adviserId}/students`,
    adviserStudentsByTag: (id, adviserId) =>
      `/support-forms/${id}/advisers/${adviserId}/students/by-tag`,
    detachAdviserStudent: (id, adviserId, studentId) =>
      `/support-forms/${id}/advisers/${adviserId}/students/${studentId}`,
    detachAdviserStudents: (id, adviserId) =>
      `/support-forms/${id}/advisers/${adviserId}/students`,
  },
  files: {
    list: "/files",
    create: "/files",
    detail: (id) => `/files/${id}`,
    update: (id) => `/files/${id}`,
    delete: (id) => `/files/${id}`,
  },
  // مثال برای بعداً:
  // users: {
  //   list: `${API_VERSION.v1}/users`,
  //   detail: (id) => `${API_VERSION.v1}/users/${id}`,
  // },
};

// کمک برای ساختن URL کامل
export const getApiUrl = (path) => `${API_BASE_URL}${path}`;
