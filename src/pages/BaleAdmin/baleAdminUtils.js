export const canRetryOutbox = (status) => ["failed", "cancelled"].includes(status);
export const canCancelOutbox = (status) => ["pending", "retry"].includes(status);

export const buildBulkSettingsPayload = (schoolIds, changes) => ({
  schoolIds: schoolIds.slice(0, 500),
  ...changes,
});
