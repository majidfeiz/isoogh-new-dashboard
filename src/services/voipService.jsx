// src/services/voipService.jsx
import { apiGet } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

// لیست تماس‌های خروجی (paginate + search)
export async function getOutboundCallHistories({
  page = 1,
  per_page = 15,
  type = "",
  q = "",
  sortBy = "",
  sortOrder = "",
  start_date = "",
  end_date = "",
} = {}) {
  const url = getApiUrl(API_ROUTES.voip.outboundCallHistories);

  const response = await apiGet(url, {
    params: {
      page,
      per_page,
      type: type || undefined,
      q: q || undefined,
      // API فقط snake_case می‌خواهد
      sort_by: sortBy || undefined,
      sort_order: sortOrder || undefined,
      start_date: start_date || undefined,
      end_date: end_date || undefined,
    },
  });

  // ✅ Nest response:
  // معمولا داده‌ها در data.data قرار می‌گیرند؛ اینجا مقاوم‌سازی شده
  const payload = response.data;
  const wrapped = payload?.data ?? payload ?? {};

  const items = wrapped?.data || wrapped?.items || [];
  const meta = wrapped?.meta || wrapped?.pagination || {};

  return {
    items,
    pagination: {
      page: meta.page ?? page,
      limit: meta.limit ?? meta.per_page ?? per_page,
      total: meta.total ?? items.length,
      lastPage: meta.lastPage ?? meta.last_page ?? 1,
      sortBy: (meta.sort_by ?? sortBy) ?? null,
      sortOrder: (meta.sort_order ?? sortOrder) ?? null,
    },
  };
}

// خروجی CSV برای تماس‌های خروجی
export async function exportOutboundCallHistories({
  page = 1,
  per_page = 15,
  type = "",
  q = "",
  start_date = "",
  end_date = "",
  onDownloadProgress,
} = {}) {
  const url = getApiUrl(API_ROUTES.voip.exportOutboundCallHistories);

  const response = await apiGet(url, {
    responseType: "blob",
    onDownloadProgress,
    params: {
      page,
      per_page,
      type: type || undefined,
      q: q || undefined,
      start_date: start_date || undefined,
      end_date: end_date || undefined,
    },
  });

  return response?.data;
}
