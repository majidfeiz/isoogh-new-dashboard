import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, CardBody, CardHeader, Col, Container, Form, Input, Label, Row, Spinner, Table } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";
import { API_ROUTES, getApiUrl } from "../../helpers/apiRoutes.jsx";
import { attachUserToParentTag, deleteParentTagValue, detachUserFromParentTag, downloadParentTagValueTemplate, getParentTag, getParentTagStudentCandidates, getParentTagUsers, importParentTagValues, saveParentTagValue } from "../../services/parentTagService.jsx";

const userIdOf = (row) => row?.user_id ?? row?.user?.id ?? null;
const valueOf = (row) => row?.value?.value ?? row?.value ?? "";
const errorText = (error, fallback) => {
  const value = error?.response?.data?.message ?? error?.response?.data?.error;
  return Array.isArray(value) ? value.join("، ") : value || fallback;
};
const filename = (header, fallback) => {
  const value = /filename\*=UTF-8''([^;]+)/i.exec(header || "")?.[1] || /filename="?([^";]+)"?/i.exec(header || "")?.[1];
  try { return decodeURIComponent(value || fallback); } catch { return value || fallback; }
};
const saveBlob = (blob, name) => {
  const href = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href; link.download = name; document.body.appendChild(link); link.click(); link.remove();
  window.URL.revokeObjectURL(href);
};

const candidateSelectStyles = {
  control: (base) => ({ ...base, minHeight: 54 }),
  singleValue: (base) => ({ ...base, color: "#343a40", overflow: "visible" }),
  menu: (base) => ({ ...base, zIndex: 20, backgroundColor: "#fff" }),
  option: (base, state) => ({
    ...base,
    color: "#343a40",
    backgroundColor: state.isSelected ? "#dfe5ff" : state.isFocused ? "#eef2ff" : "#fff",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    opacity: state.isDisabled ? 0.65 : 1,
    ":active": { backgroundColor: "#d6defd" },
  }),
};

const ParentTagUsers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  document.title = "کاربران و مقادیر تگ | داشبورد آیسوق";
  const [tag, setTag] = useState(null);
  const schoolId = tag?.school_id ?? tag?.schoolId ?? tag?.school?.id ?? null;
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, lastPage: 1 });
  const [filters, setFilters] = useState({ search: "", hasValue: "false" });
  const [sort, setSort] = useState({ by: "id", order: "DESC" });
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [rowBusy, setRowBusy] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [debouncedCandidateSearch, setDebouncedCandidateSearch] = useState("");
  const [candidateOptions, setCandidateOptions] = useState([]);
  const [candidateMeta, setCandidateMeta] = useState({ page: 1, lastPage: 1 });
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [attachValue, setAttachValue] = useState("");
  const candidateRequest = useRef(0);
  const [attaching, setAttaching] = useState(false);
  const [notice, setNotice] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [files, setFiles] = useState({ upsert: null, delete: null });
  const [importing, setImporting] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => { let active = true; getParentTag(id).then((data) => active && setTag(data)).catch(() => setTag(null)); return () => { active = false; }; }, [id]);
  const fetchRows = useCallback(async (page = 1, selectedFilters = filters, selectedSort = sort) => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const response = await getParentTagUsers(id, { page, limit: meta.limit, schoolId, search: selectedFilters.search, hasValue: selectedFilters.hasValue, sortBy: selectedSort.by, sortOrder: selectedSort.order });
      setRows(response.items || []); setMeta(response.pagination || { page, limit: meta.limit, total: 0, lastPage: 1 });
      setDrafts(Object.fromEntries((response.items || []).map((row) => [userIdOf(row), valueOf(row)])));
    } catch (error) { setRows([]); setNotice({ color: "danger", text: errorText(error, "دریافت کاربران تگ ناموفق بود.") }); }
    finally { setLoading(false); }
  }, [filters, id, meta.limit, schoolId, sort]);
  useEffect(() => { if (schoolId) fetchRows(1, filters, sort); }, [schoolId]); // eslint-disable-line react-hooks/exhaustive-deps
  const refresh = useCallback(() => fetchRows(meta.page, filters, sort), [fetchRows, filters, meta.page, sort]);
  const mutate = useCallback(async (key, operation, success) => {
    setRowBusy(key); setNotice(null);
    try { await operation(); setNotice({ color: "success", text: success }); await refresh(); }
    catch (error) { setNotice({ color: "danger", text: errorText(error, "عملیات ناموفق بود.") }); }
    finally { setRowBusy(null); }
  }, [refresh]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCandidateSearch(candidateSearch.trim()), 350);
    return () => clearTimeout(timer);
  }, [candidateSearch]);

  const loadCandidates = useCallback(async (page = 1, search = debouncedCandidateSearch, append = false) => {
    const requestId = ++candidateRequest.current;
    if (!schoolId || search.length < 2) {
      setCandidateOptions([]);
      setCandidateMeta({ page: 1, lastPage: 1 });
      return;
    }
    setCandidateLoading(true);
    try {
      const response = await getParentTagStudentCandidates(id, { schoolId, search, page, limit: 20 });
      if (requestId !== candidateRequest.current) return;
      setCandidateOptions((current) => {
        const map = new Map((append ? current : []).map((item) => [item.userId, item]));
        (response.items || []).forEach((item) => map.set(item.userId, item));
        return Array.from(map.values());
      });
      setCandidateMeta(response.pagination || { page, lastPage: 1 });
    } catch (error) {
      if (requestId !== candidateRequest.current) return;
      setCandidateOptions([]);
      setNotice({ color: "danger", text: errorText(error, "جستجوی دانش‌آموز ناموفق بود.") });
    } finally {
      if (requestId === candidateRequest.current) setCandidateLoading(false);
    }
  }, [debouncedCandidateSearch, id, schoolId]);

  useEffect(() => {
    loadCandidates(1, debouncedCandidateSearch, false);
  }, [debouncedCandidateSearch, loadCandidates]);

  const handleAttach = async (event) => {
    event.preventDefault();
    if (!selectedCandidate) return setNotice({ color: "danger", text: "انتخاب دانش‌آموز الزامی است." });
    setAttaching(true);
    try {
      await attachUserToParentTag(id, { userId: selectedCandidate.userId, value: attachValue, schoolId });
      setSelectedCandidate(null); setAttachValue(""); setCandidateSearch(""); setCandidateOptions([]);
      setNotice({ color: "success", text: "دانش‌آموز متصل شد." }); await fetchRows(1, filters, sort);
    }
    catch (error) { setNotice({ color: "danger", text: errorText(error, "اتصال کاربر ناموفق بود.") }); }
    finally { setAttaching(false); }
  };
  const query = useCallback(() => ({ schoolId, page: 1, limit: meta.total || meta.limit, search: filters.search, hasValue: filters.hasValue, sortBy: sort.by, sortOrder: sort.order }), [filters, meta.limit, meta.total, schoolId, sort]);
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams(); Object.entries(query()).forEach(([key, value]) => params.set(key, String(value ?? "")));
      const response = await fetch(`${getApiUrl(API_ROUTES.parentTags.exportUsers(id))}?${params}`, { headers: { Authorization: `Bearer ${getAccessToken()}` } });
      if (!response.ok) throw new Error(await response.text());
      saveBlob(await response.blob(), filename(response.headers.get("Content-Disposition"), `parent-tag-${id}-users.csv`));
    } catch (error) { setNotice({ color: "danger", text: error.message || "دانلود خروجی ناموفق بود." }); }
    finally { setExporting(false); }
  };
  const downloadTemplate = async (isDelete) => {
    try { const response = await downloadParentTagValueTemplate(id, schoolId, isDelete); const disposition = response.headers?.["content-disposition"] ?? response.headers?.get?.("content-disposition"); saveBlob(response.blob, filename(disposition, isDelete ? "tag-values-delete.xlsx" : "tag-values-import.xlsx")); }
    catch (error) { setNotice({ color: "danger", text: errorText(error, "دانلود نمونه ناموفق بود.") }); }
  };
  const submitImport = async (kind) => {
    const file = files[kind];
    if (!file) return setNotice({ color: "danger", text: "انتخاب فایل الزامی است." });
    if (!/\.xlsx$/i.test(file.name)) return setNotice({ color: "danger", text: "فقط فایل XLSX قابل قبول است." });
    setImporting(kind); setResult(null);
    try { const response = await importParentTagValues(id, { file, schoolId, deleteImport: kind === "delete" }); setResult(response); await refresh(); }
    catch (error) { setNotice({ color: "danger", text: errorText(error, "پردازش فایل ناموفق بود.") }); }
    finally { setImporting(null); }
  };

  const columns = useMemo(() => [
    { id: "name", header: "نام", accessorKey: "user.name", enableSorting: false, cell: ({ row }) => row.original?.user?.name || "-" },
    { id: "username", header: "نام کاربری", accessorKey: "user.username", enableSorting: false, cell: ({ row }) => row.original?.user?.username || "-" },
    { id: "studentCode", header: "کد دانش‌آموز", accessorKey: "student.code", enableSorting: false, cell: ({ row }) => row.original?.student?.code || "-" },
    { id: "ssn", header: "کد ملی", accessorKey: "user.ssn", enableSorting: false, cell: ({ row }) => row.original?.user?.ssn || "-" },
    { id: "phone", header: "موبایل", accessorKey: "user.phone", enableSorting: false, cell: ({ row }) => row.original?.user?.phone || "-" },
    { id: "tagName", header: "نام تگ", accessorKey: "tag_name", enableSorting: false, cell: ({ row }) => row.original?.tag_name || tag?.name || "-" },
    { id: "value", header: "مقدار", enableSorting: false, cell: ({ row }) => { const uid = userIdOf(row.original); return <div className="d-flex gap-2 align-items-center" style={{ minWidth: 300 }}><Input value={drafts[uid] ?? ""} disabled={rowBusy === uid || !hasPermission("parent-tag-values.upsert")} onChange={(e) => setDrafts((old) => ({ ...old, [uid]: e.target.value }))} />{hasPermission("parent-tag-values.upsert") && <Button size="sm" color="success" disabled={rowBusy === uid} onClick={() => mutate(uid, () => saveParentTagValue(id, { userId: uid, value: drafts[uid] ?? "", schoolId }), "مقدار ذخیره شد.")}>ذخیره</Button>}{row.original?.value != null && hasPermission("parent-tag-values.delete") && <Button size="sm" color="danger" outline disabled={rowBusy === uid} onClick={() => window.confirm("فقط مقدار حذف شود؟") && mutate(uid, () => deleteParentTagValue(id, uid, schoolId), "مقدار حذف شد.")}>حذف مقدار</Button>}</div>; } },
    { id: "actions", header: "عملیات", enableSorting: false, cell: ({ row }) => { const uid = userIdOf(row.original); return hasPermission("parent-tag-users.delete") ? <Button size="sm" color="danger" disabled={rowBusy === uid} onClick={() => window.confirm("اتصال کاربر و مقدار آن حذف شود؟") && mutate(uid, () => detachUserFromParentTag(id, uid, schoolId), "اتصال حذف شد.")}>{rowBusy === uid ? <Spinner size="sm" /> : "حذف اتصال"}</Button> : null; } },
  ], [drafts, hasPermission, id, mutate, rowBusy, schoolId, tag?.name]);
  const changeSorting = (next) => { const first = next?.[0]; const selected = first ? { by: first.id, order: first.desc ? "DESC" : "ASC" } : { by: "id", order: "DESC" }; setSorting(next); setSort(selected); fetchRows(1, filters, selected); };

  if (tag && !schoolId) return <div className="page-content"><Container fluid><Alert color="danger">برای این تگ مجموعه‌ای مشخص نشده است.</Alert></Container></div>;
  return <div className="page-content"><Container fluid><Breadcrumbs title="تگ‌ها" breadcrumbItem="کاربران / مقدار" /><Card>
    <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2"><div><h4 className="card-title mb-1">کاربران / مقدار «{tag?.name || "..."}»</h4><span className="text-muted">مجموعه: {tag?.school?.name || schoolId || "..."}</span></div><div className="d-flex gap-2"><Button color="success" outline onClick={handleExport} disabled={!schoolId || exporting}>{exporting ? "در حال دانلود..." : "خروجی CSV"}</Button><Button color="secondary" onClick={() => navigate(-1)}>بازگشت</Button></div></CardHeader>
    <CardBody>{notice && <Alert color={notice.color}>{notice.text}</Alert>}
      <Form className="mb-4" onSubmit={(event) => { event.preventDefault(); fetchRows(1, filters, sort); }}><Row className="g-2 align-items-end"><Col md="6"><Label>جستجو</Label><Input value={filters.search} onChange={(e) => setFilters((old) => ({ ...old, search: e.target.value }))} placeholder="نام، نام کاربری، کد ملی، موبایل، نام تگ یا مقدار" /></Col><Col md="3"><Label>وضعیت مقدار</Label><Input type="select" value={filters.hasValue} onChange={(e) => setFilters((old) => ({ ...old, hasValue: e.target.value }))}><option value="">همه</option><option value="true">دارای مقدار</option><option value="false">بدون مقدار</option></Input></Col><Col md="3" className="d-flex gap-2"><Button color="primary" type="submit" disabled={loading}>جستجو</Button><Button type="button" color="light" onClick={() => { const clean = { search: "", hasValue: "false" }; setFilters(clean); fetchRows(1, clean, sort); }}>پاک‌کردن</Button></Col></Row></Form>
      {hasPermission("parent-tag-users.create") && <Form onSubmit={handleAttach} className="border rounded p-3 mb-4">
        <h5>اتصال انفرادی دانش‌آموز</h5>
        <Row className="g-2 align-items-end">
          <Col md="6">
            <Label>دانش‌آموز</Label>
            <Select
              isClearable
              classNamePrefix="react-select"
              placeholder="حداقل دو کاراکتر از نام کاربری یا کد ملی..."
              noOptionsMessage={() => candidateSearch.trim().length < 2 ? "حداقل دو کاراکتر وارد کنید" : candidateLoading ? "در حال جستجو..." : "دانش‌آموزی یافت نشد"}
              options={candidateOptions}
              value={selectedCandidate}
              inputValue={candidateSearch}
              isLoading={candidateLoading}
              filterOption={null}
              isRtl
              styles={candidateSelectStyles}
              getOptionValue={(candidate) => String(candidate.userId)}
              getOptionLabel={(candidate) => candidate.name || candidate.username || candidate.ssn || "دانش‌آموز"}
              isOptionDisabled={(candidate) => candidate.alreadyAssigned}
              formatOptionLabel={(candidate, { context }) => context === "value" ? (
                <span className="fw-semibold text-dark">
                  {candidate.name || "بدون نام"}{candidate.username ? ` (${candidate.username})` : ""}
                </span>
              ) : <div>
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-semibold">{candidate.name || "بدون نام"}</span>
                  {candidate.alreadyAssigned && <span className="badge bg-secondary">قبلاً متصل شده</span>}
                </div>
                <small className="text-muted d-block">
                  نام کاربری: {candidate.username || "-"} | کد ملی: {candidate.ssn || "-"} | کد دانش‌آموز: {candidate.studentCode || "-"}
                </small>
              </div>}
              onInputChange={(value, action) => {
                if (action.action === "input-change") setCandidateSearch(value);
              }}
              onChange={(candidate) => {
                setSelectedCandidate(candidate);
                setCandidateSearch("");
              }}
              onMenuScrollToBottom={() => {
                if (!candidateLoading && candidateMeta.page < candidateMeta.lastPage) {
                  loadCandidates(candidateMeta.page + 1, debouncedCandidateSearch, true);
                }
              }}
            />
          </Col>
          <Col md="4"><Label>مقدار اختیاری</Label><Input value={attachValue} onChange={(event) => setAttachValue(event.target.value)} /></Col>
          <Col md="2"><Button color="primary" type="submit" disabled={attaching || !selectedCandidate || selectedCandidate.alreadyAssigned}>{attaching ? "در حال اتصال..." : "اتصال دانش‌آموز"}</Button></Col>
        </Row>
      </Form>}
      <Row className="g-3 mb-4">{[{ kind: "upsert", title: "ثبت / ویرایش گروهی مقدار", permission: "parent-tag-values.upsert", isDelete: false }, { kind: "delete", title: "حذف گروهی مقدار", permission: "parent-tag-values.delete", isDelete: true }].filter((item) => hasPermission(item.permission)).map((item) => <Col lg="6" key={item.kind}><div className="border rounded p-3 h-100"><h5>{item.title}</h5><div className="d-flex gap-2 flex-wrap"><Button type="button" color="info" outline onClick={() => downloadTemplate(item.isDelete)}>دانلود نمونه XLSX</Button><Input type="file" accept=".xlsx" onChange={(e) => setFiles((old) => ({ ...old, [item.kind]: e.target.files?.[0] || null }))} style={{ maxWidth: 300 }} /><Button type="button" color={item.isDelete ? "danger" : "success"} disabled={importing === item.kind} onClick={() => submitImport(item.kind)}>{importing === item.kind ? "در حال پردازش..." : "ارسال فایل"}</Button></div></div></Col>)}</Row>
      {result && <Alert color={result.failed ? "warning" : "success"}><h5>نتیجه پردازش فایل</h5><div className="d-flex gap-4"><span>کل: {result.total ?? 0}</span><span>موفق: {result.successful ?? 0}</span><span>ناموفق: {result.failed ?? 0}</span></div>{result.errors?.length > 0 && <Table responsive bordered size="sm" className="mt-3 mb-0"><thead><tr><th>ردیف</th><th>نام کاربری</th><th>علت</th></tr></thead><tbody>{result.errors.map((error, index) => <tr key={`${error.rowNumber}-${index}`}><td>{error.rowNumber}</td><td>{error.username || "-"}</td><td>{error.reason}</td></tr>)}</tbody></Table>}</Alert>}
      <TableContainer columns={columns} data={rows} isGlobalFilter={false} isPagination={false} isLoading={loading} manualSorting sortingState={sorting} onSortingChange={changeSorting} tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline" /><Paginations perPageData={meta.limit} data={rows} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={(page) => fetchRows(page, filters, sort)} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />
    </CardBody></Card></Container></div>;
};
export default ParentTagUsers;
