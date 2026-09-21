import React from "react"
import { Button } from "reactstrap"

const OutboundExportActions = ({ hasPermission, csvBusy, excelLoading, tableLoading, onCsv, onExcel, onCancelCsv }) => <div className="d-flex gap-2 w-100 justify-content-end flex-wrap">
  {hasPermission("voip.outbound.index.export") && <Button color="success" size="sm" type="button" onClick={onCsv}
    disabled={csvBusy || tableLoading} className="d-flex align-items-center gap-1 px-3" style={{ whiteSpace: "nowrap" }}>
    <i className={`mdi ${csvBusy ? "mdi-loading mdi-spin" : "mdi-file-download-outline"}`} />
    {csvBusy ? "در حال دریافت..." : "خروجی مدت مکالمه واقعی"}
  </Button>}
  {hasPermission("voip.outbound.index.export-excel") && <Button color="primary" size="sm" type="button" onClick={onExcel}
    disabled={excelLoading} className="d-flex align-items-center gap-1 px-3" style={{ whiteSpace: "nowrap" }} data-testid="excel-export-button">
    <i className={`mdi ${excelLoading ? "mdi-loading mdi-spin" : "mdi-file-excel-outline"}`} />
    {excelLoading ? "در حال دریافت Excel..." : "خروجی Excel"}
  </Button>}
  {csvBusy && <Button color="danger" size="sm" outline type="button" onClick={onCancelCsv}
    className="d-flex align-items-center gap-1" style={{ whiteSpace: "nowrap" }}>
    <i className="mdi mdi-close" />لغو
  </Button>}
</div>

export default OutboundExportActions
