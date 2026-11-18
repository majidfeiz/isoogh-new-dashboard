import { apiGet } from "../helpers/httpClient.jsx";
import { getCallTraces } from "./voipService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }));

beforeEach(() => apiGet.mockReset());

test("requests the initial page with the contract defaults", async () => {
  apiGet.mockResolvedValue({
    data: { data: { items: [], meta: { page: 1, limit: 15, total: 0, lastPage: 1 } } },
  });

  await getCallTraces();

  expect(apiGet).toHaveBeenCalledTimes(1);
  expect(apiGet.mock.calls[0][1].params).toEqual(expect.objectContaining({ page: 1, limit: 15 }));
});

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

test("does not interpret a legacy collection as a paginated response", async () => {
  apiGet.mockResolvedValue({
    data: { data: [{ id: 1 }] },
  });

  await expect(getCallTraces()).resolves.toEqual({
    items: [],
    meta: { page: 1, limit: 15, total: 0, lastPage: 1 },
  });
});

test("retries a timeout only once", async () => {
  apiGet
    .mockRejectedValueOnce(Object.assign(new Error("timeout"), { code: "ECONNABORTED" }))
    .mockResolvedValueOnce({ data: { data: { items: [], meta: { page: 1, limit: 15, total: 0, lastPage: 1 } } } });

  await getCallTraces();

  expect(apiGet).toHaveBeenCalledTimes(2);
});
