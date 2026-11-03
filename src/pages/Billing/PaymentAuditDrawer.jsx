import React, { useState } from "react";
import { Badge, Button, Offcanvas, OffcanvasBody, OffcanvasHeader } from "reactstrap";
import moment from "moment-jalaali";
import { auditValue, paymentOperation, paymentStatusMessage, sanitizeAuditData } from "./paymentAuditUtils.js";

const shown = (value) => value == null || value === "" ? "—" : String(value);
const JsonPanel = ({ value }) => <pre className="bg-light border rounded p-3 small text-wrap text-break" dir="ltr">{JSON.stringify(sanitizeAuditData(value || {}), null, 2)}</pre>;

export default function PaymentAuditDrawer({ item, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!item) return null;
  const requestId = auditValue(item, "requestId", "request_id");
  const actorName = auditValue(item, "actorName", "actor_name") || "سیستم";
  const schoolIds = auditValue(item, "schoolIds", "school_ids") || [];
  const method = auditValue(item, "httpMethod", "http_method");
  const code = auditValue(item, "statusCode", "status_code");
  const duration = auditValue(item, "durationMs", "duration_ms");
  const createdAt = auditValue(item, "createdAt", "created_at");
  const requestData = auditValue(item, "requestData", "request_data");
  const failed = item.status === "failed" || Number(code) >= 400;
  const copy = async () => { if (!requestId) return; await navigator.clipboard.writeText(requestId); setCopied(true); setTimeout(() => setCopied(false), 1200); };

  return <Offcanvas isOpen direction="end" toggle={onClose} scrollable className="payment-audit-drawer">
    <OffcanvasHeader toggle={onClose}>جزئیات عملیات پرداخت</OffcanvasHeader>
    <OffcanvasBody>
      <div className="d-flex flex-wrap gap-2 mb-3"><Badge color={failed ? "danger" : "success"}>{failed ? "ناموفق" : "موفق"}</Badge><Badge color="info">{paymentOperation(item).label}</Badge></div>
      <dl className="row small">
        <dt className="col-4">Request ID</dt><dd className="col-8 text-break">{shown(requestId)} {requestId && <Button size="sm" color="link" className="p-0" onClick={copy}>{copied ? "کپی شد" : "کپی"}</Button>}</dd>
        <dt className="col-4">کاربر</dt><dd className="col-8">{actorName}</dd>
        <dt className="col-4">مجموعه‌ها</dt><dd className="col-8">{Array.isArray(schoolIds) && schoolIds.length ? schoolIds.join("، ") : shown(schoolIds)}</dd>
        <dt className="col-4">مسیر</dt><dd className="col-8 text-break" dir="ltr">{shown(method)} {shown(item.path)}</dd>
        <dt className="col-4">HTTP status</dt><dd className="col-8">{shown(code)}</dd>
        <dt className="col-4">مدت اجرا</dt><dd className="col-8">{duration == null ? "—" : `${Number(duration).toLocaleString("fa-IR")} ms`}</dd>
        <dt className="col-4">زمان</dt><dd className="col-8">{createdAt ? moment(createdAt).format("jYYYY/jMM/jDD HH:mm:ss") : "—"}</dd>
      </dl>
      {failed && <div className="alert alert-danger"><strong>علت:</strong> {paymentStatusMessage(item)}</div>}
      <h6>جزئیات درخواست امن</h6><JsonPanel value={requestData} />
      <h6>خطای ثبت‌شده</h6><JsonPanel value={item.metadata?.error || {}} />
      <div className="alert alert-light border small mb-0">مقادیر محرمانه قابل بازیابی نیستند و با <code>[REDACTED]</code> نمایش داده می‌شوند.</div>
    </OffcanvasBody>
  </Offcanvas>;
}

