import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UserRoleImportModal from "./UserRoleImportModal.jsx";
import { getRoles } from "../../services/roleService.jsx";
import {
  downloadUserRoleImportTemplate,
  importUserRoles,
} from "../../services/userService.jsx";

jest.mock("../../services/roleService.jsx", () => ({
  getRoles: jest.fn(),
}));
jest.mock("../../services/userService.jsx", () => ({
  downloadUserRoleImportTemplate: jest.fn(),
  importUserRoles: jest.fn(),
}));
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), warning: jest.fn() },
}));

beforeEach(() => {
  getRoles.mockReset();
  importUserRoles.mockReset();
  downloadUserRoleImportTemplate.mockReset();
  getRoles.mockResolvedValue({
    items: [
      { id: 7, name: "adviser", label: "مشاور", isActive: true },
      { id: 8, name: "disabled", label: "غیرفعال", isActive: false },
    ],
  });
});

test("shows only active roles and blocks submit without role and file", async () => {
  render(
    <UserRoleImportModal isOpen toggle={jest.fn()} onImported={jest.fn()} />
  );

  expect(await screen.findByText("مشاور (adviser)")).toBeInTheDocument();
  expect(screen.queryByText("غیرفعال (disabled)")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "شروع تخصیص" }));
  expect(await screen.findByText("انتخاب نقش الزامی است.")).toBeInTheDocument();
  expect(importUserRoles).not.toHaveBeenCalled();
});

test("submits a valid file and renders summary plus row issues", async () => {
  const onImported = jest.fn();
  importUserRoles.mockResolvedValue({
    role: { id: 7, name: "adviser", label: "مشاور" },
    totalRows: 3,
    uniqueUsernames: 3,
    uniqueIdentifiers: 2,
    assignedUsers: 1,
    alreadyAssignedUsers: 1,
    issues: [
      {
        rowNumber: 4,
        username: "unknown",
        identifier: "09121234567",
        code: "USER_NOT_FOUND",
        message: "کاربری با این نام کاربری پیدا نشد.",
      },
    ],
  });

  render(
    <UserRoleImportModal isOpen toggle={jest.fn()} onImported={onImported} />
  );
  await screen.findByText("مشاور (adviser)");
  fireEvent.change(screen.getByLabelText(/نقش فعال/), {
    target: { value: "7" },
  });
  const file = new File(["xlsx"], "users.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  fireEvent.change(screen.getByLabelText("فایل اکسل نام کاربری یا شماره موبایل"), {
    target: { files: [file] },
  });
  fireEvent.click(screen.getByRole("button", { name: "شروع تخصیص" }));

  await waitFor(() =>
    expect(importUserRoles).toHaveBeenCalledWith(
      expect.objectContaining({ file, roleId: 7 })
    )
  );
  expect(await screen.findByText("کاربری با این نام کاربری پیدا نشد.")).toBeInTheDocument();
  expect(screen.getByText("شناسه‌های یکتا")).toBeInTheDocument();
  expect(screen.getByText("کاربر یافت نشد")).toBeInTheDocument();
  expect(screen.getByText("09121234567")).toBeInTheDocument();
  expect(screen.getByText("نقش اضافه‌شده")).toBeInTheDocument();
  expect(onImported).toHaveBeenCalled();
});

test.each([
  [400, { message: "ستون identifier در فایل وجود ندارد." }, "ستون identifier در فایل وجود ندارد."],
  [403, {}, "شما مجوز تخصیص گروهی نقش کاربران را ندارید."],
  [413, {}, "حجم فایل از محدودیت ۵ مگابایت بیشتر است."],
])("shows the correct server error for status %s", async (status, data, message) => {
  importUserRoles.mockRejectedValue({ response: { status, data } });
  render(<UserRoleImportModal isOpen toggle={jest.fn()} onImported={jest.fn()} />);
  await screen.findByText("مشاور (adviser)");
  fireEvent.change(screen.getByLabelText(/نقش فعال/), { target: { value: "7" } });
  fireEvent.change(screen.getByLabelText("فایل اکسل نام کاربری یا شماره موبایل"), {
    target: { files: [new File(["xlsx"], "users.xlsx")] },
  });
  fireEvent.click(screen.getByRole("button", { name: "شروع تخصیص" }));
  expect(await screen.findByText(message)).toBeInTheDocument();
});

test("renders all new issue codes and their required explanations", async () => {
  importUserRoles.mockResolvedValue({
    role: { id: 7, name: "adviser", label: "مشاور" }, totalRows: 5,
    uniqueIdentifiers: 2, assignedUsers: 0, alreadyAssignedUsers: 0,
    issues: [
      { rowNumber: 2, identifier: null, code: "EMPTY_IDENTIFIER", message: "خالی است" },
      { rowNumber: 3, identifier: "user", code: "DUPLICATE_IDENTIFIER", message: "تکراری است" },
      { rowNumber: 4, identifier: "0912", code: "DUPLICATE_USER_REFERENCE", message: "کاربر تکراری است" },
      { rowNumber: 5, identifier: "shared", code: "AMBIGUOUS_IDENTIFIER", message: "مبهم است" },
      { rowNumber: 6, identifier: "missing", code: "USER_NOT_FOUND", message: "یافت نشد" },
    ],
  });
  render(<UserRoleImportModal isOpen toggle={jest.fn()} onImported={jest.fn()} />);
  await screen.findByText("مشاور (adviser)");
  fireEvent.change(screen.getByLabelText(/نقش فعال/), { target: { value: "7" } });
  fireEvent.change(screen.getByLabelText("فایل اکسل نام کاربری یا شماره موبایل"), {
    target: { files: [new File(["xlsx"], "mixed.xlsx")] },
  });
  fireEvent.click(screen.getByRole("button", { name: "شروع تخصیص" }));
  expect(await screen.findByText("شناسه خالی")).toBeInTheDocument();
  expect(screen.getByText("شناسه تکراری")).toBeInTheDocument();
  expect(screen.getByText("ارجاع تکراری به کاربر")).toBeInTheDocument();
  expect(screen.getByText("شناسه مبهم")).toBeInTheDocument();
  expect(screen.getByText("کاربر یافت نشد")).toBeInTheDocument();
  expect(screen.getByText(/همین کاربر با شناسه دیگری/)).toBeInTheDocument();
  expect(screen.getByText(/بیش از یک کاربر/)).toBeInTheDocument();
});
