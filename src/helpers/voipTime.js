export const formatUnixFaDateTime = (unix) => {
  if (!unix || Number(unix) <= 0) return "—";
  const num = Number(unix);
  if (!Number.isFinite(num) || num >= 2147483647) return "—";
  const date = new Date(num * 1000);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fa-IR");
};

export const getVoipStartedAtDisplay = (row = {}) =>
  row?.call_started_at_jalali ||
  row?.started_at_jalali ||
  row?.call_date_jalali ||
  formatUnixFaDateTime(
    row?.starttime_unix_normalized ??
    row?.starttime_unix ??
    row?.starttimeUnix ??
    row?.startTimeUnix
  );

export const getVoipEndedAtDisplay = (row = {}) =>
  row?.call_ended_at_jalali ||
  row?.ended_at_jalali ||
  formatUnixFaDateTime(
    row?.endtime_unix_normalized ??
    row?.endtime_unix ??
    row?.endtimeUnix ??
    row?.endTimeUnix
  );

export const getVoipCallDateDisplay = (row = {}) =>
  row?.call_date_jalali ||
  row?.call_started_at_jalali ||
  row?.started_at_jalali ||
  row?.callDateJalali ||
  row?.callDate ||
  formatUnixFaDateTime(
    row?.starttime_unix_normalized ??
    row?.starttime_unix ??
    row?.starttimeUnix ??
    row?.startTimeUnix
  );
