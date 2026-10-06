import moment from "moment-jalaali";

export const TICKET_STATUS_FLOW = ["باز", "در حال بررسی", "حل‌شده", "بسته"];
export const TICKET_STATUSES = TICKET_STATUS_FLOW;
export const TICKET_STATUS_LABELS = Object.fromEntries(TICKET_STATUS_FLOW.map((status) => [status, status]));
export const TICKET_STATUS_COLORS = { "باز": "primary", "در حال بررسی": "warning", "حل‌شده": "success", "بسته": "secondary" };
export const MAX_TICKET_FILE_SIZE = 10 * 1024 * 1024;

export const nextTicketStatus = (status) => {
  const index = TICKET_STATUSES.indexOf(status);
  return index >= 0 && index < TICKET_STATUSES.length - 1 ? TICKET_STATUSES[index + 1] : null;
};

export const sanitizeTicketStatus = (status) => TICKET_STATUS_FLOW.includes(status) ? status : "";

export const isGlobalTicketRole = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return roles.some((role) => ["admin", "super_manager", "support"].includes(
    String(typeof role === "string" ? role : role?.slug || role?.name || "").toLowerCase()
  ));
};

export const validateTicketFile = (file) => !file || file.size <= MAX_TICKET_FILE_SIZE;

export const formatTicketDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return moment(date).format("jYYYY/jMM/jDD HH:mm");
};

export const taxonomyName = (value) => (typeof value === "string" ? value : value?.name) || "تعیین نشده";

export const isMessageAttachment = (attachment, messageId) =>
  String(attachment?.messageId || "") === String(messageId) ||
  (String(attachment?.model || "").endsWith("TicketMessage") && String(attachment?.modelId) === String(messageId));

export const isTicketAttachment = (attachment, ticketId) =>
  String(attachment?.model || "").endsWith("Ticket")
    ? String(attachment?.modelId) === String(ticketId)
    : !attachment?.messageId;

export const errorMessage = (error, fallback = "انجام عملیات با خطا روبه‌رو شد") => {
  const message = error?.response?.data?.message;
  return Array.isArray(message) ? message.join("، ") : message || fallback;
};
