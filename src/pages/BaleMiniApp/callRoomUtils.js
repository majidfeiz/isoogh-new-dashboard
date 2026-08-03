export const isCallReady = (readiness) => readiness?.ready === true;

export const baleCallErrorText = (error, fallback) => {
  const body = error?.response?.data;
  const message = body?.message ?? body?.data?.message ?? body?.error?.message;
  const text = Array.isArray(message) ? message.map(String).join("، ") : typeof message === "string" ? message : fallback;
  const traceId = body?.traceId ?? body?.data?.traceId;
  const correlationId = body?.correlationId ?? body?.data?.correlationId;
  return { text, traceId, correlationId };
};

export const shouldRotateCallKey = (error) => error?.response?.status === 502;

export const validateCallPayload = (payload = {}) => ["schoolId", "supportFormId", "studentId"].filter((key) => payload[key] == null || payload[key] === "");
