import {
  isValidSuperAdviserGradeId,
  parseSuperAdviserSupportFormsQuery,
  serializeSuperAdviserSupportFormsQuery,
} from "./supportFormsUtils.js";

test("keeps all support form filters and pagination in the URL", () => {
  const query = parseSuperAdviserSupportFormsQuery(new URLSearchParams(
    "search=فرم&adviserId=2&schoolId=3&gradeId=4&page=5"
  ));
  expect(query).toEqual({ search: "فرم", adviserId: "2", schoolId: "3", gradeId: "4", page: 5 });
  expect(serializeSuperAdviserSupportFormsQuery(query).toString()).toContain("gradeId=4");
});

test("removes an empty grade and validates a bookmarked grade", () => {
  const params = serializeSuperAdviserSupportFormsQuery({
    search: "فرم", adviserId: "2", schoolId: "3", gradeId: "", page: 1,
  });
  expect(params.has("gradeId")).toBe(false);
  expect(isValidSuperAdviserGradeId("4", [{ id: 4, name: "دهم" }])).toBe(true);
  expect(isValidSuperAdviserGradeId("9", [{ id: 4, name: "دهم" }])).toBe(false);
});
