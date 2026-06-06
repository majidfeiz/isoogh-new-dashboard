import React, { useCallback, useEffect, useMemo, useState } from "react";
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
} from "reactstrap";
import { useNavigate } from "react-router-dom";

import moment from "moment-jalaali";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  getSuperAdviserSalary,
  getSuperAdviserAdvisers,
  getSuperAdviserSupportForms,
} from "../../services/superAdviserPortalService.jsx";

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

  const [salaryData, setSalaryData] = useState({
    year: currentJalaliYear,
    month: currentJalaliMonth,
    advisers: [],
    totalDurationSeconds: 0,
    durationFormatted: "00:00:00",
  });
  const [filters, setFilters] = useState({
    year: currentJalaliYear,
    month: currentJalaliMonth,
    adviserId: "",
    supportFormId: "",
  });
  const [advisers, setAdvisers] = useState([]);
  const [supportForms, setSupportForms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSuperAdviserAdvisers({ page: 1, limit: 100 })
      .then((res) => setAdvisers(res.items || []))
      .catch(() => {});
    getSuperAdviserSupportForms({ page: 1, limit: 100 })
      .then((res) => setSupportForms(res.items || []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(
    async (currentFilters = filters) => {
      setLoading(true);
      try {
        const res = await getSuperAdviserSalary({
          year: currentFilters.year,
          month: currentFilters.month,
          adviserId: currentFilters.adviserId,
          supportFormId: currentFilters.supportFormId,
        });
        setSalaryData(res);
      } catch (e) {
        if (e?.response?.status === 403) navigate("/pages-404");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchData(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: name === "year" || name === "month" ? Number(value) : value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(filters);
  };

  const handleResetFilters = () => {
    const reset = {
      year: currentJalaliYear,
      month: currentJalaliMonth,
      adviserId: "",
      supportFormId: "",
    };
    setFilters(reset);
    fetchData(reset);
  };

  const monthLabel = useMemo(
    () => PERSIAN_MONTHS.find((m) => m.value === salaryData.month)?.label || "",
    [salaryData.month]
  );

  const totalSeconds = useMemo(
    () => salaryData.advisers.reduce((acc, a) => acc + a.totalDurationSeconds, 0),
    [salaryData.advisers]
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
                  <h4 className="card-title mb-1">گزارش حقوق ماهانه</h4>
                  <p className="text-muted mb-0">
                    کل مدت تماس ماه {monthLabel} {salaryData.year}:{" "}
                    <strong className="text-primary">{salaryData.durationFormatted}</strong>
                  </p>
                </div>
                {loading && <Spinner size="sm" color="primary" />}
              </CardHeader>

              <CardBody>
                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="2" lg="3" md="4">
                      <Label className="form-label">سال</Label>
                      <Input
                        type="select"
                        name="year"
                        value={filters.year}
                        onChange={handleFilterChange}
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
                    <Col className="d-flex gap-2" xl="2" lg="3" md="4">
                      <Button color="primary" type="submit" disabled={loading}>
                        اعمال
                      </Button>
                      <Button color="light" type="button" onClick={handleResetFilters} disabled={loading}>
                        ریست
                      </Button>
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
                          <td>{totalSeconds.toLocaleString("fa-IR")}</td>
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
