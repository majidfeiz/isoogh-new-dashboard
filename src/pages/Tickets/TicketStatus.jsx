import React from "react";
import { Badge } from "reactstrap";
import { TICKET_STATUS_COLORS, TICKET_STATUS_LABELS } from "./ticketUtils.js";

export default function TicketStatus({ status }) {
  return <Badge color={TICKET_STATUS_COLORS[status] || "light"} pill>{TICKET_STATUS_LABELS[status] || status || "—"}</Badge>;
}
