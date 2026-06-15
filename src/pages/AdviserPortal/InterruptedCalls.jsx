// src/pages/AdviserPortal/InterruptedCalls.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Input,
  InputGroup,
  InputGroupText,
  Row,
  Spinner,
} from "reactstrap";
import moment from "moment-jalaali";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getAdviserInterruptedCallsList,
  changeStudentSupportFormStatus,
} from "../../services/supportFormService.jsx";

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return moment(value).format("jYYYY/jMM/jDD HH:mm");
  } catch {
    return String(value);
  }
};

const InterruptedCalls = () => {
  document.title = "پاسخنامه — تماس‌های قطع‌شده | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, lastPage: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(
    async (page = 1, q = search) => {
      setLoading(true);
      setAlert(null);
      try {
        const res = await getAdviserInterruptedCallsList({
          page,
          limit: 10,
          search: q || undefined,
        });
        setData(res.items || []);
        setMeta(res.pagination || { page, limit: 10, total: 0, lastPage: 1 });
      } catch {
        setAlert({ type: "danger", message: "خطا در دریافت تماس‌های قطع‌شده." });
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleRestore = async (row) => {
    const rowId = row?.id || row?.row_id;
    if (!rowId) return;
    setActionLoading(rowId);
    try {
      await changeStudentSupportFormStatus({ row_id: rowId, status: 0 });
      await fetchData(meta.page);
      setAlert({ type: "success", message: "وضعیت به نرمال تغییر یافت." });
    } catch {
      setAlert({ type: "danger", message: "خطا در تغییر وضعیت." });
    } finally {
      setActionLoading(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "form_title",
        header: "فرم تماس",
        enableSorting: false,
        cell: ({ row }) =>
          row.original?.support_form?.title ||
          row.original?.supportForm?.title ||
          (row.original?.support_form_id ? `فرم ${row.original.support_form_id}` : "-"),
      },
      {
        id: "student_name",
        header: "نام دانش‌آموز",
        enableSorting: false,
        cell: ({ row }) =>
          row.original?.student?.user?.name ||
          row.original?.studentName ||
          "-",
      },
      {
        id: "student_code",
        header: "کد دانش‌آموز",
        enableSorting: false,
        cell: ({ row }) => row.original?.student?.code || "-",
      },
      {
        id: "student_phone",
        header: "تلفن",
        enableSorting: false,
        cell: ({ row }) => row.original?.student?.user?.phone || "-",
      },
      {
        id: "status",
        header: "وضعیت",
        enableSorting: false,
        cell: () => <Badge color="warning">قطع‌شده</Badge>,
      },
      {
        id: "created_at",
        header: "تاریخ ثبت",
        enableSorting: false,
        cell: ({ row }) => formatDate(row.original?.created_at),
      },
      {
        id: "updated_at",
        header: "آخرین به‌روزرسانی",
        enableSorting: false,
        cell: ({ row }) => formatDate(row.original?.updated_at),
      },
      {
        id: "actions",
        header: "عملیات",
        enableSorting: false,
        cell: ({ row }) => {
          const rowId = row.original?.id;
          return (
            <Button
              size="sm"
              color="success"
              disabled={actionLoading === rowId}
              onClick={() => handleRestore(row.original)}
            >
              {actionLoading === rowId ? "در حال تغییر..." : "بازگشت به نرمال"}
            </Button>
          );
        },
      },
    ],
    [actionLoading]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, search);
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs
          title="تماس مشاوران"
          breadcrumbItem="پاسخنامه — تماس‌های قطع‌شده"
          titleLink="/adviser-calls"
        />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
                  <div>
                    <h4 className="card-title mb-1">پاسخنامه تماس‌های قطع‌شده</h4>
                    <p className="text-muted mb-0">
                      لیست دانش‌آموزانی که تماس با آن‌ها قطع شده است.
                    </p>
                  </div>
                  {loading && <Spinner size="sm" color="primary" />}
                </div>

                {alert && (
                  <Alert color={alert.type} className="mb-3" toggle={() => setAlert(null)}>
                    {alert.message}
                  </Alert>
                )}

                <form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-2 align-items-end">
                    <Col md="6">
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-search" />
                        </InputGroupText>
                        <Input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="جستجو (نام دانش‌آموز، فرم تماس)"
                        />
                      </InputGroup>
                    </Col>
                    <Col md="3">
                      <Button color="primary" type="submit" className="w-100" disabled={loading}>
                        جستجو
                      </Button>
                    </Col>
                    <Col md="3">
                      <Button
                        color="light"
                        type="button"
                        className="w-100"
                        onClick={() => { setSearch(""); fetchData(1, ""); }}
                        disabled={loading}
                      >
                        ریست
                      </Button>
                    </Col>
                  </Row>
                </form>

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : data.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bx bx-phone-off display-4 text-muted" />
                    <h5 className="mt-3 text-muted">تماس قطع‌شده‌ای یافت نشد</h5>
                  </div>
                ) : (
                  <>
                    <TableContainer
                      columns={columns}
                      data={data}
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
                      setCurrentPage={(page) => fetchData(page, search)}
                      isShowingPageLength
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

export default InterruptedCalls;
