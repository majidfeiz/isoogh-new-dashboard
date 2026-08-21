import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Input, Progress, Row, Spinner, Table } from "reactstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import moment from "moment-jalaali";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getAdviserStats } from "../../services/adviserPortalService.jsx";
import { currentJalaliPeriod, isCurrentJalaliPeriod, parseAdviserStatsQuery, serializeAdviserStatsQuery, shiftJalaliMonth } from "./statsQuery.js";

const MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const CURRENT_PERIOD = currentJalaliPeriod(moment);

const StatCard = ({ label, value, icon, color, sub }) => <Card className="border-0 shadow-sm h-100"><CardBody className="d-flex align-items-center gap-3 p-3"><div className={`bg-${color} bg-opacity-15 rounded d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: 52, height: 52 }}><i className={`bx ${icon} font-size-24 text-${color}`} /></div><div><h4 className="mb-0 fw-bold">{value ?? 0}</h4><p className="text-muted mb-0 small">{label}</p>{sub && <small className="text-muted">{sub}</small>}</div></CardBody></Card>;

const CircularProgress = ({ pct = 0 }) => {
  const value = Math.max(0, Math.min(100, Number(pct) || 0));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  return <div className="d-flex align-items-center justify-content-center"><svg width={110} height={110} style={{ transform: "rotate(-90deg)" }}><circle cx={55} cy={55} r={radius} fill="none" stroke="#e9ecef" strokeWidth={10} /><circle cx={55} cy={55} r={radius} fill="none" stroke={value >= 80 ? "#34c38f" : value >= 40 ? "#f1b44c" : "#556ee6"} strokeWidth={10} strokeDasharray={circumference} strokeDashoffset={circumference - (value / 100) * circumference} strokeLinecap="round" /></svg><div className="position-absolute d-flex flex-column align-items-center"><span className="fw-bold fs-4">{value}%</span><span className="text-muted" style={{ fontSize: 11 }}>تکمیل</span></div></div>;
};

const formatPeriodDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", timeZone: "Asia/Tehran" }).format(date);
};

const Stats = () => {
  document.title = "آمار مشاور | داشبورد آیسوق";
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const period = useMemo(() => parseAdviserStatsQuery(new URLSearchParams(queryString), CURRENT_PERIOD), [queryString]);
  const years = useMemo(() => [...new Set([period.year, ...Array.from({ length: 7 }, (_, index) => CURRENT_PERIOD.year + 1 - index)])].sort((a, b) => b - a), [period.year]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const normalized = serializeAdviserStatsQuery(period).toString();
    if (queryString !== normalized) setSearchParams(normalized, { replace: true });
  }, [period.year, period.month, queryString, setSearchParams]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    setStats(null);
    getAdviserStats({ year: period.year, month: period.month, signal: controller.signal })
      .then((result) => { if (active) setStats(result); })
      .catch((requestError) => {
        if (!active || requestError?.code === "ERR_CANCELED") return;
        const message = requestError?.response?.data?.message;
        setError(Array.isArray(message) ? message.join("، ") : message || (requestError?.response?.status === 400 ? "سال یا ماه انتخاب‌شده معتبر نیست." : "دریافت آمار انجام نشد. اتصال شبکه را بررسی کنید."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [period.year, period.month, retryKey]);

  const changePeriod = (changes) => setSearchParams(serializeAdviserStatsQuery({ ...period, ...changes }));
  const moveMonth = (amount) => setSearchParams(serializeAdviserStatsQuery(shiftJalaliMonth(period, amount)));
  const currentSelected = isCurrentJalaliPeriod(period, CURRENT_PERIOD);
  const formProgress = stats?.formProgress || [];
  const noMonthlyActivity = stats && Number(stats.totalCalls || 0) === 0 && Number(stats.totalCalledStudents || 0) === 0 && Number(stats.totalAnswerSessions || 0) === 0 && Number(stats.callsThisMonth || 0) === 0;

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="پورتال مشاور" breadcrumbItem="آمار ماهانه" />
    <Card className="border-0 shadow-sm mb-4"><CardBody><Row className="g-3 align-items-end"><Col md={3} lg={2}><label className="form-label" htmlFor="stats-year">سال شمسی</label><Input id="stats-year" type="select" value={period.year} onChange={(event) => changePeriod({ year: Number(event.target.value) })}>{years.map((year) => <option key={year} value={year}>{year}</option>)}</Input></Col><Col md={3} lg={2}><label className="form-label" htmlFor="stats-month">ماه</label><Input id="stats-month" type="select" value={period.month} onChange={(event) => changePeriod({ month: Number(event.target.value) })}>{MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</Input></Col><Col md="auto" className="d-flex gap-2"><Button type="button" color="light" onClick={() => moveMonth(-1)}><i className="bx bx-chevron-right ms-1" />ماه قبل</Button><Button type="button" color="light" onClick={() => moveMonth(1)}>ماه بعد<i className="bx bx-chevron-left me-1" /></Button></Col><Col className="text-muted small">گزارش {MONTHS[period.month - 1]} {period.year}{stats?.periodStart && stats?.periodEnd && <div className="mt-1">بازه محاسبه: {formatPeriodDate(stats.periodStart)} تا {formatPeriodDate(stats.periodEnd)}</div>}</Col></Row></CardBody></Card>

    {error && <Alert color="danger" className="d-flex justify-content-between align-items-center"><span>{error}</span><Button color="danger" outline size="sm" onClick={() => setRetryKey((value) => value + 1)}>تلاش دوباره</Button></Alert>}
    {loading && <div className="text-center py-5"><Spinner color="primary" /></div>}
    {!loading && stats && <>
      {noMonthlyActivity && <Alert color="info">در این ماه تماسی ثبت نشده است</Alert>}
      <Row className="g-3 mb-4">
        <Col xl={2} md={4} xs={6}><StatCard label="کل مجموعه‌ها" value={stats.totalSchools} icon="bxs-school" color="primary" sub="وضعیت تخصیص فعلی" /></Col>
        <Col xl={2} md={4} xs={6}><StatCard label="فرم‌های تماس تخصیص‌یافته" value={stats.totalSupportForms} icon="bx-support" color="info" sub="وضعیت تخصیص فعلی" /></Col>
        <Col xl={2} md={4} xs={6}><StatCard label="کل دانش‌آموزان تخصیص‌یافته" value={stats.totalStudents} icon="bx-group" color="secondary" /></Col>
        <Col xl={2} md={4} xs={6}><StatCard label="دانش‌آموزان تماس‌گرفته در این ماه" value={stats.totalCalledStudents} icon="bx-phone-call" color="success" /></Col>
        <Col xl={2} md={4} xs={6}><StatCard label="دانش‌آموزان تماس‌نگرفته در این ماه" value={stats.totalNotCalledStudents} icon="bx-phone-off" color="danger" /></Col>
        <Col xl={2} md={4} xs={6}><StatCard label="تعداد تماس در ماه انتخاب‌شده" value={stats.totalCalls} icon="bx-phone" color="warning" /></Col>
      </Row>
      <Row className="g-3 mb-4"><Col md={4}><Card className="border-0 shadow-sm h-100"><CardBody className="d-flex flex-column align-items-center justify-content-center py-4"><h6 className="text-muted mb-3">درصد پیشرفت ماه انتخاب‌شده</h6><div className="position-relative"><CircularProgress pct={stats.overallCompletionPercent} /></div></CardBody></Card></Col><Col md={8}><Card className="border-0 shadow-sm h-100"><CardBody><h6 className="text-muted mb-4">فعالیت ماه انتخاب‌شده</h6><Row className="g-3 text-center">{currentSelected && <><Col xs={6} md={3}><StatCard label="امروز در همین ماه" value={stats.callsToday} icon="bx-calendar-today" color="primary" /></Col><Col xs={6} md={3}><StatCard label="این هفته در همین ماه" value={stats.callsThisWeek} icon="bx-calendar-week" color="info" /></Col></>}<Col xs={6} md={3}><StatCard label="تماس‌های این ماه" value={stats.callsThisMonth} icon="bx-calendar" color="warning" /></Col><Col xs={6} md={3}><StatCard label="پاسخ‌های ثبت‌شده در این ماه" value={stats.totalAnswerSessions} icon="bx-check-double" color="success" /></Col></Row></CardBody></Card></Col></Row>
      <Card className="border-0 shadow-sm"><CardBody><h6 className="text-muted mb-3">پیشرفت فرم‌ها در ماه انتخاب‌شده</h6>{formProgress.length === 0 ? <div className="text-center text-muted py-4">در این ماه پیشرفتی برای فرم‌ها ثبت نشده است</div> : <div className="table-responsive"><Table className="table-hover align-middle mb-0" dir="rtl"><thead className="table-light"><tr><th>عنوان فرم تماس</th><th>کل دانش‌آموزان تخصیص‌یافته</th><th>تماس‌گرفته در ماه</th><th>تماس‌نگرفته در ماه</th><th>دارای پاسخ در ماه</th><th>تعداد تماس‌های ماه</th><th>درصد پیشرفت ماه</th></tr></thead><tbody>{formProgress.map((row) => <tr key={row.supportFormId} style={{ cursor: "pointer" }} onClick={() => navigate(`/adviser-calls/forms/${row.supportFormId}`)}><td className="fw-semibold">{row.supportFormTitle || "—"}</td><td className="text-center">{row.totalStudents ?? 0}</td><td className="text-center text-success">{row.calledStudents ?? 0}</td><td className="text-center text-danger">{row.notCalledStudents ?? 0}</td><td className="text-center">{row.answeredStudents ?? 0}</td><td className="text-center">{row.totalCalls ?? 0}</td><td><div className="d-flex align-items-center gap-2"><Progress value={row.completionPercent ?? 0} color={(row.completionPercent ?? 0) >= 80 ? "success" : (row.completionPercent ?? 0) >= 40 ? "warning" : "primary"} style={{ height: 6, borderRadius: 3, flex: 1 }} /><span className="small fw-semibold" style={{ width: 42 }}>{row.completionPercent ?? 0}%</span></div></td></tr>)}</tbody></Table></div>}</CardBody></Card>
    </>}
  </div></div>;
};

export default Stats;
