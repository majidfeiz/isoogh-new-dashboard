import { apiDelete, apiGet, apiPost } from "../helpers/httpClient.jsx";
import {
  attachUserToParentTag,
  deleteParentTagValue,
  detachUserFromParentTag,
  downloadParentTagValueTemplate,
  getParentTagUsers,
  getParentTagStudentCandidates,
  importParentTagValues,
  saveParentTagValue,
} from "./parentTagService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(), apiPost: jest.fn(), apiPatch: jest.fn(), apiDelete: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

test("list pagination, search and sorting always carry the selected school", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [{ id: 1 }], meta: { page: 2, limit: 10, total: 21, lastPage: 3 } } } });
  const result = await getParentTagUsers(9, { schoolId: 94, page: 2, limit: 10, search: "علی", hasValue: "false", sortBy: "id", sortOrder: "DESC" });
  expect(result.pagination).toEqual({ page: 2, limit: 10, total: 21, lastPage: 3 });
  expect(apiGet).toHaveBeenCalledWith("http://127.0.0.1:8040/parent-tags/9/users", { params: { page: 2, limit: 10, search: "علی", schoolId: 94, hasValue: "false", sortBy: "id", sortOrder: "DESC" } });
});

test("upsert, delete, attach and detach use user id and school scope", async () => {
  apiPost.mockResolvedValue({ data: { data: {} } }); apiDelete.mockResolvedValue({ data: {} });
  await saveParentTagValue(9, { userId: 12, value: "پیگیری", schoolId: 94 });
  await attachUserToParentTag(9, { userId: 13, value: "78", schoolId: 94 });
  await deleteParentTagValue(9, 12, 94);
  await detachUserFromParentTag(9, 13, 94);
  expect(apiPost).toHaveBeenNthCalledWith(1, "http://127.0.0.1:8040/parent-tags/9/values", { user_id: 12, value: "پیگیری" }, { params: { schoolId: 94 } });
  expect(apiPost).toHaveBeenNthCalledWith(2, "http://127.0.0.1:8040/parent-tags/9/users", { user_id: 13, value: "78" }, { params: { schoolId: 94 } });
  expect(apiDelete).toHaveBeenNthCalledWith(1, "http://127.0.0.1:8040/parent-tags/9/values/12", { params: { schoolId: 94 } });
  expect(apiDelete).toHaveBeenNthCalledWith(2, "http://127.0.0.1:8040/parent-tags/9/users/13", { params: { schoolId: 94 } });
});

test("student autocomplete sends school, search and pagination and normalizes assigned rows", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [{ userId: 12, studentId: 34, name: "علی", username: "ali", ssn: "001", studentCode: "S1", alreadyAssigned: 1 }], meta: { page: 2, limit: 20, total: 21, lastPage: 2 } } } });
  const result = await getParentTagStudentCandidates(9, { schoolId: 94, search: "ali", page: 2, limit: 20 });
  expect(result.items[0]).toMatchObject({ userId: 12, studentId: 34, alreadyAssigned: true });
  expect(apiGet).toHaveBeenCalledWith("http://127.0.0.1:8040/parent-tags/9/student-candidates", { params: { schoolId: 94, search: "ali", page: 2, limit: 20 } });
});

test("attach omits an empty optional value", async () => {
  apiPost.mockResolvedValue({ data: {} });
  await attachUserToParentTag(9, { userId: 12, value: "   ", schoolId: 94 });
  expect(apiPost).toHaveBeenCalledWith("http://127.0.0.1:8040/parent-tags/9/users", { user_id: 12 }, { params: { schoolId: 94 } });
});

test.each([
  [false, "/parent-tags/9/value-import-template/download"],
  [true, "/parent-tags/9/value-delete-template/download"],
])("downloads the correct template as a blob", async (deleteTemplate, path) => {
  const blob = new Blob(["xlsx"]); apiGet.mockResolvedValue({ data: blob, headers: { "content-disposition": "attachment" } });
  await expect(downloadParentTagValueTemplate(9, 94, deleteTemplate)).resolves.toMatchObject({ blob });
  expect(apiGet).toHaveBeenCalledWith(`http://127.0.0.1:8040${path}`, { params: { schoolId: 94 }, responseType: "blob" });
});

test.each([
  [false, "/parent-tags/9/values/import"],
  [true, "/parent-tags/9/values/delete-import"],
])("uploads xlsx and keeps partial row result", async (deleteImport, path) => {
  const response = { total: 2, successful: 1, failed: 1, errors: [{ rowNumber: 3, username: null, reason: "نام کاربری خالی" }] };
  apiPost.mockResolvedValue({ data: { data: response } });
  const file = new File(["xlsx"], "values.xlsx");
  await expect(importParentTagValues(9, { file, schoolId: 94, deleteImport })).resolves.toEqual(response);
  expect(apiPost.mock.calls[0][0]).toBe(`http://127.0.0.1:8040${path}`);
  expect(apiPost.mock.calls[0][1].get("schoolId")).toBe("94");
  expect(apiPost.mock.calls[0][1].get("file")).toBe(file);
});
