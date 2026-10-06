import React from "react";
import { Button, Col, Input, Label, Row } from "reactstrap";
import { TICKET_STATUS_LABELS } from "./ticketUtils.js";

export default function TicketFilters({ filters, onChange, onReset, schools, categories = [], results = [], showTaxonomy = true, allowAllSchools = false }) {
  return <Row className="g-3 align-items-end">
    <Col xl="3" md="6"><Label htmlFor="ticket-search">جستجو</Label><Input id="ticket-search" value={filters.search || ""} placeholder="شماره یا عنوان تیکت..." onChange={(e) => onChange("search", e.target.value)} /></Col>
    <Col xl="2" md="6"><Label htmlFor="ticket-school">مجموعه</Label><Input id="ticket-school" type="select" value={filters.schoolId || ""} onChange={(e) => onChange("schoolId", e.target.value)}><option value="">{allowAllSchools ? "همه مجموعه‌ها" : "انتخاب کنید"}</option>{schools.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Input></Col>
    <Col xl="2" md="6"><Label htmlFor="ticket-status">وضعیت</Label><Input id="ticket-status" type="select" value={filters.status || ""} onChange={(e) => onChange("status", e.target.value)}><option value="">همه وضعیت‌ها</option>{Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Input></Col>
    {showTaxonomy && <><Col xl="2" md="6"><Label htmlFor="ticket-category">دسته</Label><Input id="ticket-category" type="select" value={filters.categoryId || ""} onChange={(e) => onChange("categoryId", e.target.value)}><option value="">همه دسته‌ها</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Input></Col><Col xl="2" md="6"><Label htmlFor="ticket-result">نتیجه</Label><Input id="ticket-result" type="select" value={filters.resultId || ""} onChange={(e) => onChange("resultId", e.target.value)}><option value="">همه نتایج</option>{results.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Input></Col></>}
    <Col xl="1" md="6"><Button color="light" className="w-100" onClick={onReset}>پاک کردن</Button></Col>
    <Col md="3"><Label htmlFor="ticket-from">از تاریخ</Label><Input id="ticket-from" type="date" value={filters.from || ""} onChange={(e) => onChange("from", e.target.value)} /></Col>
    <Col md="3"><Label htmlFor="ticket-to">تا تاریخ</Label><Input id="ticket-to" type="date" value={filters.to || ""} onChange={(e) => onChange("to", e.target.value)} /></Col>
  </Row>;
}
