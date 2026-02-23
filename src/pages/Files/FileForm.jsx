import React, { useEffect, useState } from "react";
import {
  Alert,
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
    type: "",
    size: "",
    time: "",
    description: "",
  });
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
          type: data?.type || "",
          size: data?.size || "",
          time: data?.time || "",
          description: data?.description || "",
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
      type: form.type || undefined,
      size: form.size || undefined,
      time: form.time || undefined,
      description: form.description || undefined,
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

      setTimeout(() => {
        navigate("/files");
      }, 700);
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
    errors[field] ? <FormFeedback className="d-block">{errors[field][0]}</FormFeedback> : null;

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="فایل‌ها" breadcrumbItem={isEdit ? "ویرایش فایل" : "ایجاد فایل"} />

        <Row>
          <Col lg="10">
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">{isEdit ? "ویرایش فایل" : "ایجاد فایل جدید"}</h4>
              </CardHeader>

              <CardBody>
                {alert && <Alert color={alert.type}>{alert.message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md="4">
                      <FormGroup>
                        <Label for="title">عنوان</Label>
                        <Input id="title" name="title" value={form.title} onChange={handleChange} invalid={!!errors.title} />
                        {renderError("title")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="name">نام فایل</Label>
                        <Input id="name" name="name" value={form.name} onChange={handleChange} invalid={!!errors.name} />
                        {renderError("name")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="code">کد</Label>
                        <Input id="code" name="code" value={form.code} onChange={handleChange} invalid={!!errors.code} />
                        {renderError("code")}
                      </FormGroup>
                    </Col>

                    <Col md="12">
                      <FormGroup>
                        <Label for="url">لینک فایل</Label>
                        <Input id="url" name="url" value={form.url} onChange={handleChange} invalid={!!errors.url} required />
                        {renderError("url")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="type">نوع</Label>
                        <Input id="type" name="type" value={form.type} onChange={handleChange} invalid={!!errors.type} />
                        {renderError("type")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="size">حجم</Label>
                        <Input id="size" name="size" value={form.size} onChange={handleChange} invalid={!!errors.size} />
                        {renderError("size")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="time">مدت</Label>
                        <Input id="time" name="time" value={form.time} onChange={handleChange} invalid={!!errors.time} />
                        {renderError("time")}
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
                    <Button type="button" color="secondary" onClick={() => navigate("/files")}>انصراف</Button>
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
