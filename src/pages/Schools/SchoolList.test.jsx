import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SchoolList from "./SchoolList.jsx";
import { getSchools, updateSchoolStatus } from "../../services/schoolService.jsx";

const mockHasPermission = jest.fn();

jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ hasPermission: mockHasPermission }) }));
jest.mock("../../hooks/useListState", () => ({ useListState: () => ({ saved: null, saveState: jest.fn() }) }));
jest.mock("../../services/schoolService.jsx", () => ({
  getSchools: jest.fn(),
  deleteSchool: jest.fn(),
  updateSchoolStatus: jest.fn(),
  invalidateActiveSchoolLists: jest.fn(),
}));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("../../components/Common/Breadcrumb", () => () => null);
jest.mock("../../components/Common/Paginations.jsx", () => () => null);
jest.mock("../../components/Common/TableContainer", () => ({ columns, data }) => <div>{data.map((item) => <div key={item.id}>{columns.map((column) => column.cell ? <div key={column.id}>{column.cell({ getValue: () => item[column.accessorKey], row: { original: item } })}</div> : null)}</div>)}</div>);

const activeSchool = { id: 94, code: "SCH-94", name: "مجموعه فعال", status: 1 };

beforeEach(() => {
  jest.clearAllMocks();
  mockHasPermission.mockImplementation((permission) => permission === "schools.update");
  getSchools.mockResolvedValue({ items: [activeSchool], pagination: { page: 1, limit: 10, total: 1, lastPage: 1 } });
  updateSchoolStatus.mockResolvedValue({ ...activeSchool, status: 0 });
});

const renderPage = () => render(<MemoryRouter><SchoolList /></MemoryRouter>);

test("shows status badge, backend limitation, and permission-aware action", async () => {
  renderPage();
  expect(await screen.findByText("مجموعه فعال")).toBeInTheDocument();
  expect(screen.getByText("فعال", { selector: ".badge" })).toBeInTheDocument();
  expect(screen.getByText(/endpoint مدیریتی شامل مجموعه‌های غیرفعال/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "غیرفعال‌کردن" })).toBeInTheDocument();
});

test("deactivates only after confirmation and refetches active list", async () => {
  getSchools
    .mockResolvedValueOnce({ items: [activeSchool], pagination: { page: 1, limit: 10, total: 1, lastPage: 1 } })
    .mockResolvedValue({ items: [], pagination: { page: 1, limit: 10, total: 0, lastPage: 1 } });
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "غیرفعال‌کردن" }));
  expect(updateSchoolStatus).not.toHaveBeenCalled();
  expect(screen.getByText(/اطلاعات آن حذف نخواهد شد/)).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole("button", { name: "غیرفعال‌کردن" }).at(-1));

  await waitFor(() => expect(updateSchoolStatus).toHaveBeenCalledWith(94, 0));
  await waitFor(() => expect(getSchools).toHaveBeenCalledTimes(2));
});

test("can reactivate an inactive row only when backend has actually returned it", async () => {
  const inactiveSchool = { ...activeSchool, name: "مجموعه غیرفعال", status: 0 };
  getSchools.mockResolvedValue({ items: [inactiveSchool], pagination: { page: 1, limit: 10, total: 1, lastPage: 1 } });
  updateSchoolStatus.mockResolvedValue({ ...inactiveSchool, status: 1 });
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "فعال‌کردن" }));
  fireEvent.click(screen.getAllByRole("button", { name: "فعال‌کردن" }).at(-1));
  await waitFor(() => expect(updateSchoolStatus).toHaveBeenCalledWith(94, 1));
});

test("keeps previous status and backend message when mutation fails", async () => {
  updateSchoolStatus.mockRejectedValue({ response: { status: 403, data: { message: "دسترسی تغییر وضعیت ندارید" } } });
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "غیرفعال‌کردن" }));
  fireEvent.click(screen.getAllByRole("button", { name: "غیرفعال‌کردن" }).at(-1));
  expect(await screen.findByText("دسترسی تغییر وضعیت ندارید")).toBeInTheDocument();
  expect(screen.getByText("فعال", { selector: ".badge" })).toBeInTheDocument();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("hides status action without schools.update", async () => {
  mockHasPermission.mockReturnValue(false);
  renderPage();
  await screen.findByText("مجموعه فعال");
  expect(screen.queryByRole("button", { name: /فعال‌کردن|غیرفعال‌کردن/ })).not.toBeInTheDocument();
});
