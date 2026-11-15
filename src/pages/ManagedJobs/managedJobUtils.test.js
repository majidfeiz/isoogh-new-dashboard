import { buildConfiguration, managedJobError, statusView, validateJobForm } from "./managedJobUtils.js";

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
