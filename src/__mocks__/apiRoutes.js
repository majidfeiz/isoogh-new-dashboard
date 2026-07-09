// Jest mock for apiRoutes — avoids import.meta.env which is Vite-only syntax
export const API_BASE_URL = "http://127.0.0.1:8040"
export const API_VERSION = { v1: "", v2: "/api/v2" }
export const getApiUrl = (path) => `${API_BASE_URL}${path}`
export const API_ROUTES = {
  reports: {
    callsByAdviser: "/reports/calls-by-adviser",
    callsByAdviserExport: "/reports/calls-by-adviser/export",
    contactFormsComprehensive: "/reports/contact-forms-comprehensive",
    contactFormsComprehensiveExport: "/reports/contact-forms-comprehensive/export",
    contactFormsOnline: "/reports/contact-forms-online",
    contactFormsOnlineExport: "/reports/contact-forms-online/export",
    studentVoipComprehensive: "/reports/student-voip-comprehensive",
    studentVoipComprehensiveExport: "/reports/student-voip-comprehensive/export",
    inactiveAdvisers: "/reports/inactive-advisers",
    inactiveAdvisersExport: "/reports/inactive-advisers/export",
  },
}
