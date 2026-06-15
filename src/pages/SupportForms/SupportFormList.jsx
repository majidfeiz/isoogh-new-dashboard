// src/pages/SupportForms/SupportFormList.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Input,
  Button,
  Form,
  Label,
  InputGroup,
  InputGroupText,
  Spinner,
} from "reactstrap";
import { useNavigate } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getSupportForms,
  deleteSupportForm,
  copySupportForm,
} from "../../services/supportFormService.jsx";
import { getSchools } from "../../services/schoolService.jsx";
import { getGrades } from "../../services/gradeService.jsx";
import moment from "moment-jalaali";

const formatDateTime = (value) => {
  if (!value && value !== 0) return "-";
  const numeric = Number(value);
  const date =
    !Number.isNaN(numeric) && numeric
      ? new Date(numeric < 1000000000000 ? numeric * 1000 : numeric)
      : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return moment(date).format("jYYYY/jMM/jDD HH:mm");
};

const SupportFormList = () => {
  const navigate = useNavigate();
  document.title = "فرم‌های تماس | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    schoolId: "",
    gradeId: "",
  });
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [sort, setSort] = useState({ by: "id", order: "DESC" });
  const [schools, setSchools] = useState([]);
  const [grades, setGrades] = useState([]);

  const schoolMap = useMemo(() => {
    const map = new Map();
    (schools || []).forEach((s) => {
      map.set(String(s.id), s);
    });
    return map;
  }, [schools]);

  const gradeMap = useMemo(() => {
    const map = new Map();
    (grades || []).forEach((g) => {
      map.set(String(g.id), g);
    });
    return map;
  }, [grades]);

  const fetchOptions = useCallback(async () => {
    try {
      const [schoolsRes, gradesRes] = await Promise.all([
        getSchools({ page: 1, limit: 200 }),
        getGrades({ page: 1, limit: 200 }),
      ]);
      setSchools(schoolsRes.items || []);
      setGrades(gradesRes.items || []);
    } catch (e) {
      console.error("خطا در دریافت مدارس/پایه‌ها", e);
    }
  }, []);

  const fetchData = useCallback(
    async (page = 1, currentFilters = {}, currentSort = sort) => {
      setLoading(true);
      try {
        const res = await getSupportForms({
          page,
          limit: meta.limit,
          search: currentFilters.search,
          schoolId: currentFilters.schoolId,
          gradeId: currentFilters.gradeId,
          sortBy: currentSort?.by,
          sortOrder: currentSort?.order,
        });

        setData(res.items || []);
        setMeta(
          res.pagination || {
            page,
            limit: meta.limit,
            total: 0,
            lastPage: 1,
          }
        );
      } catch (e) {
        console.error("خطا در دریافت فرم‌های تماس", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit, sort]
  );

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    fetchData(1, filters, sort);
  }, [fetchData, sort]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, filters, sort);
  };

  const handleResetFilters = () => {
    const reset = { search: "", schoolId: "", gradeId: "" };
    setFilters(reset);
    fetchData(1, reset, sort);
  };

  const handlePageChange = (page) => {
    fetchData(page, filters, sort);
  };

  const handleCreate = () => {
    navigate("/support-forms/create");
  };

  const handleEdit = useCallback(
    (id) => {
      navigate(`/support-forms/${id}/edit`);
    },
    [navigate]
  );

  const handleManage = useCallback(
    (id) => {
      navigate(`/support-forms/${id}`);
    },
    [navigate]
  );

  const handleCopy = useCallback(
    async (id) => {
      const confirmed = window.confirm("آیا از کپی این فرم تماس مطمئن هستید؟");
      if (!confirmed) return;
      try {
        setLoading(true);
        const res = await copySupportForm(id);
        const newId = res?.data?.id || res?.id;
        if (newId) {
          navigate(`/support-forms/${newId}/edit`);
        } else {
          await fetchData(meta.page, filters, sort);
        }
      } catch (e) {
        console.error("خطا در کپی فرم تماس", e);
      } finally {
        setLoading(false);
      }
    },
    [fetchData, filters, meta.page, navigate, sort]
  );

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = window.confirm("آیا از حذف این فرم تماس مطمئن هستید؟");
      if (!confirmed) return;

      try {
        setLoading(true);
        await deleteSupportForm(id);
        await fetchData(meta.page, filters, sort);
      } catch (e) {
        console.error("خطا در حذف فرم تماس", e);
      } finally {
        setLoading(false);
      }
    },
    [fetchData, filters, meta.page, sort]
  );

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        id: "title",
        header: "عنوان",
        accessorKey: "title",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "phone_number",
        header: "شماره تماس",
        accessorKey: "phone_number",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "start_at",
        header: "شروع",
        accessorKey: "start_at",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => formatDateTime(info.getValue()),
      },
      {
        id: "end_at",
        header: "پایان",
        accessorKey: "end_at",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => formatDateTime(info.getValue()),
      },
      {
        id: "grade_id",
        header: "پایه",
        accessorKey: "grade_id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const value = row.original?.grade?.name || row.original?.grade?.title;
          const mapped = gradeMap.get(String(row.original?.grade_id || ""));
          return value || mapped?.name || mapped?.title || row.original?.grade_id || "-";
        },
      },
      {
        id: "advisers_count",
        header: "تعداد مشاوران",
        accessorKey: "advisers_count",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const original = row.original || {};
          const count =
            original.advisers_count ??
            original.advisersCount ??
            (Array.isArray(original.advisers) ? original.advisers.length : undefined) ??
            (Array.isArray(original.advisers?.items)
              ? original.advisers.items.length
              : undefined);
          return typeof count === "number" ? count : "-";
        },
      },
      {
        id: "school_id",
        header: "مدرسه",
        accessorKey: "school_id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const value = row.original?.school?.name || row.original?.school?.title;
          const mapped = schoolMap.get(String(row.original?.school_id || ""));
          return value || mapped?.name || mapped?.title || row.original?.school_id || "-";
        },
      },
      {
        id: "actions",
        header: "عملیات",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const id = row.original.id;

          return (
            <div className="d-flex gap-2 flex-wrap">
              <Button color="primary" size="sm" onClick={() => handleManage(id)}>
                مدیریت
              </Button>
              <Button color="warning" size="sm" onClick={() => handleEdit(id)}>
                ویرایش
              </Button>
              <Button color="info" size="sm" onClick={() => handleCopy(id)} disabled={loading}>
                کپی
              </Button>
              <Button
                color="danger"
                size="sm"
                onClick={() => handleDelete(id)}
                disabled={loading}
              >
                حذف
              </Button>
            </div>
          );
        },
      },
    ],
    [gradeMap, handleCopy, handleDelete, handleEdit, handleManage, loading, schoolMap]
  );

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const allowed = [
        "id",
        "title",
        "start_at",
        "end_at",
        "created_at",
        "updated_at",
      ];
      const first = nextSorting?.[0];

      if (first && !allowed.includes(first.id)) {
        return;
      }

      setSorting(nextSorting);

      if (!first) {
        const resetSort = { by: undefined, order: undefined };
        setSort(resetSort);
        fetchData(1, filters, resetSort);
        return;
      }

      const nextSort = {
        by: first.id,
        order: first.desc ? "DESC" : "ASC",
      };
      setSort(nextSort);
      fetchData(1, filters, nextSort);
    },
    [fetchData, filters]
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="فرم تماس" breadcrumbItem="فرم‌های تماس" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">فرم‌های تماس</h4>
                  <p className="text-muted mb-0">
                    جستجو، فیلتر و مدیریت فرم‌های تماس
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                  <Button color="primary" onClick={handleCreate}>
                    <i className="mdi mdi-plus me-1" />
                    ایجاد فرم تماس
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="4" lg="5" md="6">
                      <Label className="form-label" htmlFor="search">
                        جستجو
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-search" />
                        </InputGroupText>
                        <Input
                          id="search"
                          name="search"
                          value={filters.search}
                          onChange={handleFilterChange}
                          placeholder="شناسه، عنوان یا شماره تماس"
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="schoolId">
                        مدرسه
                      </Label>
                      <Input
                        id="schoolId"
                        name="schoolId"
                        type="select"
                        value={filters.schoolId}
                        onChange={handleFilterChange}
                      >
                        <option value="">همه مدارس</option>
                        {schools.map((school) => (
                          <option key={school.id} value={school.id}>
                            {school.name || school.title || `مدرسه ${school.id}`}
                          </option>
                        ))}
                      </Input>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="gradeId">
                        پایه
                      </Label>
                      <Input
                        id="gradeId"
                        name="gradeId"
                        type="select"
                        value={filters.gradeId}
                        onChange={handleFilterChange}
                      >
                        <option value="">همه پایه‌ها</option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name || grade.title || `پایه ${grade.id}`}
                          </option>
                        ))}
                      </Input>
                    </Col>

                    <Col xl="2" lg="3" md="6" className="d-flex gap-2">
                      <Button
                        color="primary"
                        type="submit"
                        className="w-100"
                        disabled={loading}
                      >
                        جستجو
                      </Button>
                      <Button
                        color="light"
                        type="button"
                        className="w-100"
                        onClick={handleResetFilters}
                        disabled={loading}
                      >
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
                  manualSorting
                  sortingState={sorting}
                  onSortingChange={handleSortingChange}
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

export default SupportFormList;
