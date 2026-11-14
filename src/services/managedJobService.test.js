import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { executeManagedJob, getManagedJobs, getManagedJobRun, updateManagedJob } from "./managedJobService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPatch: jest.fn(), apiPost: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

test("unwraps response.data and pagination instead of returning the HTTP wrapper", async () => {
  apiGet.mockResolvedValue({ data: { success: true, data: { items: [{ key: "job" }], meta: { page: 2, limit: 20, total: 21, lastPage: 2 } } } });
  await expect(getManagedJobs({ page: 2, limit: 20 })).resolves.toEqual({
    items: [{ key: "job" }],
    meta: { page: 2, limit: 20, total: 21, lastPage: 2 },
  });
});

test("sends only explicit patch fields", async () => {
  apiPatch.mockResolvedValue({ data: { data: { key: "job", enabled: false } } });
  await updateManagedJob("job", { enabled: false, name: "must-not-send" });
  expect(apiPatch).toHaveBeenCalledWith("/managed-jobs/job", { enabled: false }, { silent: true });
});

test("manual execution sends only the trimmed required reason", async () => {
  apiPost.mockResolvedValue({ data: { data: { id: 7 } } });
  await executeManagedJob("job", "  maintenance  ");
  expect(apiPost).toHaveBeenCalledWith("/managed-jobs/job/execute", { reason: "maintenance" }, { silent: true });
});

test("loads one run from response.data", async () => {
  apiGet.mockResolvedValue({ data: { data: { id: 9, status: "running" } } });
  await expect(getManagedJobRun(9)).resolves.toEqual({ id: 9, status: "running" });
});
