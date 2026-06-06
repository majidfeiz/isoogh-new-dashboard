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
  getSuperAdviserStudents,
  getSuperAdviserAdvisers,
} from "../../services/superAdviserPortalService.jsx";

const Students = () => {
  document.title = "دانش‌آموزان | سر مشاور | داشبورد آیسوق";

  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 });
  const [filters, setFilters] = useState({ search: "", adviserId: "" });
  const [advisers, setAdvisers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSuperAdviserAdvisers({ page: 1, limit: 100 })
      .then((res) => setAdvisers(res.items || []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(
    async (page = 1, currentFilters = filters) => {
      setLoading(true);
      try {
        const res = await getSuperAdviserStudents({
          page,
          limit: meta.limit,
          search: currentFilters.search,
          adviserId: currentFilters.adviserId,
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
    const reset = { search: "", adviserId: "" };
    setFilters(reset);
    fetchData(1, reset);
  };

  const handlePageChange = (page) => fetchData(page, filters);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "نام دانش‌آموز",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "code",
        header: "کد",
        accessorKey: "code",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "ssn",
        header: "کد ملی",
        accessorKey: "ssn",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "phone",
        header: "تلفن",
        accessorKey: "phone",
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
    ],
    []
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="سر مشاور" breadcrumbItem="دانش‌آموزان" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">دانش‌آموزان</h4>
                  <p className="text-muted mb-0">لیست دانش‌آموزان مشاوران تحت نظارت</p>
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
                          placeholder="نام، تلفن یا کد ملی"
                        />
                      </InputGroup>
                    </Col>
                    <Col xl="3" lg="4" md="5">
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

export default Students;
