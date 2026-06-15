// src/helpers/httpClient.jsx

import axios from "axios";
import { API_BASE_URL } from "./apiRoutes.jsx";
import { getAccessToken, clearAuthData } from "./authStorage.jsx";
import { toast } from "react-toastify";

const PERSIAN_STATUS = {
  400: "درخواست نامعتبر است",
  401: "احراز هویت ناموفق بود",
  403: "شما دسترسی کافی ندارید",
  404: "منبع مورد نظر یافت نشد",
  409: "تعارض در داده‌ها",
  422: "اطلاعات ارسالی معتبر نیست",
  429: "درخواست بیش از حد — لطفا کمی صبر کنید",
  500: "خطای داخلی سرور",
  502: "سرور موقتاً در دسترس نیست",
  503: "سرویس موقتاً در دسترس نیست",
};

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearAuthData();
    }

    // اگر پاسخ blob بود و json دارد، تبدیلش کنیم تا message خوانده شود
    const data = error?.response?.data;
    if (data instanceof Blob) {
      try {
        const text = await data.text();
        const parsed = JSON.parse(text);
        error.response.data = parsed;
      } catch {
        // blob قابل خواندن نبود
      }
    }

    const extractMessage = () => {
      const d = error?.response?.data;
      if (!d) return null;
      if (typeof d === "string") return d;

      if (Array.isArray(d?.message)) {
        return d.message.filter(Boolean).join("، ");
      }

      return (
        d?.message ||
        d?.error ||
        d?.errors?.[0]?.message ||
        d?.errors?.[0] ||
        null
      );
    };

    const msg =
      extractMessage() ||
      PERSIAN_STATUS[status] ||
      (error?.code === "ERR_NETWORK" ? "خطا در اتصال به سرور" : null) ||
      "خطای نامشخص از سرور";

    // config.silent = true باعث می‌شود toast نمایش داده نشود (مثلاً در فرم لاگین)
    if (!error.config?.silent) {
      toast.error(msg, { autoClose: 4000 });
    }

    // eslint-disable-next-line no-console
    console.error("[API ERROR]", msg, error);

    return Promise.reject(error);
  }
);

export const apiGet = (url, config = {}) => http.get(url, config);
export const apiPost = (url, data = {}, config = {}) =>
  http.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) =>
  http.put(url, data, config);
export const apiPatch = (url, data = {}, config = {}) =>
  http.patch(url, data, config);
export const apiDelete = (url, config = {}) => http.delete(url, config);

export default http;
