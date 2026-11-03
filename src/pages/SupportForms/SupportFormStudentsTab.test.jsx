import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { AllStudentsTab, StudentsTab } from "./SupportFormDetail.jsx";
import { getSupportForm, getSupportFormAdvisers, getSupportFormAdviserStudents, getSupportFormAllStudents, setSupportFormAdviserStudentArchive } from "../../services/supportFormService.jsx";
import { apiGet } from "../../helpers/httpClient.jsx";

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
jest.mock("react-select", () => ({ inputId, options = [], value, onChange, isDisabled, isLoading, isSearchable, onMenuScrollToBottom }) => <div><select
  aria-label={inputId}
  data-searchable={String(Boolean(isSearchable))}
  disabled={isDisabled}
  value={value?.value || ""}
  onChange={(event) => onChange(options.find((option) => option.value === event.target.value) || null)}
><option value="">{isLoading ? "در حال دریافت..." : "انتخاب"}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{onMenuScrollToBottom && <button type="button" aria-label={`${inputId}-load-more`} onClick={onMenuScrollToBottom}>بیشتر</button>}</div>);

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

test("loads scoped root tags once and renders a searchable selector", async () => {
  getSupportFormAdvisers.mockResolvedValue({ items: [{ adviser_id: 15, adviser: { user: { name: "مشاور" } } }] });
  getSupportFormAdviserStudents.mockResolvedValue({ items: [], pagination: { page: 1, limit: 10, total: 0 } });
  apiGet.mockResolvedValue({ data: { data: { items: [{ id: 71, name: "پیگیری ویژه" }], meta: { page: 1, limit: 200, total: 1, lastPage: 1 } } } });

  render(<StudentsTab formId="10" schoolId={8} />);
  fireEvent.change(await screen.findByRole("combobox"), { target: { value: "15" } });
  fireEvent.click(await screen.findByRole("button", { name: "افزودن با تگ" }));

  const tagSelect = await screen.findByLabelText("support-form-parent-tag");
  await waitFor(() => expect(tagSelect).not.toBeDisabled());
  expect(tagSelect).toHaveAttribute("data-searchable", "true");
  expect(within(tagSelect).getByRole("option", { name: "پیگیری ویژه" })).toBeInTheDocument();
  expect(apiGet).toHaveBeenCalledWith(expect.stringMatching(/\/parent-tags$/), { params: expect.objectContaining({ page: 1, limit: 200, schoolId: 8, rootOnly: 1 }) });
});

test("appends the next tag page when the selector reaches its end", async () => {
  getSupportFormAdvisers.mockResolvedValue({ items: [{ adviser_id: 15, adviser: { user: { name: "مشاور" } } }] });
  getSupportFormAdviserStudents.mockResolvedValue({ items: [], pagination: { page: 1, limit: 10, total: 0 } });
  apiGet
    .mockResolvedValueOnce({ data: { data: { items: [{ id: 71, name: "تگ صفحه اول" }], meta: { page: 1, limit: 200, total: 201, lastPage: 2 } } } })
    .mockResolvedValueOnce({ data: { data: { items: [{ id: 72, name: "تگ صفحه دوم" }], meta: { page: 2, limit: 200, total: 201, lastPage: 2 } } } });

  render(<StudentsTab formId="10" schoolId={8} />);
  fireEvent.change(await screen.findByRole("combobox"), { target: { value: "15" } });
  fireEvent.click(await screen.findByRole("button", { name: "افزودن با تگ" }));
  const tagSelect = await screen.findByLabelText("support-form-parent-tag");
  await waitFor(() => expect(within(tagSelect).getByRole("option", { name: "تگ صفحه اول" })).toBeInTheDocument());

  fireEvent.click(screen.getByRole("button", { name: "support-form-parent-tag-load-more" }));

  await waitFor(() => expect(within(tagSelect).getByRole("option", { name: "تگ صفحه دوم" })).toBeInTheDocument());
  expect(apiGet).toHaveBeenLastCalledWith(expect.stringMatching(/\/parent-tags$/), { params: expect.objectContaining({ page: 2, limit: 200, schoolId: 8, rootOnly: 1 }) });
});
