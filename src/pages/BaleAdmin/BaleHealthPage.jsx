import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Col, Row, Spinner } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Can from "../../components/Access/Can.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { deleteBaleWebhook, getBaleAdminStats, getBaleHealth, getBaleWebhook, registerBaleWebhook } from "../../services/baleService.jsx";

const CARDS = [
  ["globalIntegration", "یکپارچه‌سازی سراسری"], ["botConfigured", "تنظیم بازو"],
  ["webhookConfigured", "تنظیم Webhook"], ["miniAppUrlConfigured", "آدرس Mini App"],
  ["safirReadiness", "آمادگی سفیر"], ["outboxWorker", "پردازشگر Outbox"],
  ["activeSchools", "مدارس فعال"], ["pendingMessages", "پیام‌های در انتظار"],
  ["retryMessages", "پیام‌های retry"], ["failedMessages", "پیام‌های ناموفق"],
];

export default function BaleHealthPage() {
  document.title = "سلامت سرویس بله | داشبورد سرآمد";
  const [health, setHealth] = useState(null); const [webhook, setWebhookState] = useState(null);
  const [stats, setStats] = useState(null); const [statsError, setStatsError] = useState("");
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true); const [working, setWorking] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const [healthResult, webhookResult] = await Promise.all([getBaleHealth(), hasPermission("bale.admin.webhook.show") ? getBaleWebhook().catch(() => null) : Promise.resolve(null)]); setHealth(healthResult); setWebhookState(webhookResult); } catch (caught) { setError(String(caught?.response?.data?.message || "دریافت وضعیت سرویس انجام نشد.")); } finally { setLoading(false); } }, [hasPermission]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!hasPermission("bale.admin.statistics.show")) return; getBaleAdminStats().then(setStats).catch((caught) => setStatsError(String(caught?.response?.data?.message || "دریافت آمار انجام نشد."))); }, [hasPermission]);
  const setWebhook = async () => { if (!window.confirm("Webhook با URL امن از پیش تنظیم‌شده در سرور ثبت شود؟")) return; setWorking(true); try { await registerBaleWebhook(); await load(); } finally { setWorking(false); } };
  const removeWebhook = async () => { if (!window.confirm("Webhook بله حذف شود؟ دریافت رویدادها متوقف خواهد شد.")) return; setWorking(true); try { await deleteBaleWebhook(); await load(); } finally { setWorking(false); } };
  const outbox = stats?.outboxByStatus || {};
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="یکپارچه‌سازی بله" breadcrumbItem="سلامت سرویس" /><Can permission="bale.admin.statistics.show">{statsError ? <div className="alert alert-warning">{statsError}</div> : stats && <><h5>نمای کلی مدیریتی</h5><Row>{[["مدارس فعال", stats.activeSchools], ["اتصال‌های فعال", stats.activeConnections], ["ورودهای Mini App", stats.miniAppLogins], ["عملیات ناموفق", stats.operationFailures]].map(([label, value]) => <Col md="3" className="mb-3" key={label}><Card className="h-100"><CardBody><small>{label}</small><h3>{Number(value || 0).toLocaleString("fa-IR")}</h3></CardBody></Card></Col>)}</Row><Card><CardHeader>وضعیت Outbox</CardHeader><CardBody className="d-flex flex-wrap gap-3">{["pending", "processing", "sent", "retry", "failed", "cancelled"].map((status) => <Badge color="light" className="text-dark fs-6" key={status}>{status}: {Number(outbox[status] || 0).toLocaleString("fa-IR")}</Badge>)}</CardBody></Card></>}</Can>{loading ? <div className="text-center py-5"><Spinner /></div> : error ? <div className="alert alert-danger">{error} <Button size="sm" onClick={load}>تلاش مجدد</Button></div> : <><h5>سلامت سرویس</h5><Row>{CARDS.map(([key, label]) => { const value = health?.[key]; const good = typeof value === "boolean" ? value : null; return <Col md="4" className="mb-3" key={key}><Card className="h-100"><CardBody><small className="text-muted">{label}</small><h3 className="mt-2">{typeof value === "boolean" ? <Badge color={good ? "success" : "danger"}>{good ? "آماده" : "نیازمند بررسی"}</Badge> : value ?? "—"}</h3></CardBody></Card></Col>; })}</Row><Can permission="bale.admin.webhook.show"><Card><CardHeader>Webhook بله</CardHeader><CardBody className="d-flex flex-wrap justify-content-between align-items-center gap-3"><div><strong>{webhook?.isSet || webhook?.configured ? "ثبت شده" : "ثبت نشده"}</strong><p className="text-muted mb-0">URL و secret در این صفحه نمایش داده نمی‌شوند و payload عملیات نیز خالی است.</p></div><Can permission="bale.admin.webhook.update">{webhook?.isSet || webhook?.configured ? <Button color="danger" outline disabled={working} onClick={removeWebhook}>حذف Webhook</Button> : <Button color="primary" disabled={working} onClick={setWebhook}>ثبت Webhook امن</Button>}</Can></CardBody></Card></Can></>}</div></div>;
}
