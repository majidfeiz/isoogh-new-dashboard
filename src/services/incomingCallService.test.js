import { apiPatch } from "../helpers/httpClient.jsx";
import { getIncomingCalls, normalizeIncomingCall, normalizeIncomingCallPriorities, updateIncomingCallSettings } from "./incomingCallService.jsx";

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
