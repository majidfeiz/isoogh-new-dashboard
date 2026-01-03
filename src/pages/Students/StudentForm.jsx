// src/pages/Students/StudentForm.jsx
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
  FormText,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  getStudent,
  createStudent,
  updateStudent,
} from "../../services/studentService.jsx";

const normalizeDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const toNumberOrUndefined = (value) => {
  if (value === "" || value === null || typeof value === "undefined") return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

const parseSchoolIds = (value) => {
  if (!value) return [];
  return value
    .split(/[, \n\r]+/)
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => Number(v))
    .filter((v) => !Number.isNaN(v));
};

const StudentForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  document.title = (isEdit ? "ویرایش دانش‌آموز" : "ایجاد دانش‌آموز") + " | داشبورد آیسوق";

  const [form, setForm] = useState({
    code: "",
    user_id: "",
    schoolIdsInput: "",
    point: "",
    birthday: "",
    phone_2: "",
    phone_3: "",
    emergency_phone: "",
    voip_phone: "",
    shift: "",
    province: "",
    city: "",
    region: "",
    institute_type: "",
    institute_name: "",
    gpa: "",
    village: "",
    religion: "",
    relationship: "",
    group_id: "",
    work_shift_id: 1,
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      try {
        const data = await getStudent(id);
        const student = data?.data || data;
        const schoolIds =
          Array.isArray(student?.schools) && student.schools.length > 0
            ? student.schools.map((s) => s?.id).filter(Boolean)
            : [];

        setForm((prev) => ({
          ...prev,
          code: student.code || "",
          user_id: student.user_id ?? "",
          schoolIdsInput: schoolIds.join(","),
          point: student.point ?? "",
          birthday: normalizeDate(student.birthday),
          phone_2: student.phone_2 ?? "",
          phone_3: student.phone_3 ?? "",
          emergency_phone: student.emergency_phone ?? "",
          voip_phone: student.voip_phone ?? "",
          shift: student.shift ?? "",
          province: student.province ?? "",
          city: student.city ?? "",
          region: student.region ?? "",
          institute_type: student.institute_type ?? "",
          institute_name: student.institute_name ?? "",
          gpa: student.gpa ?? "",
          village: student.village ?? "",
          religion: student.religion ?? "",
          relationship: student.relationship ?? "",
          group_id: student.group_id ?? "",
          work_shift_id: student.work_shift_id ?? 1,
        }));
      } catch (e) {
        console.error(e);
        setAlert({
          type: "danger",
          message: "خطا در دریافت اطلاعات دانش‌آموز",
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

    const schoolIds = parseSchoolIds(form.schoolIdsInput);
    if (schoolIds.length === 0) {
      setErrors({ schoolIds: ["شناسه مدرسه الزامی است"] });
      setLoading(false);
      return;
    }

    const payload = {
      code: form.code,
      user_id: toNumberOrUndefined(form.user_id),
      point: toNumberOrUndefined(form.point),
      birthday: form.birthday || null,
      phone_2: form.phone_2 || null,
      phone_3: form.phone_3 || null,
      emergency_phone: form.emergency_phone || null,
      voip_phone: form.voip_phone || null,
      shift: form.shift || null,
      province: form.province || null,
      city: form.city || null,
      region: form.region || null,
      institute_type: form.institute_type || null,
      institute_name: form.institute_name || null,
      gpa: form.gpa || null,
      village: form.village || null,
      religion: form.religion || null,
      relationship: form.relationship || null,
      group_id: toNumberOrUndefined(form.group_id),
      work_shift_id: toNumberOrUndefined(form.work_shift_id) ?? 1,
      schoolIds,
    };

    try {
      if (isEdit) {
        await updateStudent(id, payload);
        setAlert({
          type: "success",
          message: "دانش‌آموز با موفقیت ویرایش شد.",
        });
      } else {
        await createStudent(payload);
        setAlert({
          type: "success",
          message: "دانش‌آموز جدید با موفقیت ایجاد شد.",
        });
      }

      setTimeout(() => {
        navigate("/students");
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
      <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
        {errors[field][0]}
      </div>
    ) : null;

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="دانش‌آموزان"
          breadcrumbItem={isEdit ? "ویرایش دانش‌آموز" : "ایجاد دانش‌آموز"}
        />

        <Row>
          <Col lg="10">
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">
                  {isEdit ? "ویرایش دانش‌آموز" : "ایجاد دانش‌آموز جدید"}
                </h4>
              </CardHeader>
              <CardBody>
                {alert && <Alert color={alert.type}>{alert.message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md="4">
                      <FormGroup>
                        <Label for="code">کد دانش‌آموز</Label>
                        <Input
                          id="code"
                          name="code"
                          value={form.code}
                          onChange={handleChange}
                          placeholder="مثلاً STU-001"
                          required
                        />
                        {renderError("code")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="user_id">شناسه کاربر (users)</Label>
                        <Input
                          id="user_id"
                          name="user_id"
                          type="number"
                          value={form.user_id}
                          onChange={handleChange}
                          placeholder="مثلاً 45"
                          required
                        />
                        {renderError("user_id")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="schoolIdsInput">شناسه مدارس</Label>
                        <Input
                          id="schoolIdsInput"
                          name="schoolIdsInput"
                          value={form.schoolIdsInput}
                          onChange={handleChange}
                          placeholder="مثلاً 1,2,5"
                        />
                        <FormText className="text-muted">
                          شناسه‌ها را با کاما یا فاصله جدا کنید.
                        </FormText>
                        {renderError("schoolIds")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="point">امتیاز</Label>
                        <Input
                          id="point"
                          name="point"
                          type="number"
                          value={form.point}
                          onChange={handleChange}
                          placeholder="مثلاً 0"
                        />
                        {renderError("point")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="birthday">تاریخ تولد</Label>
                        <Input
                          id="birthday"
                          name="birthday"
                          type="date"
                          value={form.birthday}
                          onChange={handleChange}
                        />
                        {renderError("birthday")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="work_shift_id">شیفت کاری</Label>
                        <Input
                          id="work_shift_id"
                          name="work_shift_id"
                          type="number"
                          value={form.work_shift_id}
                          onChange={handleChange}
                        />
                        {renderError("work_shift_id")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="voip_phone">شماره وویپ</Label>
                        <Input
                          id="voip_phone"
                          name="voip_phone"
                          value={form.voip_phone}
                          onChange={handleChange}
                          placeholder="مثلاً داخلی یا شماره مخصوص"
                        />
                        {renderError("voip_phone")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="phone_2">شماره تماس 2</Label>
                        <Input
                          id="phone_2"
                          name="phone_2"
                          value={form.phone_2}
                          onChange={handleChange}
                          placeholder="شماره دوم"
                        />
                        {renderError("phone_2")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="phone_3">شماره تماس 3</Label>
                        <Input
                          id="phone_3"
                          name="phone_3"
                          value={form.phone_3}
                          onChange={handleChange}
                          placeholder="شماره سوم"
                        />
                        {renderError("phone_3")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="emergency_phone">شماره اضطراری</Label>
                        <Input
                          id="emergency_phone"
                          name="emergency_phone"
                          value={form.emergency_phone}
                          onChange={handleChange}
                          placeholder="شماره تماس اضطراری"
                        />
                        {renderError("emergency_phone")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="shift">شیفت</Label>
                        <Input
                          id="shift"
                          name="shift"
                          value={form.shift}
                          onChange={handleChange}
                          placeholder="مثلاً صبح/عصر"
                        />
                        {renderError("shift")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="group_id">گروه</Label>
                        <Input
                          id="group_id"
                          name="group_id"
                          type="number"
                          value={form.group_id}
                          onChange={handleChange}
                          placeholder="شناسه گروه"
                        />
                        {renderError("group_id")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="gpa">معدل / نمره</Label>
                        <Input
                          id="gpa"
                          name="gpa"
                          value={form.gpa}
                          onChange={handleChange}
                          placeholder="مثلاً 19.25"
                        />
                        {renderError("gpa")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="institute_type">نوع مدرسه/موسسه</Label>
                        <Input
                          id="institute_type"
                          name="institute_type"
                          value={form.institute_type}
                          onChange={handleChange}
                          placeholder="تیپ موسسه"
                        />
                        {renderError("institute_type")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="institute_name">نام مدرسه/موسسه</Label>
                        <Input
                          id="institute_name"
                          name="institute_name"
                          value={form.institute_name}
                          onChange={handleChange}
                          placeholder="نام مدرسه"
                        />
                        {renderError("institute_name")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="province">استان</Label>
                        <Input
                          id="province"
                          name="province"
                          value={form.province}
                          onChange={handleChange}
                          placeholder="استان"
                        />
                        {renderError("province")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="city">شهر</Label>
                        <Input
                          id="city"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="شهر"
                        />
                        {renderError("city")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="region">منطقه</Label>
                        <Input
                          id="region"
                          name="region"
                          value={form.region}
                          onChange={handleChange}
                          placeholder="منطقه"
                        />
                        {renderError("region")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="village">روستا</Label>
                        <Input
                          id="village"
                          name="village"
                          value={form.village}
                          onChange={handleChange}
                          placeholder="روستا"
                        />
                        {renderError("village")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="religion">دین</Label>
                        <Input
                          id="religion"
                          name="religion"
                          value={form.religion}
                          onChange={handleChange}
                          placeholder="دین"
                        />
                        {renderError("religion")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="relationship">نسبت</Label>
                        <Input
                          id="relationship"
                          name="relationship"
                          value={form.relationship}
                          onChange={handleChange}
                          placeholder="مثلاً پدر/مادر"
                        />
                        {renderError("relationship")}
                      </FormGroup>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      type="button"
                      color="secondary"
                      onClick={() => navigate("/students")}
                    >
                      انصراف
                    </Button>
                    <Button type="submit" color="primary" disabled={loading}>
                      {loading
                        ? "در حال ذخیره..."
                        : isEdit
                        ? "ذخیره تغییرات"
                        : "ایجاد دانش‌آموز"}
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

export default StudentForm;

