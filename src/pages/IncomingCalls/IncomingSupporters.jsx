import React, { useCallback, useState } from "react";
import { Button, Card, CardBody, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { createIncomingSupporter, getIncomingSupporters, incomingCallErrorMessage, updateIncomingSupporter } from "../../services/incomingCallService.jsx";
import { RequestState, SchoolPicker } from "./IncomingCallsCommon.jsx";

const emptyForm = { name: "", phone: "", username: "", password: "", extension: "" };
const IncomingSupporters = () => {
  document.title = "پشتیبان‌های تماس ورودی | آیسوق";
  const { hasPermission } = useAuth();
  const [schoolId, setSchoolId] = useState(""); const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const [modal, setModal] = useState(false); const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm); const [saving, setSaving] = useState(false);
  const load = useCallback(async (id = schoolId) => { if (!id) return; setLoading(true); setError(""); try { const data = await getIncomingSupporters(id); setItems(Array.isArray(data) ? data : data?.items || []); } catch (e) { setError(incomingCallErrorMessage(e)); } finally { setLoading(false); } }, [schoolId]);
  const selectSchool = (id) => { setSchoolId(id); setItems([]); if (id) load(id); };
  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name || "", phone: item.phone || "", username: item.username || "", password: "", extension: item.extension || "", isActive: item.isActive ?? true }); setModal(true); };
  const submit = async (e) => { e.preventDefault(); setSaving(true); try {
    const payload = { ...form, extension: form.extension || undefined }; if (editing && !payload.password) delete payload.password;
    if (editing) await updateIncomingSupporter(editing.id, schoolId, payload); else await createIncomingSupporter(schoolId, payload);
    setForm(emptyForm); setModal(false); toast.success(editing ? "پشتیبان ویرایش شد." : "پشتیبان ایجاد شد."); await load();
  } catch (err) { toast.error(incomingCallErrorMessage(err, "شماره تلفن یا نام کاربری قبلاً ثبت شده است.")); } finally { setSaving(false); setForm((old) => ({ ...old, password: "" })); } };
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="تماس‌های ورودی" breadcrumbItem="مدیریت پشتیبان‌ها" />
    <Card><CardBody><Row className="g-3 align-items-end"><Col lg="5"><SchoolPicker value={schoolId} onChange={selectSchool} /></Col><Col>{hasPermission("incoming-calls.supporters.create") && <Button color="primary" disabled={!schoolId} onClick={openCreate}>افزودن پشتیبان</Button>}</Col></Row>
      {!schoolId ? <div className="text-muted text-center py-5">مجموعه را انتخاب کنید.</div> : <RequestState loading={loading} error={error} empty={!items.length} onRetry={() => load()} emptyText="پشتیبانی برای این مجموعه ثبت نشده است." />}
      {!!items.length && !loading && <div className="table-responsive mt-4"><Table hover><thead><tr><th>نام</th><th>تلفن</th><th>نام کاربری</th><th>داخلی</th><th>وضعیت</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.phone}</td><td>{item.username}</td><td>{item.extension || "—"}</td><td><span className={`badge bg-${item.isActive === false ? "secondary" : "success"}`}>{item.isActive === false ? "غیرفعال" : "فعال"}</span></td><td>{hasPermission("incoming-calls.supporters.update") && <Button size="sm" outline onClick={() => openEdit(item)}>ویرایش</Button>}</td></tr>)}</tbody></Table></div>}
    </CardBody></Card>
    <Modal isOpen={modal} toggle={() => setModal(false)}><form onSubmit={submit}><ModalHeader toggle={() => setModal(false)}>{editing ? "ویرایش پشتیبان" : "پشتیبان جدید"}</ModalHeader><ModalBody>
      {[{ key: "name", label: "نام" }, { key: "phone", label: "تلفن" }, { key: "username", label: "نام کاربری" }, { key: "password", label: editing ? "رمز جدید (اختیاری)" : "رمز عبور", type: "password" }, { key: "extension", label: "داخلی (اختیاری)" }].map((field) => <FormGroup key={field.key}><Label>{field.label}</Label><Input type={field.type || "text"} required={!editing && field.key !== "extension" || ["name", "phone", "username"].includes(field.key)} autoComplete={field.key === "password" ? "new-password" : "off"} value={form[field.key]} onChange={(e) => setForm((old) => ({ ...old, [field.key]: e.target.value }))} /></FormGroup>)}
      {editing && <FormGroup switch><Input type="switch" checked={form.isActive} onChange={(e) => setForm((old) => ({ ...old, isActive: e.target.checked }))} /><Label check>فعال</Label></FormGroup>}
    </ModalBody><ModalFooter><Button type="submit" color="primary" disabled={saving}>{saving ? "در حال ذخیره..." : "ذخیره"}</Button><Button type="button" color="secondary" onClick={() => setModal(false)}>انصراف</Button></ModalFooter></form></Modal>
  </div></div>;
};
export default IncomingSupporters;
