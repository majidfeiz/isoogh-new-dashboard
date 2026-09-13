import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import {
  getQuestionHintFormOptions,
  getQuestionHintQuestionOptions,
} from "../../services/supportFormService.jsx";

const QuestionHintSelect = ({ type, schoolId, sourceFormId, excludeId, value, label, disabled, onChange, onError }) => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, lastPage: 1 });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async (page = 1, term = "", append = false) => {
    const requestId = ++requestRef.current;
    if (!schoolId || (type === "question" && !sourceFormId)) {
      setItems([]);
      setMeta({ page: 1, lastPage: 1 });
      return;
    }
    setLoading(true);
    try {
      const result = type === "form"
        ? await getQuestionHintFormOptions({ schoolId, search: term, page, limit: 20 })
        : await getQuestionHintQuestionOptions(sourceFormId, { schoolId, search: term, page, limit: 20 });
      if (requestId !== requestRef.current) return;
      setItems((current) => {
        const map = new Map((append ? current : []).map((item) => [item.id, item]));
        result.items.forEach((item) => map.set(item.id, item));
        return Array.from(map.values());
      });
      setMeta(result.pagination);
    } catch (error) {
      if (requestId !== requestRef.current) return;
      setItems([]);
      const message = error?.response?.data?.message;
      onError?.(Array.isArray(message) ? message.join("، ") : message || "دریافت گزینه‌های راهنمای سؤال انجام نشد.");
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [onError, schoolId, sourceFormId, type]);

  useEffect(() => {
    setItems([]);
    setMeta({ page: 1, lastPage: 1 });
    setSearch("");
    setDebouncedSearch("");
  }, [load]);

  useEffect(() => {
    load(1, debouncedSearch, false);
  }, [debouncedSearch, load]);

  useEffect(() => {
    if (debouncedSearch || loading || !value || items.some((item) => item.id === Number(value)) || meta.page >= meta.lastPage) return;
    load(meta.page + 1, "", true);
  }, [debouncedSearch, items, load, loading, meta, value]);

  const options = useMemo(() => items
    .filter((item) => type !== "form" || Number(item.id) !== Number(excludeId))
    .map((item) => ({ value: item.id, label: item.title })), [excludeId, items, type]);
  const selected = value ? options.find((item) => item.value === Number(value)) || { value: Number(value), label: label || `#${value}` } : null;

  return <Select
    isClearable
    isDisabled={disabled}
    isLoading={loading}
    classNamePrefix="react-select"
    placeholder={type === "form" ? "جستجوی فرم تماس قبلی..." : "جستجوی سؤال..."}
    noOptionsMessage={() => loading ? "در حال دریافت..." : "گزینه‌ای یافت نشد"}
    options={options}
    value={selected}
    inputValue={search}
    onInputChange={(next, action) => { if (action.action === "input-change") setSearch(next); }}
    onChange={(option) => onChange(option ? { id: Number(option.value), title: option.label } : null)}
    onMenuScrollToBottom={() => {
      if (!loading && meta.page < meta.lastPage) load(meta.page + 1, debouncedSearch, true);
    }}
  />;
};

export default QuestionHintSelect;
