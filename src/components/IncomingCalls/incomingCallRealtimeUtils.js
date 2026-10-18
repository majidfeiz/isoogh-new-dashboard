export const unwrapRealtimePayload = (payload) => payload?.data?.data ?? payload?.data ?? payload ?? {};

export const incomingCallKey = (call) => call?.callId != null
  ? `call:${call.callId}`
  : call?.uniqueId ? `unique:${call.uniqueId}` : null;

export const isSameIncomingCall = (left, right) => Boolean(
  left && right && (
    (left.callId != null && right.callId != null && String(left.callId) === String(right.callId))
    || (left.uniqueId && right.uniqueId && String(left.uniqueId) === String(right.uniqueId))
  )
);

export const mergeIncomingCall = (current, update) => {
  const next = unwrapRealtimePayload(update);
  if (!current || !isSameIncomingCall(current, next)) return current;
  return { ...current, ...next, caller: { ...(current.caller || {}), ...(next.caller || {}) } };
};

export const resolveIncomingCallSchool = (user) => {
  const id = user?.schoolId ?? user?.school_id ?? user?.school?.id;
  if (id != null && id !== "") return Number(id);
  if (Array.isArray(user?.schools) && user.schools.length === 1) return Number(user.schools[0]?.id) || null;
  return null;
};
