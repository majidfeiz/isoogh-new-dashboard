const toBoolean = (value) => value === true || value === 1 || value === "true";

export const normalizeBaleSchoolSettings = (response = {}) => {
  const settings = response.setting ?? response;
  return {
    isEnabled: toBoolean(settings.isEnabled),
    botEnabled: toBoolean(settings.botEnabled),
    miniAppEnabled: toBoolean(settings.miniAppEnabled),
    safirEnabled: toBoolean(settings.safirEnabled),
    otpProvider: settings.otpProvider || "fallback",
    allowManager: toBoolean(settings.allowManager),
    allowAdviser: toBoolean(settings.allowAdviser),
    allowSuperAdviser: toBoolean(settings.allowSuperAdviser),
    notificationsEnabled: toBoolean(settings.notificationsEnabled),
    allowedNotificationTypes: Array.isArray(settings.allowedNotificationTypes)
      ? settings.allowedNotificationTypes
      : [],
    quietHoursStart: settings.quietHoursStart || null,
    quietHoursEnd: settings.quietHoursEnd || null,
    timezone: settings.timezone || "Asia/Tehran",
  };
};

export const mapBaleSchoolSettingsPayload = (form = {}) => ({
  isEnabled: toBoolean(form.isEnabled),
  botEnabled: toBoolean(form.botEnabled),
  miniAppEnabled: toBoolean(form.miniAppEnabled),
  safirEnabled: toBoolean(form.safirEnabled),
  otpProvider: form.otpProvider,
  allowManager: toBoolean(form.allowManager),
  allowAdviser: toBoolean(form.allowAdviser),
  allowSuperAdviser: toBoolean(form.allowSuperAdviser),
  notificationsEnabled: toBoolean(form.notificationsEnabled),
  allowedNotificationTypes: Array.isArray(form.allowedNotificationTypes)
    ? form.allowedNotificationTypes
    : [],
  quietHoursStart: form.quietHoursStart || null,
  quietHoursEnd: form.quietHoursEnd || null,
  timezone: form.timezone || "Asia/Tehran",
});
