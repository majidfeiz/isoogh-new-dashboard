import React from "react";
import { Button, Col, Input, Row } from "reactstrap";

const SortBuilder = ({ fields, value = [], onChange }) => {
  const sortable = fields.filter((field) => field.sortable);
  return <div className="border rounded p-3 mt-3"><div className="d-flex justify-content-between align-items-center mb-2"><h5 className="mb-0">مرتب‌سازی نتیجه</h5><Button size="sm" color="light" disabled={value.length >= 3 || !sortable.length} onClick={() => onChange([...value, { fieldId: "", direction: "asc" }])}>افزودن مرتب‌سازی</Button></div><div className="text-muted small mb-2">ترتیب اولویت از بالا به پایین است و فقط فیلدهای sortable کاتالوگ نمایش داده می‌شوند.</div>{value.map((sort, index) => <Row className="g-2 mb-2" key={`${index}-${sort.fieldId}`}><Col md={6}><Input type="select" value={sort.fieldId} onChange={(e) => { const next = [...value]; next[index] = { ...sort, fieldId: e.target.value }; onChange(next); }}><option value="">انتخاب فیلد</option>{sortable.map((field) => <option key={field.id} value={field.id}>{field.label}</option>)}</Input></Col><Col md={4}><Input type="select" value={sort.direction} onChange={(e) => { const next = [...value]; next[index] = { ...sort, direction: e.target.value }; onChange(next); }}><option value="asc">صعودی</option><option value="desc">نزولی</option></Input></Col><Col md={2}><Button color="danger" outline onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>حذف</Button></Col></Row>)}</div>;
};
export default SortBuilder;
