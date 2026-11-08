import { apiGet } from "../helpers/httpClient.jsx";
import { getBillingGatewayLogs } from "./gatewayLogService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }));

test("passes gateway filters and normalizes pagination", async () => {
  const controller = new AbortController();
  apiGet.mockResolvedValue({ data: { data: { items: [{ id: 1 }], meta: { page: 2, limit: 20, total: 41, lastPage: 3 } } } });
  const result = await getBillingGatewayLogs({ schoolId: 94, intent: "wallet_topup", operation: "verify", status: "failed", page: 2, limit: 20 }, controller.signal);
  expect(apiGet).toHaveBeenCalledWith(expect.stringMatching(/\/billing\/gateway-logs$/), {
    params: { schoolId: 94, intent: "wallet_topup", operation: "verify", status: "failed", page: 2, limit: 20 },
    signal: controller.signal,
    silent: true,
  });
  expect(result.pagination).toEqual({ page: 2, limit: 20, total: 41, lastPage: 3 });
});

