import http, { apiDelete, apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";
import { normalizeCatalogList, normalizeSourceDetail } from "../pages/DynamicReports/catalogUtils.js";

const catalogCache = new Map();
const unwrap = (res) => res?.data?.data ?? res?.data;
const normalizeReport = (report) => report ? {
  ...report,
  sourceId: report.sourceId ?? report.source_id,
  lockVersion: report.lockVersion ?? report.lock_version,
  ownerUserId: report.ownerUserId ?? report.owner_user_id,
  schoolId: report.schoolId ?? report.school_id,
  createdAt: report.createdAt ?? report.created_at,
  updatedAt: report.updatedAt ?? report.updated_at,
} : report;
const cached = async (key, loader) => {
  const hit = catalogCache.get(key);
  if (hit && Date.now() - hit.at < 30 * 60 * 1000) return hit.value;
  const value = await loader();
  catalogCache.set(key, { at: Date.now(), value });
  return value;
};

export const getSources = () => cached("sources", async () => normalizeCatalogList(unwrap(await apiGet(getApiUrl(API_ROUTES.dynamicReports.sources)))));
export const getSource = (id) => cached(`source:${id}`, async () => normalizeSourceDetail(unwrap(await apiGet(getApiUrl(API_ROUTES.dynamicReports.source(id))))));
export const getOperators = () => cached("operators", async () => normalizeCatalogList(unwrap(await apiGet(getApiUrl(API_ROUTES.dynamicReports.operators)))));
export const getVisualizations = () => cached("visualizations", async () => normalizeCatalogList(unwrap(await apiGet(getApiUrl(API_ROUTES.dynamicReports.visualizations)))));
export const getForms = async (search = "") => unwrap(await apiGet(getApiUrl(API_ROUTES.dynamicReports.forms), { params: { search: search || undefined } }));
export const getFormQuestions = async (id) => unwrap(await apiGet(getApiUrl(API_ROUTES.dynamicReports.formQuestions(id))));
export const getFieldOptions = async ({ sourceId, fieldId, search = "" }, signal) => unwrap(await apiGet(getApiUrl(API_ROUTES.dynamicReports.fieldOptions), { params: { sourceId, fieldId, search: search || undefined }, signal, silent: true }));

export const getDynamicReports = async (params) => {
  const data = unwrap(await apiGet(getApiUrl(API_ROUTES.dynamicReports.list), { params }));
  const items = data?.items || data?.data || [];
  const meta = data?.pagination || data?.meta || {};
  return { items: items.map(normalizeReport), pagination: { page: meta.page ?? params.page, limit: meta.limit ?? params.limit, total: meta.total ?? items.length, lastPage: meta.lastPage ?? 1 } };
};
export const getDynamicReport = async (id) => normalizeReport(unwrap(await apiGet(getApiUrl(API_ROUTES.dynamicReports.detail(id)))));
export const createDynamicReport = async (payload) => normalizeReport(unwrap(await apiPost(getApiUrl(API_ROUTES.dynamicReports.create), payload)));
export const updateDynamicReport = async (id, payload) => normalizeReport(unwrap(await apiPatch(getApiUrl(API_ROUTES.dynamicReports.update(id)), payload)));
export const deleteDynamicReport = async (id) => unwrap(await apiDelete(getApiUrl(API_ROUTES.dynamicReports.delete(id))));
export const duplicateDynamicReport = async (id) => unwrap(await apiPost(getApiUrl(API_ROUTES.dynamicReports.duplicate(id))));
export const archiveDynamicReport = async (id) => unwrap(await apiPost(getApiUrl(API_ROUTES.dynamicReports.archive(id))));
export const restoreDynamicReport = async (id) => unwrap(await apiPost(getApiUrl(API_ROUTES.dynamicReports.restore(id))));
export const validateDefinition = async (definition, signal) => unwrap(await apiPost(getApiUrl(API_ROUTES.dynamicReports.validate), definition, { signal, silent: true }));
export const estimateDefinition = async (definition, signal) => unwrap(await apiPost(getApiUrl(API_ROUTES.dynamicReports.estimate), definition, { signal, silent: true }));
export const previewDefinition = async (payload, signal) => unwrap(await apiPost(getApiUrl(API_ROUTES.dynamicReports.preview), payload, { signal, silent: true }));
export const executeDynamicReport = async (id, payload = {}) => unwrap(await apiPost(getApiUrl(API_ROUTES.dynamicReports.execute(id)), payload));
export const exportDynamicReport = (id, payload, onDownloadProgress) => http.post(getApiUrl(API_ROUTES.dynamicReports.exports(id)), payload, { responseType: "blob", onDownloadProgress });
