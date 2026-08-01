import { apiGet } from "../helpers/httpClient.jsx";
import { exportSuperAdviserStudents } from "./superAdviserPortalService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }));

beforeEach(() => apiGet.mockReset());

test("exports active student filters without pagination", async () => {
  const blob = new Blob(["xlsx"]);
  apiGet.mockResolvedValue({
    data: blob,
    headers: { "content-disposition": "attachment; filename=students.xlsx" },
  });
  const result = await exportSuperAdviserStudents({ search: "علی", adviserId: 7, page: 3, limit: 50 });
  expect(result).toEqual({ blob, contentDisposition: "attachment; filename=students.xlsx" });
  const config = apiGet.mock.calls[0][1];
  expect(config.responseType).toBe("blob");
  expect(Object.fromEntries(config.params)).toEqual({ search: "علی", adviserId: "7" });
  expect(config.params.has("page")).toBe(false);
  expect(config.params.has("limit")).toBe(false);
});

test("calls export without empty query parameters", async () => {
  apiGet.mockResolvedValue({ data: new Blob([]), headers: {} });
  await exportSuperAdviserStudents({});
  expect([...apiGet.mock.calls[0][1].params]).toEqual([]);
});
