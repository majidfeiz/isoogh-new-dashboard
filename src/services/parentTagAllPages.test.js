import { apiGet } from "../helpers/httpClient.jsx";
import {
  getAllParentTags,
  getAllParentTagValues,
} from "./parentTagService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("loads every parent-tag page", async () => {
  apiGet
    .mockResolvedValueOnce({
      data: { data: { items: [{ id: 1 }], meta: { page: 1, limit: 200, total: 3, lastPage: 3 } } },
    })
    .mockResolvedValueOnce({
      data: { data: { items: [{ id: 2 }], meta: { page: 2, limit: 200, total: 3, lastPage: 3 } } },
    })
    .mockResolvedValueOnce({
      data: { data: { items: [{ id: 3 }], meta: { page: 3, limit: 200, total: 3, lastPage: 3 } } },
    });

  await expect(getAllParentTags()).resolves.toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  expect(apiGet).toHaveBeenCalledTimes(3);
  expect(apiGet.mock.calls.map(([, config]) => config.params.page)).toEqual([1, 2, 3]);
  expect(apiGet.mock.calls.every(([, config]) => config.params.limit === 200)).toBe(true);
});

test("loads every value page for the selected parent tag", async () => {
  apiGet
    .mockResolvedValueOnce({
      data: { data: { items: [{ id: 11 }], meta: { page: 1, limit: 200, total: 2, lastPage: 2 } } },
    })
    .mockResolvedValueOnce({
      data: { data: { items: [{ id: 12 }], meta: { page: 2, limit: 200, total: 2, lastPage: 2 } } },
    });

  await expect(getAllParentTagValues(9)).resolves.toEqual([{ id: 11 }, { id: 12 }]);
  expect(apiGet).toHaveBeenCalledTimes(2);
  expect(apiGet.mock.calls.map(([, config]) => config.params.page)).toEqual([1, 2]);
});
