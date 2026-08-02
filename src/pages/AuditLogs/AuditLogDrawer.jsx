import React, { useState } from "react";
import { Badge, Button, Offcanvas, OffcanvasBody, OffcanvasHeader } from "reactstrap";
import { ACTION_TYPES } from "./auditLogUtils.js";

const JsonNode = ({ value, name, depth = 0 }) => {
  if (value === "[REDACTED]") return <div className="my-1"><strong>{name}: </strong><Badge color="danger">محرمانه</Badge></div>;
  if (value === null || typeof value !== "object") return <div className="text-break"><strong>{name}: </strong><code>{String(value)}</code></div>;
  const entries = Object.entries(value);
  const content = entries.map(([key, child]) => <JsonNode key={key} name={key} value={child} depth={depth + 1} />);
  if (depth > 0 || entries.length > 8) {
    return <details open={depth < 2} className="ms-3 my-1"><summary><strong>{name}</strong> <span className="text-muted">({entries.length})</span></summary>{content}</details>;
  }
  return <div>{content}</div>;
};

const JsonPanel = ({ title, value }) => (
  <section className="border rounded p-2 mb-3">
    <h6>{title}</h6>
    {value && Object.keys(value).length ? <JsonNode name={title} value={value} /> : <span className="text-muted small">داده‌ای ثبت نشده است</span>}
  </section>
);

const AuditLogDrawer = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!item) return null;
  const action = ACTION_TYPES[item.action_type] || ACTION_TYPES.other;
  const errorMessage = item.metadata?.error?.message || item.metadata?.errorMessage || item.metadata?.message;
  const copyRequestId = async () => {
    if (!item.request_id) return;
    await navigator.clipboard.writeText(item.request_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <Offcanvas isOpen direction="end" toggle={onClose} scrollable>
      <OffcanvasHeader toggle={onClose}>جزئیات فعالیت #{item.id}</OffcanvasHeader>
      <OffcanvasBody>
        <div className="d-flex gap-2 mb-3"><Badge color={action.color}>{action.label}</Badge><Badge color={item.status === "failed" ? "danger" : "success"}>{item.status === "failed" ? "ناموفق" : "موفق"}</Badge></div>
        {item.status === "failed" && <div className="alert alert-danger"><strong>عملیات ناموفق بود.</strong>{errorMessage && <div className="mt-1">{errorMessage}</div>}</div>}
        <dl className="row small">
          <dt className="col-4">کاربر</dt><dd className="col-8">{item.actor_name || "سیستم"} {item.actor_user_id ? `#${item.actor_user_id}` : ""}</dd>
          <dt className="col-4">مسیر</dt><dd className="col-8 text-break">{item.http_method} {item.path}</dd>
          <dt className="col-4">Subject</dt><dd className="col-8">{item.subject_type || "—"} {item.subject_id || ""}</dd>
          <dt className="col-4">Request ID</dt><dd className="col-8 text-break">{item.request_id || "—"} {item.request_id && <Button size="sm" color="link" className="p-0 ms-1" onClick={copyRequestId}>{copied ? "کپی شد" : "کپی"}</Button>}</dd>
          <dt className="col-4">User Agent</dt><dd className="col-8 text-break">{item.user_agent || "—"}</dd>
        </dl>
        <JsonPanel title="Request Data" value={item.request_data} />
        <JsonPanel title="Changes" value={item.changes} />
        <JsonPanel title="Metadata" value={item.metadata} />
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default AuditLogDrawer;
