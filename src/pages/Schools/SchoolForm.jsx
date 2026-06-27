// src/pages/Schools/SchoolForm.jsx
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
  createSchool,
  getSchool,
  updateSchool,
} from "../../services/schoolService.jsx";

const SchoolForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  document.title = (isEdit ? "ویرایش مجموعه" : "ایجاد مجموعه") + " | داشبورد آیسوق";

  const [form, setForm] = useState({
    name: "",
    code: "",
    phone: "",
    city: "",
    province: "",
    address: "",
    manager_id: "",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);
      try {
        const data = await getSchool(id);
        const school = data?.data || data;

        setForm({
          name: school?.name || "",
          code: school?.code || "",
          phone: school?.phone || "",
          city: school?.city || "",
          province: school?.province || "",
          address: school?.address || school?.location || "",
          manager_id:
            school?.manager_id ??
            school?.managerId ??
            school?.manager?.id ??
            "",
        });
      } catch (e) {
        console.error("خطا در دریافت مجموعه", e);
        setAlert({
          type: "danger",
          message: "خطا در دریافت اطلاعات مجموعه",
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

    if (!form.name.trim()) {
      setErrors({ name: ["نام مجموعه الزامی است"] });
      return;
    }

    const managerId =
      form.manager_id && !Number.isNaN(Number(form.manager_id))
        ? Number(form.manager_id)
        : null;

    const payload = {
      name: form.name,
      code: form.code || null,
      phone: form.phone || null,
      city: form.city || null,
      province: form.province || null,
      address: form.address || null,
      manager_id: managerId,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await updateSchool(id, payload);
        setAlert({
          type: "success",
          message: "مجموعه با موفقیت ویرایش شد.",
        });
      } else {
        await createSchool(payload);
        setAlert({
          type: "success",
          message: "مجموعه جدید با موفقیت ایجاد شد.",
        });
      }

      setTimeout(() => {
        navigate(-1);
      }, 700);
    } catch (e) {
      console.error("خطا در ذخیره مجموعه", e);
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
          title="مجموعه‌ها"
          breadcrumbItem={isEdit ? "ویرایش مجموعه" : "ایجاد مجموعه"}
        />

        <Row>
          <Col lg="10">
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">
                  {isEdit ? "ویرایش مجموعه" : "ایجاد مجموعه جدید"}
                </h4>
              </CardHeader>
              <CardBody>
                {alert && <Alert color={alert.type}>{alert.message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md="6">
                      <FormGroup>
                        <Label for="name">نام مجموعه</Label>
                        <Input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="مثلاً دبیرستان شماره ۱"
                          required
                          invalid={!!errors.name}
                        />
                        {renderError("name")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="code">کد مجموعه</Label>
                        <Input
                          id="code"
                          name="code"
                          value={form.code}
                          onChange={handleChange}
                          placeholder="مثلاً SCH-1001"
                          invalid={!!errors.code}
                        />
                        {renderError("code")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="phone">تلفن</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="مثلاً 021123456"
                          invalid={!!errors.phone}
                        />
                        {renderError("phone")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="city">شهر</Label>
                        <Input
                          id="city"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="مثلاً تهران"
                          invalid={!!errors.city}
                        />
                        {renderError("city")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="province">استان</Label>
                        <Input
                          id="province"
                          name="province"
                          value={form.province}
                          onChange={handleChange}
                          placeholder="مثلاً تهران"
                          invalid={!!errors.province}
                        />
                        {renderError("province")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="address">آدرس</Label>
                        <Input
                          id="address"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          placeholder="آدرس دقیق مجموعه"
                          invalid={!!errors.address}
                        />
                        {renderError("address")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="manager_id">شناسه مدیر مجموعه (اختیاری)</Label>
                        <Input
                          id="manager_id"
                          name="manager_id"
                          type="number"
                          value={form.manager_id}
                          onChange={handleChange}
                          placeholder="مثلاً 12"
                          invalid={!!errors.manager_id}
                        />
                        {renderError("manager_id")}
                      </FormGroup>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mt-3">
                    <Button type="submit" color="primary" className="w-md" disabled={loading}>
                      {loading ? "در حال ذخیره..." : isEdit ? "ویرایش مجموعه" : "ثبت مجموعه"}
                    </Button>
                    <Button type="button" color="secondary" onClick={() => navigate(-1)}>
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

export default SchoolForm;
