import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdviserCreateImportModal from "./AdviserCreateImportModal.jsx";
import { importAdvisers, registerAdviser } from "../../services/adviserService.jsx";

jest.mock("../../services/adviserService.jsx", () => ({ importAdvisers: jest.fn(), registerAdviser: jest.fn() }));

const renderModal = (props = {}) => render(<MemoryRouter><AdviserCreateImportModal isOpen toggle={jest.fn()} schoolId="94" schoolName="مجموعه نمونه" grades={[{ id: 2, name: "دهم" }]} {...props} /></MemoryRouter>);

beforeEach(() => jest.clearAllMocks());

test("register form only exposes allowed fields and preserves the leading phone zero", async () => {
  registerAdviser.mockResolvedValue({ adviserId: 1 });
  renderModal({ mode: "register", onSuccess: jest.fn() });
  fireEvent.change(screen.getByLabelText(/نام و نام خانوادگی/), { target: { value: "علی احمدی" } });
  fireEvent.change(screen.getByLabelText(/شماره موبایل/), { target: { value: "09121234567" } });
  fireEvent.change(screen.getByLabelText("نام کاربری"), { target: { value: "ali" } });
  fireEvent.click(screen.getByRole("button", { name: "ثبت مشاور" }));
  await waitFor(() => expect(registerAdviser).toHaveBeenCalledWith(expect.objectContaining({ schoolId: 94, name: "علی احمدی", phone: "09121234567", username: "ali" })));
  ["نقش", "نوع مشاور", "سرمشاور", "شماره والد", "نام خانوادگی جدا"].forEach((label) => expect(screen.queryByLabelText(label)).not.toBeInTheDocument());
});

test("disables registration and import without a selected school", () => {
  renderModal({ schoolId: "", mode: "register" });
  expect(screen.getByRole("button", { name: "ثبت مشاور" })).toBeDisabled();
  fireEvent.click(screen.getByText("ورود گروهی مشاوران"));
  expect(screen.getByRole("button", { name: "آپلود و پردازش" })).toBeDisabled();
});

test("shows all import summary counts and links failures to the import log", async () => {
  importAdvisers.mockResolvedValue({ logId: 55, status: "success", totalRows: 6, processedRows: 5, failedRows: 1, createdUsers: 2, createdAdvisers: 3, linkedToSchool: 4, errorMessage: "یک ردیف خطا داشت" });
  renderModal({ mode: "import", onSuccess: jest.fn() });
  const file = new File(["xlsx"], "advisers.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  fireEvent.change(screen.getByLabelText("فایل Excel مشاوران"), { target: { files: [file] } });
  fireEvent.click(screen.getByRole("button", { name: "آپلود و پردازش" }));
  await screen.findByText("یک ردیف خطا داشت");
  ["کل ردیف‌ها", "موفق", "خطادار", "کاربر جدید", "مشاور جدید", "اتصال جدید مجموعه"].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
  expect(screen.getByRole("link", { name: /مشاهده جزئیات خطاها/ })).toHaveAttribute("href", "/import-logs/55");
});
