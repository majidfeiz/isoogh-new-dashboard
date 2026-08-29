import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { getStudentParentTags, syncStudentParentTags } from "../../services/parentTagService.jsx";
import { buildTagForest, getStudentSchoolOptions, getVisibleTagIds, resolveStudentTagSchoolId } from "./studentTagUtils.js";

const errorMessage = (error) => {
  const body = error?.response?.data;
  const message = body?.message ?? body?.data?.message ?? body?.errors?.[0]?.message ?? body?.errors?.[0];
  if (Array.isArray(message)) return message.filter(Boolean).join("، ");
  if (typeof message === "string" && message) return message;
  const status = error?.response?.status;
  if (status === 400) return "اطلاعات انتخاب‌شده معتبر نیست.";
  if (status === 403) return "اجازه مشاهده یا ویرایش تگ‌های این دانش‌آموز را ندارید.";
  if (status === 404) return "دانش‌آموز، مدرسه یا تگ موردنظر پیدا نشد.";
  return "دریافت یا ذخیره تگ‌های دانش‌آموز انجام نشد.";
};

const TagNode = ({ tag, selected, visibleIds, readOnly, onToggle, depth = 0 }) => {
  if (!visibleIds.has(tag.id)) return null;
  const inputId = `student-tag-${tag.id}`;
  const checked = selected.has(tag.id);
  const handleToggle = () => {
    if (!readOnly) onToggle(tag.id, !checked);
  };
  return <div>
    <div
      className="form-check d-flex align-items-start gap-2 py-2 mb-0 support-form-question-check"
      role="button"
      aria-pressed={checked}
      aria-disabled={readOnly}
      tabIndex={readOnly ? -1 : 0}
      style={{ paddingInlineStart: depth * 24, cursor: readOnly ? "default" : "pointer" }}
      onClick={handleToggle}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          handleToggle();
        }
      }}
    >
      <input id={inputId} type="checkbox" className="form-check-input mt-0" checked={checked} disabled={readOnly} readOnly />
      <label htmlFor={inputId} className="form-check-label flex-grow-1 mb-0" style={{ pointerEvents: "none" }}>
        <span className="fw-semibold">{tag.name || `تگ ${tag.id}`}</span>{tag.description ? <small className="d-block text-muted">{tag.description}</small> : null}
      </label>
    </div>
    {tag.children.map((child) => <TagNode key={child.id} tag={child} selected={selected} visibleIds={visibleIds} readOnly={readOnly} onToggle={onToggle} depth={depth + 1} />)}
  </div>;
};

const StudentTagsModal = ({ open, student, activeSchoolId, canEdit, onClose, onSaved }) => {
  const studentId = student?.id;
  const schoolOptions = useMemo(() => getStudentSchoolOptions(student), [student]);
  const initialSchoolId = useMemo(() => resolveStudentTagSchoolId(student, activeSchoolId), [activeSchoolId, studentId, schoolOptions]);
  const [schoolId, setSchoolId] = useState(null);
  const [tags, setTags] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const savingRef = useRef(false);

  const load = useCallback(async (currentSchoolId) => {
    if (!open || !studentId || !currentSchoolId) return;
    setLoading(true);
    setError("");
    try {
      const result = await getStudentParentTags(studentId, currentSchoolId);
      setTags(Array.isArray(result.availableTags) ? result.availableTags : []);
      setSelected(new Set((result.selectedTagIds || []).map(Number)));
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [open, studentId]);

  useEffect(() => {
    if (!open) return;
    setSchoolId(initialSchoolId);
    setTags([]);
    setSelected(new Set());
    setSearch("");
    setError("");
    if (initialSchoolId) load(initialSchoolId);
  }, [initialSchoolId, load, open, studentId]);

  const forest = useMemo(() => buildTagForest(tags), [tags]);
  const visibleIds = useMemo(() => getVisibleTagIds(tags, search), [search, tags]);
  const toggle = (tagId, checked) => setSelected((current) => {
    const next = new Set(current);
    if (checked) next.add(tagId); else next.delete(tagId);
    return next;
  });

  const save = async () => {
    if (!schoolId || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const result = await syncStudentParentTags(studentId, { schoolId, tagIds: [...selected] });
      const nextIds = (result.selectedTagIds ?? [...selected]).map(Number);
      if (Array.isArray(result.availableTags)) setTags(result.availableTags);
      setSelected(new Set(nextIds));
      toast.success("تگ‌های دانش‌آموز با موفقیت ذخیره شد");
      await onSaved?.(result);
      onClose();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return <Modal isOpen={open} toggle={() => !saving && onClose()} centered size="lg" returnFocusAfterClose>
    <ModalHeader toggle={() => !saving && onClose()}>مدیریت تگ‌های {student?.name || "دانش‌آموز"}</ModalHeader>
    <ModalBody dir="rtl">
      {!initialSchoolId && schoolOptions.length > 1 ? <div className="mb-3">
        <Label htmlFor="student-tag-school">مجموعه</Label>
        <Input id="student-tag-school" type="select" value={schoolId ?? ""} disabled={loading || saving} onChange={(event) => { const next = Number(event.target.value) || null; setSchoolId(next); setTags([]); setSelected(new Set()); if (next) load(next); }}>
          <option value="">انتخاب مجموعه...</option>
          {schoolOptions.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
        </Input>
      </div> : null}
      {!schoolId && schoolOptions.length === 0 ? <Alert color="warning">مدرسه این دانش‌آموز مشخص نیست؛ ابتدا فیلتر مجموعه را انتخاب کنید.</Alert> : null}
      {error ? <Alert color="danger">{error}</Alert> : null}
      {schoolId ? <>
        <div className="d-flex align-items-center gap-2 mb-3"><Input aria-label="جست‌وجوی تگ" placeholder="جست‌وجوی نام تگ..." value={search} disabled={loading || saving} onChange={(event) => setSearch(event.target.value)} /><span className="badge bg-primary text-nowrap">{selected.size.toLocaleString("fa-IR")} انتخاب‌شده</span></div>
        {loading ? <div className="text-center py-5"><Spinner color="primary" /><span className="visually-hidden">در حال بارگذاری...</span></div> : tags.length === 0 ? <div className="text-center text-muted py-5">تگی برای این مجموعه تعریف نشده است.</div> : <div className="border rounded p-3" style={{ maxHeight: 420, overflowY: "auto" }}>
          {forest.roots.map((tag) => <TagNode key={tag.id} tag={tag} selected={selected} visibleIds={visibleIds} readOnly={!canEdit || saving} onToggle={toggle} />)}
          {forest.others.length ? <div className="mt-3 pt-3 border-top"><div className="text-muted fw-semibold mb-1">سایر</div>{forest.others.map((tag) => <TagNode key={tag.id} tag={tag} selected={selected} visibleIds={visibleIds} readOnly={!canEdit || saving} onToggle={toggle} />)}</div> : null}
          {visibleIds.size === 0 ? <div className="text-center text-muted py-3">تگی مطابق جست‌وجو پیدا نشد.</div> : null}
        </div>}
        {!canEdit ? <Alert color="info" className="mt-3 mb-0">شما فقط امکان مشاهده تگ‌ها را دارید.</Alert> : null}
      </> : null}
    </ModalBody>
    <ModalFooter>
      <Button color="light" onClick={onClose} disabled={saving}>بستن</Button>
      {canEdit ? <Button color="primary" onClick={save} disabled={!schoolId || loading || saving}>{saving ? <Spinner size="sm" className="me-1" /> : null}ذخیره</Button> : null}
    </ModalFooter>
  </Modal>;
};

export default StudentTagsModal;
