import React from "react";
import { render, screen } from "@testing-library/react";
import AdviserRowActions from "./AdviserRowActions.jsx";

const props = { adviser: { id: 5, is_super: true }, schoolId: "12", busy: false, onStudents: jest.fn(), onGrades: jest.fn(), onSuperStatus: jest.fn(), onSubordinates: jest.fn() };

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
  rerender(<AdviserRowActions {...props} canShow={false} canUpdate />);
  expect(screen.getByText("پایه‌ها")).toBeInTheDocument();
  expect(screen.getByText("لغو سرمشاوری")).toBeInTheDocument();
});
