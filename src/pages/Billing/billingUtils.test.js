import { billingErrorMessage, calculateCapacitySteps, formatIntegerInput, hasBillingRole, insufficientWalletBalance, invalidateBillingCache, moneyDisplay, normalizePositiveIntegerInput, numberToPersianWords, subscribeBillingCache, tomanToRial, validateInvoiceAdjustment, walletPaymentSummary } from "./billingUtils.js"

describe("billing UI rules", () => {
  test("allows only declared billing roles", () => {
    expect(hasBillingRole({ roles: [{ name: "manager" }] })).toBe(true)
    expect(hasBillingRole({ roles: ["student"] })).toBe(false)
  })

  test("maps security, conflict and business errors to Persian", () => {
    expect(billingErrorMessage({ response: { status: 401 } })).toMatch(/وارد شوید/)
    expect(billingErrorMessage({ response: { status: 403 } })).toBe("خارج از دامنه دسترسی")
    expect(billingErrorMessage({ response: { status: 409 } })).not.toMatch(/تکراری|دوره/)
    expect(billingErrorMessage({ response: { status: 409, data: { code: "INVOICE_STATE_CONFLICT", message: "وضعیت فاکتور اجازه این عملیات را نمی‌دهد" } } })).toBe("وضعیت فاکتور اجازه این عملیات را نمی‌دهد")
    expect(billingErrorMessage({ response: { status: 409, data: { code: "INVOICE_STATE_CONFLICT" } } })).toBe("INVOICE_STATE_CONFLICT")
    expect(billingErrorMessage({ response: { status: 400, data: { message: "قبل از روز ۲۵ مجاز نیست" } } })).toBe("قبل از روز ۲۵ مجاز نیست")
    expect(billingErrorMessage({ response: { status: 502 } })).toMatch(/درگاه پرداخت/)
  })

  test("converts display toman to rial only at submit boundary", () => {
    expect(tomanToRial("12,500")).toBe(125000)
    expect(moneyDisplay(125000)).toContain("ریال")
    expect(moneyDisplay(125000)).toContain("تومان")
  })

  test("writes wallet amounts in Persian words", () => {
    expect(numberToPersianWords(5000000)).toBe("پنج میلیون")
    expect(numberToPersianWords(125000)).toBe("صد و بیست و پنج هزار")
    expect(numberToPersianWords(0)).toBe("صفر")
  })

  test("normalizes and formats positive rial inputs", () => {
    expect(normalizePositiveIntegerInput("۵۰۰,۰۰۰ ریال")).toBe("500000")
    expect(formatIntegerInput("500000")).toBe("۵۰۰٬۰۰۰")
  })

  test("blocks wallet payments that would make the balance negative", () => {
    expect(walletPaymentSummary(20000000, 20000000)).toEqual({ balance: 20000000, invoiceAmount: 20000000, shortfall: 0, canPay: true, balanceAfter: 0 })
    expect(walletPaymentSummary(5000000, 20000000)).toEqual(expect.objectContaining({ shortfall: 15000000, canPay: false, balanceAfter: null }))
    expect(walletPaymentSummary(-15000000, 20000000)).toEqual(expect.objectContaining({ shortfall: 35000000, canPay: false }))
  })

  test("recognizes the structured insufficient wallet error", () => {
    expect(insufficientWalletBalance({ response: { status: 409, data: { code: "INSUFFICIENT_WALLET_BALANCE", balance: 5, requiredAmount: 20, shortfall: 15, invoiceId: 7 } } })).toEqual(expect.objectContaining({ balance: 5, shortfall: 15, invoiceId: 7 }))
    expect(insufficientWalletBalance({ response: { status: 409, data: { code: "OTHER" } } })).toBeNull()
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
