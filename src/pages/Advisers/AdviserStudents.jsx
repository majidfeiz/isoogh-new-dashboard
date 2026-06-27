import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
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
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Spinner,
} from "reactstrap";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import DeleteModal from "../../components/Common/DeleteModal.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import TableContainer from "../../components/Common/TableContainer";
import {
  attachAdviserStudents,
  attachAdviserStudentsBySearch,
  attachAdviserStudentsByTag,
  detachAdviserStudent,
  detachAdviserStudents,
  getAdviserStudentCandidates,
  getAdviserStudents,
} from "../../services/adviserService.jsx";
import { getParentTags, getParentTagValues } from "../../services/parentTagService.jsx";

const AdviserStudents = () => {
  const { adviserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const adviserInfo = location.state?.adviser;

  document.title = "دانش‌آموزان مشاور | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [filters, setFilters] = useState({ search: "" });
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [sort, setSort] = useState({ by: "id", order: "DESC" });
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  const [candidateFields, setCandidateFields] = useState({
    name: "",
    username: "",
    phone: "",
    ssn: "",
  });
  const [candidateResults, setCandidateResults] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());

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

  const fetchData = useCallback(
    async (page = 1, currentFilters = {}, currentSort = sort, options = {}) => {
      setLoading(true);
      if (!options.preserveAlert) {
        setAlert(null);
      }

      try {
        const res = await getAdviserStudents(adviserId, {
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
        console.error("خطا در دریافت دانش‌آموزان مشاور", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
        setAlert({ type: "danger", message: "خطا در دریافت اطلاعات." });
      } finally {
        setLoading(false);
      }
    },
    [adviserId, meta.limit, sort]
  );

  useEffect(() => {
    fetchData(1, filters, sort);
  }, [fetchData, sort]);

  const getCandidateSearchText = useCallback(() => {
    return [candidateFields.name, candidateFields.username, candidateFields.phone, candidateFields.ssn]
      .map((value) => (value || "").toString().trim())
      .filter(Boolean)
      .join(" ");
  }, [candidateFields.name, candidateFields.phone, candidateFields.ssn, candidateFields.username]);

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
      const allowed = ["id", "created_at", "updated_at", "student_id"];
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

  const handleCandidateFieldChange = (e) => {
    const { name, value } = e.target;
    setCandidateFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleCandidateSearch = async (e) => {
    e.preventDefault();
    const search = getCandidateSearchText();

    if (!search) {
      setAlert({ type: "warning", message: "حداقل یکی از فیلدهای جستجو را وارد کنید." });
      return;
    }

    setCandidateLoading(true);
    setAlert(null);

    try {
      const res = await getAdviserStudentCandidates(adviserId, {
        page: 1,
        limit: 20,
        search,
      });

      setCandidateResults(res.items || []);
      setSelectedCandidates(new Set());

      if (!res.items?.length) {
        setAlert({ type: "warning", message: "دانش‌آموزی برای افزودن یافت نشد." });
      }
    } catch (e2) {
      console.error("خطا در دریافت کاندیدهای دانش‌آموز", e2);
      setAlert({ type: "danger", message: "خطا در جستجوی دانش‌آموز." });
    } finally {
      setCandidateLoading(false);
    }
  };

  const handleAttachBySearch = async () => {
    const search = getCandidateSearchText();
    if (!search) {
      setAlert({ type: "warning", message: "حداقل یکی از فیلدهای جستجو را وارد کنید." });
      return;
    }

    setSubmitLoading(true);
    setAlert(null);

    try {
      const res = await attachAdviserStudentsBySearch(adviserId, { search });
      const result = res?.data || res || {};
      const added = result.added ?? "-";
      const skipped = result.skipped ?? "-";
      const matched = result.matched ?? "-";

      setAlert({
        type: "success",
        message: `نتیجه افزودن بر اساس جستجو: اضافه شد ${added}، رد شد ${skipped}، تطبیق ${matched}`,
      });

      await fetchData(meta.page, filters, sort, { preserveAlert: true });
      setCandidateResults([]);
      setSelectedCandidates(new Set());
    } catch (e) {
      console.error("خطا در افزودن دانش‌آموز بر اساس جستجو", e);
      setAlert({ type: "danger", message: "خطا در افزودن بر اساس جستجو." });
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleCandidate = (studentId) => {
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      const key = String(studentId);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleAttachSelected = async () => {
    if (selectedCandidates.size === 0) return;

    setSubmitLoading(true);
    setAlert(null);

    try {
      await attachAdviserStudents(adviserId, {
        studentIds: Array.from(selectedCandidates).map((value) => Number(value)),
      });

      setAlert({ type: "success", message: "دانش‌آموزان انتخاب‌شده اضافه شدند." });
      setSelectedCandidates(new Set());
      await fetchData(meta.page, filters, sort, { preserveAlert: true });
    } catch (e) {
      console.error("خطا در افزودن دانش‌آموزان انتخاب‌شده", e);
      setAlert({ type: "danger", message: "خطا در افزودن انتخاب‌ها." });
    } finally {
      setSubmitLoading(false);
    }
  };

  const openDeleteModal = (row) => {
    setPendingDelete(row);
    setDeleteModal(true);
  };

  const handleDetachStudent = async () => {
    const studentId =
      pendingDelete?.student_id || pendingDelete?.student?.id || pendingDelete?.id;
    if (!studentId) return;

    setSubmitLoading(true);
    setAlert(null);

    try {
      await detachAdviserStudent(adviserId, studentId);
      setAlert({ type: "success", message: "دانش‌آموز حذف شد." });
      await fetchData(meta.page, filters, sort, { preserveAlert: true });
    } catch (e) {
      console.error("خطا در حذف دانش‌آموز", e);
      setAlert({ type: "danger", message: "حذف دانش‌آموز با خطا مواجه شد." });
    } finally {
      setSubmitLoading(false);
      setDeleteModal(false);
      setPendingDelete(null);
    }
  };

  const handleDetachAllStudents = async () => {
    setSubmitLoading(true);
    setAlert(null);

    try {
      const res = await detachAdviserStudents(adviserId);
      const removed = res?.data?.removed ?? res?.removed;

      setAlert({
        type: "success",
        message:
          typeof removed === "number"
            ? `تعداد ${removed} دانش‌آموز حذف شد.`
            : "تمام دانش‌آموزان مشاور حذف شدند.",
      });

      await fetchData(1, filters, sort, { preserveAlert: true });
    } catch (e) {
      console.error("خطا در حذف همه دانش‌آموزان", e);
      setAlert({ type: "danger", message: "حذف همه دانش‌آموزان با خطا مواجه شد." });
    } finally {
      setSubmitLoading(false);
      setBulkDeleteModal(false);
    }
  };

  const fetchParentTags = useCallback(async (search = "") => {
    setTagLoading(true);
    try {
      const res = await getParentTags({ page: 1, limit: 50, search });
      setParentTags(res.items || []);
    } catch (e) {
      console.error("خطا در دریافت تگ‌ها", e);
    } finally {
      setTagLoading(false);
    }
  }, []);

  const fetchTagValues = useCallback(async (parentTagId, search = "") => {
    if (!parentTagId) {
      setTagValues([]);
      return;
    }

    setTagLoading(true);
    try {
      const res = await getParentTagValues(parentTagId, { page: 1, limit: 50, search });
      setTagValues(res.items || []);
    } catch (e) {
      console.error("خطا در دریافت مقادیر زیرتگ", e);
    } finally {
      setTagLoading(false);
    }
  }, []);

  const handleOpenTagModal = () => {
    setTagModal(true);
    setTagSearch("");
    setSelectedParentTag("");
    setSelectedTagValue("");
    setTagText("");
    setSubTagText("");
    setTagAlert(null);
    fetchParentTags("");
  };

  const handleAttachByTag = async () => {
    if (!selectedTagValue && !subTagText.trim() && !tagText.trim() && !selectedParentTag) {
      const warn = { type: "warning", message: "حداقل یک تگ انتخاب کنید." };
      setAlert(warn);
      setTagAlert(warn);
      return;
    }

    setSubmitLoading(true);
    setTagAlert(null);

    try {
      const payload = {};
      if (selectedParentTag) payload.tagId = Number(selectedParentTag);
      if (tagText.trim()) payload.tag = tagText.trim();
      if (selectedTagValue) payload.subTagId = Number(selectedTagValue);
      if (subTagText.trim()) payload.subTag = subTagText.trim();

      const res = await attachAdviserStudentsByTag(adviserId, payload);
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

      await fetchData(meta.page, filters, sort, { preserveAlert: true });
      setTagModal(false);
    } catch (e) {
      console.error("خطا در افزودن دانش‌آموز بر اساس تگ", e);
      const error = { type: "danger", message: "خطا در افزودن بر اساس تگ." };
      setAlert(error);
      setTagAlert(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const resolveStudentId = (row) => row?.student_id || row?.student?.id || row?.id || "-";

  const resolveStudentCode = (row) => row?.student?.code || row?.code || "-";

  const resolveStudentUser = (row) => row?.student?.user || row?.user || {};

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "student_id",
        header: "شناسه دانش‌آموز",
        accessorFn: (row) => resolveStudentId(row),
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        id: "code",
        header: "کد",
        accessorFn: (row) => resolveStudentCode(row),
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
      {
        id: "name",
        header: "نام",
        accessorFn: (row) => resolveStudentUser(row)?.name || "-",
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
      {
        id: "username",
        header: "نام کاربری",
        accessorFn: (row) => resolveStudentUser(row)?.username || "-",
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
      {
        id: "ssn",
        header: "کد ملی",
        accessorFn: (row) => resolveStudentUser(row)?.ssn || "-",
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
      {
        id: "phone",
        header: "موبایل",
        accessorFn: (row) => resolveStudentUser(row)?.phone || "-",
        enableSorting: false,
        cell: (info) => info.getValue(),
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
              className="form-check"
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
              <input type="checkbox" className="form-check-input" checked={checked} readOnly />
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
        accessorFn: (row) => row?.user?.name || "-",
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
      {
        id: "username",
        header: "نام کاربری",
        accessorFn: (row) => row?.user?.username || "-",
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
      {
        id: "ssn",
        header: "کد ملی",
        accessorFn: (row) => row?.user?.ssn || "-",
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
      {
        id: "phone",
        header: "موبایل",
        accessorFn: (row) => row?.user?.phone || "-",
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
    ],
    [selectedCandidates]
  );

  const adviserDisplayName = adviserInfo?.user?.name || adviserInfo?.name;

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="مدیریت مشاوران" breadcrumbItem="دانش‌آموزان مشاور" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">لیست دانش‌آموزان مشاور</h4>
                  <p className="text-muted mb-0">
                    {adviserDisplayName
                      ? `مشاور: ${adviserDisplayName}`
                      : `مشاور با شناسه ${adviserId}`}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                  <Button color="danger" onClick={() => setBulkDeleteModal(true)}>
                    حذف همه دانش‌آموزان
                  </Button>
                  <Button color="light" onClick={() => navigate(-1)}>
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
                  loading={submitLoading}
                />

                <DeleteModal
                  show={bulkDeleteModal}
                  onDeleteClick={handleDetachAllStudents}
                  onCloseClick={() => setBulkDeleteModal(false)}
                  loading={submitLoading}
                />

                {alert && (
                  <Alert color={alert.type} className="mb-3">
                    {alert.message}
                  </Alert>
                )}

                <Card className="border mb-4">
                  <CardHeader className="bg-light d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <h5 className="mb-0">افزودن دانش‌آموز</h5>
                    <Button color="info" onClick={handleOpenTagModal}>
                      افزودن بر اساس تگ
                    </Button>
                  </CardHeader>

                  <CardBody>
                    <Form onSubmit={handleCandidateSearch}>
                      <Row className="g-3 align-items-end">
                        <Col xl="3" lg="6" md="6">
                          <Label className="form-label" htmlFor="candidateName">
                            نام
                          </Label>
                          <Input
                            id="candidateName"
                            name="name"
                            value={candidateFields.name}
                            onChange={handleCandidateFieldChange}
                            placeholder="نام دانش‌آموز"
                          />
                        </Col>

                        <Col xl="3" lg="6" md="6">
                          <Label className="form-label" htmlFor="candidateUsername">
                            نام کاربری
                          </Label>
                          <Input
                            id="candidateUsername"
                            name="username"
                            value={candidateFields.username}
                            onChange={handleCandidateFieldChange}
                            placeholder="نام کاربری"
                          />
                        </Col>

                        <Col xl="3" lg="6" md="6">
                          <Label className="form-label" htmlFor="candidatePhone">
                            موبایل
                          </Label>
                          <Input
                            id="candidatePhone"
                            name="phone"
                            value={candidateFields.phone}
                            onChange={handleCandidateFieldChange}
                            placeholder="0912..."
                          />
                        </Col>

                        <Col xl="3" lg="6" md="6">
                          <Label className="form-label" htmlFor="candidateSsn">
                            کد ملی
                          </Label>
                          <Input
                            id="candidateSsn"
                            name="ssn"
                            value={candidateFields.ssn}
                            onChange={handleCandidateFieldChange}
                            placeholder="کد ملی"
                          />
                        </Col>

                        <Col xl="4" lg="6" md="12" className="d-flex gap-2">
                          <Button
                            color="primary"
                            type="submit"
                            className="w-100"
                            disabled={candidateLoading}
                          >
                            {candidateLoading ? "در حال جستجو..." : "جستجوی کاندیدها"}
                          </Button>
                          <Button
                            color="success"
                            type="button"
                            className="w-100"
                            onClick={handleAttachBySearch}
                            disabled={submitLoading}
                          >
                            {submitLoading ? "در حال افزودن..." : "افزودن بر اساس جستجو"}
                          </Button>
                        </Col>

                        <Col xl="4" lg="6" md="12" className="d-flex gap-2">
                          <Button
                            color="secondary"
                            type="button"
                            className="w-100"
                            onClick={handleAttachSelected}
                            disabled={submitLoading || selectedCandidates.size === 0}
                          >
                            {submitLoading ? "در حال افزودن..." : "افزودن انتخاب‌ها"}
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
                    <Col xl="6" lg="6" md="12">
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
                          placeholder="نام، نام کاربری، کد ملی یا موبایل"
                        />
                      </InputGroup>
                    </Col>
                    <Col xl="3" lg="4" md="6" className="d-flex gap-2">
                      <Button color="primary" type="submit" className="w-100" disabled={loading}>
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
        <ModalHeader toggle={() => setTagModal(false)}>افزودن دانش‌آموز بر اساس تگ</ModalHeader>
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
                <Label className="form-label">زیرتگ</Label>
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
                  {tagValues.map((tagValue) => (
                    <option key={tagValue.id} value={tagValue.id}>
                      {tagValue.value || tagValue.name || `زیرتگ ${tagValue.id}`}
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
              <Button color="primary" type="submit" disabled={submitLoading}>
                {submitLoading ? "در حال افزودن..." : "افزودن"}
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AdviserStudents;
