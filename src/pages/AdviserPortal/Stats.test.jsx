import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import moment from "moment-jalaali";
import Stats from "./Stats.jsx";
import { getAdviserStats } from "../../services/adviserPortalService.jsx";

jest.mock("../../services/adviserPortalService.jsx", () => ({ getAdviserStats: jest.fn() }));

const response = (overrides = {}) => ({
  year: 1405, month: 5, periodStart: "2026-07-23T00:00:00+03:30", periodEnd: "2026-08-22T23:59:59+03:30",
  totalSchools: 2, totalSupportForms: 3, totalStudents: 10, totalCalledStudents: 4, totalNotCalledStudents: 6,
  totalCalls: 8, totalAnswerSessions: 3, callsToday: 1, callsThisWeek: 2, callsThisMonth: 8,
  overallCompletionPercent: 37, formProgress: [], ...overrides,
});

const Location = () => <div data-testid="location">{useLocation().search}</div>;
const renderPage = (query = "") => render(<MemoryRouter initialEntries={[`/adviser-calls/stats${query}`]}><Routes><Route path="/adviser-calls/stats" element={<><Stats /><Location /></>} /></Routes></MemoryRouter>);

beforeEach(() => {
  jest.clearAllMocks();
  getAdviserStats.mockResolvedValue(response());
});

test("sends the current Jalali year and month on initial load", async () => {
  renderPage();
  const current = moment();
  await waitFor(() => expect(getAdviserStats).toHaveBeenCalledWith(expect.objectContaining({ year: current.jYear(), month: current.jMonth() + 1, signal: expect.any(AbortSignal) })));
  expect(screen.getByTestId("location").textContent).toContain(`year=${current.jYear()}`);
});

test("loads 1405/5 from URL and renders server metadata, cards and form progress", async () => {
  getAdviserStats.mockResolvedValue(response({ formProgress: [{ supportFormId: 10, supportFormTitle: "فرم مرداد", totalStudents: 7, calledStudents: 3, notCalledStudents: 4, answeredStudents: 2, totalCalls: 6, completionPercent: 43 }] }));
  renderPage("?year=1405&month=5");
  await waitFor(() => expect(getAdviserStats).toHaveBeenCalledWith(expect.objectContaining({ year: 1405, month: 5 })));
  expect(await screen.findByText("فرم مرداد")).toBeInTheDocument();
  expect(screen.getByText("37%")).toBeInTheDocument();
  expect(screen.getByText(/بازه محاسبه/)).toBeInTheDocument();
    expect(screen.getAllByText("8", { selector: "h4" }).length).toBeGreaterThanOrEqual(2);
});

test("month navigation crosses Jalali year boundaries", async () => {
  renderPage("?year=1405&month=1");
  fireEvent.click(screen.getByText("ماه قبل"));
  await waitFor(() => expect(getAdviserStats).toHaveBeenLastCalledWith(expect.objectContaining({ year: 1404, month: 12 })));
  fireEvent.click(screen.getByText("ماه بعد"));
  await waitFor(() => expect(getAdviserStats).toHaveBeenLastCalledWith(expect.objectContaining({ year: 1405, month: 1 })));
});

test("ignores an older response after a rapid month change", async () => {
  let resolveOld;
  let resolveNew;
  getAdviserStats.mockImplementation(({ month }) => new Promise((resolve) => {
    if (month === 4) resolveOld = resolve;
    if (month === 5) resolveNew = resolve;
  }));
  renderPage("?year=1405&month=4");
  fireEvent.change(screen.getByLabelText("ماه"), { target: { value: "5" } });
  resolveNew(response({ formProgress: [{ supportFormId: 5, supportFormTitle: "پاسخ جدید", completionPercent: 10 }] }));
  await screen.findByText("پاسخ جدید");
  resolveOld(response({ formProgress: [{ supportFormId: 4, supportFormTitle: "پاسخ قدیمی", completionPercent: 90 }] }));
  await waitFor(() => expect(screen.queryByText("پاسخ قدیمی")).not.toBeInTheDocument());
});

test("shows monthly empty state and API errors with retry", async () => {
  getAdviserStats.mockResolvedValueOnce(response({ totalCalls: 0, totalCalledStudents: 0, totalAnswerSessions: 0, callsThisMonth: 0 }));
  const { unmount } = renderPage("?year=1405&month=5");
  expect(await screen.findByText("در این ماه تماسی ثبت نشده است")).toBeInTheDocument();
  unmount();
  getAdviserStats.mockRejectedValue({ response: { status: 400, data: { message: "ماه نامعتبر است" } } });
  renderPage("?year=1405&month=5");
  expect(await screen.findByText("ماه نامعتبر است")).toBeInTheDocument();
  expect(screen.getByText("تلاش دوباره")).toBeInTheDocument();
});
