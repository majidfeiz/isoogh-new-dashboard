import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Input,
  Button,
  Spinner,
  Badge,
  Progress,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment-jalaali";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getAdviserSupportForms,
  getAdviserSchoolDetail,
} from "../../services/adviserPortalService.jsx";

const formatJalali = (value) => {
  if (!value) return "—";
  const numeric = Number(value);
  const date = !Number.isNaN(numeric) && numeric
    ? new Date(numeric < 1_000_000_000_000 ? numeric * 1000 : numeric)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return moment(date).format("jYYYY/jMM/jDD");
};

const formatDuration = (seconds) => {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} دقیقه${s ? ` و ${s} ثانیه` : ""}` : `${s} ثانیه`;
};

const SupportFormList = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();

  const [school, setSchool] = useState(null);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 });
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [loading, setLoading] = useState(false);

  document.title = `فرم‌های تماس | داشبورد آیسوق`;

  const fetchSchool = useCallback(async () => {
    try {
      const s = await getAdviserSchoolDetail(schoolId);
      setSchool(s);
    } catch {
      setSchool(null);
    }
  }, [schoolId]);

  const fetchData = useCallback(
    async (page = 1, q = "", order = sortOrder) => {
      setLoading(true);
      try {
        const res = await getAdviserSupportForms({
          schoolId,
          page,
          limit: 15,
          search: q,
          sortBy: "created_at",
          sortOrder: order,
        });
        setData(res.items || []);
        setMeta(res.pagination || { page, limit: 15, total: 0, lastPage: 1 });
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [schoolId, sortOrder]
  );

  useEffect(() => {
    fetchSchool();
    fetchData(1, "");
  }, [fetchSchool, fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(1, search, sortOrder);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    fetchData(1, search, order);
  };

  const schoolName = school?.name || `مجموعه ${schoolId}`;

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs
          title="تماس مشاوران"
          breadcrumbItem={schoolName}
          titleLink="/adviser-calls"
        />

        <Row className="mb-3 align-items-center">
          <Col>
            <h4 className="mb-0">{schoolName} — فرم‌های تماس</h4>
            <p className="text-muted mb-0 mt-1">لیست فرم‌های تماس این مجموعه</p>
          </Col>
        </Row>

        <Row className="mb-3 align-items-center g-2">
          <Col md={5} lg={4}>
            <form onSubmit={handleSearch}>
              <InputGroup>
                <InputGroupText>
                  <i className="bx bx-search" />
                </InputGroupText>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو بر اساس عنوان..."
                />
                <Button color="primary" type="submit" disabled={loading}>
                  جستجو
                </Button>
              </InputGroup>
            </form>
          </Col>
          <Col xs="auto" className="ms-auto d-flex gap-2">
            <Button
              size="sm"
              color={sortOrder === "DESC" ? "primary" : "light"}
              onClick={() => handleSortChange("DESC")}
            >
              <i className="bx bx-sort-down me-1" />
              جدیدترین
            </Button>
            <Button
              size="sm"
              color={sortOrder === "ASC" ? "primary" : "light"}
              onClick={() => handleSortChange("ASC")}
            >
              <i className="bx bx-sort-up me-1" />
              قدیمی‌ترین
            </Button>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-5">
            <i className="bx bx-file display-4 text-muted" />
            <h5 className="mt-3 text-muted">فرم تماسی یافت نشد</h5>
          </div>
        ) : (
          <Row>
            {data.map((form) => {
              const stats = form.stats || {};
              const total = stats.total || form.totalStudents || 0;
              const called = stats.called || 0;
              const pct = total > 0 ? Math.round((called / total) * 100) : 0;

              return (
                <Col key={form.id} xl={4} lg={6} md={6} className="mb-4">
                  <Card
                    className="h-100 shadow-sm border-0"
                    style={{ cursor: "pointer", transition: "transform 0.15s" }}
                    onClick={() => navigate(`/adviser-calls/forms/${form.id}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    <CardBody className="d-flex flex-column">
                      <div className="d-flex align-items-start gap-2 mb-2">
                        <div
                          className="bg-primary bg-opacity-10 rounded d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: 42, height: 42 }}
                        >
                          <i className="bx bx-support text-primary font-size-18" />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-semibold">{form.title || "—"}</h6>
                          {form.headings && (
                            <p
                              className="text-muted small mb-0"
                              style={{
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {form.headings}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {form.grade?.name && (
                          <Badge color="light" className="text-dark border">
                            <i className="bx bx-book me-1" />
                            {form.grade.name}
                          </Badge>
                        )}
                        {form.callDuration > 0 && (
                          <Badge color="light" className="text-dark border">
                            <i className="bx bx-time me-1" />
                            {formatDuration(form.callDuration)}
                          </Badge>
                        )}
                        {total > 0 && (
                          <Badge color="light" className="text-dark border">
                            <i className="bx bx-user me-1" />
                            {total} دانش‌آموز
                          </Badge>
                        )}
                      </div>

                      <div className="d-flex gap-3 text-muted small mb-3">
                        {form.startAt && (
                          <span>
                            <i className="bx bx-calendar me-1" />
                            شروع: {formatJalali(form.startAt)}
                          </span>
                        )}
                        {form.endAt && (
                          <span>
                            <i className="bx bx-calendar-x me-1" />
                            پایان: {formatJalali(form.endAt)}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="text-muted small">پیشرفت تماس</span>
                          <span className="text-muted small fw-semibold">{pct}%</span>
                        </div>
                        <Progress
                          value={pct}
                          color={pct >= 80 ? "success" : pct >= 40 ? "warning" : "primary"}
                          style={{ height: 6, borderRadius: 3 }}
                        />
                        <div className="d-flex justify-content-between mt-2">
                          <span className="text-success small">
                            <i className="bx bx-check-circle me-1" />
                            {called} تماس گرفته شده
                          </span>
                          <span className="text-danger small">
                            <i className="bx bx-x-circle me-1" />
                            {total - called} باقی‌مانده
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {!loading && meta.total > 0 && (
          <Paginations
            perPageData={meta.limit}
            data={data}
            totalRecords={meta.total}
            currentPage={meta.page}
            setCurrentPage={(page) => fetchData(page, search, sortOrder)}
            isShowingPageLength={true}
            paginationDiv="col-sm-auto"
            paginationClass="pagination pagination-sm mb-0"
          />
        )}
      </div>
    </div>
  );
};

export default SupportFormList;
