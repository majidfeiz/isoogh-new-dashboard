import { apiGet } from "../helpers/httpClient.jsx";
import {
  exportOutboundCallHistories,
  getOutboundCallHistories,
  getOutboundCallHistoryTags,
} from "./voipService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }));

beforeEach(() => apiGet.mockReset());

test("sends trimmed SSN and numeric tag with all active call filters", async () => {
  const controller = new AbortController();
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: { page: 2, limit: 15, total: 0, lastPage: 1 } } } });
  await getOutboundCallHistories({
    page: 2, per_page: 15, type: "StudentName", q: "علی", ssn: " 001 ", tagId: 12,
    disposition: "ANSWERED", start_date: "2026-08-01", end_date: "2026-08-02",
    sortBy: "id", sortOrder: "DESC", signal: controller.signal,
  });
  expect(apiGet.mock.calls[0][1]).toEqual(expect.objectContaining({
    signal: controller.signal,
    params: expect.objectContaining({ ssn: "001", tagId: 12, disposition: "ANSWERED", page: 2 }),
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
