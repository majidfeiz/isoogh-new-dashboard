import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Row,
  Spinner,
} from "reactstrap";
import { useNavigate } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getSuperAdviserSupportForms,
  getSuperAdviserAdvisers,
  getSuperAdviserSchools,
} from "../../services/superAdviserPortalService.jsx";

const formatUnixDate = (unix) => {
  if (!unix) return "-";
  return new Date(unix * 1000).toLocaleString("fa-IR");
};

const formatSeconds = (sec) => {
  if (!sec && sec !== 0) return "-";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const SupportForms = () => {
  document.title = "فرم‌های تماس | سر مشاور | داشبورد آیسوق";

  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 });
  const [filters, setFilters] = useState({ search: "", adviserId: "", schoolId: "" });
  const [advisers, setAdvisers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSuperAdviserAdvisers({ page: 1, limit: 100 })
      .then((res) => setAdvisers(res.items || []))
      .catch(() => {});
    getSuperAdviserSchools({ page: 1, limit: 100 })
      .then((res) => setSchools(res.items || []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(
    async (page = 1, currentFilters = filters) => {
      setLoading(true);
      try {
        const res = await getSuperAdviserSupportForms({
          page,
          limit: meta.limit,
          search: currentFilters.search,
          adviserId: currentFilters.adviserId,
          schoolId: currentFilters.schoolId,
        });
        setData(res.items || []);
        setMeta(res.pagination || { page, limit: meta.limit, total: 0, lastPage: 1 });
      } catch (e) {
        if (e?.response?.status === 403) navigate("/pages-404");
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0, lastPage: 1 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit, navigate]
  );

  useEffect(() => {
    fetchData(1, filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, filters);
  };

  const handleResetFilters = () => {
    const reset = { search: "", adviserId: "", schoolId: "" };
    setFilters(reset);
    fetchData(1, reset);
  };

  const handlePageChange = (page) => fetchData(page, filters);

  const handleRowClick = (row) => {
    navigate(`/super-adviser-portal/performance-report?supportFormId=${row.original.id}`);
  };

  const columns = useMemo(
    () => [
      {
        id: "title",
        header: "عنوان",
        accessorKey: "title",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "callDuration",
        header: "مدت تماس (ثانیه)",
        accessorKey: "callDuration",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => formatSeconds(info.getValue()),
      },
      {
        id: "adviserCount",
        header: "تعداد مشاوران",
        accessorKey: "adviserCount",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "startAt",
        header: "شروع",
        accessorKey: "startAt",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => formatUnixDate(info.getValue()),
      },
      {
        id: "endAt",
        header: "پایان",
        accessorKey: "endAt",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => formatUnixDate(info.getValue()),
      },
      {
        id: "actions",
        header: "عملیات",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="d-flex gap-1">
            <Button
              color="info"
              size="sm"
              onClick={() => handleRowClick(row)}
            >
              گزارش عملکرد
            </Button>
            <Button
              color="primary"
              size="sm"
              onClick={() =>
                navigate(`/super-adviser-portal/answer-sheet/${row.original.id}`)
              }
            >
              پاسخنامه
            </Button>
          </div>
        ),
      },
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="سر مشاور" breadcrumbItem="فرم‌های تماس" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">فرم‌های تماس</h4>
                  <p className="text-muted mb-0">لیست فرم‌های تماس مشاوران تحت نظارت</p>
                </div>
                {loading && <Spinner size="sm" color="primary" />}
              </CardHeader>

              <CardBody>
                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
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
                          placeholder="عنوان فرم"
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
                    <Col xl="2" lg="3" md="4">
                      <Label className="form-label">مدرسه</Label>
                      <Input
                        type="select"
                        name="schoolId"
                        value={filters.schoolId}
                        onChange={handleFilterChange}
                      >
                        <option value="">همه مدارس</option>
                        {schools.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </Input>
                    </Col>
                    <Col className="d-flex gap-2" xl="2" lg="3" md="4">
                      <Button color="primary" type="submit" disabled={loading}>
                        جستجو
                      </Button>
                      <Button color="light" type="button" onClick={handleResetFilters} disabled={loading}>
                        ریست
                      </Button>
                    </Col>
                  </Row>
                </Form>

                <TableContainer
                  columns={columns}
                  data={data || []}
                  isGlobalFilter={false}
                  isPagination={false}
                  isLoading={loading}
                  tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                />

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
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SupportForms;
