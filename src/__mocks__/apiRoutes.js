// Jest mock for apiRoutes — avoids import.meta.env which is Vite-only syntax
export const API_BASE_URL = "http://127.0.0.1:8040"
export const API_VERSION = { v1: "", v2: "/api/v2" }
export const getApiUrl = (path) => `${API_BASE_URL}${path}`
export const API_ROUTES = {
  voip: {
    outboundCallHistories: "/voip/outbound-call-histories",
    outboundCallHistoryTags: "/voip/outbound-call-histories/tags",
    exportOutboundCallHistories: "/voip/outbound-call-histories/export",
    callQueue: "/voip/call-queue",
    callQueueStats: "/voip/call-queue/stats",
    retryCallQueueJob: (id) => `/voip/call-queue/${id}/retry`,
    cancelCallQueueJob: (id) => `/voip/call-queue/${id}/cancel`,
    callTrace: (id) => `/voip/call-traces/${id}`,
  },
  students: {
    list: "/students",
    registrationAvailability: "/students/registration-availability",
    contactSubjects: "/students/contact-subjects",
    contacts: (studentId) => `/students/${studentId}/contacts`,
    contact: (studentId, contactId) => `/students/${studentId}/contacts/${contactId}`,
    contactSetDefault: (studentId, contactId) => `/students/${studentId}/contacts/${contactId}/set-default`,
  },
  users: {
    list: "/users",
    importRoles: "/authorization/users/roles/import",
    importRolesTemplate: "/authorization/users/roles/import/template",
  },
  reports: {
    callsByAdviser: "/reports/calls-by-adviser",
    callsByAdviserExport: "/reports/calls-by-adviser/export",
    contactFormsComprehensive: "/reports/contact-forms-comprehensive",
    contactFormsComprehensiveExport: "/reports/contact-forms-comprehensive/export",
    contactFormsOnline: "/reports/contact-forms-online",
    contactFormsOnlineExport: "/reports/contact-forms-online/export",
    studentVoipComprehensive: "/reports/student-voip-comprehensive",
    studentVoipComprehensiveExport: "/reports/student-voip-comprehensive/export",
    studentContactRecords: "/reports/student-contact-records",
    studentContactRecordsExport: "/reports/student-contact-records/export",
    studentContactRecord: (studentId) => `/reports/student-contact-records/${studentId}`,
    studentContactCallAnswers: (studentId, callId) =>
      `/reports/student-contact-records/${studentId}/calls/${callId}/answers`,
    inactiveAdvisers: "/reports/inactive-advisers",
    inactiveAdvisersExport: "/reports/inactive-advisers/export",
    adviserPerformance: "/reports/adviser-performance",
    adviserPerformanceExport: "/reports/adviser-performance/export",
    adviserPerformanceSchools: "/reports/adviser-performance/schools",
    adviserPerformanceForms: "/reports/adviser-performance/forms",
  },
  answerSheets: {
    list: "/answer-sheets",
    detail: (sessionId) => `/answer-sheets/${sessionId}`,
    call: (sessionId) => `/answer-sheets/${sessionId}/call`,
    exportTable: "/answer-sheets/export/table",
    exportAnswers: "/answer-sheets/export/answers",
  },
  dynamicReports: {
    preview: "/dynamic-reports/preview",
    execute: (id) => `/dynamic-reports/${id}/execute`,
    widgetData: (id, widgetId) => `/dynamic-reports/${id}/widgets/${widgetId}/data`,
  },
  adviserPortal: {
    supportFormStudents: (formId) => `/adviser-portal/support-forms/${formId}/students`,
  },
  superAdviserPortal: {
    supportForms: "/super-adviser-portal/support-forms",
    supportFormGrades: "/super-adviser-portal/support-forms/grades",
    students: "/super-adviser-portal/students",
    studentsExport: "/super-adviser-portal/students/export",
  },
}
