import { apiPost } from "../helpers/httpClient.jsx"
import {
  normalizeSupportFormActive,
  normalizeSupportFormActiveValue,
  normalizeSupportFormAdviserConnections,
  toggleSupportFormAdviserActive,
} from "./supportFormService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}))

beforeEach(() => {
  apiPost.mockReset()
})

test.each([
  [1, true],
  ["1", true],
  [0, false],
  ["0", false],
  [false, false],
  ["false", false],
])("normalizes adviser support-form active value %p", (value, expected) => {
  expect(normalizeSupportFormActive(value)).toBe(expected)
  expect(normalizeSupportFormActiveValue(value)).toBe(expected ? 1 : 0)
})

test("posts numeric is_active and preserves the normalized server response", async () => {
  apiPost.mockResolvedValue({ data: { data: { adviser_id: 9, support_form_id: 14, is_active: 0 } } })

  await expect(toggleSupportFormAdviserActive(14, 9, 0)).resolves.toEqual({
    adviser_id: 9,
    support_form_id: 14,
    is_active: 0,
  })
  expect(apiPost).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/support-forms/14/9/active",
    { is_active: 0 }
  )
})

test("deduplicates legacy adviser-form connections with inactive status taking priority", () => {
  const items = normalizeSupportFormAdviserConnections([
    { id: 1, adviser_id: 9, support_form_id: 14, is_active: 1 },
    { id: 2, adviser_id: 9, support_form_id: 14, is_active: "0" },
    { id: 3, adviser_id: 10, support_form_id: 14, is_active: "1" },
  ], 14)

  expect(items).toHaveLength(2)
  expect(items.find((item) => item.adviser_id === 9)?.is_active).toBe(0)
  expect(items.find((item) => item.adviser_id === 10)?.is_active).toBe(1)
})

test("rejects boolean and string payloads before making a request", async () => {
  await expect(toggleSupportFormAdviserActive(14, 9, false)).rejects.toThrow("numeric 0 or 1")
  await expect(toggleSupportFormAdviserActive(14, 9, "0")).rejects.toThrow("numeric 0 or 1")
  expect(apiPost).not.toHaveBeenCalled()
})
