export function createdUserId(response = {}) {
  const user = response.user || response;
  return user.id ?? response.userId ?? response.user_id ?? null;
}

export function createdStudentId(response = {}) {
  return response.student?.id ?? response.studentId ?? response.student_id ?? null;
}

export function findStudentId(items = [], userId) {
  const student = items.find((item) => Number(item.user_id ?? item.userId ?? item.user?.id) === Number(userId)) || items[0];
  return student?.id ?? null;
}

export function dispatchUserListInvalidation(accountType = "student") {
  window.dispatchEvent(new CustomEvent("isoogh:user-data-changed", { detail: { accountType } }));
  window.dispatchEvent(new CustomEvent("isoogh:student-data-changed"));
}
