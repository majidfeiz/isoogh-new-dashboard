const WRITABLE_KEYS = [
  "integrationEnabled", "botUsername", "botApiBaseUrl", "publicWebhookUrl",
  "miniAppUrl", "initDataMaxAgeSeconds", "safirEnabled", "safirBotId",
  "otpProvider", "httpTimeoutMs", "outboxWorkerEnabled", "outboxPollMs", "outboxBatch",
];

export const normalizeBaleGlobalSettings = (response = {}) => ({
  source: response.source || "environment",
  integrationEnabled: response.integrationEnabled === true,
  botTokenConfigured: response.botTokenConfigured === true,
  botUsername: response.botUsername || "",
  botApiBaseUrl: response.botApiBaseUrl || "https://tapi.bale.ai",
  publicWebhookUrl: response.publicWebhookUrl || "",
  webhookSecretConfigured: response.webhookSecretConfigured === true,
  miniAppUrl: response.miniAppUrl || "",
  initDataMaxAgeSeconds: Number(response.initDataMaxAgeSeconds ?? 300),
  safirEnabled: response.safirEnabled === true,
  safirApiAccessKeyConfigured: response.safirApiAccessKeyConfigured === true,
  safirBotId: response.safirBotId || "",
  otpProvider: response.otpProvider || "kavenegar",
  httpTimeoutMs: Number(response.httpTimeoutMs ?? 10000),
  outboxWorkerEnabled: response.outboxWorkerEnabled === true,
  outboxPollMs: Number(response.outboxPollMs ?? 5000),
  outboxBatch: Number(response.outboxBatch ?? 10),
  updatedAt: response.updatedAt || null,
  botToken: "",
  webhookSecret: "",
  safirApiAccessKey: "",
  generateWebhookSecret: false,
});

export const mapBaleGlobalSettingsPayload = (form = {}) => {
  const payload = {};
  WRITABLE_KEYS.forEach((key) => { payload[key] = form[key]; });
  if (form.botToken?.trim()) payload.botToken = form.botToken.trim();
  if (form.webhookSecret?.trim()) payload.webhookSecret = form.webhookSecret.trim();
  if (form.safirApiAccessKey?.trim()) payload.safirApiAccessKey = form.safirApiAccessKey.trim();
  if (form.generateWebhookSecret === true) payload.generateWebhookSecret = true;
  return payload;
};

export const validateBaleGlobalSettings = (form = {}) => {
  const errors = {};
  const httpsFields = ["botApiBaseUrl", "publicWebhookUrl", "miniAppUrl"];
  httpsFields.forEach((key) => { if (form[key] && !/^https:\/\//i.test(form[key])) errors[key] = "آدرس باید با https:// شروع شود."; });
  if (form.initDataMaxAgeSeconds < 60 || form.initDataMaxAgeSeconds > 3600) errors.initDataMaxAgeSeconds = "مقدار باید بین ۶۰ و ۳۶۰۰ باشد.";
  if (form.httpTimeoutMs < 1000 || form.httpTimeoutMs > 60000) errors.httpTimeoutMs = "مقدار باید بین ۱۰۰۰ و ۶۰۰۰۰ باشد.";
  if (form.outboxPollMs < 1000 || form.outboxPollMs > 60000) errors.outboxPollMs = "مقدار باید بین ۱۰۰۰ و ۶۰۰۰۰ باشد.";
  if (form.outboxBatch < 1 || form.outboxBatch > 50) errors.outboxBatch = "مقدار باید بین ۱ و ۵۰ باشد.";
  if (!["kavenegar", "bale", "fallback"].includes(form.otpProvider)) errors.otpProvider = "ارائه‌دهنده معتبر نیست.";
  return errors;
};
