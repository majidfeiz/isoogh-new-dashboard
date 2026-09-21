import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { AllStudentsTab, StudentsTab } from "./SupportFormDetail.jsx";
import { getSupportForm, getSupportFormAdvisers, getSupportFormAdviserStudents, getSupportFormAllStudents, setSupportFormAdviserStudentArchive } from "../../services/supportFormService.jsx";

jest.mock("../../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPost: jest.fn(), apiPatch: jest.fn(), apiDelete: jest.fn() }));
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({
  user: { roles: [{ name: "manager" }] }, hasPermission: (permission) => permission === "support-forms.update",
}) }));
jest.mock("../../services/supportFormService.jsx", () => ({
  getSupportForm: jest.fn(), getSupportFormAdvisers: jest.fn(), getSupportFormAdviserStudents: jest.fn(), getSupportFormAllStudents: jest.fn(),
  setSupportFormAdviserStudentArchive: jest.fn(),
}));
jest.mock("../../components/Common/TableContainer", () => ({ columns, data }) => <table><tbody>
  {data.map((item) => <tr key={item.id}>{columns.map((column) => <td key={column.id}>
    {column.cell ? column.cell({ row: { original: item } }) : null}
  </td>)}</tr>)}
</tbody></table>);
jest.mock("../../components/Common/Paginations.jsx", () => () => null);
jest.mock("../../components/Common/DeleteModal.jsx", () => () => null);

beforeEach(() => jest.clearAllMocks());

test("the visible students tab opens confirmation and archives the assignment ID", async () => {
  getSupportFormAdvisers.mockResolvedValue({ items: [{ adviser_id: 15, adviser: { user: { name: "مشاور" } } }] });
  getSupportFormAdviserStudents.mockResolvedValue({ items: [{ id: 501, student_id: 99, status: 1,
    is_archived: false, student: { user: { name: "دانش‌آموز" } } }], pagination: { page: 1, limit: 10, total: 1 } });
  setSupportFormAdviserStudentArchive.mockResolvedValue({ id: 501, is_archived: true, status: 1 });

  render(<StudentsTab formId="10" schoolId={8} />);
  fireEvent.change(await screen.findByRole("combobox"), { target: { value: "15" } });
  const row = (await screen.findByText("دانش‌آموز")).closest("tr");
  expect(within(row).getByText("تماس موفق")).toBeInTheDocument();
  fireEvent.click(within((await screen.findByText("دانش‌آموز")).closest("tr")).getByRole("button", { name: "آرشیو" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "آرشیو" }));

  await waitFor(() => expect(setSupportFormAdviserStudentArchive).toHaveBeenCalledWith("10", "15", 501, 8, false));
  expect(getSupportFormAdviserStudents.mock.calls.at(-1)[2]).toEqual(expect.objectContaining({ archive: "all", page: 1 }));
});

test("fetches the form school before archiving when the tab opens without it", async () => {
  getSupportFormAdvisers.mockResolvedValue({ items: [{ adviser_id: 15, adviser: { user: { name: "مشاور" } } }] });
  getSupportFormAdviserStudents.mockResolvedValue({ items: [{ id: 501, student_id: 99, status: 0, is_archived: false }],
    pagination: { page: 1, limit: 10, total: 1 } });
  getSupportForm.mockResolvedValue({ school_id: 8 });
  setSupportFormAdviserStudentArchive.mockResolvedValue({ id: 501, is_archived: true });

  render(<StudentsTab formId="10" />);
  fireEvent.change(await screen.findByRole("combobox"), { target: { value: "15" } });
  const row = (await screen.findByText("بدون وضعیت")).closest("tr");
  fireEvent.click(within(row).getByRole("button", { name: "آرشیو" }));
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "آرشیو" }));

  await waitFor(() => expect(getSupportForm).toHaveBeenCalledWith("10"));
  expect(setSupportFormAdviserStudentArchive).toHaveBeenCalledWith("10", "15", 501, 8, false);
});

test("all students tab shows current status labels, filters and archives the selected assignment", async () => {
  getSupportFormAllStudents.mockResolvedValue({ items: [{ id: 501, adviser_id: 15, student_id: 99,
    status: 2, is_archived: false, student: { user: { name: "دانش‌آموز" } } }],
    pagination: { page: 1, limit: 10, total: 1 } });
  setSupportFormAdviserStudentArchive.mockResolvedValue({ id: 501, is_archived: true, status: 2 });

  render(<AllStudentsTab formId="10" schoolId={8} />);
  const row = (await screen.findByText("دانش‌آموز")).closest("tr");
  expect(within(row).getByText("ناقص")).toBeInTheDocument();
  const filters = screen.getAllByRole("combobox");
  fireEvent.change(filters[0], { target: { value: "2" } });
  fireEvent.change(filters[1], { target: { value: "active" } });
  await waitFor(() => expect(getSupportFormAllStudents.mock.calls.at(-1)[1])
    .toEqual(expect.objectContaining({ page: 1, status: "2", archive: "active" })));

  fireEvent.click(within((await screen.findByText("دانش‌آموز")).closest("tr")).getByRole("button", { name: "آرشیو" }));
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "آرشیو" }));
  await waitFor(() => expect(setSupportFormAdviserStudentArchive).toHaveBeenCalledWith("10", 15, 501, 8, false));
});

test("incomplete calls tab requests status 2 and archives without changing call status", async () => {
  getSupportFormAllStudents.mockResolvedValue({ items: [{ id: 503, adviser_id: 17, status: 2,
    is_archived: false, student: { user: { name: "تماس ناقص" } } }],
    pagination: { page: 1, limit: 10, total: 1 } });
  setSupportFormAdviserStudentArchive.mockResolvedValue({ id: 503, status: 2, is_archived: true });

  render(<AllStudentsTab formId="10" schoolId={8} incompleteOnly />);
  const row = (await screen.findByText("تماس ناقص")).closest("tr");
  expect(within(row).getByText("ناقص")).toBeInTheDocument();
  expect(screen.queryByText("همه وضعیت‌ها")).not.toBeInTheDocument();
  expect(getSupportFormAllStudents.mock.calls[0][1]).toEqual(expect.objectContaining({ status: 2, archive: "all" }));

  fireEvent.click(within(row).getByRole("button", { name: "آرشیو" }));
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "آرشیو" }));
  await waitFor(() => expect(setSupportFormAdviserStudentArchive).toHaveBeenCalledWith("10", 17, 503, 8, false));
  expect(getSupportFormAllStudents.mock.calls.at(-1)[1].status).toBe(2);
});
