// src/pages/Schools/SchoolForm.jsx
import React, { useCallback, useEffect, useState } from "react"
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
  InputGroup,
  Alert,
  FormFeedback,
} from "reactstrap"
import { useNavigate, useParams } from "react-router-dom"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import {
  createSchool,
  getSchool,
  updateSchool,
} from "../../services/schoolService.jsx"
import { getManagers } from "../../services/managerService.jsx"

const emptyToNull = (value) => {
  if (typeof value === "string" && value.trim() === "") return null
  return value
}

const toOptionalNumber = (value) => {
  if (value === "" || value === null || value === undefined) return undefined
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

const managerLabel = (manager) =>
  manager?.user?.name ||
  manager?.user?.username ||
  manager?.code ||
  `مدیر #${manager?.id}`

const normalizeErrorMessages = (error) => {
  const message = error?.response?.data?.message
  if (Array.isArray(message)) return message
  if (typeof message === "string") return [message]
  return []
}

const SchoolForm = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  document.title = (isEdit ? "ویرایش مجموعه" : "ایجاد مجموعه") + " | داشبورد آیسوق"

  const [form, setForm] = useState({
    name: "",
    code: "",
    phone: "",
    address: "",
    manager_id: "",
    status: "",
  })
  const [initialForm, setInitialForm] = useState(null)
  const [managers, setManagers] = useState([])
  const [managerSearch, setManagerSearch] = useState("")
  const [managersLoading, setManagersLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchManagers = useCallback(async (search = "") => {
    setManagersLoading(true)
    try {
      const res = await getManagers({
        page: 1,
        limit: 20,
        search,
        sortBy: "id",
        sortOrder: "DESC",
      })
      setManagers(res.items || [])
    } catch (e) {
      console.error("خطا در دریافت مدیران", e)
      setManagers([])
    } finally {
      setManagersLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchManagers()
  }, [fetchManagers])

  useEffect(() => {
    if (!isEdit) return

    ;(async () => {
      setLoading(true)
      try {
        const data = await getSchool(id)
        const school = data?.data || data

        const nextForm = {
          name: school?.name || "",
          code: school?.code != null ? String(school.code) : "",
          phone: school?.phone || "",
          address: school?.address || school?.location || "",
          manager_id:
            school?.manager_id ??
            school?.managerId ??
            school?.manager?.id ??
            "",
          status: school?.status ?? "",
        }

        setForm(nextForm)
        setInitialForm(nextForm)

        if (school?.manager?.id) {
          setManagers((prev) => {
            if (prev.some((manager) => Number(manager.id) === Number(school.manager.id))) {
              return prev
            }
            return [school.manager, ...prev]
          })
        }
      } catch (e) {
        console.error("خطا در دریافت مجموعه", e)
        setAlert({ type: "danger", message: "خطا در دریافت اطلاعات مجموعه" })
      } finally {
        setLoading(false)
      }
    })()
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const buildPayload = () => {
    const payload = {
      name: String(form.name || "").trim(),
      code: String(form.code || "").trim(),
      manager_id: Number(form.manager_id),
      phone: emptyToNull(form.phone),
      address: emptyToNull(form.address),
    }

    const status = toOptionalNumber(form.status)
    if (status !== undefined) {
      payload.status = status
    }

    if (!isEdit || !initialForm) return payload

    const changedPayload = {}
    Object.entries(payload).forEach(([key, value]) => {
      const initialValue = key === "manager_id" ? Number(initialForm[key]) : emptyToNull(initialForm[key])
      if (value !== initialValue) {
        changedPayload[key] = value
      }
    })

    return changedPayload
  }

  const validate = (payload) => {
    const errs = {}
    if (!String(form.name || "").trim()) errs.name = ["نام مجموعه الزامی است"]
    if (!String(form.code || "").trim()) errs.code = ["کد مجموعه الزامی است"]
    if (String(form.name || "").trim().length > 255) {
      errs.name = ["نام مجموعه نباید بیشتر از ۲۵۵ کاراکتر باشد"]
    }
    if (String(form.code || "").trim().length > 255) {
      errs.code = ["کد مجموعه نباید بیشتر از ۲۵۵ کاراکتر باشد"]
    }
    if (!Number.isInteger(payload.manager_id) || payload.manager_id < 1) {
      errs.manager_id = ["مدیر مجموعه را از لیست انتخاب کنید"]
    }
    return errs
  }

  const handleManagerSearch = (e) => {
    e.preventDefault()
    fetchManagers(managerSearch.trim())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlert(null)

    const payload = buildPayload()
    const errs = validate({ ...payload, manager_id: Number(form.manager_id) })
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})

    setLoading(true)
    try {
      if (isEdit) {
        await updateSchool(id, payload)
        setAlert({ type: "success", message: "مجموعه با موفقیت ویرایش شد." })
      } else {
        await createSchool(payload)
        setAlert({ type: "success", message: "مجموعه جدید با موفقیت ایجاد شد." })
      }

      setTimeout(() => navigate(-1), 700)
    } catch (e) {
      console.error("خطا در ذخیره مجموعه", e)
      if (e.response?.status === 403) {
        setAlert({ type: "danger", message: "شما دسترسی انجام این عملیات را ندارید." })
      } else if (e.response?.status === 422) {
        const messages = normalizeErrorMessages(e)
        setErrors(e.response.data.errors || {})
        if (messages.length) {
          setAlert({ type: "danger", message: messages.join("، ") })
        }
      } else {
        setAlert({ type: "danger", message: "خطایی رخ داد. لطفاً دوباره تلاش کنید." })
      }
    } finally {
      setLoading(false)
    }
  }

  const renderError = (field) =>
    errors[field] ? (
      <FormFeedback className="d-block">{errors[field][0]}</FormFeedback>
    ) : null

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
              <CardHeader className="d-flex align-items-center justify-content-between">
                <h4 className="card-title mb-0">
                  {isEdit ? "ویرایش مجموعه" : "ایجاد مجموعه جدید"}
                </h4>
                <Button color="secondary" outline onClick={() => navigate("/schools")}>
                  <i className="bx bx-arrow-back me-1"></i>
                  بازگشت به لیست
                </Button>
              </CardHeader>
              <CardBody>
                {alert && <Alert color={alert.type}>{alert.message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md="6">
                      <FormGroup>
                        <Label for="name">
                          نام مجموعه <span className="text-danger">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="مثلاً دبیرستان شماره ۱"
                          invalid={!!errors.name}
                        />
                        {renderError("name")}
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="code">
                          کد مجموعه <span className="text-danger">*</span>
                        </Label>
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
                        <Label for="manager_id">
                          مدیر مجموعه <span className="text-danger">*</span>
                        </Label>
                        <InputGroup className="mb-2">
                          <Input
                            value={managerSearch}
                            onChange={(e) => setManagerSearch(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                fetchManagers(managerSearch.trim())
                              }
                            }}
                            placeholder="جستجوی نام، نام کاربری یا کد مدیر"
                            disabled={managersLoading}
                          />
                          <Button
                            type="button"
                            color="light"
                            disabled={managersLoading}
                            onClick={handleManagerSearch}
                          >
                            جستجو
                          </Button>
                        </InputGroup>
                        <Input
                          id="manager_id"
                          name="manager_id"
                          type="select"
                          value={form.manager_id}
                          onChange={handleChange}
                          invalid={!!errors.manager_id}
                          disabled={managersLoading}
                        >
                          <option value="">
                            {managersLoading ? "در حال دریافت مدیران..." : "انتخاب مدیر..."}
                          </option>
                          {managers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {managerLabel(m)}
                            </option>
                          ))}
                        </Input>
                        {renderError("manager_id")}
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
                        <Label for="status">وضعیت</Label>
                        <Input
                          id="status"
                          name="status"
                          type="select"
                          value={form.status}
                          onChange={handleChange}
                          invalid={!!errors.status}
                          style={{ width: "120px" }}
                        >
                          <option value="">بدون تغییر</option>
                          <option value="1">فعال</option>
                          <option value="0">غیرفعال</option>
                        </Input>
                        {renderError("status")}
                      </FormGroup>
                    </Col>

                    <Col md="12">
                      <FormGroup>
                        <Label for="address">آدرس</Label>
                        <Input
                          id="address"
                          name="address"
                          type="textarea"
                          rows="3"
                          value={form.address}
                          onChange={handleChange}
                          placeholder="آدرس کامل مجموعه (شهر، استان، خیابان ...)"
                          invalid={!!errors.address}
                        />
                        {renderError("address")}
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
  )
}

export default SchoolForm
