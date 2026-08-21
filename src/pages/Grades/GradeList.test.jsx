import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GradeList from "./GradeList.jsx";
import { getGrades } from "../../services/gradeService.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: jest.fn() }));
jest.mock("../../hooks/useListState", () => ({ useListState: () => ({ saved: null, saveState: jest.fn() }) }));
jest.mock("../../services/gradeService.jsx", () => ({ getGrades: jest.fn(), deleteGrade: jest.fn() }));
jest.mock("../../components/Common/Paginations.jsx", () => () => null);
jest.mock("../../components/Common/TableContainer.jsx", () => function Table({ columns, data }) {
  const actions = columns.find((column) => column.id === "actions");
  return <div>{data.map((item) => <div key={item.id}>{actions?.cell({ row: { original: item } })}</div>)}</div>;
});

beforeEach(() => {
  jest.clearAllMocks();
  getGrades.mockResolvedValue({ items: [{ id: 1, name: "اول" }], pagination: { page: 1, limit: 10, total: 1, lastPage: 1 } });
});

test("hides create, update and delete buttons without their permissions", async () => {
  useAuth.mockReturnValue({ hasPermission: () => false });
  render(<MemoryRouter><GradeList /></MemoryRouter>);
  await waitFor(() => expect(getGrades).toHaveBeenCalled());
  expect(screen.queryByText("افزودن پایه جدید")).not.toBeInTheDocument();
  expect(screen.queryByText("ویرایش")).not.toBeInTheDocument();
  expect(screen.queryByText("حذف")).not.toBeInTheDocument();
});

test("shows each grade action only when its permission exists", async () => {
  const permissions = ["grades.create", "grades.update", "grades.delete"];
  useAuth.mockReturnValue({ hasPermission: (permission) => permissions.includes(permission) });
  render(<MemoryRouter><GradeList /></MemoryRouter>);
  expect(await screen.findByText("افزودن پایه جدید")).toBeInTheDocument();
  expect(await screen.findByText("ویرایش")).toBeInTheDocument();
  expect(await screen.findByText("حذف")).toBeInTheDocument();
});
