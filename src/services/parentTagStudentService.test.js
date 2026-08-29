import { apiGet, apiPatch } from "../helpers/httpClient.jsx";
import { getStudentParentTags, syncStudentParentTags } from "./parentTagService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(), apiPost: jest.fn(), apiPatch: jest.fn(), apiDelete: jest.fn(),
}));

beforeEach(() => { apiGet.mockReset(); apiPatch.mockReset(); });

test("loads tags with student id and explicit school id", async () => {
  apiGet.mockResolvedValue({ data: { data: { selectedTagIds: [12] } } });
  await expect(getStudentParentTags(1001, 10)).resolves.toEqual({ selectedTagIds: [12] });
  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/parent-tags/students/1001",
    { params: { schoolId: 10 }, silent: true }
  );
});

test.each([[12, 18], []])("atomically sends the complete tag snapshot %j", async (...tagIds) => {
  const snapshot = tagIds.length === 1 && Array.isArray(tagIds[0]) ? tagIds[0] : tagIds;
  apiPatch.mockResolvedValue({ data: { data: { selectedTagIds: snapshot } } });
  await syncStudentParentTags(1001, { schoolId: 10, tagIds: snapshot });
  expect(apiPatch).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/parent-tags/students/1001",
    { schoolId: 10, tagIds: snapshot },
    { silent: true }
  );
});
