import React, { useEffect, useState } from "react";
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
import { useNavigate, useParams } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  getPermission,
  updatePermission,
} from "../../services/permissionService.jsx";

const PermissionEdit = () => {
  document.title = "ویرایش سطح دسترسی | داشبورد آیسوق";

  const navigate = useNavigate();
  const { id } = useParams();

  const [serverErrors, setServerErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const formik = useFormik({
    enableReinitialize: true,
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
        await updatePermission(id, values);
        navigate("/permissions");
      } catch (err) {
        console.error("update permission error", err);
        const data = err?.response?.data;
        let messages = [];

        if (Array.isArray(data?.message)) {
          messages = data.message;
        } else if (typeof data?.message === "string") {
          messages = [data.message];
        } else {
          messages = [
            "خطا در ذخیره‌سازی تغییرات سطح دسترسی. لطفا دوباره تلاش کنید.",
          ];
        }

        setServerErrors(messages);
      } finally {
        setLoading(false);
      }
    },
  });

  // لود اولیه داده‌ها
  useEffect(() => {
    const load = async () => {
      try {
        const permission = await getPermission(id);
        formik.setValues({
          name: permission.name || "",
          label: permission.label || "",
          module: permission.module || "",
          description: permission.description || "",
        });
      } catch (err) {
        console.error("خطا در دریافت اطلاعات سطح دسترسی", err);
      } finally {
        setInitialLoading(false);
      }
    };

    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs
            title="مدیریت دسترسی"
            breadcrumbItem="ویرایش سطح دسترسی"
          />

          <Row>
            <Col xl={8}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">ویرایش سطح دسترسی</CardTitle>

                  {initialLoading ? (
                    <p>در حال بارگذاری...</p>
                  ) : (
                    <>
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
                            invalid={
                              formik.touched.name && !!formik.errors.name
                            }
                          />
                          {formik.touched.name && formik.errors.name ? (
                            <FormFeedback>{formik.errors.name}</FormFeedback>
                          ) : null}
                        </div>

                        <div className="mb-3">
                          <Label htmlFor="permission-label">
                            برچسب نمایش
                          </Label>
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

                        <div className="mb-3">
                          <Label htmlFor="permission-description">
                            توضیحات
                          </Label>
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
                            {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
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
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PermissionEdit;
