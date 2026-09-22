export function canManageAdviserStudentArchive(user, hasPermission) {
  const allowedRole = (user?.roles || []).some((role) => {
    const name = String(typeof role === "string" ? role : role?.name || role?.slug || "").toLowerCase();
    return ["admin", "super_admin", "super-admin", "super admin", "manager"].includes(name);
  });
  return allowedRole && hasPermission("support-forms.update");
}

export function isArchivedAssignment(row) {
  return row?.is_archived === true || row?.is_archived === 1 || row?.archived_at != null;
}

export function adviserStudentStatus(status) {
  if (Number(status) === 1) return { label: "تماس موفق", color: "success" };
  if (Number(status) === 2) return { label: "ناقص", color: "warning" };
  return { label: "بدون وضعیت", color: "secondary" };
}
