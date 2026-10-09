import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, FormFeedback, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { createTicket, getTicketTaxonomy, uploadTicketAttachment } from "../../services/ticketService.jsx";
import useTicketSchools from "./useTicketSchools.js";
import { errorMessage, validateTicketFile } from "./ticketUtils.js";

export default function TicketCreate() {
  document.title = "ثبت تیکت | داشبورد آیسوق";
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { schools, loading: schoolsLoading, validSavedSchoolId, rememberSchool } = useTicketSchools();
  const [form, setForm] = useState({ schoolId: "", categoryId: "", title: "", description: "" });
  const [categories, setCategories] = useState([]);
  const [categoryLoad, setCategoryLoad] = useState({ loading: true, error: "" });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!schoolsLoading && !form.schoolId) setForm((current) => ({ ...current, schoolId: validSavedSchoolId() || (schools.length === 1 ? String(schools[0].id) : "") }));
  }, [schoolsLoading, schools, form.schoolId, validSavedSchoolId]);

  useEffect(() => {
    let active = true;
    getTicketTaxonomy("categories")
      .then((items) => { if (active) setCategories(items); })
      .catch(() => { if (active) setCategoryLoad({ loading: false, error: "دریافت دسته‌بندی‌ها ناموفق بود. دوباره تلاش کنید." }); })
      .finally(() => { if (active) setCategoryLoad((current) => ({ ...current, loading: false })); });
    return () => { active = false; };
  }, []);

  const validCategoryIds = useMemo(() => new Set(categories.map((item) => String(item.id))), [categories]);
  const canSubmit = !saving && !schoolsLoading && !categoryLoad.loading && !categoryLoad.error && validCategoryIds.has(String(form.categoryId));
  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "", form: "" }));
  };
  const chooseFile = (event) => {
    const selected = event.target.files?.[0] || null;
    if (!validateTicketFile(selected)) {
      setErrors((current) => ({ ...current, file: "حداکثر حجم مجاز هر فایل ۱۰ مگابایت است" }));
      event.target.value = "";
      return;
    }
    setFile(selected);
    setErrors((current) => ({ ...current, file: "" }));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors = {};
    if (!form.schoolId) nextErrors.schoolId = "انتخاب مجموعه الزامی است";
    if (!validCategoryIds.has(String(form.categoryId))) nextErrors.categoryId = "انتخاب دسته‌بندی معتبر الزامی است";
    if (!form.title.trim()) nextErrors.title = "عنوان تیکت الزامی است";
    if (!form.description.trim()) nextErrors.description = "شرح درخواست الزامی است";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setSaving(true);
    try {
      const ticket = await createTicket({ schoolId: form.schoolId, categoryId: form.categoryId, title: form.title.trim(), description: form.description.trim() });
      rememberSchool(form.schoolId);
      const ticketId = ticket?.id || ticket?.ticket?.id;
      if (file && hasPermission("tickets.attachments.upload")) {
        try { await uploadTicketAttachment(ticketId, form.schoolId, file); toast.success("تیکت با موفقیت ثبت شد"); }
        catch { toast.warning("تیکت ایجاد شد، اما بارگذاری فایل ناموفق بود. در صفحه تیکت دوباره تلاش کنید."); }
      } else toast.success("تیکت با موفقیت ثبت شد");
      navigate(`/tickets/${ticketId}?schoolId=${form.schoolId}`, { replace: true });
    } catch (error) {
      setErrors((current) => ({ ...current, form: errorMessage(error, "ثبت تیکت ناموفق بود") }));
    } finally { setSaving(false); }
  };

  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="تیکت‌ها" breadcrumbItem="ثبت تیکت" /><Row className="justify-content-center"><Col xl="8"><Card><CardHeader><h4 className="card-title mb-1">چطور می‌توانیم کمک کنیم؟</h4><p className="text-muted mb-0">درخواست خود را دقیق بنویسید تا سریع‌تر بررسی شود.</p></CardHeader><CardBody><Form onSubmit={submit} noValidate>
    {errors.form && <Alert color="danger" aria-live="assertive">{errors.form}</Alert>}
    <FormGroup><Label htmlFor="create-ticket-school">مجموعه <span className="text-danger">*</span></Label><Input id="create-ticket-school" type="select" value={form.schoolId} disabled={schoolsLoading} invalid={Boolean(errors.schoolId)} onChange={(event) => set("schoolId", event.target.value)}><option value="">انتخاب مجموعه</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</Input><FormFeedback>{errors.schoolId}</FormFeedback></FormGroup>
    <FormGroup><Label htmlFor="create-ticket-category">دسته‌بندی <span className="text-danger">*</span></Label>{categoryLoad.loading ? <div className="form-control text-muted"><Spinner size="sm" /> <span className="me-2">در حال دریافت...</span></div> : categoryLoad.error ? <Alert color="danger" className="mb-0" aria-live="assertive">{categoryLoad.error}</Alert> : <Input id="create-ticket-category" type="select" value={form.categoryId} disabled={!categories.length} invalid={Boolean(errors.categoryId)} onChange={(event) => set("categoryId", event.target.value)}><option value="">{categories.length ? "انتخاب دسته‌بندی" : "دسته‌بندی فعالی وجود ندارد"}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Input>}<FormFeedback className={errors.categoryId ? "d-block" : ""}>{errors.categoryId}</FormFeedback></FormGroup>
    <FormGroup><Label htmlFor="create-ticket-title">عنوان <span className="text-danger">*</span></Label><Input id="create-ticket-title" value={form.title} maxLength={150} invalid={Boolean(errors.title)} onChange={(event) => set("title", event.target.value)} /><div className="d-flex justify-content-between"><FormFeedback>{errors.title}</FormFeedback><small className="text-muted me-auto">{form.title.length.toLocaleString("fa-IR")}/۱۵۰</small></div></FormGroup>
    <FormGroup><Label htmlFor="create-ticket-description">شرح درخواست <span className="text-danger">*</span></Label><Input id="create-ticket-description" type="textarea" rows="8" value={form.description} maxLength={3000} invalid={Boolean(errors.description)} onChange={(event) => set("description", event.target.value)} /><div className="d-flex justify-content-between"><FormFeedback>{errors.description}</FormFeedback><small className="text-muted me-auto">{form.description.length.toLocaleString("fa-IR")}/۳۰۰۰</small></div></FormGroup>
    {hasPermission("tickets.attachments.upload") && <FormGroup><Label htmlFor="create-ticket-file">فایل پیوست (اختیاری)</Label><Input id="create-ticket-file" type="file" invalid={Boolean(errors.file)} onChange={chooseFile} /><FormFeedback>{errors.file}</FormFeedback><small className="text-muted">حداکثر حجم فایل ۱۰ مگابایت است.</small></FormGroup>}
    <div className="d-flex gap-2 justify-content-end"><Button tag={Link} to="/tickets" color="light">انصراف</Button><Button type="submit" color="primary" disabled={!canSubmit}>{saving ? "در حال ثبت..." : "ثبت و ارسال تیکت"}</Button></div>
  </Form></CardBody></Card></Col></Row></div></div>;
}
