import { callbackPaymentType, clearPendingWalletTopup, getPendingWalletTopup, isWalletCallbackCanceled, parseWalletCallback, savePendingWalletTopup, walletCallbackIsComplete } from "./walletPayment.js";

describe("wallet topup callback contract", () => {
  beforeEach(() => sessionStorage.clear());

  test("persists the full topup context and restores it after refresh", () => {
    savePendingWalletTopup({ topupId: 73, schoolId: 94, verifyPath: "/billing/wallet/topups/73/verify", authority: "A1", paymentType: "wallet_topup", provider: "zarinpal" });
    expect(getPendingWalletTopup()).toEqual(expect.objectContaining({ topupId: 73, schoolId: 94, verifyPath: "/billing/wallet/topups/73/verify", authority: "A1", paymentType: "wallet_topup" }));
    clearPendingWalletTopup();
    expect(getPendingWalletTopup()).toBeNull();
  });

  test("uses paymentType as the primary callback discriminator", () => {
    expect(callbackPaymentType(new URLSearchParams("paymentType=wallet_topup&invoiceId=999"), null, { paymentType: "invoice_payment" })).toBe("wallet_topup");
    expect(callbackPaymentType(new URLSearchParams("paymentType=invoice_payment&topupId=73"), { paymentType: "wallet_topup" }, null)).toBe("invoice_payment");
  });

  test("parses Zarinpal query and falls back to session authority", () => {
    const stored = { topupId: 73, schoolId: 94, authority: "SESSION-A", paymentType: "wallet_topup", provider: "zarinpal" };
    expect(parseWalletCallback(new URLSearchParams("paymentType=wallet_topup&topupId=73&schoolId=94&Status=OK"), stored)).toEqual(expect.objectContaining({ authority: "SESSION-A", status: "OK", topupId: 73, schoolId: 94 }));
    expect(walletCallbackIsComplete(parseWalletCallback(new URLSearchParams("paymentType=wallet_topup&topupId=73&schoolId=94&Authority=QUERY-A&Status=OK"), {}))).toBe(true);
  });

  test("parses Sadad Token/ResCode and identifies canceled callbacks", () => {
    const callback = parseWalletCallback(new URLSearchParams("paymentType=wallet_topup&topupId=73&schoolId=94&Token=T1&ResCode=12"), {});
    expect(callback).toEqual(expect.objectContaining({ authority: "T1", status: "12", provider: "sadad" }));
    expect(isWalletCallbackCanceled(callback)).toBe(true);
    expect(isWalletCallbackCanceled({ provider: "sadad", status: "0" })).toBe(false);
    expect(isWalletCallbackCanceled({ provider: "zarinpal", status: "NOK" })).toBe(true);
  });

  test("rejects incomplete wallet callbacks", () => {
    expect(walletCallbackIsComplete(parseWalletCallback(new URLSearchParams("paymentType=wallet_topup&topupId=73"), {}))).toBe(false);
  });
});
