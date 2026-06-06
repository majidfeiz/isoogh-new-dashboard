import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import { createFile, getFile, updateFile } from "../../services/fileService.jsx";

const formatSize = (raw) => {
  const bytes = Number(raw);
  if (!raw || !Number.isFinite(bytes) || bytes <= 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const resolveFileUrl = (file) => {
  if (file?.arvan_status === 1 && file?.arvan_url) return file.arvan_url;
  return file?.url || "";
};

const FileForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  document.title = `${isEdit ? "ویرایش فایل" : "ایجاد فایل"} | داشبورد آیسوق`;

  const [form, setForm] = useState({
    code: "",
    name: "",
    title: "",
    url: "",
    arvan_url: "",
    type: "",
    size: "",
    time: "",
    description: "",
    fileable_type: "",
    fileable_id: "",
    status: "1",
  });
  const [readonlyMeta, setReadonlyMeta] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);
      try {
        const data = await getFile(id);
        setForm({
          code: data?.code || "",
          name: data?.name || "",
          title: data?.title || "",
          url: data?.url || "",
          arvan_url: data?.arvan_url || "",
          type: data?.type || "",
          size: data?.size || "",
          time: data?.time || "",
          description: data?.description || "",
          fileable_type: data?.fileable_type || "",
          fileable_id: data?.fileable_id != null ? String(data.fileable_id) : "",
          status: data?.status != null ? String(data.status) : "1",
        });
        setReadonlyMeta({
          arvan_status: data?.arvan_status,
          s3_status: data?.s3_status,
          used_count: data?.used_count,
          file_checked: data?.file_checked,
          ip: data?.ip,
          created_at: data?.created_at,
          updated_at: data?.updated_at,
          effectiveUrl: resolveFileUrl(data),
          formattedSize: formatSize(data?.size),
        });
      } catch (e) {
        console.error("خطا در دریافت فایل", e);
        setAlert({ type: "danger", message: "خطا در دریافت اطلاعات فایل" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);

    if (!form.url.trim()) {
      setErrors({ url: ["لینک فایل الزامی است"] });
      return;
    }

    const payload = {
      code: form.code || undefined,
      name: form.name || undefined,
      title: form.title || undefined,
      url: form.url,
      arvan_url: form.arvan_url || undefined,
      type: form.type || undefined,
      size: form.size || undefined,
      time: form.time || undefined,
      description: form.description || undefined,
      fileable_type: form.fileable_type || undefined,
      fileable_id: form.fileable_id ? Number(form.fileable_id) : undefined,
      status: form.status !== "" ? Number(form.status) : undefined,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await updateFile(id, payload);
        setAlert({ type: "success", message: "فایل با موفقیت ویرایش شد." });
      } else {
        await createFile(payload);
        setAlert({ type: "success", message: "فایل جدید با موفقیت ایجاد شد." });
      }
      setTimeout(() => navigate("/files"), 700);
    } catch (e) {
      console.error("خطا در ذخیره فایل", e);
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors || {});
      } else {
        setAlert({ type: "danger", message: "خطایی رخ داد. لطفاً دوباره تلاش کنید." });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) =>
    errors[field] ? (
      <FormFeedback className="d-block">{errors[field][0]}</FormFeedback>
    ) : null;

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="فایل‌ها" breadcrumbItem={isEdit ? "ویرایش فایل" : "ایجاد فایل"} />

        <Row>
          <Col lg="10">
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">
                  {isEdit ? "ویرایش فایل" : "ایجاد فایل جدید"}
                </h4>
              </CardHeader>

              <CardBody>
                {alert && <Alert color={alert.type}>{alert.message}</Alert>}

                {/* اطلاعات فقط‌خواندنی در حالت ویرایش */}
                {isEdit && readonlyMeta && (
                  <div className="mb-4 p-3 bg-light rounded">
                    <Row className="g-2 align-items-center">
                      <Col md="auto">
                        <span className="text-muted small">وضعیت Arvan:</span>{" "}
                        {readonlyMeta.arvan_status === 1
                          ? <Badge color="info" pill>آپلود شده</Badge>
                          : <Badge color="secondary" pill>ندارد</Badge>}
                      </Col>
                      <Col md="auto">
                        <span className="text-muted small">تأیید فایل:</span>{" "}
                        {readonlyMeta.file_checked === 1
                          ? <Badge color="success" pill>تأیید شده</Badge>
                          : <Badge color="warning" pill>تأیید نشده</Badge>}
                      </Col>
                      <Col md="auto">
                        <span className="text-muted small">تعداد استفاده:</span>{" "}
                        <strong>{readonlyMeta.used_count ?? "-"}</strong>
                      </Col>
                      <Col md="auto">
                        <span className="text-muted small">حجم:</span>{" "}
                        <strong>{readonlyMeta.formattedSize}</strong>
                      </Col>
                      {readonlyMeta.effectiveUrl && (
                        <Col md="auto">
                          <a
                            href={readonlyMeta.effectiveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bx bx-link me-1" />
                            باز کردن فایل
                          </a>
                        </Col>
                      )}
                    </Row>
                  </div>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md="4">
                      <FormGroup>
                        <Label for="title">عنوان</Label>
                        <Input
                          id="title"
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          invalid={!!errors.title}
                        />
                        {renderError("title")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="name">نام فایل</Label>
                        <Input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          invalid={!!errors.name}
                        />
                        {renderError("name")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="code">کد</Label>
                        <Input
                          id="code"
                          name="code"
                          value={form.code}
                          onChange={handleChange}
                          invalid={!!errors.code}
                        />
                        {renderError("code")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="url">لینک اصلی فایل <span className="text-danger">*</span></Label>
                        <Input
                          id="url"
                          name="url"
                          value={form.url}
                          onChange={handleChange}
                          invalid={!!errors.url}
                          required
                        />
                        {renderError("url")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="arvan_url">لینک Arvan</Label>
                        <Input
                          id="arvan_url"
                          name="arvan_url"
                          value={form.arvan_url}
                          onChange={handleChange}
                          invalid={!!errors.arvan_url}
                          placeholder="https://arvan.example.com/..."
                        />
                        {renderError("arvan_url")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="type">نوع (MIME)</Label>
                        <Input
                          id="type"
                          name="type"
                          value={form.type}
                          onChange={handleChange}
                          invalid={!!errors.type}
                          placeholder="مثلاً audio/mpeg"
                        />
                        {renderError("type")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="size">حجم (بایت)</Label>
                        <Input
                          id="size"
                          name="size"
                          value={form.size}
                          onChange={handleChange}
                          invalid={!!errors.size}
                          placeholder="مثلاً 204800"
                        />
                        {renderError("size")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="time">مدت (HH:MM:SS)</Label>
                        <Input
                          id="time"
                          name="time"
                          value={form.time}
                          onChange={handleChange}
                          invalid={!!errors.time}
                          placeholder="مثلاً 00:03:25"
                        />
                        {renderError("time")}
                      </FormGroup>
                    </Col>

                    <Col md="5">
                      <FormGroup>
                        <Label for="fileable_type">نوع owner (fileable_type)</Label>
                        <Input
                          id="fileable_type"
                          name="fileable_type"
                          value={form.fileable_type}
                          onChange={handleChange}
                          invalid={!!errors.fileable_type}
                          placeholder="مثلاً App\Models\VoipCallHistory"
                        />
                        {renderError("fileable_type")}
                      </FormGroup>
                    </Col>

                    <Col md="3">
                      <FormGroup>
                        <Label for="fileable_id">ID owner (fileable_id)</Label>
                        <Input
                          id="fileable_id"
                          name="fileable_id"
                          type="number"
                          value={form.fileable_id}
                          onChange={handleChange}
                          invalid={!!errors.fileable_id}
                          placeholder="مثلاً 42"
                        />
                        {renderError("fileable_id")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="status">وضعیت</Label>
                        <Input
                          id="status"
                          name="status"
                          type="select"
                          value={form.status}
                          onChange={handleChange}
                          invalid={!!errors.status}
                        >
                          <option value="1">فعال</option>
                          <option value="0">غیرفعال</option>
                        </Input>
                        {renderError("status")}
                      </FormGroup>
                    </Col>

                    <Col md="12">
                      <FormGroup>
                        <Label for="description">توضیحات</Label>
                        <Input
                          id="description"
                          name="description"
                          type="textarea"
                          rows="3"
                          value={form.description}
                          onChange={handleChange}
                          invalid={!!errors.description}
                        />
                        {renderError("description")}
                      </FormGroup>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mt-3">
                    <Button type="submit" color="primary" className="w-md" disabled={loading}>
                      {loading ? "در حال ذخیره..." : isEdit ? "ویرایش فایل" : "ثبت فایل"}
                    </Button>
                    <Button type="button" color="secondary" onClick={() => navigate("/files")}>
                      انصراف
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FileForm;
