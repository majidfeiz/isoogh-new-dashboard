// src/services/userSwitchService.jsx

import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";
import { apiPost } from "../helpers/httpClient.jsx";

export async function switchToUser(userId) {
  const url = getApiUrl(API_ROUTES.userSwitch.switch);
  const response = await apiPost(url, { user_id: userId });
  return response?.data?.data ?? response?.data;
}

export async function switchBack(callbackToken) {
  const url = getApiUrl(API_ROUTES.userSwitch.callback);
  const response = await apiPost(url, { callback_token: callbackToken });
  return response?.data?.data ?? response?.data;
}
