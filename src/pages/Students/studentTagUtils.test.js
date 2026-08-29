import { buildTagForest, getStudentSchoolOptions, getVisibleTagIds, resolveStudentTagSchoolId } from "./studentTagUtils.js";

const tags = [
  { id: 1, name: "والد", parent_id: 0 },
  { id: 2, name: "فرزند", parent_id: 1 },
  { id: 3, name: "یتیم", parent_id: 99 },
];

test("groups roots, children and missing-parent tags", () => {
  const forest = buildTagForest(tags);
  expect(forest.roots.map((tag) => tag.id)).toEqual([1]);
  expect(forest.roots[0].children.map((tag) => tag.id)).toEqual([2]);
  expect(forest.others.map((tag) => tag.id)).toEqual([3]);
});

test("keeps a matching child and its parent visible during local search", () => {
  expect([...getVisibleTagIds(tags, "فرزند")].sort()).toEqual([1, 2]);
});

test("uses the active school, otherwise only an unambiguous row school", () => {
  const student = { schools: [{ id: 10, name: "الف" }, { id: 11, name: "ب" }] };
  expect(resolveStudentTagSchoolId(student, "12")).toBe(12);
  expect(resolveStudentTagSchoolId(student, "")).toBeNull();
  expect(resolveStudentTagSchoolId({ schools: [{ id: 10, name: "الف" }] }, "")).toBe(10);
  expect(resolveStudentTagSchoolId({ school_id: 13, school_name: "ج" }, "")).toBe(13);
  expect(getStudentSchoolOptions(student)).toHaveLength(2);
});

test("safely handles the closed modal with a null student", () => {
  expect(getStudentSchoolOptions(null)).toEqual([]);
  expect(resolveStudentTagSchoolId(null, "")).toBeNull();
});
