import { mapBaleSchoolSettingsPayload, normalizeBaleSchoolSettings } from "./baleSettingsMapper.js";

describe("Bale school settings mapper", () => {
  it("only returns writable flat keys", () => {
    const payload = mapBaleSchoolSettingsPayload({
      isEnabled: true, botEnabled: true, miniAppEnabled: true, safirEnabled: false,
      otpProvider: "bale", allowManager: true, allowAdviser: true,
      allowSuperAdviser: false, notificationsEnabled: true,
      allowedNotificationTypes: ["support_form.assigned"],
      school: { id: 12 }, setting: { id: 9 }, updatedAt: "now", timezone: "Asia/Tehran",
      quietHoursStart: "22:00", quietHoursEnd: "07:00", managerEnabled: true,
    });
    expect(Object.keys(payload)).toEqual([
      "isEnabled", "botEnabled", "miniAppEnabled", "safirEnabled", "otpProvider",
      "allowManager", "allowAdviser", "allowSuperAdviser", "notificationsEnabled",
      "allowedNotificationTypes", "quietHoursStart", "quietHoursEnd", "timezone",
    ]);
    expect(payload).not.toHaveProperty("school");
    expect(payload).not.toHaveProperty("setting");
    expect(payload).not.toHaveProperty("managerEnabled");
    expect(payload).toMatchObject({ quietHoursStart: "22:00", quietHoursEnd: "07:00", timezone: "Asia/Tehran" });
  });

  it("normalizes nested GET settings and always emits booleans", () => {
    const form = normalizeBaleSchoolSettings({
      school: { id: 12 },
      setting: {
        isEnabled: true,
        botEnabled: "true",
        miniAppEnabled: 1,
        safirEnabled: false,
        allowManager: undefined,
        allowAdviser: true,
        allowSuperAdviser: false,
        notificationsEnabled: true,
      },
    });
    const payload = mapBaleSchoolSettingsPayload(form);
    ["isEnabled", "botEnabled", "miniAppEnabled", "safirEnabled", "allowManager", "allowAdviser", "allowSuperAdviser", "notificationsEnabled"].forEach((key) => {
      expect(typeof payload[key]).toBe("boolean");
    });
    expect(payload).toMatchObject({ isEnabled: true, botEnabled: true, miniAppEnabled: true, allowManager: false });
  });

  it("preserves overnight quiet hours and supports clearing them", () => {
    const overnight = normalizeBaleSchoolSettings({ setting: { quietHoursStart: "22:00", quietHoursEnd: "07:00", timezone: "Asia/Tehran" } });
    expect(mapBaleSchoolSettingsPayload(overnight)).toMatchObject({ quietHoursStart: "22:00", quietHoursEnd: "07:00", timezone: "Asia/Tehran" });
    expect(mapBaleSchoolSettingsPayload({ ...overnight, quietHoursStart: "", quietHoursEnd: null })).toMatchObject({ quietHoursStart: null, quietHoursEnd: null });
  });
});
