import React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import StudentContactRecordDetail from "./StudentContactRecordDetail.jsx"
import {
  getStudentContactCallAnswers,
  getStudentContactRecord,
} from "../../services/studentContactRecordService.jsx"

jest.mock("../../services/studentContactRecordService.jsx", () => ({
  getStudentContactCallAnswers: jest.fn(),
  getStudentContactRecord: jest.fn(),
}))

jest.mock("../../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: { roles: [{ name: "admin" }] },
    hasPermission: (permission) => permission === "reports.student-contact-records.show",
  }),
}))

jest.mock("../../components/Common/Breadcrumb.jsx", () => () => null)
jest.mock("../../components/Common/Paginations.jsx", () => () => null)

const response = {
  student: { studentId: 125, studentName: "سارا محمدی", tags: [] },
  summary: {},
  forms: [{
    formId: 8,
    formTitle: "پیگیری هفتگی",
    status: "completed",
    answers: [{ questionId: 41, question: "وضعیت مطالعه چگونه است؟", answer: "مناسب", isAnswered: true }],
  }],
  calls: [{
    callId: 500,
    formId: 8,
    formTitle: "پیگیری هفتگی",
    status: "ANSWERED",
    statusLabel: "پاسخ داده شده",
    answers: [],
  }],
  meta: { page: 1, limit: 10, total: 1, lastPage: 1 },
}

beforeEach(() => {
  getStudentContactRecord.mockReset()
  getStudentContactCallAnswers.mockReset()
})

test("call history is above forms and view answers opens the selected call modal", async () => {
  getStudentContactRecord.mockResolvedValue(response)
  getStudentContactCallAnswers.mockResolvedValue({
    call: response.calls[0],
    answers: [
      ...response.forms[0].answers,
      { questionId: 41, question: "توضیح تکمیلی", answer: "ادامه دارد", isAnswered: true },
      { questionId: 42, question: "گزینه‌ها", answer: ["گزینه اول", "گزینه دوم"], isAnswered: true },
      { questionId: 43, question: "مقدار صفر", answer: 0, isAnswered: true },
      { questionId: 44, question: "مقدار منطقی", answer: false, isAnswered: true },
      { questionId: 45, question: "بدون پاسخ", answer: null, isAnswered: false },
    ],
  })
  render(
    <MemoryRouter initialEntries={["/reports/student-contact-records/125"]}>
      <Routes>
        <Route path="/reports/student-contact-records/:studentId" element={<StudentContactRecordDetail />} />
      </Routes>
    </MemoryRouter>
  )

  expect(await screen.findByText("سارا محمدی")).toBeInTheDocument()
  const callsCard = screen.getByText("تاریخچه تماس‌ها").closest(".card")
  const formsCard = screen.getByText("تاریخچه فرم‌های تماس").closest(".card")
  expect(callsCard).toHaveClass("order-1")
  expect(formsCard).toHaveClass("order-2")

  fireEvent.click(screen.getByRole("button", { name: "مشاهده پاسخ‌های تماس 500" }))

  const dialog = await screen.findByRole("dialog")
  expect(await within(dialog).findByText("وضعیت مطالعه چگونه است؟")).toBeInTheDocument()
  expect(within(dialog).getByText("مناسب")).toBeInTheDocument()
  expect(within(dialog).getByText("ادامه دارد")).toBeInTheDocument()
  expect(within(dialog).getByText("گزینه اول")).toBeInTheDocument()
  expect(within(dialog).getByText("0")).toBeInTheDocument()
  expect(within(dialog).getByText("خیر")).toBeInTheDocument()
  expect(getStudentContactRecord).toHaveBeenCalledTimes(1)
  expect(getStudentContactCallAnswers).toHaveBeenCalledWith("125", 500, expect.any(AbortSignal))
})

test("shows an explicit empty state when the backend returns no call or form answers", async () => {
  getStudentContactRecord.mockResolvedValue({
    ...response,
    forms: [{ ...response.forms[0], answers: [] }],
    calls: [{ ...response.calls[0], answers: [] }],
  })
  getStudentContactCallAnswers.mockResolvedValue({
    call: response.calls[0],
    answers: [],
  })
  render(
    <MemoryRouter initialEntries={["/reports/student-contact-records/125"]}>
      <Routes>
        <Route path="/reports/student-contact-records/:studentId" element={<StudentContactRecordDetail />} />
      </Routes>
    </MemoryRouter>
  )

  expect(await screen.findByText("سارا محمدی")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "مشاهده پاسخ‌های تماس 500" }))

  const dialog = await screen.findByRole("dialog")
  expect(await within(dialog).findByText("پاسخ‌نامه‌ای برای این تماس یافت نشد.")).toBeInTheDocument()
  expect(getStudentContactRecord).toHaveBeenCalledTimes(1)
  expect(getStudentContactCallAnswers).toHaveBeenCalledWith("125", 500, expect.any(AbortSignal))
})
