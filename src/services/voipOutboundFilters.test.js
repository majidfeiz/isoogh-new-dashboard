import { apiGet } from "../helpers/httpClient.jsx";
import { getSupportForms } from "./supportFormService.jsx";
import {
  exportOutboundCallHistories,
  exportOutboundCallHistoriesExcel,
  getOutboundCallHistories,
  getOutboundCallHistoryTags,
} from "./voipService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }));

beforeEach(() => apiGet.mockReset());

test("loads searchable forms for the selected school with cancellation", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [{ id: 3113, title: "فرم تماس" }], meta: { page: 1, lastPage: 2 } } } });
  const controller = new AbortController();
  const result = await getSupportForms({ schoolId: 8, search: "تماس", page: 1, limit: 20, signal: controller.signal });
  expect(result.items[0]).toEqual(expect.objectContaining({ id: 3113, title: "فرم تماس" }));
  expect(apiGet.mock.calls[0][1]).toEqual(expect.objectContaining({
    signal: controller.signal,
    params: expect.objectContaining({ schoolId: 8, search: "تماس", page: 1, limit: 20 }),
  }));
});

test("combines username, school and form with existing list filters", async () => {
  apiGet.mockResolvedValue({ data: { data: { data: [{ student_ssn: "0012345678" }], meta: { total: 1 } } } });
  const result = await getOutboundCallHistories({ page: 1, per_page: 15, schoolId: 8,
    support_form_id: 3113, username: "student", ssn: "001", tagId: 4, disposition: "ANSWERED" });
  expect(result.items[0].student_ssn).toBe("0012345678");
  expect(apiGet.mock.calls[0][1].params).toEqual(expect.objectContaining({
    schoolId: 8, support_form_id: 3113, username: "student", ssn: "001", tagId: 4,
  }));
});

test("combines username, school and form in both export services", async () => {
  apiGet.mockResolvedValue({ data: new Blob(["export"]), headers: {} });
  const filters = { schoolId: 8, support_form_id: 3113, username: "student", ssn: "001" };
  await exportOutboundCallHistories(filters);
  await exportOutboundCallHistoriesExcel(filters);
  for (const [, config] of apiGet.mock.calls) {
    expect(config.params).toEqual(expect.objectContaining(filters));
  }
});

test("sends trimmed SSN and numeric tag with all active call filters", async () => {
  const controller = new AbortController();
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: { page: 2, limit: 15, total: 0, lastPage: 1 } } } });
  await getOutboundCallHistories({
    page: 2, per_page: 15, type: "StudentName", q: "علی", ssn: " 001 ", tagId: 12,
    disposition: "ANSWERED", start_date: "۱۴۰۵/۰۶/۰۱", end_date: "1405-06-10",
    sortBy: "id", sortOrder: "DESC", signal: controller.signal,
  });
  expect(apiGet.mock.calls[0][1]).toEqual(expect.objectContaining({
    signal: controller.signal,
    params: expect.objectContaining({
      ssn: "001", tagId: 12, disposition: "ANSWERED", page: 2,
      start_date: "1405/06/01", end_date: "1405/06/10",
    }),
  }));
});

test("loads paginated scoped tag options", async () => {
  apiGet.mockResolvedValue({ data: { data: {
    items: [{ id: 3, name: "پیگیری", school_id: 2, parent_id: 1 }],
    meta: { page: 2, limit: 20, total: 21, lastPage: 2 },
  } } });
  const result = await getOutboundCallHistoryTags({ search: " پیگیری ", page: 2 });
  expect(result.items[0]).toEqual({ id: 3, name: "پیگیری", schoolId: 2, parentId: 1 });
  expect(apiGet.mock.calls[0][1].params.search).toBe("پیگیری");
  expect(result.meta.lastPage).toBe(2);
});

test("exports SSN and tag without page or per_page", async () => {
  apiGet.mockResolvedValue({ data: new Blob(["csv"]) });
  await exportOutboundCallHistories({ ssn: " 001 ", tagId: 12, page: 5, per_page: 100 });
  const params = apiGet.mock.calls[0][1].params;
  expect(params.ssn).toBe("001");
  expect(params.tagId).toBe(12);
  expect(params.page).toBeUndefined();
  expect(params.per_page).toBeUndefined();
});

test("exports the same date-only range and active filters without pagination", async () => {
  apiGet.mockResolvedValue({ data: new Blob(["csv"]) });
  await exportOutboundCallHistories({
    page: 5, per_page: 100, start_date: "۱۴۰۵/۰۶/۰۱", end_date: "1405-06-10",
    disposition: "ANSWERED", ssn: "001", tagId: 12, support_form_id: 4, adviser_id: 5,
  });
  expect(apiGet.mock.calls[0][1].params).toEqual(expect.objectContaining({
    start_date: "1405/06/01", end_date: "1405/06/10", disposition: "ANSWERED",
    ssn: "001", tagId: 12, support_form_id: 4, adviser_id: 5,
  }));
  expect(apiGet.mock.calls[0][1].params.page).toBeUndefined();
  expect(apiGet.mock.calls[0][1].params.per_page).toBeUndefined();
});

test("exports Excel with every active filter, blob response and no pagination", async () => {
  const blob = new Blob(["xlsx"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  apiGet.mockResolvedValue({ data: blob, headers: { "content-disposition": "attachment; filename=outbound.xlsx" } });
  const result = await exportOutboundCallHistoriesExcel({
    page: 9, per_page: 100, type: "StudentName", q: " علی ", ssn: " 001 ", tagId: 12,
    disposition: "ANSWERED", support_form_id: 4, adviser_id: 5, super_adviser_id: 6,
    start_date: "۱۴۰۵/۰۶/۰۱", end_date: "1405-06-10", sort_by: "id", sort_order: "DESC",
  });
  expect(apiGet.mock.calls[0][0]).toBe("http://127.0.0.1:8040/voip/outbound-call-histories/export/xlsx");
  expect(apiGet.mock.calls[0][1]).toEqual(expect.objectContaining({ responseType: "blob", timeout: 120000 }));
  expect(apiGet.mock.calls[0][1].params).toEqual({
    type: "StudentName", q: "علی", ssn: "001", tagId: 12, disposition: "ANSWERED",
    support_form_id: 4, adviser_id: 5, super_adviser_id: 6,
    start_date: "1405/06/01", end_date: "1405/06/10", sort_by: "id", sort_order: "DESC",
  });
  expect(apiGet.mock.calls[0][1].params.page).toBeUndefined();
  expect(apiGet.mock.calls[0][1].params.per_page).toBeUndefined();
  expect(result).toEqual({ blob, contentDisposition: "attachment; filename=outbound.xlsx" });
  expect(result.blob.type).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
});

test("omits empty and ALL filters from Excel export", async () => {
  apiGet.mockResolvedValue({ data: new Blob(["xlsx"]), headers: {} });
  await exportOutboundCallHistoriesExcel({ disposition: "ALL", q: "  ", start_date: null, end_date: undefined });
  expect(apiGet.mock.calls[0][1].params).toEqual({});
});
