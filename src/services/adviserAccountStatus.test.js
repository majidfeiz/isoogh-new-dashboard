import { apiPatch } from "../helpers/httpClient.jsx"
import { updateAdviserAccountStatus } from "./adviserService.jsx"
jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPost: jest.fn(), apiPatch: jest.fn(), apiDelete: jest.fn(), apiPut: jest.fn() }))
test("updates an adviser account only for the selected school", async () => {
  apiPatch.mockResolvedValue({ data: { data: { adviserId: 45, schoolId: 12, isActive: false } } })
  await expect(updateAdviserAccountStatus(45, { schoolId: "12", isActive: false })).resolves.toEqual({ adviserId: 45, schoolId: 12, isActive: false })
  expect(apiPatch).toHaveBeenCalledWith("http://127.0.0.1:8040/advisers/45/account-status", { schoolId: 12, isActive: false }, { silent: true })
})
