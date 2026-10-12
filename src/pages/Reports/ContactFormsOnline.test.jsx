import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import ContactFormsOnline from "./ContactFormsOnline.jsx"
import { getSupportForms } from "../../services/supportFormService.jsx"

jest.mock("../../services/supportFormService.jsx", () => ({ getSupportForms: jest.fn() }))
jest.mock("../../services/schoolService.jsx", () => ({ getSchools: jest.fn() }))
jest.mock("../../services/reportService.jsx", () => ({ getContactFormsOnlineReport: jest.fn(), exportContactFormsOnlineReport: jest.fn() }))
jest.mock("../../components/Common/Breadcrumb", () => () => null)
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ permissions: ["reports.contact-forms-online.index"], user: { roles: ["manager"] } }) }))
jest.mock("react-select", () => (props) => <div>
  <input aria-label="جستجوی فرم تماس" onChange={(event) => props.onInputChange(event.target.value, { action: "input-change" })} />
  <button type="button" onClick={props.onMenuScrollToBottom}>انتهای فهرست فرم‌ها</button>
  {props.options.map((form) => <span key={form.id}>{props.getOptionLabel(form)}</span>)}
</div>)

beforeEach(() => {
  jest.clearAllMocks()
  getSupportForms.mockResolvedValue({
    items: [{ id: 1, title: "فرم اول" }],
    pagination: { page: 1, limit: 20, total: 45, lastPage: 3 },
  })
})

const renderPage = () => render(<MemoryRouter><ContactFormsOnline /></MemoryRouter>)

test("loads support forms in server-paginated pages instead of a fixed 100-item request", async () => {
  renderPage()
  expect(await screen.findByText("فرم اول")).toBeInTheDocument()
  expect(getSupportForms).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, limit: 20, search: "", signal: expect.any(AbortSignal) }))

  getSupportForms.mockResolvedValueOnce({
    items: [{ id: 21, title: "فرم صفحه دوم" }],
    pagination: { page: 2, limit: 20, total: 45, lastPage: 3 },
  })
  fireEvent.click(screen.getByRole("button", { name: "انتهای فهرست فرم‌ها" }))
  expect(await screen.findByText("فرم صفحه دوم")).toBeInTheDocument()
  expect(screen.getByText("فرم اول")).toBeInTheDocument()
  expect(getSupportForms).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, limit: 20, search: "" }))
})

test("debounces form search and sends it to the server from page one", async () => {
  renderPage()
  await screen.findByText("فرم اول")
  getSupportForms.mockClear()
  fireEvent.change(screen.getByLabelText("جستجوی فرم تماس"), { target: { value: "  هفتگی  " } })
  expect(getSupportForms).not.toHaveBeenCalled()
  await waitFor(() => expect(getSupportForms).toHaveBeenCalledWith(expect.objectContaining({
    page: 1, limit: 20, search: "هفتگی",
  })), { timeout: 1000 })
})
