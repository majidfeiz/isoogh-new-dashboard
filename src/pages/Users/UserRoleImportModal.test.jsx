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
    assignedUsers: 1,
    alreadyAssignedUsers: 1,
    issues: [
      {
        rowNumber: 4,
        username: "unknown",
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
  fireEvent.change(screen.getByLabelText("فایل اکسل نام‌های کاربری"), {
    target: { files: [file] },
  });
  fireEvent.click(screen.getByRole("button", { name: "شروع تخصیص" }));

  await waitFor(() =>
    expect(importUserRoles).toHaveBeenCalledWith(
      expect.objectContaining({ file, roleId: 7 })
    )
  );
  expect(await screen.findByText("کاربری با این نام کاربری پیدا نشد.")).toBeInTheDocument();
  expect(screen.getByText("نقش اضافه‌شده")).toBeInTheDocument();
  expect(onImported).toHaveBeenCalled();
});
