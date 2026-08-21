import { parseAdviserSupportFormQuery, serializeAdviserSupportFormQuery } from "./supportFormListQuery.js";

test("restores grade, search, sort and pagination from URL", () => {
  expect(parseAdviserSupportFormQuery(new URLSearchParams("gradeId=6&search=تماس&sortOrder=ASC&page=3"))).toEqual({
    gradeId: "6", search: "تماس", sortOrder: "ASC", page: 3,
  });
});

test("preserves an active grade and removes an empty grade", () => {
  const active = serializeAdviserSupportFormQuery({ gradeId: "6", search: "فرم", sortOrder: "ASC", page: 4 });
  expect(Object.fromEntries(active)).toEqual({ search: "فرم", gradeId: "6", sortOrder: "ASC", page: "4" });
  const cleared = serializeAdviserSupportFormQuery({ gradeId: "", search: "فرم", sortOrder: "DESC", page: 1 });
  expect(cleared.has("gradeId")).toBe(false);
});
