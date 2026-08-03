export const canRetryOutbox = (status) => ["failed", "cancelled"].includes(status);
export const canCancelOutbox = (status) => ["pending", "retry"].includes(status);

export const buildBulkSettingsPayload = (schoolIds, changes) => ({
  schoolIds: schoolIds.slice(0, 500),
  ...changes,
});

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export const normalizeBaleUserId = (value = "") => String(value).trim().replace(/[۰-۹٠-٩]/g, (digit) => {
  const persianIndex = PERSIAN_DIGITS.indexOf(digit);
  return String(persianIndex >= 0 ? persianIndex : ARABIC_DIGITS.indexOf(digit));
});
export const isValidBaleUserId = (value) => /^\d{1,32}$/.test(value);
export const buildManualBaleConnectionPayload = (userId, baleUserId) => ({
  userId,
  baleUserId: normalizeBaleUserId(baleUserId),
  identityVerified: true,
});
