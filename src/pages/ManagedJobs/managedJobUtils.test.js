import { buildConfiguration, formatElapsedTime, isProgressStale, latestProgressLog, managedJobError, managedJobRunErrorMessage, progressData, sanitizeManagedJobData, statusView, validateJobForm } from "./managedJobUtils.js";

test("builds configuration only from guide fields", () => {
  const guide = { limit: { type: "integer", default: 100 }, action: { type: "enum", values: ["sync", "backfill"], default: "sync" } };
  expect(buildConfiguration(guide, { limit: "25", action: "backfill", token: "secret" })).toEqual({ limit: 25, action: "backfill" });
});

test("validates interval and integer/enum guide constraints including zero", () => {
  const guide = {
    limit: { type: "integer", minimum: 0, maximum: 100 },
    action: { type: "enum", values: ["sync"] },
  };
  expect(validateJobForm({ intervalSeconds: 29, configuration: { limit: -1, action: "delete" } }, guide)).toEqual(expect.objectContaining({
    intervalSeconds: expect.any(String),
    limit: expect.any(String),
    action: expect.any(String),
  }));
  expect(validateJobForm({ intervalSeconds: 30, configuration: { limit: 0, action: "sync" } }, guide)).toEqual({});
});

test.each([
  ["never", "اجرا نشده"],
  ["running", "در حال اجرا"],
  ["succeeded", "موفق"],
  ["failed", "ناموفق"],
  ["skipped", "رد شده"],
])("maps %s status to Persian", (status, label) => expect(statusView(status)[1]).toBe(label));

test("maps managed job conflict codes to actionable Persian messages", () => {
  expect(managedJobError({ response: { status: 409, data: { code: "MANAGED_JOBS_ENV_DISABLED" } } })).toMatch(/تنظیمات سرور/);
  expect(managedJobError({ response: { status: 409, data: { code: "MANAGED_JOB_DISABLED" } } })).toMatch(/غیرفعال/);
  expect(managedJobError({ response: { status: 409, data: { message: "already running" } } })).toBe("already running");
});

test("selects and normalizes the newest progress log", () => {
  const log = latestProgressLog([
    { id: 1, event: "progress", created_at: "2026-11-15T08:00:00Z", data: { percent: 2 } },
    { id: 2, event: "info", created_at: "2026-11-15T08:02:00Z" },
    { id: 3, event: "progress", created_at: "2026-11-15T08:01:00Z", data: { percent: 4, processedPages: 12, totalPages: 301 } },
  ]);
  expect(log.id).toBe(3);
  expect(progressData(log)).toMatchObject({ percent: 4, processedPages: 12, totalPages: 301 });
});

test("detects stale progress after two minutes and formats elapsed time", () => {
  const now = new Date("2026-11-15T08:03:01Z").getTime();
  expect(isProgressStale({ event: "progress", created_at: "2026-11-15T08:01:00Z" }, now)).toBe(true);
  expect(isProgressStale({ event: "progress", created_at: "2026-11-15T08:02:00Z" }, now)).toBe(false);
  expect(formatElapsedTime("2026-11-15T07:00:00Z", now)).toMatch(/۱ ساعت/);
});

test("maps known Simotel terminal errors", () => {
  expect(managedJobRunErrorMessage("SIMOTEL_CONFIGURATION_MISSING")).toBe("تنظیمات اتصال Simotel ناقص است.");
  expect(managedJobRunErrorMessage("SIMOTEL_HISTORY_JOB_TIMEOUT")).toBe("اجرای همگام‌سازی از سقف زمان مجاز عبور کرد.");
});

test("redacts credentials and raw provider payloads from technical job data", () => {
  expect(sanitizeManagedJobData({ received: 4, authorization: "Bearer secret", nested: { token: "abc", payload: { card: "x" } } })).toEqual({
    received: 4,
    authorization: "[REDACTED]",
    nested: { token: "[REDACTED]", payload: "[REDACTED]" },
  });
});
