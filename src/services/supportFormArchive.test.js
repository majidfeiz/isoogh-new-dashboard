import { apiPatch } from "../helpers/httpClient.jsx";
import { setSupportFormAdviserStudentArchive } from "./supportFormService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPost: jest.fn(), apiPut: jest.fn(), apiPatch: jest.fn(), apiDelete: jest.fn() }));

beforeEach(() => apiPatch.mockReset());

test.each([
  [false, "/support-forms/10/advisers/15/students/501/archive"],
  [true, "/support-forms/10/advisers/15/students/501/restore"],
])("uses the assignment ID, school query and no body for archive and restore", async (restore, path) => {
  apiPatch.mockResolvedValue({ data: { data: { id: 501, is_archived: !restore, status: 1 } } });
  await expect(setSupportFormAdviserStudentArchive(10, 15, 501, 8, restore))
    .resolves.toEqual({ id: 501, is_archived: !restore, status: 1 });
  expect(apiPatch).toHaveBeenCalledWith(`http://127.0.0.1:8040${path}`, null, { params: { schoolId: 8 } });
});
