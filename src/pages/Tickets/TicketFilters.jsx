import React from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import gregorianEn from "react-date-object/locales/gregorian_en";
import persianFa from "react-date-object/locales/persian_fa";
import { Button, Col, Input, Label, Row } from "reactstrap";
import { useAuth } from "../../context/AuthContext.jsx";
import { TICKET_STATUS_LABELS } from "./ticketUtils.js";

const pickerValue = (value) => value
  ? new DateObject({ date: value, format: "YYYY-MM-DD", calendar: gregorian, locale: gregorianEn }).convert(persian, persianFa)
  : null;
const apiDate = (value) => value
  ? new DateObject(value).convert(gregorian, gregorianEn).format("YYYY-MM-DD")
  : "";

export default function TicketFilters({ filters, onChange, onReset, schools, categories = [], results = [], showTaxonomy = true, allowAllSchools = false }) {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("tickets.manage");
  const canReadCategories = canManage || hasPermission("tickets.create") || hasPermission("tickets.index");
  return <Row className="g-3 align-items-end">
    <Col xl="3" md="6"><Label htmlFor="ticket-search">جستجو</Label><Input id="ticket-search" value={filters.search || ""} placeholder="شماره یا عنوان تیکت..." onChange={(event) => onChange("search", event.target.value)} /></Col>
    <Col xl="2" md="6"><Label htmlFor="ticket-school">مجموعه</Label><Input id="ticket-school" type="select" value={filters.schoolId || ""} onChange={(event) => onChange("schoolId", event.target.value)}><option value="">{allowAllSchools ? "همه مجموعه‌ها" : "انتخاب کنید"}</option>{schools.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Input></Col>
    <Col xl="2" md="6"><Label htmlFor="ticket-status">وضعیت</Label><Input id="ticket-status" type="select" value={filters.status || ""} onChange={(event) => onChange("status", event.target.value)}><option value="">همه وضعیت‌ها</option>{Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Input></Col>
    {showTaxonomy && canReadCategories && <Col xl="2" md="6"><Label htmlFor="ticket-category">دسته</Label><Input id="ticket-category" type="select" value={filters.categoryId || ""} onChange={(event) => onChange("categoryId", event.target.value)}><option value="">همه دسته‌ها</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Input></Col>}
    {showTaxonomy && canManage && <Col xl="2" md="6"><Label htmlFor="ticket-result">نتیجه</Label><Input id="ticket-result" type="select" value={filters.resultId || ""} onChange={(event) => onChange("resultId", event.target.value)}><option value="">همه نتایج</option>{results.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Input></Col>}
    <Col xl="1" md="6"><Button color="light" className="w-100" onClick={onReset}>پاک کردن</Button></Col>
    <Col md="3"><Label htmlFor="ticket-from">از تاریخ</Label><DatePicker id="ticket-from" calendar={persian} locale={persianFa} value={pickerValue(filters.from)} onChange={(value) => onChange("from", apiDate(value))} format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right" placeholder="انتخاب تاریخ" /></Col>
    <Col md="3"><Label htmlFor="ticket-to">تا تاریخ</Label><DatePicker id="ticket-to" calendar={persian} locale={persianFa} value={pickerValue(filters.to)} onChange={(value) => onChange("to", apiDate(value))} format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right" placeholder="انتخاب تاریخ" /></Col>
  </Row>;
}
