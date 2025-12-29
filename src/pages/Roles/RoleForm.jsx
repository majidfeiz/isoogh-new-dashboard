// src/pages/Roles/RoleForm.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Container,
  Form,
  Label,
  Input,
  FormFeedback,
  Button,
  Alert,
} from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  getRole,
  createRole,
  updateRole,
} from "../../services/roleService.jsx";

const RoleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  document.title = isEdit
    ? "ویرایش نقش | داشبورد آیسوق"
    : "افزودن نقش | داشبورد آیسوق";

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validationSchema = Yup.object({
    name: Yup.string().required("نام نقش الزامی است"),
    label: Yup.string().required("برچسب نقش الزامی است"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      label: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setServerError(null);
      setLoading(true);
      try {
        if (isEdit) {
          await updateRole(id, values);
        } else {
          await createRole(values);
        }
        navigate("/roles");
      } catch (err) {
        console.error(err);
        const msg =
          err?.response?.data?.message ||
          "خطایی در ذخیره‌سازی نقش رخ داد.";
        setServerError(Array.isArray(msg) ? msg.join("، ") : msg);
      } finally {
        setLoading(false);
      }
    },
  });

  const fetchItem = useCallback(async () => {
    if (!isEdit) return;
    try {
      setLoading(true);
      const item = await getRole(id);
      formik.setValues({
        name: item.name || "",
        label: item.label || "",
      });
    } catch (e) {
      console.error("خطا در دریافت نقش", e);
      setServerError("امکان دریافت اطلاعات نقش وجود ندارد.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="مدیریت دسترسی"
          breadcrumbItem={isEdit ? "ویرایش نقش" : "افزودن نقش"}
        />

        <Row>
          <Col lg={6}>
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">
                  {isEdit ? "ویرایش نقش" : "افزودن نقش جدید"}
                </h4>
              </CardHeader>
              <CardBody>
                {serverError && <Alert color="danger">{serverError}</Alert>}

                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    formik.handleSubmit();
                  }}
                >
                  <div className="mb-3">
                    <Label>نام نقش (name)</Label>
                    <Input
                      name="name"
                      type="text"
                      placeholder="مثال: admin"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      invalid={
                        formik.touched.name && Boolean(formik.errors.name)
                      }
                    />
                    {formik.touched.name && formik.errors.name && (
                      <FormFeedback>{formik.errors.name}</FormFeedback>
                    )}
                  </div>

                  <div className="mb-3">
                    <Label>برچسب نقش (label)</Label>
                    <Input
                      name="label"
                      type="text"
                      placeholder="مثال: مدیر سیستم"
                      value={formik.values.label}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      invalid={
                        formik.touched.label && Boolean(formik.errors.label)
                      }
                    />
                    {formik.touched.label && formik.errors.label && (
                      <FormFeedback>{formik.errors.label}</FormFeedback>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <Button type="submit" color="primary" disabled={loading}>
                      {loading ? "در حال ذخیره..." : "ذخیره"}
                    </Button>
                    <Button
                      type="button"
                      color="secondary"
                      onClick={() => navigate("/roles")}
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

export default RoleForm;
