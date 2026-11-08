import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PaymentAuditLogs from "./PaymentAuditLogs.jsx";
import { getAuditLogs } from "../../services/auditLogService.jsx";

jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ user: { roles: ["support"] } }) }));
jest.mock("../../services/auditLogService.jsx", () => ({ getAuditLogs: jest.fn() }));
jest.mock("../IncomingCalls/IncomingCallsCommon.jsx", () => ({ SchoolPicker: () => <div>مجموعه</div> }));
jest.mock("../AuditLogs/ActorAutocomplete.jsx", () => () => <input aria-label="کاربر" />);
jest.mock("../AuditLogs/AuditDateFilter.jsx", () => () => <div>فیلتر تاریخ</div>);
jest.mock("./PaymentAuditDrawer.jsx", () => () => null);

beforeEach(() => {
  jest.clearAllMocks();
  getAuditLogs.mockResolvedValue({ items: [], pagination: { page: 1, limit: 20, total: 0, lastPage: 1 } });
});

test("always scopes payment audit requests to the billing module", async () => {
  render(<MemoryRouter initialEntries={["/billing/payment-logs?status=failed"]}><PaymentAuditLogs /></MemoryRouter>);

  await waitFor(() => expect(getAuditLogs).toHaveBeenCalledWith(expect.objectContaining({ module: "billing", status: "failed" })));
  expect(screen.getByText(/این گزارش فعالیت API را نمایش می‌دهد/)).toBeInTheDocument();
  expect(screen.getByText(/فقط موفقیت عملیات تأیید پرداخت/)).toBeInTheDocument();
});

