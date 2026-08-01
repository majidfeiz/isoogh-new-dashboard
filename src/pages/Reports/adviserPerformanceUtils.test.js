import {
  displayAdviserPerformanceValue,
  parseAdviserPerformanceQuery,
  serializeAdviserPerformanceQuery,
  sortedAdviserPerformanceQuestions,
} from "./adviserPerformanceUtils.js"

test("parses and serializes adviser performance URL state", () => {
  const query = parseAdviserPerformanceQuery(new URLSearchParams(
    "schoolId=2&formId=14&studentSearch=علی&adviserSearch=رضا&page=3&limit=25"
  ))
  expect(query).toEqual({
    schoolId: "2", formId: "14", studentSearch: "علی", adviserSearch: "رضا", page: 3, limit: 25,
  })
  expect(serializeAdviserPerformanceQuery(query).toString()).toContain("page=3")
  expect(parseAdviserPerformanceQuery(new URLSearchParams("page=0&limit=101"))).toEqual(expect.objectContaining({ page: 1, limit: 15 }))
})

test("sorts dynamic questions and maps empty values", () => {
  expect(sortedAdviserPerformanceQuestions([
    { id: 2, order: 20 }, { id: 1, order: 10 },
  ]).map((item) => item.id)).toEqual([1, 2])
  expect(displayAdviserPerformanceValue(null)).toBe("—")
  expect(displayAdviserPerformanceValue(" ")).toBe("—")
  expect(displayAdviserPerformanceValue("پاسخ")).toBe("پاسخ")
})
