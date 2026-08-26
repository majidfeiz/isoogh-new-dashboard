import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner, Table } from "reactstrap";
import Paginations from "../../components/Common/Paginations.jsx";
import { detachAdviserSubordinate, exportAdviserSubordinates, getAdvisers, getAdviserSubordinates, syncAdviserSubordinates } from "../../services/adviserService.jsx";

const errorText = (error, fallback) => {
  const message = error?.response?.data?.message || error?.response?.data?.error;
  return Array.isArray(message) ? message.join("، ") : message || fallback;
};
const adviserName = (item) => item?.user?.name || item?.name || "—";
const adviserId = (item) => item?.id ?? item?.adviser_id ?? item?.adviserId;
const selectionId = (item) => {
  const id = adviserId(item);
  return id === null || id === undefined ? "" : String(id);
};
const saveBlob = ({ blob, filename }) => { const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); };

const AdviserSubordinatesModal = ({ isOpen, adviser, schoolId, grades, canUpdate, onClose, onChanged }) => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, lastPage: 1 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [sort, setSort] = useState({ by: "id", order: "DESC" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [detachingIds, setDetachingIds] = useState({});
  const detachingRef = useRef(new Set());
  const requestRef = useRef(null);

  const load = useCallback(async (page = 1) => {
    if (!isOpen || !adviser?.id || !schoolId) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true); setError("");
    try {
      const result = await getAdviserSubordinates(adviser.id, { schoolId, page, limit: 10, search, gradeId, sortBy: sort.by, sortOrder: sort.order, signal: controller.signal });
      if (!controller.signal.aborted) { setItems(result.items || []); setMeta(result.pagination || { page, limit: 10, total: 0, lastPage: 1 }); }
    } catch (caught) {
      if (caught?.code !== "ERR_CANCELED" && !controller.signal.aborted) { setItems([]); setError(errorText(caught, "دریافت زیرمجموعه‌ها ناموفق بود.")); }
    } finally { if (requestRef.current === controller && !controller.signal.aborted) setLoading(false); }
  }, [isOpen, adviser?.id, schoolId, search, gradeId, sort]);

  useEffect(() => { const timer = setTimeout(() => { setSearch(searchInput); setMeta((current) => ({ ...current, page: 1 })); }, 400); return () => clearTimeout(timer); }, [searchInput]);
  useEffect(() => { if (isOpen && schoolId) load(1); }, [isOpen, schoolId, search, gradeId, sort, load]);
  useEffect(() => { if (!isOpen) return; setSearchInput(""); setSearch(""); setGradeId(""); setSort({ by: "id", order: "DESC" }); setMeta({ page: 1, limit: 10, total: 0, lastPage: 1 }); setPickerOpen(false); setSelectedIds([]); }, [isOpen, schoolId, adviser?.id]);
  useEffect(() => () => requestRef.current?.abort(), []);

  const toggleSort = (field) => setSort((current) => ({ by: field, order: current.by === field && current.order === "ASC" ? "DESC" : "ASC" }));
  const loadCandidates = useCallback(async (query = "", initializeSelection = false) => {
    setPickerLoading(true); setPickerError("");
    try {
      const availableRequest = getAdvisers({ schoolId, page: 1, limit: 100, search: query, sortBy: "name", sortOrder: "ASC" });
      const [available, current] = initializeSelection
        ? await Promise.all([availableRequest, getAdviserSubordinates(adviser.id, { schoolId, page: 1, limit: 100, sortBy: "id", sortOrder: "DESC" })])
        : [await availableRequest, null];
      setCandidates((available.items || []).filter((item) => selectionId(item) && selectionId(item) !== selectionId(adviser)));
      if (current) setSelectedIds((current.items || []).map(selectionId).filter(Boolean));
    } catch (caught) { setPickerError(errorText(caught, "دریافت گزینه‌های مشاوران ناموفق بود.")); }
    finally { setPickerLoading(false); }
  }, [adviser?.id, schoolId]);
  const openPicker = () => { setCandidateSearch(""); setPickerOpen(true); loadCandidates("", true); };
  const saveSelection = async () => {
    if (saving) return;
    setSaving(true); setPickerError("");
    try { await syncAdviserSubordinates(adviser.id, { schoolId, adviserIds: selectedIds }); setPickerOpen(false); await load(1); await onChanged?.(); }
    catch (caught) { setPickerError(errorText(caught, "ذخیره زیرمجموعه‌ها ناموفق بود.")); }
    finally { setSaving(false); }
  };
  const handleExport = async () => { setExporting(true); setError(""); try { saveBlob(await exportAdviserSubordinates(adviser.id, { schoolId, search, gradeId, sortBy: sort.by, sortOrder: sort.order })); } catch (caught) { setError(errorText(caught, "دریافت خروجی ناموفق بود.")); } finally { setExporting(false); } };
  const detach = async (item) => {
    const id = adviserId(item);
    if (!id || detachingRef.current.has(String(id))) return;
    if (!window.confirm(`«${adviserName(item)}» از زیرمجموعه این سرمشاور جدا شود؟`)) return;
    detachingRef.current.add(String(id));
    setDetachingIds((current) => ({ ...current, [id]: true }));
    setError("");
    try {
      await detachAdviserSubordinate(adviser.id, id, schoolId);
      await load(meta.page);
      await onChanged?.();
    } catch (caught) {
      setError(caught?.response?.status === 404 ? "این مشاور دیگر زیرمجموعه این سرمشاور نیست" : errorText(caught, "حذف مشاور از زیرمجموعه ناموفق بود."));
    } finally {
      detachingRef.current.delete(String(id));
      setDetachingIds((current) => ({ ...current, [id]: false }));
    }
  };
  const toggleCandidate = (item) => {
    const id = selectionId(item);
    if (!id) return;
    setSelectedIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]);
  };

  const close = () => { requestRef.current?.abort(); setPickerOpen(false); setSelectedIds([]); onClose(); };
  return <><Modal isOpen={isOpen} toggle={close} size="xl" scrollable><ModalHeader toggle={close}>زیرمجموعه‌های {adviserName(adviser)}</ModalHeader><ModalBody>
    <div className="d-flex flex-wrap justify-content-between gap-2 mb-3"><div className="d-flex flex-wrap gap-2"><Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="جست‌وجوی نام، کد یا تلفن" style={{ width: 250 }} aria-label="جست‌وجوی زیرمجموعه‌ها" /><Input type="select" value={gradeId} onChange={(event) => { setGradeId(event.target.value); setMeta((current) => ({ ...current, page: 1 })); }} style={{ width: 180 }} aria-label="فیلتر پایه زیرمجموعه‌ها"><option value="">همه پایه‌ها</option>{grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}</Input></div><div className="d-flex gap-2">{canUpdate && <Button color="primary" onClick={openPicker} disabled={!schoolId}>مدیریت زیرمجموعه‌ها</Button>}<Button color="success" outline onClick={handleExport} disabled={exporting || !schoolId}>{exporting ? <Spinner size="sm" /> : "خروجی اکسل"}</Button></div></div>
    {error && <Alert color="danger">{error}<Button color="danger" outline size="sm" className="d-block mt-2" onClick={() => load(meta.page)}>تلاش مجدد</Button></Alert>}
    {loading ? <div className="text-center py-5"><Spinner color="primary" /></div> : !error && items.length === 0 ? <div className="text-center text-muted py-5">مشاوری در زیرمجموعه این سرمشاور نیست.</div> : !error && <div className="table-responsive"><Table hover className="align-middle"><thead><tr><th role="button" onClick={() => toggleSort("id")}>شناسه</th><th role="button" onClick={() => toggleSort("name")}>نام</th><th>کد</th><th>تلفن</th><th>مدارس</th><th>پایه‌ها</th><th>parent_id</th>{canUpdate && <th>عملیات</th>}</tr></thead><tbody>{items.map((item) => <tr key={selectionId(item)}><td>{adviserId(item)}</td><td>{adviserName(item)}</td><td>{item.code || "—"}</td><td dir="ltr">{item.user?.phone || item.phone || "—"}</td><td>{(item.schools || []).map((school) => school.name || school.code).filter(Boolean).join("، ") || "—"}</td><td>{(item.grades || []).map((grade) => grade.name).filter(Boolean).join("، ") || "—"}</td><td>{item.parent_id ?? item.parentId ?? item.parent?.id ?? "—"}</td>{canUpdate && <td><Button color="danger" outline size="sm" disabled={Boolean(detachingIds[adviserId(item)])} onClick={() => detach(item)}>{detachingIds[adviserId(item)] ? <Spinner size="sm" /> : "حذف از زیرمجموعه"}</Button></td>}</tr>)}</tbody></Table></div>}
    {!loading && !error && meta.total > 0 && <Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={load} isShowingPageLength={false} paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />}
  </ModalBody></Modal>
  <Modal isOpen={pickerOpen} toggle={() => !saving && setPickerOpen(false)} size="lg" scrollable><ModalHeader toggle={() => !saving && setPickerOpen(false)}>انتخاب مشاوران زیرمجموعه</ModalHeader><ModalBody>
    <Row className="g-2 mb-3"><Col><Label for="candidate-search">جست‌وجوی مشاور</Label><Input id="candidate-search" value={candidateSearch} onChange={(event) => setCandidateSearch(event.target.value)} /></Col><Col xs="auto" className="d-flex align-items-end"><Button color="light" onClick={() => loadCandidates(candidateSearch)} disabled={pickerLoading}>جستجو</Button></Col></Row>
    {pickerError && <Alert color="danger">{pickerError}</Alert>}{pickerLoading ? <div className="text-center py-4"><Spinner /></div> : candidates.length === 0 ? <div className="text-muted text-center py-4">مشاور واجد شرایطی یافت نشد.</div> : candidates.map((item) => { const id = selectionId(item); const checked = selectedIds.includes(id); const isSuper = item.is_super === true || item.is_super === 1 || item.is_super === "1" || item.isSuper === true; return <div className={`d-flex align-items-center gap-2 border rounded p-2 mb-2${checked ? " border-primary bg-soft-primary" : ""}`} key={id} style={{ cursor: "pointer" }} onClick={() => toggleCandidate(item)}><input type="checkbox" className="form-check-input mt-0" checked={checked} onClick={(event) => event.stopPropagation()} onChange={() => toggleCandidate(item)} aria-label={`انتخاب ${adviserName(item)}`} /><span>{adviserName(item)} <span className="text-muted">({item.code || adviserId(item)})</span></span>{isSuper && <Badge color="primary">سرمشاور</Badge>}{item.parent_id && <Badge color="light" className="text-dark me-auto">متصل</Badge>}</div>; })}
  </ModalBody><ModalFooter><Button color="light" disabled={saving} onClick={() => setPickerOpen(false)}>انصراف</Button><Button color="primary" disabled={saving || pickerLoading} onClick={saveSelection}>{saving ? <Spinner size="sm" /> : `ذخیره (${selectedIds.length})`}</Button></ModalFooter></Modal></>;
};

export default AdviserSubordinatesModal;
