import React from "react"
import { Button } from "reactstrap"

const OutboundExportActions = ({ hasPermission, excelBusy, onExport, onCancel }) => {
  const canCsv = hasPermission("voip.outbound.index.export")
  const canExcel = hasPermission("voip.outbound.index.export-excel")
  if (!canCsv && !canExcel) return null

  return <div className="d-flex gap-2 w-100 justify-content-end flex-wrap">
    {canCsv && <Button color="secondary" size="sm" type="button" onClick={() => onExport("csv")}
      className="d-flex align-items-center gap-1 px-3" style={{ whiteSpace: "nowrap" }}>
      <i className="mdi mdi-file-delimited-outline" />خروجی CSV
    </Button>}
    {canExcel && <Button color="primary" size="sm" type="button" onClick={() => onExport("xlsx")}
      disabled={excelBusy} className="d-flex align-items-center gap-1 px-3" style={{ whiteSpace: "nowrap" }} data-testid="excel-export-button">
      <i className={`mdi ${excelBusy ? "mdi-loading mdi-spin" : "mdi-file-excel-outline"}`} />
      {excelBusy ? "در حال آماده‌سازی و دانلود فایل…" : "خروجی Excel"}
    </Button>}
    {excelBusy && <Button color="danger" size="sm" outline type="button" onClick={onCancel}
      className="d-flex align-items-center gap-1" style={{ whiteSpace: "nowrap" }}>
      <i className="mdi mdi-close" />لغو
    </Button>}
  </div>
}

export default OutboundExportActions
