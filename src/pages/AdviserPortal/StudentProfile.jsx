import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  TabContent,
  TabPane,
  Table,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment-jalaali";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getStudentProfile,
  getStudentCallLogs,
  getStudentAnswers,
  getAdviserSupportFormDetail,
  makeCall,
  submitAnswers,
  getContactSubjects,
  getStudentContacts,
  addStudentContact,
  setDefaultContact,
  deleteStudentContact,
} from "../../services/adviserPortalService.jsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatJalali = (value, withTime = false) => {
  if (!value) return "—";
  const numeric = Number(value);
  const date =
    !Number.isNaN(numeric) && numeric
      ? new Date(numeric < 1_000_000_000_000 ? numeric * 1000 : numeric)
      : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return moment(date).format(withTime ? "jYYYY/jMM/jDD HH:mm" : "jYYYY/jMM/jDD");
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return name[0] || "؟";
};

const dispositionConfig = {
  ANSWERED: { label: "پاسخ داده شد", color: "success" },
  "NO ANSWER": { label: "پاسخ داده نشد", color: "danger" },
  BUSY: { label: "مشغول", color: "warning" },
  FAILED: { label: "ناموفق", color: "secondary" },
};

// ─── Answer Drawer ────────────────────────────────────────────────────────────

const AnswerDrawer = ({ open, onClose, studentName, studentPhone, studentId, form, voipCallId, onSubmitted }) => {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setAnswers({});
  }, [open, studentId]);

  const setAnswer = (qId, value) => setAnswers((p) => ({ ...p, [qId]: value }));
  const toggleCheckbox = (qId, optId) =>
    setAnswers((p) => {
      const cur = p[qId] || [];
      return { ...p, [qId]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] };
    });

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
      if (q.type !== 0) return { questionId: q.id, answerId: val };
      return { questionId: q.id, answer: val ?? "" };
    });
    setSubmitting(true);
    try {
      await submitAnswers({ formId: form.id, studentId, answers: payload, voipCallId });
      toast.success("پاسخ‌ها با موفقیت ثبت شد");
      onSubmitted?.();
      onClose();
    } catch {
      // handled by httpClient
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="lg" scrollable>
      <ModalHeader toggle={onClose}>
        <div>
          <div className="fw-semibold">تکمیل فرم تماس</div>
          {studentName && (
            <small className="text-muted fw-normal">
              {studentName} — {studentPhone}
            </small>
          )}
        </div>
      </ModalHeader>
      <ModalBody className="p-4">
        <div className="vstack gap-4">
          {(form?.questions || []).map((q, idx) => (
            <FormGroup key={q.id} className="mb-0">
              <Label className="fw-semibold">
                {idx + 1}. {q.text}
                {q.required && <span className="text-danger ms-1">*</span>}
              </Label>
              {q.type === 0 && (
                <Input type="textarea" rows={3} value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder="پاسخ خود را بنویسید..." />
              )}
              {q.type !== 0 && !q.multiChoice && (
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
                      <input className="form-check-input" type="radio" name={`q-${q.id}`} id={`opt-${q.id}-${opt.id}`} value={opt.id} checked={answers[q.id] === opt.id} readOnly />
                      <label className="form-check-label" htmlFor={`opt-${q.id}-${opt.id}`} style={{ pointerEvents: "none" }}>{opt.label}</label>
                    </div>
                  ))}
                </div>
              )}
              {q.type !== 0 && q.multiChoice && (
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
                      <input className="form-check-input" type="checkbox" id={`opt-${q.id}-${opt.id}`} checked={(answers[q.id] || []).includes(opt.id)} readOnly />
                      <label className="form-check-label" htmlFor={`opt-${q.id}-${opt.id}`} style={{ pointerEvents: "none" }}>{opt.label}</label>
                    </div>
                  ))}
                </div>
              )}
            </FormGroup>
          ))}
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <Button color="light" onClick={onClose} disabled={submitting}>انصراف</Button>
          <Button color="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Spinner size="sm" className="me-2" /> : <i className="bx bx-save me-2" />}
            ثبت پاسخ‌ها
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

// ─── Info Card ────────────────────────────────────────────────────────────────

const InfoCard = ({ label, value, icon }) => (
  <Col xs={12} sm={6} xl={4}>
    <div className="d-flex align-items-center gap-3 p-3 rounded border bg-white h-100" style={{ transition: "box-shadow .15s" }}>
      <div className="flex-shrink-0 rounded-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: "rgba(80,120,255,.08)" }}>
        <i className={`bx ${icon} font-size-18 text-primary`} />
      </div>
      <div className="overflow-hidden flex-grow-1">
        <div className="text-muted" style={{ fontSize: 11 }}>{label}</div>
        <div className="fw-semibold text-truncate" style={{ fontSize: 14 }}>{value || "—"}</div>
      </div>
    </div>
  </Col>
);

// ─── Tab 1: Student Info ──────────────────────────────────────────────────────

const StudentInfoTab = ({ profile, loading }) => {
  if (loading) return <div className="text-center py-5"><Spinner color="primary" /></div>;
  if (!profile) return <div className="text-center py-5 text-muted">اطلاعاتی یافت نشد</div>;

  const fields = [
    { label: "نام کامل", value: profile.name, icon: "bx-user" },
    { label: "تلفن اول", value: profile.phone, icon: "bx-phone" },
    profile.phone2 && { label: "تلفن دوم", value: profile.phone2, icon: "bx-phone" },
    profile.phone3 && { label: "تلفن سوم", value: profile.phone3, icon: "bx-phone" },
    { label: "کد ملی", value: profile.ssn, icon: "bx-id-card" },
    { label: "تلفن VoIP", value: profile.voipPhone, icon: "bx-headphone" },
    { label: "کد دانش‌آموزی", value: profile.code, icon: "bx-barcode" },
    { label: "تاریخ تولد", value: profile.birthday, icon: "bx-cake" },
    { label: "استان", value: profile.province, icon: "bx-map" },
    { label: "شهر", value: profile.city, icon: "bx-buildings" },
    profile.region && { label: "منطقه", value: profile.region, icon: "bx-map-pin" },
    { label: "نوبت", value: profile.shift, icon: "bx-sun" },
    { label: "نام موسسه", value: profile.instituteName, icon: "bx-building-house" },
    profile.instituteType && { label: "نوع موسسه", value: profile.instituteType, icon: "bx-category" },
    { label: "معدل", value: profile.gpa, icon: "bx-trophy" },
    { label: "تلفن اضطراری", value: profile.emergencyPhone, icon: "bx-phone-incoming" },
  ].filter(Boolean);

  return (
    <Row className="g-3">
      {fields.map((f) => (
        <InfoCard key={f.label} {...f} />
      ))}
    </Row>
  );
};

// ─── Tab 2: Call Logs ─────────────────────────────────────────────────────────

const CallLogsTab = ({ formId, studentId, refreshKey }) => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 });
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getStudentCallLogs({ formId, studentId, page, limit: 15 });
        setData(res.items || []);
        setMeta(res.pagination || { page, limit: 15, total: 0, lastPage: 1 });
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [formId, studentId]
  );

  useEffect(() => { fetchLogs(1); }, [fetchLogs, refreshKey]);

  if (loading && data.length === 0) return <div className="text-center py-5"><Spinner color="primary" /></div>;

  if (!loading && data.length === 0)
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-secondary bg-opacity-10" style={{ width: 72, height: 72 }}>
            <i className="bx bx-phone-off font-size-28 text-secondary" />
          </div>
        </div>
        <h6 className="text-muted">هیچ تماسی ثبت نشده است</h6>
      </div>
    );

  return (
    <div>
      <div className="table-responsive">
        <Table className="table-hover align-middle mb-0" dir="rtl">
          <thead className="table-light">
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th>تاریخ تماس</th>
              <th>وضعیت</th>
              <th>مدت زمان</th>
              <th>شماره مقصد</th>
              <th style={{ width: 80 }} className="text-center">پاسخنامه</th>
            </tr>
          </thead>
          <tbody>
            {data.map((log, idx) => {
              const disp = dispositionConfig[log.disposition] || { label: log.disposition, color: "secondary" };
              return (
                <tr key={log.id}>
                  <td className="text-muted small">{(meta.page - 1) * meta.limit + idx + 1}</td>
                  <td className="small">{formatJalali(log.createdAt, true)}</td>
                  <td>
                    <Badge color={disp.color} pill className="px-2 py-1">{disp.label}</Badge>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark font-monospace">{log.duration || "—"}</span>
                  </td>
                  <td className="text-muted small">{log.toPhone || "—"}</td>
                  <td className="text-center">
                    {log.hasAnswers
                      ? <i className="bx bx-check-circle text-success font-size-18" title="پاسخنامه دارد" />
                      : <i className="bx bx-x-circle text-danger font-size-18" title="بدون پاسخنامه" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      {meta.total > meta.limit && (
        <div className="mt-3">
          <Paginations perPageData={meta.limit} data={data} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={fetchLogs} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />
        </div>
      )}
    </div>
  );
};

// ─── Tab 3: Answers ───────────────────────────────────────────────────────────

const AnswersTab = ({ formId, studentId, refreshKey, onFillAnswers }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState({});

  const fetchAnswers = useCallback(() => {
    setLoading(true);
    getStudentAnswers(formId, studentId)
      .then((d) => setSessions(Array.isArray(d) ? d : []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [formId, studentId]);

  useEffect(() => { fetchAnswers(); }, [fetchAnswers, refreshKey]);

  if (loading) return <div className="text-center py-5"><Spinner color="primary" /></div>;

  if (sessions.length === 0)
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10" style={{ width: 72, height: 72 }}>
            <i className="bx bx-file-blank font-size-28 text-warning" />
          </div>
        </div>
        <h6 className="text-muted mb-3">هیچ پاسخنامه‌ای ثبت نشده است</h6>
        <Button color="primary" onClick={onFillAnswers}>
          <i className="bx bx-edit me-2" />
          پر کردن پاسخنامه
        </Button>
      </div>
    );

  const toggle = (idx) => setOpen((p) => ({ ...p, [idx]: !p[idx] }));

  return (
    <div className="vstack gap-2">
      {sessions.map((session, idx) => (
        <div key={idx} className="border rounded overflow-hidden">
          <div
            className="d-flex align-items-center justify-content-between px-3 py-3 bg-light"
            style={{ cursor: "pointer" }}
            onClick={() => toggle(idx)}
          >
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                <span className="text-white" style={{ fontSize: 11, fontWeight: 700 }}>{idx + 1}</span>
              </div>
              <span className="fw-semibold" style={{ fontSize: 14 }}>
                جلسه {idx + 1} — {formatJalali(session.sessionDate, true)}
              </span>
              <Badge color="primary" pill className="px-2">{session.answers?.length || 0} پاسخ</Badge>
            </div>
            <i className={`bx bx-chevron-${open[idx] ? "up" : "down"} font-size-18 text-muted`} />
          </div>
          {open[idx] && (
            <div className="p-3 vstack gap-0">
              {(session.answers || []).length === 0 ? (
                <p className="text-muted small mb-0">پاسخی ثبت نشده</p>
              ) : (
                (session.answers || []).map((a, ai) => (
                  <div key={a.id} className={`py-2 d-flex gap-3 ${ai < session.answers.length - 1 ? "border-bottom" : ""}`}>
                    <div className="flex-shrink-0 text-muted" style={{ minWidth: 22 }}>
                      <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-circle" style={{ width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{ai + 1}</span>
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-muted" style={{ fontSize: 12 }}>{a.questionTitle}</div>
                      <div className="fw-semibold" style={{ fontSize: 14 }}>{a.answerText ?? a.answer ?? "—"}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Tab 4: Phone Book ───────────────────────────────────────────────────────

const PhoneBookTab = ({ formId, studentId, subjects }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [settingDefaultId, setSettingDefaultId] = useState(null);
  const [form, setForm] = useState({ phoneNumber: "", subjectId: "", setAsDefault: false });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchContacts = useCallback(() => {
    setLoading(true);
    getStudentContacts(formId, studentId)
      .then((d) => setContacts(Array.isArray(d) ? d : []))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, [formId, studentId]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.phoneNumber.trim()) { toast.error("شماره تلفن الزامی است"); return; }
    if (!form.subjectId) { toast.error("نوع تماس را انتخاب کنید"); return; }
    setSubmitting(true);
    try {
      await addStudentContact(formId, studentId, {
        phoneNumber: form.phoneNumber.trim(),
        subjectId: Number(form.subjectId),
        setAsDefault: form.setAsDefault,
      });
      toast.success("شماره با موفقیت افزوده شد");
      setForm({ phoneNumber: "", subjectId: "", setAsDefault: false });
      setShowForm(false);
      fetchContacts();
    } catch {
      // handled by httpClient
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (contactId) => {
    setSettingDefaultId(contactId);
    try {
      await setDefaultContact(formId, studentId, contactId);
      toast.success("شماره پیش‌فرض تغییر کرد");
      fetchContacts();
    } catch {
      // handled
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDelete = async (contactId) => {
    setDeletingId(contactId);
    try {
      await deleteStudentContact(formId, studentId, contactId);
      toast.success("شماره حذف شد");
      fetchContacts();
    } catch {
      // handled
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="mb-0 fw-semibold text-muted">
          <i className="bx bx-phone-square me-2 text-primary" />
          شماره‌های ثبت‌شده
          {contacts.length > 0 && (
            <Badge color="primary" pill className="ms-2">{contacts.length}</Badge>
          )}
        </h6>
        <Button
          color={showForm ? "light" : "primary"}
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="d-flex align-items-center gap-1"
        >
          <i className={`bx ${showForm ? "bx-x" : "bx-plus"}`} />
          {showForm ? "انصراف" : "افزودن شماره"}
        </Button>
      </div>

      {/* Inline Add Form */}
      {showForm && (
        <div className="border rounded-3 p-3 mb-3 bg-light">
          <form onSubmit={handleAdd}>
            <Row className="g-2 align-items-end">
              <Col xs={12} sm={4}>
                <Label className="fw-semibold small mb-1">نوع تماس</Label>
                <Input
                  type="select"
                  bsSize="sm"
                  value={form.subjectId}
                  onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}
                >
                  <option value="">انتخاب کنید...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.subject}</option>
                  ))}
                </Input>
              </Col>
              <Col xs={12} sm={4}>
                <Label className="fw-semibold small mb-1">شماره تلفن</Label>
                <Input
                  type="text"
                  bsSize="sm"
                  placeholder="09xxxxxxxxx"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                  maxLength={11}
                />
              </Col>
              <Col xs={12} sm={3}>
                <div className="form-check mt-sm-4 pt-sm-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="setAsDefault"
                    checked={form.setAsDefault}
                    onChange={(e) => setForm((p) => ({ ...p, setAsDefault: e.target.checked }))}
                  />
                  <label className="form-check-label small" htmlFor="setAsDefault">
                    شماره پیش‌فرض
                  </label>
                </div>
              </Col>
              <Col xs={12} sm={1} className="d-flex align-items-end">
                <Button
                  type="submit"
                  color="success"
                  size="sm"
                  disabled={submitting}
                  className="w-100"
                  title="ذخیره"
                >
                  {submitting ? <Spinner size="sm" /> : <i className="bx bx-check font-size-16" />}
                </Button>
              </Col>
            </Row>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-5"><Spinner color="primary" /></div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-5">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 mb-3" style={{ width: 72, height: 72 }}>
            <i className="bx bx-phone-square font-size-28 text-primary" />
          </div>
          <h6 className="text-muted">هنوز شماره‌ای اضافه نشده</h6>
          {!showForm && (
            <Button color="primary" size="sm" className="mt-2" onClick={() => setShowForm(true)}>
              <i className="bx bx-plus me-1" />افزودن اولین شماره
            </Button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <Table className="table-hover align-middle mb-0" dir="rtl">
            <thead className="table-light">
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>نوع تماس</th>
                <th>شماره تلفن</th>
                <th style={{ width: 100 }} className="text-center">وضعیت</th>
                <th style={{ width: 120 }} className="text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, idx) => (
                <tr key={c.id} className={c.isDefault ? "table-success bg-opacity-50" : ""}>
                  <td className="text-muted small">{idx + 1}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10" style={{ width: 28, height: 28 }}>
                        <i className="bx bx-user-circle text-primary" style={{ fontSize: 15 }} />
                      </div>
                      <span className="fw-semibold" style={{ fontSize: 14 }}>{c.subjectName || "—"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {c.isDefault && (
                        <i className="bx bx-phone text-success font-size-16" title="شماره پیش‌فرض" />
                      )}
                      <span className="font-monospace" style={{ fontSize: 14, letterSpacing: 1 }}>
                        {c.phoneNumber}
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    {c.isDefault ? (
                      <Badge color="success" pill className="px-3 py-1">
                        <i className="bx bx-star-full me-1" />پیش‌فرض
                      </Badge>
                    ) : (
                      <Badge color="light" pill className="text-muted px-3 py-1">عادی</Badge>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center">
                      {!c.isDefault && (
                        <Button
                          color="warning"
                          size="sm"
                          outline
                          disabled={settingDefaultId === c.id}
                          onClick={() => handleSetDefault(c.id)}
                          title="تنظیم به عنوان پیش‌فرض"
                        >
                          {settingDefaultId === c.id
                            ? <Spinner size="sm" />
                            : <i className="bx bx-star" />}
                        </Button>
                      )}
                      <Button
                        color="danger"
                        size="sm"
                        outline
                        disabled={deletingId === c.id}
                        onClick={() => setConfirmDelete(c)}
                        title="حذف شماره"
                      >
                        {deletingId === c.id
                          ? <Spinner size="sm" />
                          : <i className="bx bx-trash" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!confirmDelete} toggle={() => setConfirmDelete(null)} centered size="sm">
        <ModalHeader toggle={() => setConfirmDelete(null)}>تأیید حذف</ModalHeader>
        <ModalBody className="text-center py-4">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 mb-3" style={{ width: 56, height: 56 }}>
            <i className="bx bx-trash text-danger font-size-24" />
          </div>
          <p className="mb-1">آیا می‌خواهید این شماره را حذف کنید؟</p>
          <p className="fw-bold font-monospace text-danger mb-4">{confirmDelete?.phoneNumber}</p>
          <div className="d-flex gap-2 justify-content-center">
            <Button color="light" onClick={() => setConfirmDelete(null)}>انصراف</Button>
            <Button
              color="danger"
              disabled={deletingId === confirmDelete?.id}
              onClick={() => handleDelete(confirmDelete.id)}
            >
              {deletingId === confirmDelete?.id ? <Spinner size="sm" className="me-1" /> : <i className="bx bx-trash me-1" />}
              حذف
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

// ─── Stat Mini Card ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, color, pulse }) => (
  <Col xs={6} md={3}>
    <div className={`rounded-3 p-3 text-center h-100 position-relative overflow-hidden`} style={{ background: `linear-gradient(135deg, var(--bs-${color}-bg-subtle, rgba(0,0,0,.05)) 0%, rgba(255,255,255,.6) 100%)`, border: `1px solid rgba(0,0,0,.06)` }}>
      {pulse && (
        <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-success" style={{ fontSize: 8, padding: "3px 5px" }}>
          <span className="visually-hidden">فعال</span>
          ●
        </span>
      )}
      <i className={`bx ${icon} font-size-20 text-${color} mb-1 d-block`} />
      <div className="fw-bold" style={{ fontSize: 16 }}>{value}</div>
      <div className="text-muted" style={{ fontSize: 11 }}>{label}</div>
    </div>
  </Col>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const StudentProfile = () => {
  const { formId, studentId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const [activeTab, setActiveTab] = useState("info");
  const [refreshKey, setRefreshKey] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastVoipCallId, setLastVoipCallId] = useState(null);
  const [calling, setCalling] = useState(false);
  const cooldown = useRef(false);

  document.title = "پروفایل دانش‌آموز | داشبورد آیسوق";

  const fetchProfile = useCallback(() => {
    setProfileLoading(true);
    return getStudentProfile(formId, studentId)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [formId, studentId]);

  useEffect(() => {
    fetchProfile();
    getAdviserSupportFormDetail(formId).then(setForm).catch(() => {});
    getContactSubjects().then((d) => setSubjects(Array.isArray(d) ? d : [])).catch(() => {});
  }, [formId, studentId, fetchProfile]);

  const handleCall = async () => {
    if (cooldown.current || calling) return;
    cooldown.current = true;
    setCalling(true);
    setTimeout(() => { cooldown.current = false; }, 5000);
    try {
      const result = await makeCall({ supportFormId: Number(formId), studentId: Number(studentId) });
      toast.success("تماس برقرار شد");
      setLastVoipCallId(result?.voipCallId || result?.id || null);
      setDrawerOpen(true);
    } catch {
      cooldown.current = false;
    } finally {
      setCalling(false);
    }
  };

  const handleAnswerSubmitted = () => {
    fetchProfile();
    setRefreshKey((k) => k + 1);
  };

  const handleFillAnswers = () => {
    setDrawerOpen(true);
    setLastVoipCallId(null);
  };

  const breadcrumbTitle = profile?.supportFormTitle || `فرم ${formId}`;
  const initials = profile ? getInitials(profile.name) : "؟";

  const tabs = [
    { id: "info",      label: "اطلاعات",       icon: "bx-user-circle"   },
    { id: "calls",     label: "لاگ تماس‌ها",   icon: "bx-phone-call"    },
    { id: "answers",   label: "پاسخنامه‌ها",   icon: "bx-notepad"       },
    { id: "phonebook", label: "دفترچه تلفن",   icon: "bx-phone-square"  },
  ];

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs
          title={breadcrumbTitle}
          breadcrumbItem={profile?.name || "پروفایل دانش‌آموز"}
          titleLink={`/adviser-calls/forms/${formId}`}
        />

        {/* ── Hero Card ──────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm mb-4 overflow-hidden">
          <div style={{ background: "linear-gradient(135deg, #3b5de7 0%, #45b3e0 100%)", padding: "28px 28px 0" }}>
            <div className="d-flex align-items-end gap-4 flex-wrap">
              {/* Avatar */}
              <div className="flex-shrink-0 position-relative" style={{ marginBottom: -28 }}>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow"
                  style={{ width: 88, height: 88, fontSize: 28, background: "rgba(255,255,255,.25)", border: "4px solid rgba(255,255,255,.5)", letterSpacing: 1 }}
                >
                  {profileLoading ? <Spinner color="light" size="sm" /> : initials}
                </div>
              </div>

              {/* Name + meta */}
              <div className="flex-grow-1 text-white pb-4">
                {profileLoading ? (
                  <div className="placeholder-glow"><span className="placeholder col-4 rounded" style={{ height: 24 }} /></div>
                ) : (
                  <>
                    <h3 className="mb-1 fw-bold text-white">{profile?.name || "—"}</h3>
                    <div className="d-flex flex-wrap gap-3" style={{ opacity: .85, fontSize: 13 }}>
                      {profile?.phone && <span><i className="bx bx-phone me-1" />{profile.phone}</span>}
                      {profile?.code && <span><i className="bx bx-barcode me-1" />{profile.code}</span>}
                      {profile?.instituteName && <span><i className="bx bx-building me-1" />{profile.instituteName}</span>}
                      {profile?.city && <span><i className="bx bx-map me-1" />{profile.city}</span>}
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="d-flex gap-2 pb-4 flex-shrink-0">
                <Button
                  color="light"
                  size="sm"
                  onClick={() => navigate(`/adviser-calls/forms/${formId}`)}
                  className="d-flex align-items-center gap-1"
                >
                  <i className="bx bx-arrow-back" />
                  بازگشت
                </Button>
                <Button
                  color="warning"
                  size="sm"
                  onClick={handleFillAnswers}
                  disabled={profileLoading}
                  className="d-flex align-items-center gap-1"
                >
                  <i className="bx bx-edit" />
                  پاسخنامه
                </Button>
                <Button
                  color="success"
                  onClick={handleCall}
                  disabled={calling || profileLoading}
                  className="d-flex align-items-center gap-2 px-4"
                  style={{ fontWeight: 600 }}
                >
                  {calling ? (
                    <><Spinner size="sm" />در حال تماس...</>
                  ) : (
                    <><i className="bx bx-phone-call font-size-16" />برقراری تماس</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <CardBody className="pt-4">
            <Row className="g-3">
              <StatCard label="تعداد تماس‌ها" value={profileLoading ? "…" : (profile?.totalCalls ?? 0)} icon="bx-phone" color="primary" />
              <StatCard label="آخرین تماس" value={profileLoading ? "…" : formatJalali(profile?.lastCallAt, false)} icon="bx-time-five" color="info" />
              <StatCard label="پاسخنامه" value={profileLoading ? "…" : (profile?.hasAnswers ? "دارد" : "ندارد")} icon="bx-notepad" color={profile?.hasAnswers ? "success" : "danger"} pulse={profile?.hasAnswers} />
              <StatCard label="فرم تماس" value={profileLoading ? "…" : (profile?.supportFormTitle || "—")} icon="bx-list-ul" color="secondary" />
            </Row>
          </CardBody>
        </Card>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <div className="border-bottom px-4 pt-3">
            <Nav tabs className="nav-tabs-custom border-0 gap-1">
              {tabs.map(({ id, label, icon }) => (
                <NavItem key={id}>
                  <NavLink
                    className={`d-flex align-items-center gap-2 px-3 py-2 rounded-top ${activeTab === id ? "active fw-semibold" : "text-muted"}`}
                    onClick={() => setActiveTab(id)}
                    style={{ cursor: "pointer", fontSize: 14, border: "none", background: "none" }}
                  >
                    <i className={`bx ${icon} font-size-16`} />
                    {label}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </div>

          <CardBody className="p-4">
            <TabContent activeTab={activeTab}>
              <TabPane tabId="info">
                <StudentInfoTab profile={profile} loading={profileLoading} />
              </TabPane>
              <TabPane tabId="calls">
                {activeTab === "calls" && (
                  <CallLogsTab formId={formId} studentId={studentId} refreshKey={refreshKey} />
                )}
              </TabPane>
              <TabPane tabId="answers">
                {activeTab === "answers" && (
                  <AnswersTab
                    formId={formId}
                    studentId={studentId}
                    refreshKey={refreshKey}
                    onFillAnswers={handleFillAnswers}
                  />
                )}
              </TabPane>
              <TabPane tabId="phonebook">
                {activeTab === "phonebook" && (
                  <PhoneBookTab
                    formId={formId}
                    studentId={studentId}
                    subjects={subjects}
                  />
                )}
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </div>

      <AnswerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        studentName={profile?.name}
        studentPhone={profile?.phone}
        studentId={Number(studentId)}
        form={form}
        voipCallId={lastVoipCallId}
        onSubmitted={handleAnswerSubmitted}
      />
    </div>
  );
};

export default StudentProfile;
