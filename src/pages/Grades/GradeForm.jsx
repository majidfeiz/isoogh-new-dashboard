// src/pages/Grades/GradeForm.jsx
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
import { createGrade, getGrade, updateGrade } from "../../services/gradeService.jsx";

const GradeForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  document.title = (isEdit ? "ویرایش پایه" : "ایجاد پایه") + " | داشبورد آیسوق";

  const [form, setForm] = useState({
    name: "",
    sort: 0,
    status: 1,
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);
      try {
        const data = await getGrade(id);
        const grade = data?.data || data;

        setForm({
          name: grade?.name || "",
          sort: grade?.sort ?? 0,
          status:
            grade?.status === 0 || grade?.status === "0"
              ? 0
              : grade?.status === 1 || grade?.status === "1"
              ? 1
              : 1,
        });
      } catch (e) {
        console.error("خطا در دریافت پایه", e);
        setAlert({
          type: "danger",
          message: "خطا در دریافت اطلاعات پایه",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "sort" ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);

    if (!form.name.trim()) {
      setErrors({ name: ["نام پایه الزامی است"] });
      return;
    }

    const payload = {
      name: form.name,
      sort: Number.isNaN(Number(form.sort)) ? 0 : Number(form.sort),
      status:
        form.status === "0" || form.status === 0 ? 0 : form.status === "1" || form.status === 1 ? 1 : 1,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await updateGrade(id, payload);
        setAlert({
          type: "success",
          message: "پایه با موفقیت ویرایش شد.",
        });
      } else {
        await createGrade(payload);
        setAlert({
          type: "success",
          message: "پایه جدید با موفقیت ایجاد شد.",
        });
      }

      setTimeout(() => {
        navigate("/grades");
      }, 700);
    } catch (e) {
      console.error("خطا در ذخیره پایه", e);
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
          title="پایه‌ها"
          breadcrumbItem={isEdit ? "ویرایش پایه" : "ایجاد پایه"}
        />

        <Row>
          <Col lg="10">
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">
                  {isEdit ? "ویرایش پایه" : "ایجاد پایه جدید"}
                </h4>
              </CardHeader>
              <CardBody>
                {alert && <Alert color={alert.type}>{alert.message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md="6">
                      <FormGroup>
                        <Label for="name">نام پایه</Label>
                        <Input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="مثلاً پایه هفتم"
                          required
                          invalid={!!errors.name}
                        />
                        {renderError("name")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="sort">ترتیب نمایش</Label>
                        <Input
                          id="sort"
                          name="sort"
                          type="number"
                          value={form.sort}
                          onChange={handleChange}
                          placeholder="مثلاً 1"
                          invalid={!!errors.sort}
                        />
                        {renderError("sort")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
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
                          <option value={1}>فعال</option>
                          <option value={0}>غیرفعال</option>
                        </Input>
                        {renderError("status")}
                      </FormGroup>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mt-3">
                    <Button type="submit" color="primary" className="w-md" disabled={loading}>
                      {loading ? "در حال ذخیره..." : isEdit ? "ویرایش پایه" : "ثبت پایه"}
                    </Button>
                    <Button type="button" color="secondary" onClick={() => navigate("/grades")}>
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

export default GradeForm;
