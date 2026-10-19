import React, { useCallback, useState } from "react";
import { Button, Card, CardBody, Col, Input, Label, Row } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getIncomingCallSettings, incomingCallErrorMessage, normalizeIncomingCallPriorities, updateIncomingCallSettings } from "../../services/incomingCallService.jsx";
import { RequestState, SchoolPicker } from "./IncomingCallsCommon.jsx";

const DESTINATIONS = ["consultant", "supporter", "voice"];
const labels = { consultant: "مشاور", supporter: "پشتیبان", voice: "پیام صوتی" };
const settingsForm = (data) => ({
  priorities: normalizeIncomingCallPriorities(data?.priorities),
  voiceDestination: data?.voiceDestination ?? "",
});

const IncomingCallSettings = () => {
  document.title = "تنظیمات تماس ورودی | آیسوق";
  const { hasPermission } = useAuth();
  const [schoolId, setSchoolId] = useState("");
  const [form, setForm] = useState({ priorities: DESTINATIONS, voiceDestination: "" });
  const [dragged, setDragged] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async (id = schoolId) => {
    if (!id) return;
    setLoading(true); setError("");
    try {
      const data = await getIncomingCallSettings(id);
      setForm(settingsForm(data));
    } catch (e) { setError(incomingCallErrorMessage(e)); } finally { setLoading(false); }
  }, [schoolId]);
  const selectSchool = (id) => { setSchoolId(id); setError(""); if (id) load(id); };
  const drop = (target) => {
    if (!dragged || dragged === target) return;
    const next = [...form.priorities];
    const from = next.indexOf(dragged); const to = next.indexOf(target);
    next.splice(from, 1); next.splice(to, 0, dragged);
    setForm((old) => ({ ...old, priorities: normalizeIncomingCallPriorities(next) })); setDragged(null);
  };
  const submit = async () => {
    setSaving(true);
    try {
      const data = await updateIncomingCallSettings(schoolId, {
        priorities: normalizeIncomingCallPriorities(form.priorities),
        voiceDestination: form.voiceDestination,
      });
      setForm(settingsForm(data));
      toast.success("تنظیمات ذخیره شد.");
    }
    catch (e) { toast.error(incomingCallErrorMessage(e)); } finally { setSaving(false); }
  };
  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="تماس‌های ورودی" breadcrumbItem="تنظیمات" />
    <Card><CardBody><Row className="g-3"><Col lg="5"><SchoolPicker value={schoolId} onChange={selectSchool} /></Col></Row>
      {!schoolId ? <div className="text-muted py-5 text-center">برای مشاهده تنظیمات، مجموعه را انتخاب کنید.</div> :
        <RequestState loading={loading} error={error} onRetry={() => load()} />}
      {schoolId && !loading && !error && <div className="mt-4">
        <Label className="fw-bold">ترتیب مسیریابی</Label><p className="text-muted small">هر مقصد را بکشید و در جای دلخواه رها کنید.</p>
        <div className="d-grid gap-2" style={{ maxWidth: 520 }}>{form.priorities.map((item, index) =>
          <div key={item} draggable onDragStart={() => setDragged(item)} onDragOver={(e) => e.preventDefault()} onDrop={() => drop(item)} className="border rounded p-3 bg-light d-flex align-items-center gap-3" style={{ cursor: "grab" }}>
            <i className="bx bx-grid-vertical fs-5" /><span className="badge bg-primary">{index + 1}</span><span>{labels[item]}</span>
          </div>)}</div>
        <div className="mt-4" style={{ maxWidth: 520 }}><Label>مقصد پیام صوتی (اختیاری)</Label><Input value={form.voiceDestination || ""} onChange={(e) => setForm((old) => ({ ...old, voiceDestination: e.target.value }))} placeholder="داخلی یا مقصد پیام صوتی" /></div>
        {hasPermission("incoming-calls.settings.update") && <Button color="primary" className="mt-4" disabled={saving} onClick={submit}>{saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}</Button>}
      </div>}
    </CardBody></Card>
  </div></div>;
};
export default IncomingCallSettings;
