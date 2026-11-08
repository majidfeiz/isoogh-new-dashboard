import { sanitizeGatewayData } from "./gatewayLogUtils.js";

test("redacts all gateway credentials recursively", () => {
  expect(sanitizeGatewayData({
    authority: "full-secret",
    authority_fingerprint: "technical-only",
    nested: { Token: "token", cardNumber: "6037", amount: 500000, status: "OK" },
  })).toEqual({
    authority: "[REDACTED]",
    authority_fingerprint: "[REDACTED]",
    nested: { Token: "[REDACTED]", cardNumber: "[REDACTED]", amount: 500000, status: "OK" },
  });
});

