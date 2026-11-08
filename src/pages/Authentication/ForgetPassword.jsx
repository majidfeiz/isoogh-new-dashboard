import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Alert, Button, Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Row, Spinner } from "reactstrap";
import withRouter from "../../components/Common/withRouter";
import profile from "../../assets/images/profile-img.png";
import logo from "../../assets/images/logo.svg";
import { getLoginCaptcha, requestPasswordReset, resetPassword } from "../../services/authService.jsx";
import { clearAuthData } from "../../helpers/authStorage.jsx";

const GENERAL_MESSAGE = "در صورت وجود حساب، کد بازیابی برای شماره موبایل ثبت‌شده ارسال شد";
const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const ForgetPasswordPage = ({ router }) => {
  document.title = "بازیابی رمز عبور | آیسوق";
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [resetToken, setResetToken] = useState(null);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [expiresLeft, setExpiresLeft] = useState(0);
  const [resendLeft, setResendLeft] = useState(0);
  const [captcha, setCaptcha] = useState({ enabled: false });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [captchaExpiresLeft, setCaptchaExpiresLeft] = useState(0);

  const fetchCaptcha = useCallback(async (showError = false) => {
    setCaptchaLoading(true);
    try {
      const result = await getLoginCaptcha();
      const next = result?.enabled ? result : { enabled: false };
      setCaptcha(next);
      setCaptchaAnswer("");
      setCaptchaExpiresLeft(next.enabled ? next.expiresIn ?? 120 : 0);
    } catch {
      setCaptcha({ enabled: false });
      if (showError) setErrors({ form: "دریافت کپچا ناموفق بود. لطفا دوباره تلاش کنید." });
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => { fetchCaptcha(); }, [fetchCaptcha]);
  useEffect(() => {
    if (expiresLeft <= 0) return undefined;
    const timer = setTimeout(() => setExpiresLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [expiresLeft]);
  useEffect(() => {
    if (resendLeft <= 0) return undefined;
    const timer = setTimeout(() => setResendLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendLeft]);
  useEffect(() => {
    if (!captcha.enabled || captchaExpiresLeft <= 0) return undefined;
    const timer = setTimeout(() => setCaptchaExpiresLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [captcha.enabled, captchaExpiresLeft]);

  const sendCode = async (event) => {
    event?.preventDefault();
    if (loading || (step === 2 && resendLeft > 0)) return;
    const nextErrors = {};
    if (!identifier.trim()) nextErrors.identifier = "نام کاربری یا شماره موبایل را وارد کنید";
    if (captcha.enabled && captchaExpiresLeft <= 0) nextErrors.captchaAnswer = "کپچا منقضی شده است";
    else if (captcha.enabled && !captchaAnswer.trim()) nextErrors.captchaAnswer = "پاسخ کپچا را وارد کنید";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setLoading(true);
    setErrors({});
    try {
      const result = await requestPasswordReset(identifier.trim(), captcha.enabled ? { captchaToken: captcha.captchaToken, captchaAnswer: captchaAnswer.trim() } : null);
      setResetToken(result?.resetToken ?? null);
      setExpiresLeft(result?.expiresIn ?? 120);
      setResendLeft(result?.resendAfter ?? 60);
      setCode("");
      setMessage(result?.message || GENERAL_MESSAGE);
      setStep(2);
    } catch {
      setErrors({ form: "ارسال درخواست ممکن نشد. اتصال خود را بررسی و دوباره تلاش کنید." });
      if (captcha.enabled) await fetchCaptcha();
    } finally { setLoading(false); }
  };

  const submitReset = async (event) => {
    event.preventDefault();
    if (loading) return;
    const nextErrors = {};
    if (!/^\d{5}$/.test(code)) nextErrors.code = "کد بازیابی باید پنج رقم باشد";
    if (newPassword.length < 6) nextErrors.newPassword = "رمز جدید باید حداقل ۶ کاراکتر باشد";
    if (newPassword !== confirmPassword) nextErrors.confirmPassword = "تکرار رمز عبور مطابقت ندارد";
    if (!resetToken) nextErrors.form = "برای ادامه، کد بازیابی جدید درخواست کنید";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setLoading(true);
    setErrors({});
    try {
      await resetPassword({ resetToken, code, newPassword });
      setResetToken(null); setCode(""); setNewPassword(""); setConfirmPassword("");
      clearAuthData();
      router.navigate("/login", { replace: true, state: { message: "رمز عبور با موفقیت تغییر کرد؛ وارد شوید" } });
    } catch (error) {
      if (error?.response?.status === 401) {
        setErrors({ form: "کد بازیابی اشتباه، منقضی یا قبلاً استفاده شده است. کد جدید درخواست کنید." });
        setExpiresLeft(0);
      } else setErrors({ form: "تغییر رمز انجام نشد. اتصال خود را بررسی و دوباره تلاش کنید." });
    } finally { setLoading(false); }
  };

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const resetDisabled = loading || !resetToken || !/^\d{5}$/.test(code) || newPassword.length < 6 || newPassword !== confirmPassword;
  return (
    <div className="account-pages my-5 pt-sm-5"><Container><Row className="justify-content-center"><Col md={8} lg={6} xl={5}>
      <Card className="overflow-hidden"><div className="bg-primary-subtle"><Row><Col xs={7}><div className="text-primary p-4"><h5 className="text-primary">بازیابی رمز عبور</h5><p>{step === 1 ? "شناسه حساب خود را وارد کنید" : "کد بازیابی و رمز جدید را وارد کنید"}</p></div></Col><Col xs={5} className="align-self-end"><img src={profile} alt="" className="img-fluid" /></Col></Row></div>
        <CardBody className="pt-0"><div className="avatar-md profile-user-wid mb-4 mx-auto"><span className="avatar-title rounded-circle bg-light"><img src={logo} alt="آیسوق" height="34" /></span></div>
          {message && <Alert color="info">{message}</Alert>}{errors.form && <Alert color="danger">{errors.form}</Alert>}
          {step === 1 ? <Form onSubmit={sendCode}>
            <div className="mb-3"><Label>نام کاربری یا شماره موبایل</Label><Input aria-label="نام کاربری یا شماره موبایل" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} invalid={!!errors.identifier} disabled={loading} /><FormFeedback>{errors.identifier}</FormFeedback></div>
            {captcha.enabled && <div className="mb-3"><Label>کپچا</Label><div className="input-group"><span className="input-group-text fw-bold" dir="ltr">{captcha.question}</span><Input aria-label="پاسخ کپچا" inputMode="numeric" dir="ltr" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value.replace(/[^\d-]/g, ""))} invalid={!!errors.captchaAnswer} disabled={captchaLoading || captchaExpiresLeft <= 0} /><Button type="button" color="light" onClick={() => fetchCaptcha(true)} disabled={captchaLoading}><i className="bx bx-reset" /></Button></div>{errors.captchaAnswer && <div className="invalid-feedback d-block">{errors.captchaAnswer}</div>}<small className={captchaExpiresLeft > 0 ? "text-muted" : "text-danger"}>{captchaExpiresLeft > 0 ? `اعتبار کپچا: ${formatTime(captchaExpiresLeft)}` : "کپچا منقضی شده است؛ سؤال جدید بگیرید."}</small></div>}
            <div className="d-grid"><Button color="primary" type="submit" disabled={loading || captchaLoading}>{loading ? <><Spinner size="sm" className="me-2" />در حال ارسال...</> : "ارسال کد بازیابی"}</Button></div>
          </Form> : <Form onSubmit={submitReset}>
            <div className="d-flex justify-content-between mb-3"><span className={expiresLeft ? "text-muted" : "text-danger"}>{expiresLeft ? `اعتبار کد: ${formatTime(expiresLeft)}` : "اعتبار کد پایان یافته است"}</span><Button type="button" color="link" className="p-0" onClick={sendCode} disabled={loading || resendLeft > 0}>{resendLeft > 0 ? `ارسال مجدد (${formatTime(resendLeft)})` : "ارسال مجدد کد"}</Button></div>
            <div className="mb-3"><Label>کد بازیابی پنج‌رقمی</Label><Input aria-label="کد بازیابی پنج‌رقمی" autoComplete="one-time-code" inputMode="numeric" dir="ltr" maxLength={5} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 5))} invalid={!!errors.code} /><FormFeedback>{errors.code}</FormFeedback></div>
            <div className="mb-3"><Label>رمز عبور جدید</Label><Input aria-label="رمز عبور جدید" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} invalid={!!errors.newPassword} /><FormFeedback>{errors.newPassword}</FormFeedback></div>
            <div className="mb-3"><Label>تکرار رمز عبور جدید</Label><Input aria-label="تکرار رمز عبور جدید" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} invalid={mismatch || !!errors.confirmPassword} /><FormFeedback>{errors.confirmPassword || "تکرار رمز عبور مطابقت ندارد"}</FormFeedback></div>
            <div className="d-grid"><Button color="primary" type="submit" disabled={resetDisabled}>{loading ? <Spinner size="sm" /> : "ثبت رمز جدید"}</Button></div>
          </Form>}
        </CardBody></Card><div className="mt-4 text-center"><Link to="/login">بازگشت به ورود</Link></div>
    </Col></Row></Container></div>
  );
};

ForgetPasswordPage.propTypes = { router: PropTypes.object.isRequired };
export default withRouter(ForgetPasswordPage);
