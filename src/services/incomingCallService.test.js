import { apiPatch } from "../helpers/httpClient.jsx";
import { normalizeIncomingCallPriorities, updateIncomingCallSettings } from "./incomingCallService.jsx";

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
