import React, { useState } from "react";
import { Badge, Button, Modal, ModalBody, ModalFooter, ModalHeader, Progress } from "reactstrap";
import moment from "moment-jalaali";
import { formatData, progressPercent, STATUS_CONFIG } from "./importLogUtils.js";

export const faNumber = (value) => Number(value || 0).toLocaleString("fa-IR");
export const faDate = (value) => value ? moment(value).format("jYYYY/jMM/jDD HH:mm:ss") : "—";
export const StatusBadge = ({ status }) => { const config = STATUS_CONFIG[status] || { label: status || "—", color: "dark" }; return <Badge color={config.color}>{config.label}</Badge>; };
export const ProgressCell = ({ item }) => { const percent = progressPercent(item.processedRows, item.totalRows); return <div style={{ minWidth: 110 }}><small>{faNumber(item.processedRows)} از {faNumber(item.totalRows)} ({percent.toLocaleString("fa-IR")}٪)</small><Progress value={percent} style={{ height: 5 }} /></div>; };
export const LoadingRows = () => <div aria-label="در حال بارگذاری" className="placeholder-glow">{Array.from({ length: 7 }).map((_, index) => <div key={index} className="placeholder col-12 mb-3" style={{ height: 30 }} />)}</div>;
export const ErrorBox = ({ error, onRetry }) => error ? <div className={`alert ${error.status === 403 || error.status === 404 ? "alert-warning" : "alert-danger"}`}>{error.message}{error.status !== 401 && <Button size="sm" outline color="danger" className="ms-2" onClick={onRetry}>تلاش مجدد</Button>}</div> : null;

export const DataModal = ({ value, onClose }) => {
  const [full, setFull] = useState(false);
  const text = formatData(value);
  const shown = full || text.length <= 3000 ? text : `${text.slice(0, 3000)}\n…`;
  return <Modal isOpen={value !== undefined} toggle={onClose} size="lg" scrollable><ModalHeader toggle={onClose}>داده ردیف</ModalHeader><ModalBody><pre dir="ltr" className="bg-light border rounded p-3 mb-0" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", textAlign: "left" }}>{shown}</pre></ModalBody><ModalFooter>{text.length > 3000 && <Button color="secondary" onClick={() => setFull((current) => !current)}>{full ? "نمایش خلاصه" : "مشاهده کامل"}</Button>}<Button color="primary" onClick={() => navigator.clipboard?.writeText(text)}>کپی</Button><Button color="light" onClick={onClose}>بستن</Button></ModalFooter></Modal>;
};

export const Summary = ({ item }) => <div className="row g-3">
  <div className="col-md-4"><strong>نام فایل:</strong> {item.fileName || "—"}</div><div className="col-md-4"><strong>نوع:</strong> {item.importType || "—"}</div><div className="col-md-4"><strong>وضعیت:</strong> <StatusBadge status={item.status} /></div>
  <div className="col-md-4"><strong>مجموعه:</strong> {item.school?.name || item.schoolName || item.schoolId || "—"}</div><div className="col-md-4"><strong>سازنده:</strong> {item.creator?.name || item.createdByUser?.name || item.createdBy || "—"}</div><div className="col-md-4"><ProgressCell item={item} /></div>
  <div className="col-md-3"><strong>کل:</strong> {faNumber(item.totalRows)}</div><div className="col-md-3"><strong>پردازش‌شده:</strong> {faNumber(item.processedRows)}</div><div className="col-md-3 text-danger"><strong>ناموفق:</strong> {faNumber(item.failedRows)}</div><div className="col-md-3"><strong>ایجاد:</strong> {faDate(item.createdAt)}</div>
  <div className="col-md-6"><strong>شروع:</strong> {faDate(item.startedAt)}</div><div className="col-md-6"><strong>پایان:</strong> {faDate(item.finishedAt)}</div>
  {item.errorMessage && <div className="col-12"><div className="alert alert-danger mb-0" style={{ whiteSpace: "pre-wrap" }}>{String(item.errorMessage)}</div></div>}
</div>;
