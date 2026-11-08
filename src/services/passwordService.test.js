import { apiPatch, apiPost } from "../helpers/httpClient.jsx"
import { requestPasswordReset, resetPassword } from "./authService.jsx"
import { changePassword } from "./profileService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(), apiPost: jest.fn(), apiPatch: jest.fn(),
}))
jest.mock("../helpers/authStorage.jsx", () => ({
  setAuthData: jest.fn(), clearAuthData: jest.fn(),
}))

beforeEach(() => jest.clearAllMocks())

test("requests a recovery code and unwraps response.data.data", async () => {
  const payload = { resetToken: "temporary", expiresIn: 120, resendAfter: 60 }
  apiPost.mockResolvedValue({ data: { data: payload } })
  await expect(requestPasswordReset("09123456789", { captchaToken: "cap", captchaAnswer: "11" })).resolves.toEqual(payload)
  expect(apiPost).toHaveBeenCalledWith("http://127.0.0.1:8040/auth/password/forgot", {
    identifier: "09123456789", captchaToken: "cap", captchaAnswer: "11",
  }, { silent: true })
})

test("sends only reset token, five-digit code and new password", async () => {
  apiPost.mockResolvedValue({ data: { data: null } })
  await resetPassword({ resetToken: "temporary", code: "76290", newPassword: "NewPassword123", confirmPassword: "ignored" })
  expect(apiPost).toHaveBeenCalledWith("http://127.0.0.1:8040/auth/password/reset", {
    resetToken: "temporary", code: "76290", newPassword: "NewPassword123",
  }, { silent: true, preserveAuthOn401: true })
})

test("change password excludes confirmation and preserves auth on a wrong-current-password response", async () => {
  apiPatch.mockResolvedValue({ data: { data: null } })
  await changePassword({ current_password: "old", new_password: "new-password", confirm_password: "ignored" })
  expect(apiPatch).toHaveBeenCalledWith("http://127.0.0.1:8040/profile/password", {
    current_password: "old", new_password: "new-password",
  }, { silent: true, preserveAuthOn401: true })
})
