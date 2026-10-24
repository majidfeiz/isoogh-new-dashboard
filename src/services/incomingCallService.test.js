import { apiGet, apiPatch } from "../helpers/httpClient.jsx";
import { buildIncomingCallParams, exportIncomingCalls, getIncomingAvailability, getIncomingCalls, normalizeIncomingCall, normalizeIncomingCallPriorities, setIncomingAvailability, updateIncomingCallSettings } from "./incomingCallService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  apiPatch.mockResolvedValue({ data: { data: {} } });
});

test.each([
  ["consultant", "supporter", "voice"],
  ["supporter", "consultant", "voice"],
  ["voice", "consultant", "supporter"],
])("sends the selected priority order without internal form properties: %j", async (...priorities) => {
  await updateIncomingCallSettings("146", {
    priorities,
    voiceDestination: "  100  ",
    routingOrder: ["voice", "supporter", "consultant"],
    unexpected: true,
  });

  expect(apiPatch).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/incoming-calls/settings",
    { schoolId: 146, priorities, voiceDestination: "100" },
    { silent: true },
  );
});

test("omits an empty voice destination and repairs invalid priorities", async () => {
  await updateIncomingCallSettings(146, {
    priorities: ["voice", "voice", "invalid"],
    voiceDestination: "   ",
  });

  expect(apiPatch.mock.calls[0][1]).toEqual({
    schoolId: 146,
    priorities: ["voice", "consultant", "supporter"],
  });
  expect(normalizeIncomingCallPriorities()).toEqual(["consultant", "supporter", "voice"]);
});

test("maps the incoming-call snake_case response to fields displayed by the table", async () => {
  const apiItem = {
    id: "82801",
    src: "09126438720",
    dst: "2191301508",
    destination_type: "supporter",
    supporter_id: "1",
    unique_id: "1792325197.1012062",
    app_name: "Trunk API",
    duration_seconds: 12,
    started_at: "2026-10-18T12:06:37.841Z",
    answered_at: null,
    ended_at: null,
  };

  expect(normalizeIncomingCall(apiItem)).toEqual(expect.objectContaining({
    callerNumber: "09126438720",
    destination: "2191301508",
    destinationType: "supporter",
    supporterId: "1",
    uniqueId: "1792325197.1012062",
    appName: "Trunk API",
    durationSeconds: 12,
    startedAt: "2026-10-18T12:06:37.841Z",
    answeredAt: null,
    endedAt: null,
  }));
});

test("normalizes items returned by the incoming-calls endpoint", async () => {
  const { apiGet } = jest.requireMock("../helpers/httpClient.jsx");
  apiGet.mockResolvedValue({ data: { data: { items: [{ id: "1", src: "0912", dst: "219", started_at: "2026-10-18T12:00:00.000Z" }], meta: { page: 1, limit: 15, total: 1, lastPage: 1 } } } });

  const response = await getIncomingCalls({ schoolId: 146 });

  expect(response.items[0]).toEqual(expect.objectContaining({ callerNumber: "0912", destination: "219", startedAt: "2026-10-18T12:00:00.000Z" }));
});

test("sends every report filter with a half-open local date range", () => {
  const params = buildIncomingCallParams({ schoolId: "146", page: 3, limit: 20, search: " علی ", status: "answered", ssn: " 001 ", username: " sara ", formId: "8", from: "2026-10-20", to: "2026-10-21", sortBy: "durationSeconds", sortOrder: "ASC" });
  expect(params).toEqual(expect.objectContaining({ schoolId: 146, page: 3, limit: 20, search: "علی", status: "answered", ssn: "001", username: "sara", formId: 8, sortBy: "durationSeconds", sortOrder: "ASC" }));
  const from = new Date(params.from); const to = new Date(params.to);
  expect(from.getFullYear()).toBe(2026); expect(from.getMonth()).toBe(9); expect(from.getDate()).toBe(20); expect(from.getHours()).toBe(0);
  expect(to.getFullYear()).toBe(2026); expect(to.getMonth()).toBe(9); expect(to.getDate()).toBe(22); expect(to.getHours()).toBe(0);
});

test.each(["csv", "xlsx"])("exports %s with active filters and without pagination", async (format) => {
  const blob = new Blob(["report"]); apiGet.mockResolvedValue({ data: blob, headers: { "content-disposition": `attachment; filename=report.${format}` } });
  await expect(exportIncomingCalls(format, { schoolId: 146, page: 7, limit: 10, status: "missed", search: "0912", sortBy: "startedAt", sortOrder: "DESC" })).resolves.toEqual({ blob, filename: `report.${format}` });
  expect(apiGet.mock.calls[0][1].params).toEqual({ schoolId: 146, search: "0912", status: "missed", ssn: undefined, username: undefined, formId: undefined, from: undefined, to: undefined, sortBy: "startedAt", sortOrder: "DESC" });
});

test("gets and normalizes consultant availability for the selected school", async () => {
  const controller = new AbortController();
  apiGet.mockResolvedValue({ data: { data: { actorType: "consultant", schoolId: 146, isAvailable: true } } });

  await expect(getIncomingAvailability("146", controller.signal)).resolves.toEqual({
    actorType: "consultant", schoolId: 146, isAvailable: true,
  });
  expect(apiGet).toHaveBeenCalledWith("http://127.0.0.1:8040/incoming-calls/availability", {
    params: { schoolId: 146 }, signal: controller.signal, silent: true,
  });
});

test("patches availability with the exact numeric school body and trusts the response", async () => {
  apiPatch.mockResolvedValue({ data: { data: { actorType: "supporter", schoolId: 146, isAvailable: false } } });

  await expect(setIncomingAvailability("146", true)).resolves.toEqual({
    actorType: "supporter", schoolId: 146, isAvailable: false,
  });
  expect(apiPatch).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/incoming-calls/availability",
    { schoolId: 146, isAvailable: true },
    { silent: true }
  );
});
