import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import IncomingCallList from "./IncomingCallList.jsx"
import { getIncomingCalls } from "../../services/incomingCallService.jsx"
import { getSupportForms } from "../../services/supportFormService.jsx"

jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ hasPermission: () => false }) }))
jest.mock("../../services/incomingCallService.jsx", () => ({
  getIncomingCalls: jest.fn(),
  exportIncomingCalls: jest.fn(),
  saveIncomingCallsExport: jest.fn(),
  incomingCallErrorMessage: jest.fn(() => "خطا"),
}))
jest.mock("../../services/supportFormService.jsx", () => ({ getSupportForms: jest.fn() }))
jest.mock("../../components/Common/Breadcrumb.jsx", () => () => null)
jest.mock("../../components/Common/Paginations.jsx", () => () => null)
jest.mock("./IncomingCallsCommon.jsx", () => ({
  SchoolPicker: () => <div>مجموعه</div>,
  RequestState: () => null,
  formatDuration: (value) => `${value} ثانیه`,
  formatDateTime: (value) => value || "—",
}))
jest.mock("react-multi-date-picker", () => ({
  __esModule: true,
  default: () => null,
  DateObject: class DateObject {},
}))

test("renders incoming CDR values and audio file URL", async () => {
  getSupportForms.mockResolvedValue({ items: [] })
  getIncomingCalls.mockResolvedValue({
    items: [{
      id: 7,
      callerNumber: "09120000000",
      destination: "100",
      status: "routing",
      cdr: { type: "incoming", disposition: "ANSWERED" },
      durationSeconds: 42,
      startedAt: "cdr-start",
      endedAt: "cdr-end",
      student: null,
      adviser: null,
      supporter: null,
      supportForm: null,
      audioFiles: [{ id: 11, name: "incoming.mp3", url: "https://files.example/incoming.mp3" }],
    }],
    pagination: { page: 1, limit: 20, total: 1, lastPage: 1 },
  })
  render(<MemoryRouter initialEntries={["/incoming-calls?schoolId=94"]}><IncomingCallList /></MemoryRouter>)
  expect(await screen.findByText("پاسخ داده‌شده")).toBeInTheDocument()
  expect(screen.getByText("42 ثانیه")).toBeInTheDocument()
  expect(screen.getByText("cdr-start")).toBeInTheDocument()
  expect(screen.getByText("cdr-end")).toBeInTheDocument()
  const audio = screen.getByLabelText("incoming.mp3")
  expect(audio).toHaveAttribute("src", "https://files.example/incoming.mp3")
  expect(screen.getByRole("link", { name: "دانلود incoming.mp3" })).toHaveAttribute("href", "https://files.example/incoming.mp3")
  await waitFor(() => expect(getIncomingCalls).toHaveBeenCalledWith(expect.objectContaining({ schoolId: "94", sortBy: "startedAt", sortOrder: "DESC" })))
})
