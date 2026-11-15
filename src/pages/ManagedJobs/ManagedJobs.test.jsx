import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ManagedJobs from "./ManagedJobs.jsx";
import { getManagedJobs, getManagedJobRuns, updateManagedJob } from "../../services/managedJobService.jsx";

const mockHasPermission = jest.fn();
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ hasPermission: mockHasPermission }) }));
jest.mock("../../services/managedJobService.jsx", () => ({
  getManagedJobs: jest.fn(),
  getManagedJobRuns: jest.fn(),
  updateManagedJob: jest.fn(),
  executeManagedJob: jest.fn(),
}));
jest.mock("../../components/Common/Paginations.jsx", () => () => null);

const job = {
  key: "check-voip-availability", name: "پایش VoIP", description: "بررسی سلامت",
  enabled: true, effectiveEnabled: false, environmentEnabled: false, running: false,
  intervalSeconds: 600, lastStatus: "never", configuration: {}, configurationGuide: {},
};

beforeEach(() => {
  jest.clearAllMocks();
  getManagedJobs.mockResolvedValue({ items: [job], meta: { page: 1, limit: 20, total: 1, lastPage: 1 } });
  getManagedJobRuns.mockResolvedValue({ items: [], meta: { page: 1, limit: 20, total: 0, lastPage: 1 } });
});

const renderPage = () => render(<MemoryRouter initialEntries={["/managed-jobs"]}><Routes><Route path="/managed-jobs" element={<ManagedJobs />} /></Routes></MemoryRouter>);

test("shows ENV warning and hides actions without update/execute permissions", async () => {
  mockHasPermission.mockReturnValue(false);
  renderPage();
  expect(await screen.findByText(/container غیرفعال است/)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "ویرایش" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "اجرای دستی" })).not.toBeInTheDocument();
});

test("disables manual execution when environment is disabled", async () => {
  mockHasPermission.mockImplementation((permission) => permission === "managed-jobs.execute");
  renderPage();
  expect(await screen.findByRole("button", { name: "اجرای دستی" })).toBeDisabled();
});

test("keeps manual execution disabled with a clear hint while the Simotel history job is running", async () => {
  mockHasPermission.mockImplementation((permission) => permission === "managed-jobs.execute");
  getManagedJobs.mockResolvedValue({ items: [{ ...job, key: "sync-simotel-outbound-history", running: true, effectiveEnabled: true, environmentEnabled: true }], meta: { page: 1, limit: 20, total: 1, lastPage: 1 } });
  renderPage();
  const button = await screen.findByRole("button", { name: "اجرای دستی" });
  expect(button).toBeDisabled();
  expect(button.parentElement).toHaveAttribute("title", expect.stringMatching(/در حال اجراست/));
});

test("changes enabled state only after confirmation and refreshes canonical data", async () => {
  mockHasPermission.mockImplementation((permission) => permission === "managed-jobs.update");
  const disabledJob = { ...job, enabled: false, effectiveEnabled: false };
  getManagedJobs
    .mockResolvedValueOnce({ items: [job], meta: { page: 1, limit: 20, total: 1, lastPage: 1 } })
    .mockResolvedValue({ items: [disabledJob], meta: { page: 1, limit: 20, total: 1, lastPage: 1 } });
  updateManagedJob.mockResolvedValue(disabledJob);

  renderPage();
  const toggle = await screen.findByRole("button", { name: "غیرفعال‌کردن پایش VoIP" });
  fireEvent.click(toggle);

  expect(updateManagedJob).not.toHaveBeenCalled();
  expect(screen.getByText(/اجرای جاری قطع نمی‌شود/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "غیرفعال‌کردن" }));

  await waitFor(() => expect(updateManagedJob).toHaveBeenCalledWith("check-voip-availability", { enabled: false }));
  await waitFor(() => expect(getManagedJobs).toHaveBeenCalledTimes(2));
  expect(await screen.findByRole("button", { name: "فعال‌کردن پایش VoIP" })).toHaveAttribute("aria-pressed", "false");
});

test("keeps current status and shows backend error when toggle fails", async () => {
  mockHasPermission.mockImplementation((permission) => permission === "managed-jobs.update");
  updateManagedJob.mockRejectedValue({ response: { data: { message: "تغییر وضعیت مجاز نیست" } } });

  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "غیرفعال‌کردن پایش VoIP" }));
  fireEvent.click(screen.getByRole("button", { name: "غیرفعال‌کردن" }));

  expect(await screen.findByText("تغییر وضعیت مجاز نیست")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "غیرفعال‌کردن پایش VoIP" })).toHaveAttribute("aria-pressed", "true");
});
