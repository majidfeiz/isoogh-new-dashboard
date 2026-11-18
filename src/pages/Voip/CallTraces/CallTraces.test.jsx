import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { getCallTrace, getCallTraces } from "../../../services/voipService.jsx";
import CallTraces from "./CallTraces.jsx";

jest.mock("../../../services/voipService.jsx", () => ({ getCallTrace: jest.fn(), getCallTraces: jest.fn() }));
jest.mock("../../../context/AuthContext.jsx", () => ({
  useAuth: () => ({ hasPermission: () => true, meLoading: false }),
}));
jest.mock("../../../components/Common/Breadcrumb.jsx", () => () => null);
jest.mock("../../../components/Common/Paginations.jsx", () => (props) => (
  <div data-testid="pagination" data-total={props.totalRecords} data-pages={props.totalPages}>
    <button type="button" onClick={() => props.setCurrentPage(2)}>صفحه ۲</button>
  </div>
));

const item = {
  id: 7,
  voipCallId: 70,
  correlationId: "corr-7",
  status: "completed",
  progress: 100,
  currentStep: "cdr_received",
  callGroupId: "group-7",
  errorMessage: null,
  adviser: { id: 1, name: "مشاور تست", code: null, phone: null },
  student: { id: 2, name: "دانش‌آموز تست", code: null, phone: null },
  supportForm: { id: 3, title: "فرم تست" },
  createdAt: "2026-11-18T08:00:00Z",
  updatedAt: "2026-11-18T08:00:00Z",
};

const response = (overrides = {}) => ({
  items: [item],
  meta: { page: 1, limit: 15, total: 31, lastPage: 3 },
  ...overrides,
});

const renderPage = (url = "/voip/call-traces?page=1&limit=15") => render(
  <MemoryRouter initialEntries={[url]}>
    <Routes><Route path="/voip/call-traces" element={<CallTraces />} /></Routes>
  </MemoryRouter>,
);

beforeEach(() => {
  jest.clearAllMocks();
  getCallTraces.mockResolvedValue(response());
  getCallTrace.mockResolvedValue({ ...item, events: [] });
});

test("renders the unwrapped current page and backend pagination metadata", async () => {
  renderPage();

  expect(await screen.findByText("مشاور تست")).toBeInTheDocument();
  expect(getCallTraces).toHaveBeenCalledTimes(1);
  expect(getCallTraces).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 15 }));
  expect(screen.getByTestId("pagination")).toHaveAttribute("data-total", "31");
  expect(screen.getByTestId("pagination")).toHaveAttribute("data-pages", "3");
});

test("page navigation requests only the selected server page", async () => {
  getCallTraces
    .mockResolvedValueOnce(response())
    .mockResolvedValueOnce(response({ meta: { page: 2, limit: 15, total: 31, lastPage: 3 } }));
  renderPage();
  await screen.findByText("مشاور تست");

  fireEvent.click(screen.getByText("صفحه ۲"));

  await waitFor(() => expect(getCallTraces).toHaveBeenCalledTimes(2));
  expect(getCallTraces.mock.calls[1][0]).toEqual(expect.objectContaining({ page: 2, limit: 15 }));
});

test("opening one row requests details only for that trace", async () => {
  renderPage();
  await screen.findByText("مشاور تست");

  fireEvent.click(screen.getByRole("button", { name: "جزئیات" }));

  await waitFor(() => expect(getCallTrace).toHaveBeenCalledTimes(1));
  expect(getCallTrace).toHaveBeenCalledWith(7, expect.objectContaining({ signal: expect.any(AbortSignal) }));
});

test("debounced search resets page and aborts the previous page query", async () => {
  getCallTraces.mockResolvedValue(response({ meta: { page: 2, limit: 15, total: 31, lastPage: 3 } }));
  renderPage("/voip/call-traces?page=2&limit=15");
  await screen.findByText("مشاور تست");
  const firstSignal = getCallTraces.mock.calls[0][0].signal;

  fireEvent.change(screen.getByPlaceholderText("نام، تلفن، کد، عنوان فرم یا شناسه تماس"), { target: { value: "corr-7" } });

  await waitFor(() => expect(getCallTraces).toHaveBeenCalledTimes(2), { timeout: 1000 });
  expect(firstSignal.aborted).toBe(true);
  expect(getCallTraces.mock.calls[1][0]).toEqual(expect.objectContaining({ page: 1, limit: 15, search: "corr-7" }));
});

test("renders empty and timeout states without treating cancellation as an error", async () => {
  getCallTraces.mockResolvedValueOnce(response({ items: [], meta: { page: 1, limit: 15, total: 0, lastPage: 1 } }));
  const view = renderPage();
  expect(await screen.findByText("تماسی با این فیلترها پیدا نشد")).toBeInTheDocument();
  view.unmount();

  getCallTraces.mockRejectedValueOnce(Object.assign(new Error("timeout"), { code: "ECONNABORTED" }));
  renderPage();
  expect(await screen.findByText("دریافت اطلاعات بیش از حد انتظار طول کشید")).toBeInTheDocument();
});

test("cancellation does not render an error state", async () => {
  getCallTraces.mockRejectedValueOnce(Object.assign(new Error("canceled"), { code: "ERR_CANCELED" }));
  renderPage();

  await waitFor(() => expect(getCallTraces).toHaveBeenCalledTimes(1));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
