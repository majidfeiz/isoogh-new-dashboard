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
  adviserId: line.adviserId ?? line.adviser_id,
  adviserName: line.adviserName ?? line.adviser_name ?? line.adviser_name_snapshot,
  studentCount: line.studentCount ?? line.student_count,
  targetStudentCapacity: line.targetStudentCapacity ?? line.target_student_capacity,
  durationMonths: line.durationMonths ?? line.duration_months,
  periodStart: line.periodStart ?? line.period_start,
  periodEnd: line.periodEnd ?? line.period_end,
  baseAmount: line.baseAmount ?? line.base_amount ?? line.base_unit_amount,
  pricingSnapshot: line.pricingSnapshot ?? line.pricing_snapshot,
  finalAmount: line.finalAmount ?? line.final_amount,
  calculatedFinalAmount: line.calculatedFinalAmount ?? line.calculated_final_amount,
  manualFinalAmount: line.manualFinalAmount ?? line.manual_final_amount,
  calculatedSteps: line.calculatedSteps ?? line.calculated_steps ?? line.capacity_steps ?? line.pricingSnapshot?.extraSteps ?? line.pricing_snapshot?.extraSteps ?? line.pricing_snapshot?.extra_steps,
});

export const normalizeBillingInvoice = (invoice = {}) => ({
  ...invoice,
  invoiceNumber: invoice.invoiceNumber ?? invoice.invoice_number,
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
    kpis: data.kpis || data.summary || {},
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
export const getBillingPricing = async () => unwrap(await apiGet(getApiUrl(API_ROUTES.billing.pricing)));
export const updateBillingPricing = async (payload) => unwrap(await apiPatch(getApiUrl(API_ROUTES.billing.pricing), payload));
export const requestBillingPayment = async (id, schoolId) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.requestPayment(id)), { schoolId }));
export const createManualBillingPayment = async (id, payload) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.manualPayment(id)), payload));
export const verifyBillingPayment = async (id, payload) => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.verifyPayment(id)), {
  schoolId: Number(payload.schoolId),
  authority: payload.authority,
  status: payload.status,
}));
export const executeBillingReminders = async () => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.executeReminders)));
export const executeBillingRestrictions = async () => unwrap(await apiPost(getApiUrl(API_ROUTES.billing.executeRestrictions)));

