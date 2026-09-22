import { adviserStudentStatus, canManageAdviserStudentArchive, isArchivedAssignment } from "./adviserStudentArchiveUtils.js";

test("only managers and admins with update permission can archive", () => {
  const permission = (name) => name === "support-forms.update";
  expect(canManageAdviserStudentArchive({ roles: [{ name: "manager" }] }, permission)).toBe(true);
  expect(canManageAdviserStudentArchive({ roles: [{ slug: "admin" }] }, permission)).toBe(true);
  expect(canManageAdviserStudentArchive({ roles: [{ name: "adviser" }] }, permission)).toBe(false);
  expect(canManageAdviserStudentArchive({ roles: [{ name: "manager" }] }, () => false)).toBe(false);
});

test("archive state is independent of call status", () => {
  expect(isArchivedAssignment({ status: 1, is_archived: true })).toBe(true);
  expect(isArchivedAssignment({ status: 2, archived_at: "2026-09-21" })).toBe(true);
  expect(isArchivedAssignment({ status: 2, is_archived: false, archived_at: null })).toBe(false);
  expect([0, 1, 2].map((status) => adviserStudentStatus(status).label))
    .toEqual(["بدون وضعیت", "تماس موفق", "ناقص"]);
});
