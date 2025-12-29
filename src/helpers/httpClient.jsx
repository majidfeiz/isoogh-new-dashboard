// src/helpers/httpClient.jsx

import axios from "axios";
import { API_BASE_URL } from "./apiRoutes.jsx";
import { getAccessToken, clearAuthData } from "./authStorage.jsx";

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// قبل از هر درخواست، توکن را در هدر بگذار
http.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// مدیریت پاسخ‌ها (مثلاً اگر 401 شد، لاگ‌اوت کنیم)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthData();
      // اگر خواستی اینجا می‌تونی redirect به /login هم اضافه کنی
    }
    return Promise.reject(error);
  }
);

// توابع کمکی get/post/put/patch/delete

export const apiGet = (url, config = {}) => http.get(url, config);
export const apiPost = (url, data = {}, config = {}) =>
  http.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) =>
  http.put(url, data, config);
export const apiPatch = (url, data = {}, config = {}) =>
  http.patch(url, data, config);
export const apiDelete = (url, config = {}) => http.delete(url, config);

export default http;
