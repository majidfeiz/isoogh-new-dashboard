import { billingErrorMessage, calculateCapacitySteps, hasBillingRole, invalidateBillingCache, moneyDisplay, subscribeBillingCache, tomanToRial, validateInvoiceAdjustment } from "./billingUtils.js"

describe("billing UI rules", () => {
  test("allows only declared billing roles", () => {
    expect(hasBillingRole({ roles: [{ name: "manager" }] })).toBe(true)
    expect(hasBillingRole({ roles: ["student"] })).toBe(false)
  })

  test("maps security, conflict and business errors to Persian", () => {
    expect(billingErrorMessage({ response: { status: 401 } })).toMatch(/وارد شوید/)
    expect(billingErrorMessage({ response: { status: 403 } })).toBe("خارج از دامنه دسترسی")
    expect(billingErrorMessage({ response: { status: 409 } })).toMatch(/تکراری/)
    expect(billingErrorMessage({ response: { status: 400, data: { message: "قبل از روز ۲۵ مجاز نیست" } } })).toBe("قبل از روز ۲۵ مجاز نیست")
    expect(billingErrorMessage({ response: { status: 502 } })).toMatch(/درگاه پرداخت/)
  })

  test("converts display toman to rial only at submit boundary", () => {
    expect(tomanToRial("12,500")).toBe(125000)
    expect(moneyDisplay(125000)).toContain("ریال")
    expect(moneyDisplay(125000)).toContain("تومان")
  })

  test("previews capacity steps without treating it as a final amount", () => {
    expect(calculateCapacitySteps(250, 200, 20)).toBe(2)
    expect(calculateCapacitySteps(200, 200, 20)).toBe(0)
  })

  test("requires an audit reason and rejects discount equal to or above subtotal", () => {
    expect(validateInvoiceAdjustment({ subtotal: 26000000, discountAmount: 26000000, hasManualAmount: false, adjustmentNote: "دلیل" }).discountValid).toBe(false)
    expect(validateInvoiceAdjustment({ subtotal: 26000000, discountAmount: 27000000, hasManualAmount: false, adjustmentNote: "دلیل" }).discountValid).toBe(false)
    expect(validateInvoiceAdjustment({ subtotal: 26000000, discountAmount: 1000000, hasManualAmount: false, adjustmentNote: "  " }).reasonValid).toBe(false)
    expect(validateInvoiceAdjustment({ subtotal: 26000000, discountAmount: 0, hasManualAmount: true, adjustmentNote: "توافق مدیریت" }).reasonValid).toBe(true)
  })

  test("notifies list, details and KPI subscribers after mutations", () => {
    const subscriber = jest.fn()
    const unsubscribe = subscribeBillingCache(subscriber)
    invalidateBillingCache()
    expect(subscriber).toHaveBeenCalledTimes(1)
    unsubscribe()
  })
})
