import { apiGet, apiPost, apiPatch } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const unwrap = (response) => response?.data?.data ?? response?.data;

const schoolParams = (schoolId) => ({ schoolId: schoolId || undefined });

const normalizePayment = (payment = {}) => ({
  ...payment,
  createdAt: payment.createdAt ?? payment.created_at,
  note: payment.note ?? payment.description,
});

const normalizeInvoiceLine = (line = {}) => ({
  ...line,
  description: line.description ?? line.title,
  quantity: line.quantity == null ? undefined : Number(line.quantity),
  unitAmount: line.unitAmount ?? line.unit_amount,
  adviserId: line.adviserId ?? line.adviser_id,
  adviserName: line.adviserName ?? line.adviser_name ?? line.adviser_name_snapshot,
  studentCount: line.studentCount ?? line.student_count,
  targetStudentCapacity: line.targetStudentCapacity ?? line.target_student_capacity,
  durationMonths: line.durationMonths ?? line.duration_months,
  periodStart: line.periodStart ?? line.period_start,
  periodEnd: line.periodEnd ?? line.period_end,
  baseAmount: line.baseAmount ?? line.base_amount ?? line.base_unit_amount,
  discountAmount: line.discountAmount ?? line.discount_amount,
  pricingSnapshot: line.pricingSnapshot ?? line.pricing_snapshot,
  finalAmount: line.finalAmount ?? line.final_amount,
  calculatedFinalAmount: line.calculatedFinalAmount ?? line.calculated_final_amount,
  manualFinalAmount: line.manualFinalAmount ?? line.manual_final_amount,
  calculatedSteps: line.calculatedSteps ?? line.calculated_steps ?? line.capacity_steps ?? line.pricingSnapshot?.extraSteps ?? line.pricing_snapshot?.extraSteps ?? line.pricing_snapshot?.extra_steps,
});

export const normalizeBillingInvoice = (invoice = {}) => ({
  ...invoice,
  invoiceNumber: invoice.invoiceNumber ?? invoice.invoice_number,
  type: invoice.type ?? invoice.invoiceType ?? invoice.invoice_type,
  schoolId: invoice.schoolId ?? invoice.school_id,
  schoolName: invoice.schoolName ?? invoice.school_name ?? invoice.customer_snapshot?.schoolName,
  customerType: invoice.customerType ?? invoice.customer_type,
  customerSnapshot: invoice.customerSnapshot ?? invoice.customer_snapshot,
  issuedAt: invoice.issuedAt ?? invoice.issued_at,
  dueAt: invoice.dueAt ?? invoice.due_at,
  subtotalAmount: invoice.subtotalAmount ?? invoice.subtotal_amount,
  discountAmount: invoice.discountAmount ?? invoice.discount_amount,
  totalAmount: invoice.totalAmount ?? invoice.total_amount,
  paymentReference: invoice.paymentReference ?? invoice.payment_reference,
  paidAt: invoice.paidAt ?? invoice.paid_at,
  adjustmentNote: invoice.adjustmentNote ?? invoice.adjustment_note,
  adjustedBy: invoice.adjustedBy ?? invoice.adjusted_by ?? invoice.adjustment_user,
  items: (invoice.items || invoice.lines || []).map(normalizeInvoiceLine),
  payments: (invoice.payments || []).map(normalizePayment),
});

const INVOICE_KPI_STATUSES = ["unpaid", "paid", "expired"];
const KPI_STATUS_ALIASES = { overdue: "expired", overdue_invoice: "expired" };
const numeric = (value) => value == null || value === "" ? undefined : Number(value);

export function normalizeInvoiceKpis(data = {}, items = [], meta = {}) {
  const source = data.kpis ?? data.stats ?? data.statistics ?? data.summary ?? data.byStatus ?? data.by_status;
  const normalized = {};
  const setKpi = (rawStatus, value = {}) => {
    const status = KPI_STATUS_ALIASES[rawStatus] || rawStatus;
    if (!INVOICE_KPI_STATUSES.includes(status)) return;
    const entry = typeof value === "number" || typeof value === "string" ? { count: value } : value || {};
    normalized[status] = {
      count: numeric(entry.count ?? entry.total ?? entry.invoiceCount ?? entry.invoice_count),
      amount: numeric(entry.amount ?? entry.totalAmount ?? entry.total_amount ?? entry.sum),
    };
  };

  if (Array.isArray(source)) source.forEach((entry) => setKpi(entry.status ?? entry.key ?? entry.name, entry));
  else if (source && typeof source === "object") {
    INVOICE_KPI_STATUSES.forEach((status) => setKpi(status, source[status]));
    setKpi("overdue", source.overdue);
  }

  INVOICE_KPI_STATUSES.forEach((status) => {
    const capitalized = `${status[0].toUpperCase()}${status.slice(1)}`;
    const count = data[`${status}Count`] ?? data[`${status}_count`] ?? source?.[`${status}Count`] ?? source?.[`${status}_count`] ?? source?.counts?.[status];
    const amount = data[`${status}Amount`] ?? data[`${status}_amount`] ?? data[`total${capitalized}Amount`] ?? source?.[`${status}Amount`] ?? source?.[`${status}_amount`] ?? source?.amounts?.[status];
    if (count != null || amount != null) normalized[status] = { count: numeric(count), amount: numeric(amount) };
  });

  const hasServerStats = Object.values(normalized).some((entry) => entry.count != null || entry.amount != null);
  const allRowsLoaded = Number(meta.total ?? items.length) <= items.length;
  if (!hasServerStats && allRowsLoaded) {
    INVOICE_KPI_STATUSES.forEach((status) => {
      const rows = items.filter((invoice) => (KPI_STATUS_ALIASES[invoice.status] || invoice.status) === status);
      normalized[status] = { count: rows.length, amount: rows.reduce((sum, invoice) => sum + Number(invoice.totalAmount ?? invoice.finalAmount ?? 0), 0) };
    });
  }
  return normalized;
}

export async function getBillingInvoices(params = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.billing.invoices), {
    params: {
      schoolId: params.schoolId || undefined,
      status: params.status || undefined,
      search: params.search || undefined,
      page: params.page || 1,
      limit: params.limit || 10,
    },
  });
  const data = unwrap(response) || {};
  const items = (data.items || data.data || []).map(normalizeBillingInvoice);
  const meta = data.meta || data.pagination || {};
  return {
    items,
    kpis: normalizeInvoiceKpis(data, items, meta),
    pagination: {
      page: meta.page ?? params.page ?? 1,
      limit: meta.limit ?? params.limit ?? 10,
      total: meta.total ?? items.length,
      lastPage: meta.lastPage ?? Math.max(1, Math.ceil((meta.total || items.length) / (meta.limit || params.limit || 10))),
    },
  };
}

export async function getBillingInvoice(id, schoolId) {
  const response = await apiGet(getApiUrl(API_ROUTES.billing.invoice(id)), { params: schoolParams(schoolId) });
  return normalizeBillingInvoice(unwrap(response));
}

export const billingPreviewQueryKey = ({ schoolId, jalaliYear, jalaliMonth, durationMonths, adviserId } = {}) => [
  "billing", "invoice-preview", Number(schoolId), Number(jalaliYear), Number(jalaliMonth), Number(durationMonths), adviserId == null || adviserId === "" ? null : Number(adviserId),
];

export async function getBillingInvoicePreview({ schoolId, jalaliYear, jalaliMonth, durationMonths, adviserId, signal } = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.billing.invoicePreview), {
    params: {
      schoolId: Number(schoolId),
      jalaliYear: Number(jalaliYear),
      jalaliMonth: Number(jalaliMonth),
      durationMonths: Number(durationMonths),
      adviserId: adviserId == null || adviserId === "" ? undefined : Number(adviserId),
    },
    signal,
    silent: true,
  });
  const data = unwrap(response);
  if (!data?.period || !Array.isArray(data?.advisers)) throw new Error("Invalid billing preview response");
  return data;
}

const filenameFromDisposition = (value, fallback) => {
  const utf = value?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plain = value?.match(/filename="?([^";]+)"?/i)?.[1];
  try { return decodeURIComponent(utf || plain || fallback); } catch { return fallback; }
};

export async function downloadBillingInvoice(id, schoolId) {
  const response = await apiGet(getApiUrl(API_ROUTES.billing.downloadInvoice(id)), {
    params: schoolParams(schoolId),
    responseType: "blob",
  });
  return {
    blob: response.data,
    filename: filenameFromDisposition(response.headers?.["content-disposition"], `invoice-${id}.html`),
  };
}

export const createBillingInvoice = async (payload) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.invoices), payload));
export const createCustomBillingInvoice = async (payload) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.customInvoice), payload));
export const getBillingPricing = async () => unwrap(await apiGet(getApiUrl(API_ROUTES.billing.pricing)));
export const updateBillingPricing = async (payload) => unwrap(await apiPatch(getApiUrl(API_ROUTES.billing.pricing), payload));
export const requestBillingPayment = async (id, schoolId) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.requestPayment(id)), { schoolId }));
export const createManualBillingPayment = async (id, payload) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.manualPayment(id)), payload));
export const verifyBillingPayment = async (id, payload) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.verifyPayment(id)), {
  schoolId: Number(payload.schoolId),
  authority: payload.authority,
  status: payload.status,
}));
export const getBillingWallet = async ({ schoolId, page = 1, limit = 20, signal } = {}) => {
  const data = unwrap(await apiGet(getApiUrl(API_ROUTES.billing.wallet), { params: { schoolId: Number(schoolId), page, limit }, signal, silent: true })) || {};
  const transactions = data.transactions || data.items || [];
  const meta = data.meta || data.pagination || {};
  return { wallet: data.wallet || {}, transactions, pagination: { page: Number(meta.page ?? page), limit: Number(meta.limit ?? limit), total: Number(meta.total ?? transactions.length), lastPage: Number(meta.lastPage ?? Math.max(1, Math.ceil(Number(meta.total || transactions.length) / Number(meta.limit || limit)))) } };
};
/** @typedef {{topupId:number, paymentType:'wallet_topup', verifyPath:string, provider:'zarinpal'|'sadad'|string, authority:string, paymentUrl:string, amount:number}} WalletTopupRequestResult */
/** @returns {Promise<WalletTopupRequestResult>} */
export const requestWalletTopup = async (payload) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.walletTopupRequest), { schoolId: Number(payload.schoolId), amount: Number(payload.amount) }));
/** Wallet topup verification is intentionally separate from invoice payment verification. */
export const verifyWalletTopup = async (topupId, payload) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.walletTopupVerify(topupId)), { schoolId: Number(payload.schoolId), authority: payload.authority, status: payload.status }));
export const createManualWalletTopup = async (payload) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.walletTopupManual), { schoolId: Number(payload.schoolId), amount: Number(payload.amount), reference: payload.reference, note: payload.note }));
export const payBillingInvoiceFromWallet = async (id, schoolId) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.walletPayment(id)), { schoolId: Number(schoolId) }));
export const getAutoInvoices = async (schoolId) => unwrap(await apiGet(getApiUrl(API_ROUTES.billing.autoInvoices), { params: { schoolId: Number(schoolId) } }));
export const createAutoInvoice = async (payload) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.autoInvoices), payload));
export const updateAutoInvoice = async (id, payload) => unwrap(await apiPatch(getApiUrl(API_ROUTES.billing.autoInvoice(id)), payload));
export const executeAutoInvoices = async () => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.executeAutoInvoices)));
export const purchaseBillingCapacity = async (payload) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.capacityPurchase), { schoolId: Number(payload.schoolId), adviserId: Number(payload.adviserId), targetStudentCapacity: Number(payload.targetStudentCapacity) }));
export const executeBillingReminders = async () => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.executeReminders)));
export const executeBillingRestrictions = async () => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.executeRestrictions)));

