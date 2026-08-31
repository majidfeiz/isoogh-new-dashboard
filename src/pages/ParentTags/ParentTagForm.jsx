// src/pages/ParentTags/ParentTagForm.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
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
  createParentTag,
  getParentTag,
  getParentTags,
  updateParentTag,
} from "../../services/parentTagService.jsx";
import { getSchools } from "../../services/schoolService.jsx";

const PARENT_TAGS_PAGE_SIZE = 50;

const mergeParentTags = (current, incoming) => {
  const tagsById = new Map();
  [...(current || []), ...(incoming || [])].forEach((tag) => {
    if (tag?.id != null) tagsById.set(String(tag.id), tag);
  });
  return Array.from(tagsById.values());
};

const ParentTagForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  document.title = (isEdit ? "ویرایش تگ" : "ایجاد تگ") + " | داشبورد آیسوق";

  const [form, setForm] = useState({
    name: "",
    parent_id: "",
    school_id: ""
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [debouncedParentSearch, setDebouncedParentSearch] = useState("");
  const [parentMeta, setParentMeta] = useState({ page: 1, lastPage: 1 });
  const [parentLoadError, setParentLoadError] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const parentRequestRef = useRef(0);

  const schoolOptions = useMemo(
      () =>
        (schools || []).map((school) => ({
          value: school.id,
          label: school.name || school.title || `مجموعه ${school.id}`,
        })),
      [schools]
    );

  const fetchParents = useCallback(async (page = 1, search = "", append = false) => {
    const requestId = ++parentRequestRef.current;
    setLoadingParents(true);
    setParentLoadError(false);
    try {
      const res = await getParentTags({
        page,
        limit: PARENT_TAGS_PAGE_SIZE,
        search,
        sortBy: "name",
        sortOrder: "ASC",
      });
      if (requestId !== parentRequestRef.current) return;
      setParents((current) => append ? mergeParentTags(current, res.items) : (res.items || []));
      setParentMeta(res.pagination || { page, lastPage: 1 });
    } catch (e) {
      if (requestId !== parentRequestRef.current) return;
      console.error("خطا در دریافت لیست والد‌ها", e);
      setParentLoadError(true);
      if (!append) setParents([]);
    } finally {
      if (requestId === parentRequestRef.current) setLoadingParents(false);
    }
  }, []);

  useEffect(() => {
    getSchools({ page: 1, limit: 200 })
      .then((res) => setSchools(res.items || []))
      .catch((e) => console.error("خطا در دریافت لیست مجموعه‌ها", e));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedParentSearch(parentSearch.trim()), 350);
    return () => clearTimeout(timeoutId);
  }, [parentSearch]);

  useEffect(() => {
    fetchParents(1, debouncedParentSearch, false);
  }, [debouncedParentSearch, fetchParents]);

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

        const parent = data?.parent ?? data?.parent_tag ?? data?.parentTag ?? null;
        setSelectedParent(
          parentId
            ? {
                ...(parent && typeof parent === "object" ? parent : {}),
                id: parentId,
                name: parent?.name || `تگ ${parentId}`,
              }
            : null
        );

        setForm({
          name: data?.name || "",
          parent_id: parentId ?? "",
          school_id: data?.school_id ?? ""
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

  const selectedParentOption = useMemo(() => {
    if (!form.parent_id) return null;
    return (
      selectableParents.find((parent) => String(parent.id) === String(form.parent_id)) ||
      selectedParent
    );
  }, [form.parent_id, selectableParents, selectedParent]);

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
      school_id: form?.school_id ?? "",

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
        navigate(-1);
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
                    <Col md="4">
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
                    <Col md="4">
                      <FormGroup>
                        <Label for="school_id">مجموعه</Label>

                        <Input
                          id="school_id"
                          name="school_id"
                          type="select"
                          value={form.school_id != null ? String(form.school_id) : ""}
                          required
                          onChange={handleChange}
                        >
                          <option value="">انتخاب مجموعه</option>

                          {schoolOptions.map((opt) => (
                            <option
                              key={opt.value}
                              value={String(opt.value)}
                            >
                              {opt.label}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="parent_id">تگ والد (اختیاری)</Label>
                        <Select
                          id="parent_id"
                          inputId="parent_id"
                          isRtl
                          isClearable
                          value={selectedParentOption}
                          options={selectableParents}
                          getOptionValue={(option) => String(option.id)}
                          getOptionLabel={(option) => option.name || `تگ ${option.id}`}
                          onChange={(option) => {
                            setSelectedParent(option || null);
                            setForm((prev) => ({ ...prev, parent_id: option?.id ?? "" }));
                          }}
                          onInputChange={(value, action) => {
                            if (action.action === "input-change") setParentSearch(value);
                          }}
                          onMenuScrollToBottom={() => {
                            if (!loadingParents && parentMeta.page < parentMeta.lastPage) {
                              fetchParents(parentMeta.page + 1, debouncedParentSearch, true);
                            }
                          }}
                          isLoading={loadingParents}
                          placeholder="انتخاب یا جست‌وجوی تگ والد"
                          loadingMessage={() => "در حال دریافت تگ‌ها..."}
                          noOptionsMessage={() =>
                            parentLoadError ? "دریافت تگ‌ها ناموفق بود" : "تگی یافت نشد"
                          }
                          classNamePrefix="react-select"
                        />
                        {parentLoadError && (
                          <Button
                            type="button"
                            color="link"
                            size="sm"
                            className="p-0 mt-1"
                            onClick={() => fetchParents(1, debouncedParentSearch, false)}
                          >
                            تلاش مجدد
                          </Button>
                        )}
                        {renderError("parent_id")}
                      </FormGroup>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mt-3">
                    <Button type="submit" color="primary" className="w-md" disabled={loading}>
                      {loading ? "در حال ذخیره..." : isEdit ? "ویرایش تگ" : "ثبت تگ"}
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

export default ParentTagForm;
