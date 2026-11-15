import { apiGet, apiPatch } from "../helpers/httpClient.jsx";
import { getSchools, invalidateSchoolQueries, updateSchoolStatus } from "./schoolService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}));
jest.mock("../helpers/apiRoutes.jsx", () => ({
  API_ROUTES: {
    schools: {
      list: "/schools",
      updateStatus: (id) => `/schools/${id}/status`,
    },
  },
  getApiUrl: (path) => path,
}));

beforeEach(() => jest.clearAllMocks());

test("getSchools explicitly requests only active schools by default", async () => {
  apiGet.mockResolvedValue({
    data: { data: { items: [{ id: 1, status: 1, isActive: true }], meta: { total: 1 } } },
  });

  const result = await getSchools();

  expect(apiGet).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ params: expect.objectContaining({ status: "active" }) })
  );
  expect(result.items).toHaveLength(1);
  expect(result.items[0]).toMatchObject({ status: 1, isActive: true });
});

test("getSchools keeps management status separate from selector status", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: {} } } });

  await getSchools({ status: "all", page: 2, search: "آیسوق" });

  expect(apiGet.mock.calls[0][1].params).toMatchObject({
    status: "all",
    page: 2,
    search: "آیسوق",
  });
});

test("updateSchoolStatus sends a real boolean and unwraps the shared response", async () => {
  apiPatch.mockResolvedValue({
    data: { data: { id: 94, status: 0, isActive: false } },
  });

  await expect(updateSchoolStatus(94, false)).resolves.toMatchObject({
    id: 94,
    status: 0,
    isActive: false,
  });
  expect(apiPatch).toHaveBeenCalledWith(expect.stringContaining("/schools/94/status"), {
    isActive: false,
  });
  await expect(updateSchoolStatus(94, 0)).rejects.toThrow("isActive must be a boolean");
});

test("school invalidation identifies the changed school for mounted selectors", () => {
  const listener = jest.fn();
  window.addEventListener("schools:invalidated", listener);

  invalidateSchoolQueries({ schoolId: 94, isActive: false });

  expect(listener).toHaveBeenCalledWith(expect.objectContaining({
    detail: { schoolId: 94, isActive: false },
  }));
  window.removeEventListener("schools:invalidated", listener);
});
