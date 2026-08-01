import { apiGet } from "../helpers/httpClient.jsx"
import { getAdviserFormStudents } from "./adviserPortalService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}))

beforeEach(() => apiGet.mockReset())

test("normalizes zero and populated call counts and preserves pagination", async () => {
  apiGet.mockResolvedValue({
    data: {
      data: {
        items: [
          { id: 1, callCount: 0, successfulCallCount: 0, failedCallCount: 0, totalCallCount: 0 },
          { id: 2, callCount: 99, successfulCallCount: 2, failedCallCount: 3, totalCallCount: 5 },
        ],
        meta: { page: 3, limit: 15, total: 34, lastPage: 3 },
      },
    },
  })

  const result = await getAdviserFormStudents({ formId: 14, page: 3, limit: 15 })

  expect(result.items[0]).toEqual(expect.objectContaining({
    successfulCallCount: 0,
    failedCallCount: 0,
    totalCallCount: 0,
  }))
  expect(result.items[1]).toEqual(expect.objectContaining({
    successfulCallCount: 2,
    failedCallCount: 3,
    totalCallCount: 5,
  }))
  expect(result.items[1].totalCallCount).toBe(
    result.items[1].successfulCallCount + result.items[1].failedCallCount
  )
  expect(result.pagination).toEqual({ page: 3, limit: 15, total: 34, lastPage: 3 })
  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/adviser-portal/support-forms/14/students",
    expect.objectContaining({
      params: expect.objectContaining({ page: 3, limit: 15, sortBy: "id", sortOrder: "ASC" }),
    })
  )
})

test("falls back to legacy callCount and never returns undefined or NaN counts", async () => {
  apiGet.mockResolvedValue({
    data: {
      data: {
        items: [
          { id: 1, callCount: 5, successfulCallCount: 2 },
          { id: 2 },
          { id: 3, callCount: "invalid", successfulCallCount: "invalid", failedCallCount: NaN },
        ],
        meta: { page: 1, limit: 15, total: 3, lastPage: 1 },
      },
    },
  })

  const { items } = await getAdviserFormStudents({ formId: 14 })

  expect(items[0]).toEqual(expect.objectContaining({
    successfulCallCount: 2,
    failedCallCount: 3,
    totalCallCount: 5,
  }))
  for (const item of items) {
    for (const key of ["successfulCallCount", "failedCallCount", "totalCallCount"]) {
      expect(item[key]).toEqual(expect.any(Number))
      expect(Number.isNaN(item[key])).toBe(false)
    }
  }
})

test("sends server-side work shift sorting with filters, pagination and abort signal", async () => {
  const controller = new AbortController()
  apiGet.mockResolvedValue({
    data: { data: { items: [], meta: { page: 2, limit: 15, total: 0, lastPage: 1 } } },
  })

  await getAdviserFormStudents({
    formId: 14,
    page: 2,
    search: "علی",
    status: "1",
    sortBy: "workShiftId",
    sortOrder: "DESC",
    signal: controller.signal,
  })

  expect(apiGet.mock.calls[0][1]).toEqual(expect.objectContaining({
    signal: controller.signal,
    params: expect.objectContaining({
      page: 2,
      search: "علی",
      status: 1,
      sortBy: "workShiftId",
      sortOrder: "DESC",
    }),
  }))
})
