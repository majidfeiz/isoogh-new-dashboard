import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FormDetail from "./FormDetail.jsx";
import {
  getAdviserFormStudents,
  getAdviserSupportFormDetail,
  getAdviserSupportFormStats,
  getAdviserWorkShifts,
  makeCall,
} from "../../services/adviserPortalService.jsx";

jest.mock("../../services/adviserPortalService.jsx", () => ({
  getAdviserSupportFormDetail: jest.fn(),
  getAdviserSupportFormStats: jest.fn(),
  getAdviserFormStudents: jest.fn(),
  getAdviserWorkShifts: jest.fn(),
  getStudentAnswers: jest.fn(),
  getStudentCallLogs: jest.fn(),
  makeCall: jest.fn(),
  submitAnswers: jest.fn(),
  updateAdviserStudentWorkShift: jest.fn(),
}));
jest.mock("../../services/voipService.jsx", () => ({ getCallTrace: jest.fn() }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("../../components/Common/Paginations.jsx", () => () => null);

const student = {
  id: 20,
  studentId: 20,
  name: "دانش‌آموز",
  successfulCallCount: 0,
  failedCallCount: 0,
  totalCallCount: 0,
  status: 0,
  workShiftId: 1,
};

const renderPage = () => render(
  <MemoryRouter initialEntries={["/adviser-calls/forms/10"]}>
    <Routes><Route path="/adviser-calls/forms/:formId" element={<FormDetail />} /></Routes>
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  getAdviserSupportFormStats.mockResolvedValue({});
  getAdviserWorkShifts.mockResolvedValue([{ id: 1, name: "صبح" }]);
  getAdviserFormStudents.mockResolvedValue({ items: [student], pagination: { page: 1, limit: 15, total: 1, lastPage: 1 } });
});

test("disables calling and work-shift changes when the server marks the form read-only", async () => {
  getAdviserSupportFormDetail.mockResolvedValue({ id: 10, title: "فرم بسته", isClosed: true, canEdit: false, canCall: false, questions: [] });
  renderPage();

  expect(await screen.findByText("تاریخ پایان این فرم تماس گذشته است؛ فرم فقط قابل مشاهده است.")).toBeInTheDocument();
  expect(await screen.findByTitle("برقراری تماس")).toBeDisabled();
  expect(screen.getByDisplayValue("صبح")).toBeDisabled();
  expect(screen.getByTitle("مشاهده پروفایل دانش‌آموز")).toBeEnabled();
});

test("handles SUPPORT_FORM_ENDED from an in-flight call without removing existing data", async () => {
  getAdviserSupportFormDetail.mockResolvedValue({ id: 10, title: "فرم فعال", isClosed: false, canEdit: true, canCall: true, questions: [] });
  makeCall.mockRejectedValue({ response: { status: 403, data: { code: "SUPPORT_FORM_ENDED", endAt: 1817169010 } } });
  renderPage();

  const callButton = await screen.findByTitle("برقراری تماس");
  fireEvent.click(callButton);

  expect(await screen.findByText("تاریخ پایان این فرم تماس گذشته است؛ فرم فقط قابل مشاهده است.")).toBeInTheDocument();
  expect(callButton).toBeDisabled();
  expect(screen.getByText("دانش‌آموز")).toBeInTheDocument();
});

test("renders contact-form headings as readable fields instead of raw JSON", async () => {
  getAdviserSupportFormDetail.mockResolvedValue({
    id: 10,
    title: "فرم توانمندسازی",
    headings: JSON.stringify([{ headings_title: "تماس پایانی", headings_body: "جمع‌بندی وضعیت دانش‌آموز" }]),
    isClosed: false,
    canEdit: true,
    canCall: true,
    questions: [],
  });
  renderPage();

  expect(await screen.findByText("سرفصل‌های فرم تماس")).toBeInTheDocument();
  expect(screen.getByText("تماس پایانی")).toBeInTheDocument();
  expect(screen.getByText("جمع‌بندی وضعیت دانش‌آموز")).toBeInTheDocument();
  expect(screen.queryByText(/headings_title/)).not.toBeInTheDocument();
});
