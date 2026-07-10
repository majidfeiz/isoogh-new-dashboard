// src/services/authService.jsx

import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";
import { apiPost, apiGet } from "../helpers/httpClient.jsx";
import { setAuthData, clearAuthData } from "../helpers/authStorage.jsx";

export async function getLoginCaptcha() {
  const url = getApiUrl(API_ROUTES.auth.captcha);
  const response = await apiGet(url, { silent: true });
  return response?.data?.data ?? response?.data ?? { enabled: false };
}

// مرحله اول ورود: ارسال identifier + password، دریافت otpToken
export async function login(identifier, password, rememberMe = false, captcha = null) {
  const url = getApiUrl(API_ROUTES.auth.login);
  const payload = { identifier, password, rememberMe };

  if (captcha?.captchaToken && captcha?.captchaAnswer) {
    payload.captchaToken = captcha.captchaToken;
    payload.captchaAnswer = captcha.captchaAnswer;
  }

  const response = await apiPost(url, payload, { silent: true });
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
