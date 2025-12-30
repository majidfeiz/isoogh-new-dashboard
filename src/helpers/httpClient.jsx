// src/helpers/httpClient.jsx

import axios from "axios";
import { API_BASE_URL } from "./apiRoutes.jsx";
import { getAccessToken, clearAuthData } from "./authStorage.jsx";
import { toast } from "react-toastify";

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
  async (error) => {
    if (error?.response?.status === 401) {
      clearAuthData();
      // اگر خواستی اینجا می‌تونی redirect به /login هم اضافه کنی
    }

    // اگر پاسخ blob بود (مثلاً در export) و json دارد، تبدیلش کنیم تا message خوانده شود
    const data = error?.response?.data;
    if (data instanceof Blob) {
      try {
        const text = await data.text();
        const parsed = JSON.parse(text);
        error.response.data = parsed;
      } catch {
        // blob قابل خواندن نبود، همان را نگه دار
      }
    }

    const extractMessage = () => {
      const data = error?.response?.data;
      if (!data) return null;
      if (typeof data === "string") return data;

      // اگر message آرایه بود، join کن
      if (Array.isArray(data?.message)) {
        return data.message.filter(Boolean).join("، ");
      }

      return (
        data?.message ||
        data?.error ||
        data?.errors?.[0]?.message ||
        data?.errors?.[0] ||
        null
      );
    };

    const msg =
      extractMessage() ||
      error?.response?.statusText ||
      error?.message ||
      "خطای نامشخص از سرور";

    // toast فقط برای جلوگیری از تکرار در بعضی درخواست‌های silent
    toast.error(msg, { autoClose: 4000 });

    // لاگ توسعه‌دهنده
    // eslint-disable-next-line no-console
    console.error("[API ERROR]", msg, error);

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
