import { buildBulkSettingsPayload, buildManualBaleConnectionPayload, canCancelOutbox, canRetryOutbox, isValidBaleUserId, normalizeBaleUserId } from "./baleAdminUtils.js";

describe("Bale admin contracts", () => {
  it("limits bulk settings to 500 schools", () => {
    const ids = Array.from({ length: 510 }, (_, index) => index + 1);
    const payload = buildBulkSettingsPayload(ids, { isEnabled: true });
    expect(payload.schoolIds).toHaveLength(500);
    expect(payload).toEqual({ schoolIds: ids.slice(0, 500), isEnabled: true });
  });

  it("restricts outbox actions by status", () => {
    expect(canRetryOutbox("failed")).toBe(true);
    expect(canRetryOutbox("cancelled")).toBe(true);
    expect(canRetryOutbox("sent")).toBe(false);
    expect(canCancelOutbox("pending")).toBe(true);
    expect(canCancelOutbox("retry")).toBe(true);
    expect(canCancelOutbox("processing")).toBe(false);
  });

  it("normalizes Bale IDs without converting them to numbers", () => {
    expect(normalizeBaleUserId(" ۰۰۸۲۰٧۱۲۵۳۳ ")).toBe("00820712533");
    expect(isValidBaleUserId("00820712533")).toBe(true);
    expect(isValidBaleUserId("8207-user")).toBe(false);
    expect(isValidBaleUserId("1".repeat(33))).toBe(false);
    expect(buildManualBaleConnectionPayload(106, "۰۰۸۲۰٧۱۲۵۳۳")).toEqual({ userId: 106, baleUserId: "00820712533", identityVerified: true });
  });
});
