import React from "react";
import {
  Card,
  Col,
  Container,
  Row,
  CardBody,
  CardTitle,
  Label,
  Form,
  Input,
  FormFeedback,
  Alert,
  Button,
} from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import { createPermission } from "../../services/permissionService.jsx";

const PermissionCreate = () => {
  document.title = "ایجاد سطح دسترسی | داشبورد آیسوق";

  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      label: "",
      module: "",
      description: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("نام سطح دسترسی الزامی است"),
      label: Yup.string().required("برچسب نمایش الزامی است"),
      module: Yup.string().required("نام ماژول الزامی است"),
      description: Yup.string().nullable(),
    }),
    onSubmit: async (values) => {
      setServerErrors([]);
      setLoading(true);

      try {
        await createPermission(values);
        // بعد از ساخت موفق، برو به لیست
        navigate("/permissions");
      } catch (err) {
        console.error("create permission error", err);
        const data = err?.response?.data;
        let messages = [];

        if (Array.isArray(data?.message)) {
          messages = data.message;
        } else if (typeof data?.message === "string") {
          messages = [data.message];
        } else {
          messages = ["خطا در ذخیره‌سازی سطح دسترسی. لطفا دوباره تلاش کنید."];
        }

        setServerErrors(messages);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs
            title="مدیریت دسترسی"
            breadcrumbItem="ایجاد سطح دسترسی"
          />

          <Row>
            <Col xl={8}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">ایجاد سطح دسترسی جدید</CardTitle>

                  {/* خطاهای بک‌اند */}
                  {serverErrors.length > 0 && (
                    <Alert color="danger">
                      <ul className="mb-0">
                        {serverErrors.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                  <Form onSubmit={formik.handleSubmit}>
                    {/* نام */}
                    <div className="mb-3">
                      <Label htmlFor="permission-name">نام (سیستم)</Label>
                      <Input
                        type="text"
                        name="name"
                        id="permission-name"
                        placeholder="مثال: manage_users"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        invalid={formik.touched.name && !!formik.errors.name}
                      />
                      {formik.touched.name && formik.errors.name ? (
                        <FormFeedback>{formik.errors.name}</FormFeedback>
                      ) : null}
                    </div>

                    {/* برچسب */}
                    <div className="mb-3">
                      <Label htmlFor="permission-label">برچسب نمایش</Label>
                      <Input
                        type="text"
                        name="label"
                        id="permission-label"
                        placeholder="مثال: مدیریت کاربران"
                        value={formik.values.label}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        invalid={
                          formik.touched.label && !!formik.errors.label
                        }
                      />
                      {formik.touched.label && formik.errors.label ? (
                        <FormFeedback>{formik.errors.label}</FormFeedback>
                      ) : null}
                    </div>

                    {/* ماژول */}
                    <div className="mb-3">
                      <Label htmlFor="permission-module">ماژول</Label>
                      <Input
                        type="text"
                        name="module"
                        id="permission-module"
                        placeholder="مثال: users, roles, reports"
                        value={formik.values.module}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        invalid={
                          formik.touched.module && !!formik.errors.module
                        }
                      />
                      {formik.touched.module && formik.errors.module ? (
                        <FormFeedback>{formik.errors.module}</FormFeedback>
                      ) : null}
                    </div>

                    {/* توضیحات */}
                    <div className="mb-3">
                      <Label htmlFor="permission-description">توضیحات</Label>
                      <Input
                        type="textarea"
                        rows="3"
                        name="description"
                        id="permission-description"
                        placeholder="توضیح کوتاهی درباره این سطح دسترسی بنویسید (اختیاری)"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        type="submit"
                        color="primary"
                        className="w-md"
                        disabled={loading}
                      >
                        {loading ? "در حال ذخیره..." : "ذخیره سطح دسترسی"}
                      </Button>
                      <Button
                        type="button"
                        color="secondary"
                        onClick={() => navigate("/permissions")}
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
    </React.Fragment>
  );
};

export default PermissionCreate;
