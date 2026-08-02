import { sendBaleClientLog } from "../../services/baleService.jsx";
import { sanitizeBaleTelemetry } from "./baleAdapter.js";

const sent = new Set();
const timestamps = [];

export function logBaleClientEvent(event, { level = "info", message = "", context = {} } = {}) {
  const now = Date.now();
  while (timestamps.length && timestamps[0] < now - 60000) timestamps.shift();
  const safeContext = sanitizeBaleTelemetry(context);
  const key = `${event}:${safeContext.stage || ""}:${safeContext.route || ""}:${safeContext.diagnosticId || ""}`;
  if (sent.has(key) || timestamps.length >= 30) return;
  sent.add(key);
  timestamps.push(now);
  sendBaleClientLog({ level, event, message: String(message).slice(0, 240), context: safeContext });
}

export function resetBaleTelemetryForTests() {
  sent.clear();
  timestamps.splice(0, timestamps.length);
}
