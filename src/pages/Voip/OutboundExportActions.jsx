import React from "react"
import { Button, Input } from "reactstrap"

const OutboundExportActions = ({ hasPermission, exportBusy, tableLoading, onExport, onCancel }) => {
  const formats = [
    hasPermission("voip.outbound.index.export") && { value: "csv", label: "CSV" },
    hasPermission("voip.outbound.index.export-excel") && { value: "xlsx", label: "Excel (XLSX)" },
  ].filter(Boolean)
  const [format, setFormat] = React.useState(formats[0]?.value || "xlsx")

  if (!formats.length) return null

  return <div className="d-flex gap-2 w-100 justify-content-end flex-wrap">
    <Input type="select" bsSize="sm" value={format} onChange={(event) => setFormat(event.target.value)}
      disabled={exportBusy || tableLoading} aria-label="فرمت خروجی" style={{ width: 130 }}>
      {formats.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
    </Input>
    <Button color="primary" size="sm" type="button" onClick={() => onExport(format)}
      disabled={exportBusy || tableLoading} className="d-flex align-items-center gap-1 px-3" style={{ whiteSpace: "nowrap" }} data-testid="export-button">
      <i className={`mdi ${exportBusy ? "mdi-loading mdi-spin" : "mdi-file-download-outline"}`} />
      {exportBusy ? "در حال دریافت..." : "خروجی"}
    </Button>
    {exportBusy && <Button color="danger" size="sm" outline type="button" onClick={onCancel}
      className="d-flex align-items-center gap-1" style={{ whiteSpace: "nowrap" }}>
      <i className="mdi mdi-close" />لغو
    </Button>}
  </div>
}

export default OutboundExportActions
