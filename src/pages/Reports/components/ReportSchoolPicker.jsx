import React, { useEffect, useRef, useState } from "react"
import { Button, Input, Label, Spinner } from "reactstrap"
import { getSchools } from "../../../services/schoolService.jsx"

export default function ReportSchoolPicker({ value, onChange, allowAll = false, scopedSchools = null }) {
  const [search, setSearch] = useState("")
  const [items, setItems] = useState(scopedSchools || [])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const requestRef = useRef(0)
  useEffect(() => {
    if (scopedSchools) { setItems(scopedSchools); setPage(1); setLastPage(1); return undefined }
    const id = requestRef.current + 1; requestRef.current = id
    const timer = setTimeout(() => { setLoading(true); setError(""); getSchools({ page: 1, limit: 20, search: search.trim() }).then((result) => { if (id === requestRef.current) { setItems(result.items); setPage(1); setLastPage(result.pagination.lastPage) } }).catch(() => { if (id === requestRef.current) { setItems([]); setError("دریافت فهرست مجموعه‌ها با خطا مواجه شد") } }).finally(() => { if (id === requestRef.current) setLoading(false) }) }, 300)
    return () => clearTimeout(timer)
  }, [search, scopedSchools])
  const more = async () => { if (loading || page >= lastPage || scopedSchools) return; const id = requestRef.current; setLoading(true); setError(""); const next = page + 1; try { const result = await getSchools({ page: next, limit: 20, search: search.trim() }); if (id !== requestRef.current) return; setItems((current) => [...current, ...result.items.filter((item) => !current.some((old) => String(old.id) === String(item.id)))]); setPage(next); setLastPage(result.pagination.lastPage) } catch { if (id === requestRef.current) setError("دریافت فهرست مجموعه‌ها با خطا مواجه شد") } finally { if (id === requestRef.current) setLoading(false) } }
  return <div><Label>مجموعه</Label>{!scopedSchools && <Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجوی مجموعه…" className="mb-2" />}<Input type="select" value={value} onChange={(event) => onChange(event.target.value)}><option value="">{allowAll ? "همه مجموعه‌های مجاز من" : "انتخاب مجموعه"}</option>{items.map((school) => { const id = school.id ?? school.schoolId ?? school.school_id; return <option key={id} value={id}>{school.name || school.schoolName || school.school_name || school.title || `مجموعه ${id}`}</option> })}</Input>{error && <div className="small text-danger mt-1" role="alert">{error}</div>}{!scopedSchools && page < lastPage && <Button type="button" size="sm" color="link" onClick={more} disabled={loading}>{loading ? <Spinner size="sm" /> : "نمایش مجموعه‌های بیشتر"}</Button>}</div>
}
