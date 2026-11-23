import { apiGet, apiPost } from "../helpers/httpClient.jsx";
import { bulkAttachSupportFormAdvisers, getSupportFormAdviserCandidates } from "./supportFormService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPost: jest.fn(), apiPut: jest.fn(), apiPatch: jest.fn(), apiDelete: jest.fn() }));

test("sends the complete server pagination contract and unwraps meta", async () => {
  const controller = new AbortController();
  apiGet.mockResolvedValue({ data: { data: { items: [{ id: 12 }], meta: { page: 2, limit: 10, total: 24, lastPage: 3 } } } });
  const params = { page: 2, limit: 10, gradeId: 15, search: "مریم", sortBy: "id", sortOrder: "DESC" };
  await expect(getSupportFormAdviserCandidates(3315, params, controller.signal)).resolves.toMatchObject({ pagination: { page: 2, total: 24, lastPage: 3 } });
  expect(apiGet).toHaveBeenCalledWith(expect.stringMatching(/support-forms\/3315\/adviser-candidates$/), { params, signal: controller.signal });
});

test("submits selected adviser ids from multiple pages in one request", async () => {
  apiPost.mockResolvedValue({ data: { success: true } });
  await bulkAttachSupportFormAdvisers(3315, [12, 18, 31]);
  expect(apiPost).toHaveBeenCalledWith(expect.stringMatching(/support-forms\/3315\/set-advisers$/), { adviser_ids: [12, 18, 31] });
});
