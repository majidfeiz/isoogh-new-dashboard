import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Table,
} from "reactstrap";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Paginations from "../../components/Common/Paginations.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  exportAdviserIncompleteCalls,
  getAdviserIncompleteCalls,
  getAdviserSchoolDetail,
} from "../../services/adviserPortalService.jsx";

const getDownloadFilename = (contentDisposition) => {
  if (!contentDisposition) return null;
  const encoded = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded.replace(/["']/g, ""));
    } catch {
      return encoded;
    }
  }
  return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1] || null;
};

const IncompleteCalls = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = useAuth();
  const validSchoolId = Number.isInteger(Number(schoolId)) && Number(schoolId) > 0;
  const canList = hasPermission("adviser-portal.students.index");
  const canExport = hasPermission("adviser-portal.students.export");

  const [school, setSchool] = useState(null);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState({
    by: searchParams.get("sortBy") || "id",
    order: searchParams.get("sortOrder") === "ASC" ? "ASC" : "DESC",
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const initialPage = useRef(Number(searchParams.get("page")) || 1);
  const initialSearch = useRef(search);

  document.title = "تماس‌های ناقص | داشبورد آیسوق";

  useEffect(() => {
    if (!validSchoolId) {
      navigate("/adviser-calls", { replace: true });
      return;
    }
    getAdviserSchoolDetail(schoolId).then(setSchool).catch(() => setSchool(null));
  }, [navigate, schoolId, validSchoolId]);

  const fetchData = useCallback(async (page, query, currentSort) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await getAdviserIncompleteCalls({
        schoolId,
        page,
        limit: 15,
        search: query,
        sortBy: currentSort.by,
        sortOrder: currentSort.order,
      });
      if (requestId.current !== currentRequest) return;
      setData(result.items || []);
      setMeta(result.pagination || { page, limit: 15, total: 0, lastPage: 1 });

      const next = {};
      if (query) next.search = query;
      if (page > 1) next.page = String(page);
      if (currentSort.by !== "id") next.sortBy = currentSort.by;
      if (currentSort.by !== "id" || currentSort.order !== "DESC") next.sortOrder = currentSort.order;
      setSearchParams(next, { replace: true });
    } catch (requestError) {
      if (requestId.current !== currentRequest) return;
      const status = requestError?.response?.status;
      setError(status === 403
        ? "شما به تماس‌های ناقص این مجموعه دسترسی ندارید."
        : "دریافت تماس‌های ناقص انجام نشد.");
    } finally {
      if (requestId.current === currentRequest) setLoading(false);
    }
  }, [schoolId, setSearchParams]);

  useEffect(() => {
    if (!canList || !validSchoolId) {
      setLoading(false);
      return undefined;
    }
    const isInitialSearch = search === initialSearch.current;
    const timer = setTimeout(() => {
      fetchData(isInitialSearch ? initialPage.current : 1, search, sort);
      initialPage.current = 1;
      initialSearch.current = null;
    }, 400);
    return () => clearTimeout(timer);
  }, [canList, fetchData, search, sort, validSchoolId]);

  const handleSort = (by) => {
    const next = {
      by,
      order: sort.by === by && sort.order === "ASC" ? "DESC" : "ASC",
    };
    setSort(next);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportAdviserIncompleteCalls({ schoolId, search });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = getDownloadFilename(response.headers?.["content-disposition"])
        || `incomplete-calls-school-${schoolId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // httpClient displays the download error.
    } finally {
      setExporting(false);
    }
  };

  const goToProfile = (row) => {
    const fallback = `/adviser-calls/forms/${row.supportFormId}/students/${row.studentId}`;
    navigate(row.profilePath || fallback);
  };

  if (!canList) {
    return (
      <div className="page-content"><div className="container-fluid">
        <Alert color="danger">شما دسترسی مشاهده دانش‌آموزان تماس‌های ناقص را ندارید.</Alert>
      </div></div>
    );
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs
          title={school?.name || "وظایف مشاور"}
          breadcrumbItem="تماس‌های ناقص"
          titleLink={`/adviser-calls/schools/${schoolId}`}
        />

        <Row className="mb-3 align-items-center g-2">
          <Col>
            <h4 className="mb-1">تماس‌های ناقص</h4>
            <p className="text-muted mb-0">دانش‌آموزانی که وضعیت تماس آن‌ها ناقص ثبت شده است.</p>
          </Col>
          {canExport && (
            <Col xs="auto">
              <Button color="success" outline onClick={handleExport} disabled={exporting}>
                {exporting ? <Spinner size="sm" className="me-1" /> : <i className="bx bx-export me-1" />}
                خروجی CSV
              </Button>
            </Col>
          )}
        </Row>

        <Card className="border-0 shadow-sm">
          <CardBody>
            <Row className="mb-3 g-2 align-items-center">
              <Col md={6} lg={5}>
                <InputGroup>
                  <InputGroupText><i className="bx bx-search" /></InputGroupText>
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="نام، تلفن، کد ملی، کد دانش‌آموز یا فرم تماس..."
                  />
                </InputGroup>
              </Col>
              <Col xs="auto" className="ms-auto d-flex gap-2">
                <Button size="sm" color={sort.by === "id" ? "primary" : "light"} onClick={() => handleSort("id")}>شناسه</Button>
                <Button size="sm" color={sort.by === "form_title" ? "primary" : "light"} onClick={() => handleSort("form_title")}>عنوان فرم</Button>
                {loading && data.length > 0 && <Spinner size="sm" color="primary" />}
              </Col>
            </Row>

            {error && (
              <Alert color="danger" className="d-flex align-items-center justify-content-between">
                <span>{error}</span>
                <Button color="danger" outline size="sm" onClick={() => fetchData(meta.page, search, sort)}>تلاش مجدد</Button>
              </Alert>
            )}

            {loading && data.length === 0 ? (
              <div className="text-center py-5"><Spinner color="primary" /></div>
            ) : !error && data.length === 0 ? (
              <div className="text-center py-5">
                <i className="bx bx-phone-off display-4 text-muted" />
                <h5 className="mt-3 text-muted">تماس ناقصی برای این مجموعه پیدا نشد.</h5>
              </div>
            ) : data.length > 0 ? (
              <div className="table-responsive">
                <Table className="table-hover align-middle mb-0">
                  <thead className="table-light"><tr>
                    <th>نام دانش‌آموز</th><th>کد ملی</th><th>تلفن</th><th>کد دانش‌آموز</th>
                    <th role="button" onClick={() => handleSort("form_title")}>نام فرم تماس</th>
                    <th>وضعیت</th><th>عملیات</th>
                  </tr></thead>
                  <tbody>{data.map((row) => (
                    <tr key={row.id}>
                      <td className="fw-semibold">{row.student.name || "نام ثبت نشده"}</td>
                      <td>{row.student.ssn || "—"}</td>
                      <td>{row.student.phone || "—"}</td>
                      <td>{row.student.code || "—"}</td>
                      <td>{row.supportForm.title || "—"}</td>
                      <td><Badge color="warning">ناقص</Badge></td>
                      <td>
                        <Button color="primary" outline size="sm" onClick={() => goToProfile(row)}>
                          <i className="bx bx-show me-1" />مشاهده
                        </Button>
                      </td>
                    </tr>
                  ))}</tbody>
                </Table>
              </div>
            ) : null}

            {!loading && data.length > 0 && (
              <div className="mt-3">
                <Paginations
                  perPageData={meta.limit}
                  data={data}
                  totalRecords={meta.total}
                  currentPage={meta.page}
                  setCurrentPage={(page) => fetchData(page, search, sort)}
                  isShowingPageLength
                  paginationDiv="col-sm-auto"
                  paginationClass="pagination pagination-sm mb-0"
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default IncompleteCalls;
