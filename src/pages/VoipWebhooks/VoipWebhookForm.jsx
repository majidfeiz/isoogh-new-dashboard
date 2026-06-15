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

const EMPTY_FORM = {
  name: "",
  src: "",
  webhook_url: "",
  secret: "",
  is_active: true,
};

const VoipWebhookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  document.title = `${isEdit ? "ویرایش" : "ایجاد"} وب‌هوک VoIP | داشبورد آیسوق`;

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getVoipWebhook(id)
      .then((data) => {
        setForm({
          name: data.name,
          src: data.src,
          webhook_url: data.webhook_url,
          secret: data.secret || "",
          is_active: data.is_active,
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

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "نام وب‌هوک الزامی است";
    if (!form.src.trim()) errs.src = "شماره src الزامی است";
    if (!form.webhook_url.trim()) errs.webhook_url = "آدرس URL الزامی است";
    else if (!/^https?:\/\/.+/.test(form.webhook_url.trim())) {
      errs.webhook_url = "آدرس URL معتبر نیست";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        src: form.src.trim(),
        webhook_url: form.webhook_url.trim(),
        secret: form.secret.trim() || undefined,
        is_active: form.is_active,
      };

      if (isEdit) {
        await updateVoipWebhook(id, payload);
        toast.success("وب‌هوک با موفقیت ویرایش شد");
      } else {
        await createVoipWebhook(payload);
        toast.success("وب‌هوک با موفقیت ایجاد شد");
      }
      navigate("/voip-webhooks");
    } catch {
      toast.error("خطا در ذخیره وب‌هوک");
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
                  </FormGroup>

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
                    <Label>Secret (اختیاری)</Label>
                    <Input
                      name="secret"
                      value={form.secret}
                      onChange={handleChange}
                      placeholder="کلید HMAC برای امضای درخواست"
                      dir="ltr"
                    />
                    <small className="text-muted">
                      در صورت تنظیم، هدر <code>X-Webhook-Signature</code> به درخواست اضافه می‌شود.
                    </small>
                  </FormGroup>

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
                      onClick={() => navigate("/voip-webhooks")}
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
