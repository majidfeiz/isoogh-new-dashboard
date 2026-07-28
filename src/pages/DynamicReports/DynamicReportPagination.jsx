import React from "react";
import { Button, Input } from "reactstrap";
import { DYNAMIC_REPORT_PAGE_SIZES } from "./useDynamicReportPagination.js";

const pageWindow = (page, lastPage) => {
  const values = new Set([1, lastPage]);
  for (let value = page - 2; value <= page + 2; value += 1) {
    if (value >= 1 && value <= lastPage) values.add(value);
  }
  return [...values].sort((a, b) => a - b);
};

const DynamicReportPagination = ({ meta, loading, onPage, onLimit }) => {
  const page = Math.max(1, Number(meta?.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(meta?.limit) || 20));
  const total = Math.max(0, Number(meta?.total) || 0);
  const lastPage = Math.max(1, Number(meta?.lastPage) || 1);
  const pages = pageWindow(page, lastPage);
  const from = total ? (page - 1) * limit + 1 : 0;
  const to = total ? Math.min(total, page * limit) : 0;

  return (
    <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mt-3" aria-busy={loading ? "true" : "false"}>
      <div className="text-muted">
        {total
          ? <>نمایش <strong>{from}</strong> تا <strong>{to}</strong> از <strong>{total}</strong> نتیجه — صفحه <strong>{page}</strong> از <strong>{lastPage}</strong></>
          : "نتیجه‌ای یافت نشد"}
      </div>
      <div className="d-flex align-items-center gap-2">
        <label htmlFor="dynamic-report-page-size" className="text-muted mb-0">تعداد در صفحه</label>
        <Input
          id="dynamic-report-page-size"
          type="select"
          value={limit}
          onChange={(event) => onLimit(Number(event.target.value))}
          style={{ width: 90 }}
          aria-label="تعداد نتایج در صفحه"
        >
          {DYNAMIC_REPORT_PAGE_SIZES.map((value) => <option value={value} key={value}>{value}</option>)}
        </Input>
        <nav aria-label="صفحه‌بندی نتیجه گزارش">
          <div className="btn-group" role="group">
            <Button type="button" color="light" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="صفحه قبلی">
              <i className="mdi mdi-chevron-right" aria-hidden="true" />
            </Button>
            {pages.map((value, index) => (
              <React.Fragment key={value}>
                {index > 0 && value - pages[index - 1] > 1 && <Button type="button" color="light" disabled aria-hidden="true">…</Button>}
                <Button
                  type="button"
                  color={value === page ? "primary" : "light"}
                  aria-current={value === page ? "page" : undefined}
                  onClick={() => onPage(value)}
                >
                  {value}
                </Button>
              </React.Fragment>
            ))}
            <Button type="button" color="light" disabled={page >= lastPage} onClick={() => onPage(page + 1)} aria-label="صفحه بعدی">
              <i className="mdi mdi-chevron-left" aria-hidden="true" />
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default DynamicReportPagination;
