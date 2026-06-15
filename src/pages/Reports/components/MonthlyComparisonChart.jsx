// src/pages/Reports/components/MonthlyComparisonChart.jsx
import React from "react"
import { Card, CardBody, CardHeader, Spinner } from "reactstrap"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const faNum = (v) => (v == null ? "" : Number(v).toLocaleString("fa-IR"))

const MonthlyComparisonChart = ({ data, loading, error }) => {
  const months = data?.months || []

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="bg-white border-bottom d-flex align-items-center gap-2">
        <div
          className="rounded-2 d-flex align-items-center justify-content-center text-white"
          style={{ width: 32, height: 32, backgroundColor: "#f46a6a", flexShrink: 0 }}
        >
          <i className="mdi mdi-chart-bar fs-6" />
        </div>
        <h6 className="mb-0 fw-semibold">مقایسه ماهانه</h6>
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
        {!loading && !error && months.length === 0 && (
          <div className="text-center py-5 text-muted">
            <i className="mdi mdi-chart-bar fs-1 d-block mb-2 opacity-25" />
            داده‌ای برای نمایش وجود ندارد
          </div>
        )}
        {!loading && !error && months.length > 0 && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={months} margin={{ top: 5, right: 30, left: 0, bottom: 5 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis
                yAxisId="left"
                tickFormatter={faNum}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                orientation="right"
              />
              <YAxis
                yAxisId="right"
                tickFormatter={(v) => `${faNum(v)}٪`}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                orientation="left"
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(v, name) =>
                  name === "پوشش (%)" ? [`${faNum(v)}٪`, name] : [faNum(v), name]
                }
              />
              <Legend />
              <Bar yAxisId="left" dataKey="totalCalls" name="تماس‌ها" fill="#556ee6" radius={[3, 3, 0, 0]} />
              <Bar yAxisId="right" dataKey="coveragePercent" name="پوشش (%)" fill="#34c38f" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  )
}

export default MonthlyComparisonChart
