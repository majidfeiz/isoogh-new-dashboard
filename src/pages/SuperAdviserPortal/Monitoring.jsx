import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
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
} from "reactstrap";
import { useNavigate } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import {
  getSuperAdviserMonitoring,
  getSuperAdviserSchools,
  getSuperAdviserSupportForms,
} from "../../services/superAdviserPortalService.jsx";

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}:${String(m).padStart(2, "0")}`;
};

const todayIso = () => new Date().toISOString().split("T")[0];

const Monitoring = () => {
  document.title = "نظارت | سر مشاور | داشبورد آیسوق";

  const navigate = useNavigate();

  const [monitoringData, setMonitoringData] = useState({
    date: "",
    totalAdvisers: 0,
    onlineAdvisersToday: 0,
    advisers: [],
  });
  const [filters, setFilters] = useState({
    date: todayIso(),
    schoolId: "",
    supportFormId: "",
  });
  const [schools, setSchools] = useState([]);
  const [supportForms, setSupportForms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSuperAdviserSchools({ page: 1, limit: 100 })
      .then((res) => setSchools(res.items || []))
      .catch(() => {});
    getSuperAdviserSupportForms({ page: 1, limit: 100 })
      .then((res) => setSupportForms(res.items || []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(
    async (currentFilters = filters) => {
      setLoading(true);
      try {
        const res = await getSuperAdviserMonitoring({
          date: currentFilters.date,
          schoolId: currentFilters.schoolId,
          supportFormId: currentFilters.supportFormId,
        });
        setMonitoringData(res);
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
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(filters);
  };

  const handleResetFilters = () => {
    const reset = { date: todayIso(), schoolId: "", supportFormId: "" };
    setFilters(reset);
    fetchData(reset);
  };

  const offlineAdvisers = monitoringData.totalAdvisers - monitoringData.onlineAdvisersToday;

  const sortedAdvisers = useMemo(
    () =>
      [...(monitoringData.advisers || [])].sort(
        (a, b) => b.totalCallsAll - a.totalCallsAll
      ),
    [monitoringData.advisers]
  );

  const columns = useMemo(
    () => [
      {
        id: "adviserName",
        header: "نام مشاور",
        accessorKey: "adviserName",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "adviserCode",
        header: "کد",
        accessorKey: "adviserCode",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "isOnlineToday",
        header: "وضعیت امروز",
        accessorKey: "isOnlineToday",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) =>
          info.getValue() ? (
            <Badge color="success" pill>
              <i className="bx bx-circle me-1" />
              آنلاین
            </Badge>
          ) : (
            <Badge color="secondary" pill>
              آفلاین
            </Badge>
          ),
      },
      {
        id: "totalCallsToday",
        header: "تماس امروز",
        accessorKey: "totalCallsToday",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() ?? 0,
      },
      {
        id: "totalCallsAll",
        header: "کل تماس",
        accessorKey: "totalCallsAll",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() ?? 0,
      },
      {
        id: "successfulCallsAll",
        header: "موفق",
        accessorKey: "successfulCallsAll",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => (
          <Badge color="success" pill>{info.getValue() ?? 0}</Badge>
        ),
      },
      {
        id: "unsuccessfulCallsAll",
        header: "ناموفق",
        accessorKey: "unsuccessfulCallsAll",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => (
          <Badge color="danger" pill>{info.getValue() ?? 0}</Badge>
        ),
      },
      {
        id: "answeredFormsCount",
        header: "فرم‌های پاسخ داده",
        accessorKey: "answeredFormsCount",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() ?? 0,
      },
      {
        id: "totalCallDurationSeconds",
        header: "مدت تماس (ساعت)",
        accessorKey: "totalCallDurationSeconds",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => formatDuration(info.getValue()),
      },
    ],
    []
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="سر مشاور" breadcrumbItem="نظارت" />

        <Row className="mb-4">
          <Col md={4}>
            <Card className="mini-stats-wid">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <p className="text-muted fw-medium mb-1">تعداد کل مشاوران</p>
                    <h4 className="mb-0">{monitoringData.totalAdvisers}</h4>
                  </div>
                  <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                    <span className="avatar-title rounded-circle bg-primary">
                      <i className="bx bx-user-voice font-size-24" />
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mini-stats-wid">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <p className="text-muted fw-medium mb-1">آنلاین امروز</p>
                    <h4 className="mb-0 text-success">{monitoringData.onlineAdvisersToday}</h4>
                  </div>
                  <div className="avatar-sm rounded-circle bg-success align-self-center mini-stat-icon">
                    <span className="avatar-title rounded-circle bg-success">
                      <i className="bx bx-check-circle font-size-24" />
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mini-stats-wid">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <p className="text-muted fw-medium mb-1">آفلاین امروز</p>
                    <h4 className="mb-0 text-secondary">{offlineAdvisers < 0 ? 0 : offlineAdvisers}</h4>
                  </div>
                  <div className="avatar-sm rounded-circle bg-secondary align-self-center mini-stat-icon">
                    <span className="avatar-title rounded-circle bg-secondary">
                      <i className="bx bx-x-circle font-size-24" />
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">وضعیت مشاوران</h4>
                  {monitoringData.date && (
                    <p className="text-muted mb-0">
                      تاریخ: <strong>{monitoringData.date}</strong>
                    </p>
                  )}
                </div>
                {loading && <Spinner size="sm" color="primary" />}
              </CardHeader>

              <CardBody>
                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="2" lg="3" md="4">
                      <Label className="form-label">تاریخ</Label>
                      <Input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col xl="3" lg="4" md="5">
                      <Label className="form-label">مجموعه</Label>
                      <Input
                        type="select"
                        name="schoolId"
                        value={filters.schoolId}
                        onChange={handleFilterChange}
                      >
                        <option value="">همه مجموعه‌ها</option>
                        {schools.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </Input>
                    </Col>
                    <Col xl="3" lg="4" md="5">
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

                <TableContainer
                  columns={columns}
                  data={sortedAdvisers}
                  isGlobalFilter={false}
                  isPagination={false}
                  isLoading={loading}
                  tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Monitoring;
