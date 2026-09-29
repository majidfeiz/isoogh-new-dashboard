import React from "react";
import { render, screen } from "@testing-library/react";
import { PhoneBookTab } from "./StudentProfile.jsx";
import { getStudentContacts } from "../../services/adviserPortalService.jsx";

jest.mock("../../services/adviserPortalService.jsx", () => ({
  getStudentContacts: jest.fn(),
  addStudentContact: jest.fn(),
  setDefaultContact: jest.fn(),
  deleteStudentContact: jest.fn(),
}));
jest.mock("../../services/voipService.jsx", () => ({ getCallTrace: jest.fn() }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

test("disables add, delete, and default-contact mutations when canEdit is false", async () => {
  getStudentContacts.mockResolvedValue([
    { id: 1, phoneNumber: "09120000001", subjectName: "پدر", isDefault: true },
    { id: 2, phoneNumber: "09120000002", subjectName: "مادر", isDefault: false },
  ]);

  render(<PhoneBookTab formId="10" studentId="20" subjects={[]} canEdit={false} onFormEnded={jest.fn()} />);

  expect(await screen.findByRole("button", { name: /افزودن شماره/ })).toBeDisabled();
  expect(screen.getByTitle("تنظیم به عنوان پیش‌فرض")).toBeDisabled();
  expect(screen.getAllByTitle("حذف شماره").every((button) => button.disabled)).toBe(true);
});
