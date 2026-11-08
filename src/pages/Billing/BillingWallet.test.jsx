import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BillingWallet from "./BillingWallet.jsx";
import { getBillingWallet } from "../../services/billingService.jsx";

jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ hasPermission: () => false }) }));
jest.mock("../IncomingCalls/IncomingCallsCommon.jsx", () => ({ SchoolPicker: () => <div>انتخاب مجموعه مجاز</div> }));
jest.mock("../../services/billingService.jsx", () => ({ getBillingWallet: jest.fn(), createManualWalletTopup: jest.fn(), requestWalletTopup: jest.fn() }));

test("shows negative authoritative balance and backend deposit/withdraw transactions", async () => {
  getBillingWallet.mockResolvedValue({ wallet: { balance: -200000, currency: "IRR", isNegative: true }, transactions: [{ id: 1, type: "deposit", amount: 1000000, balanceAfter: 1000000, reference: "gateway", createdAt: null }, { id: 2, type: "withdraw", amount: 1200000, balanceAfter: -200000, reference: "invoice", createdAt: null }], pagination: { page: 1, limit: 20, total: 2, lastPage: 1 } });
  render(<MemoryRouter initialEntries={["/billing/wallet?schoolId=94"]}><BillingWallet /></MemoryRouter>);
  expect(await screen.findByText("بدهکار")).toBeInTheDocument();
  expect(screen.getAllByText((text) => text.includes("−۲۰۰٬۰۰۰ ریال")).length).toBeGreaterThan(0);
  expect(screen.getByText("واریز")).toBeInTheDocument();
  expect(screen.getByText("برداشت")).toBeInTheDocument();
  expect(getBillingWallet).toHaveBeenCalledWith(expect.objectContaining({ schoolId: "94" }));
});

