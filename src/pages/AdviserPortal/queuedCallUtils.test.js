import { isQueuedCallResponse, normalizeQueuedCall, pollQueuedCallTrace } from "./queuedCallUtils.js";

test("normalizes the new queued call response without treating it as connected", () => {
  const result = normalizeQueuedCall({ callGroupId: null, queueJobId: 9, traceId: 14, correlationId: "c-1", progress: 30, status: "queued" });
  expect(isQueuedCallResponse(result)).toBe(true);
  expect(result).toEqual({ callGroupId: null, queueJobId: 9, traceId: 14, correlationId: "c-1", voipCallId: null, progress: 30, status: "queued" });
});

test("never mistakes a generic response id for the current VoIP call id", () => {
  expect(normalizeQueuedCall({ id: 99, status: "queued" }).voipCallId).toBeNull();
});

test("normalizes snake-case queued call identifiers", () => {
  expect(normalizeQueuedCall({ queue_job_id: 9, trace_id: 14, voip_call_id: 88, correlation_id: "c-2" })).toEqual(expect.objectContaining({
    queueJobId: 9,
    traceId: 14,
    voipCallId: 88,
    correlationId: "c-2",
  }));
});

test("polls trace through send and CDR phases until backend reports a final state", async () => {
  const getTrace = jest.fn().mockResolvedValueOnce({ status: "in_progress" }).mockResolvedValueOnce({ status: "waiting_for_cdr" }).mockResolvedValueOnce({ status: "completed" });
  const result = await pollQueuedCallTrace({ traceId: 14, getTrace, intervalMs: 0 });
  expect(result.status).toBe("completed");
  expect(getTrace).toHaveBeenCalledTimes(3);
});
