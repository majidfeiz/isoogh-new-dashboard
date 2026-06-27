// src/pages/Students/StudentForm.jsx
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react"
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
  Badge,
  Spinner,
} from "reactstrap"
import { useNavigate, useParams } from "react-router-dom"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import { getStudent, createStudent, updateStudent } from "../../services/studentService.jsx"
import { getUsers } from "../../services/userService.jsx"
import { getSchools } from "../../services/schoolService.jsx"
import { useAuth } from "../../context/AuthContext.jsx"

const toNum = (v) => {
  if (v === "" || v == null) return undefined
  const n = Number(v)
  return Number.isNaN(n) ? undefined : n
}

const StudentForm = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const auth = useAuth?.()

  document.title = (isEdit ? "ویرایش دانش‌آموز" : "ایجاد دانش‌آموز") + " | داشبورد آیسوق"

  const [form, setForm] = useState({
    birthday: "",
    point: "",
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
    work_shift_id: "1",
    name: "",
    username: "",
    ssn: "",
  })
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  // User search autocomplete
  const [userSearch, setUserSearch] = useState("")
  const [userSearchResults, setUserSearchResults] = useState([])
  const [userSearchLoading, setUserSearchLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const userSearchTimer = useRef(null)
  const userSearchRef = useRef(null)

  // Schools
  const [schools, setSchools] = useState([])
  const [schoolsLoading, setSchoolsLoading] = useState(false)
  const [selectedSchoolId, setSelectedSchoolId] = useState("")

  // Role detection
  const isAdminLike = useMemo(() => {
    const roles = auth?.user?.roles || []
    return roles.some((r) => {
      const name = (r?.name || r?.label || "").toLowerCase()
      return ["admin", "super_admin", "super-admin", "super admin"].includes(name)
    })
  }, [auth])

  const managedSchools = isAdminLike ? [] : schools
  const managerAutoSchool = !isAdminLike && managedSchools.length === 1 ? managedSchools[0] : null
  const needsSchoolSelect = isAdminLike || managedSchools.length > 1
  const schoolsToShow = needsSchoolSelect ? (isAdminLike ? schools : managedSchools) : []

  // Load schools on mount
  useEffect(() => {
    if (!auth?.user) return
    const load = async () => {
      setSchoolsLoading(true)
      try {
        if (isAdminLike) {
          const res = await getSchools({ limit: 500, sortBy: "name", sortOrder: "ASC" })
          setSchools(res.items || [])
        } else {
          const userId = auth.user.id
          if (userId) {
            const res = await getSchools({ managerId: userId, limit: 200 })
            setSchools(res.items || [])
          }
        }
      } catch (e) {
        console.error("خطا در دریافت مجموعه‌ها", e)
      } finally {
        setSchoolsLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminLike, auth?.user?.id])

  // Auto-select manager's single school (create mode)
  useEffect(() => {
    if (managerAutoSchool && !isEdit) {
      setSelectedSchoolId(String(managerAutoSchool.id))
    }
  }, [managerAutoSchool, isEdit])

  // Load student data in edit mode
  useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      try {
        const student = await getStudent(id)
        const firstSchoolId = (student?.schools || [])[0]?.id
        setSelectedSchoolId(firstSchoolId ? String(firstSchoolId) : "")
        setForm((prev) => ({
          ...prev,
          birthday: student.birthday || "",
          point: student.point ?? "",
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
          work_shift_id: String(student.work_shift_id ?? "1"),
          name: student.user?.name || student.name || "",
          username: student.user?.username || student.username || "",
          ssn: student.user?.ssn || student.ssn || "",
        }))
        if (student.user) {
          setSelectedUser(student.user)
          setUserSearch(student.user.name || student.user.username || "")
        } else if (student.user_id) {
          setSelectedUser({ id: student.user_id })
          setUserSearch(`کاربر #${student.user_id}`)
        }
      } catch (e) {
        console.error(e)
        setAlert({ type: "danger", message: "خطا در دریافت اطلاعات دانش‌آموز" })
      }
    })()
  }, [id, isEdit])

  // User search
  const searchUsers = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setUserSearchResults([])
      setShowUserDropdown(false)
      return
    }
    setUserSearchLoading(true)
    try {
      const res = await getUsers({ search: q.trim(), limit: 10 })
      setUserSearchResults(res.items || [])
      setShowUserDropdown(true)
    } catch (e) {
      console.error(e)
    } finally {
      setUserSearchLoading(false)
    }
  }, [])

  const handleUserSearchChange = (e) => {
    const val = e.target.value
    setUserSearch(val)
    if (selectedUser) setSelectedUser(null)
    clearTimeout(userSearchTimer.current)
    userSearchTimer.current = setTimeout(() => searchUsers(val), 400)
  }

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setUserSearch(user.name || user.username || `کاربر #${user.id}`)
    setShowUserDropdown(false)
    setUserSearchResults([])
    if (isEdit) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        username: user.username || prev.username,
        ssn: user.ssn || prev.ssn,
      }))
    }
  }

  const handleClearUser = () => {
    setSelectedUser(null)
    setUserSearch("")
    setUserSearchResults([])
    setShowUserDropdown(false)
  }

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userSearchRef.current && !userSearchRef.current.contains(e.target)) {
        setShowUserDropdown(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setAlert(null)

    const newErrors = {}

    if (!isEdit && !selectedUser) {
      newErrors.user_id = ["انتخاب کاربر الزامی است"]
    }

    const effectiveSchoolId = needsSchoolSelect
      ? selectedSchoolId
      : managerAutoSchool
      ? String(managerAutoSchool.id)
      : ""

    if (!effectiveSchoolId) {
      newErrors.schoolIds = ["انتخاب مجموعه الزامی است"]
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const payload = {
        schoolIds: [Number(effectiveSchoolId)],
        birthday: form.birthday || null,
        point: toNum(form.point),
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
        group_id: form.group_id || null,
        work_shift_id: toNum(form.work_shift_id) ?? 1,
      }

      if (!isEdit) {
        payload.user_id = selectedUser.id
      } else {
        if (selectedUser?.id) payload.user_id = selectedUser.id
        if (form.name) payload.name = form.name
        if (form.username) payload.username = form.username
        if (form.ssn) payload.ssn = form.ssn
      }

      if (isEdit) {
        await updateStudent(id, payload)
        setAlert({ type: "success", message: "دانش‌آموز با موفقیت ویرایش شد." })
      } else {
        await createStudent(payload)
        setAlert({ type: "success", message: "دانش‌آموز جدید با موفقیت ایجاد شد." })
      }
      setTimeout(() => navigate(-1), 800)
    } catch (e) {
      console.error(e)
      if (e.response?.status === 422) {
        setErrors(e.response.data?.errors || {})
      }
    } finally {
      setLoading(false)
    }
  }

  const renderError = (field) => {
    const err = errors[field]
    if (!err) return null
    return (
      <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
        {Array.isArray(err) ? err[0] : err}
      </div>
    )
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="دانش‌آموزان"
          breadcrumbItem={isEdit ? "ویرایش دانش‌آموز" : "ایجاد دانش‌آموز"}
        />

        <Row>
          <Col lg="10">
            {alert && (
              <Alert color={alert.type} className="mb-3">
                {alert.message}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>

              {/* ── اطلاعات اصلی ── */}
              <Card className="mb-3">
                <CardHeader>
                  <h5 className="card-title mb-0">اطلاعات اصلی</h5>
                </CardHeader>
                <CardBody>
                  <Row className="g-3">

                    {/* جستجوی کاربر */}
                    <Col md="4">
                      <FormGroup>
                        <Label>
                          کاربر {!isEdit && <span className="text-danger">*</span>}
                        </Label>
                        <div ref={userSearchRef} className="position-relative">
                          <div className="input-group">
                            <Input
                              value={userSearch}
                              onChange={handleUserSearchChange}
                              onFocus={() => userSearchResults.length > 0 && setShowUserDropdown(true)}
                              placeholder="نام، نام کاربری یا کد ملی جستجو کنید..."
                              invalid={!!errors.user_id}
                            />
                            {userSearchLoading && (
                              <span className="input-group-text">
                                <Spinner size="sm" />
                              </span>
                            )}
                            {selectedUser && (
                              <Button
                                type="button"
                                color="light"
                                onClick={handleClearUser}
                                title="حذف انتخاب"
                              >
                                <i className="bx bx-x" />
                              </Button>
                            )}
                          </div>

                          {showUserDropdown && userSearchResults.length > 0 && (
                            <div
                              className="border rounded bg-white shadow-sm position-absolute w-100"
                              style={{ zIndex: 1050, maxHeight: 240, overflowY: "auto", top: "100%", left: 0 }}
                            >
                              {userSearchResults.map((u) => (
                                <div
                                  key={u.id}
                                  className="px-3 py-2"
                                  style={{ cursor: "pointer", borderBottom: "1px solid #f0f0f0" }}
                                  onMouseDown={() => handleSelectUser(u)}
                                  onMouseOver={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                                  onMouseOut={(e) => (e.currentTarget.style.background = "")}
                                >
                                  <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                                    {u.name || u.username}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                    {[u.username, u.ssn].filter(Boolean).join(" • ")}
                                    <span className="ms-2 text-secondary">#{u.id}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {selectedUser && (
                          <div className="mt-2">
                            <Badge color="success" className="px-2 py-1" style={{ fontSize: "0.82rem" }}>
                              <i className="bx bx-check me-1" />
                              {selectedUser.name || selectedUser.username || `کاربر #${selectedUser.id}`}
                              {selectedUser.ssn && <span className="ms-1 opacity-75">({selectedUser.ssn})</span>}
                            </Badge>
                          </div>
                        )}
                        {renderError("user_id")}
                      </FormGroup>
                    </Col>

                    {/* انتخاب مجموعه */}
                    <Col md="4">
                      <FormGroup>
                        <Label>
                          مجموعه(ها) <span className="text-danger">*</span>
                        </Label>

                        {schoolsLoading ? (
                          <div className="text-muted small py-2">
                            <Spinner size="sm" className="me-1" />
                            در حال بارگذاری مجموعه‌ها...
                          </div>
                        ) : managerAutoSchool ? (
                          <div
                            className="border rounded px-3 py-2"
                            style={{ background: "rgba(var(--bs-success-rgb), 0.06)", fontSize: "0.9rem" }}
                          >
                            <i className="bx bxs-school me-1 text-success" />
                            <strong>
                              {managerAutoSchool.name || managerAutoSchool.title || `مجموعه ${managerAutoSchool.id}`}
                            </strong>
                            <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                              خودکار انتخاب می‌شود
                            </div>
                          </div>
                        ) : (
                          <Input
                            type="select"
                            value={selectedSchoolId}
                            onChange={(e) => setSelectedSchoolId(e.target.value)}
                            invalid={!!errors.schoolIds}
                          >
                            <option value="">انتخاب مجموعه...</option>
                            {schoolsToShow.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name || s.title || `مجموعه ${s.id}`}
                                {s.code ? ` (${s.code})` : ""}
                              </option>
                            ))}
                          </Input>
                        )}
                        {renderError("schoolIds")}
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              {/* ── اطلاعات حساب کاربری (فقط ویرایش) ── */}
              {isEdit && (
                <Card className="mb-3">
                  <CardHeader>
                    <h5 className="card-title mb-0">اطلاعات حساب کاربری</h5>
                  </CardHeader>
                  <CardBody>
                    <Row className="g-3">
                      <Col md="4">
                        <FormGroup>
                          <Label for="name">نام کامل</Label>
                          <Input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="نام و نام خانوادگی"
                          />
                          {renderError("name")}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label for="username">نام کاربری</Label>
                          <Input
                            id="username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="username"
                          />
                          {renderError("username")}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label for="ssn">کد ملی</Label>
                          <Input
                            id="ssn"
                            name="ssn"
                            value={form.ssn}
                            onChange={handleChange}
                            placeholder="0012345678"
                          />
                          {renderError("ssn")}
                        </FormGroup>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              )}

              {/* ── اطلاعات تکمیلی ── */}
              <Card className="mb-3">
                <CardHeader>
                  <h5 className="card-title mb-0">اطلاعات تکمیلی</h5>
                </CardHeader>
                <CardBody>
                  <Row className="g-3">

                    <Col md="4">
                      <FormGroup>
                        <Label for="birthday">تاریخ تولد</Label>
                        <Input
                          id="birthday"
                          name="birthday"
                          value={form.birthday}
                          onChange={handleChange}
                          placeholder="مثلاً 1375-03-10"
                        />
                        {renderError("birthday")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="gpa">معدل</Label>
                        <Input
                          id="gpa"
                          name="gpa"
                          value={form.gpa}
                          onChange={handleChange}
                          placeholder="مثلاً 18.5"
                        />
                        <FormText>به‌صورت رشته وارد کنید</FormText>
                        {renderError("gpa")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="point">امتیاز</Label>
                        <Input
                          id="point"
                          name="point"
                          type="number"
                          min="0"
                          value={form.point}
                          onChange={handleChange}
                          placeholder="0"
                        />
                        {renderError("point")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="work_shift_id">شیفت کاری</Label>
                        <Input
                          id="work_shift_id"
                          name="work_shift_id"
                          type="number"
                          min="1"
                          value={form.work_shift_id}
                          onChange={handleChange}
                        />
                        {renderError("work_shift_id")}
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
                          placeholder="مثلاً صبح / عصر"
                        />
                        {renderError("shift")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="phone_2">شماره تماس ۲</Label>
                        <Input
                          id="phone_2"
                          name="phone_2"
                          value={form.phone_2}
                          onChange={handleChange}
                          placeholder="09..."
                        />
                        {renderError("phone_2")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="phone_3">شماره تماس ۳</Label>
                        <Input
                          id="phone_3"
                          name="phone_3"
                          value={form.phone_3}
                          onChange={handleChange}
                          placeholder="09..."
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
                          placeholder="09..."
                        />
                        {renderError("emergency_phone")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="voip_phone">شماره VoIP</Label>
                        <Input
                          id="voip_phone"
                          name="voip_phone"
                          value={form.voip_phone}
                          onChange={handleChange}
                        />
                        {renderError("voip_phone")}
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
                        />
                        {renderError("village")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="institute_type">نوع موسسه</Label>
                        <Input
                          id="institute_type"
                          name="institute_type"
                          value={form.institute_type}
                          onChange={handleChange}
                        />
                        {renderError("institute_type")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="institute_name">نام موسسه</Label>
                        <Input
                          id="institute_name"
                          name="institute_name"
                          value={form.institute_name}
                          onChange={handleChange}
                        />
                        {renderError("institute_name")}
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
                          placeholder="مثلاً پدر / مادر"
                        />
                        {renderError("relationship")}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label for="group_id">شناسه گروه</Label>
                        <Input
                          id="group_id"
                          name="group_id"
                          value={form.group_id}
                          onChange={handleChange}
                        />
                        {renderError("group_id")}
                      </FormGroup>
                    </Col>

                  </Row>
                </CardBody>
              </Card>

              {/* ── دکمه‌های عملیات ── */}
              <div className="d-flex justify-content-end gap-2 mb-4">
                <Button
                  type="button"
                  color="secondary"
                  outline
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  انصراف
                </Button>
                <Button type="submit" color="primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-1" />
                      در حال ذخیره...
                    </>
                  ) : isEdit ? (
                    "ذخیره تغییرات"
                  ) : (
                    "ایجاد دانش‌آموز"
                  )}
                </Button>
              </div>

            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default StudentForm
