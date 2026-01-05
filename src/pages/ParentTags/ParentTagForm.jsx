// src/pages/ParentTags/ParentTagForm.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Spinner,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  createParentTag,
  getParentTag,
  getParentTags,
  updateParentTag,
} from "../../services/parentTagService.jsx";

const ParentTagForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  document.title = (isEdit ? "ویرایش تگ" : "ایجاد تگ") + " | داشبورد آیسوق";

  const [form, setForm] = useState({
    name: "",
    parent_id: "",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);

  const fetchParents = useCallback(async () => {
    setLoadingParents(true);
    try {
      const res = await getParentTags({
        page: 1,
        limit: 200,
        sortBy: "name",
        sortOrder: "ASC",
      });
      setParents(res.items || []);
    } catch (e) {
      console.error("خطا در دریافت لیست والد‌ها", e);
      setParents([]);
    } finally {
      setLoadingParents(false);
    }
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);
      try {
        const data = await getParentTag(id);

        const parentId =
          data?.parent_id ??
          data?.parentId ??
          data?.parent?.id ??
          data?.parent_tag?.id ??
          data?.parentTag?.id ??
          "";

        setForm({
          name: data?.name || "",
          parent_id: parentId ?? "",
        });
      } catch (e) {
        console.error("خطا در دریافت تگ", e);
        setAlert({
          type: "danger",
          message: "خطا در دریافت اطلاعات تگ",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const selectableParents = useMemo(() => {
    if (!isEdit) return parents;
    return (parents || []).filter(
      (p) => String(p.id) !== String(id) && p.id !== Number(id)
    );
  }, [parents, isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);

    if (!form.name.trim()) {
      setErrors({ name: ["نام تگ الزامی است"] });
      return;
    }

    const payload = {
      name: form.name.trim(),
      parent_id: form.parent_id ? Number(form.parent_id) : null,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await updateParentTag(id, payload);
        setAlert({
          type: "success",
          message: "تگ با موفقیت ویرایش شد.",
        });
      } else {
        await createParentTag(payload);
        setAlert({
          type: "success",
          message: "تگ جدید با موفقیت ایجاد شد.",
        });
      }

      setTimeout(() => {
        navigate("/parent-tags");
      }, 700);
    } catch (e) {
      console.error("خطا در ذخیره تگ", e);
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
          title="تگ‌ها"
          breadcrumbItem={isEdit ? "ویرایش تگ" : "ایجاد تگ"}
        />

        <Row>
          <Col lg="10">
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">
                  {isEdit ? "ویرایش تگ" : "ایجاد تگ جدید"}
                </h4>
              </CardHeader>
              <CardBody>
                {alert && <Alert color={alert.type}>{alert.message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md="6">
                      <FormGroup>
                        <Label for="name">نام تگ</Label>
                        <Input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="مثلاً برچسب اصلی"
                          required
                          invalid={!!errors.name}
                        />
                        {renderError("name")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="parent_id">تگ والد (اختیاری)</Label>
                        <div className="d-flex align-items-center gap-2">
                          <Input
                            id="parent_id"
                            name="parent_id"
                            type="select"
                            value={form.parent_id ?? ""}
                            onChange={handleChange}
                            invalid={!!errors.parent_id}
                          >
                            <option value="">بدون والد</option>
                            {(selectableParents || []).map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name || `تگ ${p.id}`}
                              </option>
                            ))}
                          </Input>
                          {loadingParents && <Spinner size="sm" color="primary" />}
                        </div>
                        {renderError("parent_id")}
                      </FormGroup>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mt-3">
                    <Button type="submit" color="primary" className="w-md" disabled={loading}>
                      {loading ? "در حال ذخیره..." : isEdit ? "ویرایش تگ" : "ثبت تگ"}
                    </Button>
                    <Button type="button" color="secondary" onClick={() => navigate("/parent-tags")}>
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

export default ParentTagForm;
