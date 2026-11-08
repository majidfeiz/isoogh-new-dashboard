import React, { useState } from "react";
import { Badge, Button, Offcanvas, OffcanvasBody, OffcanvasHeader } from "reactstrap";
import { useAuth } from "../../context/AuthContext.jsx";
import { GATEWAY_STATUS, INTENT_LABELS, OPERATION_LABELS, gatewayValue, sanitizeGatewayData } from "./gatewayLogUtils.js";

const shown = (value) => value == null || value === "" ? "—" : String(value);
const dateTime = (value) => value ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "short", timeStyle: "medium", timeZone: "Asia/Tehran" }).format(new Date(value)) : "—";

export default function GatewayLogDrawer({ item, onClose }) {
  const { hasPermission } = useAuth();
  const [copied, setCopied] = useState(false);
  if (!item) return null;
  const status = GATEWAY_STATUS[item.status] || { label: item.status || "نامشخص", color: "secondary" };
  const fingerprint = gatewayValue(item, "authorityFingerprint", "authority_fingerprint");
  const canCopyFingerprint = hasPermission("billing.gateway-logs.technical");
  const copyFingerprint = async () => { if (!fingerprint) return; await navigator.clipboard.writeText(fingerprint); setCopied(true); setTimeout(() => setCopied(false), 1200); };
  const rows = [
    ["Attempt UUID", gatewayValue(item, "attemptUuid", "attempt_uuid")],
    ["وضعیت callback", gatewayValue(item, "callbackStatus", "callback_status")],
    ["مرجع تراکنش", gatewayValue(item, "transactionReference", "transaction_reference")],
    ["پسوند Authority", gatewayValue(item, "authoritySuffix", "authority_suffix")],
    ["کد خطا", gatewayValue(item, "errorCode", "error_code")],
    ["پیام خطا", gatewayValue(item, "errorMessage", "error_message")],
    ["شروع", dateTime(gatewayValue(item, "startedAt", "started_at"))],
    ["پایان", dateTime(gatewayValue(item, "finishedAt", "finished_at"))],
  ];
  return <Offcanvas isOpen direction="end" toggle={onClose} scrollable>
    <OffcanvasHeader toggle={onClose}>جزئیات تلاش درگاه</OffcanvasHeader>
    <OffcanvasBody>
      <div className="d-flex gap-2 mb-3"><Badge color={status.color}>{status.label}</Badge><Badge color="info">{INTENT_LABELS[item.intent] || item.intent}</Badge><Badge color="secondary">{OPERATION_LABELS[item.operation] || item.operation}</Badge></div>
      <dl className="row small">{rows.map(([label, value]) => <React.Fragment key={label}><dt className="col-5">{label}</dt><dd className="col-7 text-break">{shown(value)}</dd></React.Fragment>)}</dl>
      <h6>خلاصه پاسخ پاک‌سازی‌شده</h6>
      <pre className="bg-light border rounded p-3 text-wrap text-break small" dir="ltr">{JSON.stringify(sanitizeGatewayData(gatewayValue(item, "responseSummary", "response_summary") || {}), null, 2)}</pre>
      {canCopyFingerprint && fingerprint && <details className="border rounded p-3 mt-3"><summary className="fw-semibold">اثر انگشت Authority (فنی)</summary><div className="mt-2 text-break" dir="ltr"><code>{fingerprint}</code></div><Button size="sm" color="link" className="px-0" onClick={copyFingerprint}>{copied ? "کپی شد" : "کپی اثر انگشت"}</Button></details>}
      <div className="alert alert-light border small mt-3 mb-0">اطلاعات محرمانه کامل مانند authority، token، امضا، merchant secret و اطلاعات کارت در این صفحه نمایش داده نمی‌شوند.</div>
    </OffcanvasBody>
  </Offcanvas>;
}

