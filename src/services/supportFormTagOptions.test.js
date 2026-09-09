import { apiGet } from "../helpers/httpClient.jsx";
import { getSupportFormTagOptions } from "./supportFormService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(), apiPost: jest.fn(), apiPut: jest.fn(), apiDelete: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

test("loads a server-searched page of flat tag options for the selected school", async () => {
  apiGet.mockResolvedValue({
    data: { data: { items: [{ id: "12", name: "نیازمند پیگیری" }], meta: { page: 2, limit: 20, total: 45, lastPage: 3 } } },
  });

  await expect(getSupportFormTagOptions({ schoolId: 146, search: "پیگیری", page: 2, limit: 20 })).resolves.toEqual({
    items: [{ id: 12, name: "نیازمند پیگیری" }],
    pagination: { page: 2, limit: 20, total: 45, lastPage: 3 },
  });
  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/support-forms/tag-options",
    { params: { schoolId: 146, search: "پیگیری", page: 2, limit: 20 } }
  );
});

test("supports an empty result without manufacturing selected values", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: { page: 1, limit: 20, total: 0, lastPage: 1 } } } });
  await expect(getSupportFormTagOptions({ schoolId: 146 })).resolves.toMatchObject({ items: [] });
});
