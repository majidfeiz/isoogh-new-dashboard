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
  version: "/version",
  auth: {
    login: `${API_VERSION.v1}/auth/login`,
    verifyOtp: `${API_VERSION.v1}/auth/verify-otp`,
    me: `${API_VERSION.v1}/auth/me`,
    refresh: `${API_VERSION.v1}/auth/refresh`,
    logout: `${API_VERSION.v1}/auth/logout`,
    sessions: `${API_VERSION.v1}/auth/sessions`,
    session: (id) => `${API_VERSION.v1}/auth/sessions/${id}`,
    adminUserSessions: (userId) => `${API_VERSION.v1}/auth/admin/users/${userId}/sessions`,
    adminSession: (id) => `${API_VERSION.v1}/auth/admin/sessions/${id}`,
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
    grades: (adviserId) => `/advisers/${adviserId}/grades`,
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
  voipAnalytics: {
    summary: "/voip/analytics/summary",
    durationMismatch: "/voip/analytics/duration-mismatch",
    failedFiles: "/voip/analytics/failed-files",
    orphanedCalls: "/voip/analytics/orphaned-calls",
    nullCallGroup: "/voip/analytics/null-call-group",
    unansweredAnswers: "/voip/analytics/unanswered-answers",
    exportDurationMismatch: "/voip/analytics/duration-mismatch/export",
    exportFailedFiles: "/voip/analytics/failed-files/export",
    exportOrphanedCalls: "/voip/analytics/orphaned-calls/export",
    exportNullCallGroup: "/voip/analytics/null-call-group/export",
    exportUnansweredAnswers: "/voip/analytics/unanswered-answers/export",
  },
  supportForms: {
    list: "/support-forms",
    create: "/support-forms",
    detail: (id) => `/support-forms/${id}`,
    update: (id) => `/support-forms/${id}`,
    delete: (id) => `/support-forms/${id}`,
    copy: (id) => `/support-forms/copy/${id}`,
    allForms: "/support-forms/get-all-support-forms",
    questionsOrForms: "/support-forms/get-support-form-questions",
    changeStudentStatus: "/support-forms/change-student-support-form-status",
    getStudentStatus: "/support-forms/get-student-support-form-status",
    adviserInterruptedCalls: "/support-forms/get-students-support-form-interrupted-calls-list",
    questions: (id) => `/support-forms/${id}/questions`,
    question: (id, qId) => `/support-forms/${id}/questions/${qId}`,
    advisers: (id) => `/support-forms/${id}/advisers`,
    adviserCandidates: (id) => `/support-forms/${id}/adviser-candidates`,
    setAdvisers: (id) => `/support-forms/${id}/set-advisers`,
    delAdvisers: (id) => `/support-forms/${id}/del-advisers`,
    toggleAdviserActive: (id, adviserId) => `/support-forms/${id}/${adviserId}/active`,
    detachAdviser: (id, adviserId) => `/support-forms/${id}/advisers/${adviserId}`,
    formStudents: (id) => `/support-forms/${id}/form-students`,
    interruptedCalls: (id) => `/support-forms/${id}/interrupted-calls`,
    adviserStudentCandidates: (id, adviserId) =>
      `/support-forms/${id}/advisers/${adviserId}/student-candidates`,
    adviserStudents: (id, adviserId) => `/support-forms/${id}/advisers/${adviserId}/students`,
    adviserStudentsByTag: (id, adviserId) =>
      `/support-forms/${id}/advisers/${adviserId}/students/by-tag`,
    setAdviserStudents: (id, adviserId) =>
      `/support-forms/${id}/advisers/${adviserId}/set-adviser-students`,
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
  adviserPortal: {
    schools: "/adviser-portal/schools",
    schoolsExport: "/adviser-portal/schools/export",
    schoolDetail: (id) => `/adviser-portal/schools/${id}`,
    schoolStats: (id) => `/adviser-portal/schools/${id}/stats`,
    schoolSupportForms: (schoolId) => `/adviser-portal/schools/${schoolId}/support-forms`,
    supportFormDetail: (id) => `/adviser-portal/support-forms/${id}`,
    supportFormStudents: (id) => `/adviser-portal/support-forms/${id}/students`,
    supportFormStats: (id) => `/adviser-portal/support-forms/${id}/stats`,
    submitAnswers: (formId, studentId) =>
      `/adviser-portal/support-forms/${formId}/students/${studentId}/answers`,
    studentProfile: (formId, studentId) =>
      `/adviser-portal/support-forms/${formId}/students/${studentId}/profile`,
    studentCallLogs: (formId, studentId) =>
      `/adviser-portal/support-forms/${formId}/students/${studentId}/call-logs`,
    studentAnswers: (formId, studentId) =>
      `/adviser-portal/support-forms/${formId}/students/${studentId}/answers`,
    studentContacts: (formId, studentId) =>
      `/adviser-portal/support-forms/${formId}/students/${studentId}/contacts`,
    studentContactSetDefault: (formId, studentId, contactId) =>
      `/adviser-portal/support-forms/${formId}/students/${studentId}/contacts/${contactId}/set-default`,
    studentContactDelete: (formId, studentId, contactId) =>
      `/adviser-portal/support-forms/${formId}/students/${studentId}/contacts/${contactId}`,
    contactSubjects: "/adviser-portal/contact-subjects",
    call: "/adviser-portal/call",
    callLogs: "/adviser-portal/call-logs",
    stats: "/adviser-portal/stats",
  },
  superAdviserPortal: {
    schools: "/super-adviser-portal/schools",
    advisers: "/super-adviser-portal/advisers",
    supportForms: "/super-adviser-portal/support-forms",
    students: "/super-adviser-portal/students",
    performanceReport: "/super-adviser-portal/performance-report",
    monitoring: "/super-adviser-portal/monitoring",
    salary: "/super-adviser-portal/salary",
    answerSheet: (formId) => `/super-adviser-portal/support-forms/${formId}/answer-sheet`,
    answerSheetExport: (formId) => `/super-adviser-portal/support-forms/${formId}/answer-sheet/export`,
    answerSheetStudentDetail: (formId, studentId) => `/super-adviser-portal/support-forms/${formId}/students/${studentId}/answers`,
  },
  notifications: {
    unread: "/notifications/unread",
    list: "/notifications",
    markRead: (id) => `/notifications/${id}/read`,
    markAllRead: "/notifications/read-all",
    delete: (id) => `/notifications/${id}`,
    sendUser: "/notifications/send/user",
    sendSchoolAdvisers: (schoolId) => `/notifications/send/school/${schoolId}/advisers`,
    sendSuperAdviser: (schoolId) => `/notifications/send/school/${schoolId}/super-adviser`,
    sendBroadcast: "/notifications/send/broadcast",
  },
  profile: {
    me: "/profile",
    update: "/profile",
    changePassword: "/profile/password",
  },
  dashboard: {
    default: "/dashboard/default",
    widgets: "/dashboard/widgets",
    my: "/dashboard/my",
    myWidgets: "/dashboard/my/widgets",
    myWidget: (id) => `/dashboard/my/widgets/${id}`,
    myReset: "/dashboard/my/reset",
    widgetRoles: (widgetId) => `/dashboard/widgets/${widgetId}/roles`,
    widgetRole: (widgetId, roleId) => `/dashboard/widgets/${widgetId}/roles/${roleId}`,
  },
  // ------------------------
  // 🔑 External API Clients
  // ------------------------
  externalApiClients: {
    list: "/external-api-clients",
    create: "/external-api-clients",
    detail: (id) => `/external-api-clients/${id}`,
    update: (id) => `/external-api-clients/${id}`,
    delete: (id) => `/external-api-clients/${id}`,
    regenerateKey: (id) => `/external-api-clients/${id}/regenerate-key`,
    logs: "/external-api-clients/logs",
    addIp: (id) => `/external-api-clients/${id}/ips`,
    deleteIp: (id, ipId) => `/external-api-clients/${id}/ips/${ipId}`,
  },
  // ------------------------
  // 🔔 VoIP Webhooks
  // ------------------------
  voipWebhooks: {
    list: "/voip-webhooks",
    create: "/voip-webhooks",
    detail: (id) => `/voip-webhooks/${id}`,
    update: (id) => `/voip-webhooks/${id}`,
    delete: (id) => `/voip-webhooks/${id}`,
    test: (id) => `/voip-webhooks/${id}/test`,
    dispatch: (callHistoryId) => `/voip-webhooks/dispatch/${callHistoryId}`,
    logs: "/voip-webhooks/logs",
  },
  // ------------------------
  // 📊 Reports
  // ------------------------
  reports: {
    overview: "/reports/overview",
    callsTrend: "/reports/calls-trend",
    callsByAdviser: "/reports/calls-by-adviser",
    callsByAdviserExport: "/reports/calls-by-adviser/export",
    callsByHour: "/reports/calls-by-hour",
    studentsCoverage: "/reports/students-coverage",
    uncontactedStudents: "/reports/uncontacted-students",
    uncontactedStudentsExport: "/reports/uncontacted-students/export",
    formsStatus: "/reports/forms-status",
    monthlyComparison: "/reports/monthly-comparison",
  },
  // ------------------------
  // 🔀 User Switch
  // ------------------------
  userSwitch: {
    switch: "/user-switch",
    callback: "/user-switch/callback",
  },
};

// کمک برای ساختن URL کامل
export const getApiUrl = (path) => `${API_BASE_URL}${path}`;
