import { apiGet } from "../helpers/httpClient.jsx";
import { getAdviserStats } from "./adviserPortalService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPost: jest.fn(), apiPatch: jest.fn(), apiDelete: jest.fn() }));

test("requests adviser stats with selected Jalali year and month", async () => {
  const controller = new AbortController();
  apiGet.mockResolvedValue({ data: { data: { year: 1405, month: 5 } } });
  await expect(getAdviserStats({ year: 1405, month: 5, signal: controller.signal })).resolves.toMatchObject({ year: 1405, month: 5 });
  expect(apiGet.mock.calls[0][1]).toMatchObject({ params: { year: 1405, month: 5 }, signal: controller.signal });
});
