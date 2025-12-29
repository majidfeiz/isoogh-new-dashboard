// src/services/voipService.jsx
import { apiGet } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

// لیست تماس‌های خروجی (paginate + search)
export async function getOutboundCallHistories({
  page = 1,
  per_page = 15,
  type = "",
  q = "",
} = {}) {
  const url = getApiUrl(API_ROUTES.voip.outboundCallHistories);

  const response = await apiGet(url, {
    params: {
      page,
      per_page,
      type: type || undefined,
      q: q || undefined,
    },
  });

  // ✅ Nest response:
  // response.data.data.data = items[]
  // response.data.data.meta = pagination
  const payload = response.data;
  const wrapped = payload?.data || {};

  const items = wrapped?.data || [];
  const meta = wrapped?.meta || {};

  return {
    items,
    pagination: {
      page: meta.page ?? page,
      limit: meta.per_page ?? per_page,
      total: meta.total ?? items.length,
      lastPage: meta.last_page ?? 1,
    },
  };
}
