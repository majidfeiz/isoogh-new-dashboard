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
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Paginations from "../../components/Common/Paginations.jsx";
import { getAdviserSchools, exportAdviserSchools } from "../../services/adviserPortalService.jsx";

const SchoolList = () => {
  document.title = "تماس مشاوران | داشبورد آیسوق";
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async (page = 1, q = "") => {
    setLoading(true);
    try {
      const res = await getAdviserSchools({ page, limit: 15, search: q });
      setData(res.items || []);
      setMeta(res.pagination || { page, limit: 15, total: 0, lastPage: 1 });
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, "");
  }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(1, search);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportAdviserSchools();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schools-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // toast already shown by httpClient
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="پورتال مشاور" breadcrumbItem="تماس مشاوران" />

        <Row className="mb-3 align-items-center">
          <Col>
            <h4 className="mb-0">تماس مشاوران</h4>
            <p className="text-muted mb-0 mt-1">مجموعه‌های متصل به حساب شما</p>
          </Col>
          <Col xs="auto">
            <Button color="success" outline size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? <Spinner size="sm" /> : <i className="bx bx-export me-1" />}
              خروجی CSV
            </Button>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={5} lg={4}>
            <form onSubmit={handleSearch}>
              <InputGroup>
                <InputGroupText>
                  <i className="bx bx-search" />
                </InputGroupText>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو بر اساس نام یا کد مدرسه..."
                />
                <Button color="primary" type="submit" disabled={loading}>
                  جستجو
                </Button>
              </InputGroup>
            </form>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-5">
            <i className="bx bx-buildings display-4 text-muted" />
            <h5 className="mt-3 text-muted">مجموعه‌ای یافت نشد</h5>
          </div>
        ) : (
          <Row>
            {data.map((school) => (
              <Col key={school.id} xl={3} lg={4} md={6} className="mb-4">
                <Card
                  className="h-100 shadow-sm border-0 cursor-pointer"
                  style={{ cursor: "pointer", transition: "transform 0.15s" }}
                  onClick={() => navigate(`/adviser-calls/schools/${school.id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <CardBody className="d-flex flex-column">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      {school.logo ? (
                        <img
                          src={school.logo}
                          alt={school.name}
                          style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="bg-primary bg-opacity-10 rounded d-flex align-items-center justify-content-center"
                          style={{ width: 52, height: 52 }}
                        >
                          <i className="bx bxs-school font-size-22 text-primary" />
                        </div>
                      )}
                      <div className="flex-grow-1 overflow-hidden">
                        <h6 className="mb-1 text-truncate fw-semibold">{school.name || "—"}</h6>
                        {school.code && (
                          <small className="text-muted">کد: {school.code}</small>
                        )}
                      </div>
                    </div>

                    {school.type && (
                      <div className="mb-2">
                        <Badge color="info" pill>
                          {school.type}
                        </Badge>
                      </div>
                    )}

                    {school.address && (
                      <p className="text-muted small mb-2">
                        <i className="bx bx-map-pin me-1" />
                        {school.address}
                      </p>
                    )}

                    {school.phone && (
                      <p className="text-muted small mb-3">
                        <i className="bx bx-phone me-1" />
                        {school.phone}
                      </p>
                    )}

                    <div className="mt-auto d-flex align-items-center justify-content-between">
                      <Badge
                        color={school.status === 1 || school.status === "active" ? "success" : "secondary"}
                        pill
                      >
                        {school.status === 1 || school.status === "active" ? "فعال" : "غیرفعال"}
                      </Badge>
                      <Button color="primary" size="sm" outline>
                        مشاهده فرم‌ها
                        <i className="bx bx-chevron-left ms-1" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {!loading && meta.total > 0 && (
          <Paginations
            perPageData={meta.limit}
            data={data}
            totalRecords={meta.total}
            currentPage={meta.page}
            setCurrentPage={(page) => fetchData(page, search)}
            isShowingPageLength={true}
            paginationDiv="col-sm-auto"
            paginationClass="pagination pagination-sm mb-0"
          />
        )}
      </div>
    </div>
  );
};

export default SchoolList;
