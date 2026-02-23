// src/pages/SupportForms/SupportFormAdviserStudents.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  Form,
  Input,
  Label,
  InputGroup,
  InputGroupText,
  Spinner,
  Alert,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getSupportForm,
  getSupportFormAdviserStudents,
  getSupportFormAdviserStudentCandidates,
  attachSupportFormAdviserStudents,
  attachSupportFormAdviserStudentsByTag,
  detachSupportFormAdviserStudent,
  detachSupportFormAdviserStudents,
} from "../../services/supportFormService.jsx";
import { getParentTags, getParentTagValues } from "../../services/parentTagService.jsx";
import DeleteModal from "../../components/Common/DeleteModal.jsx";

const SupportFormAdviserStudents = () => {
  const { id, adviserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const adviserInfo = location.state?.adviser;

  document.title = "دانش‌آموزان مشاور | داشبورد آیسوق";

  const [formTitle, setFormTitle] = useState("");
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
  });
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [sort, setSort] = useState({ by: "id", order: "DESC" });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [tagAutoCloseTimer, setTagAutoCloseTimer] = useState(null);

  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateResults, setCandidateResults] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [attachLoading, setAttachLoading] = useState(false);

  const [tagModal, setTagModal] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [parentTags, setParentTags] = useState([]);
  const [selectedParentTag, setSelectedParentTag] = useState("");
  const [tagValues, setTagValues] = useState([]);
  const [selectedTagValue, setSelectedTagValue] = useState("");
  const [tagText, setTagText] = useState("");
  const [subTagText, setSubTagText] = useState("");
  const [tagLoading, setTagLoading] = useState(false);
  const [tagAlert, setTagAlert] = useState(null);

  const fetchTitle = useCallback(async () => {
    try {
      const res = await getSupportForm(id);
      setFormTitle(res?.title || "");
    } catch (e) {
      console.error("خطا در دریافت عنوان فرم تماس", e);
    }
  }, [id]);

  const fetchData = useCallback(
    async (page = 1, currentFilters = {}, currentSort = sort, options = {}) => {
      setLoading(true);
      if (!options.preserveAlert) {
        setAlert(null);
      }
      try {
        const res = await getSupportFormAdviserStudents(id, adviserId, {
          page,
          limit: meta.limit,
          search: currentFilters.search || undefined,
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
        console.error("خطا در دریافت دانش‌آموزان", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
        setAlert({ type: "danger", message: "خطا در دریافت اطلاعات." });
      } finally {
        setLoading(false);
      }
    },
    [adviserId, id, meta.limit, sort]
  );

  useEffect(() => {
    fetchTitle();
  }, [fetchTitle]);

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
    const reset = { search: "" };
    setFilters(reset);
    fetchData(1, reset, sort);
  };

  const handlePageChange = (page) => {
    fetchData(page, filters, sort);
  };

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const allowed = ["id", "created_at", "updated_at", "student_id", "status"];
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

  const handleCandidateSearch = async (e) => {
    e.preventDefault();
    const query = candidateSearch.trim();
    if (!query) return;
    setCandidateLoading(true);
    setAlert(null);
    try {
      const res = await getSupportFormAdviserStudentCandidates(id, adviserId, {
        page: 1,
        limit: 20,
        search: query,
      });
      setCandidateResults(res.items || []);
      if (!res.items?.length) {
        setAlert({ type: "warning", message: "نتیجه‌ای برای جستجو یافت نشد." });
      }
    } catch (e2) {
      console.error("خطا در جستجوی دانش‌آموز", e2);
      setAlert({ type: "danger", message: "خطا در جستجوی دانش‌آموز." });
    } finally {
      setCandidateLoading(false);
    }
  };

  const toggleCandidate = (studentId) => {
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      const idStr = String(studentId);
      if (next.has(idStr)) next.delete(idStr);
      else next.add(idStr);
      return next;
    });
  };

  const handleAttachSelected = async () => {
    if (selectedCandidates.size === 0) return;
    setAttachLoading(true);
    try {
      await attachSupportFormAdviserStudents(id, adviserId, {
        studentIds: Array.from(selectedCandidates).map((val) => Number(val)),
      });
      setSelectedCandidates(new Set());
      await fetchData(meta.page, filters, sort, { preserveAlert: true });
      setAlert({ type: "success", message: "دانش‌آموزان اضافه شدند." });
    } catch (e) {
      console.error("خطا در افزودن دانش‌آموز", e);
      setAlert({ type: "danger", message: "خطا در افزودن دانش‌آموز." });
    } finally {
      setAttachLoading(false);
    }
  };

  const handleDetachStudent = async () => {
    const studentId =
      pendingDelete?.student_id || pendingDelete?.student?.id || pendingDelete?.id;
    if (!studentId) return;
    setAttachLoading(true);
    try {
      await detachSupportFormAdviserStudent(id, adviserId, studentId);
      await fetchData(meta.page, filters, sort);
      setAlert({ type: "success", message: "دانش‌آموز حذف شد." });
    } catch (e) {
      console.error("خطا در حذف دانش‌آموز", e);
      setAlert({ type: "danger", message: "خطا در حذف دانش‌آموز." });
    } finally {
      setAttachLoading(false);
      setDeleteModal(false);
      setPendingDelete(null);
    }
  };

  const handleDetachAllStudents = async () => {
    setAttachLoading(true);
    try {
      const res = await detachSupportFormAdviserStudents(id, adviserId);
      await fetchData(1, filters, sort);
      const removed = res?.data?.removed ?? res?.removed;
      setAlert({
        type: "success",
        message:
          typeof removed === "number"
            ? `تعداد ${removed} دانش‌آموز حذف شد.`
            : "تمام دانش‌آموزان حذف شدند.",
      });
    } catch (e) {
      console.error("خطا در حذف همه دانش‌آموزان", e);
      setAlert({ type: "danger", message: "خطا در حذف همه دانش‌آموزان." });
    } finally {
      setAttachLoading(false);
      setBulkDeleteModal(false);
    }
  };

  const openDeleteModal = (row) => {
    setPendingDelete(row);
    setDeleteModal(true);
  };

  const fetchParentTags = useCallback(
    async (search = "") => {
      setTagLoading(true);
      try {
        const res = await getParentTags({ page: 1, limit: 50, search });
        setParentTags(res.items || []);
      } catch (e) {
        console.error("خطا در دریافت تگ‌ها", e);
      } finally {
        setTagLoading(false);
      }
    },
    []
  );

  const fetchTagValues = useCallback(
    async (parentTagId, search = "") => {
      if (!parentTagId) {
        setTagValues([]);
        return;
      }
      setTagLoading(true);
      try {
        const res = await getParentTagValues(parentTagId, { page: 1, limit: 50, search });
        setTagValues(res.items || []);
      } catch (e) {
        console.error("خطا در دریافت مقادیر تگ", e);
      } finally {
        setTagLoading(false);
      }
    },
    []
  );

  const handleOpenTagModal = () => {
    setTagModal(true);
    setTagSearch("");
    setSelectedParentTag("");
    setSelectedTagValue("");
    setTagText("");
    setSubTagText("");
    setTagAlert(null);
    if (tagAutoCloseTimer) {
      clearTimeout(tagAutoCloseTimer);
      setTagAutoCloseTimer(null);
    }
    fetchParentTags("");
  };

  const handleAttachByTag = async () => {
    if (!selectedTagValue && !subTagText.trim() && !tagText.trim() && !selectedParentTag) {
      const warn = { type: "warning", message: "حداقل یک تگ انتخاب کنید." };
      setAlert(warn);
      setTagAlert(warn);
      return;
    }
    setAttachLoading(true);
    try {
      const payload = {};
      if (selectedParentTag) payload.tagId = Number(selectedParentTag);
      if (tagText.trim()) payload.tag = tagText.trim();
      if (selectedTagValue) payload.subTagId = Number(selectedTagValue);
      if (subTagText.trim()) payload.subTag = subTagText.trim();

      const res = await attachSupportFormAdviserStudentsByTag(id, adviserId, payload);
      const result = res?.data || res || {};
      const added = result.added ?? "-";
      const skipped = result.skipped ?? "-";
      const matched = result.matched ?? "-";
      const success = {
        type: "success",
        message: `نتیجه افزودن بر اساس تگ: اضافه شد ${added}، رد شد ${skipped}، تطبیق ${matched}`,
      };
      setAlert(success);
      setTagAlert(success);
      const timer = setTimeout(() => {
        setTagModal(false);
        setTagAlert(null);
        setTagAutoCloseTimer(null);
      }, 2500);
      setTagAutoCloseTimer(timer);
      await fetchData(meta.page, filters, sort);
    } catch (e) {
      console.error("خطا در افزودن بر اساس تگ", e);
      const err = { type: "danger", message: "خطا در افزودن بر اساس تگ." };
      setAlert(err);
      setTagAlert(err);
    } finally {
      setAttachLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        id: "student_id",
        header: "شناسه دانش‌آموز",
        accessorKey: "student_id",
        enableSorting: true,
        cell: ({ row }) => row.original?.student_id || "-",
      },
      {
        id: "code",
        header: "کد",
        accessorKey: "student.code",
        enableSorting: false,
        cell: ({ row }) => row.original?.student?.code || "-",
      },
      {
        id: "name",
        header: "نام",
        accessorKey: "student.user.name",
        enableSorting: false,
        cell: ({ row }) => row.original?.student?.user?.name || "-",
      },
      {
        id: "username",
        header: "نام کاربری",
        accessorKey: "student.user.username",
        enableSorting: false,
        cell: ({ row }) => row.original?.student?.user?.username || "-",
      },
      {
        id: "ssn",
        header: "کد ملی",
        accessorKey: "student.user.ssn",
        enableSorting: false,
        cell: ({ row }) => row.original?.student?.user?.ssn || "-",
      },
      {
        id: "phone",
        header: "تلفن",
        accessorKey: "student.user.phone",
        enableSorting: false,
        cell: ({ row }) => row.original?.student?.user?.phone || "-",
      },
      {
        id: "status",
        header: "وضعیت",
        accessorKey: "status",
        enableSorting: true,
        cell: ({ row }) =>
          row.original?.status === 1 ? "فعال" : row.original?.status === 0 ? "غیرفعال" : "-",
      },
      {
        id: "actions",
        header: "عملیات",
        enableSorting: false,
        cell: ({ row }) => (
          <Button color="secondary" size="sm" onClick={() => openDeleteModal(row.original)}>
            حذف
          </Button>
        ),
      },
    ],
    []
  );

  const candidateColumns = useMemo(
    () => [
      {
        id: "select",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const studentId = row.original?.id;
          const checked = selectedCandidates.has(String(studentId));
          return (
            <div
              className="form-check support-form-question-check"
              role="button"
              tabIndex={0}
              onClick={() => toggleCandidate(studentId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleCandidate(studentId);
                }
              }}
            >
              <input
                type="checkbox"
                className="form-check-input"
                checked={checked}
                readOnly
              />
            </div>
          );
        },
      },
      {
        id: "code",
        header: "کد",
        accessorKey: "code",
        enableSorting: false,
        cell: ({ row }) => row.original?.code || "-",
      },
      {
        id: "name",
        header: "نام",
        accessorKey: "user.name",
        enableSorting: false,
        cell: ({ row }) => row.original?.user?.name || "-",
      },
      {
        id: "username",
        header: "نام کاربری",
        accessorKey: "user.username",
        enableSorting: false,
        cell: ({ row }) => row.original?.user?.username || "-",
      },
      {
        id: "ssn",
        header: "کد ملی",
        accessorKey: "user.ssn",
        enableSorting: false,
        cell: ({ row }) => row.original?.user?.ssn || "-",
      },
      {
        id: "phone",
        header: "تلفن",
        accessorKey: "user.phone",
        enableSorting: false,
        cell: ({ row }) => row.original?.user?.phone || "-",
      },
    ],
    [selectedCandidates]
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs
          title="فرم تماس"
          breadcrumbItem={
            formTitle
              ? `دانش‌آموزان ${formTitle}`
              : "دانش‌آموزان مشاور فرم تماس"
          }
        />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">دانش‌آموزان مشاور</h4>
                  <p className="text-muted mb-0">
                    {adviserInfo?.user?.name
                      ? `مشاور: ${adviserInfo.user.name}`
                      : `مشاور ${adviserId}`}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                  <Button color="danger" onClick={() => setBulkDeleteModal(true)}>
                    حذف همه دانش‌آموزان
                  </Button>
                  <Button color="light" onClick={() => navigate(`/support-forms/${id}/advisers`)}>
                    بازگشت
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <DeleteModal
                  show={deleteModal}
                  onDeleteClick={handleDetachStudent}
                  onCloseClick={() => {
                    setDeleteModal(false);
                    setPendingDelete(null);
                  }}
                />
                <DeleteModal
                  show={bulkDeleteModal}
                  onDeleteClick={handleDetachAllStudents}
                  onCloseClick={() => setBulkDeleteModal(false)}
                  loading={attachLoading}
                />
                {alert && (
                  <Alert color={alert.type} className="mb-3">
                    {alert.message}
                  </Alert>
                )}

                <Card className="border mb-4">
                  <CardHeader className="bg-light d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <h5 className="mb-0">افزودن دستی دانش‌آموز</h5>
                    <Button color="info" onClick={handleOpenTagModal}>
                      افزودن بر اساس تگ
                    </Button>
                  </CardHeader>
                  <CardBody>
                    <Form onSubmit={handleCandidateSearch}>
                      <Row className="g-3 align-items-end">
                        <Col xl="6" lg="6" md="6">
                          <Label className="form-label" htmlFor="candidateSearch">
                            جستجو (نام، نام کاربری، کد ملی، تلفن)
                          </Label>
                          <InputGroup>
                            <InputGroupText>
                              <i className="bx bx-search" />
                            </InputGroupText>
                            <Input
                              id="candidateSearch"
                              value={candidateSearch}
                              onChange={(e) => setCandidateSearch(e.target.value)}
                              placeholder="مثلاً ۰۹۱۲ یا نام دانش‌آموز"
                            />
                          </InputGroup>
                        </Col>
                        <Col xl="3" lg="4" md="6" className="d-flex gap-2">
                          <Button
                            color="primary"
                            type="submit"
                            className="w-100"
                            disabled={candidateLoading}
                          >
                            {candidateLoading ? "در حال جستجو..." : "جستجو"}
                          </Button>
                        </Col>
                        <Col xl="3" lg="4" md="6" className="d-flex gap-2">
                          <Button
                            color="success"
                            type="button"
                            className="w-100"
                            disabled={attachLoading || selectedCandidates.size === 0}
                            onClick={handleAttachSelected}
                          >
                            {attachLoading ? "در حال افزودن..." : "افزودن انتخاب‌ها"}
                          </Button>
                        </Col>
                      </Row>
                    </Form>

                    {candidateResults.length > 0 && (
                      <div className="mt-4">
                        <TableContainer
                          columns={candidateColumns}
                          data={candidateResults}
                          isGlobalFilter={false}
                          isPagination={false}
                          isLoading={candidateLoading}
                          tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                        />
                      </div>
                    )}
                  </CardBody>
                </Card>

                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="6" lg="6" md="6">
                      <Label className="form-label" htmlFor="search">
                        جستجو در دانش‌آموزان متصل
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
                          placeholder="نام، کد ملی یا تلفن"
                        />
                      </InputGroup>
                    </Col>
                    <Col xl="3" lg="4" md="6" className="d-flex gap-2">
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

      <Modal isOpen={tagModal} toggle={() => setTagModal(false)} centered>
        <ModalHeader toggle={() => setTagModal(false)}>
          افزودن دانش‌آموز بر اساس تگ
        </ModalHeader>
        <ModalBody>
          {tagAlert && (
            <Alert color={tagAlert.type} className="mb-3">
              {tagAlert.message}
            </Alert>
          )}
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleAttachByTag();
            }}
          >
            <Row className="g-3">
              <Col md="12">
                <Label className="form-label">جستجوی سرتگ</Label>
                <InputGroup>
                  <Input
                    value={tagSearch}
                    onChange={(e) => {
                      setTagSearch(e.target.value);
                      fetchParentTags(e.target.value);
                    }}
                    placeholder="نام سرتگ..."
                  />
                  <Button
                    color="light"
                    type="button"
                    onClick={() => fetchParentTags(tagSearch)}
                    disabled={tagLoading}
                  >
                    جستجو
                  </Button>
                </InputGroup>
              </Col>
              <Col md="12">
                <Label className="form-label">سرتگ</Label>
                <Input
                  type="select"
                  value={selectedParentTag}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSelectedParentTag(next);
                    setSelectedTagValue("");
                    setSubTagText("");
                    fetchTagValues(next, "");
                  }}
                >
                  <option value="">انتخاب سرتگ</option>
                  {parentTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name || tag.title || `تگ ${tag.id}`}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col md="12">
                <Label className="form-label">زیر تگ</Label>
                <Input
                  type="select"
                  value={selectedTagValue}
                  onChange={(e) => {
                    setSelectedTagValue(e.target.value);
                    setSubTagText("");
                  }}
                  disabled={!selectedParentTag}
                >
                  <option value="">انتخاب زیرتگ</option>
                  {tagValues.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.value || tag.name || `تگ ${tag.id}`}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col md="12">
                <Label className="form-label">یا نام/شناسه تگ</Label>
                <Input
                  value={tagText}
                  onChange={(e) => setTagText(e.target.value)}
                  placeholder="نام یا شناسه تگ"
                />
              </Col>
              <Col md="12">
                <Label className="form-label">یا نام/شناسه زیرتگ</Label>
                <Input
                  value={subTagText}
                  onChange={(e) => setSubTagText(e.target.value)}
                  placeholder="نام یا شناسه زیرتگ"
                  disabled={!selectedParentTag && !tagText.trim()}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button color="light" type="button" onClick={() => setTagModal(false)}>
                بستن
              </Button>
              <Button color="primary" type="submit" disabled={attachLoading}>
                {attachLoading ? "در حال افزودن..." : "افزودن"}
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default SupportFormAdviserStudents;
