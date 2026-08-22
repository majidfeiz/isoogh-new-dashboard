import { apiGet } from "../helpers/httpClient.jsx";
import { exportSuperAdviserSalary } from "./superAdviserPortalService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }));

beforeEach(() => apiGet.mockReset());

test("exports salary with XLSX response and all active filters", async () => {
  const blob = new Blob(["xlsx"]);
  apiGet.mockResolvedValue({ data: blob, headers: { "content-disposition": "attachment; filename=salary.xlsx" } });
  await expect(exportSuperAdviserSalary({ year: 1405, month: 5, adviserId: 2, supportFormId: 10 })).resolves.toEqual({ blob, contentDisposition: "attachment; filename=salary.xlsx" });

  const [url, config] = apiGet.mock.calls[0];
  expect(url).toContain("/super-adviser-portal/salary/export");
  expect(config.responseType).toBe("blob");
  expect(config.headers.Accept).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  expect(Object.fromEntries(config.params)).toEqual({ year: "1405", month: "5", adviserId: "2", supportFormId: "10" });
});

test("omits empty optional salary filters", async () => {
  apiGet.mockResolvedValue({ data: new Blob([]), headers: {} });
  await exportSuperAdviserSalary({ year: 1405, month: 5, adviserId: "", supportFormId: null });
  expect(Object.fromEntries(apiGet.mock.calls[0][1].params)).toEqual({ year: "1405", month: "5" });
});
