import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  Input,
  Label,
  Row,
  Spinner,
  Table,
  Alert,
} from "reactstrap";
import { useNavigate } from "react-router-dom";

import moment from "moment-jalaali";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  exportSuperAdviserSalary,
  getSuperAdviserSalary,
  getSuperAdviserAdvisers,
  getSuperAdviserSupportForms,
} from "../../services/superAdviserPortalService.jsx";
import { salaryExportErrorMessage, saveSalaryExportBlob } from "./salaryExportUtils.js";
import { buildSalaryRequestFilters, effectiveSalaryRangeLabel } from "./salaryDateUtils.js";

const PERSIAN_MONTHS = [
  { value: 1, label: "فروردین" },
  { value: 2, label: "اردیبهشت" },
  { value: 3, label: "خرداد" },
  { value: 4, label: "تیر" },
  { value: 5, label: "مرداد" },
  { value: 6, label: "شهریور" },
  { value: 7, label: "مهر" },
  { value: 8, label: "آبان" },
  { value: 9, label: "آذر" },
  { value: 10, label: "دی" },
  { value: 11, label: "بهمن" },
  { value: 12, label: "اسفند" },
];

const currentJalaliYear = moment().jYear();
const currentJalaliMonth = moment().jMonth() + 1;
const YEARS = Array.from({ length: 5 }, (_, i) => currentJalaliYear - i);

const Salary = () => {
  document.title = "حقوق | سر مشاور | داشبورد آیسوق";

  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [salaryData, setSalaryData] = useState({
    year: currentJalaliYear,
    month: currentJalaliMonth,
    from: null,
    to: null,
    advisers: [],
    totalDurationSeconds: 0,
    durationFormatted: "00:00:00",
  });
  const [filters, setFilters] = useState({
    year: currentJalaliYear,
    month: currentJalaliMonth,
    adviserId: "",
    supportFormId: "",
    dateRange: [],
  });
  const [appliedFilters, setAppliedFilters] = useState({
    year: currentJalaliYear,
    month: currentJalaliMonth,
    adviserId: "",
    supportFormId: "",
  });
  const [advisers, setAdvisers] = useState([]);
  const [supportForms, setSupportForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState(null);
  const requestAbortRef = useRef(null);

  useEffect(() => {
    getSuperAdviserAdvisers({ page: 1, limit: 100 })
      .then((res) => setAdvisers(res.items || []))
      .catch(() => {});
    getSuperAdviserSupportForms({ page: 1, limit: 100 })
      .then((res) => setSupportForms(res.items || []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(
    async (currentFilters) => {
      requestAbortRef.current?.abort();
      const controller = new AbortController();
      requestAbortRef.current = controller;
      setLoading(true);
      try {
        const res = await getSuperAdviserSalary(currentFilters, controller.signal);
        if (controller.signal.aborted) return;
        setAppliedFilters(currentFilters);
        setSalaryData(res);
      } catch (e) {
        if (controller.signal.aborted || e?.code === "ERR_CANCELED" || e?.name === "CanceledError") return;
        if (e?.response?.status === 403) navigate("/pages-404");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchData(buildSalaryRequestFilters(filters));
    return () => requestAbortRef.current?.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: name === "year" || name === "month" ? Number(value) : value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setNotice(null);
    fetchData(buildSalaryRequestFilters(filters));
  };

  const handleClearRange = () => {
    const next = { ...filters, dateRange: [] };
    setFilters(next);
    setNotice(null);
    fetchData(buildSalaryRequestFilters(next));
  };

  const handleResetFilters = () => {
    const reset = {
      year: currentJalaliYear,
      month: currentJalaliMonth,
      adviserId: "",
      supportFormId: "",
      dateRange: [],
    };
    setFilters(reset);
    setNotice(null);
    fetchData(buildSalaryRequestFilters(reset));
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    setNotice(null);
    try {
      const result = await exportSuperAdviserSalary(appliedFilters);
      saveSalaryExportBlob(
        result.blob,
        result.contentDisposition,
        salaryData.year,
        salaryData.month
      );
      setNotice({ color: "success", message: "فایل Excel با موفقیت دریافت شد" });
    } catch (error) {
      setNotice({ color: "danger", message: await salaryExportErrorMessage(error) });
    } finally {
      setExporting(false);
    }
  };

  const monthLabel = useMemo(
    () => PERSIAN_MONTHS.find((m) => m.value === salaryData.month)?.label || "",
    [salaryData.month]
  );

  const effectiveRange = useMemo(
    () => effectiveSalaryRangeLabel(salaryData.from, salaryData.to),
    [salaryData.from, salaryData.to]
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="سر مشاور" breadcrumbItem="حقوق" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">گزارش حقوق سرمشاور</h4>
                  <p className="text-muted mb-0">
                    کل مدت تماس {effectiveRange ? `از ${effectiveRange}` : `ماه ${monthLabel} ${salaryData.year}`}:{" "}
                    <strong className="text-primary">{salaryData.durationFormatted}</strong>
                  </p>
                </div>
                {loading && <Spinner size="sm" color="primary" />}
              </CardHeader>

              <CardBody>
                {notice && <Alert color={notice.color}>{notice.message}</Alert>}
                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label">بازه تاریخ</Label>
                      <DatePicker
                        range
                        calendar={persian}
                        locale={persianFa}
                        value={filters.dateRange}
                        onChange={(dateRange) => setFilters((prev) => ({ ...prev, dateRange: dateRange || [] }))}
                        format="YYYY/MM/DD"
                        inputClass="form-control"
                        calendarPosition="bottom-right"
                        placeholder="انتخاب بازه شمسی"
                      />
                    </Col>
                    <Col xl="2" lg="3" md="4">
                      <Label className="form-label">سال</Label>
                      <Input
                        type="select"
                        name="year"
                        value={filters.year}
                        onChange={handleFilterChange}
                        disabled={filters.dateRange?.length === 2}
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </Input>
                    </Col>
                    <Col xl="2" lg="3" md="4">
                      <Label className="form-label">ماه</Label>
                      <Input
                        type="select"
                        name="month"
                        value={filters.month}
                        onChange={handleFilterChange}
                        disabled={filters.dateRange?.length === 2}
                      >
                        {PERSIAN_MONTHS.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </Input>
                    </Col>
                    <Col xl="3" lg="3" md="5">
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
                    <Col xl="3" lg="3" md="5">
                      <Label className="form-label">فرم تماس</Label>
                      <Input
                        type="select"
                        name="supportFormId"
                        value={filters.supportFormId}
                        onChange={handleFilterChange}
                      >
                        <option value="">همه فرم‌ها</option>
                        {supportForms.map((f) => (
                          <option key={f.id} value={f.id}>{f.title}</option>
                        ))}
                      </Input>
                    </Col>
                    <Col className="d-flex gap-2 flex-wrap" xl="2" lg="3" md="4">
                      <Button color="primary" type="submit" disabled={loading}>
                        اعمال
                      </Button>
                      <Button color="light" type="button" onClick={handleResetFilters} disabled={loading}>
                        ریست
                      </Button>
                      {filters.dateRange?.length > 0 && (
                        <Button color="secondary" outline type="button" onClick={handleClearRange} disabled={loading}>
                          پاک‌کردن بازه
                        </Button>
                      )}
                      {hasPermission("super-adviser-portal.salary.index") && (
                        <Button color="success" outline type="button" onClick={handleExport} disabled={exporting}>
                          {exporting ? <Spinner size="sm" className="ms-1" /> : <i className="bx bx-spreadsheet ms-1" />}
                          خروجی Excel
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Form>

                <div className="table-responsive">
                  <Table className="table table-bordered table-nowrap mb-0" dir="rtl">
                    <thead className="table-light">
                      <tr>
                        <th>نام مشاور</th>
                        <th>کد</th>
                        <th>کل تماس</th>
                        <th>تماس موفق</th>
                        <th>مدت تماس (ثانیه)</th>
                        <th>مدت فرمت‌شده</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryData.advisers.length === 0 && !loading && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            داده‌ای یافت نشد
                          </td>
                        </tr>
                      )}
                      {salaryData.advisers.map((adviser) => (
                        <tr key={adviser.adviserId}>
                          <td>{adviser.adviserName || "-"}</td>
                          <td>{adviser.adviserCode || "-"}</td>
                          <td>{adviser.totalCalls}</td>
                          <td>{adviser.successfulCalls}</td>
                          <td>{adviser.totalDurationSeconds.toLocaleString("fa-IR")}</td>
                          <td>
                            <span className="font-monospace fw-bold text-primary">
                              {adviser.durationFormatted}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {salaryData.advisers.length > 0 && (
                      <tfoot className="table-light fw-bold">
                        <tr>
                          <td colSpan={4}>جمع کل</td>
                          <td>{Number(salaryData.totalDurationSeconds || 0).toLocaleString("fa-IR")}</td>
                          <td>
                            <span className="font-monospace text-success">
                              {salaryData.durationFormatted}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </Table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Salary;
