import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../helpers/apiRoutes.jsx";

let _cache = null;
let _promise = null;

export function useAppVersion() {
  const [data, setData] = useState(_cache);

  useEffect(() => {
    if (_cache) {
      setData(_cache);
      return;
    }
    if (!_promise) {
      _promise = axios
        .get(`${API_BASE_URL}/version`)
        .then((res) => {
          const d = res.data?.data;
          _cache = { version: d?.version ?? null, build: d?.build ?? null };
          return _cache;
        })
        .catch(() => {
          _cache = { version: null, build: null };
          return _cache;
        });
    }
    _promise.then(setData).catch(() => {});
  }, []);

  return {
    version: data?.version ?? null,
    build: data?.build ?? null,
    isLoading: !data,
  };
}
