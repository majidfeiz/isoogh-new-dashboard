import { apiGet, apiPost } from "../helpers/httpClient.jsx";
import { cancelCallQueueJob, getCallQueue, getCallQueueStats, retryCallQueueJob } from "./callQueueService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPost: jest.fn() }));

beforeEach(() => jest.clearAllMocks());
const paramsOf = (call) => Object.fromEntries(call[1].params.entries());

test("all queue reads send explicit schoolId", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: {} } } });
  await getCallQueue({ schoolId: 12, status: "failed", page: 2, limit: 25 });
  await getCallQueueStats({ schoolId: 12 });
  expect(paramsOf(apiGet.mock.calls[0])).toEqual({ schoolId: "12", status: "failed", page: "2", limit: "25" });
  expect(paramsOf(apiGet.mock.calls[1])).toEqual({ schoolId: "12" });
});

test("admin aggregate reads send only allSchools=true", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: {}, scope: { mode: "all", schoolId: null } } } });
  const list = await getCallQueue({ allSchools: true, page: 1, limit: 20 });
  await getCallQueueStats({ allSchools: true });
  expect(paramsOf(apiGet.mock.calls[0])).toEqual({ allSchools: "true", page: "1", limit: "20" });
  expect(paramsOf(apiGet.mock.calls[1])).toEqual({ allSchools: "true" });
  expect(list.scope).toEqual({ mode: "all", schoolId: null });
});

test("manager aggregate reads omit schoolId and allSchools", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: {}, scope: { mode: "managed", schoolId: null } } } });
  await getCallQueue();
  await getCallQueueStats();
  expect(paramsOf(apiGet.mock.calls[0])).toEqual({ page: "1", limit: "20" });
  expect(paramsOf(apiGet.mock.calls[1])).toEqual({});
});

test("list and stats receive the same encoded Tehran range", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [], meta: {} } } });
  const range = { from: "2026-11-01T00:00:00.000+03:30", to: "2026-11-02T00:00:00.000+03:30" };
  await getCallQueue({ allSchools: true, page: 1, limit: 20, ...range });
  await getCallQueueStats({ allSchools: true, ...range });
  expect(paramsOf(apiGet.mock.calls[0])).toEqual({ allSchools: "true", page: "1", limit: "20", ...range });
  expect(paramsOf(apiGet.mock.calls[1])).toEqual({ allSchools: "true", ...range });
  expect(apiGet.mock.calls[0][1].params.toString()).toContain("%2B03%3A30");
});

test("never sends only one range boundary", async () => {
  await expect(getCallQueue({ from: "2026-11-01T00:00:00.000+03:30" })).rejects.toThrow("provided together");
  await expect(getCallQueueStats({ to: "2026-11-02T00:00:00.000+03:30" })).rejects.toThrow("provided together");
  expect(apiGet).not.toHaveBeenCalled();
});

test("retry and cancel send schoolId in body and suppress generic error toast", async () => {
  apiPost.mockResolvedValue({ data: { data: {} } });
  await retryCallQueueJob(41, 12);
  await cancelCallQueueJob(42, 12);
  expect(apiPost).toHaveBeenNthCalledWith(1, "http://127.0.0.1:8040/voip/call-queue/41/retry", { schoolId: 12 }, { silent: true });
  expect(apiPost).toHaveBeenNthCalledWith(2, "http://127.0.0.1:8040/voip/call-queue/42/cancel", { schoolId: 12 }, { silent: true });
});

test("queue requests reject conflicting scopes before transport", async () => {
  await expect(getCallQueue({ schoolId: 12, allSchools: true })).rejects.toThrow("mutually exclusive");
  await expect(getCallQueueStats({ schoolId: 12, allSchools: true })).rejects.toThrow("mutually exclusive");
  expect(apiGet).not.toHaveBeenCalled();
});
