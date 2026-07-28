import React from "react";
import { Alert, Input, Spinner, Table } from "reactstrap";
import DynamicReportPagination from "./DynamicReportPagination.jsx";
import {
  formatBackendDisplayValue,
  formatValue,
  getTableRows,
  hasDisplayRows,
  getExecutionMeta,
} from "./utils.js";

const GenericResultTable = ({ result, loading, error, search, onSearch, onPage, onLimit, onSort }) => {
  const schema = result?.schema || [];
  const rows = getTableRows(result);
  const meta = getExecutionMeta(result);
  const usesBackendDisplayRows = hasDisplayRows(result);
  if (error) return <Alert color="danger">{error}</Alert>;
  return <>
    <div className="position-relative">
      <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="جست‌وجو در همه نتایج گزارش" aria-label="جست‌وجو در جدول نتیجه" className="mb-3" />
      {loading && <div className="text-primary small mb-2" aria-live="polite"><Spinner size="sm" className="ms-2" />در حال دریافت نتیجه…</div>}
    </div>
    <div className="table-responsive">
      <Table bordered hover className="align-middle">
        <thead><tr>{schema.map((column) => <th key={column.id} scope="col">{onSort ? <button type="button" className="btn btn-link p-0 text-body fw-bold" onClick={() => onSort(column.id)}>{column.label}</button> : column.label}</th>)}</tr></thead>
        <tbody>{rows.length ? rows.map((row, index) => <tr key={row.id ?? index}>{schema.map((column) => <td key={column.id}>{usesBackendDisplayRows ? formatBackendDisplayValue(row[column.id]) : formatValue(row[column.id], column.type)}</td>)}</tr>) : <tr><td colSpan={Math.max(1, schema.length)} className="text-center py-4 text-muted">داده‌ای برای نمایش وجود ندارد.</td></tr>}</tbody>
      </Table>
    </div>
    <DynamicReportPagination meta={meta} loading={loading} onPage={onPage} onLimit={onLimit} />
  </>;
};
export default GenericResultTable;
