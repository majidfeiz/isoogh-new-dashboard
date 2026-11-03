import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BillingWalletCallback from "./BillingWalletCallback.jsx";
import { verifyWalletTopup } from "../../services/billingService.jsx";
import { savePendingWalletTopup } from "./walletPayment.js";

jest.mock("../../services/billingService.jsx", () => ({ verifyWalletTopup: jest.fn() }));
jest.mock("./billingUtils.js", () => {
  const actual = jest.requireActual("./billingUtils.js");
  return { ...actual, invalidateBillingCache: jest.fn() };
});

const context = { topupId: 73, schoolId: 94, verifyPath: "/billing/wallet/topups/73/verify", authority: "SESSION-A", paymentType: "wallet_topup", provider: "zarinpal" };
const renderCallback = (query) => render(<MemoryRouter initialEntries={[`/billing/payment/callback?${query}`]}><BillingWalletCallback /></MemoryRouter>);

describe("wallet topup callback", () => {
  beforeEach(() => { jest.clearAllMocks(); sessionStorage.clear(); });

  test("verifies a successful topup without an invoice id and clears context", async () => {
    savePendingWalletTopup(context);
    verifyWalletTopup.mockResolvedValue({ balance: 900000 });
    renderCallback("paymentType=wallet_topup&topupId=73&schoolId=94&Authority=QUERY-A&Status=OK");
    expect(screen.getByText("در حال تأیید شارژ کیف پول...")).toBeInTheDocument();
    expect(await screen.findByText("افزایش موجودی کیف پول با موفقیت انجام شد")).toBeInTheDocument();
    expect(verifyWalletTopup).toHaveBeenCalledWith(73, { schoolId: 94, authority: "QUERY-A", status: "OK" });
    expect(sessionStorage.length).toBe(0);
    expect(screen.getByText(/۹۰۰٬۰۰۰ ریال/)).toBeInTheDocument();
  });

  test("does not verify a canceled payment", async () => {
    savePendingWalletTopup(context);
    renderCallback("paymentType=wallet_topup&topupId=73&schoolId=94&Authority=A1&Status=NOK");
    expect(await screen.findByText("پرداخت توسط کاربر لغو شد")).toBeInTheDocument();
    expect(verifyWalletTopup).not.toHaveBeenCalled();
  });

  test("offers retry after a network error and succeeds", async () => {
    savePendingWalletTopup(context);
    verifyWalletTopup.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce({ balance: 500000 });
    renderCallback("paymentType=wallet_topup&topupId=73&schoolId=94&Authority=A1&Status=OK");
    const retry = await screen.findByText("تلاش مجدد برای تأیید");
    fireEvent.click(retry);
    await waitFor(() => expect(verifyWalletTopup).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("افزایش موجودی کیف پول با موفقیت انجام شد")).toBeInTheDocument();
  });

  test("shows a controlled message for an incomplete callback", async () => {
    renderCallback("paymentType=wallet_topup&topupId=73");
    expect(await screen.findByText(/اطلاعات callback شارژ کیف پول کامل نیست/)).toBeInTheDocument();
    expect(verifyWalletTopup).not.toHaveBeenCalled();
  });

  test("refresh can verify from query without session storage", async () => {
    verifyWalletTopup.mockResolvedValue({ balance: 500000 });
    renderCallback("paymentType=wallet_topup&topupId=73&schoolId=94&Authority=A1&Status=OK");
    await waitFor(() => expect(verifyWalletTopup).toHaveBeenCalledWith(73, { schoolId: 94, authority: "A1", status: "OK" }));
  });
});
