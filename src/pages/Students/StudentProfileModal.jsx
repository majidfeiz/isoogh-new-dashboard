import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, Col, Input, Label, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { getStudentProfile } from "../../services/studentService.jsx";

const valueOrDash = (value) => value === null || value === undefined || value === "" ? "—" : value;
const listOf = (value) => Array.isArray(value) ? value : [];
const schoolName = (school) => school?.name || school?.title || school?.code || `مدرسه ${school?.id}`;

const InfoItem = ({ label, value, ltr = false }) => <Col md={6} xl={4}><div className="border-bottom py-2 h-100"><div className="text-muted small mb-1">{label}</div><div className="fw-semibold" dir={ltr ? "ltr" : undefined}>{valueOrDash(value)}</div></div></Col>;

const SummaryCard = ({ label, value, icon, color }) => <Col sm={6} xl={3}><Card className="h-100 border shadow-none bg-light"><CardBody className="d-flex align-items-center gap-3 py-3"><span className={`avatar-sm rounded-circle bg-${color} bg-opacity-10 text-${color} d-inline-flex align-items-center justify-content-center`}><i className={`bx ${icon} font-size-20`} aria-hidden="true" /></span><div><div className="fs-4 fw-bold">{valueOrDash(value)}</div><div className="text-muted small">{label}</div></div></CardBody></Card></Col>;

const ProfileSkeleton = () => <div className="placeholder-glow" aria-label="در حال بارگذاری پرونده دانش‌آموز"><span className="placeholder col-5 py-3 mb-4" /><Row className="g-3 mb-4">{[1, 2, 3, 4].map((item) => <Col sm={6} xl={3} key={item}><span className="placeholder col-12 rounded" style={{ height: 92 }} /></Col>)}</Row>{[1, 2, 3].map((item) => <span className="placeholder col-12 d-block rounded mb-3" style={{ height: 110 }} key={item} />)}</div>;

const Section = ({ title, icon, children }) => <section className="border rounded-3 p-3 mb-3"><h5 className="d-flex align-items-center mb-3"><i className={`bx ${icon} text-primary ms-2`} aria-hidden="true" />{title}</h5>{children}</section>;

const StudentProfileContent = ({ profile, selectedSchoolId }) => {
  const student = profile?.student || {};
  const identity = profile?.identity || {};
  const calls = profile?.calls || {};
  const supportForms = profile?.supportForms || profile?.support_forms || {};
  const contacts = listOf(profile?.contacts);
  const advisers = listOf(profile?.advisers);
  const studentSchools = listOf(student?.schools);
  const tags = listOf(student?.tags);
  const currentSchool = studentSchools.find((school) => String(school.id) === String(selectedSchoolId));
  const archived = Boolean(student.deletedAt ?? student.deleted_at) || student.status === "archived" || student.isArchived === true;
  const defaultContactId = profile?.defaultContact?.id ?? profile?.default_contact?.id;
  const defaultContact = profile?.defaultContact ?? profile?.default_contact;
  const phoneValues = [identity.phone, student.phone, student.phone2 ?? student.phone_2, student.phone3 ?? student.phone_3, student.emergencyPhone ?? student.emergency_phone].filter(Boolean);

  return <>
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><h3 className="mb-1">{valueOrDash(identity.name || student.name)}</h3><div className="text-muted">کد دانش‌آموز: <span dir="ltr">{valueOrDash(student.code)}</span> · نام کاربری: <span dir="ltr">{valueOrDash(identity.username || student.username)}</span></div><div className="mt-2"><i className="bx bx-building ms-1" />{valueOrDash(currentSchool ? schoolName(currentSchool) : student.school?.name)}</div></div><Badge color={archived ? "secondary" : "success"} pill className="px-3 py-2">{archived ? "آرشیو" : "فعال"}</Badge></div>
    <Row className="g-3 mb-4"><SummaryCard label="کل تماس‌ها" value={calls.total} icon="bx-phone" color="primary" /><SummaryCard label="تماس موفق" value={calls.successful} icon="bx-phone-call" color="success" /><SummaryCard label="فرم تکمیل‌شده" value={supportForms.completed} icon="bx-check-circle" color="info" /><SummaryCard label="فرم در انتظار" value={supportForms.pending} icon="bx-time-five" color="warning" /></Row>

    <Section title="اطلاعات فردی" icon="bx-user"><Row className="g-2"><InfoItem label="نام" value={identity.name || student.name} /><InfoItem label="نام کاربری" value={identity.username || student.username} ltr /><InfoItem label="کد ملی" value={identity.ssn || identity.nationalCode || student.ssn} ltr /><InfoItem label="ایمیل" value={identity.email || student.email} ltr /><InfoItem label="جنسیت" value={identity.gender || student.gender} /><InfoItem label="تاریخ تولد" value={student.birthday} /><InfoItem label="شیفت کاری" value={profile?.workShift?.name || profile?.work_shift?.name} /><InfoItem label="معدل" value={student.gpa} /></Row></Section>
    <Section title="محل سکونت و تحصیل" icon="bx-map"><Row className="g-2"><InfoItem label="استان" value={student.province} /><InfoItem label="شهر" value={student.city} /><InfoItem label="منطقه" value={student.region} /><InfoItem label="روستا" value={student.village} /><InfoItem label="آدرس" value={student.address} /><InfoItem label="نوع محل تحصیل" value={student.instituteType ?? student.institute_type} /><InfoItem label="نام محل تحصیل" value={student.instituteName ?? student.institute_name} /></Row></Section>
    <Section title="تلفن‌ها" icon="bx-phone"><div className="mb-3"><span className="text-muted small ms-2">مخاطب پیش‌فرض:</span><strong>{defaultContact ? (defaultContact.title || defaultContact.subject?.subject || defaultContact.subject || defaultContact.phoneNumber || defaultContact.phone || "—") : "—"}</strong></div>{contacts.length ? <Row className="g-2">{contacts.map((contact) => { const isDefault = Boolean(contact.isDefault ?? contact.is_default) || String(contact.id) === String(defaultContactId); return <Col md={6} xl={4} key={contact.id || contact.phoneNumber || contact.phone}><div className={`border rounded p-3 h-100 ${isDefault ? "border-primary bg-primary bg-opacity-10" : ""}`}><div className="d-flex justify-content-between gap-2"><span>{contact.title || contact.subject?.subject || contact.subject || "مخاطب"}</span>{isDefault && <Badge color="primary">پیش‌فرض</Badge>}</div><div className="fw-bold mt-2" dir="ltr">{valueOrDash(contact.phoneNumber ?? contact.phone_number ?? contact.phone)}</div></div></Col>; })}</Row> : phoneValues.length ? <div className="d-flex flex-wrap gap-2">{phoneValues.map((phone, index) => <Badge color="light" className="text-dark px-3 py-2" key={`${phone}-${index}`}><span dir="ltr">{phone}</span></Badge>)}</div> : <div className="text-muted">مخاطب یا شماره تلفنی ثبت نشده است.</div>}</Section>
    <Section title="مشاوران" icon="bx-support">{advisers.length ? <Row className="g-2">{advisers.map((adviser) => <Col md={6} xl={4} key={adviser.id || adviser.code}><div className="border rounded p-3 h-100"><div className="fw-semibold">{valueOrDash(adviser.name || adviser.user?.name)}</div><div className="text-muted small mt-1">کد: {valueOrDash(adviser.code)}</div>{Boolean(adviser.isSupervisor ?? adviser.is_supervisor) && <Badge color="info" className="mt-2">سرپرست</Badge>}</div></Col>)}</Row> : <div className="text-muted">مشاوری متصل نشده است.</div>}</Section>
    <Section title="مدارس و تگ‌ها" icon="bx-purchase-tag"><div className="mb-3"><div className="text-muted small mb-2">مدارس</div>{studentSchools.length ? <div className="d-flex flex-wrap gap-2">{studentSchools.map((school) => <Badge color={String(school.id) === String(selectedSchoolId) ? "primary" : "light"} className={String(school.id) === String(selectedSchoolId) ? "px-3 py-2" : "text-dark px-3 py-2"} key={school.id}>{schoolName(school)}</Badge>)}</div> : <span>—</span>}</div><div><div className="text-muted small mb-2">تگ‌ها</div>{tags.length ? <div className="d-flex flex-wrap gap-2">{tags.map((tag) => <Badge color="info" pill className="px-3 py-2" key={tag.id || tag.name}>{tag.name || tag.title || tag.id}</Badge>)}</div> : <span>—</span>}</div></Section>
    <div className="text-muted small">آخرین تماس: {calls.lastCallAt ? new Date(calls.lastCallAt).toLocaleString("fa-IR") : "—"} · مجموع فرم‌ها: {valueOrDash(supportForms.total)}</div>
  </>;
};

const StudentProfileModal = ({ isOpen, student, activeSchoolId = "", onClose }) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestRef = useRef(null);
  const schools = useMemo(() => {
    const rowSchools = listOf(student?.schools);
    if (rowSchools.length) return rowSchools;
    if (student?.school?.id) return [student.school];
    if (student?.schoolId ?? student?.school_id) return [{ id: student.schoolId ?? student.school_id, name: student.schoolName ?? student.school_name }];
    return [];
  }, [student]);

  const loadProfile = useCallback(async (schoolId) => {
    if (!student?.id || !schoolId) return undefined;
    const key = `${student.id}:${schoolId}`;
    if (requestRef.current?.key === key) return undefined;
    requestRef.current?.controller.abort();
    const controller = new AbortController();
    setLoading(true); setError(null); setProfile(null);
    const promise = getStudentProfile({ studentId: student.id, schoolId, signal: controller.signal });
    requestRef.current = { key, controller, promise };
    try { const result = await promise; if (!controller.signal.aborted) setProfile(result); }
    catch (caught) { if (caught?.code !== "ERR_CANCELED" && !controller.signal.aborted) setError(caught?.response?.status || "unknown"); }
    finally { if (requestRef.current?.controller === controller) { requestRef.current = null; if (!controller.signal.aborted) setLoading(false); } }
    return undefined;
  }, [student?.id]);

  useEffect(() => {
    if (!isOpen || !student) return undefined;
    const contextSchoolId = activeSchoolId || (schools.length === 1 ? schools[0].id : "");
    setSelectedSchoolId(contextSchoolId ? String(contextSchoolId) : "");
    if (contextSchoolId) loadProfile(contextSchoolId);
    return undefined;
  }, [isOpen, student, activeSchoolId, schools, loadProfile]);

  useEffect(() => () => requestRef.current?.controller.abort(), []);

  const close = () => { requestRef.current?.controller.abort(); requestRef.current = null; setSelectedSchoolId(""); setProfile(null); setLoading(false); setError(null); onClose(); };
  const errorMessage = error === 403 ? "شما به پرونده این دانش‌آموز در مدرسه انتخاب‌شده دسترسی ندارید." : error === 404 ? "پرونده دانش‌آموز در مدرسه انتخاب‌شده یافت نشد." : "دریافت پرونده دانش‌آموز ناموفق بود.";
  const needsSchoolSelection = !activeSchoolId && schools.length > 1 && !profile && !loading;

  return <Modal isOpen={isOpen} toggle={close} size="xl" scrollable centered><ModalHeader toggle={close}>پرونده جامع دانش‌آموز</ModalHeader><ModalBody className="p-3 p-lg-4">
    {needsSchoolSelection && !error && <div className="mx-auto py-5" style={{ maxWidth: 520 }}><h5>انتخاب مدرسه</h5><p className="text-muted">این دانش‌آموز در چند مدرسه عضویت دارد. پرونده را در context کدام مدرسه مشاهده می‌کنید؟</p><Label for="student-profile-school">مدرسه</Label><Input id="student-profile-school" type="select" value={selectedSchoolId} onChange={(event) => setSelectedSchoolId(event.target.value)}><option value="">انتخاب مدرسه...</option>{schools.map((school) => <option key={school.id} value={school.id}>{schoolName(school)}</option>)}</Input><Button color="primary" className="mt-3" disabled={!selectedSchoolId} onClick={() => loadProfile(selectedSchoolId)}>مشاهده پرونده</Button></div>}
    {!activeSchoolId && schools.length === 0 && !loading && !profile && !error && <Alert color="warning">برای مشاهده پرونده، مدرسه دانش‌آموز مشخص نیست.</Alert>}
    {loading && <ProfileSkeleton />}
    {error && <Alert color="danger"><div className="fw-semibold">{errorMessage}</div><Button color="danger" outline size="sm" className="mt-3" onClick={() => loadProfile(selectedSchoolId)}>تلاش مجدد</Button></Alert>}
    {profile && <StudentProfileContent profile={profile} selectedSchoolId={selectedSchoolId} />}
  </ModalBody></Modal>;
};

export { StudentProfileContent };
export default StudentProfileModal;
