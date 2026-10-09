import React, { useEffect, useState } from "react";
import { Alert, Input, Label } from "reactstrap";
import { getSchools } from "../../services/schoolService.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export const SchoolPicker = ({ value, onChange, disabled = false }) => {
  const { user, hasPermission } = useAuth();
  const [schools, setSchools] = useState([]);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    if (!hasPermission("schools.index")) {
      const ownSchoolId = user?.schoolId ?? user?.school_id;
      const scoped = user?.schools || (user?.school ? [user.school] : ownSchoolId ? [{ id: ownSchoolId, name: user.schoolName || user.school_name || "مجموعه من" }] : []);
      setSchools(scoped);
      if (!value && scoped.length === 1) onChange(String(scoped[0].id));
      return;
    }
    getSchools({ page: 1, limit: 100 }).then((res) => setSchools(res.items || [])).catch(() => setError(true));
  };
  useEffect(load, []);
  return <div>
    <Label>مجموعه</Label>
    <Input type="select" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
      <option value="">انتخاب مجموعه</option>
      {schools.map((school) => <option key={school.id} value={school.id}>{school.name || school.title}</option>)}
    </Input>
    {error && <button type="button" className="btn btn-link btn-sm px-0" onClick={load}>تلاش مجدد دریافت مجموعه‌ها</button>}
  </div>;
};

export const RequestState = ({ loading, error, empty, onRetry, emptyText = "داده‌ای یافت نشد." }) => {
  if (loading) return <div className="text-center py-5"><span className="spinner-border text-primary" aria-label="در حال بارگذاری" /></div>;
  if (error) return <Alert color="danger">{error} <button type="button" className="btn btn-link p-0 ms-2" onClick={onRetry}>تلاش مجدد</button></Alert>;
  if (empty) return <div className="text-center text-muted py-5">{emptyText}</div>;
  return null;
};

export const formatDateTime = (value) => value ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "—";
export const formatDuration = (seconds) => Number.isFinite(Number(seconds)) ? `${Math.floor(Number(seconds) / 60)}:${String(Number(seconds) % 60).padStart(2, "0")}` : "—";
