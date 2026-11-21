import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Col, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Nav, NavItem, NavLink, Progress, Row, Spinner, TabContent, TabPane } from "reactstrap";
import { importAdvisers, registerAdviser } from "../../services/adviserService.jsx";
import { adviserFieldErrors, adviserImportSampleRows, buildAdviserImportFormData } from "./adviserCreateImportUtils.js";

const emptyForm = { name: "", phone: "", username: "", email: "", password: "", grades: [] };
const MAX_FILE_SIZE = 15 * 1024 * 1024;

const AdviserCreateImportModal = ({ isOpen, toggle, mode = "register", schoolId, schoolName, grades = [], onSuccess }) => {
  const [activeTab, setActiveTab] = useState(mode);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [defaultPassword, setDefaultPassword] = useState("");
  const [importError, setImportError] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const inputRef = useRef(null);

  const reset = () => {
    setForm(emptyForm); setErrors({}); setFile(null); setDefaultPassword("");
    setImportError(""); setImportResult(null); setUploadProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  useEffect(() => { if (isOpen) setActiveTab(mode); }, [isOpen, mode]);
  useEffect(() => { reset(); }, [schoolId]); // eslint-disable-line react-hooks/exhaustive-deps

  const setValue = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, general: undefined }));
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!schoolId) nextErrors.general = "ابتدا یک مجموعه مشخص انتخاب کنید.";
    if (!form.name.trim()) nextErrors.name = "نام و نام خانوادگی الزامی است.";
    if (!form.phone.trim()) nextErrors.phone = "شماره موبایل الزامی است.";
    if (form.password && form.password.length < 6) nextErrors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد.";
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    setSubmitting(true); setErrors({});
    try {
      await registerAdviser({
        schoolId: Number(schoolId), name: form.name.trim(), phone: form.phone.trim(),
        username: form.username.trim() || undefined, email: form.email.trim() || undefined,
        password: form.password || undefined, grades: form.grades.map(Number),
      });
      reset();
      await onSuccess?.();
      toggle();
    } catch (error) {
      setErrors(adviserFieldErrors(error));
    } finally { setSubmitting(false); }
  };

  const selectFile = (selected) => {
    if (!selected) return;
    if (!/\.xlsx$/i.test(selected.name)) return setImportError("فقط فایل xlsx قابل قبول است.");
    if (selected.size > MAX_FILE_SIZE) return setImportError("حجم فایل نباید بیشتر از ۱۵ مگابایت باشد.");
    setFile(selected); setImportError(""); setImportResult(null);
  };

  const downloadSample = async () => {
    const XLSX = await import("xlsx");
    const rows = adviserImportSampleRows();
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!cols"] = rows[0].map((header) => ({ wch: Math.max(16, header.length + 2) }));
    const phoneCell = sheet["B2"];
    if (phoneCell) { phoneCell.t = "s"; phoneCell.z = "@"; }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Advisers");
    XLSX.writeFile(workbook, "advisers-import-sample.xlsx");
  };

  const upload = async () => {
    if (!schoolId) return setImportError("ابتدا یک مجموعه مشخص انتخاب کنید.");
    if (!file) return setImportError("فایل Excel را انتخاب کنید.");
    if (defaultPassword && defaultPassword.length < 6) return setImportError("رمز عبور پیش‌فرض باید حداقل ۶ کاراکتر باشد.");
    setSubmitting(true); setImportError(""); setImportResult(null); setUploadProgress(0);
    try {
      const result = await importAdvisers(buildAdviserImportFormData({ file, schoolId, defaultPassword }), {
        onUploadProgress: ({ loaded, total }) => setUploadProgress(total ? Math.min(99, Math.round((loaded / total) * 100)) : null),
      });
      setUploadProgress(100); setImportResult(result || {});
      await onSuccess?.();
    } catch (error) {
      const parsed = adviserFieldErrors(error);
      setImportError(parsed.general || parsed.password || "ورود گروهی مشاوران ناموفق بود.");
    } finally { setSubmitting(false); }
  };

  const close = () => { if (!submitting) { reset(); toggle(); } };
  const counts = [
    ["کل ردیف‌ها", "totalRows"], ["موفق", "processedRows"], ["خطادار", "failedRows"],
    ["کاربر جدید", "createdUsers"], ["مشاور جدید", "createdAdvisers"], ["اتصال جدید مجموعه", "linkedToSchool"],
  ];

  return <Modal isOpen={isOpen} toggle={close} size="lg" centered scrollable>
    <ModalHeader toggle={close}>ثبت مشاور در {schoolName || "مجموعه انتخاب‌شده"}</ModalHeader>
    <ModalBody>
      {!schoolId && <Alert color="warning">برای ثبت مشاور، ابتدا از فیلتر صفحه یک مجموعه مشخص انتخاب کنید.</Alert>}
      <Nav tabs className="mb-4"><NavItem><NavLink active={activeTab === "register"} onClick={() => setActiveTab("register")} role="button">افزودن مشاور</NavLink></NavItem><NavItem><NavLink active={activeTab === "import"} onClick={() => setActiveTab("import")} role="button">ورود گروهی مشاوران</NavLink></NavItem></Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="register">
          {errors.general && <Alert color="danger">{errors.general}</Alert>}
          <Form id="adviser-register-form" onSubmit={submitRegister}>
            <Row className="g-3">
              <Col md="6"><FormGroup><Label for="adviser-name">نام و نام خانوادگی *</Label><Input id="adviser-name" value={form.name} onChange={(e) => setValue("name", e.target.value)} invalid={Boolean(errors.name)} /><div className="invalid-feedback">{errors.name}</div></FormGroup></Col>
              <Col md="6"><FormGroup><Label for="adviser-phone">شماره موبایل *</Label><Input id="adviser-phone" type="text" inputMode="tel" dir="ltr" value={form.phone} onChange={(e) => setValue("phone", e.target.value)} invalid={Boolean(errors.phone)} /><div className="invalid-feedback">{errors.phone}</div></FormGroup></Col>
              <Col md="6"><FormGroup><Label for="adviser-username">نام کاربری</Label><Input id="adviser-username" value={form.username} onChange={(e) => setValue("username", e.target.value)} invalid={Boolean(errors.username)} /><div className="invalid-feedback">{errors.username}</div></FormGroup></Col>
              <Col md="6"><FormGroup><Label for="adviser-email">ایمیل</Label><Input id="adviser-email" type="email" value={form.email} onChange={(e) => setValue("email", e.target.value)} invalid={Boolean(errors.email)} /><div className="invalid-feedback">{errors.email}</div></FormGroup></Col>
              <Col md="6"><FormGroup><Label for="adviser-password">رمز عبور</Label><Input id="adviser-password" type="password" value={form.password} onChange={(e) => setValue("password", e.target.value)} invalid={Boolean(errors.password)} autoComplete="new-password" /><div className="invalid-feedback">{errors.password}</div><small className="text-muted">برای شماره‌ای که هنوز حساب کاربری ندارد، رمز عبور لازم است.</small></FormGroup></Col>
              <Col md="6"><FormGroup><Label for="adviser-grades">پایه‌ها (اختیاری)</Label><Input id="adviser-grades" type="select" multiple value={form.grades} onChange={(e) => setValue("grades", Array.from(e.target.selectedOptions, (option) => option.value))}>{grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}</Input><div className="invalid-feedback d-block">{errors.grades}</div></FormGroup></Col>
            </Row>
          </Form>
        </TabPane>
        <TabPane tabId="import">
          {importError && <Alert color="danger">{importError}</Alert>}
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3"><div><Label for="adviser-import-file" className="fw-bold mb-0">فایل Excel مشاوران</Label><div className="small text-muted">Headerها را تغییر ندهید؛ مجموعه از انتخاب صفحه ارسال می‌شود.</div></div><Button color="secondary" outline size="sm" onClick={downloadSample}>دانلود فایل نمونه</Button></div>
          <div className="border rounded p-4 text-center mb-3" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); selectFile(e.dataTransfer.files?.[0]); }}>
            <Input id="adviser-import-file" innerRef={inputRef} type="file" accept=".xlsx" onChange={(e) => selectFile(e.target.files?.[0])} />
            <div className="small text-muted mt-2">فایل را انتخاب کنید یا داخل این بخش رها کنید. حداکثر ۱۵ مگابایت.</div>
            {file && <div className="mt-2 fw-semibold">{file.name}</div>}
          </div>
          <FormGroup><Label for="adviser-default-password">رمز عبور پیش‌فرض</Label><Input id="adviser-default-password" type="password" autoComplete="new-password" value={defaultPassword} onChange={(e) => setDefaultPassword(e.target.value)} placeholder="اختیاری، حداقل ۶ کاراکتر" /></FormGroup>
          {uploadProgress !== null && <Progress animated={uploadProgress < 100} value={uploadProgress} className="mb-3">{uploadProgress}%</Progress>}
          {importResult && <Alert color={Number(importResult.failedRows) > 0 ? "warning" : "success"}><div className="d-flex flex-wrap gap-4">{counts.map(([label, key]) => <div key={key}><small className="d-block text-muted">{label}</small><strong>{Number(importResult[key] ?? 0).toLocaleString("fa-IR")}</strong></div>)}</div>{importResult.errorMessage && <div className="mt-3">{importResult.errorMessage}</div>}{importResult.logId != null && <div className="mt-3"><Link to={`/import-logs/${importResult.logId}`}>مشاهده جزئیات خطاها (لاگ {importResult.logId})</Link></div>}</Alert>}
        </TabPane>
      </TabContent>
    </ModalBody>
    <ModalFooter>{activeTab === "register" ? <Button type="submit" form="adviser-register-form" color="primary" disabled={!schoolId || submitting}>{submitting && <Spinner size="sm" className="me-2" />}ثبت مشاور</Button> : <Button color="primary" onClick={upload} disabled={!schoolId || !file || submitting}>{submitting && <Spinner size="sm" className="me-2" />}آپلود و پردازش</Button>}<Button color="light" onClick={close} disabled={submitting}>بستن</Button></ModalFooter>
  </Modal>;
};

export default AdviserCreateImportModal;
