// src/pages/Students/StudentForm.jsx
import React, { useEffect, useState, useRef, useMemo } from "react"
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
  Spinner,
} from "reactstrap"
import { useNavigate, useParams } from "react-router-dom"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import {
  getStudent,
  createStudent,
  updateStudent,
  getStudentRegistrationAvailability,
  getStudentContactSubjects,
  getStudentContacts,
  createStudentContact,
  updateStudentContact,
  setDefaultStudentContact,
  deleteStudentContact,
} from "../../services/studentService.jsx"
import { createUser } from "../../services/userService.jsx"
import { getSchools } from "../../services/schoolService.jsx"
import { useAuth } from "../../context/AuthContext.jsx"

const toNum = (v) => {
  if (v === "" || v == null) return undefined
  const n = Number(v)
  return Number.isNaN(n) ? undefined : n
}

const normalizeDigits = (value) => String(value ?? "")
  .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 1776))
  .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 1632))

const cleanOptional = (value) => {
  const cleaned = typeof value === "string" ? value.trim() : value
  return cleaned === "" || cleaned == null ? undefined : cleaned
}

const normalizeContactPhone = (value) => normalizeDigits(value).replace(/\D/g, "")
const newContactRow = () => ({
  localId: `contact-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  id: null,
  phoneNumber: "",
  subjectId: "",
  isDefault: false,
  status: "pending",
  dirty: true,
})

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
    password: "",
    phone: "",
    ssn: "",
    email: "",
  })
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)
  const [createdUserId, setCreatedUserId] = useState(null)
  const initialFormRef = useRef(null)
  const availabilityControllerRef = useRef(null)
  const [availability, setAvailability] = useState({ phone: null, username: null })
  const [availabilityLoading, setAvailabilityLoading] = useState({ phone: false, username: false })
  const [restoreConfirmed, setRestoreConfirmed] = useState(false)
  const [createdStudentId, setCreatedStudentId] = useState(null)
  const [contactSubjects, setContactSubjects] = useState([])
  const [contacts, setContacts] = useState([])
  const [contactsLoading, setContactsLoading] = useState(false)


  // Schools
  const [schools, setSchools] = useState([])
  const [schoolsLoading, setSchoolsLoading] = useState(false)
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([])

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

  useEffect(() => {
    let active = true
    getStudentContactSubjects()
      .then((items) => { if (active) setContactSubjects(items) })
      .catch(() => { if (active) setContactSubjects([]) })
    return () => { active = false }
  }, [])

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
      setSelectedSchoolIds([String(managerAutoSchool.id)])
    }
  }, [managerAutoSchool, isEdit])

  // Load student data in edit mode
  useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      try {
        const student = await getStudent(id)
        const studentSchoolIds = (student?.schools || []).map((school) => String(school.id))
        setSelectedSchoolIds(studentSchoolIds)
        setForm((prev) => ({
          ...prev,
          birthday: student.birthday || "",
          point: student.point ?? "",
          phone_2: student.phone_2 ?? "",
          phone_3: student.phone_3 ?? "",
          emergency_phone: student.emergency_phone ?? "",
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
          phone: student.user?.phone || student.phone || "",
          ssn: student.user?.ssn || student.ssn || "",
          schoolIds: studentSchoolIds.map(Number).sort((a, b) => a - b),
        }))
        initialFormRef.current = {
          ...student,
          name: student.user?.name || student.name || "",
          username: student.user?.username || student.username || "",
          ssn: student.user?.ssn || student.ssn || "",
        }
        setContactsLoading(true)
        try {
          const items = await getStudentContacts(id)
          setContacts(items.map((contact) => ({
            ...contact,
            localId: `contact-${contact.id}`,
            subjectId: String(contact.subjectId ?? ""),
            phoneNumber: contact.phoneNumber || "",
            status: "saved",
            dirty: false,
          })))
        } finally {
          setContactsLoading(false)
        }
      } catch (e) {
        console.error(e)
        setAlert({ type: "danger", message: "خطا در دریافت اطلاعات دانش‌آموز" })
      }
    })()
  }, [id, isEdit])

  useEffect(() => {
    if (isEdit || createdUserId) return undefined

    const username = form.username.trim()
    const phone = normalizeDigits(form.phone).trim()
    const validUsername = /^[A-Za-z][A-Za-z0-9._]{2,}$/.test(username)
    const validPhone = !phone || /^09\d{9}$/.test(phone)

    if (!validUsername && !(phone && validPhone)) {
      setAvailability({ phone: null, username: null })
      setAvailabilityLoading({ phone: false, username: false })
      return undefined
    }

    const timer = window.setTimeout(async () => {
      availabilityControllerRef.current?.abort()
      const controller = new AbortController()
      availabilityControllerRef.current = controller
      setAvailabilityLoading({ phone: !!phone && validPhone, username: validUsername })
      try {
        const result = await getStudentRegistrationAvailability({
          ...(phone && validPhone ? { phone } : {}),
          ...(validUsername ? { username } : {}),
          signal: controller.signal,
        })
        setAvailability((prev) => ({
          phone: phone && validPhone ? result.phone ?? null : prev.phone,
          username: validUsername ? result.username ?? null : prev.username,
        }))
        setRestoreConfirmed(false)
      } catch (error) {
        if (error?.code !== "ERR_CANCELED") {
          setAvailability({ phone: null, username: null })
        }
      } finally {
        if (availabilityControllerRef.current === controller) {
          setAvailabilityLoading({ phone: false, username: false })
        }
      }
    }, 500)

    return () => window.clearTimeout(timer)
  }, [createdUserId, form.phone, form.username, isEdit])

  useEffect(() => () => availabilityControllerRef.current?.abort(), [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === "phone" || name === "username") {
      setAvailability((prev) => ({ ...prev, [name]: null }))
      setRestoreConfirmed(false)
    }
  }

  const handleContactChange = (localId, field, value) => {
    setContacts((prev) => prev.map((contact) => {
      if (contact.localId !== localId) {
        return field === "isDefault" && value ? { ...contact, isDefault: false } : contact
      }
      return { ...contact, [field]: value, dirty: true, status: "pending" }
    }))
  }

  const handleDefaultContactChange = (localId) => {
    setContacts((prev) => prev.map((contact) => ({
      ...contact,
      isDefault: contact.localId === localId,
      dirty: contact.localId === localId ? true : contact.dirty,
      status: contact.localId === localId ? "pending" : contact.status,
    })))
  }

  const handleRemoveContact = async (contact) => {
    if (contact.id && isEdit) {
      if (!window.confirm("آیا از حذف این شماره تماس مطمئن هستید؟")) return
      setLoading(true)
      try {
        await deleteStudentContact(id, contact.id)
        setContacts((prev) => prev.filter((item) => item.localId !== contact.localId))
      } finally {
        setLoading(false)
      }
      return
    }
    setContacts((prev) => prev.filter((item) => item.localId !== contact.localId))
  }

  const saveContacts = async (studentId) => {
    const working = contacts.map((contact) => ({ ...contact }))
    let failedCount = 0

    for (let index = 0; index < working.length; index += 1) {
      const contact = working[index]
      if (!normalizeContactPhone(contact.phoneNumber) && !contact.subjectId && !contact.isDefault) continue
      if (contact.status === "saved" && !contact.dirty) continue
      const payload = {
        phoneNumber: normalizeContactPhone(contact.phoneNumber),
        subjectId: Number(contact.subjectId),
      }
      try {
        let saved
        if (contact.id) {
          saved = await updateStudentContact(studentId, contact.id, payload)
        } else {
          saved = await createStudentContact(studentId, { ...payload, setAsDefault: !!contact.isDefault })
        }
        const contactId = saved?.id ?? contact.id
        if (contact.isDefault && contactId && contact.id) {
          await setDefaultStudentContact(studentId, contactId)
        }
        working[index] = { ...contact, ...saved, id: contactId, phoneNumber: payload.phoneNumber, subjectId: String(payload.subjectId), status: "saved", dirty: false }
      } catch (error) {
        failedCount += 1
        working[index] = { ...contact, status: "failed", error: error?.response?.data?.message || "ثبت این شماره ناموفق بود" }
      }
    }

    setContacts(working)
    return failedCount
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setAlert(null)

    const newErrors = {}

    const cleanedName = form.name.trim()
    const cleanedUsername = form.username.trim()
    const phone = normalizeDigits(form.phone).trim()
    const ssn = normalizeDigits(form.ssn).trim()

    contacts.forEach((contact) => {
      const phoneNumber = normalizeContactPhone(contact.phoneNumber)
      const hasPhone = !!phoneNumber
      const hasSubject = !!contact.subjectId
      if (hasPhone !== hasSubject || (contact.isDefault && (!hasPhone || !hasSubject))) {
        newErrors[`contact_${contact.localId}`] = ["نوع تماس و شماره باید هر دو تکمیل شوند"]
      }
    })

    if (!isEdit) {
      if (cleanedName.length < 2 || cleanedName.length > 255) newErrors.name = ["نام باید بین ۲ تا ۲۵۵ کاراکتر باشد"]
      if (!/^[A-Za-z][A-Za-z0-9._]{2,}$/.test(cleanedUsername)) newErrors.username = ["نام کاربری باید با حرف انگلیسی شروع شود و حداقل ۳ کاراکتر باشد"]
      if (form.password.trim().length < 6) newErrors.password = ["رمز عبور باید حداقل ۶ کاراکتر باشد"]
      if (phone && !/^09\d{9}$/.test(phone)) newErrors.phone = ["شماره موبایل باید ۱۱ رقم و با 09 شروع شود"]
      if (ssn && !/^\d{10}$/.test(ssn)) newErrors.ssn = ["کد ملی باید دقیقاً ۱۰ رقم باشد"]
      if (form.email.trim() && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || form.email.trim().length > 255)) newErrors.email = ["ایمیل معتبر وارد کنید"]
      if (form.point !== "" && (!Number.isInteger(Number(form.point)) || Number(form.point) < 0)) newErrors.point = ["امتیاز باید عدد صحیح نامنفی باشد"]
      if (!Number.isInteger(Number(form.work_shift_id)) || Number(form.work_shift_id) < 1) newErrors.work_shift_id = ["شناسه شیفت کاری باید عدد صحیح مثبت باشد"]
    }

    const effectiveSchoolIds = needsSchoolSelect
      ? selectedSchoolIds
      : managerAutoSchool
      ? [String(managerAutoSchool.id)]
      : []

    if (effectiveSchoolIds.length === 0) {
      newErrors.schoolIds = ["انتخاب مجموعه الزامی است"]
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const studentPayload = {
        schoolIds: effectiveSchoolIds.map(Number),
        birthday: cleanOptional(form.birthday),
        point: toNum(form.point),
        phone_2: cleanOptional(form.phone_2), phone_3: cleanOptional(form.phone_3),
        emergency_phone: cleanOptional(form.emergency_phone),
        shift: cleanOptional(form.shift), province: cleanOptional(form.province), city: cleanOptional(form.city),
        region: cleanOptional(form.region), institute_type: cleanOptional(form.institute_type),
        institute_name: cleanOptional(form.institute_name), gpa: cleanOptional(form.gpa),
        village: cleanOptional(form.village), religion: cleanOptional(form.religion),
        relationship: cleanOptional(form.relationship), group_id: cleanOptional(form.group_id),
        work_shift_id: toNum(form.work_shift_id) ?? 1,
      }

      if (!isEdit) {
        let userId = createdUserId
        if (!userId) {
          const userResponse = await createUser({
            name: cleanedName,
            username: cleanedUsername,
            password: form.password.trim(),
            ...(phone ? { phone } : {}),
            ...(ssn ? { ssn } : {}),
            ...(form.email.trim() ? { email: form.email.trim() } : {}),
          })
          userId = userResponse?.data?.id ?? userResponse?.id
          if (!userId) throw new Error("شناسه کاربر در پاسخ سرور موجود نیست")
          setCreatedUserId(userId)
        }
        let studentId = createdStudentId
        if (!studentId) {
          studentPayload.user_id = userId
          const studentResponse = await createStudent(studentPayload)
          studentId = studentResponse?.data?.id ?? studentResponse?.id
          if (!studentId) throw new Error("شناسه دانش‌آموز در پاسخ سرور موجود نیست")
          setCreatedStudentId(studentId)
        }
        const failedContacts = await saveContacts(studentId)
        if (failedContacts > 0) {
          setAlert({ type: "warning", message: `${failedContacts} شماره تماس ثبت نشد. فقط همان ردیف‌ها در تلاش بعدی دوباره ارسال می‌شوند.` })
          return
        }
        setAlert({ type: "success", message: "دانش‌آموز و شماره‌های تماس با موفقیت ایجاد شدند." })
      } else {
        const original = initialFormRef.current || {}
        const payload = Object.fromEntries(Object.entries(studentPayload).filter(([key, value]) => {
          if (key === "schoolIds") {
            const current = [...value].sort((a, b) => a - b)
            return JSON.stringify(current) !== JSON.stringify(original.schoolIds || [])
          }
          return String(value ?? "") !== String(original[key] ?? "")
        }))
        if (cleanedName !== String(original.name ?? "").trim()) payload.name = cleanedName
        if (cleanedUsername !== String(original.username ?? "").trim()) payload.username = cleanedUsername
        if (ssn !== normalizeDigits(original.ssn).trim()) payload.ssn = ssn || null
        await updateStudent(id, payload)
        const failedContacts = await saveContacts(id)
        if (failedContacts > 0) {
          setAlert({ type: "warning", message: `${failedContacts} شماره تماس ذخیره نشد. اطلاعات دانش‌آموز ذخیره شده و می‌توانید دوباره تلاش کنید.` })
          return
        }
        setAlert({ type: "success", message: "دانش‌آموز و شماره‌های تماس با موفقیت ویرایش شدند." })
      }
      setTimeout(() => navigate(-1), 800)
    } catch (e) {
      console.error(e)
      const serverErrors = e.response?.data?.errors
      if (serverErrors) setErrors(serverErrors)
      if (e.response?.status === 409 && /phone|موبایل|شماره/i.test(JSON.stringify(e.response?.data || {}))) {
        setErrors((prev) => ({ ...prev, phone: [e.response?.data?.message || "این شماره موبایل قبلاً ثبت شده است"] }))
      }
      if (createdStudentId) {
        setAlert({ type: "warning", message: "دانش‌آموز ساخته شده است؛ در تلاش بعدی فقط شماره‌های ناموفق دوباره ارسال می‌شوند." })
      } else if (createdUserId || (!isEdit && e.response?.config?.url?.includes("/students"))) {
        setAlert({ type: "warning", message: "حساب کاربری ساخته شده است؛ اطلاعات فرم حفظ شد. برای تلاش دوباره ثبت دانش‌آموز را بزنید." })
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

  const availabilityItems = [availability.phone, availability.username].filter(Boolean)
  const archivedAvailability = availabilityItems.find((item) =>
    item?.available === false && (item?.existingUser?.isArchived || item?.existingUser?.studentIsArchived)
  )
  const hasActiveConflict = availabilityItems.some((item) =>
    item?.available === false && !item?.existingUser?.isArchived && !item?.existingUser?.studentIsArchived
  )
  const phoneValue = normalizeDigits(form.phone).trim()
  const usernameIsValid = /^[A-Za-z][A-Za-z0-9._]{2,}$/.test(form.username.trim())
  const phoneIsValid = !phoneValue || /^09\d{9}$/.test(phoneValue)
  const availabilityPending = availabilityLoading.phone || availabilityLoading.username
  const availabilityChecked = !!availability.username && (!phoneValue || !!availability.phone)
  const registrationBlocked = !isEdit && !createdUserId && (
    availabilityPending || !usernameIsValid || !phoneIsValid || !availabilityChecked ||
    hasActiveConflict || (!!archivedAvailability && !restoreConfirmed)
  )

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
                            multiple
                            size="5"
                            value={selectedSchoolIds}
                            onChange={(e) => setSelectedSchoolIds(Array.from(e.target.selectedOptions, (option) => option.value))}
                            invalid={!!errors.schoolIds}
                          >
                            {schoolsToShow.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name || s.title || `مجموعه ${s.id}`}
                                {s.code ? ` (${s.code})` : ""}
                              </option>
                            ))}
                          </Input>
                        )}
                        {needsSchoolSelect && <FormText>حداقل یک مجموعه را انتخاب کنید؛ برای انتخاب چند مورد از Ctrl یا ⌘ استفاده کنید.</FormText>}
                        {renderError("schoolIds")}
                      </FormGroup>
                    </Col>
                  </Row>
                  {!isAdminLike && !schoolsLoading && schools.length === 0 && (
                    <Alert color="warning" className="mt-3 mb-0">هیچ مدرسه‌ای به حساب شما اختصاص داده نشده است؛ امکان ثبت دانش‌آموز وجود ندارد.</Alert>
                  )}
                </CardBody>
              </Card>

              {!isEdit && (
                <Card className="mb-3">
                  <CardHeader><h5 className="card-title mb-0">اطلاعات حساب کاربری</h5></CardHeader>
                  <CardBody>
                    {createdUserId && <Alert color="info">حساب کاربری با شناسه {createdUserId} ساخته شده و در تلاش مجدد دوباره ساخته نمی‌شود.</Alert>}
                    <Alert color="primary" className="py-2">
                      <strong>نام کاربری و شماره موبایل اصلی</strong> شناسه‌های مهم حساب کاربر هستند. نام کاربری الزامی و شماره موبایل اصلی در صورت ورود باید یکتا باشد.
                    </Alert>
                    <Row className="g-3">
                      {[
                        { name: "username", label: "نام کاربری اصلی", type: "text", required: true, important: true, help: "شناسه یکتای ورود؛ با حرف انگلیسی شروع شود." },
                        { name: "phone", label: "شماره موبایل اصلی", type: "tel", important: true, help: "شماره اصلی حساب و یکتا در کل کاربران؛ مانند 09121234567." },
                        { name: "name", label: "نام کامل", type: "text", required: true },
                        { name: "password", label: "رمز عبور", type: "password", required: true },
                        { name: "ssn", label: "کد ملی", type: "text" },
                        { name: "email", label: "ایمیل", type: "email" },
                      ].map(({ name, label, type, required, important, help }) => (
                        <Col md={important ? "6" : "4"} key={name}>
                          <FormGroup className={important ? "border border-primary rounded p-3 h-100 bg-light" : ""}>
                          <Label for={name} className={important ? "fw-bold text-primary" : ""}>{label} {required && <span className="text-danger">*</span>}</Label>
                          <div className="position-relative">
                            <Input
                              id={name}
                              name={name}
                              type={type}
                              value={form[name]}
                              onChange={handleChange}
                              disabled={!!createdUserId}
                              invalid={!!errors[name] || ((name === "phone" || name === "username") && availability[name]?.available === false)}
                              valid={(name === "phone" || name === "username") && availability[name]?.available === true}
                            />
                            {(name === "phone" || name === "username") && availabilityLoading[name] && (
                              <Spinner size="sm" className="position-absolute top-50 end-0 translate-middle-y me-2" />
                            )}
                          </div>
                          {help && <FormText className="d-block">{help}</FormText>}
                          {renderError(name)}
                          {(name === "phone" || name === "username") && availability[name]?.available === true && (
                            <FormText color="success">این {name === "phone" ? "شماره" : "نام کاربری"} قابل استفاده است.</FormText>
                          )}
                          {(name === "phone" || name === "username") && availability[name]?.available === false && availability[name]?.existingUser && (
                            <div className="border rounded bg-light p-2 mt-2 small">
                              <div className="fw-semibold">{availability[name].existingUser.name || "کاربر موجود"}</div>
                              <div>{availability[name].existingUser.username} {availability[name].existingUser.phone ? `• ${availability[name].existingUser.phone}` : ""}</div>
                              {(availability[name].existingUser.isArchived || availability[name].existingUser.studentIsArchived) ? (
                                <span className="text-warning">کاربر یا دانش‌آموز بایگانی شده است.</span>
                              ) : (
                                <span className="text-danger">این رکورد فعال است و امکان ثبت مجدد ندارد.</span>
                              )}
                            </div>
                          )}
                        </FormGroup></Col>
                      ))}
                    </Row>
                    {archivedAvailability && !createdUserId && (
                      <Alert color="warning" className="mt-3 mb-0">
                        <div className="mb-2">این حساب بایگانی شده است. برای بازیابی حساب و اتصال دانش‌آموز به مجموعه انتخاب‌شده تأیید کنید.</div>
                        <Button
                          type="button"
                          color="warning"
                          size="sm"
                          onClick={() => {
                            if (window.confirm("حساب بایگانی‌شده بازیابی و به مجموعه انتخاب‌شده متصل شود؟")) setRestoreConfirmed(true)
                          }}
                        >
                          {restoreConfirmed ? "بازیابی تأیید شد" : "بازیابی و اتصال به مجموعه"}
                        </Button>
                      </Alert>
                    )}
                  </CardBody>
                </Card>
              )}

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
                        <FormGroup className="border border-primary rounded p-3">
                          <Label for="phone" className="fw-bold text-primary">شماره موبایل اصلی</Label>
                          <Input id="phone" value={form.phone} readOnly disabled />
                          <FormText>شماره اصلی حساب است. قرارداد فعلی PATCH دانش‌آموز اجازه تغییر آن را نمی‌دهد.</FormText>
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

              <Card className="mb-3">
                <CardHeader className="d-flex align-items-center justify-content-between">
                  <h5 className="card-title mb-0">شماره‌های تماس</h5>
                  <Button type="button" color="primary" outline size="sm" onClick={() => setContacts((prev) => [...prev, newContactRow()])}>
                    <i className="bx bx-plus me-1" /> افزودن شماره
                  </Button>
                </CardHeader>
                <CardBody>
                  {contactsLoading ? (
                    <div className="text-muted"><Spinner size="sm" className="me-1" /> در حال دریافت شماره‌ها...</div>
                  ) : contacts.length === 0 ? (
                    <div className="text-muted">شماره تماس اضافه‌ای ثبت نشده است.</div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {contacts.map((contact) => (
                        <div key={contact.localId} className="border rounded p-3">
                          <Row className="g-2 align-items-end">
                            <Col md="4">
                              <Label>نوع تماس</Label>
                              <Input type="select" value={contact.subjectId} onChange={(e) => handleContactChange(contact.localId, "subjectId", e.target.value)} invalid={!!errors[`contact_${contact.localId}`]}>
                                <option value="">انتخاب نوع تماس...</option>
                                {contactSubjects.map((subject) => (
                                  <option key={subject.id} value={subject.id}>{subject.subject}</option>
                                ))}
                              </Input>
                            </Col>
                            <Col md="4">
                              <Label>شماره تماس</Label>
                              <Input
                                value={contact.phoneNumber}
                                onChange={(e) => handleContactChange(contact.localId, "phoneNumber", e.target.value)}
                                onBlur={(e) => handleContactChange(contact.localId, "phoneNumber", normalizeContactPhone(e.target.value))}
                                placeholder="مثلاً 09121234567"
                                invalid={!!errors[`contact_${contact.localId}`]}
                              />
                            </Col>
                            <Col md="2">
                              <button
                                type="button"
                                role="radio"
                                aria-checked={contact.isDefault === true}
                                className="btn btn-link d-flex align-items-center gap-2 mb-1 p-0 text-body text-decoration-none"
                                onClick={() => handleDefaultContactChange(contact.localId)}
                                disabled={loading}
                              >
                                <span
                                  aria-hidden="true"
                                  className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                  style={{
                                    width: 22,
                                    height: 22,
                                    border: `2px solid ${contact.isDefault === true ? "var(--bs-primary)" : "var(--bs-border-color)"}`,
                                  }}
                                >
                                  {contact.isDefault === true && (
                                    <span className="rounded-circle bg-primary" style={{ width: 12, height: 12 }} />
                                  )}
                                </span>
                                <span>شماره پیش‌فرض</span>
                              </button>
                            </Col>
                            <Col md="2" className="d-flex align-items-center gap-2">
                              {contact.isDefault && <span className="badge bg-success">پیش‌فرض</span>}
                              <Button type="button" color="danger" outline size="sm" onClick={() => handleRemoveContact(contact)} disabled={loading}>حذف</Button>
                            </Col>
                          </Row>
                          {renderError(`contact_${contact.localId}`)}
                          {contact.status === "failed" && <div className="text-danger small mt-2">{contact.error}</div>}
                          {contact.status === "saved" && !contact.dirty && <div className="text-success small mt-2">ذخیره شده</div>}
                        </div>
                      ))}
                    </div>
                  )}
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
                <Button type="submit" color="primary" disabled={loading || registrationBlocked || (!isAdminLike && !schoolsLoading && schools.length === 0)}>
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-1" />
                      در حال ذخیره...
                    </>
                  ) : isEdit ? (
                    "ذخیره تغییرات"
                  ) : createdStudentId ? (
                    "تلاش مجدد شماره‌های ناموفق"
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
