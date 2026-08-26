import { apiDelete, apiGet, apiPatch, apiPut } from "../helpers/httpClient.jsx";
import {
  detachAdviserSubordinate,
  exportAdviserSubordinates,
  getAdviserSubordinates,
  syncAdviserSubordinates,
  updateAdviserSuperStatus,
} from "./adviserService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPost: jest.fn(), apiPatch: jest.fn(), apiDelete: jest.fn(), apiPut: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

test("promotes and demotes advisers in the selected school", async () => {
  apiPatch.mockResolvedValue({ data: { data: { id: 5 } } });
  await updateAdviserSuperStatus(5, { schoolId: "12", isSuper: true });
  await updateAdviserSuperStatus(5, { schoolId: 12, isSuper: false });
  expect(apiPatch.mock.calls[0]).toEqual(["http://127.0.0.1:8040/advisers/5/super-status", { schoolId: 12, isSuper: true }, { silent: true }]);
  expect(apiPatch.mock.calls[1][1]).toEqual({ schoolId: 12, isSuper: false });
});

test("sends server-side subordinate pagination, search, grade and sorting", async () => {
  const controller = new AbortController();
  apiGet.mockResolvedValue({ data: { data: { items: [{ id: 2 }], meta: { page: 3, limit: 10, total: 21, lastPage: 3 } } } });
  const result = await getAdviserSubordinates(5, { schoolId: 12, page: 3, search: "علی", gradeId: 4, sortBy: "name", sortOrder: "ASC", signal: controller.signal });
  expect(result.pagination).toEqual({ page: 3, limit: 10, total: 21, lastPage: 3 });
  expect(apiGet.mock.calls[0][1]).toEqual(expect.objectContaining({ signal: controller.signal, params: expect.objectContaining({ schoolId: 12, page: 3, search: "علی", gradeId: 4, sortBy: "name", sortOrder: "ASC" }) }));
});

test("syncs the full selection including an empty selection", async () => {
  apiPut.mockResolvedValue({ data: { data: { assigned: 0, detached: 2, total: 0 } } });
  await syncAdviserSubordinates(5, { schoolId: 12, adviserIds: [] });
  expect(apiPut).toHaveBeenCalledWith("http://127.0.0.1:8040/advisers/5/subordinates", { schoolId: 12, adviserIds: [] }, { silent: true });
});

test("detaches one subordinate in the selected school", async () => {
  apiDelete.mockResolvedValue({ data: { data: { detached: true } } });
  await expect(detachAdviserSubordinate(5, 21, "12")).resolves.toEqual({ detached: true });
  expect(apiDelete).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/advisers/5/subordinates/21",
    { params: { schoolId: 12 }, silent: true }
  );
});

test("exports active filters and reads the UTF-8 filename", async () => {
  const blob = new Blob(["csv"]);
  apiGet.mockResolvedValue({ data: blob, headers: { "content-disposition": "attachment; filename*=UTF-8''subordinates%20fa.csv" } });
  await expect(exportAdviserSubordinates(5, { schoolId: 12, search: "علی", gradeId: 4, sortBy: "id", sortOrder: "DESC" })).resolves.toEqual({ blob, filename: "subordinates fa.csv" });
  expect(apiGet.mock.calls[0][1]).toEqual(expect.objectContaining({ responseType: "blob", params: { schoolId: 12, search: "علی", gradeId: 4, sortBy: "id", sortOrder: "DESC" } }));
});
