import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx"
import { getAdviserFormStudents, getStudentAnswers, getStudentCallLogs, makeCall, submitAnswers, updateAdviserStudentWorkShift } from "./adviserPortalService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}))

beforeEach(() => {
  apiGet.mockReset()
  apiPatch.mockReset()
  apiPost.mockReset()
})

test("sends an incomplete form adviser override as boolean true and reads the server status", async () => {
  apiPost.mockResolvedValue({
    data: { data: { count: 1, isComplete: false, status: 1 } },
  })

  const result = await submitAnswers({
    formId: 14,
    studentId: 255046,
    voipCallId: 12345,
    callSuccessful: true,
    answers: [{ questionId: 10, answer: "پاسخ" }],
  })

  expect(apiPost).toHaveBeenCalledTimes(1)
  expect(apiPost).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/adviser-portal/support-forms/14/students/255046/answers",
    {
      answers: [{ questionId: 10, answer: "پاسخ" }],
      callSuccessful: true,
      voipCallId: 12345,
    },
    { silent: true }
  )
  expect(typeof apiPost.mock.calls[0][1].callSuccessful).toBe("boolean")
  expect(result).toEqual({ count: 1, isComplete: false, status: 1 })
})

test("rejects submitting answers without a current VoIP call id", async () => {
  await expect(submitAnswers({
    formId: 14,
    studentId: 255046,
    voipCallId: null,
    callSuccessful: true,
    answers: [{ questionId: 10, answer: "پاسخ" }],
  })).rejects.toThrow("voipCallId is required")
  expect(apiPost).not.toHaveBeenCalled()
})

test("loads exactly the answer session for the requested VoIP call", async () => {
  apiGet.mockResolvedValue({ data: { data: [{ voipCallId: 3780529, answers: [] }] } })
  await expect(getStudentAnswers(14, 255046, 3780529)).resolves.toEqual([{ voipCallId: 3780529, answers: [] }])
  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/adviser-portal/support-forms/14/students/255046/answers",
    { params: { voipCallId: 3780529 }, silent: true }
  )
})

test("normalizes the new VoIP call id from snake-case call responses", async () => {
  apiPost.mockResolvedValue({ data: { data: { voip_call_id: 456, call_group_id: "group-1" } } })
  await expect(makeCall({ supportFormId: 14, studentId: 20 })).resolves.toEqual(expect.objectContaining({
    voipCallId: 456,
    callGroupId: "group-1",
  }))
})

test("uses the call-log row id as voipCallId for historical questionnaires", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [{ id: 3521346, hasAnswers: false }], meta: {} } } })
  await expect(getStudentCallLogs({ formId: 14, studentId: 20 })).resolves.toEqual(expect.objectContaining({
    items: [expect.objectContaining({ id: 3521346, voipCallId: 3521346 })],
  }))
})

test("deduplicates answer sessions only by voipCallId", async () => {
  apiGet.mockResolvedValue({ data: { data: [
    { voipCallId: 10, answers: [{ id: 1 }] },
    { voipCallId: 10, answers: [{ id: 2 }] },
    { voipCallId: 11, answers: [] },
    { answers: [{ id: 3 }] },
  ] } })
  await expect(getStudentAnswers(14, 255046)).resolves.toEqual([
    { voipCallId: 10, answers: [{ id: 1 }] },
    { voipCallId: 11, answers: [] },
  ])
})

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
    workShiftId: "2",
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
      workShiftId: 2,
      sortBy: "workShiftId",
      sortOrder: "DESC",
    }),
  }))
})

test("omits the work shift filter when all shifts are selected", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: {} } } })

  await getAdviserFormStudents({ formId: 14, workShiftId: "" })

  expect(apiGet.mock.calls[0][1].params.workShiftId).toBeUndefined()
})

test.each(["0", "1", "2"])("preserves call status %s as a numeric API filter", async (status) => {
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: {} } } })

  await getAdviserFormStudents({ formId: 14, status })

  expect(apiGet.mock.calls[0][1].params.status).toBe(Number(status))
})

test("updates work shift with the student id and uses the returned row values", async () => {
  apiPatch.mockResolvedValue({
    data: { data: { studentId: 437845, workShiftId: 5, workShift: { id: 5, name: "عصر" } } },
  })

  const result = await updateAdviserStudentWorkShift({
    formId: 14,
    studentId: 437845,
    workShiftId: 5,
  })

  expect(apiPatch).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/adviser-portal/support-forms/14/students/437845/work-shift",
    { workShiftId: 5 },
    { silent: true }
  )
  expect(result).toEqual({
    studentId: 437845,
    workShiftId: 5,
    workShift: { id: 5, name: "عصر" },
  })
})
