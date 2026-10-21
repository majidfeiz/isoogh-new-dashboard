export const INCOMING_CALL_NOTIFICATION_TYPES = [
  "incoming_call.started",
  "incoming_call.missed",
  "incoming_call.hangup",
  "incoming_call.transferred",
];

export const isIncomingCallNotification = (item) => INCOMING_CALL_NOTIFICATION_TYPES.includes(item?.type);

export const incomingCallNotificationTone = (item) => {
  const event = item?.data?.event;
  if (event === "missed" || item?.type === "incoming_call.missed") return "danger";
  if (event === "hangup" || item?.type === "incoming_call.hangup") return "secondary";
  return "primary";
};

export const buildLatestSupportFormTarget = (latestSupportForm) => {
  if (!latestSupportForm?.supportFormId || !latestSupportForm?.studentId) return null;
  const search = new URLSearchParams();
  if (latestSupportForm.assignmentId != null) search.set("assignmentId", latestSupportForm.assignmentId);
  if (latestSupportForm.adviserId != null) search.set("adviserId", latestSupportForm.adviserId);
  const query = search.toString();
  return {
    pathname: `/adviser-calls/forms/${latestSupportForm.supportFormId}/students/${latestSupportForm.studentId}`,
    search: query ? `?${query}` : "",
    state: {
      assignmentId: latestSupportForm.assignmentId ?? null,
      adviserId: latestSupportForm.adviserId ?? null,
      studentId: latestSupportForm.studentId,
      supportFormId: latestSupportForm.supportFormId,
      highlightAssignmentId: latestSupportForm.assignmentId ?? null,
    },
  };
};

export const notificationToIncomingCall = (item) => ({
  callId: item?.data?.callId,
  schoolId: item?.data?.schoolId,
  uniqueId: item?.data?.uniqueId,
  status: item?.data?.status,
  destinationType: item?.data?.destinationType,
  startedAt: item?.data?.occurredAt ?? item?.createdAt,
  callerProfileUrl: item?.data?.callerProfileUrl,
  latestSupportForm: item?.data?.latestSupportForm ?? null,
  caller: {
    phone: item?.data?.callerPhone,
    matched: Boolean(item?.data?.matched),
    studentId: item?.data?.studentId,
    name: item?.data?.callerName,
  },
});

export const incomingNotificationDedupeKey = (item) => item?.data?.callId != null && item?.data?.event
  ? `${item.data.callId}:${item.data.event}`
  : null;

export const formatNotificationDateTime = (value) => value
  ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
  : "";
