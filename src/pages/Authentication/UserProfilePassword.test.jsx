import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import UserProfile from "./user-profile"
import { changePassword, getProfile } from "../../services/profileService.jsx"
import { getMySessions } from "../../services/sessionService.jsx"
import { clearAuthData } from "../../helpers/authStorage.jsx"

jest.mock("../../services/profileService.jsx", () => ({
  getProfile: jest.fn(), updateProfile: jest.fn(), changePassword: jest.fn(),
}))
jest.mock("../../services/sessionService.jsx", () => ({
  getMySessions: jest.fn(), revokeMySession: jest.fn(),
}))
jest.mock("../../helpers/authStorage.jsx", () => ({ clearAuthData: jest.fn() }))
jest.mock("../../context/AuthContext.jsx", () => ({
  useAuth: () => ({ refreshMe: jest.fn(), hasPermission: (permission) => permission === "profile.change-password" }),
}))

const LoginResult = () => {
  const location = useLocation()
  return <div>{location.state?.message || "login"}</div>
}

beforeEach(() => {
  jest.clearAllMocks()
  getProfile.mockResolvedValue({ id: 1, name: "کاربر", username: "user", roles: [], effectivePermissions: ["profile.change-password"] })
  getMySessions.mockResolvedValue([])
})

test("changes password without confirmation in the API payload, clears auth and redirects", async () => {
  changePassword.mockResolvedValue(null)
  render(<MemoryRouter initialEntries={["/profile"]}><Routes>
    <Route path="/profile" element={<UserProfile />} />
    <Route path="/login" element={<LoginResult />} />
  </Routes></MemoryRouter>)

  fireEvent.click(await screen.findByRole("button", { name: /تغییر رمز عبور/ }))
  fireEvent.change(screen.getByPlaceholderText("رمز عبور فعلی"), { target: { value: "OldPassword" } })
  fireEvent.change(screen.getByPlaceholderText("حداقل ۶ کاراکتر"), { target: { value: "NewPassword123" } })
  fireEvent.change(screen.getByPlaceholderText("تکرار رمز عبور جدید"), { target: { value: "NewPassword123" } })
  fireEvent.click(screen.getByRole("button", { name: /^تغییر رمز$/ }))

  await waitFor(() => expect(changePassword).toHaveBeenCalledWith({ current_password: "OldPassword", new_password: "NewPassword123" }))
  expect(clearAuthData).toHaveBeenCalled()
  expect(await screen.findByText("رمز عبور تغییر کرد؛ دوباره وارد شوید")).toBeInTheDocument()
})

test("shows a field error for a wrong current password without clearing auth", async () => {
  changePassword.mockRejectedValue({ response: { status: 401 } })
  render(<MemoryRouter><UserProfile /></MemoryRouter>)
  fireEvent.click(await screen.findByRole("button", { name: /تغییر رمز عبور/ }))
  fireEvent.change(screen.getByPlaceholderText("رمز عبور فعلی"), { target: { value: "wrong" } })
  fireEvent.change(screen.getByPlaceholderText("حداقل ۶ کاراکتر"), { target: { value: "NewPassword123" } })
  fireEvent.change(screen.getByPlaceholderText("تکرار رمز عبور جدید"), { target: { value: "NewPassword123" } })
  fireEvent.click(screen.getByRole("button", { name: /^تغییر رمز$/ }))
  expect(await screen.findByText("رمز عبور فعلی اشتباه است")).toBeInTheDocument()
  expect(clearAuthData).not.toHaveBeenCalled()
})
