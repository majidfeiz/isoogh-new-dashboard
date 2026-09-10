import { apiGet } from "../helpers/httpClient.jsx";
import {
  getQuestionHintFormOptions,
  getQuestionHintQuestionOptions,
} from "./supportFormService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(), apiPost: jest.fn(), apiPut: jest.fn(), apiDelete: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

test("loads paginated previous-form options with school and server search", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [{ id: 4, title: "فرم قبلی" }], meta: { page: 2, limit: 20, total: 22, lastPage: 2 } } } });
  await expect(getQuestionHintFormOptions({ schoolId: 146, search: "قبلی", page: 2, limit: 20 })).resolves.toEqual({
    items: [{ id: 4, title: "فرم قبلی" }],
    pagination: { page: 2, limit: 20, total: 22, lastPage: 2 },
  });
  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/support-forms/question-hint-form-options",
    { params: { schoolId: 146, search: "قبلی", page: 2, limit: 20 } }
  );
});

test("loads questions only from the selected source form", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [{ id: 8, title: "نتیجه تماس" }], meta: { page: 1, limit: 20, total: 1, lastPage: 1 } } } });
  await getQuestionHintQuestionOptions(4, { schoolId: 146, search: "نتیجه", page: 1, limit: 20 });
  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/support-forms/question-hint-form-options/4/questions",
    { params: { schoolId: 146, search: "نتیجه", page: 1, limit: 20 } }
  );
});
