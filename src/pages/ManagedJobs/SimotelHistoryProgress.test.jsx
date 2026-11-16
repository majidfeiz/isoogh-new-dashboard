import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { getManagedJobRun, getManagedJobRuns } from "../../services/managedJobService.jsx";
import SimotelHistoryProgress, { MANAGED_JOB_POLL_INTERVAL } from "./SimotelHistoryProgress.jsx";

jest.mock("../../services/managedJobService.jsx", () => ({ getManagedJobRun: jest.fn(), getManagedJobRuns: jest.fn() }));

const currentRun = { id: 21, job_key: "sync-simotel-outbound-history", status: "running", started_at: "2026-11-15T08:00:00Z" };

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-11-15T08:05:00Z"));
  getManagedJobRuns.mockResolvedValue({ items: [currentRun], meta: { page: 1, limit: 20, total: 1 } });
});

afterEach(() => jest.useRealTimers());

test("shows latest progress, pages, counters and stale warning", async () => {
  getManagedJobRun.mockResolvedValue({
    ...currentRun,
    logs: [{ id: 3, event: "progress", created_at: "2026-11-15T08:02:00Z", data: { processedPages: 12, totalPages: 301, percent: 4, counters: { received: 240, added: 20, updated: 0, duplicate: 210, skipped: 10 } } }],
  });
  render(<SimotelHistoryProgress />);
  expect(await screen.findByText("۴٪")).toBeInTheDocument();
  expect(screen.getByText(/۱۲ از ۳۰۱ صفحه/)).toBeInTheDocument();
  expect(screen.getByText("بدون پیشرفت اخیر")).toBeInTheDocument();
  expect(screen.getByText("۲۴۰")).toBeInTheDocument();
  expect(getManagedJobRuns).toHaveBeenCalledWith(expect.objectContaining({ jobKey: "sync-simotel-outbound-history", status: "running" }), expect.any(AbortSignal));
});

test("shows waiting copy while a running execution has no progress log", async () => {
  getManagedJobRun.mockResolvedValue({ ...currentRun, logs: [] });
  render(<SimotelHistoryProgress />);
  expect(await screen.findByText("در انتظار دریافت اولین صفحه")).toBeInTheDocument();
  expect(screen.getByText("در حال اجرا")).toBeInTheDocument();
});

test("stops polling and notifies the page after a successful terminal response", async () => {
  const onTerminal = jest.fn();
  getManagedJobRun.mockResolvedValueOnce({ ...currentRun, logs: [] }).mockResolvedValueOnce({ ...currentRun, status: "succeeded", logs: [] });
  render(<SimotelHistoryProgress onTerminal={onTerminal} />);
  expect(await screen.findByText("در انتظار دریافت اولین صفحه")).toBeInTheDocument();
  await act(async () => { jest.advanceTimersByTime(MANAGED_JOB_POLL_INTERVAL); });
  await waitFor(() => expect(onTerminal).toHaveBeenCalledWith(expect.objectContaining({ status: "succeeded" })));
  const callsAfterCompletion = getManagedJobRun.mock.calls.length;
  await act(async () => { jest.advanceTimersByTime(MANAGED_JOB_POLL_INTERVAL * 2); });
  expect(getManagedJobRun).toHaveBeenCalledTimes(callsAfterCompletion);
});

test("shows the mapped failure reason and stops polling", async () => {
  const onTerminal = jest.fn();
  getManagedJobRun.mockResolvedValue({ ...currentRun, status: "failed", error_code: "SIMOTEL_HISTORY_JOB_TIMEOUT", logs: [] });
  render(<SimotelHistoryProgress onTerminal={onTerminal} />);
  expect(await screen.findByText("اجرای همگام‌سازی از سقف زمان مجاز عبور کرد.")).toBeInTheDocument();
  expect(onTerminal).toHaveBeenCalledWith(expect.objectContaining({ status: "failed" }));
  await act(async () => { jest.advanceTimersByTime(MANAGED_JOB_POLL_INTERVAL * 2); });
  expect(getManagedJobRun).toHaveBeenCalledTimes(1);
});
