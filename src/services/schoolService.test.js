import { apiGet, apiPatch } from "../helpers/httpClient.jsx";
import { getSchools, invalidateActiveSchoolLists, updateSchoolStatus } from "./schoolService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}));
jest.mock("../helpers/apiRoutes.jsx", () => ({
  API_ROUTES: { schools: { list: "/schools", update: (id) => `/schools/${id}` } },
  getApiUrl: (path) => path,
}));

beforeEach(() => jest.clearAllMocks());

test("public school list uses the active-only endpoint without an invented status parameter", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [{ id: 1, status: 1 }], meta: { total: 1 } } } });

  const result = await getSchools({ page: 1, limit: 20 });

  expect(apiGet).toHaveBeenCalledWith("/schools", {
    params: expect.not.objectContaining({ status: expect.anything() }),
    signal: undefined,
  });
  expect(result.items).toEqual([{ id: 1, status: 1 }]);
});

test("updates school status with PATCH /schools/:id and numeric status", async () => {
  apiPatch.mockResolvedValue({ data: { data: { id: 94, status: 0 } } });

  await expect(updateSchoolStatus(94, 0)).resolves.toEqual({ id: 94, status: 0 });
  expect(apiPatch).toHaveBeenCalledWith("/schools/94", { status: 0 });
  await expect(updateSchoolStatus(94, "0")).rejects.toThrow("status must be 0 or 1");
});

test("publishes active-list invalidation details", () => {
  const listener = jest.fn();
  window.addEventListener("active-schools:invalidated", listener);
  invalidateActiveSchoolLists({ schoolId: 94, status: 0 });
  expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { schoolId: 94, status: 0 } }));
  window.removeEventListener("active-schools:invalidated", listener);
});
