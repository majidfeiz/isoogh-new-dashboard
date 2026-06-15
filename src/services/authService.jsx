// src/services/authService.jsx

import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";
import { apiPost, apiGet } from "../helpers/httpClient.jsx";
import { setAuthData, clearAuthData } from "../helpers/authStorage.jsx";

// مرحله اول ورود: ارسال identifier + password، دریافت otpToken
export async function login(identifier, password, rememberMe = false) {
  const url = getApiUrl(API_ROUTES.auth.login);
  const response = await apiPost(url, { identifier, password, rememberMe }, { silent: true });
  // response: { data: { otpToken, maskedPhone, expiresIn, resendAfter } }
  return response?.data?.data;
}

// مرحله دوم ورود: ارسال otpToken + کد OTP، دریافت JWT
export async function verifyOtp(otpToken, code, rememberMe = false) {
  const url = getApiUrl(API_ROUTES.auth.verifyOtp);
  const response = await apiPost(url, { otpToken, code, rememberMe }, { silent: true });
  const { accessToken, user } = response?.data?.data;
  setAuthData({ accessToken, user, rememberMe });
  return { accessToken, user };
}

export async function getMe() {
  const url = getApiUrl(API_ROUTES.auth.me);
  const response = await apiGet(url);
  return response?.data?.data ?? response?.data ?? null;
}

export async function logoutApi() {
  const url = getApiUrl(API_ROUTES.auth.logout);
  try {
    await apiPost(url, {});
  } finally {
    clearAuthData();
  }
}

export function logout() {
  clearAuthData();
}
