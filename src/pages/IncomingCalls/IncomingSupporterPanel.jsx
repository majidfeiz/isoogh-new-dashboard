import React, { useEffect, useRef, useState } from "react";
import { Alert, Card, CardBody, Col, FormGroup, Input, Label, Row } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { getApiUrl, API_ROUTES } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";
import { incomingCallErrorMessage, setIncomingAvailability } from "../../services/incomingCallService.jsx";
import { SchoolPicker } from "./IncomingCallsCommon.jsx";

const IncomingSupporterPanel = () => {
  document.title = "پنل پشتیبان تماس ورودی | آیسوق";
  const [schoolId, setSchoolId] = useState(() => sessionStorage.getItem("incoming_calls_school_id") || ""); const [available, setAvailable] = useState(() => sessionStorage.getItem("incoming_calls_available") === "true"); const [saving, setSaving] = useState(false);
  const state = useRef({ schoolId: "", available: false });
  useEffect(() => { state.current = { schoolId, available }; }, [schoolId, available]);
  useEffect(() => { const leave = () => { const current = state.current; if (!current.schoolId || !current.available) return; const token = getAccessToken(); fetch(getApiUrl(API_ROUTES.incomingCalls.availability), { method: "PATCH", keepalive: true, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ schoolId: Number(current.schoolId), isAvailable: false }) }).catch(() => {}); }; window.addEventListener("pagehide", leave); return () => { window.removeEventListener("pagehide", leave); leave(); }; }, []);
  const change = async (checked) => { if (!schoolId) return; const previous = available; setAvailable(checked); setSaving(true); try { await setIncomingAvailability(schoolId, checked); sessionStorage.setItem("incoming_calls_school_id", schoolId); sessionStorage.setItem("incoming_calls_available", String(checked)); toast.success(checked ? "برای دریافت تماس آماده هستید." : "وضعیت شما غیرفعال شد."); } catch (e) { setAvailable(previous); toast.error(incomingCallErrorMessage(e)); } finally { setSaving(false); } };
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="تماس‌های ورودی" breadcrumbItem="پنل پشتیبان" /><Card><CardBody><Row><Col lg="5"><SchoolPicker value={schoolId} onChange={(id) => { setSchoolId(id); setAvailable(false); }} disabled={saving} /></Col></Row><Alert color={available ? "success" : "secondary"} className="mt-4"><FormGroup switch className="mb-0"><Input type="switch" role="switch" disabled={!schoolId || saving} checked={available} onChange={(e) => change(e.target.checked)} /><Label check className="fw-bold">{available ? "Available — آماده دریافت تماس" : "Unavailable — خارج از دسترس"}</Label></FormGroup></Alert><p className="text-muted small">ارسال وضعیت غیرفعال هنگام خروج، best-effort است و منطق backend نباید به آن وابسته باشد.</p></CardBody></Card></div></div>;
};
export default IncomingSupporterPanel;
