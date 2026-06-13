// src/pages/Reports/components/FormsStatusChart.jsx
import React from "react"
import { Card, CardBody, CardHeader, Col, Row, Spinner } from "reactstrap"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import moment from "moment-jalaali"

const COLORS = ["#34c38f", "#556ee6", "#f1b44c", "#f46a6a", "#50a5f1", "#74788d"]
const faNum = (v) => (v == null ? "" : Number(v).toLocaleString("fa-IR"))
const toJalali = (d) => {
  try {
    return moment(d).format("jMM/jDD")
  } catch {
    return d
  }
}

const FormsStatusChart = ({ data, loading, error }) => {
  const distribution = data?.distribution || []
  const dailyTrend = data?.dailyTrend || []

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="bg-white border-bottom d-flex align-items-center gap-2">
        <div
          className="rounded-2 d-flex align-items-center justify-content-center text-white"
          style={{ width: 32, height: 32, backgroundColor: "#34c38f", flexShrink: 0 }}
        >
          <i className="mdi mdi-file-chart-outline fs-6" />
        </div>
        <h6 className="mb-0 fw-semibold">وضعیت فرم‌ها</h6>
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
        {!loading && !error && (
          <Row className="g-3">
            <Col md="5">
              <p className="text-muted mb-2" style={{ fontSize: "0.82rem" }}>
                توزیع وضعیت‌ها
              </p>
              {distribution.length === 0 ? (
                <div className="text-center py-4 text-muted" style={{ fontSize: "0.85rem" }}>
                  داده‌ای موجود نیست
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {distribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, name) => [faNum(v), name]}
                    />
                    <Legend
                      formatter={(value, entry) =>
                        `${value} (${entry?.payload?.percent != null ? Number(entry.payload.percent).toFixed(1) : ""}٪)`
                      }
                      iconSize={10}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Col>
            <Col md="7">
              <p className="text-muted mb-2" style={{ fontSize: "0.82rem" }}>
                روند روزانه تکمیل فرم‌ها
              </p>
              {dailyTrend.length === 0 ? (
                <div className="text-center py-4 text-muted" style={{ fontSize: "0.85rem" }}>
                  داده‌ای موجود نیست
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart
                    data={dailyTrend}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={toJalali}
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
                    <Tooltip
                      formatter={(v, name) => [faNum(v), name]}
                      labelFormatter={toJalali}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completedCount"
                      name="تکمیل‌شده"
                      stroke="#34c38f"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalCount"
                      name="کل"
                      stroke="#556ee6"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="4 4"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Col>
          </Row>
        )}
      </CardBody>
    </Card>
  )
}

export default FormsStatusChart
