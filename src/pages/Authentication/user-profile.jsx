import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Input,
  FormFeedback,
  Form,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Badge,
  Alert,
} from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";

import Breadcrumb from "../../components/Common/Breadcrumb";
import { useAuth } from "../../context/AuthContext.jsx";
import { getProfile, updateProfile, changePassword } from "../../services/profileService.jsx";
import { getMySessions, revokeMySession } from "../../services/sessionService.jsx";

// تبدیل Unix timestamp یا ISO به تاریخ شمسی
function toJalali(dateInput) {
  if (!dateInput) return "—";
  try {
    const d = typeof dateInput === "number" ? new Date(dateInput * 1000) : new Date(dateInput);
    return d.toLocaleString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dateInput);
  }
}

// تشخیص ساده مرورگر/دستگاه از user-agent
function parseDevice(ua) {
  if (!ua) return "نامشخص";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh|Mac OS/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "نامشخص";
}

function parseBrowser(ua) {
  if (!ua) return "";
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return "Chrome";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/Edg/i.test(ua)) return "Edge";
  if (/OPR|Opera/i.test(ua)) return "Opera";
  return "";
}

const UserProfile = () => {
  document.title = "پروفایل | ایسوق";

  const { refreshMe } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  // نشست‌های فعال
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokeId, setRevokeId] = useState(null);

  const canUpdate = profile?.effectivePermissions?.includes("profile.update");
  const canChangePassword = profile?.effectivePermissions?.includes("profile.change-password");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await getMySessions();
      setSessions(data);
    } catch {
      // خطا به صورت toast توسط httpClient نمایش داده می‌شود
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchSessions();
  }, [fetchProfile, fetchSessions]);

  const handleRevokeSession = async (sessionId) => {
    setRevokeId(sessionId);
    try {
      await revokeMySession(sessionId);
      toast.success("نشست با موفقیت پایان یافت");
      fetchSessions();
    } catch {
      // خطا توسط httpClient نمایش داده می‌شود
    } finally {
      setRevokeId(null);
    }
  };

  // ── Edit form ─────────────────────────────────────────────
  const editForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: profile?.name || "",
      phone: profile?.phone || "",
      email: profile?.email || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255),
      phone: Yup.string().max(20),
      email: Yup.string().email("ایمیل معتبر نیست").max(255),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {};
      if (values.name !== profile?.name) payload.name = values.name;
      if (values.phone !== profile?.phone) payload.phone = values.phone;
      if (values.email !== profile?.email) payload.email = values.email;

      if (Object.keys(payload).length === 0) {
        setEditModal(false);
        return;
      }

      try {
        await updateProfile(payload);
        toast.success("اطلاعات با موفقیت ذخیره شد");
        setEditModal(false);
        const fresh = await getProfile();
        setProfile(fresh);
        refreshMe();
      } catch (e) {
        if (e?.response?.status === 403) {
          toast.error("شما دسترسی ویرایش پروفایل را ندارید");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ── Password form ─────────────────────────────────────────
  const passwordForm = useFormik({
    initialValues: {
      current_password: "",
      new_password: "",
    },
    validationSchema: Yup.object({
      current_password: Yup.string().required("رمز عبور فعلی الزامی است"),
      new_password: Yup.string()
        .min(6, "رمز جدید باید حداقل ۶ کاراکتر باشد")
        .required("رمز عبور جدید الزامی است"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await changePassword(values);
        toast.success("رمز عبور با موفقیت تغییر یافت");
        setPasswordModal(false);
        resetForm();
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) toast.error("رمز عبور فعلی اشتباه است");
        else if (status === 400) toast.error("رمز جدید نباید با رمز فعلی یکسان باشد");
        else if (status === 403) toast.error("شما دسترسی تغییر رمز عبور را ندارید");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const maskSsn = (ssn) => {
    if (!ssn) return "—";
    return ssn.slice(0, -4).replace(/./g, "*") + ssn.slice(-4);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="ایسوق" breadcrumbItem="پروفایل" />

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <>
              {/* ── کارت اطلاعات ── */}
              <Row>
                <Col xl={4}>
                  <Card>
                    <CardBody className="text-center">
                      <div
                        className="rounded-circle mb-3 d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                          width: 96,
                          height: 96,
                          fontSize: 36,
                          background: "linear-gradient(135deg, #556ee6, #34c38f)",
                          margin: "0 auto",
                          flexShrink: 0,
                        }}
                      >
                        {profile?.name?.trim()?.[0] || profile?.username?.[0] || "؟"}
                      </div>
                      <h5 className="mb-1">{profile?.name || "—"}</h5>
                      <p className="text-muted mb-2">@{profile?.username}</p>
                      <div className="d-flex flex-wrap gap-1 justify-content-center mb-3">
                        {profile?.roles?.map((r) => (
                          <Badge key={r.id} color="primary" pill>
                            {r.label || r.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="d-flex gap-2 justify-content-center">
                        {canUpdate && (
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => {
                              editForm.resetForm();
                              setEditModal(true);
                            }}
                          >
                            <i className="bx bx-edit me-1" />
                            ویرایش پروفایل
                          </Button>
                        )}
                        {canChangePassword && (
                          <Button
                            color="warning"
                            size="sm"
                            onClick={() => {
                              passwordForm.resetForm();
                              setPasswordModal(true);
                            }}
                          >
                            <i className="bx bx-lock-alt me-1" />
                            تغییر رمز عبور
                          </Button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Col>

                <Col xl={8}>
                  <Card>
                    <CardBody>
                      <h5 className="card-title mb-4">اطلاعات حساب کاربری</h5>
                      <div className="table-responsive">
                        <table className="table table-borderless mb-0">
                          <tbody>
                            <tr>
                              <th scope="row" className="text-muted ps-0" style={{ width: "40%" }}>
                                نام کامل
                              </th>
                              <td>{profile?.name || "—"}</td>
                            </tr>
                            <tr>
                              <th scope="row" className="text-muted ps-0">
                                نام کاربری
                              </th>
                              <td>
                                {profile?.username}
                                <small className="text-muted me-2">(غیر قابل ویرایش)</small>
                              </td>
                            </tr>
                            <tr>
                              <th scope="row" className="text-muted ps-0">
                                شماره موبایل
                              </th>
                              <td>{profile?.phone || "—"}</td>
                            </tr>
                            <tr>
                              <th scope="row" className="text-muted ps-0">
                                ایمیل
                              </th>
                              <td>{profile?.email || "—"}</td>
                            </tr>
                            <tr>
                              <th scope="row" className="text-muted ps-0">
                                کد ملی
                              </th>
                              <td>
                                {maskSsn(profile?.ssn)}
                                <small className="text-muted me-2">(غیر قابل ویرایش)</small>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              {/* ── نشست‌های فعال ── */}
              <Row className="mt-2">
                <Col>
                  <Card>
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">
                          <i className="bx bx-desktop me-2 text-primary" />
                          نشست‌های فعال
                        </h5>
                        <Button
                          color="secondary"
                          outline
                          size="sm"
                          onClick={fetchSessions}
                          disabled={sessionsLoading}
                        >
                          {sessionsLoading ? (
                            <Spinner size="sm" />
                          ) : (
                            <i className="bx bx-refresh" />
                          )}
                        </Button>
                      </div>

                      {sessionsLoading && sessions.length === 0 ? (
                        <div className="text-center py-3">
                          <Spinner color="primary" />
                        </div>
                      ) : sessions.length === 0 ? (
                        <Alert color="info" className="mb-0">
                          نشست فعالی یافت نشد.
                        </Alert>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover table-nowrap mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>آدرس IP</th>
                                <th>دستگاه / مرورگر</th>
                                <th>زمان ورود</th>
                                <th>مرا به خاطر بسپار</th>
                                <th />
                              </tr>
                            </thead>
                            <tbody>
                              {sessions.map((s) => {
                                const device = parseDevice(s.user_agent);
                                const browser = parseBrowser(s.user_agent);
                                return (
                                  <tr key={s.id}>
                                    <td>
                                      <code className="text-dark">{s.ip_address || "—"}</code>
                                    </td>
                                    <td>
                                      {device}
                                      {browser ? ` / ${browser}` : ""}
                                    </td>
                                    <td>{toJalali(s.created_at)}</td>
                                    <td>
                                      {s.remember_me ? (
                                        <Badge color="success" pill>
                                          بله
                                        </Badge>
                                      ) : (
                                        <Badge color="secondary" pill>
                                          خیر
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="text-end">
                                      <Button
                                        color="danger"
                                        size="sm"
                                        outline
                                        onClick={() => handleRevokeSession(s.id)}
                                        disabled={revokeId === s.id}
                                      >
                                        {revokeId === s.id ? (
                                          <Spinner size="sm" />
                                        ) : (
                                          <>
                                            <i className="bx bx-log-out me-1" />
                                            پایان نشست
                                          </>
                                        )}
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>

      {/* ── مودال ویرایش پروفایل ── */}
      <Modal isOpen={editModal} toggle={() => setEditModal(false)} centered>
        <ModalHeader toggle={() => setEditModal(false)}>ویرایش اطلاعات</ModalHeader>
        <Form onSubmit={editForm.handleSubmit}>
          <ModalBody>
            <div className="mb-3">
              <Label>نام کامل</Label>
              <Input
                name="name"
                value={editForm.values.name}
                onChange={editForm.handleChange}
                onBlur={editForm.handleBlur}
                invalid={editForm.touched.name && !!editForm.errors.name}
                placeholder="نام کامل"
              />
              <FormFeedback>{editForm.errors.name}</FormFeedback>
            </div>
            <div className="mb-3">
              <Label>شماره موبایل</Label>
              <Input
                name="phone"
                value={editForm.values.phone}
                onChange={editForm.handleChange}
                onBlur={editForm.handleBlur}
                invalid={editForm.touched.phone && !!editForm.errors.phone}
                placeholder="09xxxxxxxxx"
              />
              <FormFeedback>{editForm.errors.phone}</FormFeedback>
            </div>
            <div className="mb-3">
              <Label>ایمیل</Label>
              <Input
                name="email"
                type="email"
                value={editForm.values.email}
                onChange={editForm.handleChange}
                onBlur={editForm.handleBlur}
                invalid={editForm.touched.email && !!editForm.errors.email}
                placeholder="example@email.com"
              />
              <FormFeedback>{editForm.errors.email}</FormFeedback>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setEditModal(false)}>
              انصراف
            </Button>
            <Button color="primary" type="submit" disabled={editForm.isSubmitting}>
              {editForm.isSubmitting ? <Spinner size="sm" className="me-1" /> : null}
              ذخیره
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── مودال تغییر رمز عبور ── */}
      <Modal isOpen={passwordModal} toggle={() => setPasswordModal(false)} centered>
        <ModalHeader toggle={() => setPasswordModal(false)}>تغییر رمز عبور</ModalHeader>
        <Form onSubmit={passwordForm.handleSubmit}>
          <ModalBody>
            <div className="mb-3">
              <Label>رمز عبور فعلی</Label>
              <Input
                name="current_password"
                type="password"
                value={passwordForm.values.current_password}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                invalid={
                  passwordForm.touched.current_password && !!passwordForm.errors.current_password
                }
                placeholder="رمز عبور فعلی"
              />
              <FormFeedback>{passwordForm.errors.current_password}</FormFeedback>
            </div>
            <div className="mb-3">
              <Label>رمز عبور جدید</Label>
              <Input
                name="new_password"
                type="password"
                value={passwordForm.values.new_password}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                invalid={passwordForm.touched.new_password && !!passwordForm.errors.new_password}
                placeholder="حداقل ۶ کاراکتر"
              />
              <FormFeedback>{passwordForm.errors.new_password}</FormFeedback>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setPasswordModal(false)}>
              انصراف
            </Button>
            <Button color="warning" type="submit" disabled={passwordForm.isSubmitting}>
              {passwordForm.isSubmitting ? <Spinner size="sm" className="me-1" /> : null}
              تغییر رمز
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </React.Fragment>
  );
};

export default UserProfile;
