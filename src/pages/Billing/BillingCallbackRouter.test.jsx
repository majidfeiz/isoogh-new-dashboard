import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BillingCallbackRouter from "./BillingCallbackRouter.jsx";
import { savePendingPayment } from "./billingPayment.js";
import { savePendingWalletTopup } from "./walletPayment.js";

jest.mock("./BillingWalletCallback.jsx", () => () => <div>WALLET_VERIFY_ENDPOINT</div>);
jest.mock("./BillingPaymentCallback.jsx", () => () => <div>INVOICE_VERIFY_ENDPOINT</div>);

const renderRoute = (url) => render(<MemoryRouter initialEntries={[url]}><BillingCallbackRouter /></MemoryRouter>);

describe("billing callback routing", () => {
  beforeEach(() => sessionStorage.clear());

  test("wallet_topup always selects wallet verify even when invoiceId exists", () => {
    renderRoute("/billing/payment/callback?paymentType=wallet_topup&topupId=73&schoolId=94&invoiceId=999");
    expect(screen.getByText("WALLET_VERIFY_ENDPOINT")).toBeInTheDocument();
  });

  test("invoice_payment selects invoice verify even when topupId exists", () => {
    renderRoute("/billing/payment/callback?paymentType=invoice_payment&invoiceId=4&topupId=73");
    expect(screen.getByText("INVOICE_VERIFY_ENDPOINT")).toBeInTheDocument();
  });

  test("refresh can restore wallet type from session context", () => {
    savePendingWalletTopup({ topupId: 73, schoolId: 94, authority: "A1", paymentType: "wallet_topup" });
    renderRoute("/billing/payment/callback?Authority=A1&Status=OK");
    expect(screen.getByText("WALLET_VERIFY_ENDPOINT")).toBeInTheDocument();
  });

  test("legacy invoice callback is restored from explicit stored payment type", () => {
    savePendingPayment({ invoiceId: 4, schoolId: 94, provider: "zarinpal", authority: "A1" });
    renderRoute("/billing/payment/callback?Authority=A1&Status=OK");
    expect(screen.getByText("INVOICE_VERIFY_ENDPOINT")).toBeInTheDocument();
  });

  test("incomplete callback does not guess an invoice from ids", () => {
    renderRoute("/billing/payment/callback?topupId=73&invoiceId=4");
    expect(screen.getByText(/نوع پرداخت callback مشخص نیست/)).toBeInTheDocument();
  });
});
