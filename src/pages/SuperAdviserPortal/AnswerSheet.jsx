import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
  Row,
  Spinner,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment-jalaali";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getSuperAdviserAnswerSheet,
  exportSuperAdviserAnswerSheet,
  getSuperAdviserStudentAnswers,
  getSuperAdviserAdvisers,
} from "../../services/superAdviserPortalService.jsx";

const toJalali = (dateStr) => {
  if (!dateStr) return "-";
  try {
    return moment(dateStr).format("jYYYY/jMM/jDD HH:mm");
  } catch {
    return String(dateStr);
  }
};

const formatUnixDate = (unix) => {
  if (!unix) return "-";
  return new Date(unix * 1000).toLocaleString("fa-IR");
};

const STICKY_COLS = ["#", "نام دانش‌آموز", "مشاور", "تماس کل", "تماس موفق", "آخرین تماس"];
const STICKY_LEFT = [0, 40, 160, 280, 360, 440];
const STICKY_WIDTHS = [40, 120, 120, 80, 80, 120];

const stickyStyle = (index) => ({
  position: "sticky",
  left: STICKY_LEFT[index],
  zIndex: 2,
  backgroundColor: "#fff",
  minWidth: STICKY_WIDTHS[index],
  maxWidth: STICKY_WIDTHS[index],
});

const stickyHeaderStyle = (index) => ({
  ...stickyStyle(index),
  zIndex: 3,
  backgroundColor: "#f8f9fa",
  whiteSpace: "nowrap",
});

const AnswerCellContent = ({ answer }) => {
  if (!answer.isAnswered) {
    return (
      <span
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          color: "#aaa",
          textAlign: "center",
        }}
      >
        —
      </span>
    );
  }
  const text = answer.resolvedAnswer ?? "";
  return (
    <span
      title={text}
      style={{
        display: "block",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: 140,
      }}
    >
      {text || "✓"}
    </span>
  );
};

const SkeletonRow = ({ colCount }) => (
  <tr>
    {Array.from({ length: colCount }).map((_, i) => (
      <td key={i}>
        <div
          style={{
            height: 18,
            borderRadius: 4,
            background: "linear-gradient(90deg,#e9ecef 25%,#f8f9fa 50%,#e9ecef 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.2s infinite",
          }}
        />
      </td>
    ))}
  </tr>
);

const StudentDrawer = ({ isOpen, toggle, formId, student }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !student || !formId) return;
    setLoading(true);
    getSuperAdviserStudentAnswers({ formId, studentId: student.studentId })
      .then((res) => setSessions(res.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [isOpen, formId, student]);

  return (
    <Offcanvas
      isOpen={isOpen}
      toggle={toggle}
      direction="end"
      style={{ width: 480, maxWidth: "95vw" }}
    >
      <OffcanvasHeader toggle={toggle}>
        <div>
          <div className="fw-bold">{student?.studentName || "دانش‌آموز"}</div>
          {student?.studentCode && (
            <small className="text-muted">کد: {student.studentCode}</small>
          )}
          {student?.adviserName && (
            <small className="text-muted ms-2">| مشاور: {student.adviserName}</small>
          )}
        </div>
      </OffcanvasHeader>
      <OffcanvasBody>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner color="primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bx bx-info-circle fs-1 d-block mb-2" />
            جلسه‌ای ثبت نشده است.
          </div>
        ) : (
          sessions.map((session, idx) => (
            <div
              key={idx}
              className="border rounded p-3 mb-3"
              style={{ backgroundColor: "#fafafa" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>جلسه {sessions.length - idx}</strong>
                <span className="text-muted small">
                  {toJalali(session.sessionDate)}
                  {session.voipCallId && (
                    <span className="ms-2">| تماس #{session.voipCallId}</span>
                  )}
                </span>
              </div>
              <hr className="my-2" />
              {session.answers.length === 0 ? (
                <p className="text-muted mb-0 small">بدون پاسخ</p>
              ) : (
                session.answers.map((a, ai) => (
                  <div key={ai} className="mb-2">
                    <div className="text-muted small mb-1">{a.questionTitle}</div>
                    <div
                      className="fw-medium"
                      style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                      {a.isAnswered
                        ? (a.resolvedAnswer ?? <em className="text-muted">پاسخ خالی</em>)
                        : <em className="text-muted">پاسخ داده نشده</em>}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </OffcanvasBody>
    </Offcanvas>
  );
};

const AnswerSheet = () => {
  document.title = "پاسخنامه فرم | سر مشاور | داشبورد آیسوق";

  const { formId } = useParams();
  const navigate = useNavigate();

  const [formInfo, setFormInfo] = useState({ title: "", startAt: null, endAt: null });
  const [questions, setQuestions] = useState([]);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, lastPage: 1 });
  const [filters, setFilters] = useState({ adviserId: "", search: "" });
  const [advisers, setAdvisers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const debounceRef = useRef(null);

  useEffect(() => {
    getSuperAdviserAdvisers({ page: 1, limit: 100 })
      .then((res) => setAdvisers(res.items || []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(
    async (page = 1, currentFilters = filters) => {
      setLoading(true);
      try {
        const res = await getSuperAdviserAnswerSheet({
          formId,
          page,
          limit: meta.limit,
          adviserId: currentFilters.adviserId,
          search: currentFilters.search,
        });
        setFormInfo(res.form || {});
        setQuestions(res.questions || []);
        setData(res.items || []);
        setMeta(res.meta || { page, limit: meta.limit, total: 0, lastPage: 1 });
      } catch (e) {
        if (e?.response?.status === 403) navigate("/pages-404");
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0, lastPage: 1 }));
      } finally {
        setLoading(false);
      }
    },
    [formId, meta.limit, navigate]
  );

  useEffect(() => {
    fetchData(1, filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const next = { ...filters, [name]: value };
    setFilters(next);

    if (name === "search") {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchData(1, next), 400);
    } else {
      fetchData(1, next);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    fetchData(1, filters);
  };

  const handleReset = () => {
    clearTimeout(debounceRef.current);
    const reset = { adviserId: "", search: "" };
    setFilters(reset);
    fetchData(1, reset);
  };

  const handlePageChange = (page) => fetchData(page, filters);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportSuperAdviserAnswerSheet({
        formId,
        adviserId: filters.adviserId,
        search: filters.search,
      });
    } catch {
      // error toast is shown by httpClient / fetch handler
    } finally {
      setExporting(false);
    }
  };

  const handleStudentClick = (item) => {
    setSelectedStudent(item);
    setDrawerOpen(true);
  };

  const totalCols = STICKY_COLS.length + questions.length;

  return (
    <div className="page-content">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .answer-sheet-table td, .answer-sheet-table th {
          border: 1px solid #dee2e6;
          padding: 6px 8px;
          font-size: 13px;
          vertical-align: middle;
        }
        .answer-sheet-table tr:hover td {
          background-color: #f0f4ff !important;
        }
        .answer-cell-answered {
          background-color: #e8f5e9 !important;
        }
        .answer-cell-empty {
          background-color: #f5f5f5 !important;
        }
        .student-name-btn {
          background: none;
          border: none;
          padding: 0;
          color: #0d6efd;
          cursor: pointer;
          text-decoration: underline;
          font-size: 13px;
          text-align: right;
          white-space: nowrap;
        }
        .student-name-btn:hover {
          color: #0a58ca;
        }
      `}</style>

      <div className="container-fluid">
        <Breadcrumbs title="سر مشاور" breadcrumbItem="پاسخنامه فرم" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">
                    پاسخنامه: {formInfo.title || "..."}
                  </h4>
                  {(formInfo.startAt || formInfo.endAt) && (
                    <p className="text-muted mb-0 small">
                      بازه: {formatUnixDate(formInfo.startAt)} تا {formatUnixDate(formInfo.endAt)}
                    </p>
                  )}
                </div>
                <div className="d-flex gap-2 align-items-center">
                  {loading && <Spinner size="sm" color="primary" />}
                  <Button
                    color="success"
                    size="sm"
                    onClick={handleExport}
                    disabled={exporting || loading}
                  >
                    {exporting ? (
                      <>
                        <Spinner size="sm" className="me-1" />
                        در حال دانلود...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-download me-1" />
                        دانلود اکسل
                      </>
                    )}
                  </Button>
                  <Button color="light" size="sm" onClick={() => navigate(-1)}>
                    <i className="bx bx-arrow-back me-1" />
                    بازگشت
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <Form className="mb-3" onSubmit={handleSearchSubmit}>
                  <Row className="g-2 align-items-end">
                    <Col xl="4" lg="5" md="6">
                      <Label className="form-label">جستجو</Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-search" />
                        </InputGroupText>
                        <Input
                          name="search"
                          value={filters.search}
                          onChange={handleFilterChange}
                          placeholder="نام، تلفن یا کد ملی دانش‌آموز"
                        />
                      </InputGroup>
                    </Col>
                    <Col xl="2" lg="3" md="4">
                      <Label className="form-label">مشاور</Label>
                      <Input
                        type="select"
                        name="adviserId"
                        value={filters.adviserId}
                        onChange={handleFilterChange}
                      >
                        <option value="">همه مشاوران</option>
                        {advisers.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </Input>
                    </Col>
                    <Col className="d-flex gap-2" xl="2" lg="3" md="4">
                      <Button color="primary" type="submit" disabled={loading}>
                        جستجو
                      </Button>
                      <Button color="light" type="button" onClick={handleReset} disabled={loading}>
                        ریست
                      </Button>
                    </Col>
                  </Row>
                </Form>

                <div style={{ overflowX: "auto", position: "relative" }}>
                  <table
                    className="answer-sheet-table"
                    style={{ borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed" }}
                  >
                    <thead>
                      <tr>
                        {STICKY_COLS.map((col, i) => (
                          <th key={col} style={stickyHeaderStyle(i)}>
                            {col}
                          </th>
                        ))}
                        {questions.map((q) => (
                          <th
                            key={q.id}
                            title={q.title}
                            style={{
                              minWidth: 150,
                              maxWidth: 150,
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              backgroundColor: "#f8f9fa",
                            }}
                          >
                            {q.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonRow key={i} colCount={totalCols} />
                          ))
                        : data.length === 0
                        ? (
                          <tr>
                            <td colSpan={totalCols} className="text-center text-muted py-4">
                              رکوردی یافت نشد.
                            </td>
                          </tr>
                        )
                        : data.map((item, rowIdx) => {
                            const answerMap = {};
                            (item.answers || []).forEach((a) => {
                              answerMap[a.questionId] = a;
                            });
                            return (
                              <tr key={item.studentId ?? rowIdx}>
                                <td style={stickyStyle(0)}>{(meta.page - 1) * meta.limit + rowIdx + 1}</td>
                                <td style={stickyStyle(1)}>
                                  <button
                                    className="student-name-btn"
                                    onClick={() => handleStudentClick(item)}
                                    type="button"
                                  >
                                    {item.studentName || "-"}
                                  </button>
                                </td>
                                <td style={stickyStyle(2)}>{item.adviserName || "-"}</td>
                                <td style={stickyStyle(3)}>{item.totalCalls}</td>
                                <td style={stickyStyle(4)}>{item.successfulCalls}</td>
                                <td style={stickyStyle(5)}>{toJalali(item.lastCallAt)}</td>
                                {questions.map((q) => {
                                  const a = answerMap[q.id];
                                  return (
                                    <td
                                      key={q.id}
                                      className={
                                        a?.isAnswered ? "answer-cell-answered" : "answer-cell-empty"
                                      }
                                      style={{ minWidth: 150, maxWidth: 150 }}
                                      title={a?.resolvedAnswer || ""}
                                    >
                                      {a ? <AnswerCellContent answer={a} /> : "—"}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3">
                  <Paginations
                    perPageData={meta.limit}
                    data={data}
                    totalRecords={meta.total}
                    currentPage={meta.page}
                    setCurrentPage={handlePageChange}
                    isShowingPageLength={true}
                    paginationDiv="col-sm-auto"
                    paginationClass="pagination pagination-sm mb-0"
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      <StudentDrawer
        isOpen={drawerOpen}
        toggle={() => setDrawerOpen(false)}
        formId={formId}
        student={selectedStudent}
      />
    </div>
  );
};

export default AnswerSheet;
