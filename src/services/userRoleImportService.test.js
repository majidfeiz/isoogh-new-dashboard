import { apiGet, apiPost } from "../helpers/httpClient.jsx";
import {
  downloadUserRoleImportTemplate,
  importUserRoles,
} from "./userService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}));

beforeEach(() => {
  apiGet.mockReset();
  apiPost.mockReset();
});

test("sends file and numeric role id as multipart FormData", async () => {
  const file = new File(["excel"], "users.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const result = { assignedUsers: 1, issues: [] };
  const onUploadProgress = jest.fn();
  apiPost.mockResolvedValue({ data: { data: result } });

  await expect(
    importUserRoles({ file, roleId: 7, onUploadProgress })
  ).resolves.toEqual(result);

  const [url, formData, config] = apiPost.mock.calls[0];
  expect(url).toBe(
    "http://127.0.0.1:8040/authorization/users/roles/import"
  );
  expect(formData).toBeInstanceOf(FormData);
  expect(formData.get("file")).toBe(file);
  expect(formData.get("roleId")).toBe("7");
  expect(config).toEqual({ onUploadProgress });
  expect(config.headers).toBeUndefined();
});

test("downloads template as a blob without forcing multipart headers", async () => {
  const blob = new Blob(["xlsx"]);
  apiGet.mockResolvedValue({ data: blob });

  await expect(downloadUserRoleImportTemplate()).resolves.toBe(blob);
  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/authorization/users/roles/import/template",
    expect.objectContaining({
      responseType: "blob",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    })
  );
});
