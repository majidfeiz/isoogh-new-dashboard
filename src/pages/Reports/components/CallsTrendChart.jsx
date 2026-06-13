// src/pages/Reports/components/CallsTrendChart.jsx
import React from "react"
import { Card, CardBody, CardHeader, Spinner } from "reactstrap"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import moment from "moment-jalaali"

const toJalali = (d) => {
  try {
    return moment(d).format("jMM/jDD")
  } catch {
    return d
  }
}

const faNum = (v) => (v == null ? "" : Number(v).toLocaleString("fa-IR"))

const CallsTrendChart = ({ data, loading, error }) => {
  const items = data?.items || []

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="bg-white border-bottom d-flex align-items-center gap-2">
        <div
          className="rounded-2 d-flex align-items-center justify-content-center text-white"
          style={{ width: 32, height: 32, backgroundColor: "#556ee6", flexShrink: 0 }}
        >
          <i className="mdi mdi-chart-line fs-6" />
        </div>
        <h6 className="mb-0 fw-semibold">روند تماس‌ها</h6>
      </CardHeader>
      <CardBody>
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
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-5 text-muted">
            <i className="mdi mdi-chart-line fs-1 d-block mb-2 opacity-25" />
            داده‌ای برای نمایش وجود ندارد
          </div>
        )}
        {!loading && !error && items.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={items} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={toJalali}
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={faNum}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                orientation="right"
              />
              <YAxis
                yAxisId="right"
                tickFormatter={faNum}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                orientation="left"
              />
              <Tooltip
                formatter={(value, name) => [faNum(value), name]}
                labelFormatter={toJalali}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalCalls"
                name="کل تماس‌ها"
                stroke="#556ee6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="answeredCalls"
                name="تماس‌های پاسخ‌داده"
                stroke="#34c38f"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="uniqueStudents"
                name="دانش‌آموزان یکتا"
                stroke="#f1b44c"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  )
}

export default CallsTrendChart
