export const isQueuedCallResponse = (result) =>
  result?.status === "queued" || (result?.queueJobId != null && result?.callGroupId == null);

export const normalizeQueuedCall = (result = {}) => ({
  callGroupId: null,
  queueJobId: result.queueJobId ?? null,
  traceId: result.traceId ?? null,
  correlationId: result.correlationId ?? null,
  voipCallId: result.voipCallId ?? null,
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
