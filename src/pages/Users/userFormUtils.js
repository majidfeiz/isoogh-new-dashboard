const USER_WRITABLE_FIELDS = ["name", "email", "username", "ssn", "phone"];

export function buildUserPayload(form = {}) {
  const payload = USER_WRITABLE_FIELDS.reduce((result, field) => {
    result[field] = form[field] ?? "";
    return result;
  }, {});

  if (form.password) payload.password = form.password;
  return payload;
}
