import { apiGet, apiPost } from "../helpers/httpClient.jsx";
import { getParentTagImportStatus, importParentTagUsers } from "./parentTagService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}));

test("uploads multipart file and schoolId and unwraps accepted job", async () => {
  const formData = new FormData();
  formData.append("file", new Blob(["xlsx"]), "tags.xlsx");
  formData.append("schoolId", "94");
  apiPost.mockResolvedValue({ data: { data: { jobId: 10, logId: 20, status: "pending" } } });

  await expect(importParentTagUsers(formData, { timeout: 30000 })).resolves.toMatchObject({ logId: 20 });
  expect(apiPost).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/parent-tags/import",
    expect.any(FormData),
    expect.objectContaining({ timeout: 30000 })
  );
  const sent = apiPost.mock.calls[0][1];
  expect(sent.get("schoolId")).toBe("94");
  expect(sent.get("file")).toBeTruthy();
});

test("polling status always sends schoolId, pagination and cancellation signal", async () => {
  const controller = new AbortController();
  apiGet.mockResolvedValue({ data: { data: { logId: 20, rows: [] } } });
  await getParentTagImportStatus(20, { schoolId: 94, page: 2, limit: 50 }, controller.signal);
  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/parent-tags/imports/20",
    expect.objectContaining({
      params: { schoolId: 94, page: 2, limit: 50 },
      signal: controller.signal,
      silent: true,
    })
  );
});
