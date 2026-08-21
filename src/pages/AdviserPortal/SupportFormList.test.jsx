import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import SupportFormList from "./SupportFormList.jsx";
import { getAdviserSchoolDetail, getAdviserSupportForms } from "../../services/adviserPortalService.jsx";
import { getGrades } from "../../services/gradeService.jsx";

jest.mock("../../services/adviserPortalService.jsx", () => ({ getAdviserSchoolDetail: jest.fn(), getAdviserSupportForms: jest.fn() }));
jest.mock("../../services/gradeService.jsx", () => ({ getGrades: jest.fn() }));
jest.mock("../../components/Common/Paginations.jsx", () => function Pagination({ currentPage, totalRecords, setCurrentPage }) {
  return <div><span>صفحه {currentPage} از {totalRecords}</span><button onClick={() => setCurrentPage(3)}>صفحه سوم</button></div>;
});

const Location = () => <div data-testid="location">{useLocation().search}</div>;
const renderPage = (query = "") => render(
  <MemoryRouter initialEntries={[`/adviser-calls/schools/98/planned-calls${query}`]}>
    <Routes><Route path="/adviser-calls/schools/:schoolId/planned-calls" element={<><SupportFormList /><Location /></>} /></Routes>
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  getAdviserSchoolDetail.mockResolvedValue({ id: 98, name: "مدرسه" });
  getGrades.mockResolvedValue({ items: [{ id: 6, name: "ششم" }, { id: 7, name: "هفتم" }] });
  getAdviserSupportForms.mockResolvedValue({ items: [], pagination: { page: 1, limit: 15, total: 0, lastPage: 1 } });
});

test("renders server grades and restores gradeId from URL", async () => {
  renderPage("?gradeId=6&page=2");
  const select = await screen.findByLabelText("پایه");
  await waitFor(() => expect(screen.getByRole("option", { name: "ششم" })).toBeInTheDocument());
  expect(screen.getByRole("option", { name: "همه پایه‌ها" })).toBeInTheDocument();
  expect(select).toHaveValue("6");
  await waitFor(() => expect(getAdviserSupportForms).toHaveBeenCalledWith(expect.objectContaining({ schoolId: "98", gradeId: "6", page: 2 })));
});

test("changing and clearing grade resets page and updates server data", async () => {
  getAdviserSupportForms.mockImplementation(async ({ gradeId, page }) => ({
    items: gradeId === "6" ? [{ id: 11, title: "فرم پایه ششم", grade: { id: 6, name: "ششم" }, stats: {} }] : [],
    pagination: { page, limit: 15, total: gradeId === "6" ? 1 : 0, lastPage: 1 },
  }));
  renderPage("?page=3&search=تماس&sortOrder=ASC");
  const select = await screen.findByLabelText("پایه");
  await waitFor(() => expect(screen.getByRole("option", { name: "ششم" })).toBeInTheDocument());
  fireEvent.change(select, { target: { value: "6" } });
  await waitFor(() => expect(getAdviserSupportForms).toHaveBeenLastCalledWith(expect.objectContaining({ gradeId: "6", page: 1, search: "تماس", sortOrder: "ASC" })));
  expect(await screen.findByText("فرم پایه ششم")).toBeInTheDocument();
  expect(screen.getByTestId("location").textContent).toContain("gradeId=6");
  expect(screen.getByTestId("location").textContent).not.toContain("page=3");

  fireEvent.change(select, { target: { value: "" } });
  await waitFor(() => expect(getAdviserSupportForms).toHaveBeenLastCalledWith(expect.objectContaining({ gradeId: undefined, page: 1, search: "تماس", sortOrder: "ASC" })));
  expect(screen.getByTestId("location").textContent).not.toContain("gradeId");
  expect(screen.getByText("فرم تماسی یافت نشد")).toBeInTheDocument();
});

test("keeps gradeId across sorting and pagination", async () => {
  getAdviserSupportForms.mockResolvedValue({ items: [{ id: 1, title: "فرم", stats: {} }], pagination: { page: 1, limit: 15, total: 30, lastPage: 2 } });
  renderPage("?gradeId=6");
  await waitFor(() => expect(getAdviserSupportForms).toHaveBeenCalled());
  fireEvent.click(screen.getByText("قدیمی‌ترین"));
  await waitFor(() => expect(getAdviserSupportForms).toHaveBeenLastCalledWith(expect.objectContaining({ gradeId: "6", sortOrder: "ASC", page: 1 })));
  fireEvent.click(await screen.findByText("صفحه سوم"));
  await waitFor(() => expect(getAdviserSupportForms).toHaveBeenLastCalledWith(expect.objectContaining({ gradeId: "6", sortOrder: "ASC", page: 3 })));
});

test("shows API error state", async () => {
  getAdviserSupportForms.mockRejectedValue({ response: { data: { message: "خطای فرم‌ها" } } });
  renderPage();
  expect(await screen.findByText("خطای فرم‌ها")).toBeInTheDocument();
});
