import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, Col, Input, Label, Row } from "reactstrap";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import moment from "moment-jalaali";

import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import TableContainer from "../../components/Common/TableContainer.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSchools } from "../../services/schoolService.jsx";
import { getSupportForms } from "../../services/supportFormService.jsx";
import { exportAnswerSheets, getAnswerSheets } from "../../services/answerSheetService.jsx";
import AnswerSheetDetailModal from "./AnswerSheetDetailModal.jsx";
import AnswerSheetCallModal from "./AnswerSheetCallModal.jsx";
import AnswerSheetActions from "./AnswerSheetActions.jsx";
import {
  EMPTY_FILTERS,
  formatJalaliDateTime,
  getErrorMessage,
  normalizeLatinDigits,
  parseAnswerSheetQuery,
  parseFilename,
  serializeAnswerSheetQuery,
} from "./answerSheetUtils.js";

const toDateObject = (value) => value ? new DateObject({ date: moment(value, "YYYY-MM-DD").toDate(), calendar: persian, locale: persianFa }) : null;
const toGregorian = (value) => value ? normalizeLatinDigits(value.convert(gregorian).format("YYYY-MM-DD")) : "";

const AnswerSheetList = () => {
  document.title = "پاسخ‌نامه‌ها | داشبورد آیسوق";
  const { hasPermission, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const query = useMemo(() => parseAnswerSheetQuery(new URLSearchParams(queryString)), [queryString]);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: query.page, limit: query.limit, total: 0, lastPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [studentDraft, setStudentDraft] = useState(query.studentSearch);
  const [adviserDraft, setAdviserDraft] = useState(query.adviserSearch);
  const [dateFrom, setDateFrom] = useState(() => toDateObject(query.dateFrom));
  const [dateTo, setDateTo] = useState(() => toDateObject(query.dateTo));
  const [filterError, setFilterError] = useState("");
  const [activeAction, setActiveAction] = useState(null);
  const [exporting, setExporting] = useState({ table: false, answers: false });
  const requestRef = useRef(null);

  const canSelectAllSchools = useMemo(() => (user?.roles || []).some((role) => {
    const name = String(role?.slug || role?.name || role || "").toLowerCase();
    return ["admin", "super-admin", "super_admin"].includes(name);
  }), [user?.roles]);
  const canShow = hasPermission("answer-sheets.show");
  const canShowCall = hasPermission("answer-sheets.call.show");
  const canExport = hasPermission("answer-sheets.export");

  const updateQuery = useCallback((updates) => {
    setSearchParams(serializeAnswerSheetQuery({ ...query, ...updates }));
  }, [query, setSearchParams]);

  useEffect(() => {
    const embedded = Array.isArray(user?.schools)
      ? user.schools
      : Array.isArray(user?.managedSchools)
        ? user.managedSchools
        : user?.school
          ? [user.school]
          : user?.schoolId
            ? [{ id: user.schoolId, name: user.schoolName || "مجموعه من" }]
            : [];
    setSchoolsLoading(true);
    getSchools({ page: 1, limit: 500 })
      .then((result) => setSchools(result?.items || embedded))
      .catch(() => setSchools(embedded))
      .finally(() => setSchoolsLoading(false));
  }, [user]);

  useEffect(() => {
    if (schoolsLoading || canSelectAllSchools || !schools.length) return;
    const allowed = new Set(schools.map((school) => String(school.id)));
    const safeSchoolId = allowed.has(String(query.schoolId)) ? query.schoolId : String(schools[0].id);
    if (safeSchoolId !== query.schoolId) updateQuery({ schoolId: safeSchoolId, supportFormId: "", page: 1 });
  }, [canSelectAllSchools, query.schoolId, schools, schoolsLoading, updateQuery]);

  useEffect(() => {
    setForms([]);
    if (!query.schoolId) return;
    let active = true;
    setFormsLoading(true);
    getSupportForms({ page: 1, limit: 500, schoolId: query.schoolId })
      .then((result) => { if (active) setForms(result?.items || []); })
      .catch(() => { if (active) setForms([]); })
      .finally(() => { if (active) setFormsLoading(false); });
    return () => { active = false; };
  }, [query.schoolId]);

  useEffect(() => {
    setStudentDraft(query.studentSearch);
    setAdviserDraft(query.adviserSearch);
    setDateFrom(toDateObject(query.dateFrom));
    setDateTo(toDateObject(query.dateTo));
  }, [query.adviserSearch, query.dateFrom, query.dateTo, query.studentSearch]);

  useEffect(() => {
    if (studentDraft === query.studentSearch && adviserDraft === query.adviserSearch) return undefined;
    const timer = setTimeout(() => updateQuery({ studentSearch: studentDraft, adviserSearch: adviserDraft, page: 1 }), 400);
    return () => clearTimeout(timer);
  }, [adviserDraft, query.adviserSearch, query.studentSearch, studentDraft, updateQuery]);

  const fetchData = useCallback(async () => {
    if (!hasPermission("answer-sheets.index")) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setActiveAction(null);
    setLoading(true);
    setError("");
    try {
      const result = await getAnswerSheets({ ...query, signal: controller.signal });
      if (controller.signal.aborted) return;
      setItems(result.items);
      setMeta(result.pagination);
    } catch (err) {
      if (err?.code === "ERR_CANCELED") return;
      setItems([]);
      setError(getErrorMessage(err, "پاسخ‌نامه‌ها"));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [hasPermission, query]);

  useEffect(() => { fetchData(); return () => requestRef.current?.abort(); }, [fetchData]);

  const applyDates = () => {
    const from = toGregorian(dateFrom);
    const to = toGregorian(dateTo);
    if (from && to && from > to) return setFilterError("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.");
    setFilterError("");
    updateQuery({ dateFrom: from, dateTo: to, page: 1 });
  };

  const resetFilters = () => {
    const managerSchoolId = !canSelectAllSchools && schools[0]?.id ? String(schools[0].id) : "";
    setSearchParams(serializeAnswerSheetQuery({ ...EMPTY_FILTERS, page: 1, limit: query.limit, schoolId: managerSchoolId }));
  };

  const download = async (kind) => {
    if (exporting[kind] || (kind === "answers" && !query.supportFormId)) return;
    setExporting((state) => ({ ...state, [kind]: true }));
    try {
      const result = await exportAnswerSheets(kind, query);
      const fallback = kind === "answers" ? "answer-sheet-answers.xlsx" : "answer-sheets.xlsx";
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = parseFilename(result.contentDisposition, fallback);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // httpClient already displays localized validation and authorization errors.
    } finally {
      setExporting((state) => ({ ...state, [kind]: false }));
    }
  };

  const columns = useMemo(() => [
    { id: "supportFormTitle", accessorKey: "supportFormTitle", header: "نام فرم تماس", enableSorting: false, cell: ({ getValue }) => getValue() || "—" },
    { id: "schoolName", accessorKey: "schoolName", header: "مجموعه", enableSorting: false, cell: ({ getValue }) => getValue() || "—" },
    { id: "studentName", accessorKey: "studentName", header: "نام دانش‌آموز", enableSorting: false, cell: ({ getValue }) => getValue() || "—" },
    { id: "studentSsn", accessorKey: "studentSsn", header: "کد ملی", enableSorting: false, cell: ({ getValue }) => getValue() || "—" },
    { id: "adviserName", accessorKey: "adviserName", header: "نام مشاور", enableSorting: false, cell: ({ getValue }) => getValue() || "—" },
    { id: "submittedAt", accessorKey: "submittedAt", header: "تاریخ ثبت", enableSorting: false, cell: ({ getValue }) => formatJalaliDateTime(getValue()) },
    { id: "actions", header: "عملیات", enableSorting: false, cell: ({ row }) => (
      <AnswerSheetActions
        sessionId={row.original.sessionId}
        activeAction={activeAction}
        canShow={canShow}
        canShowCall={canShowCall}
        onSelect={setActiveAction}
      />
    ) },
  ], [activeAction, canShow, canShowCall]);

  if (!hasPermission("answer-sheets.index")) return <Navigate to="/" replace />;

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="گزارشات" breadcrumbItem="پاسخ‌نامه‌ها" />
    <Card>
      <CardHeader className="bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h5 className="mb-0">پاسخ‌نامه‌ها</h5>
        {canExport && <div className="d-flex flex-wrap gap-2">
          <Button color="success" outline disabled={exporting.table} onClick={() => download("table")}>{exporting.table ? "در حال دریافت..." : "خروجی جدول"}</Button>
          <span title={!query.supportFormId ? "برای خروجی جزئیات، ابتدا یک فرم تماس انتخاب کنید" : ""}>
            <Button color="success" disabled={!query.supportFormId || exporting.answers} onClick={() => download("answers")}>{exporting.answers ? "در حال دریافت..." : "خروجی سوالات و پاسخ‌ها"}</Button>
          </span>
        </div>}
      </CardHeader>
      <CardBody>
        <Row className="g-3 align-items-end mb-4">
          <Col xl="2" md="4" sm="6"><Label>مجموعه</Label>
            {canSelectAllSchools ? <Input type="select" value={query.schoolId} disabled={schoolsLoading} onChange={(event) => updateQuery({ schoolId: event.target.value, supportFormId: "", page: 1 })}>
              <option value="">همه مجموعه‌ها</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name || school.title}</option>)}
            </Input> : <Input value={schoolsLoading ? "در حال بارگذاری..." : schools.find((school) => String(school.id) === String(query.schoolId))?.name || schools[0]?.name || "مجموعه مجاز"} readOnly />}
          </Col>
          <Col xl="2" md="4" sm="6"><Label>فرم تماس</Label><Input type="select" value={query.supportFormId} disabled={!query.schoolId || formsLoading} onChange={(event) => updateQuery({ supportFormId: event.target.value, page: 1 })}>
            <option value="">{formsLoading ? "در حال بارگذاری..." : "همه فرم‌ها"}</option>{forms.map((form) => <option key={form.id} value={form.id}>{form.title || form.name}</option>)}
          </Input></Col>
          <Col xl="2" md="4" sm="6"><Label>جستجوی دانش‌آموز</Label><Input value={studentDraft} onChange={(event) => setStudentDraft(event.target.value)} placeholder="نام، نام کاربری یا کد ملی" /></Col>
          <Col xl="2" md="4" sm="6"><Label>نام مشاور</Label><Input value={adviserDraft} onChange={(event) => setAdviserDraft(event.target.value)} placeholder="نام مشاور" /></Col>
          <Col xl="2" md="4" sm="6"><Label>از تاریخ</Label><DatePicker calendar={persian} locale={persianFa} value={dateFrom} onChange={setDateFrom} format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right" /></Col>
          <Col xl="2" md="4" sm="6"><Label>تا تاریخ</Label><DatePicker calendar={persian} locale={persianFa} value={dateTo} onChange={setDateTo} format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right" /></Col>
          <Col xs="12" className="d-flex gap-2"><Button color="primary" onClick={applyDates}>اعمال تاریخ</Button><Button color="light" onClick={resetFilters}>پاک‌کردن همه فیلترها</Button></Col>
        </Row>
        {filterError && <div className="alert alert-warning">{filterError}</div>}
        {error && <div className="alert alert-danger d-flex justify-content-between align-items-center"><span>{error}</span><Button color="danger" outline size="sm" onClick={fetchData}>تلاش دوباره</Button></div>}
        <TableContainer columns={columns} data={items} isGlobalFilter={false} isPagination={false} isLoading={loading} tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline" />
        <Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={(page) => updateQuery({ page })} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />
      </CardBody>
    </Card>
    <AnswerSheetDetailModal sessionId={activeAction?.type === "answers" ? activeAction.sessionId : null} isOpen={activeAction?.type === "answers"} toggle={() => setActiveAction(null)} />
    <AnswerSheetCallModal sessionId={activeAction?.type === "call" ? activeAction.sessionId : null} isOpen={activeAction?.type === "call"} toggle={() => setActiveAction(null)} />
  </div></div>;
};

export default AnswerSheetList;
