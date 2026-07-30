import React, { useMemo, useState } from "react";
import { Badge, Button, Progress } from "reactstrap";
import {
  clampProgress,
  EVENT_LEVEL,
  formatTraceDate,
  readableStep,
  TRACE_STATUS,
} from "./callTraceUtils.js";

export const StatusBadge = ({ status }) => {
  const config = TRACE_STATUS[status] || { label: status || "نامشخص", color: "secondary" };
  return <Badge color={config.color}>{config.label}</Badge>;
};

export const ProgressCell = ({ progress, status, errorMessage }) => {
  const value = clampProgress(progress);
  const color = TRACE_STATUS[status]?.color || "secondary";
  return (
    <div className="trace-progress-cell">
      <div className="d-flex justify-content-between small mb-1">
        <span>{status === "waiting_for_cdr" ? "در انتظار گزارش نهایی" : "پیشرفت"}</span>
        <strong>{value.toLocaleString("fa-IR")}٪</strong>
      </div>
      <Progress value={value} color={color} className="trace-progress" />
      {status === "failed" && errorMessage ? (
        <div className="text-danger small mt-1 text-truncate" title={errorMessage}>{errorMessage}</div>
      ) : null}
    </div>
  );
};

const highlightJson = (value) => {
  const json = JSON.stringify(value, null, 2)
    ?.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  if (!json) return "";
  return json.replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (token) => {
      let className = "json-number";
      if (/^"/.test(token)) className = /:$/.test(token) ? "json-key" : "json-string";
      else if (/true|false/.test(token)) className = "json-boolean";
      else if (/null/.test(token)) className = "json-null";
      return `<span class="${className}">${token}</span>`;
    }
  );
};

export const JsonInspector = ({ title, value }) => {
  const [expanded, setExpanded] = useState(false);
  const html = useMemo(() => highlightJson(value), [value]);
  if (value == null) return <div className="text-muted small">{title}: —</div>;
  const copy = (event) => {
    event.stopPropagation();
    navigator.clipboard?.writeText(JSON.stringify(value, null, 2));
  };
  return (
    <div className="trace-json">
      <div className="d-flex align-items-center justify-content-between">
        <Button color="link" size="sm" className="p-0" onClick={() => setExpanded((open) => !open)}>
          <i className={`bx bx-chevron-${expanded ? "down" : "left"} align-middle`} /> {title}
        </Button>
        <Button color="light" size="sm" onClick={copy} title="کپی JSON"><i className="bx bx-copy" /></Button>
      </div>
      {expanded ? <pre className="mt-2" dangerouslySetInnerHTML={{ __html: html }} /> : null}
    </div>
  );
};

export const TraceTimeline = ({ events = [] }) => {
  const sortedEvents = useMemo(
    () => [...events].sort((first, second) => first.sequence - second.sequence),
    [events]
  );
  if (!sortedEvents.length) return <div className="text-muted text-center py-4">هنوز رویدادی ثبت نشده است.</div>;
  return (
    <div className="trace-timeline">
      {sortedEvents.map((event) => {
        const level = EVENT_LEVEL[event.level] || { label: event.level || "اطلاع", color: "secondary" };
        return (
          <article className={`trace-event trace-event-${level.color}`} key={event.id}>
            <div className="d-flex justify-content-between gap-2 flex-wrap">
              <div>
                <strong>{event.title || readableStep(event.step)}</strong>
                <div className="text-muted small mt-1">{readableStep(event.step)}</div>
              </div>
              <div className="text-end">
                <Badge color={level.color}>{level.label}</Badge>
                <div className="small text-muted mt-1">{formatTraceDate(event.createdAt, true)}</div>
              </div>
            </div>
            {event.message ? <p className="mb-2 mt-2">{event.message}</p> : null}
            <div className="d-flex gap-2 flex-wrap mb-2">
              <Badge color="light" className="text-dark">{clampProgress(event.progress).toLocaleString("fa-IR")}٪</Badge>
              {event.httpStatus != null ? <Badge color={event.httpStatus < 400 ? "success" : "danger"}>HTTP {event.httpStatus}</Badge> : null}
              {event.durationMs != null ? <Badge color="dark">{Number(event.durationMs).toLocaleString("fa-IR")} ms</Badge> : null}
            </div>
            <JsonInspector title="Payload ارسالی" value={event.payload} />
            <JsonInspector title="Response دریافتی" value={event.response} />
          </article>
        );
      })}
    </div>
  );
};
