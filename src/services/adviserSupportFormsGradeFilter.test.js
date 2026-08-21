import { apiGet } from "../helpers/httpClient.jsx";
import { getAdviserSupportForms } from "./adviserPortalService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPost: jest.fn(), apiPatch: jest.fn(), apiDelete: jest.fn() }));

beforeEach(() => apiGet.mockReset());

test("sends gradeId with existing server-side list parameters", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: { page: 1, total: 0 } } } });
  await getAdviserSupportForms({ schoolId: 98, page: 1, limit: 15, search: "فرم", sortBy: "created_at", sortOrder: "ASC", gradeId: 6 });
  expect(apiGet.mock.calls[0][1].params).toEqual({ page: 1, limit: 15, search: "فرم", sortBy: "created_at", sortOrder: "ASC", gradeId: 6 });
});

test("omits gradeId when all grades is selected", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [] } } });
  await getAdviserSupportForms({ schoolId: 98, gradeId: "" });
  expect(apiGet.mock.calls[0][1].params.gradeId).toBeUndefined();
});
