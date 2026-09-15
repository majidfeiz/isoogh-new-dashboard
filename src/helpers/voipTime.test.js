import { formatVoipTalkDuration } from "./voipTime.js";

describe("formatVoipTalkDuration", () => {
  test("formats a normal duration as readable minutes and seconds", () => {
    expect(formatVoipTalkDuration(160)).toBe("02:40");
  });

  test("keeps zero as a valid calculated duration", () => {
    expect(formatVoipTalkDuration(0)).toBe("00:00");
  });

  test("shows an em dash for a missing duration", () => {
    expect(formatVoipTalkDuration(null)).toBe("—");
    expect(formatVoipTalkDuration(undefined)).toBe("—");
  });

  test("uses hours for durations of at least one hour", () => {
    expect(formatVoipTalkDuration(3661)).toBe("01:01:01");
  });
});
