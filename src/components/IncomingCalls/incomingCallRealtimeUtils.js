export const unwrapRealtimePayload = (payload) => payload?.data?.data ?? payload?.data ?? payload ?? {};

export const normalizeRealtimeIncomingCall = (payload) => {
  const source = unwrapRealtimePayload(payload);
  const caller = source.caller || {};
  const studentId = caller.studentId ?? caller.student_id ?? source.studentId ?? source.student_id;
  const matched = caller.matched ?? source.matched ?? (studentId != null ? true : undefined);
  const optional = (key, resolved) => resolved == null ? {} : { [key]: resolved };
  return {
    ...source,
    ...optional("callId", source.callId ?? source.call_id ?? source.id),
    ...optional("schoolId", source.schoolId ?? source.school_id),
    ...optional("uniqueId", source.uniqueId ?? source.unique_id),
    ...optional("destinationType", source.destinationType ?? source.destination_type),
    ...optional("startedAt", source.startedAt ?? source.started_at ?? source.createdAt ?? source.created_at),
    ...((source.caller || source.src || source.callerNumber || source.caller_number || studentId != null || matched != null) ? { caller: {
      ...caller,
      ...optional("phone", caller.phone ?? source.src ?? source.callerNumber ?? source.caller_number),
      ...optional("matched", matched),
      ...optional("studentId", studentId),
      ...optional("primaryPhone", caller.primaryPhone ?? caller.primary_phone),
    } } : {}),
  };
};

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
  const next = normalizeRealtimeIncomingCall(update);
  if (!current || !isSameIncomingCall(current, next)) return current;
  return { ...current, ...next, caller: { ...(current.caller || {}), ...(next.caller || {}) } };
};

export const resolveIncomingCallSchool = (user) => {
  const id = user?.schoolId ?? user?.school_id ?? user?.school?.id;
  if (id != null && id !== "") return Number(id);
  if (Array.isArray(user?.schools) && user.schools.length === 1) return Number(user.schools[0]?.id) || null;
  return null;
};
