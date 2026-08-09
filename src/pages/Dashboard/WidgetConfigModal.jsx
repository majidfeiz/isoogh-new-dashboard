// src/pages/Dashboard/WidgetConfigModal.jsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  Spinner,
} from "reactstrap";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import { hasDateRangeSchema, toTehranStartOfDay } from "./dashboardDateRange.js";

const WidgetConfigModal = ({ isOpen, onClose, widget, onSave }) => {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [error, setError] = useState("");

  const schema = widget?.widget?.configSchema || [];
  const userConfig = widget?.userConfig || {};
  const supportsDateRange = hasDateRangeSchema(schema);

  const createDateObject = (value, isExclusiveEnd = false) => {
    if (!value) return null;
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (isExclusiveEnd) date.setDate(date.getDate() - 1);
    return new DateObject({ date, calendar: persian, locale: persianFa });
  };

  useEffect(() => {
    if (!isOpen || !schema.length) return;
    const initial = {};
    schema.forEach((field) => {
      if (field.key === "dateRangeFrom" || field.key === "dateRangeTo") return;
      initial[field.key] = userConfig[field.key] ?? field.default;
    });
    setValues(initial);
    setDateFrom(createDateObject(userConfig.dateRangeFrom));
    setDateTo(createDateObject(userConfig.dateRangeTo, true));
    setError("");
  }, [isOpen, widget?.id]);

  const handleChange = (key, value, type) => {
    setValues((prev) => ({
      ...prev,
      [key]: type === "number" ? (value === "" ? "" : Number(value)) : type === "boolean" ? value : value,
    }));
  };

  const handleSave = async () => {
    if (supportsDateRange && Boolean(dateFrom) !== Boolean(dateTo)) {
      setError("برای تعیین بازه، هر دو تاریخ شروع و پایان را انتخاب کنید.");
      return;
    }

    const nextValues = { ...values };
    if (supportsDateRange && dateFrom && dateTo) {
      const from = toTehranStartOfDay(dateFrom);
      const to = toTehranStartOfDay(dateTo, 1);
      const durationDays = (new Date(to).getTime() - new Date(from).getTime()) / 86400000;
      if (durationDays <= 0) {
        setError("تاریخ پایان باید بعد از تاریخ شروع باشد.");
        return;
      }
      if (durationDays > 366) {
        setError("بازه انتخابی نمی‌تواند بیشتر از ۳۶۶ روز باشد.");
        return;
      }
      nextValues.dateRangeFrom = from;
      nextValues.dateRangeTo = to;
    }

    setSaving(true);
    try {
      await onSave(widget.id, nextValues);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!widget) return null;

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered size="sm">
      <ModalHeader toggle={onClose} className="border-bottom-0 pb-0">
        <div className="d-flex align-items-center gap-2">
          <div className="avatar-xs bg-primary-subtle rounded d-flex align-items-center justify-content-center">
            <i className="bx bx-cog text-primary font-size-16" />
          </div>
          <div>
            <h6 className="mb-0">تنظیمات ویجت</h6>
            <p className="text-muted mb-0 font-size-11">{widget.widget?.name}</p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody className="pt-2">
        {schema.length === 0 ? (
          <p className="text-muted text-center py-3 mb-0">این ویجت تنظیمات ندارد.</p>
        ) : (
          <Form>
            {schema.filter((field) => field.key !== "dateRangeFrom" && field.key !== "dateRangeTo").map((field) => (
              <FormGroup key={field.key} className="mb-3">
                <Label className="fw-medium font-size-13">{field.label}</Label>
                {field.type === "boolean" ? (
                  <div className="form-check form-switch">
                    <Input
                      type="checkbox"
                      role="switch"
                      id={`cfg-${field.key}`}
                      checked={!!values[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.checked, "boolean")}
                      className="form-check-input"
                    />
                  </div>
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : "text"}
                    value={values[field.key] ?? ""}
                    min={field.min}
                    max={field.max}
                    onChange={(e) => handleChange(field.key, e.target.value, field.type)}
                    className="form-control"
                    bsSize="sm"
                  />
                )}
                {(field.min !== undefined || field.max !== undefined) && (
                  <FormText color="muted" className="font-size-11">
                    بازه مجاز: {field.min ?? "—"} تا {field.max ?? "—"}
                  </FormText>
                )}
              </FormGroup>
            ))}
            {supportsDateRange && (
              <div className="border-top pt-3 mt-1">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <Label className="fw-medium font-size-13 mb-0">بازه تاریخ</Label>
                  {(dateFrom || dateTo) && (
                    <Button type="button" color="link" size="sm" className="text-danger p-0" onClick={() => { setDateFrom(null); setDateTo(null); setError(""); }}>
                      حذف بازه
                    </Button>
                  )}
                </div>
                <FormGroup className="mb-3">
                  <Label className="font-size-12">از تاریخ</Label>
                  <DatePicker calendar={persian} locale={persianFa} value={dateFrom} onChange={(date) => { setDateFrom(date || null); setError(""); }} format="YYYY/MM/DD" placeholder="تاریخ شروع" inputClass="form-control form-control-sm" calendarPosition="bottom-right" />
                </FormGroup>
                <FormGroup className="mb-2">
                  <Label className="font-size-12">تا پایان تاریخ</Label>
                  <DatePicker calendar={persian} locale={persianFa} value={dateTo} onChange={(date) => { setDateTo(date || null); setError(""); }} format="YYYY/MM/DD" placeholder="تاریخ پایان" inputClass="form-control form-control-sm" calendarPosition="bottom-right" />
                </FormGroup>
                <FormText color="muted" className="font-size-11">روز پایان به‌طور کامل در گزارش محاسبه می‌شود.</FormText>
              </div>
            )}
            {error && <div className="text-danger font-size-12 mt-2">{error}</div>}
          </Form>
        )}
      </ModalBody>
      {schema.length > 0 && (
        <ModalFooter className="border-top-0 pt-0">
          <Button color="light" size="sm" onClick={onClose} disabled={saving}>
            انصراف
          </Button>
          <Button color="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" className="me-1" /> : null}
            ذخیره
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default WidgetConfigModal;
