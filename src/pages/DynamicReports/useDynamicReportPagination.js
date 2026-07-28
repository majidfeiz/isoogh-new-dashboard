import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const DYNAMIC_REPORT_PAGE_SIZES = [20, 25, 50, 100];

export const normalizeDynamicReportMeta = (response, fallback = {}) => {
  const source = response?.meta ?? response?.pagination ?? {};
  const limit = Math.min(100, Math.max(1, Number(source.limit ?? fallback.limit ?? 20)));
  const total = Math.max(0, Number(source.total ?? 0));
  return {
    page: Math.max(1, Number(source.page ?? fallback.page ?? 1)),
    limit,
    total,
    lastPage: Math.max(1, Number((source.lastPage ?? Math.ceil(total / limit)) || 1)),
  };
};

const useDynamicReportPagination = ({
  mode,
  reportId,
  widgetId,
  definitionHash = "",
  request,
  enabled = true,
  initialLimit = 20,
}) => {
  const safeInitialLimit = Math.min(100, Math.max(1, Number(initialLimit) || 20));
  const [query, setQuery] = useState({ page: 1, limit: safeInitialLimit, search: "" });
  const [result, setResult] = useState(null);
  const [meta, setMeta] = useState({ page: 1, limit: safeInitialLimit, total: 0, lastPage: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const requestRef = useRef(request);
  const requestSequence = useRef(0);
  const resetKey = JSON.stringify([mode, reportId ?? null, widgetId ?? null, definitionHash]);
  const resetKeyRef = useRef(resetKey);

  requestRef.current = request;

  useEffect(() => {
    if (!enabled) return undefined;
    if (resetKeyRef.current !== resetKey) {
      resetKeyRef.current = resetKey;
      setQuery((current) => ({ ...current, page: 1 }));
      return undefined;
    }

    const controller = new AbortController();
    const sequence = ++requestSequence.current;
    setLoading(true);
    setError(null);

    Promise.resolve(requestRef.current({ ...query }, controller.signal))
      .then((response) => {
        if (controller.signal.aborted || sequence !== requestSequence.current) return;
        const nextMeta = normalizeDynamicReportMeta(response, query);
        setResult(response);
        setMeta(nextMeta);
        setQuery((current) => current.page === nextMeta.page && current.limit === nextMeta.limit
          ? current
          : { ...current, page: nextMeta.page, limit: nextMeta.limit });
      })
      .catch((nextError) => {
        if (controller.signal.aborted || nextError?.code === "ERR_CANCELED" || sequence !== requestSequence.current) return;
        setError(nextError);
      })
      .finally(() => {
        if (!controller.signal.aborted && sequence === requestSequence.current) setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, query, refreshToken, resetKey]);

  const setPage = useCallback((page) => {
    setQuery((current) => ({ ...current, page: Math.max(1, Number(page) || 1) }));
  }, []);
  const setLimit = useCallback((limit) => {
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    setQuery((current) => ({ ...current, page: 1, limit: safeLimit }));
  }, []);
  const setSearch = useCallback((search) => {
    setQuery((current) => ({ ...current, page: 1, search: String(search ?? "") }));
  }, []);
  const refresh = useCallback(() => setRefreshToken((value) => value + 1), []);

  const queryKey = useMemo(() => [
    "dynamic-report-data",
    mode,
    reportId ?? null,
    widgetId ?? null,
    query.page,
    query.limit,
    query.search,
    definitionHash,
  ], [definitionHash, mode, query.limit, query.page, query.search, reportId, widgetId]);

  return {
    result,
    meta,
    loading,
    error,
    page: query.page,
    limit: query.limit,
    search: query.search,
    queryKey,
    setPage,
    setLimit,
    setSearch,
    refresh,
  };
};

export default useDynamicReportPagination;
