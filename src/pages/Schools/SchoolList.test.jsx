import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SchoolList from "./SchoolList.jsx";
import { getSchools, updateSchoolStatus } from "../../services/schoolService.jsx";

const mockHasPermission = jest.fn();
const mockSaveState = jest.fn();

jest.mock("../../context/AuthContext.jsx", () => ({
  useAuth: () => ({ hasPermission: mockHasPermission }),
}));
jest.mock("../../hooks/useListState", () => ({
  useListState: () => ({ saved: null, saveState: mockSaveState }),
}));
jest.mock("../../services/schoolService.jsx", () => ({
  getSchools: jest.fn(),
  deleteSchool: jest.fn(),
  updateSchoolStatus: jest.fn(),
  invalidateSchoolQueries: jest.fn(),
}));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("../../components/Common/Breadcrumb", () => () => null);
jest.mock("../../components/Common/Paginations.jsx", () => () => null);
jest.mock("../../components/Common/TableContainer", () => ({ columns, data }) => (
  <div>
    {data.map((item) => (
      <div key={item.id}>
        {columns.map((column) => {
          if (!column.cell) return null;
          const value = column.accessorKey ? item[column.accessorKey] : undefined;
          return (
            <div key={column.id}>
              {column.cell({
                getValue: () => value,
                row: { original: item },
              })}
            </div>
          );
        })}
      </div>
    ))}
  </div>
));

const school = { id: 94, code: "SCH-94", name: "مجموعه آزمون", status: 1, isActive: true };

beforeEach(() => {
  jest.clearAllMocks();
  mockHasPermission.mockImplementation((permission) => permission === "schools.update");
  getSchools.mockResolvedValue({
    items: [school],
    pagination: { page: 1, limit: 10, total: 1, lastPage: 1 },
  });
  updateSchoolStatus.mockResolvedValue({ ...school, status: 0, isActive: false });
});

const renderPage = () => render(<MemoryRouter><SchoolList /></MemoryRouter>);

test("management list requests all schools and status filter resets page", async () => {
  renderPage();
  await waitFor(() => expect(getSchools).toHaveBeenCalledWith(expect.objectContaining({ status: "all" })));

  fireEvent.change(screen.getByLabelText("وضعیت"), { target: { name: "status", value: "inactive" } });

  await waitFor(() => expect(getSchools).toHaveBeenLastCalledWith(expect.objectContaining({
    page: 1,
    status: "inactive",
  })));
  expect(mockSaveState).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
});

test("deactivation waits for confirmation and sends boolean false", async () => {
  renderPage();
  expect(await screen.findByText("مجموعه آزمون")).toBeInTheDocument();
  expect(screen.getByText("فعال", { selector: ".badge" })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "غیرفعال‌کردن" }));
  expect(screen.getByText(/داده‌های آن حذف نخواهد شد/)).toBeInTheDocument();
  expect(updateSchoolStatus).not.toHaveBeenCalled();

  const buttons = screen.getAllByRole("button", { name: "غیرفعال‌کردن" });
  fireEvent.click(buttons[buttons.length - 1]);

  await waitFor(() => expect(updateSchoolStatus).toHaveBeenCalledWith(94, false));
  await waitFor(() => expect(getSchools).toHaveBeenCalledTimes(2));
});

test("status action is hidden without schools.update permission", async () => {
  mockHasPermission.mockReturnValue(false);
  renderPage();
  await screen.findByText("مجموعه آزمون");
  expect(screen.queryByRole("button", { name: /فعال‌کردن|غیرفعال‌کردن/ })).not.toBeInTheDocument();
});
