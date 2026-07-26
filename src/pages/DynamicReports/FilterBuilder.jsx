import React, { useEffect, useState } from "react";
import { Button, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { Calendar } from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import { makeCondition, makeGroup, removeFilterNode, updateFilterNode } from "./utils.js";
import {
  createPersianPickerDate,
  displayPersianFilterDate,
  serializePersianFilterDate,
} from "./dateFilterUtils.js";
import { normalizeCatalogList, normalizeIdList } from "./catalogUtils.js";
import { getFieldOptions } from "../../services/dynamicReportService.jsx";
import "./dynamic-reports.scss";

const operatorLabels = {
  eq: "=  برابر با",
  neq: "≠  نابرابر با",
  gt: ">  بزرگ‌تر از",
  gte: "≥  بزرگ‌تر یا مساوی",
  lt: "<  کوچک‌تر از",
  lte: "≤  کوچک‌تر یا مساوی",
  between: "↔  بین دو مقدار",
  in: "∈  یکی از مقادیر",
  not_in: "∉  هیچ‌کدام از مقادیر",
  contains: "⊃  شامل عبارت",
  not_contains: "⊅  شامل عبارت نباشد",
  starts_with: "شروع شود با",
  ends_with: "پایان یابد با",
  is_null: "∅  بدون مقدار (خالی)",
  is_not_null: "≠ ∅  دارای مقدار (غیرخالی)",
  is_true: "✓  درست",
  is_false: "✕  نادرست",
};
const operatorId = (item) => String(item?.id ?? item?.value ?? "");
const operatorLabel = (item) => operatorLabels[operatorId(item)] || item?.label || item?.name || operatorId(item);
const typedValue = (raw, field) => {
  if (["integer", "decimal", "duration"].includes(field?.type)) return raw === "" ? "" : Number(raw);
  return raw;
};

const JalaliDateInput = ({ value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const displayValue = displayPersianFilterDate(value);
  const openPicker = () => {
    setDraft(createPersianPickerDate(value));
    setOpen(true);
  };
  return <>
    <Button type="button" color="light" outline className="w-100 dynamic-report-date-trigger" onClick={openPicker}>
      <i className="bx bx-calendar ms-2" aria-hidden="true" />
      {displayValue || placeholder}
    </Button>
    <Modal isOpen={open} toggle={() => setOpen(false)} centered className="dynamic-report-date-modal">
      <ModalHeader toggle={() => setOpen(false)}>انتخاب تاریخ شمسی</ModalHeader>
      <ModalBody className="d-flex justify-content-center">
        <Calendar
          calendar={persian}
          locale={persianFa}
          value={draft}
          onChange={(selected) => setDraft(selected ? new DateObject(selected) : null)}
          onMonthChange={(visibleDate) => setDraft((current) => {
            const next = new DateObject(visibleDate);
            if (current) next.set({ day: Math.min(current.day, next.month.length), hour: current.hour, minute: current.minute });
            return next;
          })}
          format="YYYY/MM/DD"
        />
      </ModalBody>
      <ModalFooter>
        <Button color="primary" disabled={!draft} onClick={() => { onChange(serializePersianFilterDate(draft)); setOpen(false); }}>تأیید تاریخ</Button>
        <Button color="light" onClick={() => { onChange(""); setOpen(false); }}>پاک کردن</Button>
        <Button color="secondary" outline onClick={() => setOpen(false)}>انصراف</Button>
      </ModalFooter>
    </Modal>
  </>;
};

const FilterValueControl = ({ sourceId, field, condition, onValue }) => {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    if (!sourceId || !field?.id || field.type !== "enum") { setOptions([]); return; }
    const controller = new AbortController();
    getFieldOptions({ sourceId, fieldId: field.id }, controller.signal).then((items) => setOptions(normalizeCatalogList(items))).catch(() => setOptions([]));
    return () => controller.abort();
  }, [sourceId, field?.id, field?.type]);
  if (condition.operator === "between") {
    const values = Array.isArray(condition.value) ? condition.value : ["", ""];
    if (field?.type === "datetime") return <div className="d-flex gap-2"><JalaliDateInput value={values[0]} onChange={(value) => onValue([value, values[1] ?? ""])} placeholder="ابتدای بازه شمسی" /><JalaliDateInput value={values[1]} onChange={(value) => onValue([values[0] ?? "", value])} placeholder="انتهای بازه شمسی" /></div>;
    return <div className="d-flex gap-2"><Input type="number" value={values[0] ?? ""} onChange={(e) => onValue([typedValue(e.target.value, field), values[1] ?? ""])} aria-label="ابتدای بازه" /><Input type="number" value={values[1] ?? ""} onChange={(e) => onValue([values[0] ?? "", typedValue(e.target.value, field)])} aria-label="انتهای بازه" /></div>;
  }
  if (options.length) return <Input type="select" value={condition.value ?? ""} onChange={(e) => onValue(typedValue(e.target.value, field))}><option value="">انتخاب کنید</option>{options.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</Input>;
  if (["in", "not_in"].includes(condition.operator)) return <Input value={Array.isArray(condition.value) ? condition.value.join(", ") : ""} onChange={(e) => onValue(e.target.value.split(",").map((item) => typedValue(item.trim(), field)).filter((item) => item !== ""))} placeholder="مقادیر را با ویرگول جدا کنید" />;
  if (field?.type === "datetime") return <JalaliDateInput value={condition.value} onChange={onValue} placeholder="تاریخ شمسی" />;
  return <Input type={["integer", "decimal", "duration"].includes(field?.type) ? "number" : "text"} value={condition.value ?? ""} onChange={(e) => onValue(typedValue(e.target.value, field))} />;
};

const FilterBuilder = ({ node, path = [], fields, operators, sourceId, requiredDateFieldId, errors = {}, onChange }) => {
  const setNode = (updater) => onChange(updateFilterNode(node.root || node, path, updater));
  const root = node.root || node;
  const current = path.reduce((value, index) => value?.children?.[index], root) || root;
  if (!current.combinator) {
    const safeFields = normalizeCatalogList(fields);
    const safeOperators = normalizeCatalogList(operators);
    const field = safeFields.find((item) => item.id === current.fieldId);
    const fieldOperatorIds = normalizeIdList(field?.operators || field?.allowedOperators);
    const allowed = safeOperators
      .filter((item) => !fieldOperatorIds.length || fieldOperatorIds.includes(operatorId(item)))
      .filter((item, index, all) => operatorId(item) && all.findIndex((candidate) => operatorId(candidate) === operatorId(item)) === index);
    const operator = allowed.find((item) => operatorId(item) === current.operator);
    const noValue = operator?.requiresValue === false || ["is_null", "is_not_null", "is_true", "is_false"].includes(current.operator);
    const serverPath = `filters${path.map((index) => `.children[${index}]`).join("")}`;
    const nodeError = Object.entries(errors).find(([key]) => key === serverPath || key.startsWith(`${serverPath}.`))?.[1];
    return <div className="border rounded p-2 mb-2">
      <Row className="g-2 align-items-end"><Col md={4}><Label>فیلد</Label><Input type="select" value={current.fieldId} onChange={(e) => setNode((n) => ({ ...n, fieldId: e.target.value, operator: "", value: "" }))}><option value="">انتخاب کنید</option>{safeFields.map((item) => <option key={item.id} value={item.id}>{item.label}{item.type === "datetime" ? item.id === requiredDateFieldId ? " — فیلد زمانی الزامی" : " — فیلد زمانی" : ""}</option>)}</Input></Col>
      <Col md={3}><Label>عملگر</Label><Input type="select" value={current.operator} onChange={(e) => setNode((n) => ({ ...n, operator: e.target.value, value: "" }))}><option value="">انتخاب کنید</option>{allowed.map((item) => <option key={operatorId(item)} value={operatorId(item)}>{operatorLabel(item)}</option>)}</Input></Col>
      {!noValue && <Col md={4}><Label>مقدار</Label><FilterValueControl sourceId={sourceId} field={field} condition={current} onValue={(value) => setNode((n) => ({ ...n, value }))} /></Col>}
      <Col md={1}><Button color="danger" outline onClick={() => onChange(removeFilterNode(root, path))} aria-label="حذف شرط"><i className="bx bx-trash" /></Button></Col></Row>
      {nodeError && <div id={`filter-${path.join("-")}`} className="text-danger small mt-1">{nodeError}</div>}
    </div>;
  }
  return <fieldset className="border rounded p-3 mb-3"><legend className="float-none w-auto fs-6 px-2">گروه <Input type="select" className="d-inline-block w-auto ms-2" value={current.combinator} onChange={(e) => setNode((n) => ({ ...n, combinator: e.target.value }))}><option value="and">و (AND)</option><option value="or">یا (OR)</option></Input></legend>
    {(Array.isArray(current.children) ? current.children : []).map((_, index) => <FilterBuilder key={index} node={{ root }} path={[...path, index]} fields={fields} operators={operators} sourceId={sourceId} requiredDateFieldId={requiredDateFieldId} errors={errors} onChange={onChange} />)}
    <Button size="sm" color="primary" outline className="ms-2" onClick={() => setNode((n) => ({ ...n, children: [...n.children, makeCondition()] }))}>افزودن شرط</Button>
    <Button size="sm" color="secondary" outline onClick={() => setNode((n) => ({ ...n, children: [...n.children, makeGroup()] }))}>افزودن گروه</Button>
    {path.length > 0 && <Button size="sm" color="danger" outline className="me-2" onClick={() => onChange(removeFilterNode(root, path))}>حذف گروه</Button>}
  </fieldset>;
};
export default FilterBuilder;
