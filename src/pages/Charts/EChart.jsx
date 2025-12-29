import React from "react"
import { Row, Col, Card, CardBody, CardTitle, Container } from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

// Charts
import Gauge from "../AllCharts/echart/gaugechart"
import Line from "../AllCharts/echart/linechart"
import LineBar from "../AllCharts/echart/linebarchart"
import Doughnut from "../AllCharts/echart/doughnutchart"
import Pie from "../AllCharts/echart/piechart"
import Scatter from "../AllCharts/echart/scatterchart"
import Bubble from "../AllCharts/echart/bubblechart"
import Candlestick from "../AllCharts/echart/candlestickchart"

const EChart = () => {
  
  //meta title
  document.title = "E Charts | Skote - قالب مدیریتی و داشبورد react"

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          {/* Render Breadcrumb */}
          <Breadcrumbs title="نمودارها" breadcrumbItem="نمودار E" />
          <Row>
            <Col xl="6">
              <Card>
                <CardBody>
                  <CardTitle>نمودار خطی</CardTitle>
                  <div id="line-chart" className="e-chart">
                    <Line dataColors='["--bs-success"]' />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl="6">
              <Card>
                <CardBody>
                  <CardTitle>خط مخلوط - نوار</CardTitle>
                  <div id="mix-line-bar" className="e-chart">
                    <LineBar dataColors='["--bs-success","--bs-primary", "--bs-danger"]' />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xl="6">
              <Card>
                <CardBody>
                  <CardTitle>نمودار دوناتی</CardTitle>
                  <div id="doughnut-chart" className="e-chart">
                    <Doughnut dataColors='["--bs-primary","--bs-warning", "--bs-danger","--bs-info", "--bs-success"]' />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl="6">
              <Card>
                <CardBody>
                  <CardTitle>نمودار دایره ای</CardTitle>
                  <div id="pie-chart" className="e-chart">
                    <Pie dataColors='["--bs-primary","--bs-warning", "--bs-danger","--bs-info", "--bs-success"]' />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xl="6">
              <Card>
                <CardBody>
                  <CardTitle>نمودار پراکندگی</CardTitle>
                  <div id="scatter-chart" className="e-chart">
                    <Scatter dataColors='["--bs-success"]' />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl="6">
              <Card>
                <CardBody>
                  <CardTitle>نمودار حبابی</CardTitle>
                  <div id="bubble-chart" className="e-chart">
                    <Bubble dataColors='["--bs-primary-rgb", "--bs-success-rgb"]' />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xl="6">
              <Card>
                <CardBody>
                  <CardTitle>نمودار کندل استیک</CardTitle>
                  <div id="candlestick-chart" className="e-chart">
                    <Candlestick dataColors='["--bs-primary","--bs-success"]' />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl="6">
              <Card>
                <CardBody>
                  <CardTitle>نمودار سنج</CardTitle>
                  <div id="gauge-chart" className="e-chart">
                    <Gauge dataColors='["--bs-success","--bs-primary","--bs-danger"]' />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default EChart
