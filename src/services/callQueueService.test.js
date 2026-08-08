import { apiGet, apiPost } from "../helpers/httpClient.jsx";
import { cancelCallQueueJob, getCallQueue, getCallQueueStats, retryCallQueueJob } from "./callQueueService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPost: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

test("all queue reads send explicit schoolId", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: {} } } });
  await getCallQueue({ schoolId: 12, status: "failed", page: 2, limit: 25 });
  await getCallQueueStats({ schoolId: 12 });
  expect(apiGet.mock.calls[0][1]).toEqual(expect.objectContaining({ silent: true, params: { schoolId: 12, status: "failed", page: 2, limit: 25 } }));
  expect(apiGet.mock.calls[1][1]).toEqual(expect.objectContaining({ silent: true, params: { schoolId: 12 } }));
});

test("retry and cancel send schoolId in body and suppress generic error toast", async () => {
  apiPost.mockResolvedValue({ data: { data: {} } });
  await retryCallQueueJob(41, 12);
  await cancelCallQueueJob(42, 12);
  expect(apiPost).toHaveBeenNthCalledWith(1, "http://127.0.0.1:8040/voip/call-queue/41/retry", { schoolId: 12 }, { silent: true });
  expect(apiPost).toHaveBeenNthCalledWith(2, "http://127.0.0.1:8040/voip/call-queue/42/cancel", { schoolId: 12 }, { silent: true });
});

test("queue requests fail before transport when schoolId is missing", async () => {
  await expect(getCallQueue()).rejects.toThrow("schoolId is required");
  await expect(getCallQueueStats()).rejects.toThrow("schoolId is required");
  expect(apiGet).not.toHaveBeenCalled();
});
