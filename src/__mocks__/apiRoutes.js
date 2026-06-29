// Jest mock for apiRoutes — avoids import.meta.env which is Vite-only syntax
export const API_BASE_URL = "http://127.0.0.1:8040"
export const API_VERSION = { v1: "", v2: "/api/v2" }
export const getApiUrl = (path) => `${API_BASE_URL}${path}`
export const API_ROUTES = {}
