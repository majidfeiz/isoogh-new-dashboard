import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import withRouter from "../../components/Common/withRouter";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useAuth } from "../../context/AuthContext";
import {
  Row,
  Col,
  CardBody,
  Card,
  Alert,
  Container,
  Form,
  Input,
  FormFeedback,
  Label,
} from "reactstrap";

import profile from "../../assets/images/profile-img.png";
import logo from "../../assets/images/logo.svg";
import lightlogo from "../../assets/images/logo-light.svg";

import { login as loginApi, verifyOtp as verifyOtpApi } from "../../services/authService.jsx";
import { setAuthData } from "../../helpers/authStorage.jsx";

const Login = (props) => {
  document.title = "سیستم ورود به آیسوق";

  const { setUser, setPermissions } = useAuth();

  // step 1 = فرم نام کاربری/رمز عبور، step 2 = فرم OTP
  const [step, setStep] = useState(1);
  const [otpState, setOtpState] = useState(null); // { otpToken, maskedPhone }
  const [rememberMe, setRememberMe] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [serverErrors, setServerErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // تایمر انقضای OTP
  const [expiresLeft, setExpiresLeft] = useState(0);
  // تایمر ارسال مجدد
  const [resendLeft, setResendLeft] = useState(0);

  const expTimerRef = useRef(null);
  const resendTimerRef = useRef(null);

  useEffect(() => {
    if (expiresLeft > 0) {
      expTimerRef.current = setTimeout(() => setExpiresLeft((t) => t - 1), 1000);
    }
    return () => clearTimeout(expTimerRef.current);
  }, [expiresLeft]);

  useEffect(() => {
    if (resendLeft > 0) {
      resendTimerRef.current = setTimeout(() => setResendLeft((t) => t - 1), 1000);
    }
    return () => clearTimeout(resendTimerRef.current);
  }, [resendLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const startTimers = ({ expiresIn, resendAfter }) => {
    setExpiresLeft(expiresIn ?? 120);
    setResendLeft(resendAfter ?? 60);
  };

  const extractErrors = (err) => {
    const data = err?.response?.data;
    if (Array.isArray(data?.message)) return data.message;
    if (data?.message) return [data.message];
    return ["خطای ناشناخته. لطفا دوباره تلاش کنید."];
  };

  // ── مرحله ۱: ارسال نام کاربری + رمز عبور ────────────────
  const validation = useFormik({
    enableReinitialize: false,
    initialValues: {
      identifier: "",
      password: "",
    },
    validationSchema: Yup.object({
      identifier: Yup.string().required("لطفا نام کاربری یا شماره موبایل را وارد کنید"),
      password: Yup.string().required("لطفا رمز عبور خود را وارد کنید"),
    }),
    onSubmit: async (values) => {
      setServerErrors([]);
      setLoading(true);
      try {
        const data = await loginApi(values.identifier, values.password, rememberMe);

        if (!data.otpRequired) {
          // OTP غیرفعال است — ورود مستقیم با JWT
          setAuthData({ accessToken: data.accessToken, user: data.user, rememberMe });
          const perms = Array.isArray(data.user?.effectivePermissions)
            ? data.user.effectivePermissions.filter((x) => typeof x === "string" && x.length > 0)
            : Array.isArray(data.user?.permissions)
              ? data.user.permissions.map((p) => (typeof p === "string" ? p : p?.name)).filter(Boolean)
              : [];
          setUser(data.user ?? null);
          setPermissions(perms);
          props.router.navigate("/dashboard");
          return;
        }

        // OTP فعال است — رفتن به مرحله دوم
        setOtpState(data);
        setOtpCode("");
        startTimers({ expiresIn: data.expiresIn, resendAfter: data.resendAfter });
        setStep(2);
      } catch (err) {
        setServerErrors(extractErrors(err));
      } finally {
        setLoading(false);
      }
    },
  });

  // ── مرحله ۲: ارسال کد OTP ────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setServerErrors(["لطفا کد تأیید را وارد کنید"]);
      return;
    }
    setServerErrors([]);
    setLoading(true);
    try {
      const result = await verifyOtpApi(otpState.otpToken, otpCode.trim(), rememberMe);
      const perms = Array.isArray(result?.user?.effectivePermissions)
        ? result.user.effectivePermissions.filter((x) => typeof x === "string" && x.length > 0)
        : Array.isArray(result?.user?.permissions)
          ? result.user.permissions.map((p) => (typeof p === "string" ? p : p?.name)).filter(Boolean)
          : [];
      setUser(result?.user ?? null);
      setPermissions(perms);
      props.router.navigate("/dashboard");
    } catch (err) {
      setServerErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  // ارسال مجدد کد
  const handleResend = async () => {
    setServerErrors([]);
    setLoading(true);
    try {
      const data = await loginApi(
        validation.values.identifier,
        validation.values.password,
        rememberMe
      );
      setOtpState(data);
      setOtpCode("");
      startTimers({ expiresIn: data.expiresIn, resendAfter: data.resendAfter });
    } catch (err) {
      setServerErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
    setOtpState(null);
    setOtpCode("");
    setServerErrors([]);
  };

  const LogoBlock = () => (
    <div className="auth-logo">
      <Link to="/" className="auth-logo-light">
        <div className="avatar-md profile-user-wid mb-4">
          <span className="avatar-title rounded-circle bg-light">
            <img src={lightlogo} alt="" className="rounded-circle" height="34" />
          </span>
        </div>
      </Link>
      <Link to="/" className="auth-logo-dark">
        <div className="avatar-md profile-user-wid mb-4">
          <span className="avatar-title rounded-circle bg-light">
            <img src={logo} alt="" className="rounded-circle" height="34" />
          </span>
        </div>
      </Link>
    </div>
  );

  return (
    <React.Fragment>
      <div className="home-btn d-none d-sm-block">
        <Link to="/" className="text-dark">
          <i className="bx bx-home h2" />
        </Link>
      </div>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="overflow-hidden">
                <div className="bg-primary-subtle">
                  <Row>
                    <Col xs={7}>
                      <div className="text-primary p-4">
                        <h5 className="text-primary">خوش آمدید !</h5>
                        <p>
                          {step === 1
                            ? "برای ادامه به آیسوق وارد شوید"
                            : "کد تأیید را وارد کنید"}
                        </p>
                      </div>
                    </Col>
                    <Col className="col-5 align-self-end">
                      <img src={profile} alt="" className="img-fluid" />
                    </Col>
                  </Row>
                </div>

                <CardBody className="pt-0">
                  <LogoBlock />
                  <div className="p-2">
                    {/* نمایش خطاها */}
                    {serverErrors.length > 0 && (
                      <Alert color="danger">
                        <ul className="mb-0 ps-3">
                          {serverErrors.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                          ))}
                        </ul>
                      </Alert>
                    )}

                    {/* ── مرحله ۱: فرم ورود ── */}
                    {step === 1 && (
                      <Form
                        className="form-horizontal"
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                        }}
                      >
                        <div className="mb-3">
                          <Label className="form-label">نام کاربری یا شماره موبایل</Label>
                          <Input
                            name="identifier"
                            className="form-control"
                            placeholder="09xxxxxxxxx یا نام کاربری"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.identifier}
                            invalid={
                              validation.touched.identifier && !!validation.errors.identifier
                            }
                          />
                          {validation.touched.identifier && validation.errors.identifier && (
                            <FormFeedback type="invalid">
                              {validation.errors.identifier}
                            </FormFeedback>
                          )}
                        </div>

                        <div className="mb-3">
                          <Label className="form-label">رمز عبور</Label>
                          <Input
                            name="password"
                            autoComplete="off"
                            value={validation.values.password}
                            type="password"
                            placeholder="رمز عبور را وارد کنید"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.touched.password && !!validation.errors.password
                            }
                          />
                          {validation.touched.password && validation.errors.password && (
                            <FormFeedback type="invalid">
                              {validation.errors.password}
                            </FormFeedback>
                          )}
                        </div>

                        <div className="form-check mb-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="rememberMe">
                            مرا به خاطر بسپار
                          </label>
                        </div>

                        <div className="mt-3 d-grid">
                          <button
                            className="btn btn-primary btn-block"
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                />
                                در حال ارسال...
                              </>
                            ) : (
                              "ورود"
                            )}
                          </button>
                        </div>
                      </Form>
                    )}

                    {/* ── مرحله ۲: فرم OTP ── */}
                    {step === 2 && otpState && (
                      <Form onSubmit={handleOtpSubmit}>
                        <div className="text-center mb-4">
                          <div className="avatar-sm mx-auto mb-3">
                            <span
                              className="avatar-title rounded-circle bg-primary-subtle text-primary"
                              style={{ fontSize: 24 }}
                            >
                              <i className="bx bx-mobile-alt" />
                            </span>
                          </div>
                          <p className="text-muted mb-1">
                            کد تأیید به شماره{" "}
                            <strong className="text-dark" dir="ltr">
                              {otpState.maskedPhone}
                            </strong>{" "}
                            ارسال شد
                          </p>
                          {expiresLeft > 0 ? (
                            <small className="text-muted">
                              کد تا{" "}
                              <span className="text-danger fw-bold" dir="ltr">
                                {formatTime(expiresLeft)}
                              </span>{" "}
                              دیگر معتبر است
                            </small>
                          ) : (
                            <small className="text-danger">کد منقضی شده است</small>
                          )}
                        </div>

                        <div className="mb-3">
                          <Label className="form-label">کد تأیید</Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="کد ۵ یا ۶ رقمی"
                            value={otpCode}
                            onChange={(e) =>
                              setOtpCode(e.target.value.replace(/\D/g, ""))
                            }
                            className="form-control text-center fs-4 letter-spacing-3"
                            dir="ltr"
                            autoFocus
                          />
                        </div>

                        <div className="mt-3 d-grid">
                          <button
                            className="btn btn-primary btn-block"
                            type="submit"
                            disabled={loading || !otpCode}
                          >
                            {loading ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                />
                                در حال تأیید...
                              </>
                            ) : (
                              "تأیید و ورود"
                            )}
                          </button>
                        </div>

                        <div className="mt-3 d-flex justify-content-between align-items-center">
                          <button
                            type="button"
                            className="btn btn-link p-0 text-muted"
                            onClick={goBack}
                          >
                            <i className="bx bx-arrow-right me-1" />
                            بازگشت
                          </button>
                          {resendLeft > 0 ? (
                            <small className="text-muted" dir="ltr">
                              ارسال مجدد تا{" "}
                              <span className="fw-bold">{formatTime(resendLeft)}</span>
                            </small>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-link p-0"
                              onClick={handleResend}
                              disabled={loading}
                            >
                              ارسال مجدد کد
                            </button>
                          )}
                        </div>
                      </Form>
                    )}
                  </div>
                </CardBody>
              </Card>

              <div className="mt-5 text-center">
                <p>
                  © {new Date().getFullYear()} ساخته شده توسط{" "}
                  <i className="mdi mdi-heart text-danger" /> تیم آیسوق
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(Login);

Login.propTypes = {
  history: PropTypes.object,
};
