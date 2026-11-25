import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AdvisersTab, supportFormAdviserCandidatesQueryKey } from "./SupportFormDetail.jsx";
import {
  bulkAttachSupportFormAdvisers,
  detachSupportFormAdviser,
  getSupportFormAdviserCandidates,
  getSupportFormAdvisers,
} from "../../services/supportFormService.jsx";
import { getGrades } from "../../services/gradeService.jsx";

jest.mock("../../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPost: jest.fn(), apiPut: jest.fn(), apiPatch: jest.fn(), apiDelete: jest.fn() }));
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ user: { roles: [{ name: "manager" }] }, hasPermission: () => true }) }));
jest.mock("../../services/supportFormService.jsx", () => ({
  getSupportFormAdvisers: jest.fn(),
  getSupportFormAdviserCandidates: jest.fn(),
  bulkAttachSupportFormAdvisers: jest.fn(),
  detachSupportFormAdviser: jest.fn(),
  toggleSupportFormAdviserActive: jest.fn(),
  normalizeSupportFormActive: (value) => Boolean(Number(value)),
  normalizeSupportFormActiveValue: (value) => Number(Boolean(Number(value))),
}));
jest.mock("../../services/gradeService.jsx", () => ({ getGrades: jest.fn(() => Promise.resolve({ items: [{ id: 15, name: "دهم" }] })) }));
jest.mock("../../components/Common/TableContainer", () => ({ columns, data }) => <table><tbody>{data.map((item) => <tr key={item.id}>{columns.map((column) => <td key={column.id}>{column.cell?.({ row: { original: item } })}</td>)}</tr>)}</tbody></table>);
jest.mock("../../components/Common/DeleteModal.jsx", () => ({ show, onDeleteClick }) => show ? <button type="button" onClick={onDeleteClick}>تأیید حذف</button> : null);
jest.mock("react-select", () => () => null);

const candidate = (id, name = `مشاور ${id}`) => ({ id, code: `A-${id}`, user: { name, phone: `0912${id}` }, grades: [] });
const response = (items, page = 1, total = items.length, lastPage = 1) => ({ items, pagination: { page, limit: 10, total, lastPage } });
const renderTab = () => render(<MemoryRouter><AdvisersTab formId="3315" /></MemoryRouter>);
const candidateCard = () => screen.getByText("افزودن مشاور").closest(".card");

beforeEach(() => {
  jest.clearAllMocks();
  getGrades.mockResolvedValue({ items: [{ id: 15, name: "دهم" }] });
  getSupportFormAdvisers.mockResolvedValue(response([]));
  getSupportFormAdviserCandidates.mockImplementation((id, params) => Promise.resolve(params.page === 2 ? response([candidate(18)], 2, 11, 2) : response([candidate(12)], 1, 11, 2)));
  bulkAttachSupportFormAdvisers.mockResolvedValue({ success: true });
  detachSupportFormAdviser.mockResolvedValue({ success: true });
});

test("query key contains every server-side candidate parameter", () => {
  expect(supportFormAdviserCandidatesQueryKey({ supportFormId: "3315", page: 2, limit: 10, gradeId: "15", search: " مریم ", sortBy: "id", sortOrder: "DESC" }))
    .toEqual(["support-forms", 3315, "adviser-candidates", 2, 10, 15, "مریم", "id", "DESC"]);
});

test("opens page two, keeps selections across pages and submits all ids", async () => {
  renderTab();
  expect(await screen.findByText("مشاور 12")).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText("انتخاب مشاور 12"));
  fireEvent.click(within(candidateCard()).getByText("2"));
  expect(await screen.findByText("مشاور 18")).toBeInTheDocument();
  expect(getSupportFormAdviserCandidates).toHaveBeenLastCalledWith("3315", expect.objectContaining({ page: 2, limit: 10 }), expect.any(AbortSignal));
  fireEvent.click(screen.getByLabelText("انتخاب مشاور 18"));
  fireEvent.click(within(candidateCard()).getByText("1"));
  expect(await screen.findByText("مشاور 12")).toBeInTheDocument();
  expect(screen.getByLabelText("انتخاب مشاور 12")).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "افزودن مشاوران انتخاب‌شده" }));
  await waitFor(() => expect(bulkAttachSupportFormAdvisers).toHaveBeenCalledWith("3315", expect.arrayContaining([12, 18])));
});

test("candidate checkbox is clickable from the input, its hit area and keyboard", async () => {
  renderTab();
  const checkbox = await screen.findByLabelText("انتخاب مشاور 12");
  const hitArea = checkbox.closest(".support-form-question-check");

  expect(checkbox).not.toBeDisabled();
  fireEvent.click(checkbox);
  expect(checkbox).toBeChecked();

  fireEvent.click(hitArea);
  expect(checkbox).not.toBeChecked();

  fireEvent.keyDown(hitArea, { key: "Enter" });
  expect(checkbox).toBeChecked();
});

test("hides unnecessary pagination and gets off-page search results from API", async () => {
  getSupportFormAdviserCandidates.mockResolvedValueOnce(response([candidate(12)], 1, 1, 1)).mockResolvedValueOnce(response([candidate(44, "مریم احمدی")], 1, 1, 1));
  renderTab();
  await screen.findByText("مشاور 12");
  expect(candidateCard().querySelector(".pagination")).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("جستجوی متنی"), { target: { value: "مریم" } });
  expect(await screen.findByText("مریم احمدی")).toBeInTheDocument();
  expect(getSupportFormAdviserCandidates).toHaveBeenLastCalledWith("3315", expect.objectContaining({ page: 1, search: "مریم" }), expect.any(AbortSignal));
});

test("resets to page one on grade change and does not merge connected advisers", async () => {
  getSupportFormAdvisers.mockResolvedValue(response([{ adviser_id: 99, adviser: { id: 99, code: "CONNECTED", user: { name: "متصل" } }, is_active: 1 }]));
  renderTab();
  await screen.findByText("مشاور 12");
  expect(screen.queryByLabelText("انتخاب مشاور 99")).not.toBeInTheDocument();
  fireEvent.click(within(candidateCard()).getByText("2"));
  await screen.findByText("مشاور 18");
  fireEvent.change(screen.getByLabelText("فیلتر پایه"), { target: { value: "15" } });
  await waitFor(() => expect(getSupportFormAdviserCandidates).toHaveBeenLastCalledWith("3315", expect.objectContaining({ page: 1, gradeId: 15 }), expect.any(AbortSignal)));
});

test("shows error and retry without clearing selection", async () => {
  getSupportFormAdviserCandidates.mockResolvedValueOnce(response([candidate(12)], 1, 11, 2)).mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(response([candidate(18)], 2, 11, 2));
  renderTab();
  await screen.findByText("مشاور 12");
  fireEvent.click(screen.getByLabelText("انتخاب مشاور 12"));
  fireEvent.click(within(candidateCard()).getByText("2"));
  expect(await screen.findByText("خطا در دریافت مشاوران قابل افزودن.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "تلاش دوباره" }));
  expect(await screen.findByText("مشاور 18")).toBeInTheDocument();
  expect(screen.getByText(/۱ انتخاب‌شده/)).toBeInTheDocument();
});

test("refetches connected and candidate queries after detach so the adviser appears again", async () => {
  const connected = { id: 501, adviser_id: 99, adviser: { id: 99, code: "A-99", user: { name: "مشاور متصل" } }, is_active: 1 };
  getSupportFormAdvisers.mockResolvedValueOnce(response([connected])).mockResolvedValueOnce(response([]));
  getSupportFormAdviserCandidates.mockResolvedValueOnce(response([])).mockResolvedValueOnce(response([candidate(99, "مشاور متصل")]));
  renderTab();
  expect(await screen.findByText("مشاور متصل")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "حذف" }));
  fireEvent.click(screen.getByRole("button", { name: "تأیید حذف" }));
  await waitFor(() => expect(detachSupportFormAdviser).toHaveBeenCalledWith("3315", 99));
  expect(await screen.findByLabelText("انتخاب مشاور 99")).toBeInTheDocument();
  expect(getSupportFormAdvisers).toHaveBeenCalledTimes(2);
  expect(getSupportFormAdviserCandidates).toHaveBeenCalledTimes(2);
});
