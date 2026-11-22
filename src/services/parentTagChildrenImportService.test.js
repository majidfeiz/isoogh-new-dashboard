import { apiGet, apiPost } from "../helpers/httpClient.jsx";
import {
  downloadParentTagChildrenTemplate,
  importParentTagChildren,
} from "./parentTagService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

test("downloads the child import template as a blob for the parent school", async () => {
  const blob = new Blob(["xlsx"]);
  apiGet.mockResolvedValue({ data: blob, headers: { "content-disposition": "attachment; filename=sample.xlsx" } });

  await expect(downloadParentTagChildrenTemplate(12, 94)).resolves.toMatchObject({ blob });
  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/parent-tags/12/children/import-template/download",
    { params: { schoolId: 94 }, responseType: "blob" }
  );
});

test("uploads the original xlsx and schoolId in FormData and unwraps the response", async () => {
  const file = new File(["xlsx"], "children.xlsx");
  apiPost.mockResolvedValue({ data: { data: { totalRows: 2, createdCount: 1, skippedCount: 1 } } });

  await expect(importParentTagChildren(12, { file, schoolId: 94 })).resolves.toMatchObject({ createdCount: 1 });
  expect(apiPost).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/parent-tags/12/children/import",
    expect.any(FormData),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  const formData = apiPost.mock.calls[0][1];
  expect(formData.get("file")).toBe(file);
  expect(formData.get("schoolId")).toBe("94");
});
