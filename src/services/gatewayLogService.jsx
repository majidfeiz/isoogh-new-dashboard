import { apiGet } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const compact = (value = {}) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== "" && item != null));

export async function getBillingGatewayLogs(params = {}, signal) {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 20);
  const response = await apiGet(getApiUrl(API_ROUTES.billing.gatewayLogs), { params: compact(params), signal, silent: true });
  const data = response?.data?.data ?? response?.data ?? {};
  const items = data.items || data.data || [];
  const meta = data.meta || data.pagination || {};
  return {
    items,
    pagination: {
      page: Number(meta.page ?? page),
      limit: Number(meta.limit ?? limit),
      total: Number(meta.total ?? items.length),
      lastPage: Number(meta.lastPage ?? Math.max(1, Math.ceil(Number(meta.total || items.length) / Number(meta.limit || limit)))),
    },
  };
}

