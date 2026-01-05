// src/pages/ParentTags/ParentTagUsers.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Container,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Spinner,
  Progress,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  attachUserToParentTag,
  deleteParentTagValue,
  detachUserFromParentTag,
  getParentTag,
  getParentTagUsers,
  saveParentTagValue,
} from "../../services/parentTagService.jsx";
import { API_ROUTES, getApiUrl } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";

const getUserId = (user) =>
  user?.user_id ??
  user?.userId ??
  user?.id ??
  user?.user?.id ??
  user?.pivot?.user_id ??
  null;

const getUserName = (user) =>
  user?.full_name ||
  user?.fullName ||
  [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
  user?.name ||
  user?.user?.name ||
  "-";

const getUserPhone = (user) =>
  user?.phone ||
  user?.mobile ||
  user?.phone_number ||
  user?.voip_phone ||
  user?.user?.phone ||
  user?.username ||
  "-";

const getUserValue = (user) =>
  user?.value ??
  user?.tag_value ??
  user?.tagValue ??
  user?.pivot?.value ??
  user?.meta?.value ??
  "";

const ParentTagUsers = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  document.title = "کاربران تگ | داشبورد آیسوق";

  const [tag, setTag] = useState(null);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    userId: "",
    schoolId: "",
    hasValue: "",
  });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [attachUserId, setAttachUserId] = useState("");
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [valueDrafts, setValueDrafts] = useState({});
  const [valueSaving, setValueSaving] = useState(null);
  const [detachingId, setDetachingId] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [exportPhase, setExportPhase] = useState("idle");
  const approxTotalRef = useRef(null);

  const fetchTag = useCallback(async () => {
    try {
      const data = await getParentTag(id);
      setTag(data);
    } catch (e) {
      console.error("خطا در دریافت تگ", e);
      setTag(null);
    }
  }, [id]);

  const buildValueDrafts = useCallback((list = []) => {
    const map = {};
    list.forEach((u) => {
      const uid = getUserId(u);
      if (!uid) return;
      map[uid] = getUserValue(u) ?? "";
    });
    return map;
  }, []);

  const fetchUsers = useCallback(
    async (page = 1, currentFilters = {}) => {
      setLoadingUsers(true);
      try {
        const res = await getParentTagUsers(id, {
          page,
          limit: meta.limit,
          search: currentFilters.search,
          userId: currentFilters.userId,
          schoolId: currentFilters.schoolId,
          hasValue: currentFilters.hasValue,
        });
        setUsers(res.items || []);
        setMeta(
          res.pagination || {
            page,
            limit: meta.limit,
            total: 0,
            lastPage: 1,
          }
        );
        setValueDrafts(buildValueDrafts(res.items || []));
      } catch (e) {
        console.error("خطا در دریافت کاربران تگ", e);
        setUsers([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
        setValueDrafts({});
      } finally {
        setLoadingUsers(false);
      }
    },
    [id, meta.limit, buildValueDrafts]
  );

  useEffect(() => {
    fetchTag();
    fetchUsers(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTag, fetchUsers]);

  const handlePageChange = (page) => {
    fetchUsers(page, filters);
  };

  const handleAttachUser = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);

    if (!attachUserId) {
      setErrors({ user_id: ["شناسه کاربر الزامی است"] });
      return;
    }
    const numericId = Number(attachUserId);
    if (Number.isNaN(numericId)) {
      setErrors({ user_id: ["شناسه کاربر معتبر نیست"] });
      return;
    }

    setAttaching(true);
    try {
      await attachUserToParentTag(id, numericId);
      setAlert({
        type: "success",
        message: "کاربر با موفقیت به تگ متصل شد.",
      });
      setAttachUserId("");
      await fetchUsers(meta.page);
    } catch (e) {
      console.error("خطا در اتصال کاربر به تگ", e);
      if (e.response && e.response.status === 422) {
        setErrors(e.response.data.errors || {});
      } else {
        setAlert({
          type: "danger",
          message: "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
        });
      }
    } finally {
      setAttaching(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1, filters);
  };

  const handleResetFilters = () => {
    const reset = { search: "", userId: "", schoolId: "", hasValue: "" };
    setFilters(reset);
    fetchUsers(1, reset);
  };

  const handleDetachUser = useCallback(
    async (userId) => {
      const confirmed = window.confirm("کاربر از این تگ حذف شود؟");
      if (!confirmed) return;

      setDetachingId(userId);
      try {
        await detachUserFromParentTag(id, userId);
        await fetchUsers(meta.page);
      } catch (e) {
        console.error("خطا در حذف کاربر از تگ", e);
        setAlert({
          type: "danger",
          message: "حذف کاربر از تگ با خطا مواجه شد.",
        });
      } finally {
        setDetachingId(null);
      }
    },
    [id, fetchUsers, meta.page]
  );

  const handleValueChange = useCallback((userId, value) => {
    setValueDrafts((prev) => ({ ...prev, [userId]: value }));
  }, []);

  const handleSaveValue = useCallback(
    async (userId) => {
      if (!userId) return;
      setAlert(null);
      setValueSaving(userId);
      try {
        await saveParentTagValue(id, { userId, value: valueDrafts[userId] ?? "" });
        setAlert({
          type: "success",
          message: "مقدار تگ ذخیره شد.",
        });
        await fetchUsers(meta.page);
      } catch (e) {
        console.error("خطا در ذخیره مقدار", e);
        setAlert({
          type: "danger",
          message: "ذخیره مقدار تگ با خطا مواجه شد.",
        });
      } finally {
        setValueSaving(null);
      }
    },
    [id, valueDrafts, fetchUsers, meta.page]
  );

  const handleRemoveValue = useCallback(
    async (userId) => {
      if (!userId) return;
      const confirmed = window.confirm("مقدار این کاربر حذف شود؟");
      if (!confirmed) return;

      setValueSaving(userId);
      try {
        await deleteParentTagValue(id, userId);
        await fetchUsers(meta.page);
      } catch (e) {
        console.error("خطا در حذف مقدار", e);
        setAlert({
          type: "danger",
          message: "حذف مقدار تگ با خطا مواجه شد.",
        });
      } finally {
        setValueSaving(null);
      }
    },
    [id, fetchUsers, meta.page]
  );

  const handleExport = useCallback(async () => {
    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("limit", String(meta.total && meta.total > 0 ? meta.total : meta.limit));
    if (filters.search) params.append("search", filters.search);
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.schoolId) params.append("schoolId", filters.schoolId);
    if (filters.hasValue !== "" && filters.hasValue !== null && typeof filters.hasValue !== "undefined") {
      params.append("hasValue", filters.hasValue);
    }

    const url = `${getApiUrl(API_ROUTES.parentTags.exportUsers(id))}?${params.toString()}`;
    const token = getAccessToken();
    setExportLoading(true);
    setExportProgress(0);
    setExportPhase("pending");
    approxTotalRef.current = null;

    try {
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || "خطا در خروجی گرفتن");
      }

      const approxHeader =
        res.headers.get("X-Approx-Content-Length") ||
        res.headers.get("x-approx-content-length") ||
        res.headers.get("Content-Length");
      const approxTotal = approxHeader ? Number(approxHeader) : 0;
      if (approxTotal > 0) {
        approxTotalRef.current = approxTotal;
        setExportPhase("downloading");
        setExportProgress(1);
      }

      const reader = res.body.getReader();
      const chunks = [];
      let loaded = 0;
      const total = approxTotalRef.current || 0;
      const decoder = new TextDecoder("utf-8");
      let carry = "";
      let headerBytes = 0;
      let rowsSeen = 0;
      const perPage = meta.total && meta.total > 0 ? meta.total : meta.limit;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkSize = value?.byteLength ?? value?.length ?? 0;
        if (chunkSize > 0) {
          chunks.push(value);
          loaded += chunkSize;

          const chunkText = carry + decoder.decode(value, { stream: true });
          const parts = chunkText.split("\n");
          carry = parts.pop() || "";

          parts.forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) return;
            if (headerBytes === 0) {
              headerBytes = line.length + 1;
            } else {
              rowsSeen += 1;
            }
          });

          const approx =
            approxTotalRef.current ||
            (rowsSeen > 0
              ? Math.round(
                  headerBytes +
                    ((loaded - headerBytes) / Math.max(rowsSeen, 1)) * perPage
                )
              : 0);

          if (total > 0) {
            setExportPhase("downloading");
            setExportProgress(Math.min(99, Math.round((loaded / total) * 100)));
          } else if (approx > 0) {
            setExportPhase("downloading");
            setExportProgress(Math.min(99, Math.round((loaded / approx) * 100)));
          } else {
            setExportPhase("pending");
            setExportProgress(null);
          }
        }
      }

      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const csvBlob = new Blob([bom, ...chunks], {
        type: "text/csv;charset=utf-8;",
      });

      const urlObject = window.URL.createObjectURL(csvBlob);
      const link = document.createElement("a");
      link.href = urlObject;
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.setAttribute("download", `parent-tag-${id}-users-${stamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(urlObject);
      setExportPhase("finalizing");
      setExportProgress(100);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("خطا در خروجی اکسل", e);
    } finally {
      setExportLoading(false);
      setTimeout(() => {
        setExportProgress(null);
        setExportPhase("idle");
        approxTotalRef.current = null;
      }, 900);
    }
  }, [filters, id, meta.limit, meta.total]);

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "کاربر",
        accessorKey: "id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const user = row.original;
          const uid = getUserId(user);
          const ssn =
            user?.user?.ssn ??
            user?.ssn ??
            user?.user?.username ??
            user?.username ??
            "";
          return (
            <div>
              <div className="fw-semibold">#{uid ?? "-"}</div>
              <div className="text-muted small">{getUserName(user)}</div>
              {ssn ? <div className="text-muted small">کد/نام کاربری: {ssn}</div> : null}
            </div>
          );
        },
      },
      {
        id: "student",
        header: "دانش‌آموز",
        accessorKey: "student.code",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const code = row.original?.student?.code;
          return code ? (
            <div className="d-flex flex-column">
              <span className="fw-semibold">{code}</span>
            </div>
          ) : (
            "-"
          );
        },
      },
      {
        id: "phone",
        header: "شماره تماس",
        accessorKey: "phone",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => getUserPhone(row.original),
      },
      {
        id: "value",
        header: "مقدار تگ",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const user = row.original;
          const uid = getUserId(user);
          const initialValue = getUserValue(user);
          const currentValue =
            valueDrafts?.[uid] !== undefined ? valueDrafts[uid] : initialValue ?? "";

          return (
            <div className="d-flex flex-column gap-2">
              <Input
                value={currentValue ?? ""}
                onChange={(e) => handleValueChange(uid, e.target.value)}
                placeholder="مثلاً یادداشت یا مقدار"
              />
              <div className="d-flex flex-wrap gap-2">
                <Button
                  color="success"
                  size="sm"
                  onClick={() => handleSaveValue(uid)}
                  disabled={!uid || valueSaving === uid}
                >
                  {valueSaving === uid ? "در حال ذخیره..." : "ذخیره مقدار"}
                </Button>
                <Button
                  color="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveValue(uid)}
                  disabled={!uid || valueSaving === uid || (!initialValue && !currentValue)}
                >
                  حذف مقدار
                </Button>
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "عملیات",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const uid = getUserId(row.original);
          return (
            <div className="d-flex flex-wrap gap-2">
              <Button
                color="danger"
                size="sm"
                onClick={() => handleDetachUser(uid)}
                disabled={!uid || detachingId === uid}
              >
                {detachingId === uid ? "در حال حذف..." : "حذف از تگ"}
              </Button>
            </div>
          );
        },
      },
    ],
    [handleDetachUser, handleRemoveValue, handleSaveValue, handleValueChange, detachingId, valueDrafts, valueSaving]
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="تگ‌ها" breadcrumbItem="کاربران و مقادیر تگ" />

        <Row>
          <Col lg="12">
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">
                    کاربران تگ {tag ? `«${tag.name || tag.title || tag.id}»` : ""}
                  </h4>
                  {tag?.parent?.name && (
                    <div className="text-muted small">
                      والد: {tag.parent.name}
                    </div>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Button color="success" outline onClick={handleExport} disabled={exportLoading}>
                    {exportLoading ? "در حال دریافت..." : "خروجی CSV"}
                  </Button>
                  {loadingUsers && <Spinner size="sm" color="primary" />}
                  <Button color="secondary" onClick={() => navigate("/parent-tags")}>
                    بازگشت به لیست
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                {alert && (
                  <Alert color={alert.type} className="mb-3">
                    {alert.message}
                  </Alert>
                )}

                <Form onSubmit={handleSearchSubmit} className="mb-4">
                  <Row className="g-3 align-items-end">
                    <Col xl="4" lg="4" md="6">
                      <Label className="form-label">جستجو</Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="mdi mdi-magnify" />
                        </InputGroupText>
                        <Input
                          name="search"
                          value={filters.search}
                          onChange={handleFilterChange}
                          placeholder="نام/کدملی/موبایل/تگ/مقدار..."
                        />
                      </InputGroup>
                    </Col>
                    <Col xl="2" lg="3" md="6">
                      <Label className="form-label">شناسه کاربر</Label>
                      <Input
                        name="userId"
                        type="number"
                        value={filters.userId}
                        onChange={handleFilterChange}
                        placeholder="مثلاً 470710"
                      />
                    </Col>
                    <Col xl="2" lg="3" md="6">
                      <Label className="form-label">شناسه مدرسه</Label>
                      <Input
                        name="schoolId"
                        type="number"
                        value={filters.schoolId}
                        onChange={handleFilterChange}
                        placeholder="مثلاً 94"
                      />
                    </Col>
                    <Col xl="2" lg="3" md="6">
                      <Label className="form-label">وضعیت مقدار</Label>
                      <Input
                        name="hasValue"
                        type="select"
                        value={filters.hasValue}
                        onChange={handleFilterChange}
                      >
                        <option value="">همه</option>
                        <option value="1">دارای مقدار</option>
                        <option value="0">بدون مقدار</option>
                      </Input>
                    </Col>
                    <Col xl="2" lg="3" md="6" className="d-flex gap-2">
                      <Button color="primary" type="submit" className="w-100" disabled={loadingUsers}>
                        جستجو
                      </Button>
                      <Button
                        color="light"
                        type="button"
                        className="w-100"
                        onClick={handleResetFilters}
                        disabled={loadingUsers}
                      >
                        ریست
                      </Button>
                    </Col>
                  </Row>
                </Form>

                <Form onSubmit={handleAttachUser} className="mb-4">
                  <Row className="g-3 align-items-end">
                    <Col md="4" lg="3">
                      <FormGroup>
                        <Label for="user_id">شناسه کاربر</Label>
                        <Input
                          id="user_id"
                          name="user_id"
                          type="number"
                          value={attachUserId}
                          onChange={(e) => setAttachUserId(e.target.value)}
                          invalid={!!errors.user_id}
                          placeholder="مثلاً 101"
                        />
                        {errors.user_id && (
                          <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
                            {errors.user_id[0]}
                          </div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col md="4" lg="3">
                      <Button
                        color="primary"
                        type="submit"
                        className="w-100"
                        disabled={attaching}
                      >
                        {attaching ? "در حال اتصال..." : "افزودن کاربر"}
                      </Button>
                    </Col>
                  </Row>
                </Form>

                {(exportLoading || exportProgress !== null) && (
                  <div className="mb-3">
                    <Label className="form-label d-flex justify-content-between">
                      <span>در حال دانلود خروجی</span>
                      {exportProgress != null ? <span>%{exportProgress}</span> : null}
                    </Label>
                    <Progress
                      animated={exportProgress === null}
                      striped
                      color="success"
                      value={exportProgress ?? 30}
                    />
                  </div>
                )}

                <TableContainer
                  columns={columns}
                  data={users || []}
                  isGlobalFilter={false}
                  isPagination={false}
                  isLoading={loadingUsers}
                  tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                />

                <Paginations
                  perPageData={meta.limit}
                  data={users}
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
      </Container>
    </div>
  );
};

export default ParentTagUsers;
