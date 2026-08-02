import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  createVoipWebhook,
  getVoipWebhook,
  updateVoipWebhook,
} from "../../services/voipWebhookService.jsx";
import { getSchools } from "../../services/schoolService.jsx";

export const AUDIT_ACTION_TYPES = [
  "create", "update", "delete", "restore", "import", "export", "download", "view",
  "login", "logout", "auth", "call", "webhook", "execute", "other",
];

export const AUDIT_MODULES = [
  "users", "schools", "students", "managers", "advisers", "support-forms", "files",
  "chat", "voip", "voip-webhooks", "external-api", "reports", "dynamic-reports", "auth",
];

const EMPTY_FORM = {
  name: "",
  event_type: "call_history",
  src: "",
  school_id: "",
  audit_modules: [],
  audit_action_types: [],
  webhook_url: "",
  secret: "",
  is_active: true,
  replay_from: "",
  max_attempts: 3,
  retry_interval_minutes: 10,
};

const pad = (value) => String(value).padStart(2, "0");

const toDateTimeLocalValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const quickReplayRanges = [
  {
    label: "از یک ماه گذشته",
    getValue: () => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      return toDateTimeLocalValue(date);
    },
  },
  {
    label: "از یک هفته گذشته",
    getValue: () => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return toDateTimeLocalValue(date);
    },
  },
  {
    label: "از امروز",
    getValue: () => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return toDateTimeLocalValue(date);
    },
  },
];

const VoipWebhookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  document.title = `${isEdit ? "ویرایش" : "ایجاد"} وب‌هوک VoIP | داشبورد آیسوق`;

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    getSchools({ page: 1, limit: 100 })
      .then((result) => setSchools(result.items || []))
      .catch(() => setSchools([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getVoipWebhook(id)
      .then((data) => {
        setForm({
          name: data.name,
          event_type: data.event_type || "call_history",
          src: data.src,
          school_id: data.school_id || "",
          audit_modules: data.audit_modules || [],
          audit_action_types: data.audit_action_types || [],
          webhook_url: data.webhook_url,
          secret: "",
          is_active: data.is_active,
          replay_from: toDateTimeLocalValue(data.replay_from),
          max_attempts: data.max_attempts ?? 3,
          retry_interval_minutes: data.retry_interval_minutes ?? 10,
        });
      })
      .catch(() => toast.error("خطا در دریافت اطلاعات وب‌هوک"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleMultiSelect = (e) => {
    const { name, selectedOptions } = e.target;
    setForm((prev) => ({ ...prev, [name]: Array.from(selectedOptions, (option) => option.value) }));
  };

  const handleQuickReplayRange = (getValue) => {
    setForm((prev) => ({ ...prev, replay_from: getValue() }));
    if (errors.replay_from) setErrors((prev) => ({ ...prev, replay_from: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "نام وب‌هوک الزامی است";
    if (form.event_type === "call_history" && !form.src.trim()) errs.src = "شماره src برای وب‌هوک تماس الزامی است";
    if (form.event_type === "audit_log" && !Number(form.school_id)) errs.school_id = "انتخاب مجموعه برای وب‌هوک Audit الزامی است";
    if (!form.webhook_url.trim()) errs.webhook_url = "آدرس URL الزامی است";
    else if (!/^https?:\/\/.+/.test(form.webhook_url.trim())) {
      errs.webhook_url = "آدرس URL معتبر نیست";
    }
    const maxAttempts = Number(form.max_attempts);
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 20) {
      errs.max_attempts = "تعداد تلاش باید عددی بین ۱ تا ۲۰ باشد";
    }
    const retryInterval = Number(form.retry_interval_minutes);
    if (!Number.isInteger(retryInterval) || retryInterval < 1 || retryInterval > 1440) {
      errs.retry_interval_minutes = "فاصله تلاش‌ها باید عددی بین ۱ تا ۱۴۴۰ دقیقه باشد";
    }
    if (form.replay_from) {
      const replayFrom = new Date(form.replay_from);
      if (Number.isNaN(replayFrom.getTime())) {
        errs.replay_from = "تاریخ شروع ارسال معتبر نیست";
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setSaving(true);
    setSubmitError("");
    try {
      const payload = {
        name: form.name.trim(),
        event_type: form.event_type,
        src: form.event_type === "call_history" ? form.src.trim() : undefined,
        school_id: form.event_type === "audit_log" ? Number(form.school_id) : undefined,
        audit_modules: form.event_type === "audit_log" ? form.audit_modules : undefined,
        audit_action_types: form.event_type === "audit_log" ? form.audit_action_types : undefined,
        webhook_url: form.webhook_url.trim(),
        secret: form.secret.trim() || undefined,
        is_active: form.is_active,
        replay_from: form.replay_from ? new Date(form.replay_from).toISOString() : undefined,
        max_attempts: Number(form.max_attempts),
        retry_interval_minutes: Number(form.retry_interval_minutes),
      };

      if (isEdit) {
        await updateVoipWebhook(id, payload);
        toast.success("وب‌هوک با موفقیت ویرایش شد");
      } else {
        await createVoipWebhook(payload);
        toast.success("وب‌هوک با موفقیت ایجاد شد");
      }
      navigate(-1);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 400) setSubmitError("اطلاعات فرم معتبر نیست؛ فیلدهای الزامی و مقادیر واردشده را بررسی کنید.");
      else if (status === 403) setSubmitError("اجازه ثبت وب‌هوک برای این مجموعه را ندارید.");
      else if (status === 429) setSubmitError("تعداد درخواست‌ها بیش از حد مجاز است؛ کمی بعد دوباره تلاش کنید.");
      else setSubmitError("ذخیره وب‌هوک انجام نشد. دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
          <Spinner color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs
          title="وب‌هوک‌های VoIP"
          breadcrumbItem={isEdit ? "ویرایش وب‌هوک" : "وب‌هوک جدید"}
        />

        <Row>
          <Col lg={7} xl={6}>
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">
                  {isEdit ? "ویرایش وب‌هوک" : "ایجاد وب‌هوک جدید"}
                </h4>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  {submitError && <div className="alert alert-danger" role="alert">{submitError}</div>}
                  <FormGroup>
                    <Label>نام <span className="text-danger">*</span></Label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      invalid={!!errors.name}
                      placeholder="مثلاً: وب‌هوک سازمان مرکزی"
                    />
                    <FormFeedback>{errors.name}</FormFeedback>
                  </FormGroup>

                  <FormGroup>
                    <Label>نوع رویداد <span className="text-danger">*</span></Label>
                    <Input name="event_type" type="select" value={form.event_type} onChange={handleChange}>
                      <option value="call_history">تماس</option>
                      <option value="audit_log">تغییرات (Audit Log)</option>
                    </Input>
                  </FormGroup>

                  {form.event_type === "call_history" && <FormGroup>
                    <Label>شماره مبدأ (src) <span className="text-danger">*</span></Label>
                    <Input
                      name="src"
                      value={form.src}
                      onChange={handleChange}
                      invalid={!!errors.src}
                      placeholder="مثلاً: 09121234567"
                      dir="ltr"
                    />
                    <FormFeedback>{errors.src}</FormFeedback>
                    <small className="text-muted">
                      وب‌هوک فقط برای تماس‌هایی که این شماره را به عنوان src دارند ارسال می‌شود.
                    </small>
                  </FormGroup>}

                  {form.event_type === "audit_log" && <>
                    <FormGroup>
                      <Label>مجموعه <span className="text-danger">*</span></Label>
                      <Input name="school_id" type="select" value={form.school_id} onChange={handleChange} invalid={!!errors.school_id}>
                        <option value="">انتخاب مجموعه</option>
                        {schools.map((school) => <option key={school.id} value={school.id}>{school.name || school.title || `مجموعه ${school.id}`}</option>)}
                      </Input>
                      <FormFeedback>{errors.school_id}</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                      <Label>ماژول‌های Audit (اختیاری)</Label>
                      <Input aria-label="ماژول‌های Audit" name="audit_modules" type="select" multiple value={form.audit_modules} onChange={handleMultiSelect} style={{ minHeight: 140 }}>
                        {AUDIT_MODULES.map((module) => <option key={module} value={module}>{module}</option>)}
                      </Input>
                      <small className="text-muted">برای انتخاب چند مورد از Ctrl یا Command استفاده کنید؛ خالی یعنی همه ماژول‌ها.</small>
                    </FormGroup>
                    <FormGroup>
                      <Label>نوع عملیات Audit (اختیاری)</Label>
                      <Input aria-label="نوع عملیات Audit" name="audit_action_types" type="select" multiple value={form.audit_action_types} onChange={handleMultiSelect} style={{ minHeight: 160 }}>
                        {AUDIT_ACTION_TYPES.map((action) => <option key={action} value={action}>{action}</option>)}
                      </Input>
                      <small className="text-muted">خالی یعنی همه نوع عملیات.</small>
                    </FormGroup>
                  </>}

                  <FormGroup>
                    <Label>آدرس URL <span className="text-danger">*</span></Label>
                    <Input
                      name="webhook_url"
                      value={form.webhook_url}
                      onChange={handleChange}
                      invalid={!!errors.webhook_url}
                      placeholder="https://org.example.com/api/call-webhook"
                      dir="ltr"
                      type="url"
                    />
                    <FormFeedback>{errors.webhook_url}</FormFeedback>
                  </FormGroup>

                  <FormGroup>
                    <Label>Secret {isEdit ? "جدید (اختیاری)" : "(اختیاری)"}</Label>
                    <Input
                      name="secret"
                      value={form.secret}
                      onChange={handleChange}
                      placeholder={isEdit ? "برای حفظ secret فعلی خالی بگذارید" : "کلید HMAC برای امضای درخواست"}
                      dir="ltr"
                    />
                    <small className="text-muted">
                      در صورت تنظیم، هدر <code>X-Webhook-Signature</code> به درخواست اضافه می‌شود.
                    </small>
                  </FormGroup>

                  <FormGroup>
                    <Label>شروع بازپخش رویدادها</Label>
                    <Row className="g-2 align-items-start">
                      <Col md={7}>
                        <Input
                          type="datetime-local"
                          name="replay_from"
                          value={form.replay_from}
                          onChange={handleChange}
                          invalid={!!errors.replay_from}
                        />
                        <FormFeedback>{errors.replay_from}</FormFeedback>
                      </Col>
                      <Col md={5}>
                        <div className="d-flex flex-wrap gap-1">
                          {quickReplayRanges.map((range) => (
                            <Button
                              key={range.label}
                              color="light"
                              size="sm"
                              type="button"
                              onClick={() => handleQuickReplayRange(range.getValue)}
                            >
                              {range.label}
                            </Button>
                          ))}
                        </div>
                      </Col>
                    </Row>
                    {form.replay_from && <div className="alert alert-warning py-2 mt-2 mb-0" role="alert">انتخاب تاریخ گذشته ممکن است تعداد زیادی job برای ارسال ایجاد کند.</div>}
                  </FormGroup>

                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label>تعداد تلاش برای هر payload</Label>
                        <Input
                          type="number"
                          name="max_attempts"
                          value={form.max_attempts}
                          onChange={handleChange}
                          invalid={!!errors.max_attempts}
                          min={1}
                          max={20}
                          step={1}
                        />
                        <FormFeedback>{errors.max_attempts}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>فاصله تلاش‌ها (دقیقه)</Label>
                        <Input
                          type="number"
                          name="retry_interval_minutes"
                          value={form.retry_interval_minutes}
                          onChange={handleChange}
                          invalid={!!errors.retry_interval_minutes}
                          min={1}
                          max={1440}
                          step={1}
                        />
                        <FormFeedback>{errors.retry_interval_minutes}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>

                  <FormGroup check className="mb-4">
                    <Input
                      type="checkbox"
                      name="is_active"
                      id="is_active_wh"
                      checked={form.is_active}
                      onChange={handleChange}
                    />
                    <Label check for="is_active_wh">فعال</Label>
                  </FormGroup>

                  <div className="d-flex gap-2">
                    <Button color="primary" type="submit" disabled={saving}>
                      {saving ? <Spinner size="sm" /> : (isEdit ? "ذخیره تغییرات" : "ایجاد")}
                    </Button>
                    <Button
                      color="secondary"
                      type="button"
                      onClick={() => navigate(-1)}
                    >
                      انصراف
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default VoipWebhookForm;
