import React, { useCallback, useEffect, useState } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { getIncomingStudentProfile, getIncomingStudentTimeline, incomingCallErrorMessage } from "../../services/incomingCallService.jsx";
import { formatDateTime, RequestState } from "./IncomingCallsCommon.jsx";

const IncomingStudentProfile = () => {
  document.title = "پرونده دانش‌آموز | آیسوق";
  const { id } = useParams(); const [params] = useSearchParams(); const schoolId = params.get("schoolId");
  const [profile, setProfile] = useState(null); const [timeline, setTimeline] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const [student, events] = await Promise.all([getIncomingStudentProfile(id, schoolId), getIncomingStudentTimeline(id, schoolId)]); setProfile(student); setTimeline(Array.isArray(events) ? events : events?.items || []); } catch (e) { setError(incomingCallErrorMessage(e)); } finally { setLoading(false); } }, [id, schoolId]);
  useEffect(() => { load(); }, [load]);
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="دانش‌آموزان تماس ورودی" breadcrumbItem="پرونده فقط‌خواندنی" /><RequestState loading={loading} error={error} onRetry={load} />{!loading && !error && profile && <Row><Col lg="4"><Card><CardBody><h5>{profile.fullName || profile.name || "دانش‌آموز"}</h5><dl className="row mt-4"><dt className="col-5">نام کاربری</dt><dd className="col-7">{profile.username || "—"}</dd><dt className="col-5">تلفن</dt><dd className="col-7">{profile.phone || profile.mobile || "—"}</dd><dt className="col-5">پایه</dt><dd className="col-7">{profile.grade?.name || profile.gradeName || "—"}</dd></dl></CardBody></Card></Col><Col lg="8"><Card><CardBody><h5>خط زمانی</h5>{!timeline.length ? <div className="text-muted py-4">رویدادی ثبت نشده است.</div> : <div className="vstack gap-3 mt-4">{timeline.map((event, index) => <div key={event.id || index} className="border-start border-3 border-primary ps-3"><strong>{event.title || event.type || "رویداد"}</strong><div>{event.description || event.note || ""}</div><small className="text-muted">{formatDateTime(event.createdAt || event.occurredAt)}</small></div>)}</div>}</CardBody></Card></Col></Row>}</div></div>;
};
export default IncomingStudentProfile;
