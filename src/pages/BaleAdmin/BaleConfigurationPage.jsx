import React, { useEffect, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Spinner } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Can from "../../components/Access/Can.jsx";
import { getBaleGlobalSettings, updateBaleGlobalSettings } from "../../services/baleService.jsx";
import { normalizeBaleGlobalSettings, validateBaleGlobalSettings } from "../../services/baleGlobalSettingsMapper.js";

const numberFields = [
  ["initDataMaxAgeSeconds", "حداکثر عمر initData (ثانیه)", 60, 3600],
  ["httpTimeoutMs", "مهلت HTTP (میلی‌ثانیه)", 1000, 60000],
  ["outboxPollMs", "فاصله polling صف (میلی‌ثانیه)", 1000, 60000],
  ["outboxBatch", "اندازه batch صف", 1, 50],
];
const FieldError = ({ value }) => value ? <small className="text-danger d-block">{value}</small> : null;

export default function BaleConfigurationPage() {
  document.title = "تنظیمات سراسری بله | داشبورد سرآمد";
  const [form, setForm] = useState(null); const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState("");
  const load = async () => { setLoading(true); setMessage(""); try { setForm(normalizeBaleGlobalSettings(await getBaleGlobalSettings())); } catch (caught) { setMessage(String(caught?.response?.data?.message || "دریافت تنظیمات انجام نشد.")); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const missingChecklist = () => {
    const missing = [];
    if (!form.botTokenConfigured && !form.botToken.trim()) missing.push("توکن بازو");
    if (!form.botUsername.trim()) missing.push("نام کاربری بازو");
    if (!form.miniAppUrl.trim()) missing.push("آدرس Mini App");
    if (!form.publicWebhookUrl.trim() || (!form.webhookSecretConfigured && !form.webhookSecret.trim() && !form.generateWebhookSecret)) missing.push("Webhook آماده");
    return missing;
  };
  const save = async () => {
    const validation = validateBaleGlobalSettings(form); setErrors(validation); if (Object.keys(validation).length) return;
    const missing = form.integrationEnabled ? missingChecklist() : [];
    if (missing.length && !window.confirm(`برای فعال‌سازی یکپارچه‌سازی این موارد ناقص‌اند:\n${missing.join("، ")}\nبا این حال ذخیره شود؟`)) return;
    const needsSafirWarning = (form.safirEnabled || form.otpProvider === "bale") && (!form.safirBotId.trim() || (!form.safirApiAccessKeyConfigured && !form.safirApiAccessKey.trim()));
    if (needsSafirWarning && !window.confirm("Safir یا OTP بله بدون Bot ID و API Key کامل فعال می‌شود. ادامه می‌دهید؟")) return;
    setSaving(true); setMessage("");
    try { const result = await updateBaleGlobalSettings(form); setForm(normalizeBaleGlobalSettings(result)); setMessage("تنظیمات ذخیره شد. برای اعمال Webhook، ثبت آن را جداگانه از صفحه سلامت انجام دهید."); } catch (caught) { setMessage(String(caught?.response?.data?.message || "ذخیره تنظیمات انجام نشد.")); } finally { setSaving(false); }
  };
  if (loading) return <div className="page-content"><div className="text-center py-5"><Spinner /></div></div>;
  if (!form) return <div className="page-content"><div className="container-fluid"><div className="alert alert-danger">{message}<Button size="sm" onClick={load}>تلاش مجدد</Button></div></div></div>;
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="یکپارچه‌سازی بله" breadcrumbItem="تنظیمات سراسری" /><div className="alert alert-info">منبع فعال: <Badge color={form.source === "database" ? "success" : "warning"}>{form.source === "database" ? "دیتابیس" : "متغیرهای محیطی"}</Badge>{form.source === "environment" && <span className="ms-2">اولین ذخیره، تنظیمات fallback را به رکورد رمز‌شده دیتابیس منتقل می‌کند.</span>}</div>{message && <div className="alert alert-secondary">{message}</div>}
    <Card><CardHeader>عمومی</CardHeader><CardBody><Label check><Input type="switch" checked={form.integrationEnabled} onChange={(event) => set("integrationEnabled", event.target.checked)} /> فعال‌سازی یکپارچه‌سازی سراسری</Label></CardBody></Card>
    <Card><CardHeader>بازو</CardHeader><CardBody><Row className="g-3"><Col md="6"><Label for="bale-bot-user">نام کاربری بازو</Label><Input id="bale-bot-user" value={form.botUsername} onChange={(event) => set("botUsername", event.target.value)} /></Col><Col md="6"><Label for="bale-bot-base">API Base URL</Label><Input id="bale-bot-base" value={form.botApiBaseUrl} onChange={(event) => set("botApiBaseUrl", event.target.value)} /><FieldError value={errors.botApiBaseUrl} /></Col><Col md="6"><Label for="bale-bot-token">توکن جدید بازو</Label><Input id="bale-bot-token" type="password" value={form.botToken} placeholder={form.botTokenConfigured ? "تنظیم شده؛ برای عدم تغییر خالی بگذارید" : "تنظیم نشده"} autoComplete="new-password" onChange={(event) => set("botToken", event.target.value)} /></Col></Row></CardBody></Card>
    <Card><CardHeader>Webhook</CardHeader><CardBody><Row className="g-3"><Col md="6"><Label for="bale-webhook-public">Public Webhook URL</Label><Input id="bale-webhook-public" value={form.publicWebhookUrl} onChange={(event) => set("publicWebhookUrl", event.target.value)} /><FieldError value={errors.publicWebhookUrl} /></Col><Col md="6"><Label for="bale-webhook-secret">Secret دستی جدید</Label><Input id="bale-webhook-secret" type="password" value={form.webhookSecret} placeholder={form.webhookSecretConfigured ? "تنظیم شده؛ برای عدم تغییر خالی بگذارید" : "اختیاری"} autoComplete="new-password" onChange={(event) => set("webhookSecret", event.target.value)} /></Col><Col xs="12"><Label check><Input type="checkbox" checked={form.generateWebhookSecret} onChange={(event) => set("generateWebhookSecret", event.target.checked)} /> تولید secret امن جدید توسط backend (توصیه‌شده)</Label></Col></Row></CardBody></Card>
    <Card><CardHeader>Mini App</CardHeader><CardBody><Row className="g-3"><Col md="8"><Label for="bale-mini-url">آدرس عمومی Mini App</Label><Input id="bale-mini-url" value={form.miniAppUrl} onChange={(event) => set("miniAppUrl", event.target.value)} /><FieldError value={errors.miniAppUrl} /></Col><Col md="4"><Label for="bale-init-age">حداکثر عمر initData</Label><Input id="bale-init-age" type="number" min="60" max="3600" value={form.initDataMaxAgeSeconds} onChange={(event) => set("initDataMaxAgeSeconds", Number(event.target.value))} /><FieldError value={errors.initDataMaxAgeSeconds} /></Col></Row></CardBody></Card>
    <Card><CardHeader>Safir و OTP</CardHeader><CardBody><Row className="g-3"><Col md="4"><Label check><Input type="switch" checked={form.safirEnabled} onChange={(event) => set("safirEnabled", event.target.checked)} /> فعال‌سازی Safir</Label></Col><Col md="4"><Label for="bale-safir-bot">Safir Bot ID</Label><Input id="bale-safir-bot" value={form.safirBotId} onChange={(event) => set("safirBotId", event.target.value)} /></Col><Col md="4"><Label for="bale-otp">OTP Provider</Label><Input id="bale-otp" type="select" value={form.otpProvider} onChange={(event) => set("otpProvider", event.target.value)}><option value="kavenegar">کاوه‌نگار</option><option value="bale">بله</option><option value="fallback">Fallback</option></Input><FieldError value={errors.otpProvider} /></Col><Col md="6"><Label for="bale-safir-key">Safir API Key جدید</Label><Input id="bale-safir-key" type="password" value={form.safirApiAccessKey} placeholder={form.safirApiAccessKeyConfigured ? "تنظیم شده؛ برای عدم تغییر خالی بگذارید" : "تنظیم نشده"} autoComplete="new-password" onChange={(event) => set("safirApiAccessKey", event.target.value)} /></Col></Row></CardBody></Card>
    <Card><CardHeader>Outbox و شبکه</CardHeader><CardBody><Row className="g-3"><Col xs="12"><Label check><Input type="switch" checked={form.outboxWorkerEnabled} onChange={(event) => set("outboxWorkerEnabled", event.target.checked)} /> فعال‌سازی worker صف</Label></Col>{numberFields.filter(([key]) => key !== "initDataMaxAgeSeconds").map(([key, label, min, max]) => <Col md="4" key={key}><Label for={`bale-${key}`}>{label}</Label><Input id={`bale-${key}`} type="number" min={min} max={max} value={form[key]} onChange={(event) => set(key, Number(event.target.value))} /><FieldError value={errors[key]} /></Col>)}</Row></CardBody></Card>
    <div className="d-flex justify-content-end mb-4"><Can permission="bale.admin.global-settings.update"><Button color="primary" size="lg" disabled={saving} onClick={save}>{saving ? <Spinner size="sm" /> : "ذخیره تنظیمات سراسری"}</Button></Can></div>
  </div></div>;
}
