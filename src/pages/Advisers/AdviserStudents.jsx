import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import {
  Alert,
  Badge,
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
  updateAdviserAccountStatus,
} from "../../services/adviserService.jsx";
import { getAllParentTagValues, getParentTags } from "../../services/parentTagService.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { adviserAccountActive, adviserAccountErrorMessage, INACTIVE_CONFIRMATION, withAdviserAccountStatus } from "./adviserAccountStatusUtils.js";
import { TAG_SELECT_STYLES } from "../SupportForms/tagSelectStyles.js";

const AdviserStudents = () => {
  const { adviserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [adviserInfo, setAdviserInfo] = useState(location.state?.adviser || null);
  const schoolId = location.state?.schoolId || "";
  const [accountLoading, setAccountLoading] = useState(false);

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
  const [parentTags, setParentTags] = useState([]);
  const [selectedParentTag, setSelectedParentTag] = useState("");
  const [tagValues, setTagValues] = useState([]);
  const [selectedTagValue, setSelectedTagValue] = useState("");
  const [parentTagsLoading, setParentTagsLoading] = useState(false);
  const [parentTagsPagination, setParentTagsPagination] = useState({ page: 1, lastPage: 1, total: 0 });
  const [parentTagSearch, setParentTagSearch] = useState("");
  const [tagValuesLoading, setTagValuesLoading] = useState(false);
  const [tagAlert, setTagAlert] = useState(null);
  const parentTagsRequest = useRef(0);
  const tagValuesRequest = useRef(0);
  const parentTagSearchTimer = useRef(null);

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

  const fetchParentTags = useCallback(async (page = 1, search = "", append = false) => {
    const requestId = ++parentTagsRequest.current;
    setParentTagsLoading(true);
    try {
      const res = await getParentTags({ page, limit: 200, search, schoolId, rootOnly: 1, sortBy: "name", sortOrder: "ASC" });
      if (requestId !== parentTagsRequest.current) return;
      const nextItems = res.items || [];
      setParentTags((current) => {
        if (!append) return nextItems;
        const byId = new Map(current.map((tag) => [String(tag.id), tag]));
        nextItems.forEach((tag) => byId.set(String(tag.id), tag));
        return Array.from(byId.values());
      });
      setParentTagsPagination(res.pagination || { page, lastPage: 1, total: nextItems.length });
    } catch (e) {
      if (requestId === parentTagsRequest.current) setTagAlert({ type: "danger", message: "خطا در دریافت تگ‌ها." });
    } finally {
      if (requestId === parentTagsRequest.current) setParentTagsLoading(false);
    }
  }, [schoolId]);

  const fetchTagValues = useCallback(async (parentTagId) => {
    const requestId = ++tagValuesRequest.current;
    if (!parentTagId) {
      setTagValues([]);
      setTagValuesLoading(false);
      return;
    }

    setTagValuesLoading(true);
    try {
      const items = await getAllParentTagValues(parentTagId);
      if (requestId === tagValuesRequest.current) setTagValues(items || []);
    } catch (e) {
      if (requestId === tagValuesRequest.current) setTagAlert({ type: "danger", message: "خطا در دریافت زیرتگ‌ها." });
    } finally {
      if (requestId === tagValuesRequest.current) setTagValuesLoading(false);
    }
  }, []);

  const handleOpenTagModal = () => {
    setTagModal(true);
    setSelectedParentTag("");
    setSelectedTagValue("");
    setParentTags([]);
    setTagValues([]);
    setTagAlert(null);
    setParentTagSearch("");
    setParentTagsPagination({ page: 1, lastPage: 1, total: 0 });
    fetchParentTags(1, "", false);
  };

  const closeTagModal = () => {
    clearTimeout(parentTagSearchTimer.current);
    parentTagsRequest.current += 1;
    tagValuesRequest.current += 1;
    setParentTagsLoading(false);
    setTagValuesLoading(false);
    setTagModal(false);
  };

  const searchParentTags = (inputValue, actionMeta) => {
    if (actionMeta.action !== "input-change") return inputValue;
    setParentTagSearch(inputValue);
    clearTimeout(parentTagSearchTimer.current);
    parentTagSearchTimer.current = setTimeout(() => fetchParentTags(1, inputValue.trim(), false), 350);
    return inputValue;
  };

  const loadMoreParentTags = () => {
    const page = Number(parentTagsPagination.page || 1);
    const lastPage = Number(parentTagsPagination.lastPage || 1);
    if (parentTagsLoading || page >= lastPage) return;
    fetchParentTags(page + 1, parentTagSearch.trim(), true);
  };

  const parentTagOptions = useMemo(() => parentTags.map((tag) => ({
    value: String(tag.id),
    label: tag.name || tag.title || `تگ ${tag.id}`,
    description: tag.description,
  })), [parentTags]);
  const tagValueOptions = useMemo(() => tagValues.map((tag) => ({
    value: String(tag.id),
    label: tag.value || tag.name || tag.title || `زیرتگ ${tag.id}`,
  })), [tagValues]);

  const handleAttachByTag = async () => {
    if (!selectedParentTag) {
      const warn = { type: "warning", message: "یک سرتگ انتخاب کنید." };
      setAlert(warn);
      setTagAlert(warn);
      return;
    }

    setSubmitLoading(true);
    setTagAlert(null);

    try {
      const payload = {};
      if (selectedParentTag) payload.tagId = Number(selectedParentTag);
      if (selectedTagValue) payload.subTagId = Number(selectedTagValue);

      const res = await attachAdviserStudentsByTag(adviserId, payload);
      const result = res?.data || res || {};
      const added = Number(result.added || 0);
      const skipped = Number(result.skipped || 0);
      const matched = Number(result.matched || 0);
      let outcome;
      if (added > 0) {
        outcome = { type: "success", message: `${added.toLocaleString("fa-IR")} دانش‌آموز اضافه شد${skipped ? ` و ${skipped.toLocaleString("fa-IR")} مورد تکراری رد شد` : ""}.` };
        await fetchData(1, filters, sort, { preserveAlert: true });
      } else if (matched > 0 || skipped > 0) {
        outcome = { type: "warning", message: "دانش‌آموزان این تگ قبلاً به مشاور اضافه شده‌اند و مورد جدیدی برای افزودن وجود ندارد." };
      } else {
        outcome = { type: "warning", message: tagValues.length && !selectedTagValue
          ? "برای این سرتگ زیرتگ تعریف شده است؛ زیرتگ موردنظر را انتخاب کنید."
          : "دانش‌آموزی با تگ انتخاب‌شده در مجموعه پیدا نشد." };
      }
      setAlert(outcome);
      setTagAlert(outcome);
    } catch (e) {
      console.error("خطا در افزودن دانش‌آموز بر اساس تگ", e);
      const error = { type: "danger", message: e?.response?.data?.message || "خطا در افزودن بر اساس تگ." };
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
  const accountActive = adviserAccountActive(adviserInfo, schoolId);
  const handleAccountStatus = async () => {
    if (!schoolId || accountActive == null || accountLoading) return;
    const nextIsActive = !accountActive;
    if (!nextIsActive && !window.confirm(INACTIVE_CONFIRMATION)) return;
    const previous = adviserInfo;
    setAccountLoading(true);
    setAlert(null);
    setAdviserInfo((current) => withAdviserAccountStatus(current, schoolId, nextIsActive));
    try {
      await updateAdviserAccountStatus(adviserId, { schoolId, isActive: nextIsActive });
      setAlert({ type: "success", message: nextIsActive ? "حساب مشاور در این مجموعه فعال شد." : "حساب مشاور در این مجموعه غیرفعال شد. سوابق و اطلاعات دانش‌آموزان حفظ شده‌اند." });
    } catch (error) {
      setAdviserInfo(previous);
      setAlert({ type: "danger", message: adviserAccountErrorMessage(error) });
    } finally { setAccountLoading(false); }
  };

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
                  {schoolId && accountActive != null && <Badge color={accountActive ? "success" : "danger"} className="mt-1">حساب در مجموعه: {accountActive ? "فعال" : "غیرفعال"}</Badge>}
                </div>
                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                  {hasPermission("advisers.update") && accountActive != null && <Button color={accountActive ? "danger" : "success"} outline onClick={handleAccountStatus} disabled={accountLoading}>{accountLoading ? <Spinner size="sm" /> : accountActive ? "غیرفعال‌سازی حساب" : "فعال‌سازی حساب"}</Button>}
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

      <Modal isOpen={tagModal} toggle={closeTagModal} centered size="lg">
        <ModalHeader toggle={closeTagModal}>افزودن دانش‌آموز بر اساس تگ</ModalHeader>
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
                <Label className="form-label fw-semibold">سرتگ</Label>
                <Select
                  inputId="adviser-students-parent-tag"
                  isRtl
                  isClearable
                  isSearchable
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                  className="support-tag-select"
                  classNamePrefix="support-tag-select"
                  options={parentTagOptions}
                  value={parentTagOptions.find((option) => option.value === String(selectedParentTag)) || null}
                  isLoading={parentTagsLoading}
                  isDisabled={parentTagsLoading && parentTagOptions.length === 0}
                  placeholder={parentTagsLoading ? "در حال دریافت تگ‌ها..." : "نام تگ را جست‌وجو کنید..."}
                  loadingMessage={() => "در حال دریافت تگ‌ها..."}
                  noOptionsMessage={({ inputValue }) => inputValue ? "تگی مطابق جست‌وجو پیدا نشد" : "تگی برای این مجموعه تعریف نشده است"}
                  onInputChange={searchParentTags}
                  onMenuScrollToBottom={loadMoreParentTags}
                  onChange={(option) => {
                    const next = option?.value || "";
                    setSelectedParentTag(next);
                    setSelectedTagValue("");
                    setTagAlert(null);
                    fetchTagValues(next);
                  }}
                  formatOptionLabel={(option) => <div><span>{option.label}</span>{option.description && <small className="d-block text-muted">{option.description}</small>}</div>}
                  styles={TAG_SELECT_STYLES}
                />
                <small className="text-muted d-block mt-2"><i className="bx bx-search ms-1" />برای پیدا کردن سریع تگ، بخشی از نام آن را بنویسید.</small>
              </Col>

              <Col md="12">
                <Label className="form-label fw-semibold">زیرتگ {tagValuesLoading
                  ? <span className="text-muted fw-normal">(در حال بررسی)</span>
                  : tagValues.length ? <span className="text-danger fw-normal">(الزامی)</span>
                    : <span className="text-muted fw-normal">(برای این سرتگ تعریف نشده)</span>}</Label>
                <Select
                  inputId="adviser-students-child-tag"
                  isRtl
                  isClearable
                  isSearchable
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                  className="support-tag-select"
                  classNamePrefix="support-tag-select"
                  options={tagValueOptions}
                  value={tagValueOptions.find((option) => option.value === String(selectedTagValue)) || null}
                  isLoading={tagValuesLoading}
                  isDisabled={!selectedParentTag || tagValuesLoading}
                  placeholder={!selectedParentTag ? "ابتدا سرتگ را انتخاب کنید" : tagValuesLoading ? "در حال دریافت زیرتگ‌ها..." : "جست‌وجو و انتخاب زیرتگ"}
                  loadingMessage={() => "در حال دریافت زیرتگ‌ها..."}
                  noOptionsMessage={() => "زیرتگی یافت نشد"}
                  onChange={(option) => setSelectedTagValue(option?.value || "")}
                  styles={TAG_SELECT_STYLES}
                />
                {selectedParentTag && tagValues.length > 0 && !selectedTagValue && <small className="text-warning d-block mt-2"><i className="bx bx-info-circle ms-1" />دانش‌آموزان براساس زیرتگ دسته‌بندی شده‌اند؛ یک زیرتگ را انتخاب کنید.</small>}
              </Col>

            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button color="light" type="button" onClick={closeTagModal}>
                انصراف
              </Button>
              <Button color="primary" type="submit" disabled={submitLoading || tagValuesLoading || !selectedParentTag || (tagValues.length > 0 && !selectedTagValue)}>
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
