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
import { useNavigate, useSearchParams } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getSuperAdviserSupportForms,
  getSuperAdviserSupportFormGrades,
  getSuperAdviserAdvisers,
  getSuperAdviserSchools,
} from "../../services/superAdviserPortalService.jsx";
import {
  isValidSuperAdviserGradeId,
  parseSuperAdviserSupportFormsQuery,
  serializeSuperAdviserSupportFormsQuery,
} from "./supportFormsUtils.js";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const query = useMemo(
    () => parseSuperAdviserSupportFormsQuery(new URLSearchParams(queryString)),
    [queryString]
  );

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 });
  const [filters, setFilters] = useState(() => ({
    search: query.search,
    adviserId: query.adviserId,
    schoolId: query.schoolId,
    gradeId: query.gradeId,
  }));
  const [advisers, setAdvisers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [grades, setGrades] = useState([]);
  const [gradesLoading, setGradesLoading] = useState(true);
  const [gradesResolved, setGradesResolved] = useState(false);
  const [gradesError, setGradesError] = useState("");
  const [gradesRetry, setGradesRetry] = useState(0);
  const [loading, setLoading] = useState(false);
  const gradeNameById = useMemo(
    () => new Map(grades.map((grade) => [grade.id, grade.name])),
    [grades]
  );
  const gradeFilterIsValid = isValidSuperAdviserGradeId(query.gradeId, grades);
  const canLoadForms = !query.gradeId || (gradesResolved && gradeFilterIsValid);

  useEffect(() => {
    getSuperAdviserAdvisers({ page: 1, limit: 100 })
      .then((res) => setAdvisers(res.items || []))
      .catch(() => {});
    getSuperAdviserSchools({ page: 1, limit: 100 })
      .then((res) => setSchools(res.items || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setGradesLoading(true);
    setGradesResolved(false);
    setGradesError("");
    getSuperAdviserSupportFormGrades({ signal: controller.signal })
      .then((items) => {
        setGrades(items);
        setGradesResolved(true);
        if (!isValidSuperAdviserGradeId(query.gradeId, items)) {
          setFilters((current) => ({ ...current, gradeId: "" }));
          setSearchParams(serializeSuperAdviserSupportFormsQuery({ ...query, gradeId: "", page: 1 }), { replace: true });
        }
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED") return;
        setGrades([]);
        setGradesResolved(true);
        setGradesError("دریافت پایه‌ها با خطا مواجه شد.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setGradesLoading(false);
      });
    return () => controller.abort();
    // Grade options only need to reload for an explicit retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradesRetry]);

  useEffect(() => {
    setFilters({
      search: query.search,
      adviserId: query.adviserId,
      schoolId: query.schoolId,
      gradeId: query.gradeId,
    });
  }, [query.adviserId, query.gradeId, query.schoolId, query.search]);

  useEffect(() => {
    if (!canLoadForms) return undefined;
    const controller = new AbortController();
    setLoading(true);
    getSuperAdviserSupportForms({
      page: query.page,
      limit: 15,
      search: query.search,
      adviserId: query.adviserId,
      schoolId: query.schoolId,
      gradeId: query.gradeId,
      signal: controller.signal,
    })
      .then((res) => {
        setData(res.items || []);
        setMeta(res.pagination || { page: query.page, limit: 15, total: 0, lastPage: 1 });
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED") return;
        if (error?.response?.status === 403) navigate("/pages-404");
        setData([]);
        setMeta((prev) => ({ ...prev, page: query.page, total: 0, lastPage: 1 }));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [canLoadForms, navigate, query]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(serializeSuperAdviserSupportFormsQuery({ ...filters, page: 1 }));
  };

  const handleResetFilters = () => {
    const reset = { search: "", adviserId: "", schoolId: "", gradeId: "" };
    setFilters(reset);
    setSearchParams(serializeSuperAdviserSupportFormsQuery({ ...reset, page: 1 }));
  };

  const handlePageChange = (page) => {
    setSearchParams(serializeSuperAdviserSupportFormsQuery({ ...query, page }));
  };

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
        id: "gradeId",
        header: "پایه",
        accessorKey: "gradeId",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => gradeNameById.get(Number(info.getValue())) ?? "—",
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
    [gradeNameById] // eslint-disable-line react-hooks/exhaustive-deps
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
                      <Label className="form-label">پایه</Label>
                      <Input
                        type="select"
                        name="gradeId"
                        value={filters.gradeId}
                        disabled={gradesLoading || Boolean(gradesError) || grades.length === 0}
                        onChange={(event) => {
                          handleFilterChange(event);
                          setSearchParams(serializeSuperAdviserSupportFormsQuery({
                            ...filters,
                            gradeId: event.target.value,
                            page: 1,
                          }));
                        }}
                      >
                        <option value="">
                          {gradesLoading
                            ? "در حال دریافت پایه‌ها..."
                            : grades.length === 0
                              ? "پایه‌ای برای فرم‌های قابل نمایش وجود ندارد"
                              : "همه پایه‌ها"}
                        </option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>{grade.name}</option>
                        ))}
                      </Input>
                      {gradesError && <div className="text-danger small mt-1">
                        {gradesError}{" "}
                        <button type="button" className="btn btn-link btn-sm p-0"
                          onClick={() => setGradesRetry((value) => value + 1)}>تلاش مجدد</button>
                      </div>}
                    </Col>
                    <Col xl="2" lg="3" md="4">
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
