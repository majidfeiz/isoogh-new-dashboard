import React, { useMemo } from "react";
import { Alert, Input, Spinner, Table } from "reactstrap";
import Paginations from "../../components/Common/Paginations.jsx";
import { formatValue } from "./utils.js";

const GenericResultTable = ({ result, loading, error, page, limit, search, onSearch, onPage, onSort }) => {
  const schema = result?.schema || [];
  const rows = result?.rows || [];
  const filtered = useMemo(() => search ? rows.filter((row) => Object.values(row).some((value) => String(value ?? "").toLocaleLowerCase("fa").includes(search.toLocaleLowerCase("fa")))) : rows, [rows, search]);
  if (loading) return <div className="text-center py-5" aria-live="polite"><Spinner /><div className="mt-2">در حال دریافت نتیجه…</div></div>;
  if (error) return <Alert color="danger">{error}</Alert>;
  return <>
    <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="جست‌وجو در نتیجه فعلی" aria-label="جست‌وجو در جدول نتیجه" className="mb-3" />
    <div className="table-responsive">
      <Table bordered hover className="align-middle">
        <thead><tr>{schema.map((column) => <th key={column.id} scope="col">{onSort ? <button type="button" className="btn btn-link p-0 text-body fw-bold" onClick={() => onSort(column.id)}>{column.label}</button> : column.label}</th>)}</tr></thead>
        <tbody>{filtered.length ? filtered.map((row, index) => <tr key={row.id ?? index}>{schema.map((column) => <td key={column.id}>{formatValue(row[column.id], column.type)}</td>)}</tr>) : <tr><td colSpan={Math.max(1, schema.length)} className="text-center py-4 text-muted">داده‌ای برای نمایش وجود ندارد.</td></tr>}</tbody>
      </Table>
    </div>
    <Paginations perPageData={Math.min(100, limit)} data={rows} totalRecords={result?.pagination?.total || 0} currentPage={page} setCurrentPage={onPage} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />
  </>;
};
export default GenericResultTable;
