// src/pages/Schools/SchoolForm.jsx
import React, { useEffect, useState } from "react"
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
} from "reactstrap"
import { useNavigate, useParams } from "react-router-dom"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import {
  createSchool,
  getSchool,
  updateSchool,
} from "../../services/schoolService.jsx"
import { getManagers } from "../../services/managerService.jsx"

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
  })
  const [managers, setManagers] = useState([])
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getManagers({ limit: 200 })
      .then((res) => setManagers(res.items || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return

    ;(async () => {
      setLoading(true)
      try {
        const data = await getSchool(id)
        const school = data?.data || data

        setForm({
          name: school?.name || "",
          code: school?.code || "",
          phone: school?.phone || "",
          address: school?.address || school?.location || "",
          manager_id:
            school?.manager_id ??
            school?.managerId ??
            school?.manager?.id ??
            "",
        })
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

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = ["نام مجموعه الزامی است"]
    if (!form.code.trim()) errs.code = ["کد مجموعه الزامی است"]
    if (!form.manager_id || Number(form.manager_id) < 1)
      errs.manager_id = ["شناسه مدیر مجموعه الزامی است"]
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlert(null)

    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})

    const payload = {
      name: form.name,
      code: form.code,
      manager_id: Number(form.manager_id),
      phone: form.phone || undefined,
      address: form.address || undefined,
    }

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
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors || {})
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
                        {managers.length > 0 ? (
                          <Input
                            id="manager_id"
                            name="manager_id"
                            type="select"
                            value={form.manager_id}
                            onChange={handleChange}
                            invalid={!!errors.manager_id}
                          >
                            <option value="">انتخاب مدیر...</option>
                            {managers.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.user?.name || m.name || `مدیر #${m.id}`}
                              </option>
                            ))}
                          </Input>
                        ) : (
                          <Input
                            id="manager_id"
                            name="manager_id"
                            type="number"
                            min="1"
                            value={form.manager_id}
                            onChange={handleChange}
                            placeholder="شناسه عددی مدیر (مثلاً ۳)"
                            invalid={!!errors.manager_id}
                          />
                        )}
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
