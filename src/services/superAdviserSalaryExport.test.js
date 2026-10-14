import { apiGet } from "../helpers/httpClient.jsx";
import { exportSuperAdviserSalary, getSuperAdviserSalary } from "./superAdviserPortalService.jsx";

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

test("exports a Tehran range without legacy year and month", async () => {
  apiGet.mockResolvedValue({ data: new Blob([]), headers: {} });
  await exportSuperAdviserSalary({
    from: "2026-09-23T00:00:00.000+03:30",
    to: "2026-10-23T00:00:00.000+03:30",
    year: 1405,
    month: 7,
    adviserId: 2,
  });
  const params = apiGet.mock.calls[0][1].params;
  expect(Object.fromEntries(params)).toEqual({
    from: "2026-09-23T00:00:00.000+03:30",
    to: "2026-10-23T00:00:00.000+03:30",
    adviserId: "2",
  });
  expect(params.toString()).toContain("%2B03%3A30");
  expect(params.has("year")).toBe(false);
  expect(params.has("month")).toBe(false);
});

test("loads a ranged salary report and maps effective boundaries and server durations", async () => {
  apiGet.mockResolvedValue({ data: { data: {
    year: 1405,
    month: 7,
    from: "2026-09-23T00:00:00+03:30",
    to: "2026-10-23T00:00:00+03:30",
    total_duration_seconds: 3661,
    duration_formatted: "01:01:01",
    advisers: [{
      adviser_id: 2,
      total_duration_seconds: 125,
      duration_formatted: "00:02:05",
    }],
  } } });
  const controller = new AbortController();
  const result = await getSuperAdviserSalary({
    from: "2026-09-23T00:00:00.000+03:30",
    to: "2026-10-23T00:00:00.000+03:30",
    year: 1405,
    month: 7,
    supportFormId: "",
  }, controller.signal);

  const params = apiGet.mock.calls[0][1].params;
  expect(params.has("year")).toBe(false);
  expect(params.has("month")).toBe(false);
  expect(apiGet.mock.calls[0][1].signal).toBe(controller.signal);
  expect(result).toEqual(expect.objectContaining({
    from: "2026-09-23T00:00:00+03:30",
    to: "2026-10-23T00:00:00+03:30",
    totalDurationSeconds: 3661,
    durationFormatted: "01:01:01",
  }));
  expect(result.advisers[0]).toEqual(expect.objectContaining({
    totalDurationSeconds: 125,
    durationFormatted: "00:02:05",
  }));
});
