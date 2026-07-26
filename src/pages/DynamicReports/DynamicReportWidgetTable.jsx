import React, { useCallback } from "react";
import { getDynamicReportWidgetData } from "../../services/dynamicReportService.jsx";
import GenericResultTable from "./GenericResultTable.jsx";
import useDynamicReportPagination from "./useDynamicReportPagination.js";

const DynamicReportWidgetTable = ({ reportId, widgetId, definitionHash = "" }) => {
  const request = useCallback((query, signal) => getDynamicReportWidgetData(reportId, widgetId, {
    page: query.page,
    limit: query.limit,
    search: query.search,
  }, signal), [reportId, widgetId]);
  const pagination = useDynamicReportPagination({
    mode: "widget",
    reportId,
    widgetId,
    definitionHash,
    request,
    initialLimit: 20,
  });
  const error = pagination.error
    ? pagination.error?.response?.data?.data?.message || pagination.error?.response?.data?.message || "دریافت اطلاعات جدول widget ناموفق بود."
    : "";

  return (
    <GenericResultTable
      result={pagination.result}
      loading={pagination.loading}
      error={error}
      search={pagination.search}
      onSearch={pagination.setSearch}
      onPage={pagination.setPage}
      onLimit={pagination.setLimit}
    />
  );
};

export default DynamicReportWidgetTable;
