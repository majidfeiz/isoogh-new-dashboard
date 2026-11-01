import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx"
import { createBillingInvoice, createManualBillingPayment, downloadBillingInvoice, getBillingInvoice, getBillingInvoices, requestBillingPayment, updateBillingPricing, verifyBillingPayment } from "./billingService.jsx"

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

  test("normalizes adviser snapshot name and line pricing fields in invoice details", async () => {
    apiGet.mockResolvedValue({ data: { data: { id: "4", items: [{ id: "4", adviser_id: "5389", adviser_name_snapshot: "سحر خوشبین", student_count: 183, target_student_capacity: 250, base_unit_amount: "20000000", pricing_snapshot: { extraSteps: 3 }, final_amount: "26000000" }] } } })
    const result = await getBillingInvoice(4, 94)
    expect(result.items[0]).toEqual(expect.objectContaining({ adviserId: "5389", adviserName: "سحر خوشبین", studentCount: 183, targetStudentCapacity: 250, baseAmount: "20000000", calculatedSteps: 3, finalAmount: "26000000" }))
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
})
