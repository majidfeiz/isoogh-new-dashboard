import { readIncompleteCallsQuery, updateIncompleteCallsQuery } from "./incompleteCallsQueryUtils.js";

test("restores incomplete-call search, page and sorting from the URL", () => {
  expect(readIncompleteCallsQuery(new URLSearchParams("search=مجید&page=3&sortBy=form_title&sortOrder=ASC"))).toEqual({
    page: 3,
    search: "مجید",
    sort: { by: "form_title", order: "ASC" },
  });
});

test("resets page while preserving other active query values", () => {
  const next = updateIncompleteCallsQuery(
    new URLSearchParams("search=مجید&page=4&sortBy=form_title&sortOrder=ASC"),
    { search: "علی", page: 1 }
  );
  expect(next.toString()).toContain("search=%D8%B9%D9%84%DB%8C");
  expect(next.get("page")).toBeNull();
  expect(next.get("sortBy")).toBe("form_title");
  expect(next.get("sortOrder")).toBe("ASC");
});

test("rejects unsupported sort fields from the URL", () => {
  expect(readIncompleteCallsQuery(new URLSearchParams("sortBy=unsafe&sortOrder=ASC")).sort)
    .toEqual({ by: "id", order: "ASC" });
});
