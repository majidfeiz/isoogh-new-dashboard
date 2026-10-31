import { clearPendingPayment, getPendingPayment, isCanceledCallback, parseProviderCallback, savePendingPayment, validatePaymentRequestResult } from "./billingPayment.js"

describe("provider-independent billing payment flow", () => {
  beforeEach(() => sessionStorage.clear())

  test.each(["zarinpal", "sadad"])("validates and stores %s payment before redirect", (provider) => {
    const result = validatePaymentRequestResult({ provider, authority: "sensitive-authority", paymentUrl: "https://psp.example/pay", amount: 200000, invoiceNumber: "INV-1" })
    savePendingPayment({ invoiceId: 3, schoolId: 145, provider: result.provider, authority: result.authority })
    expect(getPendingPayment()).toEqual({ invoiceId: "3", schoolId: 145, provider, authority: "sensitive-authority" })
  })

  test("parses Zarinpal callback fields", () => {
    expect(parseProviderCallback("zarinpal", new URLSearchParams("Authority=A000&Status=OK"))).toEqual({ authority: "A000", status: "OK" })
    expect(isCanceledCallback("zarinpal", "OK")).toBe(false)
    expect(isCanceledCallback("zarinpal", "NOK")).toBe(true)
  })

  test("parses Sadad callback fields", () => {
    expect(parseProviderCallback("sadad", new URLSearchParams("Token=T000&ResCode=0&OrderId=12"))).toEqual({ authority: "T000", status: "0", orderId: "12" })
    expect(isCanceledCallback("sadad", "0")).toBe(false)
    expect(isCanceledCallback("sadad", "-1")).toBe(true)
  })

  test("returns missing context and clears context only explicitly", () => {
    expect(getPendingPayment()).toBeNull()
    savePendingPayment({ invoiceId: 3, schoolId: 145, provider: "zarinpal", authority: "A" })
    clearPendingPayment()
    expect(getPendingPayment()).toBeNull()
  })

  test("rejects incomplete backend responses", () => {
    expect(() => validatePaymentRequestResult({ provider: "zarinpal", authority: "A", paymentUrl: "https://psp.example" })).toThrow("معتبر نیست")
  })
})
