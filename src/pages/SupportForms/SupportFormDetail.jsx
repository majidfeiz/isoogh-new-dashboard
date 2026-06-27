// src/pages/SupportForms/SupportFormDetail.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import classnames from "classnames";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
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
} from "reactstrap";
import moment from "moment-jalaali";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import DeleteModal from "../../components/Common/DeleteModal.jsx";
import {
  getSupportForm,
  getSupportFormQuestions,
  upsertSupportFormQuestion,
  deleteSupportFormQuestion,
  getSupportFormAdvisers,
  getSupportFormAdviserCandidates,
  upsertSupportFormAdviser,
  toggleSupportFormAdviserActive,
  detachSupportFormAdviser,
  getSupportFormAdviserStudents,
  getSupportFormAdviserStudentCandidates,
  attachSupportFormAdviserStudents,
  attachSupportFormAdviserStudentsByTag,
  autoImportAdviserStudents,
  detachSupportFormAdviserStudent,
  detachSupportFormAdviserStudents,
  changeStudentSupportFormStatus,
  getSupportFormAllStudents,
  getSupportFormInterruptedCalls,
  copySupportForm,
} from "../../services/supportFormService.jsx";
import { getParentTags, getParentTagValues } from "../../services/parentTagService.jsx";
import { getGrades } from "../../services/gradeService.jsx";

const TAB = {
  OVERVIEW: "1",
  QUESTIONS: "2",
  ADVISERS: "3",
  STUDENTS: "4",
  ALL_STUDENTS: "5",
  INTERRUPTED: "6",
};

const formatDate = (value) => {
  if (!value && value !== 0) return "-";
  const numeric = Number(value);
  const date =
    !Number.isNaN(numeric) && numeric
      ? new Date(numeric < 1_000_000_000_000 ? numeric * 1000 : numeric)
      : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return moment(date).format("jYYYY/jMM/jDD");
};

const StatusBadge = ({ status }) => {
  if (status === 2)
    return <Badge color="warning">قطع‌شده</Badge>;
  return <Badge color="success">نرمال</Badge>;
};

const makeClientId = () => `cid_${Math.random().toString(36).slice(2, 9)}`;

const buildQuestion = (data = {}) => ({
  _cid: data._cid || makeClientId(),
  id: data.id,
  question: data.question || "",
  answer: data.answer || "",
  score: data.score ?? 0,
  required: data.required ?? true,
  title: data.title || "",
  type: data.type ?? 0,
  multi_choice: data.multi_choice ?? false,
  rtl: data.rtl ?? false,
  options: Array.isArray(data.options)
    ? data.options.map((o) => ({ _cid: o._cid || makeClientId(), id: o.id, answer: o.answer || "", is_correct: o.is_correct ?? false }))
    : [],
});

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const OverviewTab = ({ formData, formId, onEdit, onCopy, copyLoading }) => {
  const parseJson = (str) => {
    if (Array.isArray(str)) return str;
    if (!str) return [];
    try {
      let parsed = JSON.parse(str);
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch { /* not double-encoded */ }
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  };

  const headings = parseJson(formData?.headings);
  const problems = parseJson(formData?.problems);
  const priorities = parseJson(formData?.priorities);
  const questions = formData?.questions || [];

  const statusLabel = { 0: "غیرفعال", 1: "هشدار", 2: "مسدود" };

  return (
    <div>
      <div className="d-flex gap-2 mb-4">
        <Button color="warning" onClick={onEdit}>
          <i className="mdi mdi-pencil me-1" />
          ویرایش فرم
        </Button>
        <Button color="info" onClick={onCopy} disabled={copyLoading}>
          {copyLoading ? "در حال کپی..." : <><i className="mdi mdi-content-copy me-1" />کپی فرم</>}
        </Button>
      </div>

      <Row className="g-3">
        <Col md="6">
          <Label className="text-muted small mb-1">عنوان</Label>
          <p className="fw-semibold">{formData?.title || "-"}</p>
        </Col>
        <Col md="6">
          <Label className="text-muted small mb-1">شماره تماس</Label>
          <p>{formData?.phone_number || "-"}</p>
        </Col>
        <Col md="3">
          <Label className="text-muted small mb-1">تاریخ شروع</Label>
          <p>{formatDate(formData?.start_at)}</p>
        </Col>
        <Col md="3">
          <Label className="text-muted small mb-1">تاریخ پایان</Label>
          <p>{formatDate(formData?.end_at)}</p>
        </Col>
        <Col md="3">
          <Label className="text-muted small mb-1">مدت تماس (ثانیه)</Label>
          <p>{formData?.call_duration ?? "-"}</p>
        </Col>
        <Col md="3">
          <Label className="text-muted small mb-1">تماس همزمان</Label>
          <p>{formData?.concurrent_calls ?? "-"}</p>
        </Col>
        <Col md="3">
          <Label className="text-muted small mb-1">حداقل زمان تایید</Label>
          <p>{formData?.accepted_duration_time ?? "-"}</p>
        </Col>
        <Col md="3">
          <Label className="text-muted small mb-1">تعداد تماس مجاز</Label>
          <p>{formData?.accepted_allow_number_of_calls ?? "-"}</p>
        </Col>
        <Col md="3">
          <Label className="text-muted small mb-1">وضعیت محدودیت تماس</Label>
          <p>{statusLabel[formData?.accepted_allow_number_of_calls_status] ?? "-"}</p>
        </Col>
        <Col md="3">
          <Label className="text-muted small mb-1">مدت انتظار (ثانیه)</Label>
          <p>{formData?.waiting_call_duration ?? "-"}</p>
        </Col>

        {headings.length > 0 && (
          <Col md="12">
            <Label className="text-muted small mb-1">تیترها</Label>
            {headings.map((h, i) => (
              <div key={i} className="mb-1 border-start border-2 ps-2">
                <strong>{h.headings_title || h.title}</strong>
                {(h.headings_body || h.body) && <span className="ms-2 text-muted">{h.headings_body || h.body}</span>}
              </div>
            ))}
          </Col>
        )}

        {problems.length > 0 && (
          <Col md="12">
            <Label className="text-muted small mb-1">مشکلات</Label>
            {problems.map((p, i) => (
              <div key={i} className="mb-1 border-start border-2 border-danger ps-2">
                <strong>{p.problem_title || p.title}</strong>
                {(p.problem_body || p.body) && <span className="ms-2 text-muted">{p.problem_body || p.body}</span>}
              </div>
            ))}
          </Col>
        )}

        {priorities.length > 0 && (
          <Col md="12">
            <Label className="text-muted small mb-1">اولویت‌ها</Label>
            <div className="d-flex flex-wrap gap-2">
              {priorities.map((p, i) => (
                <Badge key={i} color="light" className="text-dark border">
                  شماره {p.phone} — تماس: {p.call_no} — پیامک: {p.sms_no}
                </Badge>
              ))}
            </div>
          </Col>
        )}

        {questions.length > 0 && (
          <Col md="12">
            <Label className="text-muted small mb-1">سوالات ({questions.length})</Label>
            <div className="d-flex flex-column gap-2">
              {questions.map((q, i) => (
                <div key={q.id || i} className="border rounded p-2">
                  <div className="d-flex gap-2 align-items-center">
                    <Badge color="secondary">{i + 1}</Badge>
                    <span className="fw-semibold">{q.question}</span>
                    {q.required && <Badge color="danger" className="ms-auto">اجباری</Badge>}
                    <Badge color={q.type === 0 ? "light" : "info"} className="text-dark border">
                      {q.type === 0 ? "تشریحی" : "چندگزینه‌ای"}
                    </Badge>
                  </div>
                  {q.options?.length > 0 && (
                    <div className="mt-1 ms-3 d-flex flex-wrap gap-1">
                      {q.options.map((opt, oi) => (
                        <Badge key={oi} color={opt.is_correct ? "success" : "light"} className="text-dark border">
                          {opt.answer}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

// ─── Questions Tab ─────────────────────────────────────────────────────────────

const QuestionsTab = ({ formId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [editQ, setEditQ] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getSupportFormQuestions(formId);
      setQuestions(items.map(buildQuestion));
    } catch {
      setAlert({ type: "danger", message: "خطا در دریافت سوالات." });
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const startEdit = (q) => setEditQ(buildQuestion(q));
  const startNew = () => setEditQ(buildQuestion());

  const handleEditChange = (field, value) =>
    setEditQ((prev) => ({ ...prev, [field]: value }));

  const handleOptionChange = (oi, field, value) =>
    setEditQ((prev) => ({
      ...prev,
      options: prev.options.map((o, idx) => (idx === oi ? { ...o, [field]: value } : o)),
    }));

  const addOption = () =>
    setEditQ((prev) => ({
      ...prev,
      options: [...prev.options, { _cid: makeClientId(), answer: "", is_correct: false }],
    }));

  const removeOption = (oi) =>
    setEditQ((prev) => ({ ...prev, options: prev.options.filter((_, idx) => idx !== oi) }));

  const handleSave = async () => {
    if (!editQ.question.trim()) {
      setAlert({ type: "warning", message: "متن سوال الزامی است." });
      return;
    }
    setSaving(true);
    setAlert(null);
    try {
      const payload = {
        ...(editQ.id ? { id: editQ.id } : {}),
        question: editQ.question.trim(),
        answer: editQ.answer || null,
        score: Number(editQ.score) || 0,
        required: !!editQ.required,
        title: editQ.title || null,
        type: Number(editQ.type) || 0,
        multi_choice: !!editQ.multi_choice,
        rtl: !!editQ.rtl,
        options: editQ.options.map((o) => ({
          ...(o.id ? { id: o.id } : {}),
          answer: o.answer,
          is_correct: !!o.is_correct,
        })),
      };
      await upsertSupportFormQuestion(formId, payload);
      setAlert({ type: "success", message: editQ.id ? "سوال ویرایش شد." : "سوال اضافه شد." });
      setEditQ(null);
      await loadQuestions();
    } catch {
      setAlert({ type: "danger", message: "خطا در ذخیره سوال." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setSaving(true);
    try {
      await deleteSupportFormQuestion(formId, pendingDelete.id);
      setAlert({ type: "success", message: "سوال حذف شد." });
      await loadQuestions();
    } catch {
      setAlert({ type: "danger", message: "خطا در حذف سوال." });
    } finally {
      setSaving(false);
      setDeleteModal(false);
      setPendingDelete(null);
    }
  };

  return (
    <div>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDelete}
        onCloseClick={() => { setDeleteModal(false); setPendingDelete(null); }}
      />
      {alert && <Alert color={alert.type} className="mb-3">{alert.message}</Alert>}

      <div className="d-flex justify-content-end mb-3">
        <Button color="primary" onClick={startNew}>
          <i className="mdi mdi-plus me-1" />
          سوال جدید
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4"><Spinner color="primary" /></div>
      ) : questions.length === 0 ? (
        <div className="text-center py-4 text-muted">سوالی ثبت نشده است.</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {questions.map((q, i) => (
            <Card key={q._cid} className="border mb-0">
              <CardBody>
                <div className="d-flex align-items-start justify-content-between gap-2">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Badge color="secondary">{i + 1}</Badge>
                      {q.code && <Badge color="light" className="text-dark border font-monospace">{q.code}</Badge>}
                      <span className="fw-semibold">{q.question}</span>
                    </div>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      <Badge color={q.type === 0 ? "light" : "info"} className="text-dark border">
                        {q.type === 0 ? "تشریحی" : "چندگزینه‌ای"}
                      </Badge>
                      {q.required && <Badge color="danger">اجباری</Badge>}
                      {q.multi_choice && <Badge color="warning">چندانتخابی</Badge>}
                      {q.rtl && <Badge color="light" className="text-dark border">RTL</Badge>}
                      {q.score > 0 && <Badge color="light" className="text-dark border">امتیاز: {q.score}</Badge>}
                    </div>
                    {q.options.length > 0 && (
                      <div className="mt-2 d-flex flex-wrap gap-1">
                        {q.options.map((o, oi) => (
                          <Badge key={oi} color={o.is_correct ? "success" : "light"} className="text-dark border">
                            {o.answer}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-1 flex-shrink-0">
                    <Button size="sm" color="warning" onClick={() => startEdit(q)}>ویرایش</Button>
                    <Button size="sm" color="danger" onClick={() => { setPendingDelete(q); setDeleteModal(true); }}>حذف</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {editQ && (
        <Modal isOpen toggle={() => setEditQ(null)} size="lg" centered>
          <ModalHeader toggle={() => setEditQ(null)}>
            {editQ.id ? "ویرایش سوال" : "سوال جدید"}
          </ModalHeader>
          <ModalBody>
            {alert && <Alert color={alert.type} className="mb-3">{alert.message}</Alert>}
            <Row className="g-3">
              <Col md="12">
                <FormGroup>
                  <Label>متن سوال *</Label>
                  <Input
                    value={editQ.question}
                    onChange={(e) => handleEditChange("question", e.target.value)}
                    placeholder="متن سوال را وارد کنید"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>عنوان (اختیاری)</Label>
                  <Input
                    value={editQ.title}
                    onChange={(e) => handleEditChange("title", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>پاسخ پیش‌فرض (اختیاری)</Label>
                  <Input
                    value={editQ.answer}
                    onChange={(e) => handleEditChange("answer", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label>نوع</Label>
                  <Input
                    type="select"
                    value={editQ.type}
                    onChange={(e) => handleEditChange("type", Number(e.target.value))}
                  >
                    <option value={0}>تشریحی</option>
                    <option value={1}>چندگزینه‌ای</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="2">
                <FormGroup>
                  <Label>امتیاز</Label>
                  <Input
                    type="number"
                    value={editQ.score}
                    onChange={(e) => handleEditChange("score", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md="6" className="d-flex align-items-center gap-4 pt-4">
                <div
                  className="form-check"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEditChange("required", !editQ.required)}
                  onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleEditChange("required", !editQ.required); } }}
                >
                  <input
                    type="checkbox"
                    id="qRequired"
                    className="form-check-input"
                    checked={!!editQ.required}
                    readOnly
                  />
                  <label className="form-check-label" htmlFor="qRequired" style={{ pointerEvents: "none" }}>اجباری</label>
                </div>
                {editQ.type === 1 && (
                  <div
                    className="form-check"
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEditChange("multi_choice", !editQ.multi_choice)}
                    onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleEditChange("multi_choice", !editQ.multi_choice); } }}
                  >
                    <input
                      type="checkbox"
                      id="qMulti"
                      className="form-check-input"
                      checked={!!editQ.multi_choice}
                      readOnly
                    />
                    <label className="form-check-label" htmlFor="qMulti" style={{ pointerEvents: "none" }}>چندانتخابی</label>
                  </div>
                )}
                <div
                  className="form-check"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEditChange("rtl", !editQ.rtl)}
                  onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleEditChange("rtl", !editQ.rtl); } }}
                >
                  <input
                    type="checkbox"
                    id="qRtl"
                    className="form-check-input"
                    checked={!!editQ.rtl}
                    readOnly
                  />
                  <label className="form-check-label" htmlFor="qRtl" style={{ pointerEvents: "none" }}>RTL</label>
                </div>
              </Col>

              {editQ.type === 1 && (
                <Col md="12">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <Label className="mb-0">گزینه‌ها</Label>
                    <Button size="sm" color="light" type="button" onClick={addOption}>افزودن گزینه</Button>
                  </div>
                  {editQ.options.map((o, oi) => (
                    <div key={o._cid} className="d-flex gap-2 align-items-center mb-2">
                      <Input
                        value={o.answer}
                        onChange={(e) => handleOptionChange(oi, "answer", e.target.value)}
                        placeholder={`گزینه ${oi + 1}`}
                      />
                      <div
                        className="form-check flex-shrink-0"
                        role="button"
                        tabIndex={0}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOptionChange(oi, "is_correct", !o.is_correct)}
                        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleOptionChange(oi, "is_correct", !o.is_correct); } }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`optCorrect_${oi}`}
                          checked={!!o.is_correct}
                          readOnly
                        />
                        <label className="form-check-label" htmlFor={`optCorrect_${oi}`} style={{ pointerEvents: "none" }}>درست</label>
                      </div>
                      <Button size="sm" color="danger" outline onClick={() => removeOption(oi)}>حذف</Button>
                    </div>
                  ))}
                </Col>
              )}
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button color="light" onClick={() => setEditQ(null)}>انصراف</Button>
              <Button color="primary" onClick={handleSave} disabled={saving}>
                {saving ? "در حال ذخیره..." : "ذخیره"}
              </Button>
            </div>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

// ─── Advisers Tab ──────────────────────────────────────────────────────────────

const AdvisersTab = ({ formId }) => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, lastPage: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [attachSearch, setAttachSearch] = useState("");
  const [attachGradeId, setAttachGradeId] = useState("");
  const [attachResults, setAttachResults] = useState([]);
  const [attachLoading, setAttachLoading] = useState(false);
  const [allGrades, setAllGrades] = useState([]);

  useEffect(() => {
    getGrades({ page: 1, limit: 200 })
      .then((res) => setAllGrades(res.items || []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(
    async (page = 1, q = search) => {
      setLoading(true);
      setAlert(null);
      try {
        const res = await getSupportFormAdvisers(formId, { page, limit: 10, search: q || undefined });
        setData(res.items || []);
        setMeta(res.pagination || { page, limit: 10, total: 0, lastPage: 1 });
      } catch {
        setAlert({ type: "danger", message: "خطا در دریافت مشاوران." });
      } finally {
        setLoading(false);
      }
    },
    [formId, search]
  );

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleToggleActive = async (row) => {
    const adviserId = row?.adviser_id || row?.adviser?.id;
    if (!adviserId) return;
    setActionLoading(adviserId);
    try {
      await toggleSupportFormAdviserActive(formId, adviserId, !row.is_active);
      await fetchData(meta.page);
    } catch {
      setAlert({ type: "danger", message: "خطا در تغییر وضعیت مشاور." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDetach = async () => {
    const adviserId = pendingDelete?.adviser_id || pendingDelete?.adviser?.id;
    if (!adviserId) return;
    setActionLoading(adviserId);
    try {
      await detachSupportFormAdviser(formId, adviserId);
      await fetchData(meta.page);
      setAlert({ type: "success", message: "مشاور حذف شد." });
    } catch {
      setAlert({ type: "danger", message: "خطا در حذف مشاور." });
    } finally {
      setActionLoading(null);
      setDeleteModal(false);
      setPendingDelete(null);
    }
  };

  const handleAttachSearch = async (e) => {
    e.preventDefault();
    if (!attachSearch.trim() && !attachGradeId) return;
    setAttachLoading(true);
    try {
      const res = await getSupportFormAdviserCandidates(formId, {
        page: 1,
        limit: 50,
        search: attachSearch.trim() || undefined,
        gradeId: attachGradeId ? Number(attachGradeId) : undefined,
      });
      setAttachResults(res.items || []);
      if (!res.items?.length) setAlert({ type: "warning", message: "نتیجه‌ای یافت نشد." });
    } catch {
      setAlert({ type: "danger", message: "خطا در جستجوی مشاور." });
    } finally {
      setAttachLoading(false);
    }
  };

  const handleAttach = async (row) => {
    const adviserId = row?.adviser_id || row?.adviser?.id || row?.id;
    if (!adviserId) return;
    setActionLoading(adviserId);
    try {
      await upsertSupportFormAdviser(formId, { adviser_id: adviserId, is_active: true });
      await fetchData(meta.page);
      setAttachResults((prev) =>
        prev.map((item) =>
          (item?.id || item?.adviser_id) === adviserId ? { ...item, _attached: true } : item
        )
      );
      setAlert({ type: "success", message: "مشاور اضافه شد." });
    } catch {
      setAlert({ type: "danger", message: "خطا در افزودن مشاور." });
    } finally {
      setActionLoading(null);
    }
  };

  const advisersColumns = useMemo(
    () => [
      { id: "code", header: "کد", enableSorting: false, cell: ({ row }) => row.original?.adviser?.code || "-" },
      { id: "name", header: "نام", enableSorting: false, cell: ({ row }) => row.original?.adviser?.user?.name || "-" },
      { id: "phone", header: "تلفن", enableSorting: false, cell: ({ row }) => row.original?.adviser?.user?.phone || "-" },
      { id: "ssn", header: "کد ملی", enableSorting: false, cell: ({ row }) => row.original?.adviser?.user?.ssn || "-" },
      {
        id: "is_active",
        header: "وضعیت",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge color={row.original?.is_active ? "success" : "secondary"}>
            {row.original?.is_active ? "فعال" : "غیرفعال"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "عملیات",
        enableSorting: false,
        cell: ({ row }) => {
          const adviserId = row.original?.adviser_id || row.original?.adviser?.id;
          return (
            <div className="d-flex gap-1">
              <Button
                size="sm"
                color={row.original?.is_active ? "danger" : "success"}
                disabled={actionLoading === adviserId}
                onClick={() => handleToggleActive(row.original)}
              >
                {row.original?.is_active ? "غیرفعال" : "فعال"}
              </Button>
              <Button
                size="sm"
                color="secondary"
                disabled={actionLoading === adviserId}
                onClick={() => { setPendingDelete(row.original); setDeleteModal(true); }}
              >
                حذف
              </Button>
            </div>
          );
        },
      },
    ],
    [actionLoading]
  );

  const candidateColumns = useMemo(
    () => [
      { id: "code", header: "کد", enableSorting: false, cell: ({ row }) => row.original?.code || row.original?.adviser?.code || "-" },
      { id: "name", header: "نام", enableSorting: false, cell: ({ row }) => row.original?.user?.name || row.original?.adviser?.user?.name || "-" },
      { id: "phone", header: "تلفن", enableSorting: false, cell: ({ row }) => row.original?.user?.phone || row.original?.adviser?.user?.phone || "-" },
      {
        id: "grades",
        header: "پایه‌ها",
        enableSorting: false,
        cell: ({ row }) => {
          const grades = row.original?.grades || [];
          if (!grades.length) return <span className="text-muted">-</span>;
          return (
            <div className="d-flex flex-wrap gap-1">
              {grades.map((g) => (
                <Badge key={g.id} color="info" className="font-size-11">{g.name}</Badge>
              ))}
            </div>
          );
        },
      },
      {
        id: "add",
        header: "افزودن",
        enableSorting: false,
        cell: ({ row }) => {
          const adviserId = row.original?.adviser_id || row.original?.adviser?.id || row.original?.id;
          const done = row.original?._attached;
          return (
            <Button
              size="sm"
              color={done ? "secondary" : "success"}
              disabled={done || actionLoading === adviserId}
              onClick={() => handleAttach(row.original)}
            >
              {done ? "افزوده شد" : "افزودن"}
            </Button>
          );
        },
      },
    ],
    [actionLoading]
  );

  return (
    <div>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDetach}
        onCloseClick={() => { setDeleteModal(false); setPendingDelete(null); }}
      />
      {alert && <Alert color={alert.type} className="mb-3">{alert.message}</Alert>}

      <Card className="border mb-4">
        <CardHeader className="bg-light"><h6 className="mb-0">افزودن مشاور</h6></CardHeader>
        <CardBody>
          <Form onSubmit={handleAttachSearch}>
            <Row className="g-2 align-items-end">
              <Col md="5">
                <Label className="form-label mb-1">جستجوی متنی</Label>
                <InputGroup>
                  <InputGroupText><i className="bx bx-search" /></InputGroupText>
                  <Input
                    value={attachSearch}
                    onChange={(e) => setAttachSearch(e.target.value)}
                    placeholder="کد ملی، نام کاربری یا تلفن"
                  />
                </InputGroup>
              </Col>
              <Col md="4">
                <Label className="form-label mb-1">فیلتر پایه</Label>
                <InputGroup>
                  <InputGroupText><i className="bx bx-book" /></InputGroupText>
                  <Input
                    type="select"
                    value={attachGradeId}
                    onChange={(e) => setAttachGradeId(e.target.value)}
                  >
                    <option value="">همه پایه‌ها</option>
                    {allGrades.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </Input>
                </InputGroup>
              </Col>
              <Col md="3" className="d-flex align-items-end gap-2">
                <Button color="primary" type="submit" className="w-100" disabled={attachLoading || (!attachSearch.trim() && !attachGradeId)}>
                  {attachLoading ? "جستجو..." : "جستجو"}
                </Button>
                <Button
                  color="light"
                  type="button"
                  className="flex-shrink-0"
                  onClick={() => { setAttachSearch(""); setAttachGradeId(""); setAttachResults([]); }}
                  disabled={attachLoading}
                >
                  ریست
                </Button>
              </Col>
            </Row>
          </Form>
          {attachResults.length > 0 && (
            <div className="mt-3">
              <TableContainer
                columns={candidateColumns}
                data={attachResults}
                isGlobalFilter={false}
                isPagination={false}
                isLoading={attachLoading}
                tableClass="table-bordered table-nowrap dt-responsive nowrap w-100"
              />
            </div>
          )}
        </CardBody>
      </Card>

      <Form
        className="mb-3"
        onSubmit={(e) => { e.preventDefault(); fetchData(1, search); }}
      >
        <Row className="g-2 align-items-end">
          <Col md="8">
            <InputGroup>
              <InputGroupText><i className="bx bx-search" /></InputGroupText>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو در مشاوران متصل"
              />
            </InputGroup>
          </Col>
          <Col md="4" className="d-flex gap-2">
            <Button color="primary" type="submit" className="w-100" disabled={loading}>جستجو</Button>
            <Button color="light" type="button" className="w-100" onClick={() => { setSearch(""); fetchData(1, ""); }}>ریست</Button>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div className="text-center py-4"><Spinner color="primary" /></div>
      ) : (
        <>
          <TableContainer
            columns={advisersColumns}
            data={data}
            isGlobalFilter={false}
            isPagination={false}
            isLoading={loading}
            tableClass="table-bordered table-nowrap dt-responsive nowrap w-100"
          />
          <Paginations
            perPageData={meta.limit}
            data={data}
            totalRecords={meta.total}
            currentPage={meta.page}
            setCurrentPage={(page) => fetchData(page)}
            isShowingPageLength
            paginationDiv="col-sm-auto"
            paginationClass="pagination pagination-sm mb-0"
          />
        </>
      )}
    </div>
  );
};

// ─── Students Tab (per adviser) ────────────────────────────────────────────────

const StudentsTab = ({ formId }) => {
  const [advisers, setAdvisers] = useState([]);
  const [selectedAdviser, setSelectedAdviser] = useState("");
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, lastPage: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateResults, setCandidateResults] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [attachLoading, setAttachLoading] = useState(false);

  const [tagModal, setTagModal] = useState(false);
  const [parentTags, setParentTags] = useState([]);
  const [selectedParentTag, setSelectedParentTag] = useState("");
  const [tagValues, setTagValues] = useState([]);
  const [selectedTagValue, setSelectedTagValue] = useState("");
  const [tagLoading, setTagLoading] = useState(false);
  const [tagAlert, setTagAlert] = useState(null);

  useEffect(() => {
    getSupportFormAdvisers(formId, { page: 1, limit: 200 })
      .then((res) => setAdvisers(res.items || []))
      .catch(() => {});
  }, [formId]);

  const fetchStudents = useCallback(
    async (page = 1, q = search) => {
      if (!selectedAdviser) return;
      setLoading(true);
      setAlert(null);
      try {
        const res = await getSupportFormAdviserStudents(formId, selectedAdviser, {
          page,
          limit: 10,
          search: q || undefined,
        });
        setData(res.items || []);
        setMeta(res.pagination || { page, limit: 10, total: 0, lastPage: 1 });
      } catch {
        setAlert({ type: "danger", message: "خطا در دریافت دانش‌آموزان." });
      } finally {
        setLoading(false);
      }
    },
    [formId, selectedAdviser, search]
  );

  useEffect(() => {
    setData([]);
    setMeta({ page: 1, limit: 10, total: 0, lastPage: 1 });
    if (selectedAdviser) fetchStudents(1);
  }, [selectedAdviser]);

  const handleAutoImport = async () => {
    if (!selectedAdviser) return;
    setActionLoading(true);
    try {
      const res = await autoImportAdviserStudents(formId, selectedAdviser);
      const d = res?.data || res || {};
      const added = d.added ?? "-";
      const skipped = d.skipped ?? "-";
      setAlert({ type: "success", message: `وارد شد: ${added} | رد شد: ${skipped}` });
      await fetchStudents(1);
    } catch {
      setAlert({ type: "danger", message: "خطا در وارد کردن دانش‌آموزان." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async (row, status) => {
    setActionLoading(row.id);
    try {
      await changeStudentSupportFormStatus({ row_id: row.id, status });
      await fetchStudents(meta.page);
    } catch {
      setAlert({ type: "danger", message: "خطا در تغییر وضعیت دانش‌آموز." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDetachOne = async () => {
    const studentId = pendingDelete?.student_id || pendingDelete?.student?.id;
    if (!studentId || !selectedAdviser) return;
    setActionLoading(true);
    try {
      await detachSupportFormAdviserStudent(formId, selectedAdviser, studentId);
      await fetchStudents(meta.page);
      setAlert({ type: "success", message: "دانش‌آموز حذف شد." });
    } catch {
      setAlert({ type: "danger", message: "خطا در حذف دانش‌آموز." });
    } finally {
      setActionLoading(false);
      setDeleteModal(false);
      setPendingDelete(null);
    }
  };

  const handleDetachAll = async () => {
    if (!selectedAdviser) return;
    setActionLoading(true);
    try {
      await detachSupportFormAdviserStudents(formId, selectedAdviser);
      await fetchStudents(1);
      setAlert({ type: "success", message: "تمام دانش‌آموزان حذف شدند." });
    } catch {
      setAlert({ type: "danger", message: "خطا در حذف دانش‌آموزان." });
    } finally {
      setActionLoading(false);
      setBulkDeleteModal(false);
    }
  };

  const handleCandidateSearch = async (e) => {
    e.preventDefault();
    if (!candidateSearch.trim() || !selectedAdviser) return;
    setCandidateLoading(true);
    try {
      const res = await getSupportFormAdviserStudentCandidates(formId, selectedAdviser, {
        page: 1,
        limit: 20,
        search: candidateSearch.trim(),
      });
      setCandidateResults(res.items || []);
      if (!res.items?.length) setAlert({ type: "warning", message: "دانش‌آموزی یافت نشد." });
    } catch {
      setAlert({ type: "danger", message: "خطا در جستجوی دانش‌آموز." });
    } finally {
      setCandidateLoading(false);
    }
  };

  const toggleCandidate = (id) => {
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      const k = String(id);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  const handleAttachSelected = async () => {
    if (!selectedCandidates.size || !selectedAdviser) return;
    setAttachLoading(true);
    try {
      await attachSupportFormAdviserStudents(formId, selectedAdviser, {
        studentIds: Array.from(selectedCandidates).map(Number),
      });
      setSelectedCandidates(new Set());
      await fetchStudents(meta.page);
      setAlert({ type: "success", message: "دانش‌آموزان اضافه شدند." });
    } catch {
      setAlert({ type: "danger", message: "خطا در افزودن دانش‌آموزان." });
    } finally {
      setAttachLoading(false);
    }
  };

  const handleAttachByTag = async (payload) => {
    if (!selectedAdviser) return;
    setAttachLoading(true);
    try {
      const res = await attachSupportFormAdviserStudentsByTag(formId, selectedAdviser, payload);
      const d = res?.data || res || {};
      setTagAlert({ type: "success", message: `اضافه: ${d.added ?? "-"} | رد: ${d.skipped ?? "-"}` });
      await fetchStudents(meta.page);
    } catch {
      setTagAlert({ type: "danger", message: "خطا در افزودن بر اساس تگ." });
    } finally {
      setAttachLoading(false);
    }
  };

  const openTagModal = () => {
    setTagModal(true);
    setTagAlert(null);
    setSelectedParentTag("");
    setSelectedTagValue("");
    setTagLoading(true);
    getParentTags({ page: 1, limit: 50 }).then((r) => setParentTags(r.items || [])).catch(() => {}).finally(() => setTagLoading(false));
  };

  const loadTagValues = (parentId) => {
    setTagValues([]);
    if (!parentId) return;
    setTagLoading(true);
    getParentTagValues(parentId, { page: 1, limit: 50 }).then((r) => setTagValues(r.items || [])).catch(() => {}).finally(() => setTagLoading(false));
  };

  const studentsColumns = useMemo(
    () => [
      { id: "code", header: "کد", enableSorting: false, cell: ({ row }) => row.original?.student?.code || "-" },
      { id: "name", header: "نام", enableSorting: false, cell: ({ row }) => row.original?.student?.user?.name || "-" },
      { id: "ssn", header: "کد ملی", enableSorting: false, cell: ({ row }) => row.original?.student?.user?.ssn || "-" },
      { id: "phone", header: "تلفن", enableSorting: false, cell: ({ row }) => row.original?.student?.user?.phone || "-" },
      {
        id: "status",
        header: "وضعیت",
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original?.status} />,
      },
      {
        id: "actions",
        header: "عملیات",
        enableSorting: false,
        cell: ({ row }) => {
          const isInt = row.original?.status === 2;
          return (
            <div className="d-flex gap-1">
              <Button
                size="sm"
                color={isInt ? "success" : "warning"}
                disabled={actionLoading === row.original?.id}
                onClick={() => handleChangeStatus(row.original, isInt ? 0 : 2)}
              >
                {isInt ? "بازگشت به نرمال" : "قطع‌شده"}
              </Button>
              <Button
                size="sm"
                color="danger"
                outline
                onClick={() => { setPendingDelete(row.original); setDeleteModal(true); }}
              >
                حذف
              </Button>
            </div>
          );
        },
      },
    ],
    [actionLoading]
  );

  const candidateColumns = useMemo(
    () => [
      {
        id: "select",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const id = row.original?.id;
          return (
            <div className="form-check" role="button" tabIndex={0} onClick={() => toggleCandidate(id)}>
              <input type="checkbox" className="form-check-input" checked={selectedCandidates.has(String(id))} readOnly />
            </div>
          );
        },
      },
      { id: "code", header: "کد", enableSorting: false, cell: ({ row }) => row.original?.code || "-" },
      { id: "name", header: "نام", enableSorting: false, cell: ({ row }) => row.original?.user?.name || "-" },
      { id: "ssn", header: "کد ملی", enableSorting: false, cell: ({ row }) => row.original?.user?.ssn || "-" },
      { id: "phone", header: "تلفن", enableSorting: false, cell: ({ row }) => row.original?.user?.phone || "-" },
    ],
    [selectedCandidates]
  );

  return (
    <div>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDetachOne}
        onCloseClick={() => { setDeleteModal(false); setPendingDelete(null); }}
      />
      <DeleteModal
        show={bulkDeleteModal}
        onDeleteClick={handleDetachAll}
        onCloseClick={() => setBulkDeleteModal(false)}
      />

      {alert && <Alert color={alert.type} className="mb-3">{alert.message}</Alert>}

      <Row className="g-2 align-items-end mb-4">
        <Col md="6">
          <Label>انتخاب مشاور</Label>
          <Input
            type="select"
            value={selectedAdviser}
            onChange={(e) => setSelectedAdviser(e.target.value)}
          >
            <option value="">یک مشاور انتخاب کنید</option>
            {advisers.map((a) => {
              const name = a?.adviser?.user?.name || a?.adviser?.code || `مشاور ${a?.adviser_id}`;
              return (
                <option key={a.adviser_id || a.id} value={a.adviser_id || a.adviser?.id}>
                  {name}
                </option>
              );
            })}
          </Input>
        </Col>
        {selectedAdviser && (
          <Col md="6" className="d-flex gap-2">
            <Button color="info" onClick={handleAutoImport} disabled={!!actionLoading}>
              <i className="mdi mdi-import me-1" />
              وارد کردن دانش‌آموزان من
            </Button>
            <Button color="warning" outline onClick={openTagModal}>
              افزودن با تگ
            </Button>
            <Button color="danger" outline onClick={() => setBulkDeleteModal(true)}>
              حذف همه
            </Button>
          </Col>
        )}
      </Row>

      {selectedAdviser && (
        <>
          <Card className="border mb-4">
            <CardHeader className="bg-light"><h6 className="mb-0">افزودن دستی دانش‌آموز</h6></CardHeader>
            <CardBody>
              <Form onSubmit={handleCandidateSearch}>
                <Row className="g-2 align-items-end">
                  <Col md="6">
                    <InputGroup>
                      <InputGroupText><i className="bx bx-search" /></InputGroupText>
                      <Input
                        value={candidateSearch}
                        onChange={(e) => setCandidateSearch(e.target.value)}
                        placeholder="نام، کد ملی یا تلفن دانش‌آموز"
                      />
                    </InputGroup>
                  </Col>
                  <Col md="3">
                    <Button color="primary" type="submit" className="w-100" disabled={candidateLoading}>
                      {candidateLoading ? "جستجو..." : "جستجو"}
                    </Button>
                  </Col>
                  <Col md="3">
                    <Button
                      color="success"
                      type="button"
                      className="w-100"
                      disabled={attachLoading || selectedCandidates.size === 0}
                      onClick={handleAttachSelected}
                    >
                      {attachLoading ? "در حال افزودن..." : `افزودن (${selectedCandidates.size})`}
                    </Button>
                  </Col>
                </Row>
              </Form>
              {candidateResults.length > 0 && (
                <div className="mt-3">
                  <TableContainer
                    columns={candidateColumns}
                    data={candidateResults}
                    isGlobalFilter={false}
                    isPagination={false}
                    isLoading={candidateLoading}
                    tableClass="table-bordered table-nowrap dt-responsive nowrap w-100"
                  />
                </div>
              )}
            </CardBody>
          </Card>

          <Form
            className="mb-3"
            onSubmit={(e) => { e.preventDefault(); fetchStudents(1); }}
          >
            <Row className="g-2 align-items-end">
              <Col md="6">
                <InputGroup>
                  <InputGroupText><i className="bx bx-search" /></InputGroupText>
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو در لیست" />
                </InputGroup>
              </Col>
              <Col md="6" className="d-flex gap-2">
                <Button color="primary" type="submit" className="w-100" disabled={loading}>جستجو</Button>
                <Button color="light" type="button" className="w-100" onClick={() => { setSearch(""); fetchStudents(1, ""); }}>ریست</Button>
              </Col>
            </Row>
          </Form>

          {loading ? (
            <div className="text-center py-4"><Spinner color="primary" /></div>
          ) : (
            <>
              <TableContainer
                columns={studentsColumns}
                data={data}
                isGlobalFilter={false}
                isPagination={false}
                isLoading={loading}
                tableClass="table-bordered table-nowrap dt-responsive nowrap w-100"
              />
              <Paginations
                perPageData={meta.limit}
                data={data}
                totalRecords={meta.total}
                currentPage={meta.page}
                setCurrentPage={(page) => fetchStudents(page)}
                isShowingPageLength
                paginationDiv="col-sm-auto"
                paginationClass="pagination pagination-sm mb-0"
              />
            </>
          )}
        </>
      )}

      <Modal isOpen={tagModal} toggle={() => setTagModal(false)} centered>
        <ModalHeader toggle={() => setTagModal(false)}>افزودن با تگ</ModalHeader>
        <ModalBody>
          {tagAlert && <Alert color={tagAlert.type} className="mb-3">{tagAlert.message}</Alert>}
          <Row className="g-3">
            <Col md="12">
              <Label>سرتگ</Label>
              <Input
                type="select"
                value={selectedParentTag}
                onChange={(e) => { setSelectedParentTag(e.target.value); setSelectedTagValue(""); loadTagValues(e.target.value); }}
              >
                <option value="">انتخاب سرتگ</option>
                {parentTags.map((t) => (
                  <option key={t.id} value={t.id}>{t.name || t.title || `تگ ${t.id}`}</option>
                ))}
              </Input>
            </Col>
            <Col md="12">
              <Label>زیرتگ (اختیاری)</Label>
              <Input
                type="select"
                value={selectedTagValue}
                onChange={(e) => setSelectedTagValue(e.target.value)}
                disabled={!selectedParentTag || tagLoading}
              >
                <option value="">انتخاب زیرتگ</option>
                {tagValues.map((t) => (
                  <option key={t.id} value={t.id}>{t.value || t.name || `زیرتگ ${t.id}`}</option>
                ))}
              </Input>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button color="light" onClick={() => setTagModal(false)}>انصراف</Button>
            <Button
              color="primary"
              disabled={attachLoading || !selectedParentTag}
              onClick={() => {
                const payload = {};
                if (selectedParentTag) payload.tagId = Number(selectedParentTag);
                if (selectedTagValue) payload.subTagId = Number(selectedTagValue);
                handleAttachByTag(payload);
              }}
            >
              {attachLoading ? "در حال افزودن..." : "افزودن"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

// ─── All Students Tab ──────────────────────────────────────────────────────────

const AllStudentsTab = ({ formId }) => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, lastPage: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      setAlert(null);
      try {
        const res = await getSupportFormAllStudents(formId, {
          page,
          limit: 10,
          search: search || undefined,
          status: statusFilter !== "" ? statusFilter : undefined,
        });
        setData(res.items || []);
        setMeta(res.pagination || { page, limit: 10, total: 0, lastPage: 1 });
      } catch {
        setAlert({ type: "danger", message: "خطا در دریافت دانش‌آموزان." });
      } finally {
        setLoading(false);
      }
    },
    [formId, search, statusFilter]
  );

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleChangeStatus = async (row, status) => {
    setActionLoading(row.id);
    try {
      await changeStudentSupportFormStatus({ row_id: row.id, status });
      await fetchData(meta.page);
    } catch {
      setAlert({ type: "danger", message: "خطا در تغییر وضعیت." });
    } finally {
      setActionLoading(null);
    }
  };

  const columns = useMemo(
    () => [
      { id: "code", header: "کد دانش‌آموز", enableSorting: false, cell: ({ row }) => row.original?.student?.code || "-" },
      { id: "name", header: "نام", enableSorting: false, cell: ({ row }) => row.original?.student?.user?.name || "-" },
      {
        id: "adviser",
        header: "مشاور",
        enableSorting: false,
        cell: ({ row }) => {
          const a = row.original?.adviser;
          return a?.user?.name || a?.code || (row.original?.adviser_id ? `مشاور ${row.original.adviser_id}` : "-");
        },
      },
      {
        id: "status",
        header: "وضعیت",
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original?.status} />,
      },
      {
        id: "actions",
        header: "عملیات",
        enableSorting: false,
        cell: ({ row }) => {
          const isInt = row.original?.status === 2;
          return (
            <Button
              size="sm"
              color={isInt ? "success" : "warning"}
              disabled={actionLoading === row.original?.id}
              onClick={() => handleChangeStatus(row.original, isInt ? 0 : 2)}
            >
              {isInt ? "بازگشت به نرمال" : "علامت‌گذاری قطع‌شده"}
            </Button>
          );
        },
      },
    ],
    [actionLoading]
  );

  return (
    <div>
      {alert && <Alert color={alert.type} className="mb-3">{alert.message}</Alert>}

      <Form
        className="mb-3"
        onSubmit={(e) => { e.preventDefault(); fetchData(1); }}
      >
        <Row className="g-2 align-items-end">
          <Col md="5">
            <InputGroup>
              <InputGroupText><i className="bx bx-search" /></InputGroupText>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو (نام، کد ملی)" />
            </InputGroup>
          </Col>
          <Col md="3">
            <Input type="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">همه وضعیت‌ها</option>
              <option value="0">نرمال</option>
              <option value="2">قطع‌شده</option>
            </Input>
          </Col>
          <Col md="4" className="d-flex gap-2">
            <Button color="primary" type="submit" className="w-100" disabled={loading}>جستجو</Button>
            <Button color="light" type="button" className="w-100" onClick={() => { setSearch(""); setStatusFilter(""); }}>ریست</Button>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div className="text-center py-4"><Spinner color="primary" /></div>
      ) : (
        <>
          <TableContainer
            columns={columns}
            data={data}
            isGlobalFilter={false}
            isPagination={false}
            isLoading={loading}
            tableClass="table-bordered table-nowrap dt-responsive nowrap w-100"
          />
          <Paginations
            perPageData={meta.limit}
            data={data}
            totalRecords={meta.total}
            currentPage={meta.page}
            setCurrentPage={fetchData}
            isShowingPageLength
            paginationDiv="col-sm-auto"
            paginationClass="pagination pagination-sm mb-0"
          />
        </>
      )}
    </div>
  );
};

// ─── Interrupted Calls Tab ─────────────────────────────────────────────────────

const InterruptedCallsTab = ({ formId }) => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, lastPage: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      setAlert(null);
      try {
        const res = await getSupportFormInterruptedCalls(formId, {
          page,
          limit: 10,
          search: search || undefined,
        });
        setData(res.items || []);
        setMeta(res.pagination || { page, limit: 10, total: 0, lastPage: 1 });
      } catch {
        setAlert({ type: "danger", message: "خطا در دریافت تماس‌های قطع‌شده." });
      } finally {
        setLoading(false);
      }
    },
    [formId, search]
  );

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleRestore = async (row) => {
    setActionLoading(row.id);
    try {
      await changeStudentSupportFormStatus({ row_id: row.id, status: 0 });
      await fetchData(meta.page);
    } catch {
      setAlert({ type: "danger", message: "خطا در بازگشت وضعیت." });
    } finally {
      setActionLoading(null);
    }
  };

  const columns = useMemo(
    () => [
      { id: "code", header: "کد دانش‌آموز", enableSorting: false, cell: ({ row }) => row.original?.student?.code || "-" },
      { id: "name", header: "نام", enableSorting: false, cell: ({ row }) => row.original?.student?.user?.name || "-" },
      { id: "ssn", header: "کد ملی", enableSorting: false, cell: ({ row }) => row.original?.student?.user?.ssn || "-" },
      { id: "phone", header: "تلفن", enableSorting: false, cell: ({ row }) => row.original?.student?.user?.phone || "-" },
      {
        id: "adviser",
        header: "مشاور",
        enableSorting: false,
        cell: ({ row }) => {
          const a = row.original?.adviser;
          return a?.user?.name || a?.code || "-";
        },
      },
      {
        id: "status",
        header: "وضعیت",
        enableSorting: false,
        cell: () => <Badge color="warning">قطع‌شده</Badge>,
      },
      {
        id: "actions",
        header: "عملیات",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            size="sm"
            color="success"
            disabled={actionLoading === row.original?.id}
            onClick={() => handleRestore(row.original)}
          >
            بازگشت به نرمال
          </Button>
        ),
      },
    ],
    [actionLoading]
  );

  return (
    <div>
      {alert && <Alert color={alert.type} className="mb-3">{alert.message}</Alert>}

      <Form
        className="mb-3"
        onSubmit={(e) => { e.preventDefault(); fetchData(1); }}
      >
        <Row className="g-2 align-items-end">
          <Col md="6">
            <InputGroup>
              <InputGroupText><i className="bx bx-search" /></InputGroupText>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو" />
            </InputGroup>
          </Col>
          <Col md="3">
            <Button color="primary" type="submit" className="w-100" disabled={loading}>جستجو</Button>
          </Col>
          <Col md="3">
            <Button color="light" type="button" className="w-100" onClick={() => { setSearch(""); }}>ریست</Button>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div className="text-center py-4"><Spinner color="primary" /></div>
      ) : (
        <>
          <TableContainer
            columns={columns}
            data={data}
            isGlobalFilter={false}
            isPagination={false}
            isLoading={loading}
            tableClass="table-bordered table-nowrap dt-responsive nowrap w-100"
          />
          <Paginations
            perPageData={meta.limit}
            data={data}
            totalRecords={meta.total}
            currentPage={meta.page}
            setCurrentPage={fetchData}
            isShowingPageLength
            paginationDiv="col-sm-auto"
            paginationClass="pagination pagination-sm mb-0"
          />
        </>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const SupportFormDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(TAB.OVERVIEW);
  const [formData, setFormData] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [copyLoading, setCopyLoading] = useState(false);

  document.title = "مدیریت فرم تماس | داشبورد آیسوق";

  const loadForm = useCallback(async () => {
    setFormLoading(true);
    try {
      const res = await getSupportForm(id);
      setFormData(res?.data || res);
    } catch {
      setAlert({ type: "danger", message: "خطا در دریافت اطلاعات فرم تماس." });
    } finally {
      setFormLoading(false);
    }
  }, [id]);

  useEffect(() => { loadForm(); }, [loadForm]);

  const handleCopy = async () => {
    setCopyLoading(true);
    try {
      const res = await copySupportForm(id);
      const newId = res?.data?.id || res?.id;
      setAlert({ type: "success", message: `فرم با موفقیت کپی شد.${newId ? " در حال انتقال..." : ""}` });
      if (newId) {
        setTimeout(() => navigate(`/support-forms/${newId}/edit`), 1200);
      }
    } catch {
      setAlert({ type: "danger", message: "خطا در کپی فرم." });
    } finally {
      setCopyLoading(false);
    }
  };

  const tabs = [
    { id: TAB.OVERVIEW, label: "اطلاعات", icon: "bx bx-info-circle" },
    { id: TAB.QUESTIONS, label: "سوالات", icon: "bx bx-question-mark" },
    { id: TAB.ADVISERS, label: "مشاوران", icon: "bx bx-user-voice" },
    { id: TAB.STUDENTS, label: "دانش‌آموزان", icon: "bx bx-group" },
    { id: TAB.ALL_STUDENTS, label: "همه دانش‌آموزان", icon: "bx bx-list-ul" },
    { id: TAB.INTERRUPTED, label: "تماس‌های قطع‌شده", icon: "bx bx-phone-off" },
  ];

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs
          title="فرم تماس"
          breadcrumbItem={formData?.title ? `مدیریت: ${formData.title}` : "مدیریت فرم تماس"}
        />

        {alert && (
          <Alert color={alert.type} className="mb-3" toggle={() => setAlert(null)}>
            {alert.message}
          </Alert>
        )}

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">
                    {formLoading ? <Spinner size="sm" /> : (formData?.title || "فرم تماس")}
                  </h4>
                  <p className="text-muted mb-0">
                    مدیریت جامع فرم تماس — سوالات، مشاوران، دانش‌آموزان و تماس‌ها
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <Button color="light" onClick={() => navigate(-1)}>
                    <i className="mdi mdi-arrow-right me-1" />
                    بازگشت
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <Nav tabs className="nav-tabs-custom mb-4">
                  {tabs.map((tab) => (
                    <NavItem key={tab.id}>
                      <NavLink
                        className={classnames({ active: activeTab === tab.id })}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <i className={`${tab.icon} me-1`} />
                        {tab.label}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>

                <TabContent activeTab={activeTab}>
                  <TabPane tabId={TAB.OVERVIEW}>
                    {formLoading ? (
                      <div className="text-center py-4"><Spinner color="primary" /></div>
                    ) : formData ? (
                      <OverviewTab
                        formData={formData}
                        formId={id}
                        onEdit={() => navigate(`/support-forms/${id}/edit`)}
                        onCopy={handleCopy}
                        copyLoading={copyLoading}
                      />
                    ) : null}
                  </TabPane>

                  <TabPane tabId={TAB.QUESTIONS}>
                    {activeTab === TAB.QUESTIONS && <QuestionsTab formId={id} />}
                  </TabPane>

                  <TabPane tabId={TAB.ADVISERS}>
                    {activeTab === TAB.ADVISERS && <AdvisersTab formId={id} />}
                  </TabPane>

                  <TabPane tabId={TAB.STUDENTS}>
                    {activeTab === TAB.STUDENTS && <StudentsTab formId={id} />}
                  </TabPane>

                  <TabPane tabId={TAB.ALL_STUDENTS}>
                    {activeTab === TAB.ALL_STUDENTS && <AllStudentsTab formId={id} />}
                  </TabPane>

                  <TabPane tabId={TAB.INTERRUPTED}>
                    {activeTab === TAB.INTERRUPTED && <InterruptedCallsTab formId={id} />}
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SupportFormDetail;
