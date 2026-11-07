import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx"
import { billingPreviewQueryKey, createBillingInvoice, createCustomBillingInvoice, createManualBillingPayment, createManualWalletTopup, createWalletAdjustment, downloadBillingInvoice, exportWalletTransactions, getAutoInvoices, getBillingInvoice, getBillingInvoicePreview, getBillingInvoices, getBillingPricingHistory, getBillingWallet, getBillingWallets, getWalletTopups, normalizeInvoiceKpis, payBillingInvoiceFromWallet, previewBillingCapacity, purchaseBillingCapacity, requestBillingPayment, requestWalletTopup, updateBillingPricing, verifyBillingPayment, verifyWalletTopup } from "./billingService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPatch: jest.fn(), apiPost: jest.fn() }))

describe("billing API contract", () => {
  beforeEach(() => jest.clearAllMocks())

  test("passes school, filters and pagination and keeps server KPI authoritative", async () => {
    apiGet.mockResolvedValue({ data: { data: { items: [{ id: 1 }], kpis: { paid: { count: 1, amount: 9000 } }, meta: { page: 2, limit: 20, total: 21, lastPage: 2 } } } })
    const result = await getBillingInvoices({ schoolId: 7, status: "paid", search: "INV", page: 2, limit: 20 })
    expect(apiGet).toHaveBeenCalledWith(expect.stringMatching(/\/billing\/invoices$/), { params: { schoolId: 7, status: "paid", search: "INV", page: 2, limit: 20 } })
    expect(result.kpis.paid).toEqual({ count: 1, amount: 9000 })
    expect(result.pagination).toEqual({ page: 2, limit: 20, total: 21, lastPage: 2 })
  })

  test("normalizes list snake_case and preserves school id for the detail request", async () => {
    apiGet.mockResolvedValue({ data: { data: { items: [{ id: "3", school_id: "145", invoice_number: "ISOOGH-3", issued_at: "2026-10-30", total_amount: "20000000", customer_snapshot: { schoolName: "گروه سلمان" } }], meta: {} } } })
    const result = await getBillingInvoices()
    expect(result.items[0]).toEqual(expect.objectContaining({ schoolId: "145", invoiceNumber: "ISOOGH-3", issuedAt: "2026-10-30", totalAmount: "20000000", schoolName: "گروه سلمان" }))
  })

  test("preserves two invoices for the same adviser and period as independent records", async () => {
    const commonLine = { adviser_id: 5314, period_start: "2026-10-23", period_end: "2026-11-22" }
    apiGet.mockResolvedValue({ data: { data: { items: [
      { id: 101, invoice_number: "INV-101", status: "paid", items: [{ id: 1, ...commonLine }] },
      { id: 102, invoice_number: "INV-102", status: "unpaid", items: [{ id: 2, ...commonLine }] },
    ], meta: { total: 2 } } } })
    const result = await getBillingInvoices()
    expect(result.items).toHaveLength(2)
    expect(result.items.map(({ id, invoiceNumber, status }) => ({ id, invoiceNumber, status }))).toEqual([
      { id: 101, invoiceNumber: "INV-101", status: "paid" },
      { id: 102, invoiceNumber: "INV-102", status: "unpaid" },
    ])
  })

  test("normalizes stats and by-status response variants", () => {
    expect(normalizeInvoiceKpis({ stats: { paid: { invoiceCount: "2", total_amount: "52000" }, overdue: { count: 1, amount: 9000 } } })).toEqual(expect.objectContaining({ paid: { count: 2, amount: 52000 }, expired: { count: 1, amount: 9000 } }))
    expect(normalizeInvoiceKpis({ byStatus: [{ status: "unpaid", count: "3", totalAmount: "12000" }] })).toEqual(expect.objectContaining({ unpaid: { count: 3, amount: 12000 } }))
  })

  test("derives exact KPI values when the complete invoice result is already loaded", () => {
    const items = [{ status: "paid", totalAmount: 26000000 }, { status: "paid", totalAmount: 26000000 }, { status: "unpaid", totalAmount: 4110000 }, { status: "unpaid", totalAmount: 26000000 }]
    expect(normalizeInvoiceKpis({}, items, { total: 4 })).toEqual({ unpaid: { count: 2, amount: 30110000 }, paid: { count: 2, amount: 52000000 }, expired: { count: 0, amount: 0 } })
  })

  test("does not show a false zero when the backend omits stats from a partial page", () => {
    expect(normalizeInvoiceKpis({}, [{ status: "paid", totalAmount: 10 }], { total: 20 })).toEqual({})
  })

  test("normalizes adviser snapshot name and line pricing fields in invoice details", async () => {
    apiGet.mockResolvedValue({ data: { data: { id: "4", items: [{ id: "4", adviser_id: "5389", adviser_name_snapshot: "سحر خوشبین", student_count: 183, target_student_capacity: 250, base_unit_amount: "20000000", pricing_snapshot: { extraSteps: 3 }, final_amount: "26000000" }] } } })
    const result = await getBillingInvoice(4, 94)
    expect(result.items[0]).toEqual(expect.objectContaining({ adviserId: "5389", adviserName: "سحر خوشبین", studentCount: 183, targetStudentCapacity: 250, baseAmount: "20000000", calculatedSteps: 3, finalAmount: "26000000" }))
  })

  test("requests the server-authoritative Jalali period preview with an abort signal", async () => {
    const controller = new AbortController()
    const preview = { period: { jalaliLabel: "مهر ۱۴۰۵" }, advisers: [] }
    apiGet.mockResolvedValue({ data: { data: preview } })
    await expect(getBillingInvoicePreview({ schoolId: 94, jalaliYear: 1405, jalaliMonth: 8, durationMonths: 3, adviserId: 12, signal: controller.signal })).resolves.toBe(preview)
    expect(apiGet).toHaveBeenCalledWith(expect.stringMatching(/\/billing\/invoices\/preview$/), { params: { schoolId: 94, jalaliYear: 1405, jalaliMonth: 8, durationMonths: 3, adviserId: 12 }, signal: controller.signal, silent: true })
    expect(billingPreviewQueryKey({ schoolId: 94, jalaliYear: 1405, jalaliMonth: 8, durationMonths: 3, adviserId: 12 })).toEqual(["billing", "invoice-preview", 94, 1405, 8, 3, 12])
  })

  test.each([1, 3])("creates a %s month invoice without changing snapshot", async (durationMonths) => {
    const payload = { schoolId: 7, durationMonths, customerType: "individual", customerSnapshot: { fullName: "کاربر", nationalId: "001" } }
    apiPost.mockResolvedValue({ data: { data: { id: 10 } } })
    await createBillingInvoice(payload)
    expect(apiPost).toHaveBeenCalledWith(expect.stringMatching(/\/billing\/invoices$/), payload)
  })

  test("creates adviser capacity targets in the new payload", async () => {
    const payload = { schoolId: 145, durationMonths: 1, customerType: "individual", customerSnapshot: { fullName: "کاربر", nationalId: "001" }, advisers: [{ adviserId: 9, targetStudentCapacity: 250 }] }
    apiPost.mockResolvedValue({ data: { data: { id: 11 } } })
    await createBillingInvoice(payload)
    expect(apiPost).toHaveBeenCalledWith(expect.stringMatching(/\/billing\/invoices$/), payload)
  })

  test("preserves admin manual line amount, invoice discount and trimmed audit note payload", async () => {
    const payload = { schoolId: 145, durationMonths: 3, customerType: "legal", customerSnapshot: { companyName: "شرکت", nationalCode: "101" }, advisers: [{ adviserId: 9, targetStudentCapacity: 250, manualFinalAmount: 50000000 }], discountAmount: 1000000, adjustmentNote: "توافق مدیریت" }
    apiPost.mockResolvedValue({ data: { data: { id: 12 } } })
    await createBillingInvoice(payload)
    expect(apiPost).toHaveBeenCalledWith(expect.stringMatching(/\/billing\/invoices$/), payload)
  })

  test("downloads raw blob and honors UTF-8 filename", async () => {
    const blob = new Blob(["<html></html>"], { type: "text/html" })
    apiGet.mockResolvedValue({ data: blob, headers: { "content-disposition": "attachment; filename*=UTF-8''%D9%81%D8%A7%DA%A9%D8%AA%D9%88%D8%B1.html" } })
    await expect(downloadBillingInvoice(10, 7)).resolves.toEqual({ blob, filename: "فاکتور.html" })
    expect(apiGet).toHaveBeenCalledWith(expect.stringMatching(/\/billing\/invoices\/10\/download$/), { params: { schoolId: 7 }, responseType: "blob" })
  })

  test("targets payment and download operations by each invoice id independently", async () => {
    apiPost.mockResolvedValue({ data: { data: { status: "paid" } } })
    apiGet.mockResolvedValue({ data: new Blob(["invoice"]), headers: {} })
    await payBillingInvoiceFromWallet(101, 94)
    await payBillingInvoiceFromWallet(102, 94)
    await downloadBillingInvoice(101, 94)
    await downloadBillingInvoice(102, 94)
    expect(apiPost.mock.calls.map(([url]) => url)).toEqual([
      expect.stringMatching(/\/billing\/invoices\/101\/payments\/wallet$/),
      expect.stringMatching(/\/billing\/invoices\/102\/payments\/wallet$/),
    ])
    expect(apiGet.mock.calls.map(([url]) => url)).toEqual([
      expect.stringMatching(/\/billing\/invoices\/101\/download$/),
      expect.stringMatching(/\/billing\/invoices\/102\/download$/),
    ])
  })

  test("sends manual payment fields only to its dedicated endpoint", async () => {
    apiPost.mockResolvedValue({ data: { data: { id: 2 } } })
    await createManualBillingPayment(10, { schoolId: 7, reference: "ref", note: "note" })
    expect(apiPost).toHaveBeenCalledWith(expect.stringMatching(/\/billing\/invoices\/10\/payments\/manual$/), { schoolId: 7, reference: "ref", note: "note" })
  })

  test("keeps request and verification as separate server flows", async () => {
    apiPost.mockResolvedValueOnce({ data: { data: { paymentUrl: "https://gateway.test", authority: "secret" } } }).mockResolvedValueOnce({ data: { data: { status: "paid" } } })
    await requestBillingPayment(10, 7)
    await verifyBillingPayment(10, { schoolId: 7, authority: "secret", status: "OK", reference: "must-not-be-sent" })
    expect(apiPost.mock.calls[0][0]).toMatch(/payments\/request$/)
    expect(apiPost.mock.calls[1]).toEqual([expect.stringMatching(/payments\/verify$/), { schoolId: 7, authority: "secret", status: "OK" }])
  })

  test("submits pricing as API rial fields", async () => {
    apiPatch.mockResolvedValue({ data: { data: {} } })
    const payload = { baseMonthlyAmount: 100000, includedStudents: 200, extraStudentStep: 5, extraStepPercent: 10, capacityStepPercent: 20, capacityStepAmount: 50000 }
    await updateBillingPricing(payload)
    expect(apiPatch).toHaveBeenCalledWith(expect.stringMatching(/\/billing\/pricing$/), payload)
  })

  test("uses school-scoped wallet routes and keeps backend balances authoritative", async () => {
    apiGet.mockResolvedValue({ data: { data: { wallet: { balance: -100, isNegative: true }, transactions: [{ id: 1, balanceAfter: -100 }], meta: { page: 1, limit: 20, total: 1, lastPage: 1 } } } })
    const result = await getBillingWallet({ schoolId: 94, page: 1, limit: 20 })
    expect(apiGet).toHaveBeenCalledWith(expect.stringMatching(/\/billing\/wallet$/), expect.objectContaining({ params: { schoolId: 94, page: 1, limit: 20 } }))
    expect(result.wallet.balance).toBe(-100)
    expect(result.transactions[0].balanceAfter).toBe(-100)
  })

  test("supports wallet topup, verify, manual adjustment and invoice wallet payment contracts", async () => {
    apiPost.mockResolvedValueOnce({ data: { data: { topupId: 73, paymentType: "wallet_topup", verifyPath: "/billing/wallet/topups/73/verify", provider: "zarinpal", authority: "A1", paymentUrl: "https://gateway.test", amount: 5000000 } } }).mockResolvedValue({ data: { data: { ok: true } } })
    const topup = await requestWalletTopup({ schoolId: 94, amount: 5000000 })
    await verifyWalletTopup(8, { schoolId: 94, authority: "A1", status: "OK" })
    await createManualWalletTopup({ schoolId: 94, amount: 5000000, reference: "R1", note: "manual" })
    await payBillingInvoiceFromWallet(3, 94)
    expect(apiPost.mock.calls[0]).toEqual([expect.stringMatching(/wallet\/topups\/request$/), { schoolId: 94, amount: 5000000 }])
    expect(topup).toEqual(expect.objectContaining({ topupId: 73, paymentType: "wallet_topup", verifyPath: "/billing/wallet/topups/73/verify" }))
    expect(apiPost.mock.calls[1]).toEqual([expect.stringMatching(/wallet\/topups\/8\/verify$/), { schoolId: 94, authority: "A1", status: "OK" }])
    expect(apiPost.mock.calls[2]).toEqual([expect.stringMatching(/wallet\/topups\/manual$/), { schoolId: 94, amount: 5000000, reference: "R1", note: "manual" }])
    expect(apiPost.mock.calls[3]).toEqual([expect.stringMatching(/invoices\/3\/payments\/wallet$/), { schoolId: 94 }])
  })

  test("supports custom, automatic and capacity purchase routes", async () => {
    apiPost.mockResolvedValue({ data: { data: {} } }); apiGet.mockResolvedValue({ data: { data: [] } })
    const custom = { schoolId: 94, items: [{ description: "خدمت", quantity: 2, unitAmount: 500000 }] }
    await createCustomBillingInvoice(custom); await getAutoInvoices(94); await purchaseBillingCapacity({ schoolId: 94, adviserId: 5, targetStudentCapacity: 240, idempotencyKey: "uuid-1" })
    expect(apiPost.mock.calls[0]).toEqual([expect.stringMatching(/invoices\/custom$/), custom])
    expect(apiGet).toHaveBeenCalledWith(expect.stringMatching(/auto-invoices$/), { params: { schoolId: 94 } })
    expect(apiPost.mock.calls[1]).toEqual([expect.stringMatching(/capacity\/purchase$/), { schoolId: 94, adviserId: 5, targetStudentCapacity: 240, idempotencyKey: "uuid-1" }])
  })

  test("supports wallet administration, topup history, export and accounting adjustments", async () => {
    apiGet.mockResolvedValue({ data: { data: { items: [], meta: {} } }, headers: {} })
    apiPost.mockResolvedValue({ data: { data: { id: 1 } } })
    await getBillingWallets({ schoolId: 94, page: 1, limit: 20 })
    await getWalletTopups({ schoolId: 94, status: "failed", page: 2, limit: 20 })
    await createWalletAdjustment({ schoolId: 94, type: "deposit", amount: 500, reference: "R", reason: "اصلاح" })
    apiGet.mockResolvedValueOnce({ data: new Blob(["csv"]), headers: { "content-disposition": "attachment; filename=wallet.csv" } })
    await expect(exportWalletTransactions(94)).resolves.toEqual(expect.objectContaining({ filename: "wallet.csv" }))
    expect(apiPost).toHaveBeenCalledWith(expect.stringMatching(/wallet\/adjustments$/), { schoolId: 94, type: "deposit", amount: 500, reference: "R", reason: "اصلاح" })
  })

  test("previews capacity and sends a stable idempotency key to purchase", async () => {
    apiPost.mockResolvedValue({ data: { data: { totalAmount: 1000 } } })
    const payload = { schoolId: 94, adviserId: 5, targetStudentCapacity: 240 }
    await previewBillingCapacity(payload)
    await purchaseBillingCapacity({ ...payload, idempotencyKey: "fixed-uuid" })
    expect(apiPost.mock.calls[0]).toEqual([expect.stringMatching(/capacity\/preview$/), payload])
    expect(apiPost.mock.calls[1]).toEqual([expect.stringMatching(/capacity\/purchase$/), { ...payload, idempotencyKey: "fixed-uuid" }])
  })

  test("loads immutable pricing history", async () => {
    apiGet.mockResolvedValue({ data: { data: [{ id: 1, is_active: true }] } })
    await expect(getBillingPricingHistory()).resolves.toEqual([{ id: 1, is_active: true }])
    expect(apiGet).toHaveBeenCalledWith(expect.stringMatching(/billing\/pricing\/history$/))
  })
})
