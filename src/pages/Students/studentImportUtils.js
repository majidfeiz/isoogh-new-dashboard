export const DEFAULT_USE_USERNAME_AS_PHONE = false;

export const appendStudentCreateImportFields = (
  formData,
  { schoolId, defaultPassword, useUsernameAsPhone = DEFAULT_USE_USERNAME_AS_PHONE } = {}
) => {
  if (schoolId) formData.append("schoolId", schoolId);
  if (defaultPassword) formData.append("defaultPassword", defaultPassword);
  formData.append("useUsernameAsPhone", String(Boolean(useUsernameAsPhone)));
  return formData;
};
