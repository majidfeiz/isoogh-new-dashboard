import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import DurationProcessing from "./DurationProcessing"
import { useAuth } from "../../../context/AuthContext"
import { executeDurationProcessing, updateDurationProcessingSettings } from "../../../services/voipDurationProcessingService"
import { useDurationProcessingLogs, useDurationProcessingStatus } from "./useDurationProcessingQueries"

jest.mock("../../../components/Common/Breadcrumb", () => () => null)
jest.mock("../../../components/Common/Paginations", () => () => null)
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), info: jest.fn() } }))
jest.mock("../../../context/AuthContext", () => ({ useAuth: jest.fn() }))
jest.mock("../../../services/voipDurationProcessingService", () => ({ executeDurationProcessing: jest.fn(), updateDurationProcessingSettings: jest.fn() }))
jest.mock("./useDurationProcessingQueries", () => ({ useDurationProcessingLogs: jest.fn(), useDurationProcessingStatus: jest.fn() }))

const status = { settings: { enabled: true, workerCount: 2, concurrency: 100 }, environmentEnabled: true, effectiveEnabled: true, total: 100, processed: 50, calculated: 49, invalid: 1, pending: 50, progressPercent: 50, estimatedRemainingSeconds: 3600, recordsPerSecond: 2, lastRunAt: null }
const refetchStatus = jest.fn().mockResolvedValue(status)
const refetchLogs = jest.fn().mockResolvedValue(undefined)

beforeEach(() => {
  jest.clearAllMocks()
  refetchStatus.mockResolvedValue(status)
  refetchLogs.mockResolvedValue(undefined)
  useDurationProcessingStatus.mockReturnValue({ data: status, loading: false, refreshing: false, error: "", refetch: refetchStatus })
  useDurationProcessingLogs.mockReturnValue({ items: [], meta: { page: 1, limit: 20, total: 0 }, loading: false, error: "", refetch: refetchLogs })
})

const renderPage = () => render(<MemoryRouter><DurationProcessing /></MemoryRouter>)

test("hides update and execute controls without permissions", () => {
  useAuth.mockReturnValue({ hasPermission: () => false })
  renderPage()
  expect(screen.queryByRole("button", { name: /اجرای فوری/ })).not.toBeInTheDocument()
  expect(screen.queryByRole("button", { name: "ذخیره تنظیمات" })).not.toBeInTheDocument()
  expect(screen.getByLabelText("تعداد worker")).toBeDisabled()
})

test("validates worker count and concurrency before saving", async () => {
  useAuth.mockReturnValue({ hasPermission: () => true })
  renderPage()
  fireEvent.change(screen.getByLabelText("تعداد worker"), { target: { value: "21" } })
  fireEvent.change(screen.getByLabelText("Concurrency هر worker"), { target: { value: "0" } })
  fireEvent.click(screen.getByRole("button", { name: "ذخیره تنظیمات" }))
  expect(await screen.findByText("تعداد worker باید عددی بین ۱ تا ۲۰ باشد.")).toBeInTheDocument()
  expect(screen.getByText("Concurrency باید عددی بین ۱ تا ۵۰۰ باشد.")).toBeInTheDocument()
  expect(updateDurationProcessingSettings).not.toHaveBeenCalled()
})

test("executes immediately and refreshes status and logs", async () => {
  useAuth.mockReturnValue({ hasPermission: () => true })
  executeDurationProcessing.mockResolvedValue({ accepted: true, processed: 5, reason: null })
  renderPage()
  fireEvent.click(screen.getByRole("button", { name: /اجرای فوری/ }))
  await waitFor(() => expect(executeDurationProcessing).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(refetchStatus).toHaveBeenCalledWith({ background: true }))
  await waitFor(() => expect(refetchLogs).toHaveBeenCalled())
})
