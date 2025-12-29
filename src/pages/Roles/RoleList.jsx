// src/pages/Roles/RoleList.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Input,
  Button,
} from "reactstrap";
import { useNavigate } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";

import {
  getRoles,
  deleteRole,
} from "../../services/roleService.jsx";

const RoleList = () => {
  const navigate = useNavigate();
  document.title = "نقش‌ها | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (page = 1, currentSearch = "") => {
      setLoading(true);
      try {
        const res = await getRoles({
          page,
          limit: meta.limit,
          search: currentSearch,
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
        console.error("خطا در دریافت نقش‌ها", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit]
  );

  useEffect(() => {
    fetchData(1, "");
  }, [fetchData]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchData(1, value);
  };

  const handlePageChange = (page) => {
    fetchData(page, search);
  };

  const handleCreateClick = () => {
    navigate("/roles/create");
  };

  const handleEdit = useCallback(
    (id) => {
      navigate(`/roles/${id}/edit`);
    },
    [navigate]
  );

    const handleManagePermissions = useCallback(
    (id) => {
      navigate(`/roles/${id}/permissions`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = window.confirm("آیا از حذف این نقش مطمئن هستید؟");
      if (!confirmed) return;

      try {
        setLoading(true);
        await deleteRole(id);
        await fetchData(meta.page, search);
      } catch (e) {
        console.error("خطا در حذف نقش", e);
      } finally {
        setLoading(false);
      }
    },
    [meta.page, search, fetchData]
  );

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "نام نقش",
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
        id: "actions",
        header: "عملیات",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const id = row.original.id;

          return (
            <div className="d-flex gap-2">
            <Button
                color="info"
                size="sm"
                onClick={() => handleManagePermissions(id)}
              >
                دسترسی‌ها
              </Button>
              <Button
                color="warning"
                size="sm"
                onClick={() => handleEdit(id)}
              >
                ویرایش
              </Button>

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
    ],
    [handleEdit, handleDelete, handleManagePermissions]
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="مدیریت دسترسی" breadcrumbItem="نقش‌ها" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                <Row className="align-items-center g-2">
                  <Col md="4" className="mb-2 mb-md-0">
                    <h4 className="card-title mb-0">لیست نقش‌ها</h4>
                  </Col>

                  <Col md="8">
                    <div className="d-flex gap-2 justify-content-start">
                      <Button
                        color="primary"
                        onClick={handleCreateClick}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        + نقش جدید
                      </Button>

                      <Input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="جستجو بر اساس نام یا برچسب..."
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

export default RoleList;
