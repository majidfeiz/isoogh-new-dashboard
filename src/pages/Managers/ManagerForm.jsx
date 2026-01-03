// src/pages/Managers/ManagerForm.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Container,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  FormFeedback,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  createManager,
  getManager,
  updateManager,
} from "../../services/managerService.jsx";

const ManagerForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  document.title = (isEdit ? "ویرایش مدیر" : "ایجاد مدیر") + " | داشبورد آیسوق";

  const [form, setForm] = useState({
    code: "",
    user_id: "",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);
      try {
        const data = await getManager(id);
        const manager = data?.data || data;

        setForm({
          code: manager?.code || "",
          user_id:
            manager?.user_id ??
            manager?.userId ??
            manager?.user?.id ??
            "",
        });
      } catch (e) {
        console.error("خطا در دریافت مدیر", e);
        setAlert({
          type: "danger",
          message: "خطا در دریافت اطلاعات مدیر",
        });
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

    const nextErrors = {};
    if (!form.code.trim()) {
      nextErrors.code = ["کد مدیر الزامی است"];
    }

    const parsedUserId =
      form.user_id && !Number.isNaN(Number(form.user_id))
        ? Number(form.user_id)
        : null;

    if (!parsedUserId) {
      nextErrors.user_id = ["شناسه کاربر الزامی است"];
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      code: form.code.trim(),
      user_id: parsedUserId,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await updateManager(id, payload);
        setAlert({
          type: "success",
          message: "مدیر با موفقیت ویرایش شد.",
        });
      } else {
        await createManager(payload);
        setAlert({
          type: "success",
          message: "مدیر جدید با موفقیت ایجاد شد.",
        });
      }

      setTimeout(() => {
        navigate("/managers");
      }, 700);
    } catch (e) {
      console.error("خطا در ذخیره مدیر", e);
      if (e.response && e.response.status === 422) {
        setErrors(e.response.data.errors || {});
      } else {
        setAlert({
          type: "danger",
          message: "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
        });
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
        <Breadcrumbs
          title="مدیران"
          breadcrumbItem={isEdit ? "ویرایش مدیر" : "ایجاد مدیر"}
        />

        <Row>
          <Col lg="8">
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">
                  {isEdit ? "ویرایش مدیر" : "ایجاد مدیر جدید"}
                </h4>
              </CardHeader>
              <CardBody>
                {alert && <Alert color={alert.type}>{alert.message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md="6">
                      <FormGroup>
                        <Label for="code">کد مدیر</Label>
                        <Input
                          id="code"
                          name="code"
                          value={form.code}
                          onChange={handleChange}
                          placeholder="مثلاً MGR-1001"
                          required
                          invalid={!!errors.code}
                        />
                        {renderError("code")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="user_id">شناسه کاربر</Label>
                        <Input
                          id="user_id"
                          name="user_id"
                          type="number"
                          value={form.user_id}
                          onChange={handleChange}
                          placeholder="ID کاربر مرتبط"
                          required
                          invalid={!!errors.user_id}
                        />
                        {renderError("user_id")}
                      </FormGroup>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mt-3">
                    <Button
                      type="submit"
                      color="primary"
                      className="w-md"
                      disabled={loading}
                    >
                      {loading
                        ? "در حال ذخیره..."
                        : isEdit
                          ? "ویرایش مدیر"
                          : "ثبت مدیر"}
                    </Button>
                    <Button
                      type="button"
                      color="secondary"
                      onClick={() => navigate("/managers")}
                    >
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

export default ManagerForm;
