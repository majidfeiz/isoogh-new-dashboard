import { apiPost } from "../helpers/httpClient.jsx";
import {
  executeDynamicReport,
  getDynamicReportWidgetData,
  previewDefinition,
} from "./dynamicReportService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  __esModule: true,
  default: { post: jest.fn() },
  apiDelete: jest.fn(),
  apiGet: jest.fn(),
  apiPatch: jest.fn(),
  apiPost: jest.fn(),
}));

beforeEach(() => {
  apiPost.mockReset();
  apiPost.mockResolvedValue({ data: { data: { rows: [], meta: { page: 1, limit: 20, total: 0, lastPage: 1 } } } });
});

test("preview sends definition, page, limit and search in the POST body", async () => {
  const signal = new AbortController().signal;
  const body = { definition: { version: 1 }, page: 2, limit: 20, search: "ali" };
  await previewDefinition(body, signal);

  expect(apiPost).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/dynamic-reports/preview",
    body,
    { signal, silent: true }
  );
});

test("saved report execution sends pagination in the POST body", async () => {
  const signal = new AbortController().signal;
  const body = { page: 2, limit: 20, search: "" };
  await executeDynamicReport(7, body, signal);

  expect(apiPost).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/dynamic-reports/7/execute",
    body,
    { signal, silent: true }
  );
});

test("widget table sends pagination in the POST body", async () => {
  const signal = new AbortController().signal;
  const body = { page: 3, limit: 50, search: "گزارش" };
  await getDynamicReportWidgetData(7, 9, body, signal);

  expect(apiPost).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/dynamic-reports/7/widgets/9/data",
    body,
    { signal, silent: true }
  );
});
