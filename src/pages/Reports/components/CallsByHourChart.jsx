// src/pages/Reports/components/CallsByHourChart.jsx
import React from "react"
import { Card, CardBody, CardHeader, Col, Row, Spinner } from "reactstrap"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const faNum = (v) => (v == null ? "" : Number(v).toLocaleString("fa-IR"))

const WEEKDAY_ORDER = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"]

const CallsByHourChart = ({ data, loading, error }) => {
  const byHour = data?.byHour || []
  const byWeekdayRaw = data?.byWeekday || []

  const byWeekday = [...byWeekdayRaw].sort(
    (a, b) => WEEKDAY_ORDER.indexOf(a.label) - WEEKDAY_ORDER.indexOf(b.label)
  )

  const body = (
    <>
      {loading && (
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      )}
      {error && !loading && (
        <div className="text-center py-4 text-danger">
          <i className="mdi mdi-alert-circle-outline fs-3 d-block mb-2" />
          <small>{error}</small>
        </div>
      )}
      {!loading && !error && (
        <Row className="g-3">
          <Col md="7">
            <p className="text-muted mb-2" style={{ fontSize: "0.82rem" }}>
              توزیع ساعتی (۰–۲۳)
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={byHour}
                margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                barSize={10}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={faNum}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={faNum}
                  orientation="right"
                />
                <Tooltip formatter={(v) => [faNum(v), "تماس"]} labelFormatter={(h) => `ساعت ${faNum(h)}`} />
                <Bar dataKey="count" name="تماس" fill="#556ee6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Col>
          <Col md="5">
            <p className="text-muted mb-2" style={{ fontSize: "0.82rem" }}>
              توزیع روزهای هفته
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={byWeekday}
                margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={faNum}
                  orientation="right"
                />
                <Tooltip formatter={(v) => [faNum(v), "تماس"]} />
                <Bar dataKey="count" name="تماس" fill="#34c38f" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Col>
        </Row>
      )}
    </>
  )

  return (
    <Card className="shadow-sm h-100">
      <CardHeader className="bg-white border-bottom d-flex align-items-center gap-2">
        <div
          className="rounded-2 d-flex align-items-center justify-content-center text-white"
          style={{ width: 32, height: 32, backgroundColor: "#f1b44c", flexShrink: 0 }}
        >
          <i className="mdi mdi-clock-outline fs-6" />
        </div>
        <h6 className="mb-0 fw-semibold">توزیع زمانی تماس‌ها</h6>
      </CardHeader>
      <CardBody>{body}</CardBody>
    </Card>
  )
}

export default CallsByHourChart
