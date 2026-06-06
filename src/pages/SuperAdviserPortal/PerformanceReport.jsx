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
  InputGroup,
  InputGroupText,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import moment from "moment-jalaali";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getSuperAdviserPerformanceReport,
  getSuperAdviserSupportForms,
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

const getAnswerByTitle = (answers = [], keyword) => {
  const found = answers.find((a) =>
    a.questionTitle && a.questionTitle.includes(keyword)
  );
  if (!found || !found.isAnswered) return "-";
  return found.answer || "-";
};

const PerformanceReport = () => {
  document.title = "گزارش عملکرد | سر مشاور | داشبورد آیسوق";

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, lastPage: 1 });
  const [filters, setFilters] = useState({
    supportFormId: searchParams.get("supportFormId") || "",
    adviserId: "",
    search: "",
  });
  const [supportForms, setSupportForms] = useState([]);
  const [advisers, setAdvisers] = useState([]);
  const [selectedFormTitle, setSelectedFormTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSuperAdviserSupportForms({ page: 1, limit: 100 })
      .then((res) => {
        setSupportForms(res.items || []);
        if (filters.supportFormId) {
          const found = (res.items || []).find(
            (f) => String(f.id) === String(filters.supportFormId)
          );
          if (found) setSelectedFormTitle(found.title);
        }
      })
      .catch(() => {});
    getSuperAdviserAdvisers({ page: 1, limit: 100 })
      .then((res) => setAdvisers(res.items || []))
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = useCallback(
    async (page = 1, currentFilters = filters) => {
      if (!currentFilters.supportFormId) return;
      setLoading(true);
      try {
        const res = await getSuperAdviserPerformanceReport({
          supportFormId: currentFilters.supportFormId,
          page,
          limit: meta.limit,
          adviserId: currentFilters.adviserId,
          search: currentFilters.search,
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
    if (filters.supportFormId) {
      fetchData(1, filters);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (name === "supportFormId") {
      const found = supportForms.find((f) => String(f.id) === String(value));
      setSelectedFormTitle(found ? found.title : "");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, filters);
  };

  const handleShowAll = () => {
    const reset = { ...filters, search: "", adviserId: "" };
    setFilters(reset);
    fetchData(1, reset);
  };

  const handlePageChange = (page) => fetchData(page, filters);

  const columns = useMemo(
    () => [
      {
        id: "studentName",
        header: "نام دانش‌آموز",
        accessorKey: "studentName",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "studentSsn",
        header: "کد ملی",
        accessorKey: "studentSsn",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "studentUsername",
        header: "نام کاربری",
        accessorKey: "studentUsername",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "adviserName",
        header: "مشاور",
        accessorKey: "adviserName",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "registrationInfo",
        header: "اطلاع‌رسانی ثبت نام",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const val =
            row.original.registrationInfo ||
            getAnswerByTitle(row.original.answers, "ثبت");
          return <span className="text-wrap" style={{ maxWidth: 150 }}>{val}</span>;
        },
      },
      {
        id: "callProblems",
        header: "مشکلات تماس",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const val =
            row.original.callProblems ||
            getAnswerByTitle(row.original.answers, "مشکل");
          return <span className="text-wrap" style={{ maxWidth: 150 }}>{val}</span>;
        },
      },
      {
        id: "conversationSummary",
        header: "خلاصه گفتگو",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const val =
            row.original.conversationSummary ||
            getAnswerByTitle(row.original.answers, "خلاصه");
          return <span className="text-wrap" style={{ maxWidth: 180 }}>{val}</span>;
        },
      },
      {
        id: "lastSuccessfulCallAt",
        header: "تاریخ تماس موفق",
        accessorKey: "lastSuccessfulCallAt",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => toJalali(info.getValue()),
      },
      {
        id: "calls",
        header: "تعداد تماس",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <Badge color={row.original.successfulCalls > 0 ? "success" : "secondary"} pill>
            {row.original.successfulCalls}/{row.original.totalCalls}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="سر مشاور" breadcrumbItem="گزارش عملکرد مشاوران" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">گزارش عملکرد مشاوران</h4>
                  {selectedFormTitle && (
                    <p className="text-muted mb-0">
                      عنوان فرم انتخاب‌شده: <strong>{selectedFormTitle}</strong>
                    </p>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                  <Button color="light" size="sm" onClick={() => navigate(-1)}>
                    <i className="bx bx-arrow-back me-1" />
                    بازگشت
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label">
                        انتخاب فرم تماس <span className="text-danger">*</span>
                      </Label>
                      <Input
                        type="select"
                        name="supportFormId"
                        value={filters.supportFormId}
                        onChange={handleFilterChange}
                      >
                        <option value="">-- انتخاب فرم تماس --</option>
                        {supportForms.map((f) => (
                          <option key={f.id} value={f.id}>{f.title}</option>
                        ))}
                      </Input>
                    </Col>
                    <Col xl="2" lg="3" md="5">
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
                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label">جستجو براساس</Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-search" />
                        </InputGroupText>
                        <Input
                          name="search"
                          value={filters.search}
                          onChange={handleFilterChange}
                          placeholder="نام، کد ملی یا تلفن"
                        />
                      </InputGroup>
                    </Col>
                    <Col className="d-flex gap-2 flex-wrap" xl="3" lg="4" md="6">
                      <Button
                        color="primary"
                        type="submit"
                        disabled={loading || !filters.supportFormId}
                      >
                        جستجو
                      </Button>
                      <Button
                        color="secondary"
                        type="button"
                        onClick={handleShowAll}
                        disabled={loading || !filters.supportFormId}
                      >
                        نمایش همه
                      </Button>
                    </Col>
                  </Row>
                </Form>

                {!filters.supportFormId && (
                  <div className="text-center text-muted py-5">
                    <i className="bx bx-info-circle fs-1 d-block mb-2" />
                    لطفاً ابتدا یک فرم تماس انتخاب کنید.
                  </div>
                )}

                {filters.supportFormId && (
                  <>
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
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PerformanceReport;
