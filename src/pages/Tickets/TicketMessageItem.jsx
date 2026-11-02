import React from "react";
import { Badge, Button } from "reactstrap";
import { formatTicketDate, ticketMessageIdentity } from "./ticketUtils.js";

export default function TicketMessageItem({ item, ticket, attachments = [], canDownload, onDownload }) {
  const identity = ticketMessageIdentity(item, ticket);
  return <article className={`ticket-message ticket-message--${identity.side}`}>
    <div className="ticket-avatar" aria-hidden="true"><i className={identity.side === "isoogh" ? "bx bx-support" : "bx bx-user"} /></div>
    <div className="ticket-message-body">
      <div className="ticket-message-header d-flex flex-wrap justify-content-between align-items-start gap-2">
        <div className="ticket-sender"><div className="d-flex flex-wrap align-items-center gap-2"><strong>{identity.name}</strong><Badge color={identity.side === "isoogh" ? "primary" : identity.side === "school" ? "success" : "secondary"}>{identity.badge}</Badge></div><small className="text-muted d-block mt-1">{identity.organization}</small></div>
        <time className="text-muted small text-nowrap">{formatTicketDate(item.createdAt)}</time>
      </div>
      <p className="mb-2 mt-2 ticket-message-text">{item.message}</p>
      {canDownload && attachments.map((attachment) => <Button key={attachment.id} color="soft-primary" size="sm" onClick={() => onDownload(attachment)}><i className="bx bx-download ms-1" />{attachment.fileName || attachment.name || "دریافت فایل"}</Button>)}
    </div>
  </article>;
}

