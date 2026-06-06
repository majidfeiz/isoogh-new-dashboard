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

const WidgetConfigModal = ({ isOpen, onClose, widget, onSave }) => {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  const schema = widget?.widget?.configSchema || [];
  const userConfig = widget?.userConfig || {};

  useEffect(() => {
    if (!isOpen || !schema.length) return;
    const initial = {};
    schema.forEach((field) => {
      initial[field.key] = userConfig[field.key] ?? field.default;
    });
    setValues(initial);
  }, [isOpen, widget?.id]);

  const handleChange = (key, value, type) => {
    setValues((prev) => ({
      ...prev,
      [key]: type === "number" ? (value === "" ? "" : Number(value)) : type === "boolean" ? value : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(widget.id, values);
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
            {schema.map((field) => (
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
