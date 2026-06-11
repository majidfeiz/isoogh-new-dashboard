import { apiGet, apiPatch } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

export async function getProfile() {
  const res = await apiGet(getApiUrl(API_ROUTES.profile.me));
  return res?.data?.data ?? null;
}

export async function updateProfile(data) {
  const res = await apiPatch(getApiUrl(API_ROUTES.profile.update), data);
  return res?.data?.data ?? null;
}

export async function changePassword({ current_password, new_password }) {
  const res = await apiPatch(getApiUrl(API_ROUTES.profile.changePassword), {
    current_password,
    new_password,
  });
  return res?.data ?? null;
}
