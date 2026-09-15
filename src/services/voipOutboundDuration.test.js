import { normalizeOutboundCallItem } from "./voipService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }));

test("uses only the backend talk duration and does not fall back to legacy duration", () => {
  expect(normalizeOutboundCallItem({ duration: "00:02:40", talk_duration_seconds: 160 }).talk_duration_seconds).toBe(160);
  expect(normalizeOutboundCallItem({ duration: "00:02:40", talk_duration_seconds: 0 }).talk_duration_seconds).toBe(0);
  expect(normalizeOutboundCallItem({ duration: "00:02:40", talk_duration_seconds: null }).talk_duration_seconds).toBeNull();
  expect(normalizeOutboundCallItem({ duration: "00:02:40" }).talk_duration_seconds).toBeNull();
});
