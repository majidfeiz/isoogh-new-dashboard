import React, { StrictMode } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import BillingPaymentCallback from "./BillingPaymentCallback.jsx"
import { savePendingPayment } from "./billingPayment.js"
import { getBillingInvoice, verifyBillingPayment } from "../../services/billingService.jsx"
import { invalidateBillingCache } from "./billingUtils.js"

jest.mock("../../services/billingService.jsx", () => ({ getBillingInvoice: jest.fn(), verifyBillingPayment: jest.fn() }))
jest.mock("./billingUtils.js", () => {
  const actual = jest.requireActual("./billingUtils.js")
  return { ...actual, invalidateBillingCache: jest.fn(), invalidateCapacityReport: jest.fn() }
})

const renderCallback = (url, strict = false) => {
  const page = <MemoryRouter initialEntries={[url]}><BillingPaymentCallback /></MemoryRouter>
  return render(strict ? <StrictMode>{page}</StrictMode> : page)
}

describe("billing payment callback", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorage.clear()
    window.history.replaceState({}, "", "/")
  })

  test("verifies Zarinpal once in StrictMode, never sends reference, invalidates and reloads invoice", async () => {
    savePendingPayment({ invoiceId: 3, schoolId: 145, provider: "zarinpal", authority: "A000" })
    verifyBillingPayment.mockResolvedValue({ invoiceNumber: "INV-3", amount: 200000, reference: "SERVER-REF" })
    getBillingInvoice.mockResolvedValue({ id: "3", invoiceNumber: "INV-3", totalAmount: 200000, paymentReference: "SERVER-REF", status: "paid" })
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    renderCallback("/billing/payment/callback?Authority=A000&Status=OK&reference=CLIENT-REF", true)

    expect(await screen.findByText("پرداخت توسط سرور تأیید شد.")).toBeInTheDocument()
    expect(verifyBillingPayment).toHaveBeenCalledTimes(1)
    expect(verifyBillingPayment).toHaveBeenCalledWith("3", { schoolId: 145, authority: "A000", status: "OK" })
    expect(verifyBillingPayment.mock.calls[0][1]).not.toHaveProperty("reference")
    expect(invalidateBillingCache).toHaveBeenCalledTimes(1)
    expect(getBillingInvoice).toHaveBeenCalledWith("3", 145)
    expect(JSON.stringify(consoleSpy.mock.calls)).not.toContain("A000")
    expect(JSON.stringify(consoleSpy.mock.calls)).not.toContain("CLIENT-REF")
    consoleSpy.mockRestore()
  })

  test("parses Sadad Token and ResCode", async () => {
    savePendingPayment({ invoiceId: 4, schoolId: 145, provider: "sadad", authority: "TOKEN-1" })
    verifyBillingPayment.mockResolvedValue({ reference: "SERVER-2" })
    getBillingInvoice.mockResolvedValue({ id: "4", status: "paid" })
    renderCallback("/billing/payment/callback?Token=TOKEN-1&ResCode=0&OrderId=4")
    await waitFor(() => expect(verifyBillingPayment).toHaveBeenCalledWith("4", { schoolId: 145, authority: "TOKEN-1", status: "0" }))
  })

  test("does not verify without session context", async () => {
    renderCallback("/billing/payment/callback?Authority=A000&Status=OK")
    expect(await screen.findByText("اطلاعات فاکتور برای اعتبارسنجی پرداخت پیدا نشد.")).toBeInTheDocument()
    expect(verifyBillingPayment).not.toHaveBeenCalled()
  })

  test("does not verify canceled callbacks", async () => {
    savePendingPayment({ invoiceId: 3, schoolId: 145, provider: "zarinpal", authority: "A000" })
    renderCallback("/billing/payment/callback?Authority=A000&Status=NOK")
    expect(await screen.findByText("پرداخت لغو شد یا تکمیل نشد.")).toBeInTheDocument()
    expect(verifyBillingPayment).not.toHaveBeenCalled()
  })

  test.each([401, 403, 409, 502])("keeps context and shows a controlled error for verify HTTP %s", async (status) => {
    savePendingPayment({ invoiceId: 3, schoolId: 145, provider: "zarinpal", authority: "A000" })
    verifyBillingPayment.mockRejectedValue({ response: { status } })
    renderCallback("/billing/payment/callback?Authority=A000&Status=OK")
    expect(await screen.findByText("تلاش دوباره")).toBeInTheDocument()
    expect(sessionStorage.length).toBe(1)
  })
})
