import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import ForgetPassword from "./ForgetPassword"
import { clearAuthData } from "../../helpers/authStorage.jsx"
import { getLoginCaptcha, requestPasswordReset, resetPassword } from "../../services/authService.jsx"

jest.mock("../../services/authService.jsx", () => ({
  getLoginCaptcha: jest.fn(), requestPasswordReset: jest.fn(), resetPassword: jest.fn(),
}))
jest.mock("../../helpers/authStorage.jsx", () => ({ clearAuthData: jest.fn() }))

const LoginResult = () => {
  const location = useLocation()
  return <div>{location.state?.message || "login"}</div>
}
const renderPage = () => render(<MemoryRouter initialEntries={["/forgot-password"]}><Routes>
  <Route path="/forgot-password" element={<ForgetPassword />} />
  <Route path="/login" element={<LoginResult />} />
</Routes></MemoryRouter>)

beforeEach(() => {
  jest.clearAllMocks()
  getLoginCaptcha.mockResolvedValue({ enabled: false })
  requestPasswordReset.mockResolvedValue({ resetToken: "memory-only", expiresIn: 120, resendAfter: 60, message: "پیام عمومی" })
})

async function reachResetStep() {
  renderPage()
  fireEvent.change(await screen.findByLabelText("نام کاربری یا شماره موبایل"), { target: { value: "09123456789" } })
  fireEvent.click(screen.getByRole("button", { name: "ارسال کد بازیابی" }))
  await screen.findByText("پیام عمومی")
}

test("requests code, displays server countdowns and disables early resend", async () => {
  await reachResetStep()
  expect(requestPasswordReset).toHaveBeenCalledWith("09123456789", null)
  expect(screen.getByText("اعتبار کد: 2:00")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "ارسال مجدد (1:00)" })).toBeDisabled()
})

test("keeps reset submit disabled while passwords mismatch", async () => {
  await reachResetStep()
  fireEvent.change(screen.getByLabelText("کد بازیابی پنج‌رقمی"), { target: { value: "76290" } })
  fireEvent.change(screen.getByLabelText("رمز عبور جدید"), { target: { value: "NewPassword123" } })
  fireEvent.change(screen.getByLabelText("تکرار رمز عبور جدید"), { target: { value: "different" } })
  expect(screen.getByRole("button", { name: "ثبت رمز جدید" })).toBeDisabled()
  expect(screen.getByText("تکرار رمز عبور مطابقت ندارد")).toBeInTheDocument()
})

test("offers a new code after a 401 reset failure", async () => {
  resetPassword.mockRejectedValue({ response: { status: 401 } })
  await reachResetStep()
  fireEvent.change(screen.getByLabelText("کد بازیابی پنج‌رقمی"), { target: { value: "76290" } })
  fireEvent.change(screen.getByLabelText("رمز عبور جدید"), { target: { value: "NewPassword123" } })
  fireEvent.change(screen.getByLabelText("تکرار رمز عبور جدید"), { target: { value: "NewPassword123" } })
  fireEvent.click(screen.getByRole("button", { name: "ثبت رمز جدید" }))
  expect(await screen.findByText(/کد بازیابی اشتباه/)).toBeInTheDocument()
})

test("clears prior auth and redirects after a successful reset", async () => {
  resetPassword.mockResolvedValue(undefined)
  await reachResetStep()
  fireEvent.change(screen.getByLabelText("کد بازیابی پنج‌رقمی"), { target: { value: "76290" } })
  fireEvent.change(screen.getByLabelText("رمز عبور جدید"), { target: { value: "NewPassword123" } })
  fireEvent.change(screen.getByLabelText("تکرار رمز عبور جدید"), { target: { value: "NewPassword123" } })
  fireEvent.click(screen.getByRole("button", { name: "ثبت رمز جدید" }))
  await waitFor(() => expect(clearAuthData).toHaveBeenCalled())
  expect(await screen.findByText("رمز عبور با موفقیت تغییر کرد؛ وارد شوید")).toBeInTheDocument()
})
