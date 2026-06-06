import React, { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  InputGroup,
  InputGroupText,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import moment from "moment-jalaali";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getAdviserCallLogs,
  getAdviserSupportForms,
  getAdviserSchools,
} from "../../services/adviserPortalService.jsx";

const formatJalali = (value, withTime = true) => {
  if (!value) return "—";
  const numeric = Number(value);
  const date = !Number.isNaN(numeric) && numeric
    ? new Date(numeric < 1_000_000_000_000 ? numeric * 1000 : numeric)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return moment(date).format(withTime ? "jYYYY/jMM/jDD HH:mm" : "jYYYY/jMM/jDD");
};

const formatSeconds = (sec) => {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const dispositionConfig = {
  ANSWERED: { label: "پاسخ داده شد", color: "success" },
  "NO ANSWER": { label: "پاسخ داده نشد", color: "danger" },
  BUSY: { label: "مشغول", color: "warning" },
  FAILED: { label: "ناموفق", color: "secondary" },
};

const toTimestamp = (dateValue) => {
  if (!dateValue) return "";
  try {
    const iso = dateValue.toDate ? dateValue.toDate().toISOString() : String(dateValue);
    return iso.split("T")[0];
  } catch {
    return "";
  }
};

const CallLogs = () => {
  document.title = "لاگ تماس‌های من | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 });
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [supportFormId, setSupportFormId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [supportForms, setSupportForms] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);

  const fetchOptions = useCallback(async () => {
    try {
      const schoolsRes = await getAdviserSchools({ page: 1, limit: 100 });
      const schoolId = schoolsRes.items?.[0]?.id;
      if (schoolId) {
        const formsRes = await getAdviserSupportForms({ schoolId, page: 1, limit: 200 });
        setSupportForms(formsRes.items || []);
      }
    } catch {
      setSupportForms([]);
    }
  }, []);

  const fetchData = useCallback(
    async (page = 1, opts = {}) => {
      setLoading(true);
      try {
        const res = await getAdviserCallLogs({
          page,
          limit: 15,
          search: opts.search ?? search,
          supportFormId: opts.supportFormId ?? supportFormId,
          startDate: toTimestamp(opts.startDate ?? startDate),
          endDate: toTimestamp(opts.endDate ?? endDate),
        });
        setData(res.items || []);
        setMeta(res.pagination || { page, limit: 15, total: 0, lastPage: 1 });
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [search, supportFormId, startDate, endDate]
  );

  useEffect(() => {
    fetchOptions();
    fetchData(1);
  }, [fetchOptions, fetchData]);

  const handleReset = () => {
    setSearch("");
    setSupportFormId("");
    setStartDate(null);
    setEndDate(null);
    fetchData(1, { search: "", supportFormId: "", startDate: null, endDate: null });
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="پورتال مشاور" breadcrumbItem="لاگ تماس‌های من" />

        <Row className="g-3 mb-4">
          {[
            {
              label: "تماس امروز",
              value: summaryStats?.today ?? "—",
              icon: "bx-calendar-today",
              color: "primary",
            },
            {
              label: "تماس این هفته",
              value: summaryStats?.week ?? "—",
              icon: "bx-calendar-week",
              color: "info",
            },
            {
              label: "تماس این ماه",
              value: summaryStats?.month ?? "—",
              icon: "bx-calendar",
              color: "warning",
            },
            {
              label: "کل دانش‌آموزان تماس گرفته",
              value: summaryStats?.totalStudentsCalled ?? meta.total ?? "—",
              icon: "bx-group",
              color: "success",
            },
            {
              label: "درصد تکمیل",
              value: summaryStats?.completionPct != null ? `${summaryStats.completionPct}%` : "—",
              icon: "bx-check-double",
              color: "secondary",
            },
          ].map(({ label, value, icon, color }) => (
            <Col key={label} xs={6} md={4} lg={2} xl={2}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody className="text-center p-3">
                  <i className={`bx ${icon} font-size-24 text-${color} mb-2 d-block`} />
                  <h5 className="mb-0 fw-bold">{value}</h5>
                  <small className="text-muted">{label}</small>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-white border-bottom">
            <h5 className="mb-3">فیلترها</h5>
            <Row className="g-2 align-items-end">
              <Col md={3}>
                <InputGroup size="sm">
                  <InputGroupText>
                    <i className="bx bx-search" />
                  </InputGroupText>
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchData(1)}
                    placeholder="نام یا تلفن دانش‌آموز..."
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Input
                  type="select"
                  bsSize="sm"
                  value={supportFormId}
                  onChange={(e) => {
                    setSupportFormId(e.target.value);
                    fetchData(1, { supportFormId: e.target.value });
                  }}
                >
                  <option value="">همه فرم‌ها</option>
                  {supportForms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col md={2}>
                <DatePicker
                  value={startDate}
                  onChange={(v) => {
                    setStartDate(v);
                    fetchData(1, { startDate: v });
                  }}
                  calendar={persian}
                  locale={persian_fa}
                  placeholder="از تاریخ"
                  inputClass="form-control form-control-sm"
                  containerStyle={{ width: "100%" }}
                />
              </Col>
              <Col md={2}>
                <DatePicker
                  value={endDate}
                  onChange={(v) => {
                    setEndDate(v);
                    fetchData(1, { endDate: v });
                  }}
                  calendar={persian}
                  locale={persian_fa}
                  placeholder="تا تاریخ"
                  inputClass="form-control form-control-sm"
                  containerStyle={{ width: "100%" }}
                />
              </Col>
              <Col md={2} className="d-flex gap-2">
                <Button color="primary" size="sm" onClick={() => fetchData(1)} disabled={loading}>
                  اعمال
                </Button>
                <Button color="light" size="sm" onClick={handleReset} disabled={loading}>
                  ریست
                </Button>
              </Col>
            </Row>
          </CardHeader>

          <CardBody className="p-0">
            {loading && data.length === 0 ? (
              <div className="text-center py-5">
                <Spinner color="primary" />
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-5">
                <i className="bx bx-phone-off display-4 text-muted" />
                <h5 className="mt-3 text-muted">لاگ تماسی یافت نشد</h5>
              </div>
            ) : (
              <div className="table-responsive">
                <Table className="table-hover align-middle mb-0" dir="rtl">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th>نام دانش‌آموز</th>
                      <th>تلفن دانش‌آموز</th>
                      <th>فرم تماس</th>
                      <th>وضعیت تماس</th>
                      <th>مدت تماس</th>
                      <th>تاریخ تماس</th>
                      <th style={{ width: 80 }}>پاسخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((log, idx) => {
                      const disposition = dispositionConfig[log.disposition] || {
                        label: log.disposition || "نامشخص",
                        color: "secondary",
                      };
                      return (
                        <tr key={log.id}>
                          <td className="text-muted small">
                            {(meta.page - 1) * meta.limit + idx + 1}
                          </td>
                          <td className="fw-semibold">{log.studentName || "—"}</td>
                          <td className="text-muted small">{log.studentPhone || "—"}</td>
                          <td className="text-muted small">{log.supportFormTitle || "—"}</td>
                          <td>
                            <Badge color={disposition.color} pill>
                              {disposition.label}
                            </Badge>
                          </td>
                          <td className="text-muted small">{formatSeconds(log.duration)}</td>
                          <td className="text-muted small">{formatJalali(log.callDate)}</td>
                          <td>
                            {log.hasAnswers ? (
                              <i className="bx bx-check-circle text-success font-size-18" />
                            ) : (
                              <i className="bx bx-x-circle text-danger font-size-18" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
              setCurrentPage={(page) => fetchData(page)}
              isShowingPageLength={true}
              paginationDiv="col-sm-auto"
              paginationClass="pagination pagination-sm mb-0"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CallLogs;
