import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";
import {
  downloadParentTagChildrenTemplate,
  importParentTagChildren,
} from "../../services/parentTagService.jsx";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const getSchool = (tag) => tag?.school || tag?.collection || tag?.school_info || null;
const getSchoolId = (tag) =>
  tag?.school_id ?? tag?.schoolId ?? getSchool(tag)?.id ?? null;
const getSchoolName = (tag) =>
  getSchool(tag)?.name || getSchool(tag)?.title || tag?.school_name || tag?.schoolName || "";

const normalizeRows = (value) => {
  const rows = Array.isArray(value) ? value : [];
  return rows.map((row, index) => ({
    rowNumber: row?.rowNumber ?? row?.row_number ?? index + 2,
    name: row?.name ?? row?.tagName ?? row?.tag_name ?? "-",
    reason: row?.reason ?? row?.message ?? row?.error ?? "ردیف نامعتبر است.",
  }));
};

export const getImportValidationRows = (error) => {
  const body = error?.response?.data;
  const source = body?.message?.errors ?? body?.errors;
  return normalizeRows(source);
};

const getApiErrorMessage = (error) => {
  const body = error?.response?.data;
  const message = body?.message;
  if (typeof message === "string") return message;
  if (typeof body?.error === "string") return body.error;
  return "ایمپورت زیرتگ‌ها با خطا مواجه شد. دوباره تلاش کنید.";
};

const getDownloadName = (headers, parentId) => {
  const disposition = headers?.["content-disposition"] || headers?.["Content-Disposition"] || "";
  const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  const regular = disposition.match(/filename="?([^";]+)"?/i);
  const encoded = utf8?.[1];
  if (encoded) {
    try { return decodeURIComponent(encoded); } catch { return encoded; }
  }
  return regular?.[1] || `parent-tag-${parentId}-children-template.xlsx`;
};

const ParentTagChildrenImportModal = ({ isOpen, toggle, parentTag, onImported }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [errorRows, setErrorRows] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef(null);
  const submitRef = useRef(false);
  const parentId = parentTag?.id;
  const schoolId = getSchoolId(parentTag);
  const schoolName = getSchoolName(parentTag);

  useEffect(() => {
    if (!isOpen) return;
    setFile(null);
    setError("");
    setErrorRows([]);
    setResult(null);
    submitRef.current = false;
  }, [isOpen, parentId]);

  const clearFile = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const selectFile = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setError("");
    setErrorRows([]);
    setResult(null);
    if (!nextFile) return clearFile();
    if (!nextFile.name.toLowerCase().endsWith(".xlsx")) {
      clearFile();
      setError("فقط فایل با پسوند .xlsx قابل قبول است.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      clearFile();
      setError("حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.");
      return;
    }
    setFile(nextFile);
  };

  const downloadTemplate = async () => {
    if (!parentId || !schoolId || downloading || submitting) return;
    setDownloading(true);
    setError("");
    try {
      const { blob, headers } = await downloadParentTagChildrenTemplate(parentId, schoolId);
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = getDownloadName(headers, parentId);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      setError(getApiErrorMessage(downloadError));
    } finally {
      setDownloading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitRef.current || submitting) return;
    setError("");
    setErrorRows([]);
    setResult(null);
    if (!file) return setError("ابتدا فایل اکسل را انتخاب کنید.");
    if (!schoolId) return setError("شناسه مجموعه سر‌تگ مشخص نیست.");

    submitRef.current = true;
    setSubmitting(true);
    try {
      const response = await importParentTagChildren(parentId, { file, schoolId });
      setResult({
        totalRows: Number(response?.totalRows) || 0,
        createdCount: Number(response?.createdCount) || 0,
        skippedCount: Number(response?.skippedCount) || 0,
        skippedRows: normalizeRows(response?.skippedRows),
      });
      await onImported?.({ parentTagId: parentId, schoolId });
    } catch (submitError) {
      const rows = getImportValidationRows(submitError);
      setErrorRows(rows);
      if (!rows.length) setError(getApiErrorMessage(submitError));
    } finally {
      submitRef.current = false;
      setSubmitting(false);
    }
  };

  const busy = submitting || downloading;
  return (
    <Modal isOpen={isOpen} toggle={busy ? undefined : toggle} centered size="lg" dir="rtl">
      <ModalHeader toggle={busy ? undefined : toggle}>ایمپورت زیرتگ‌ها</ModalHeader>
      <form onSubmit={submit}>
        <ModalBody>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Badge color="primary" pill>سر‌تگ: {parentTag?.name || parentTag?.title || `#${parentId}`}</Badge>
            <Badge color="info" pill>مجموعه: {schoolName || `#${schoolId || "نامشخص"}`}</Badge>
          </div>
          <Alert color="info">
            فایل باید یک ستون با عنوان دقیق «نام تگ» داشته باشد؛ هر ردیف این ستون یک زیرتگ است.
          </Alert>
          {error && <Alert color="danger">{error}</Alert>}
          <div className="d-flex flex-column flex-sm-row align-items-sm-end gap-2 mb-3">
            <div className="flex-grow-1">
              <Label htmlFor="parent-tag-children-file">فایل اکسل (.xlsx، حداکثر ۱۰ مگابایت)</Label>
              <Input
                innerRef={inputRef}
                id="parent-tag-children-file"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={selectFile}
                disabled={busy}
              />
            </div>
            <Button type="button" color="success" outline onClick={downloadTemplate} disabled={busy || !schoolId}>
              {downloading ? <><Spinner size="sm" className="me-1" />در حال دانلود...</> : "دانلود فایل نمونه"}
            </Button>
          </div>
          {file && (
            <div className="border rounded p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <span><i className="bx bx-file me-1" />{file.name} ({(file.size / 1024 / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 2 })} مگابایت)</span>
              <Button type="button" color="danger" outline size="sm" onClick={clearFile} disabled={busy}>حذف / تعویض فایل</Button>
            </div>
          )}
          {result && (
            <Alert color="success">
              <div className="d-flex flex-wrap gap-4">
                <strong>کل ردیف‌ها: {result.totalRows.toLocaleString("fa-IR")}</strong>
                <strong>ایجادشده: {result.createdCount.toLocaleString("fa-IR")}</strong>
                <strong>ردشده: {result.skippedCount.toLocaleString("fa-IR")}</strong>
              </div>
            </Alert>
          )}
          {(errorRows.length > 0 || result?.skippedRows?.length > 0) && (
            <div className="table-responsive">
              <table className="table table-sm table-bordered align-middle mb-0">
                <thead className="table-light"><tr><th>شماره ردیف</th><th>نام تگ</th><th>علت رد شدن</th></tr></thead>
                <tbody>{(errorRows.length ? errorRows : result.skippedRows).map((row, index) => (
                  <tr key={`${row.rowNumber}-${index}`}><td>{row.rowNumber}</td><td>{row.name}</td><td>{row.reason}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="light" onClick={toggle} disabled={busy}>بستن</Button>
          <Button type="submit" color="primary" disabled={busy || !file || !schoolId}>
            {submitting ? <><Spinner size="sm" className="me-1" />در حال ایمپورت...</> : "ایمپورت زیرتگ‌ها"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default ParentTagChildrenImportModal;
