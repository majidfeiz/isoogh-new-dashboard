import React, { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Card,
  CardBody,
  Col,
  Progress,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getAdviserStats } from "../../services/adviserPortalService.jsx";

const StatCard = ({ label, value, icon, color, sub }) => (
  <Card className="border-0 shadow-sm h-100">
    <CardBody className="d-flex align-items-center gap-3 p-3">
      <div
        className={`bg-${color} bg-opacity-15 rounded d-flex align-items-center justify-content-center flex-shrink-0`}
        style={{ width: 52, height: 52 }}
      >
        <i className={`bx ${icon} font-size-24 text-${color}`} />
      </div>
      <div>
        <h4 className="mb-0 fw-bold">{value ?? "—"}</h4>
        <p className="text-muted mb-0 small">{label}</p>
        {sub && <small className="text-muted">{sub}</small>}
      </div>
    </CardBody>
  </Card>
);

const CircularProgress = ({ pct }) => {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="d-flex align-items-center justify-content-center">
      <svg width={110} height={110} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={55} cy={55} r={r} fill="none" stroke="#e9ecef" strokeWidth={10} />
        <circle
          cx={55}
          cy={55}
          r={r}
          fill="none"
          stroke={pct >= 80 ? "#34c38f" : pct >= 40 ? "#f1b44c" : "#556ee6"}
          strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div
        className="position-absolute d-flex flex-column align-items-center"
      >
        <span className="fw-bold fs-4">{pct}%</span>
        <span className="text-muted" style={{ fontSize: 11 }}>تکمیل</span>
      </div>
    </div>
  );
};

const Stats = () => {
  document.title = "آمار مشاور | داشبورد آیسوق";
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdviserStats();
      setStats(res);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-fluid text-center py-5">
          <Spinner color="primary" />
        </div>
      </div>
    );
  }

  const totalStudents = stats?.totalStudents ?? 0;
  const calledStudents = stats?.totalCalledStudents ?? stats?.calledStudents ?? 0;
  const notCalledStudents = stats?.totalNotCalledStudents ?? stats?.notCalledStudents ?? totalStudents - calledStudents;
  const overallPct = totalStudents > 0 ? Math.round((calledStudents / totalStudents) * 100) : 0;
  const formBreakdown = stats?.formBreakdown ?? stats?.forms ?? [];
  const activityToday = stats?.callsToday ?? stats?.today ?? 0;
  const activityWeek = stats?.callsThisWeek ?? stats?.week ?? 0;
  const activityMonth = stats?.callsThisMonth ?? stats?.month ?? 0;

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="پورتال مشاور" breadcrumbItem="آمار" />

        <Row className="g-3 mb-4">
          <Col xl={2} md={4} xs={6}>
            <StatCard
              label="کل مدارس"
              value={stats?.totalSchools}
              icon="bxs-school"
              color="primary"
            />
          </Col>
          <Col xl={2} md={4} xs={6}>
            <StatCard
              label="فرم‌های تماس"
              value={stats?.totalSupportForms}
              icon="bx-support"
              color="info"
            />
          </Col>
          <Col xl={2} md={4} xs={6}>
            <StatCard
              label="کل دانش‌آموزان"
              value={totalStudents}
              icon="bx-group"
              color="secondary"
            />
          </Col>
          <Col xl={2} md={4} xs={6}>
            <StatCard
              label="تماس گرفته"
              value={calledStudents}
              icon="bx-phone-call"
              color="success"
            />
          </Col>
          <Col xl={2} md={4} xs={6}>
            <StatCard
              label="تماس نگرفته"
              value={notCalledStudents}
              icon="bx-phone-off"
              color="danger"
            />
          </Col>
          <Col xl={2} md={4} xs={6}>
            <StatCard
              label="کل تماس‌ها"
              value={stats?.totalCalls}
              icon="bx-phone"
              color="warning"
            />
          </Col>
        </Row>

        <Row className="g-3 mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <CardBody className="d-flex flex-column align-items-center justify-content-center py-4">
                <h6 className="text-muted mb-3">درصد تکمیل کلی</h6>
                <div className="position-relative">
                  <CircularProgress pct={overallPct} />
                </div>
                <div className="d-flex gap-4 mt-3">
                  <div className="text-center">
                    <h5 className="text-success mb-0">{calledStudents}</h5>
                    <small className="text-muted">تماس گرفته</small>
                  </div>
                  <div className="text-center">
                    <h5 className="text-danger mb-0">{notCalledStudents}</h5>
                    <small className="text-muted">باقی‌مانده</small>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={8}>
            <Card className="border-0 shadow-sm h-100">
              <CardBody>
                <h6 className="text-muted mb-4">فعالیت تماس‌ها</h6>
                <Row className="g-3 text-center">
                  {[
                    { label: "امروز", value: activityToday, icon: "bx-calendar-today", color: "primary" },
                    { label: "این هفته", value: activityWeek, icon: "bx-calendar-week", color: "info" },
                    { label: "این ماه", value: activityMonth, icon: "bx-calendar", color: "warning" },
                    {
                      label: "جلسات پاسخ ثبت‌شده",
                      value: stats?.answerSessionsSubmitted,
                      icon: "bx-check-double",
                      color: "success",
                    },
                  ].map(({ label, value, icon, color }) => (
                    <Col key={label} xs={6} md={3}>
                      <div className={`bg-${color} bg-opacity-10 rounded p-3`}>
                        <i className={`bx ${icon} font-size-24 text-${color} d-block mb-1`} />
                        <h5 className="mb-0 fw-bold">{value ?? "—"}</h5>
                        <small className="text-muted">{label}</small>
                      </div>
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {formBreakdown.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardBody>
              <h6 className="text-muted mb-3">پیشرفت به تفکیک فرم تماس</h6>
              <div className="table-responsive">
                <Table className="table-hover align-middle mb-0" dir="rtl">
                  <thead className="table-light">
                    <tr>
                      <th>عنوان فرم</th>
                      <th style={{ width: 100 }}>کل دانش‌آموزان</th>
                      <th style={{ width: 100 }}>تماس گرفته</th>
                      <th style={{ width: 100 }}>باقی‌مانده</th>
                      <th style={{ width: 100 }}>پاسخ داده‌شده</th>
                      <th style={{ width: 100 }}>کل تماس‌ها</th>
                      <th style={{ width: 180 }}>درصد تکمیل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formBreakdown.map((row) => {
                      const total = row.total || 0;
                      const called = row.called || 0;
                      const pct = total > 0 ? Math.round((called / total) * 100) : 0;
                      return (
                        <tr
                          key={row.id}
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/adviser-calls/forms/${row.id}`)}
                        >
                          <td className="fw-semibold">{row.title || "—"}</td>
                          <td className="text-center">{total}</td>
                          <td className="text-center text-success">{called}</td>
                          <td className="text-center text-danger">{total - called}</td>
                          <td className="text-center">{row.answered ?? "—"}</td>
                          <td className="text-center">{row.totalCalls ?? row.calls ?? "—"}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Progress
                                value={pct}
                                color={pct >= 80 ? "success" : pct >= 40 ? "warning" : "primary"}
                                style={{ height: 6, borderRadius: 3, flex: 1 }}
                              />
                              <span className="small fw-semibold" style={{ width: 35 }}>
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Stats;
