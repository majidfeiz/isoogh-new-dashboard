import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, CardHeader, Col, Container, Form, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSchools } from "../../services/schoolService.jsx";
import { createUser, getUser, updateUser } from "../../services/userService.jsx";
import { buildUserPayload, getUserApiErrors, isAdminUser, userDetailsToForm, validateUserForm } from "./userFormUtils.js";

const EMPTY_FORM = { name: "", email: "", username: "", ssn: "", phone: "", password: "", confirmPassword: "", accountType: "", isSuperAdviser: false, schoolIds: [] };

const UserForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const auth = useAuth();
  const isAdmin = useMemo(() => isAdminUser(auth?.user), [auth?.user]);
  const permitted = isEdit
    ? auth?.hasAllPermissions(["users.show", "users.update"])
    : auth?.hasPermission("users.create");
  const [form, setForm] = useState(EMPTY_FORM);
  const [schools, setSchools] = useState([]);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  document.title = `${isEdit ? "ویرایش کاربر" : "ایجاد کاربر"} | داشبورد آیسوق`;

  useEffect(() => {
    if (!isAdmin || !permitted) return;
    let active = true;
    setSchoolsLoading(true);
    getSchools({ page: 1, limit: 500, sortBy: "name", sortOrder: "ASC" })
      .then((result) => { if (active) setSchools(result.items || []); })
      .catch(() => { if (active) setSchools([]); })
      .finally(() => { if (active) setSchoolsLoading(false); });
    return () => { active = false; };
  }, [isAdmin, permitted]);

  useEffect(() => {
    if (!isEdit || !permitted) return;
    let active = true;
    setInitialLoading(true);
    getUser(id, { silent: true }).then((user) => {
      if (!active) return;
      setForm(userDetailsToForm(user));
    }).catch((error) => {
      if (active) setAlert({ type: "danger", message: getUserApiErrors(error).message });
    }).finally(() => { if (active) setInitialLoading(false); });
    return () => { active = false; };
  }, [id, isEdit, permitted]);

  if (auth?.user && !permitted) return <Navigate to="/" replace />;

  const handleChange = ({ target: { name, value } }) => {
    setForm((previous) => ({ ...previous, [name]: value, ...(name === "accountType" && value === "student" ? { isSuperAdviser: false } : {}) }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };
  const handleSchoolsChange = (event) => {
    const schoolIds = Array.from(event.currentTarget.selectedOptions, (option) => option.value);
    setForm((previous) => ({ ...previous, schoolIds }));
    setErrors((previous) => ({ ...previous, schoolIds: undefined }));
  };
  const renderError = (field) => errors[field]?.length ? <div className="text-danger mt-1 small">{errors[field][0]}</div> : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setAlert(null);
    const validationErrors = validateUserForm(form, { isEdit, isAdmin });
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    setErrors({});
    setLoading(true);
    try {
      const payload = buildUserPayload(form, { isEdit, isAdmin });
      if (isEdit) await updateUser(id, payload, { silent: true });
      else await createUser(payload, { silent: true });
      setAlert({ type: "success", message: isEdit ? "کاربر با موفقیت ویرایش شد." : "کاربر جدید با موفقیت ایجاد شد." });
      window.dispatchEvent(new CustomEvent("isoogh:user-data-changed", { detail: { accountType: form.accountType } }));
      setTimeout(() => navigate(-1), 500);
    } catch (error) {
      const apiError = getUserApiErrors(error);
      setErrors(apiError.fieldErrors);
      setAlert({ type: "danger", message: apiError.message });
    } finally { setLoading(false); }
  };

  return <div className="page-content"><Container fluid><Breadcrumbs title="کاربران" breadcrumbItem={isEdit ? "ویرایش کاربر" : "ایجاد کاربر"} /><Row><Col lg="8"><Card><CardHeader><h4 className="card-title mb-0">{isEdit ? "ویرایش کاربر" : "ایجاد کاربر جدید"}</h4></CardHeader><CardBody>
    {alert && <Alert color={alert.type}>{alert.message}</Alert>}
    {initialLoading ? <div className="text-center py-5"><Spinner /></div> : <Form onSubmit={handleSubmit} noValidate><Row className="g-3">
      <Col md="6"><FormGroup><Label for="accountType">نوع کاربر <span className="text-danger">*</span></Label><Input id="accountType" name="accountType" type="select" value={form.accountType} onChange={handleChange} disabled={isEdit || loading}><option value="">انتخاب کنید</option><option value="student">دانش‌آموز</option><option value="adviser">مشاور</option></Input>{renderError("accountType")}</FormGroup></Col>
      {form.accountType === "adviser" && <Col md="6"><FormGroup><Label for="adviserLevel">سطح مشاور</Label><Input id="adviserLevel" type="select" value={form.isSuperAdviser ? "super" : "adviser"} disabled={loading} onChange={(event) => setForm((previous) => ({ ...previous, isSuperAdviser: event.target.value === "super" }))}><option value="adviser">مشاور</option><option value="super">سرمشاور</option></Input></FormGroup></Col>}
      {isAdmin && <Col md="12"><FormGroup><Label for="schoolIds">مجموعه <span className="text-danger">*</span></Label><Input id="schoolIds" type="select" multiple value={form.schoolIds} onChange={handleSchoolsChange} disabled={schoolsLoading || loading} style={{ minHeight: 120 }}>{schools.map((school) => <option key={school.id} value={String(school.id)}>{school.name || school.title || `مجموعه ${school.id}`}</option>)}</Input>{schoolsLoading && <div className="text-muted small mt-1">در حال دریافت مجموعه‌ها...</div>}{renderError("schoolIds")}</FormGroup></Col>}
      <Col md="6"><FormGroup><Label for="name">نام <span className="text-danger">*</span></Label><Input id="name" name="name" value={form.name} onChange={handleChange} disabled={loading} />{renderError("name")}</FormGroup></Col>
      <Col md="6"><FormGroup><Label for="username">نام کاربری <span className="text-danger">*</span></Label><Input id="username" name="username" dir="ltr" value={form.username} onChange={handleChange} disabled={loading} placeholder="ali.mohammadi" />{renderError("username")}</FormGroup></Col>
      <Col md="6"><FormGroup><Label for="phone">شماره موبایل <span className="text-danger">*</span></Label><Input id="phone" name="phone" dir="ltr" value={form.phone} onChange={handleChange} disabled={loading} />{renderError("phone")}{renderError("mobile")}</FormGroup></Col>
      <Col md="6"><FormGroup><Label for="ssn">کد ملی</Label><Input id="ssn" name="ssn" dir="ltr" value={form.ssn} onChange={handleChange} disabled={loading} placeholder="0012345678" />{renderError("ssn")}</FormGroup></Col>
      <Col md="6"><FormGroup><Label for="email">ایمیل</Label><Input id="email" name="email" type="email" dir="ltr" value={form.email} onChange={handleChange} disabled={loading} />{renderError("email")}</FormGroup></Col>
      <Col md="6"><FormGroup><Label for="password">رمز عبور{isEdit ? " (در صورت نیاز به تغییر)" : " *"}</Label><Input id="password" name="password" type="password" value={form.password} onChange={handleChange} disabled={loading} />{renderError("password")}</FormGroup></Col>
      <Col md="6"><FormGroup><Label for="confirmPassword">تکرار رمز عبور</Label><Input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} disabled={loading} />{renderError("confirmPassword")}</FormGroup></Col>
    </Row><div className="d-flex justify-content-end gap-2"><Button type="button" color="secondary" onClick={() => navigate(-1)} disabled={loading}>انصراف</Button><Button type="submit" color="primary" disabled={loading || schoolsLoading}>{loading ? <><Spinner size="sm" className="ms-1" />در حال ذخیره...</> : isEdit ? "ذخیره تغییرات" : "ایجاد کاربر"}</Button></div></Form>}
  </CardBody></Card></Col></Row></Container></div>;
};

export default UserForm;
