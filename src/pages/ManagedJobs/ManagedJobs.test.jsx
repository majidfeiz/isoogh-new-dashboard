import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ManagedJobs from "./ManagedJobs.jsx";
import { getManagedJobs } from "../../services/managedJobService.jsx";

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
