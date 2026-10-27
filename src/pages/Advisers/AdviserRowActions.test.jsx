import React from "react";
import { render, screen } from "@testing-library/react";
import AdviserRowActions from "./AdviserRowActions.jsx";

const props = { adviser: { id: 5, is_super: true, schools: [{ id: 12, is_active: true }, { id: 13, is_active: false }] }, schoolId: "12", busy: false, accountBusy: false, onStudents: jest.fn(), onGrades: jest.fn(), onSuperStatus: jest.fn(), onSubordinates: jest.fn(), onAccountStatus: jest.fn() };

test("shows view actions only with advisers.show", () => {
  const { rerender } = render(<AdviserRowActions {...props} canShow={false} canUpdate={false} />);
  expect(screen.queryByText("دانش‌آموزان")).not.toBeInTheDocument();
  expect(screen.queryByText("زیرمجموعه‌ها")).not.toBeInTheDocument();
  rerender(<AdviserRowActions {...props} canShow canUpdate={false} />);
  expect(screen.getByText("دانش‌آموزان")).toBeInTheDocument();
  expect(screen.getByText("زیرمجموعه‌ها")).toBeInTheDocument();
});

test("shows mutations only with advisers.update", () => {
  const { rerender } = render(<AdviserRowActions {...props} canShow={false} canUpdate={false} />);
  expect(screen.queryByText("پایه‌ها")).not.toBeInTheDocument();
  expect(screen.queryByText("لغو سرمشاوری")).not.toBeInTheDocument();
  expect(screen.queryByText("غیرفعال‌سازی حساب")).not.toBeInTheDocument();
  rerender(<AdviserRowActions {...props} canShow={false} canUpdate />);
  expect(screen.getByText("پایه‌ها")).toBeInTheDocument();
  expect(screen.getByText("لغو سرمشاوری")).toBeInTheDocument();
  expect(screen.getByText("غیرفعال‌سازی حساب")).toBeInTheDocument();
});

test("uses independent account status for the selected school", () => {
  const { rerender } = render(<AdviserRowActions {...props} canShow={false} canUpdate />);
  expect(screen.getByText("غیرفعال‌سازی حساب")).toBeInTheDocument();
  rerender(<AdviserRowActions {...props} schoolId="13" canShow={false} canUpdate />);
  expect(screen.getByText("فعال‌سازی حساب")).toBeInTheDocument();
});
