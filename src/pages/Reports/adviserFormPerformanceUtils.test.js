import { displayValue, filenameFromContentDisposition, sortQuestions } from "./adviserFormPerformanceUtils.js"

test("sorts questions by order while preserving duplicate titles as separate ids", () => {
  const result = sortQuestions([{ id: 9, title: "تکراری", order: 2 }, { id: 3, title: "تکراری", order: 1 }])
  expect(result.map(({ id }) => `question-${id}`)).toEqual(["question-3", "question-9"])
})

test("displays only nullish answers as dash", () => {
  expect(displayValue(null)).toBe("—")
  expect(displayValue(0)).toBe("0")
  expect(displayValue("")).toBe("")
})

test("reads utf-8 and regular filenames with the required fallback", () => {
  expect(filenameFromContentDisposition("attachment; filename*=UTF-8''%DA%AF%D8%B2%D8%A7%D8%B1%D8%B4.xlsx")).toBe("گزارش.xlsx")
  expect(filenameFromContentDisposition("attachment; filename=custom.xlsx")).toBe("custom.xlsx")
  expect(filenameFromContentDisposition("")).toBe("adviser-form-performance-report.xlsx")
})
