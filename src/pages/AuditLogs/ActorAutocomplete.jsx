import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Spinner } from "reactstrap";
import { getAuditActors } from "../../services/auditLogService.jsx";

const ActorAutocomplete = ({ value, initialText = "", onChange }) => {
  const [text, setText] = useState(initialText);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const requestId = useRef(0);

  useEffect(() => setText(initialText), [initialText]);

  useEffect(() => {
    if (value || !open) return undefined;
    const current = ++requestId.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await getAuditActors({ search: text.trim(), limit: 20 });
        if (current === requestId.current) setItems(result);
      } catch {
        if (current === requestId.current) setItems([]);
      } finally {
        if (current === requestId.current) setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [text, value, open]);

  const clear = () => {
    requestId.current += 1;
    setText("");
    setItems([]);
    onChange({ actorUserId: undefined, actorSearch: undefined, label: "" });
  };

  return (
    <div className="position-relative">
      <div className="input-group input-group-sm">
        <Input
          aria-label="جست‌وجوی کاربر"
          value={text}
          placeholder="نام یا شناسه کاربر"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            const next = event.target.value;
            setText(next);
            setOpen(true);
            onChange({ actorUserId: undefined, actorSearch: next || undefined, label: next });
          }}
        />
        {(value || text) && <Button color="light" aria-label="پاک کردن کاربر" onClick={clear}>×</Button>}
      </div>
      {open && !value && (
        <div className="position-absolute bg-white border rounded shadow-sm w-100 mt-1 overflow-auto" style={{ zIndex: 20, maxHeight: 240 }}>
          {loading && <div className="p-3 text-center"><Spinner size="sm" /></div>}
          {!loading && items.map((item) => (
            <button
              type="button"
              className="btn btn-link text-start text-decoration-none text-dark w-100 border-bottom rounded-0 px-3 py-2"
              key={item.id}
              onClick={() => {
                const label = item.name || `کاربر ${item.id}`;
                setText(label);
                setOpen(false);
                onChange({ actorUserId: item.id, actorSearch: undefined, label });
              }}
            >
              <span className="d-block">{item.name || "بدون نام"} <small className="text-muted">#{item.id}</small></span>
              <small className="text-muted">{item.activityCount.toLocaleString("fa-IR")} فعالیت</small>
            </button>
          ))}
          {!loading && !items.length && <div className="p-3 text-muted small">کاربری یافت نشد</div>}
        </div>
      )}
    </div>
  );
};

export default ActorAutocomplete;
