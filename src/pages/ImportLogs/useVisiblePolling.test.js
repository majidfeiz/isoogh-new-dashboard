import { shouldPoll } from "./useVisiblePolling.js";

test("polling only runs for active imports in a visible tab", () => {
  expect(shouldPoll(true, "visible")).toBe(true);
  expect(shouldPoll(true, "hidden")).toBe(false);
  expect(shouldPoll(false, "visible")).toBe(false);
});
