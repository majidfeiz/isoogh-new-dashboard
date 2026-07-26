import { apiGet } from "../helpers/httpClient.jsx"
import { getStudentContactCallAnswers } from "./studentContactRecordService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
}))

beforeEach(() => {
  apiGet.mockReset()
})

test("loads one call answer sheet from the dedicated endpoint and unwraps the envelope", async () => {
  const controller = new AbortController()
  apiGet.mockResolvedValue({
    data: {
      data: {
        call: { callId: 500, formTitle: "پیگیری هفتگی" },
        answers: [{ questionId: 41, answer: ["مناسب"] }],
      },
    },
  })

  const result = await getStudentContactCallAnswers(125, 500, controller.signal)

  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/reports/student-contact-records/125/calls/500/answers",
    { signal: controller.signal, timeout: 30000 }
  )
  expect(result.answers).toEqual([{ questionId: 41, answer: ["مناسب"] }])
})
