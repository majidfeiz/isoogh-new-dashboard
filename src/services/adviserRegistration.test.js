import { apiPost } from "../helpers/httpClient.jsx";
import { importAdvisers, registerAdviser } from "./adviserService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPost: jest.fn(), apiPatch: jest.fn(), apiDelete: jest.fn(), apiPut: jest.fn() }));

test("registers a normal adviser using the dedicated endpoint and numeric school", async () => {
  apiPost.mockResolvedValue({ data: { data: { adviserId: 8, schoolId: 94, role: "adviser" } } });
  const payload = { schoolId: "94", name: "علی احمدی", phone: "09121234567", grades: [2, 3] };
  await expect(registerAdviser(payload)).resolves.toEqual({ adviserId: 8, schoolId: 94, role: "adviser" });
  expect(apiPost).toHaveBeenCalledWith("http://127.0.0.1:8040/advisers/register", { ...payload, schoolId: 94 }, { silent: true });
});

test("uploads adviser multipart without setting a manual content type", async () => {
  const formData = new FormData();
  formData.append("file", new Blob(["xlsx"]), "advisers.xlsx");
  formData.append("schoolId", "94");
  const onUploadProgress = jest.fn();
  apiPost.mockResolvedValue({ data: { data: { logId: 12, status: "pending" } } });
  await importAdvisers(formData, { onUploadProgress });
  expect(apiPost).toHaveBeenCalledWith("http://127.0.0.1:8040/advisers/import", formData, { onUploadProgress, silent: true });
  expect(apiPost.mock.calls[0][2]).not.toHaveProperty("headers");
});
