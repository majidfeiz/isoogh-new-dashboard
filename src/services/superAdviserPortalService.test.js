import { apiGet } from "../helpers/httpClient.jsx";
import {
  getSuperAdviserSupportFormGrades,
  getSuperAdviserSupportForms,
} from "./superAdviserPortalService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }));

beforeEach(() => apiGet.mockReset());

test("loads dedicated super adviser grades without changing backend order", async () => {
  const grades = [{ id: 4, name: "دهم", sort: 10 }, { id: 2, name: "یازدهم", sort: 20 }];
  const controller = new AbortController();
  apiGet.mockResolvedValue({ data: { data: grades } });
  await expect(getSuperAdviserSupportFormGrades({ signal: controller.signal })).resolves.toEqual(grades);
  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/super-adviser-portal/support-forms/grades",
    { signal: controller.signal }
  );
});

test("sends grade with existing filters and omits an empty grade", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: { page: 2, limit: 15, total: 0, lastPage: 1 } } } });
  await getSuperAdviserSupportForms({
    page: 2, search: "فرم", adviserId: 7, schoolId: 3, gradeId: 4,
  });
  expect(apiGet.mock.calls[0][1].params).toEqual(expect.objectContaining({
    page: 2, search: "فرم", adviserId: 7, schoolId: 3, gradeId: 4,
  }));
  await getSuperAdviserSupportForms({ gradeId: "" });
  expect(apiGet.mock.calls[1][1].params.gradeId).toBeUndefined();
});
