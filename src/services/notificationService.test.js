import { normalizeNotification } from "./notificationService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiDelete: jest.fn(), apiGet: jest.fn(), apiPatch: jest.fn(), apiPost: jest.fn(),
}));

test("preserves incoming-call data returned by the notification API", () => {
  const data = { event: "started", callId: 481, callerPhone: "0912", matched: false };
  expect(normalizeNotification({ id: 1, type: "incoming_call.started", data })).toEqual(expect.objectContaining({
    id: 1, type: "incoming_call.started", data,
  }));
});
