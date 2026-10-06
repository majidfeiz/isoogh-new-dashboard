import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const unwrap = (response) => response?.data?.data ?? response?.data;
const cleanParams = (params) => Object.fromEntries(
  Object.entries(params || {}).filter(([, value]) => value !== "" && value != null)
);

export async function getTickets(params = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.tickets.list), { params: cleanParams(params) });
  const data = unwrap(response) || {};
  const items = data.items || [];
  const meta = data.meta || {};
  return {
    items,
    meta: {
      page: Number(meta.page ?? params.page ?? 1),
      limit: Number(meta.limit ?? params.limit ?? 10),
      total: Number(meta.total ?? items.length),
      lastPage: Number(meta.lastPage ?? 1),
    },
  };
}

export async function getTicket(id, schoolId) {
  return unwrap(await apiGet(getApiUrl(API_ROUTES.tickets.detail(id)), { params: { schoolId } }));
}

export async function createTicket(payload) {
  return unwrap(await apiPost(getApiUrl(API_ROUTES.tickets.create), payload));
}

export async function replyToTicket(id, payload) {
  return unwrap(await apiPost(getApiUrl(API_ROUTES.tickets.messages(id)), payload));
}

export async function uploadTicketAttachment(id, schoolId, file, messageId) {
  const body = new FormData();
  body.append("schoolId", schoolId);
  body.append("file", file);
  if (messageId) body.append("messageId", messageId);
  return unwrap(await apiPost(getApiUrl(API_ROUTES.tickets.upload(id)), body, {
    headers: { "Content-Type": "multipart/form-data" },
  }));
}

const filenameFromDisposition = (value) => {
  const utf = value?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plain = value?.match(/filename="?([^";]+)"?/i)?.[1];
  try { return decodeURIComponent(utf || plain || ""); } catch { return plain || ""; }
};

export async function downloadTicketAttachment(attachmentId, schoolId, fallbackName = "attachment") {
  const response = await apiGet(getApiUrl(API_ROUTES.tickets.download(attachmentId)), {
    params: { schoolId }, responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filenameFromDisposition(response.headers?.["content-disposition"]) || fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function updateTicketStatus(id, schoolId, status) {
  return unwrap(await apiPatch(getApiUrl(API_ROUTES.tickets.status(id)), { schoolId, status }));
}

export async function classifyTicket(id, schoolId, type, valueId) {
  const route = type === "category" ? API_ROUTES.tickets.category(id) : API_ROUTES.tickets.result(id);
  return unwrap(await apiPatch(getApiUrl(route), { schoolId, valueId }));
}

export async function getTicketTaxonomy(type) {
  const route = type === "categories" ? API_ROUTES.tickets.categories : API_ROUTES.tickets.results;
  const data = unwrap(await apiGet(getApiUrl(route)));
  return Array.isArray(data) ? data : data?.items || [];
}

export async function createTicketTaxonomy(type, name) {
  const route = type === "categories" ? API_ROUTES.tickets.categories : API_ROUTES.tickets.results;
  return unwrap(await apiPost(getApiUrl(route), { name: name.trim() }));
}

export async function getTicketDashboard(params = {}) {
  return unwrap(await apiGet(getApiUrl(API_ROUTES.tickets.dashboard), { params: cleanParams(params) }));
}
