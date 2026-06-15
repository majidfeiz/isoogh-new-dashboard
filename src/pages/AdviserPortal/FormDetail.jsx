import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Progress,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment-jalaali";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getAdviserSupportFormDetail,
  getAdviserSupportFormStats,
  getAdviserFormStudents,
  makeCall,
  submitAnswers,
} from "../../services/adviserPortalService.jsx";

const formatJalali = (value, withTime = false) => {
  if (!value) return "—";
  const numeric = Number(value);
  const date = !Number.isNaN(numeric) && numeric
    ? new Date(numeric < 1_000_000_000_000 ? numeric * 1000 : numeric)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return moment(date).format(withTime ? "jYYYY/jMM/jDD HH:mm" : "jYYYY/jMM/jDD");
};

const formatDuration = (seconds) => {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

// ─── Answer Form Drawer ───────────────────────────────────────────────────────

const AnswerDrawer = ({ open, onClose, student, form, voipCallId, onSubmitted }) => {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setAnswers({});
      setSessionsOpen(false);
    }
  }, [open, student?.id]);

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleCheckbox = (questionId, optionId) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      return {
        ...prev,
        [questionId]: current.includes(optionId)
          ? current.filter((x) => x !== optionId)
          : [...current, optionId],
      };
    });
  };

  const handleSubmit = async () => {
    const questions = form?.questions || [];
    for (const q of questions) {
      if (q.required && !answers[q.id] && answers[q.id] !== 0) {
        toast.error(`لطفاً به سؤال "${q.text}" پاسخ دهید`);
        return;
      }
    }

    const payload = questions.map((q) => {
      const val = answers[q.id];
      if (q.type === 1) return { questionId: q.id, answerId: val };
      if (q.type === 2) return { questionId: q.id, answerId: val };
      return { questionId: q.id, answer: val ?? "" };
    });

    setSubmitting(true);
    try {
      await submitAnswers({
        formId: form.id,
        studentId: student.id,
        answers: payload,
        voipCallId,
      });
      toast.success("پاسخ‌ها با موفقیت ثبت شد");
      onSubmitted?.();
      onClose();
    } catch {
      // handled by httpClient
    } finally {
      setSubmitting(false);
    }
  };

  const sessions = student?.answerSessions || [];

  return (
    <Modal isOpen={open} toggle={onClose} size="lg" scrollable>
      <ModalHeader toggle={onClose}>
        <div>
          <div className="fw-semibold">تکمیل فرم تماس</div>
          {student && (
            <small className="text-muted fw-normal">
              {student.name} — {student.phone}
            </small>
          )}
        </div>
      </ModalHeader>
      <ModalBody className="p-4">
        {sessions.length > 0 && (
          <div className="mb-4">
            <Button
              color="light"
              size="sm"
              className="w-100 d-flex align-items-center justify-content-between"
              onClick={() => setSessionsOpen((v) => !v)}
            >
              <span>
                <i className="bx bx-history me-2" />
                پاسخ‌های قبلی ({sessions.length} جلسه)
              </span>
              <i className={`bx bx-chevron-${sessionsOpen ? "up" : "down"}`} />
            </Button>
            {sessionsOpen && (
              <div className="border rounded p-3 mt-2">
                {sessions.map((sess, idx) => (
                  <div
                    key={idx}
                    className="border-bottom pb-2 mb-2 last:border-0"
                  >
                    <small className="text-muted fw-semibold">
                      {formatJalali(sess.createdAt || sess.created_at, true)}
                    </small>
                    {(sess.answers || []).map((a, ai) => (
                      <div key={ai} className="ms-2 mt-1 small">
                        <span className="text-muted">{a.questionText || a.question}: </span>
                        <span>{a.answer || a.answerText || "—"}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="vstack gap-4">
          {(form?.questions || []).map((q, idx) => (
            <FormGroup key={q.id} className="mb-0">
              <Label className="fw-semibold">
                {idx + 1}. {q.text}
                {q.required && <span className="text-danger ms-1">*</span>}
              </Label>

              {q.type === 0 && (
                <Input
                  type="textarea"
                  rows={3}
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  placeholder="پاسخ خود را بنویسید..."
                />
              )}

              {q.type === 1 && (
                <div className="vstack gap-2 mt-1">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="form-check"
                      role="button"
                      tabIndex={0}
                      style={{ cursor: "pointer" }}
                      onClick={() => setAnswer(q.id, opt.id)}
                      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setAnswer(q.id, opt.id); } }}
                    >
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`q-${q.id}`}
                        id={`opt-${q.id}-${opt.id}`}
                        value={opt.id}
                        checked={answers[q.id] === opt.id}
                        readOnly
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`opt-${q.id}-${opt.id}`}
                        style={{ pointerEvents: "none" }}
                      >
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {q.type === 2 && (
                <div className="vstack gap-2 mt-1">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="form-check"
                      role="button"
                      tabIndex={0}
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleCheckbox(q.id, opt.id)}
                      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleCheckbox(q.id, opt.id); } }}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`opt-${q.id}-${opt.id}`}
                        checked={(answers[q.id] || []).includes(opt.id)}
                        readOnly
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`opt-${q.id}-${opt.id}`}
                        style={{ pointerEvents: "none" }}
                      >
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {q.type === 3 && (
                <Input
                  type="number"
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  placeholder="عدد را وارد کنید..."
                />
              )}
            </FormGroup>
          ))}
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <Button color="light" onClick={onClose} disabled={submitting}>
            انصراف
          </Button>
          <Button color="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Spinner size="sm" className="me-2" /> : <i className="bx bx-save me-2" />}
            ثبت پاسخ‌ها
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ stats, loading }) => {
  if (loading)
    return (
      <Card className="mb-4 border-0 shadow-sm">
        <CardBody className="py-4 text-center">
          <Spinner color="primary" size="sm" />
        </CardBody>
      </Card>
    );
  if (!stats) return null;

  const total      = stats.totalStudents      ?? stats.total      ?? 0;
  const called     = stats.calledStudents     ?? stats.called     ?? 0;
  const notCalled  = stats.notCalledStudents  ?? stats.notCalled  ?? stats.not_called  ?? 0;
  const answered   = stats.answeredStudents   ?? stats.answered   ?? 0;
  const totalCalls = stats.totalCalls         ?? stats.total_calls ?? 0;
  const pct        = Math.min(stats.completionPercent ?? (total > 0 ? Math.round((called / total) * 100) : 0), 100);

  const items = [
    { label: "کل دانش‌آموزان",      value: total,      icon: "bx-group",        color: "primary"   },
    { label: "تماس گرفته شده",      value: called,     icon: "bx-phone-call",   color: "success"   },
    { label: "تماس نگرفته شده",     value: notCalled,  icon: "bx-phone-off",    color: "danger"    },
    { label: "دارای پاسخنامه",      value: answered,   icon: "bx-notepad",      color: "info"      },
    { label: "مجموع تماس‌ها",       value: totalCalls, icon: "bx-phone",        color: "warning"   },
    { label: "درصد تکمیل",          value: `${pct}%`,  icon: "bx-bar-chart-alt-2", color: "secondary" },
  ];

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <CardBody>
        <Row className="g-3 text-center mb-3">
          {items.map(({ label, value, icon, color }) => (
            <Col key={label} xs={6} md={4} lg={2}>
              <div className={`bg-${color} bg-opacity-10 rounded-3 p-3 h-100`}>
                <i className={`bx ${icon} font-size-22 text-${color} mb-1 d-block`} />
                <h5 className="mb-0 fw-bold">{value}</h5>
                <small className="text-muted">{label}</small>
              </div>
            </Col>
          ))}
        </Row>
        <div>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="text-muted small">درصد تکمیل تماس‌ها</span>
            <span className="fw-semibold small">{pct}%</span>
          </div>
          <Progress
            value={pct}
            color={pct >= 80 ? "success" : pct >= 40 ? "warning" : "primary"}
            style={{ height: 8, borderRadius: 4 }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const FormDetail = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 });
  const [search, setSearch] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [lastVoipCallId, setLastVoipCallId] = useState(null);

  const callCooldown = useRef({});
  const [callingIds, setCallingIds] = useState({});

  document.title = `فرم تماس | داشبورد آیسوق`;

  const fetchForm = useCallback(async () => {
    try {
      const f = await getAdviserSupportFormDetail(formId);
      setForm(f);
    } catch {
      setForm(null);
    }
  }, [formId]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await getAdviserSupportFormStats(formId);
      setStats(s);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [formId]);

  const fetchStudents = useCallback(
    async (page = 1, q = "", status = "") => {
      setLoading(true);
      try {
        const res = await getAdviserFormStudents({ formId, page, limit: 15, search: q, callStatus: status });
        setData(res.items || []);
        setMeta(res.pagination || { page, limit: 15, total: 0, lastPage: 1 });
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [formId]
  );

  useEffect(() => {
    fetchForm();
    fetchStats();
    fetchStudents(1, "", "");
  }, [fetchForm, fetchStats, fetchStudents]);

  const handleCallClick = async (student) => {
    const id = student.id;
    if (callCooldown.current[id]) return;

    callCooldown.current[id] = true;
    setCallingIds((p) => ({ ...p, [id]: true }));

    setTimeout(() => {
      callCooldown.current[id] = false;
      setCallingIds((p) => ({ ...p, [id]: false }));
    }, 5000);

    try {
      const result = await makeCall({ supportFormId: Number(formId), studentId: id });
      toast.success("تماس برقرار شد");
      setLastVoipCallId(result?.voipCallId || result?.id || null);
      setSelectedStudent(student);
      setDrawerOpen(true);
      fetchStudents(meta.page, search, callStatus);
      fetchStats();
    } catch {
      // handled by httpClient
      callCooldown.current[id] = false;
      setCallingIds((p) => ({ ...p, [id]: false }));
    }
  };

  const handleViewAnswers = (student) => {
    setSelectedStudent(student);
    setLastVoipCallId(null);
    setDrawerOpen(true);
  };

  const handleAnswerSubmitted = () => {
    fetchStudents(meta.page, search, callStatus);
    fetchStats();
  };

  const handleCallStatusChange = (status) => {
    setCallStatus(status);
    fetchStudents(1, search, status);
  };

  const formTitle = form?.title || `فرم ${formId}`;

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs
          title="تماس مشاوران"
          breadcrumbItem={formTitle}
          titleLink="/adviser-calls"
        />

        {/* Form Info Panel */}
        {form && (
          <Card className="mb-4 border-0 shadow-sm">
            <CardBody>
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-1 fw-semibold">{form.title}</h4>
                  {form.headings && <p className="text-muted mb-0">{form.headings}</p>}
                </Col>
                <Col xs="auto" className="d-flex gap-3 text-muted small">
                  {form.callDuration > 0 && (
                    <span>
                      <i className="bx bx-time me-1 text-primary" />
                      مدت تماس: {formatDuration(form.callDuration)}
                    </span>
                  )}
                  {form.startAt && (
                    <span>
                      <i className="bx bx-calendar me-1 text-success" />
                      شروع: {formatJalali(form.startAt)}
                    </span>
                  )}
                  {form.endAt && (
                    <span>
                      <i className="bx bx-calendar-x me-1 text-danger" />
                      پایان: {formatJalali(form.endAt)}
                    </span>
                  )}
                </Col>
              </Row>
            </CardBody>
          </Card>
        )}

        {/* Stats */}
        <StatsBar stats={stats} loading={statsLoading} />

        {/* Student Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="d-flex flex-wrap align-items-center gap-2 bg-white border-bottom">
            <h5 className="mb-0 me-auto">لیست دانش‌آموزان</h5>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              {loading && <Spinner size="sm" color="primary" />}

              <div className="btn-group">
                {[
                  { value: "", label: "همه" },
                  { value: "called", label: "تماس گرفته" },
                  { value: "not_called", label: "تماس نگرفته" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`btn btn-sm ${callStatus === value ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => handleCallStatusChange(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="input-group input-group-sm" style={{ width: 220 }}>
                <span className="input-group-text">
                  <i className="bx bx-search" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="نام، تلفن یا کد ملی..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (!e.target.value) fetchStudents(1, "", callStatus);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && fetchStudents(1, search, callStatus)}
                />
              </div>
            </div>
          </CardHeader>

          <CardBody className="p-0">
            {loading && data.length === 0 ? (
              <div className="text-center py-5">
                <Spinner color="primary" />
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-5">
                <i className="bx bx-user-x display-4 text-muted" />
                <h5 className="mt-3 text-muted">دانش‌آموزی یافت نشد</h5>
              </div>
            ) : (
              <div className="table-responsive">
                <Table className="table-hover align-middle mb-0" dir="rtl">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th>نام</th>
                      <th>تلفن</th>
                      <th>کد ملی</th>
                      <th>تلفن VoIP</th>
                      <th style={{ width: 100 }}>تماس‌ها</th>
                      <th>آخرین تماس</th>
                      <th style={{ width: 80 }}>پاسخ</th>
                      <th style={{ width: 80 }}>وضعیت</th>
                      <th style={{ width: 120 }}>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((student, idx) => (
                      <tr key={student.id}>
                        <td className="text-muted small">
                          {(meta.page - 1) * meta.limit + idx + 1}
                        </td>
                        <td className="fw-semibold">{student.name || "—"}</td>
                        <td>
                          <span className="text-muted small">{student.phone || "—"}</span>
                        </td>
                        <td>
                          <span className="text-muted small">{student.ssn || "—"}</span>
                        </td>
                        <td>
                          <span className="text-muted small">{student.voipPhone || "—"}</span>
                        </td>
                        <td>
                          <Badge
                            color={student.callCount > 0 ? "success" : "secondary"}
                            pill
                          >
                            {student.callCount}
                          </Badge>
                        </td>
                        <td className="text-muted small">
                          {formatJalali(student.lastCallAt, true)}
                        </td>
                        <td>
                          {student.hasAnswers ? (
                            <i className="bx bx-check-circle text-success font-size-18" />
                          ) : (
                            <i className="bx bx-x-circle text-danger font-size-18" />
                          )}
                        </td>
                        <td>
                          <Badge
                            color={student.status === 1 || student.status === "active" ? "success" : "secondary"}
                            pill
                          >
                            {student.status === 1 || student.status === "active" ? "فعال" : "غیرفعال"}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              color="primary"
                              size="sm"
                              disabled={callingIds[student.id]}
                              onClick={() => handleCallClick(student)}
                              title="برقراری تماس"
                            >
                              {callingIds[student.id] ? (
                                <Spinner size="sm" />
                              ) : (
                                <i className="bx bx-phone" />
                              )}
                            </Button>
                            <Button
                              color="success"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/adviser-calls/forms/${formId}/students/${student.studentId}`
                                )
                              }
                              title="مشاهده پروفایل دانش‌آموز"
                            >
                              <i className="bx bx-user" />
                            </Button>
                            <Button
                              color="info"
                              size="sm"
                              outline
                              onClick={() => handleViewAnswers(student)}
                              title="مشاهده / تکمیل پاسخ‌ها"
                            >
                              <i className="bx bx-show" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>

        {!loading && meta.total > 0 && (
          <div className="mt-3">
            <Paginations
              perPageData={meta.limit}
              data={data}
              totalRecords={meta.total}
              currentPage={meta.page}
              setCurrentPage={(page) => fetchStudents(page, search, callStatus)}
              isShowingPageLength={true}
              paginationDiv="col-sm-auto"
              paginationClass="pagination pagination-sm mb-0"
            />
          </div>
        )}
      </div>

      <AnswerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        student={selectedStudent}
        form={form}
        voipCallId={lastVoipCallId}
        onSubmitted={handleAnswerSubmitted}
      />
    </div>
  );
};

export default FormDetail;
