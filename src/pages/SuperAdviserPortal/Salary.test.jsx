import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Salary from "./Salary.jsx";
import { exportSuperAdviserSalary, getSuperAdviserAdvisers, getSuperAdviserSalary, getSuperAdviserSupportForms } from "../../services/superAdviserPortalService.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { salaryExportErrorMessage } from "./salaryExportUtils.js";

jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: jest.fn() }));
jest.mock("../../services/superAdviserPortalService.jsx", () => ({
  exportSuperAdviserSalary: jest.fn(),
  getSuperAdviserSalary: jest.fn(),
  getSuperAdviserAdvisers: jest.fn(),
  getSuperAdviserSupportForms: jest.fn(),
}));
jest.mock("./salaryExportUtils.js", () => ({
  saveSalaryExportBlob: jest.fn(),
  salaryExportErrorMessage: jest.fn(async () => "خطای دانلود"),
}));

const salaryResult = { year: 1405, month: 5, advisers: [], totalDurationSeconds: 0, durationFormatted: "00:00:00" };

beforeEach(() => {
  jest.clearAllMocks();
  getSuperAdviserSalary.mockResolvedValue(salaryResult);
  getSuperAdviserAdvisers.mockResolvedValue({ items: [] });
  getSuperAdviserSupportForms.mockResolvedValue({ items: [] });
  salaryExportErrorMessage.mockResolvedValue("خطای دانلود");
});

test("shows salary export only with the existing salary permission", async () => {
  useAuth.mockReturnValue({ hasPermission: () => false });
  const { rerender } = render(<MemoryRouter><Salary /></MemoryRouter>);
  expect(screen.queryByText("خروجی Excel")).not.toBeInTheDocument();
  useAuth.mockReturnValue({ hasPermission: (permission) => permission === "super-adviser-portal.salary.index" });
  rerender(<MemoryRouter><Salary /></MemoryRouter>);
  expect(screen.getByText("خروجی Excel")).toBeInTheDocument();
  await waitFor(() => expect(getSuperAdviserSalary).toHaveBeenCalled());
});

test("disables export while downloading and releases it after completion", async () => {
  useAuth.mockReturnValue({ hasPermission: () => true });
  let resolveExport;
  exportSuperAdviserSalary.mockReturnValue(new Promise((resolve) => { resolveExport = resolve; }));
  render(<MemoryRouter><Salary /></MemoryRouter>);
  const button = screen.getByText("خروجی Excel").closest("button");
  fireEvent.click(button);
  expect(button).toBeDisabled();
  resolveExport({ blob: new Blob([]), contentDisposition: "" });
  await waitFor(() => expect(button).not.toBeDisabled());
  expect(exportSuperAdviserSalary).toHaveBeenCalledTimes(1);
  expect(screen.getByText("فایل Excel با موفقیت دریافت شد")).toBeInTheDocument();
});

test("uses the newly applied filters for both table and Excel", async () => {
  useAuth.mockReturnValue({ hasPermission: () => true });
  getSuperAdviserAdvisers.mockResolvedValue({ items: [{ id: 2, name: "مشاور" }] });
  getSuperAdviserSupportForms.mockResolvedValue({ items: [{ id: 10, title: "فرم" }] });
  exportSuperAdviserSalary.mockResolvedValue({ blob: new Blob([]), contentDisposition: "" });
  const { container } = render(<MemoryRouter><Salary /></MemoryRouter>);
  await waitFor(() => expect(container.querySelector('select[name="adviserId"] option[value="2"]')).toBeTruthy());
  fireEvent.change(container.querySelector('select[name="month"]'), { target: { value: "5" } });
  fireEvent.change(container.querySelector('select[name="adviserId"]'), { target: { value: "2" } });
  fireEvent.change(container.querySelector('select[name="supportFormId"]'), { target: { value: "10" } });
  fireEvent.click(screen.getByText("اعمال"));
  await waitFor(() => expect(getSuperAdviserSalary).toHaveBeenLastCalledWith(expect.objectContaining({ month: 5, adviserId: "2", supportFormId: "10" })));
  await waitFor(() => expect(screen.getByText("اعمال").closest("button")).not.toBeDisabled());
  fireEvent.click(screen.getByText("خروجی Excel"));
  await waitFor(() => expect(exportSuperAdviserSalary).toHaveBeenLastCalledWith(expect.objectContaining({ month: 5, adviserId: "2", supportFormId: "10" })));
});

test("shows the parsed API error and releases export loading", async () => {
  useAuth.mockReturnValue({ hasPermission: () => true });
  exportSuperAdviserSalary.mockRejectedValue(new Error("failed"));
  render(<MemoryRouter><Salary /></MemoryRouter>);
  const button = screen.getByText("خروجی Excel").closest("button");
  fireEvent.click(button);
  await waitFor(() => expect(screen.getByText("خطای دانلود")).toBeInTheDocument());
  expect(button).not.toBeDisabled();
});
