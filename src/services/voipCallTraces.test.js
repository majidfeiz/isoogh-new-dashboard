import { apiGet } from "../helpers/httpClient.jsx";
import { getCallTraces } from "./voipService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }));

beforeEach(() => apiGet.mockReset());

test("requests one server-paginated call trace page", async () => {
  apiGet.mockResolvedValue({
    data: {
      data: {
        items: [{ id: 31 }],
        meta: { page: 2, limit: 15, total: 40, lastPage: 3 },
      },
    },
  });

  const result = await getCallTraces({ page: 2, limit: 15, status: "failed" });

  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/voip/call-traces",
    expect.objectContaining({
      params: expect.objectContaining({ page: 2, limit: 15, status: "failed" }),
    }),
  );
  expect(result).toEqual({
    items: [{ id: 31 }],
    meta: { page: 2, limit: 15, total: 40, lastPage: 3 },
  });
});

test("limits a legacy unpaginated response before rendering", async () => {
  const records = Array.from({ length: 40 }, (_, index) => ({ id: index + 1 }));
  apiGet.mockResolvedValue({ data: { data: records } });

  const result = await getCallTraces({ page: 2, limit: 15 });

  expect(result.items.map((item) => item.id)).toEqual(
    Array.from({ length: 15 }, (_, index) => index + 16),
  );
  expect(result.meta).toEqual({ page: 2, limit: 15, total: 40, lastPage: 3 });
});

test("normalizes pagination metadata returned beside a data array", async () => {
  apiGet.mockResolvedValue({
    data: {
      data: [{ id: 1 }],
      pagination: { currentPage: 1, perPage: 20, totalItems: 21, totalPages: 2 },
    },
  });

  await expect(getCallTraces({ limit: 20 })).resolves.toEqual({
    items: [{ id: 1 }],
    meta: { page: 1, limit: 20, total: 21, lastPage: 2 },
  });
});
