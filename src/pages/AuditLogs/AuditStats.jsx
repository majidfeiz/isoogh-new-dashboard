import React from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { statsChartData } from "./auditLogUtils.js";

const baseOptions = { chart: { toolbar: { show: false } }, dataLabels: { enabled: false }, noData: { text: "داده‌ای وجود ندارد" } };

const AuditStats = ({ data, loading, error, onRetry }) => {
  if (loading) return <div className="text-center py-5"><Spinner /></div>;
  if (error) return <div className="alert alert-danger">خطا در دریافت آمار <button className="btn btn-sm btn-outline-danger ms-2" onClick={onRetry}>تلاش مجدد</button></div>;
  const charts = statsChartData(data);
  return (
    <>
      <Row>
        <Col md="6"><Card><CardBody><div className="text-muted">کل فعالیت‌ها</div><h3>{Number(data?.summary?.total || 0).toLocaleString("fa-IR")}</h3></CardBody></Card></Col>
        <Col md="6"><Card><CardBody><div className="text-muted">خطاها</div><h3 className="text-danger">{Number(data?.summary?.failed || 0).toLocaleString("fa-IR")}</h3></CardBody></Card></Col>
      </Row>
      <Row>
        <Col xl="6"><Card><CardBody><h5>روند فعالیت</h5><ReactApexChart type="line" height={280} options={{ ...baseOptions, xaxis: { categories: charts.timeline.map((x) => x.date) } }} series={[{ name: "فعالیت", data: charts.timeline.map((x) => x.count) }]} /></CardBody></Card></Col>
        <Col xl="6"><Card><CardBody><h5>فعالیت ماژول‌ها</h5><ReactApexChart type="bar" height={280} options={{ ...baseOptions, xaxis: { categories: charts.modules.map((x) => x.key) } }} series={[{ name: "فعالیت", data: charts.modules.map((x) => x.count) }]} /></CardBody></Card></Col>
        <Col xl="5"><Card><CardBody><h5>نوع عملیات</h5><ReactApexChart type="donut" height={300} options={{ ...baseOptions, labels: charts.actions.map((x) => x.label) }} series={charts.actions.map((x) => x.count)} /></CardBody></Card></Col>
        <Col xl="7"><Card><CardBody><h5>کاربران فعال</h5><div className="table-responsive"><table className="table table-sm"><thead><tr><th>کاربر</th><th>شناسه</th><th>فعالیت</th></tr></thead><tbody>{charts.users.map((user) => <tr key={user.userId || "system"}><td>{user.name || "سیستم"}</td><td>{user.userId || "—"}</td><td>{user.count.toLocaleString("fa-IR")}</td></tr>)}</tbody></table></div></CardBody></Card></Col>
      </Row>
    </>
  );
};

export default AuditStats;
