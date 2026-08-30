export const isQueuedCallResponse = (result) =>
  result?.status === "queued" || (result?.queueJobId != null && result?.callGroupId == null);

export const normalizeQueuedCall = (result = {}) => ({
  callGroupId: null,
  queueJobId: result.queueJobId ?? result.queue_job_id ?? null,
  traceId: result.traceId ?? result.trace_id ?? null,
  correlationId: result.correlationId ?? result.correlation_id ?? null,
  voipCallId: result.voipCallId ?? result.voip_call_id ?? null,
  progress: Number(result.progress ?? 30),
  status: "queued",
});

export async function pollQueuedCallTrace({ traceId, getTrace, signal, intervalMs = 2500, maxAttempts = 48 }) {
  if (!traceId || typeof getTrace !== "function") return null;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (signal?.aborted) return null;
    if (typeof document === "undefined" || document.visibilityState === "visible") {
      const trace = await getTrace(traceId, { signal });
      if (["completed", "failed"].includes(trace?.status)) return trace;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return null;
}
