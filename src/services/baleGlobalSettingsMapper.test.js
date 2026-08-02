import { mapBaleGlobalSettingsPayload, normalizeBaleGlobalSettings, validateBaleGlobalSettings } from "./baleGlobalSettingsMapper.js";

describe("Bale global settings mapper", () => {
  it("never hydrates or sends empty/masked secrets", () => {
    const form = normalizeBaleGlobalSettings({ source: "environment", botTokenConfigured: true, botToken: "masked", webhookSecretConfigured: true, webhookSecret: "***", safirApiAccessKeyConfigured: true, safirApiAccessKey: "hidden" });
    expect(form).toMatchObject({ source: "environment", botToken: "", webhookSecret: "", safirApiAccessKey: "" });
    const payload = mapBaleGlobalSettingsPayload(form);
    expect(payload).not.toHaveProperty("botToken");
    expect(payload).not.toHaveProperty("webhookSecret");
    expect(payload).not.toHaveProperty("safirApiAccessKey");
    expect(payload).not.toHaveProperty("source");
  });

  it("only sends new secret values", () => {
    const form = normalizeBaleGlobalSettings({});
    form.botToken = " new-token ";
    form.generateWebhookSecret = true;
    expect(mapBaleGlobalSettingsPayload(form)).toMatchObject({ botToken: "new-token", generateWebhookSecret: true });
  });

  it("validates https URLs and numeric boundaries", () => {
    const form = normalizeBaleGlobalSettings({ botApiBaseUrl: "http://bad", initDataMaxAgeSeconds: 20, httpTimeoutMs: 900, outboxPollMs: 70000, outboxBatch: 100, otpProvider: "unknown" });
    expect(Object.keys(validateBaleGlobalSettings(form))).toEqual(expect.arrayContaining(["botApiBaseUrl", "initDataMaxAgeSeconds", "httpTimeoutMs", "outboxPollMs", "outboxBatch", "otpProvider"]));
  });
});
