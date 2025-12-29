// src/pages/Users/UserForm.jsx
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
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  getUser,
  createUser,
  updateUser,
} from "../../services/userService.jsx";

const UserForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  document.title = (isEdit ? "ویرایش کاربر" : "ایجاد کاربر") + " | داشبورد آیسوق";

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    password_confirmation: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  // وقتی در حالت ویرایش هستیم، دیتای کاربر را بگیر
  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      try {
        const data = await getUser(id);
        const user = data.data || data; // بستگی به API
        setForm((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          mobile: user.mobile || "",
          status: user.status || "active",
          password: "",
          password_confirmation: "",
        }));
      } catch (e) {
        console.error(e);
        setAlert({
          type: "danger",
          message: "خطا در دریافت اطلاعات کاربر",
        });
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
    setLoading(true);

    try {
      if (isEdit) {
        const payload = { ...form };
        if (!payload.password) {
          delete payload.password;
          delete payload.password_confirmation;
        }
        await updateUser(id, payload);
        setAlert({
          type: "success",
          message: "کاربر با موفقیت ویرایش شد.",
        });
      } else {
        await createUser(form);
        setAlert({
          type: "success",
          message: "کاربر جدید با موفقیت ایجاد شد.",
        });
      }

      setTimeout(() => {
        navigate("/users");
      }, 800);
    } catch (e) {
      console.error(e);
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
      <div
        className="text-danger mt-1"
        style={{ fontSize: "0.85rem" }}
      >
        {errors[field][0]}
      </div>
    ) : null;

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="کاربران"
          breadcrumbItem={isEdit ? "ویرایش کاربر" : "ایجاد کاربر"}
        />

        <Row>
          <Col lg="8">
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">
                  {isEdit ? "ویرایش کاربر" : "ایجاد کاربر جدید"}
                </h4>
              </CardHeader>
              <CardBody>
                {alert && (
                  <Alert color={alert.type}>{alert.message}</Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="name">نام</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                    {renderError("name")}
                  </FormGroup>

                  <FormGroup>
                    <Label for="email">ایمیل</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                    {renderError("email")}
                  </FormGroup>

                  <FormGroup>
                    <Label for="mobile">موبایل</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                    />
                    {renderError("mobile")}
                  </FormGroup>

                  <FormGroup>
                    <Label for="status">وضعیت</Label>
                    <Input
                      type="select"
                      id="status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="active">فعال</option>
                      <option value="inactive">غیرفعال</option>
                    </Input>
                    {renderError("status")}
                  </FormGroup>

                  <FormGroup>
                    <Label for="password">
                      رمز عبور{isEdit && " (در صورت نیاز به تغییر)"}
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                    />
                    {renderError("password")}
                  </FormGroup>

                  <FormGroup>
                    <Label for="password_confirmation">
                      تکرار رمز عبور
                    </Label>
                    <Input
                      id="password_confirmation"
                      name="password_confirmation"
                      type="password"
                      value={form.password_confirmation}
                      onChange={handleChange}
                    />
                    {renderError("password_confirmation")}
                  </FormGroup>

                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      type="button"
                      color="secondary"
                      onClick={() => navigate("/users")}
                    >
                      انصراف
                    </Button>
                    <Button type="submit" color="primary" disabled={loading}>
                      {loading
                        ? "در حال ذخیره..."
                        : isEdit
                        ? "ذخیره تغییرات"
                        : "ایجاد کاربر"}
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

export default UserForm;
