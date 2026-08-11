import { buildBackupDateRanges } from "./backupDateUtils";

const drafts = () => ({
  outbound_calls: { from: "", to: "" },
  call_recordings: { from: "", to: "" },
  support_form_answers: { from: "", to: "" },
});

describe("backup independent Tehran date ranges", () => {
  it("converts Jalali Tehran day boundaries to a half-open ISO range", () => {
    const values = drafts();
    values.outbound_calls = { from: "1405/05/10", to: "1405/05/10" };
    const result = buildBackupDateRanges(["outbound_calls"], values);
    expect(result.ranges.outbound_calls).toEqual({
      from: "2026-07-31T20:30:00.000Z",
      to: "2026-08-01T20:30:00.000Z",
    });
  });

  it("keeps each section independent and reports a reversed range beside only that section", () => {
    const values = drafts();
    values.outbound_calls = { from: "1405/05/12", to: "1405/05/10" };
    values.call_recordings = { from: "1405/05/01", to: "1405/05/02" };
    const result = buildBackupDateRanges(["outbound_calls", "call_recordings"], values);
    expect(result.errors.outbound_calls).toContain("معکوس");
    expect(result.errors.call_recordings).toBeUndefined();
    expect(result.ranges.call_recordings).toBeDefined();
  });
});
