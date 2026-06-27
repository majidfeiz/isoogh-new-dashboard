import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Card, CardBody, CardHeader, Col, Row, Input, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useListState } from "../../hooks/useListState";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";

import { getPermissions, deletePermission } from "../../services/permissionService.jsx";

const PermissionList = () => {
  const navigate = useNavigate();
  document.title = "سطوح دسترسی | داشبورد آیسوق";

  const { saved, saveState } = useListState("permissions");

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [search, setSearch] = useState(saved?.search ?? "");
  const [loading, setLoading] = useState(false);
  const initialPageRef = useRef(saved?.page ?? 1);

  const fetchData = useCallback(
    async (page = 1, currentSearch = "") => {
      setLoading(true);
      try {
        const res = await getPermissions({
          page,
          limit: meta.limit,
          search: currentSearch,
        });

        setData(res.items || []);
        setMeta(
          res.pagination || { page, limit: meta.limit, total: 0, lastPage: 1 }
        );
      } catch (e) {
        console.error("خطا در دریافت سطوح دسترسی", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit]
  );

  useEffect(() => {
    const page = initialPageRef.current;
    initialPageRef.current = 1;
    fetchData(page, search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    saveState({ page: 1, search: value });
    fetchData(1, value);
  };

  const handlePageChange = (page) => {
    saveState({ page, search });
    fetchData(page, search);
  };

  const handleCreateClick = () => {
    navigate("/permissions/create");
  };

  const handleEdit = useCallback((id) => {
    navigate(`/permissions/${id}/edit`);
  }, [navigate]);

  // 🔹 حذف
  const handleDelete = useCallback(
    async (id) => {
      console.log("handleDelete called with id:", id);
      const confirmed = window.confirm("آیا از حذف این سطح دسترسی مطمئن هستید؟");
      if (!confirmed) return;

      try {
        setLoading(true);
        await deletePermission(id);
        await fetchData(meta.page, search);
      } catch (e) {
        console.error("خطا در حذف سطح دسترسی", e);
      } finally {
        setLoading(false);
      }
    },
    [meta.page, search, fetchData]
  );

  const columns = useMemo(() => [
  {
    id: "name",
    header: "نام سطح دسترسی",
    accessorKey: "name",
    enableColumnFilter: false,
    enableSorting: true,
    cell: (info) => info.getValue(),
  },
  {
    id: "label",
    header: "برچسب",
    accessorKey: "label",
    enableColumnFilter: false,
    enableSorting: true,
    cell: (info) => info.getValue(),
  },
  {
    id: "module",
    header: "ماژول",
    accessorKey: "module",
    enableColumnFilter: false,
    enableSorting: false,
    cell: (info) => info.getValue(),
  },
  {
    id: "description",
    header: "توضیحات",
    accessorKey: "description",
    enableColumnFilter: false,
    enableSorting: false,
    cell: (info) => info.getValue(),
  },
  {
    id: "actions",
    header: "عملیات",
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <div className="d-flex gap-2">
          <Link
            to={`/permissions/${id}/edit`}
            className="btn btn-warning btn-sm"
          >
            ویرایش
          </Link>

            <Button
            color="danger"
            size="sm"
            onClick={() => handleDelete(id)}    
            >
            حذف
            </Button>
        </div>
      );
    },
  },
], [handleDelete]);



  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="مدیریت دسترسی" breadcrumbItem="سطوح دسترسی" />

        <Row>
          <Col lg={12}>
            <Card>
            <CardHeader>
            <Row className="align-items-center g-2">
                <Col md="4" className="mb-2 mb-md-0">
                <h4 className="card-title mb-0">لیست سطوح دسترسی</h4>
                </Col>

                <Col md="8">
                <div className="d-flex gap-2 justify-content-start">
                    {/* دکمه سطح دسترسی جدید */}
                    <Button
                    color="primary"
                    onClick={handleCreateClick}
                    style={{ whiteSpace: "nowrap" }}
                    >
                    + سطح دسترسی جدید
                    </Button>

                    {/* فیلد جستجو، تمام فضای باقی‌مانده را پر کند */}
                    <Input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="جستجو بر اساس نام، برچسب یا ماژول..."
                    className="flex-grow-1"
                    />
                </div>
                </Col>
            </Row>
            </CardHeader>

              <CardBody>
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

export default PermissionList;
